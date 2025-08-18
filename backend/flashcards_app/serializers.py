from rest_framework import serializers

from .models import Deck, Feedback, Flashcard


class DeckSerializer(serializers.ModelSerializer):
    class Meta:
        model = Deck
        fields = ["id", "title", "description", "created_at"]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):
        # The user_id will be passed from the view
        return super().create(validated_data)


class FlashcardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Flashcard
        fields = ["id", "deck", "question", "answer", "hint"]
        read_only_fields = ["id"]


class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ["id", "deck", "comment", "rating", "created_at"]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):
        # The user_id will be passed from the view
        return super().create(validated_data)
