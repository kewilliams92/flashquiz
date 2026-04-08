import logging
import os

import anthropic
from django.shortcuts import get_object_or_404
from dotenv import load_dotenv
from rest_framework.response import Response
from rest_framework.status import (
    HTTP_200_OK,
    HTTP_201_CREATED,
    HTTP_204_NO_CONTENT,
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_500_INTERNAL_SERVER_ERROR,
)
from rest_framework.views import APIView

from flashquiz_proj.utils.auth_utils import clerk_authenticated

from .models import Deck, Feedback, Flashcard
from .serializers import DeckSerializer, FeedbackSerializer, FlashcardSerializer
from .utils.helperfunc import (
    WikipediaAmbiguousError,
    WikipediaNotFoundError,
    fetch_wikipedia_content,
    validate_flashcard,
)

load_dotenv()
logger = logging.getLogger(__name__)
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


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

        try:
            page_title, wiki_summary = fetch_wikipedia_content(topic)
        except WikipediaNotFoundError as e:
            return Response({"error": str(e)}, status=HTTP_404_NOT_FOUND)
        except WikipediaAmbiguousError as e:
            return Response({"error": str(e)}, status=HTTP_400_BAD_REQUEST)

        if not wiki_summary:
            logger.error("No summary content found")
            return Response(
                {"error": "No source content found for this topic."},
                status=HTTP_404_NOT_FOUND,
            )

        logger.info(f"Summary length: {len(wiki_summary)} characters")

        ai_prompt = f"""
You are a flashcard generator. Given Wikipedia content, extract specific, testable facts and format them as flashcards.

Rules:
- ONE fact per card. Never combine two facts into one card.
- The question must NOT contain or imply the answer.
- The answer must state the fact directly and concisely (a number, name, date, ranking, etc.).
- The hint must help narrow down the answer WITHOUT restating the question or giving the answer away. It should eliminate wrong guesses, not confirm the right one.
- Avoid trivia-style "what is X" questions where the answer is just the definition of X.
- Prefer questions that test relationships, rankings, quantities, causes, or contrasts.

Bad example:
Q: How many UN official languages is Arabic?
A: One of six official languages
Hint: It ranks third after English and French

Good example:
Q: How many official languages does the United Nations recognize?
A: Six
Hint: Arabic and Chinese were added in 1973, bringing the total up from four

Generate exactly 5 flashcards. Each must be a JSON object with these fields:
- "question": the question text
- "answer": the answer text (a specific fact — number, name, date, etc.)
- "hint": a hint that narrows down the answer without giving it away

Article title: {page_title}
Article summary: {wiki_summary}

Return ONLY a valid JSON array. Do NOT include any extra text.
Example:
[
  {{"question": "Q1", "answer": "A1", "hint": "Hint1"}},
  ...
]
"""

        short_summary = f"""
Create a short summary (200 characters max) with surface-level information about the topic.

Provided summary: {wiki_summary}

Return ONLY a plain string with no extra text or formatting.
"""

        try:
            ai_response = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=1024,
                messages=[{"role": "user", "content": ai_prompt}],
            )
            ai_summary = client.messages.create(
                model="claude-haiku-4-5-20251001",
                max_tokens=256,
                messages=[{"role": "user", "content": short_summary}],
            )
        except anthropic.APIStatusError as e:
            logger.error(f"Anthropic API error: {e.status_code} - {e.message}")
            return Response(
                {"error": "AI service error. Please try again."},
                status=HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except anthropic.APIConnectionError as e:
            logger.error(f"Anthropic connection error: {e}")
            return Response(
                {"error": "Could not reach AI service. Please try again."},
                status=HTTP_500_INTERNAL_SERVER_ERROR,
            )
        logger.info(f"=== AI RAW RESPONSE ===")
        logger.info(ai_response.content[0].text)
        logger.info(f"=== END RAW RESPONSE ===")

        flashcards_data = validate_flashcard(ai_response.content[0].text)
        logger.info(f"Validated flashcards count: {len(flashcards_data)}")

        if not flashcards_data:
            return Response(
                {"error": "Failed to generate flashcards."},
                status=HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Save to the user's deck using the proper Wikipedia page title
        deck, created = Deck.objects.get_or_create(
            user_id=request.user_details.id,
            title=page_title,
            defaults={"description": ai_summary.content[0].text},
        )

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

    def get_object(self, pk):
        return get_object_or_404(Feedback, pk=pk)

    @clerk_authenticated
    def get(self, request, pk):
        feedback = self.get_object(pk)
        serializer = FeedbackSerializer(feedback)
        return Response(serializer.data, status=HTTP_200_OK)

    @clerk_authenticated
    def put(self, request, pk):
        feedback = self.get_object(pk)
        serializer = FeedbackSerializer(feedback, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=HTTP_200_OK)
        return Response(serializer.errors, status=HTTP_400_BAD_REQUEST)

    @clerk_authenticated
    def delete(self, request, pk):
        feedback = self.get_object(pk)
        feedback.delete()
        return Response(status=HTTP_204_NO_CONTENT)
