import os

import requests
from django.shortcuts import get_object_or_404
from dotenv import load_dotenv
from flashquiz_proj.utils.auth_utils import clerk_authenticated
from openai import OpenAI
from rest_framework.response import Response
from rest_framework.status import (HTTP_200_OK, HTTP_201_CREATED,
                                   HTTP_204_NO_CONTENT, HTTP_400_BAD_REQUEST,
                                   HTTP_404_NOT_FOUND,
                                   HTTP_500_INTERNAL_SERVER_ERROR)
from rest_framework.views import APIView

from .models import Deck, Feedback, Flashcard
from .serializers import (DeckSerializer, FeedbackSerializer,
                          FlashcardSerializer)
from .utils.helperfunc import validate_flashcard

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
access_token = os.getenv("WIKIPEDIA_ACCESS_TOKEN")


class GenerateFlashcardsView(APIView):
    # NOTE: We use @clerk_authenticated instead of DRF's permission_classes.
    # Tradeoff: Clerk handles passwords, 2FA, and email verification for us,
    # reducing complexity in our project, but it also ties auth tightly to Clerk
    # (less flexibility than Django’s built-in system).
    @clerk_authenticated
    def post(self, request):
        topic = request.data.get("topic")
        if not topic:
            return Response(
                {"error": "Topic not provided."}, status=HTTP_400_BAD_REQUEST
            )

        # Fetching wikipedia page.  The topic is formatted to be a URL-friendly string, i.e. dwayne johnson -> Dwayne_Johnson
        capitalized_topic = topic.title()
        topic_formatted = capitalized_topic.replace(" ", "_")
        wiki_url = f"https://api.wikimedia.org/core/v1/wikipedia/en/page/{topic_formatted}/description"

        headers = {
            "Authorization": f"Bearer {access_token}",
            "User-Agent": "flashquiz (kewilliamsdev@gmail.com)",
        }

        wiki_response = requests.get(wiki_url, headers=headers)
        if wiki_response.status_code != 200:
            return Response(
                {"error": "Failed to fetch Wikipedia page."},
                status=HTTP_400_BAD_REQUEST,
            )

        wiki_data = wiki_response.json()

        # Check for source
        wiki_summary = wiki_data.get("description")
        if not wiki_summary:
            return Response(
                {"error": "No source content found for this topic."},
                status=HTTP_404_NOT_FOUND,
            )

        ai_prompt = f"""
        You are an educational AI assistant. 

        Given the following article, create **exactly 5 flashcards**.
        Each flashcard must be a JSON object with exactly these fields:
        - "question": the question text.  Questions must not exceed 50 characters
        - "answer": the answer text
        - "hint": a helpful hint for the question

        Article title: {topic}
        Article summary: {wiki_summary}

        Return ONLY valid JSON array of objects. Do NOT include any extra text.
        Example:
        [
          {{"question": "Q1", "answer": "A1", "hint": "Hint1"}},
          ...
        ]
        """

        # This is where the magic happens, the AI generates the flashcards by calling the OpenAI API
        # Afterwards, we validate the response to make sure it's in the correct format
        ai_response = client.responses.create(model="gpt-4o-mini", input=ai_prompt)
        flashcards_data = validate_flashcard(ai_response.output_text)

        # If the AI fails to generate the flashcards, we return an error
        if not flashcards_data:
            return Response(
                {"error": "Failed to generate flashcards."},
                status=HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Now we save this to the user's deck
        deck, created = Deck.objects.get_or_create(
            user_id=request.user_details.id,
            title=topic,
            defaults={"description": wiki_summary},
        )

        # We then loop through the flashcards and save them
        saved_flashcards = []
        for card in flashcards_data:
            fc = Flashcard.objects.create(
                deck=deck,
                question=card.get("question"),
                answer=card.get("answer"),
                hint=card.get("hint"),
            )
            saved_flashcards.append(
                {
                    "id": fc.id,
                    "question": fc.question,
                    "answer": fc.answer,
                    "hint": fc.hint,
                }
            )

        # Once the flashcards are saved, we return the deck and the flashcards which were created
        return Response(
            {
                "deck": {"id": deck.id, "title": deck.title},
                "flashcards": saved_flashcards,
            },
            status=HTTP_201_CREATED,
        )


class DeckListCreateView(APIView):
    @clerk_authenticated
    def get(self, request):
        # NOTE: Unlike Django's built-in auth, we're not using a User ForeignKey or DjangoRestFramework's permission_classes.
        # Clerk attaches `request.user_details` from the Clerk software development kit (SDK), which holds the Clerk user ID (a string, e.g. "user_abc123").
        # Our Deck model stores this Clerk user_id string directly in the DB,
        # so we filter on that field instead of using request.user.decks.all().
        user_id = request.user_details.id
        decks = Deck.objects.filter(user_id=user_id)
        serializer = DeckSerializer(decks, many=True)
        return Response(serializer.data, status=HTTP_200_OK)

    @clerk_authenticated
    def post(self, request):
        serializer = DeckSerializer(data=request.data)
        if serializer.is_valid():
            # Save with user_id field populated
            serializer.save(user_id=request.user_details.id)
            return Response(serializer.data, status=HTTP_201_CREATED)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)


class DeckDetailView(APIView):
    # NOTE: I use @clerk_authenticated only on view methods that map
    # to HTTP endpoints (get/post/delete). Helper methods like get_object()
    # don’t get the full request, so the decorator will throw errors.
    def get_object(self, pk, user_id):
        return get_object_or_404(Deck, pk=pk, user_id=user_id)

    @clerk_authenticated
    def get(self, request, pk):
        deck = self.get_object(pk, request.user_details.id)  # <-- use self.get_object
        serializer = DeckSerializer(deck)
        return Response(serializer.data, status=HTTP_200_OK)

    @clerk_authenticated
    def put(self, request, pk):
        deck = self.get_object(pk, request.user_details.id)
        serializer = DeckSerializer(deck, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=HTTP_200_OK)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

    @clerk_authenticated
    def delete(self, request, pk):
        deck = self.get_object(pk, request.user_details.id)
        deck.delete()
        return Response(status=HTTP_204_NO_CONTENT)


# Flashcard Views
class FlashcardListCreateView(APIView):
    @clerk_authenticated
    def get(self, request):
        deck_id = request.query_params.get("deck_id")
        if not deck_id:
            return Response(
                {"details": "Deck ID not provided."}, status=HTTP_400_BAD_REQUEST
            )

        user_id = request.user_details.id
        flashcards = Flashcard.objects.filter(deck__id=deck_id, deck__user_id=user_id)
        serializer = FlashcardSerializer(flashcards, many=True)
        return Response(serializer.data, status=HTTP_200_OK)


    @clerk_authenticated
    def post(self, request):
        deck_id = request.data.get("deck_id")
        if not deck_id:
            return Response(
                {"error": "Deck ID is required"}, status=HTTP_400_BAD_REQUEST
            )

        user_id = request.user_details.id
        deck = get_object_or_404(Deck, id=deck_id, user_id=user_id)

        # Create a copy of the request data without deck_id since serializer doesn't expect it
        serializer_data = {
            key: value for key, value in request.data.items() if key != "deck_id"
        }

        serializer = FlashcardSerializer(data=serializer_data)
        if serializer.is_valid():
            serializer.save(deck=deck)
            return Response(serializer.data, status=HTTP_201_CREATED)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)


class FlashcardDetailView(APIView):
    def get_object(self, pk, user_id):
        return get_object_or_404(Flashcard, pk=pk, deck__user_id=user_id)

    @clerk_authenticated
    def get(self, request, pk):
        flashcard = self.get_object(pk, request.user_details.id)
        serializer = FlashcardSerializer(flashcard)
        return Response(serializer.data, status=HTTP_200_OK)

    @clerk_authenticated
    def put(self, request, pk):
        flashcard = self.get_object(pk, request.user_details.id)
        serializer = FlashcardSerializer(flashcard, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=HTTP_200_OK)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

    @clerk_authenticated
    def delete(self, request, pk):
        flashcard = self.get_object(pk, request.user_details.id)
        flashcard.delete()
        return Response(status=HTTP_200_OK)


# Feedback Views
class FeedbackListCreateView(APIView):
    @clerk_authenticated
    def get(self, request):
        user_id = request.query_params.get("user_id")
        deck_id = request.query_params.get("deck_id")

        feedbacks = Feedback.objects.all()
        if user_id:
            feedbacks = feedbacks.filter(user_id=user_id)
        if deck_id:
            feedbacks = feedbacks.filter(deck_id=deck_id)

        serializer = FeedbackSerializer(feedbacks, many=True)
        return Response(serializer.data, status=HTTP_200_OK)

    @clerk_authenticated
    def post(self, request):
        serializer = FeedbackSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=HTTP_201_CREATED)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)


class FeedbackDetailView(APIView):

    @clerk_authenticated
    def get_object(self, pk):
        return get_object_or_404(Feedback, pk=pk)

    @clerk_authenticated
    def get(self, request, pk):
        feedback = Feedback.get_object(pk)
        serializer = FeedbackSerializer(feedback)
        return Response(serializer.data, status=HTTP_200_OK)

    @clerk_authenticated
    def put(self, request, pk):
        feedback = Feedback.get_object(pk)
        serializer = FeedbackSerializer(feedback, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=HTTP_200_OK)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

    @clerk_authenticated
    def delete(self, request, pk):
        feedback = Feedback.get_object(pk)
        feedback.delete()
        return Response(status=HTTP_204_NO_CONTENT)
