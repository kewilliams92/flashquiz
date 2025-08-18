from django.urls import path

from .views import (
    DeckDetailView,
    DeckListCreateView,
    FeedbackDetailView,
    FeedbackListCreateView,
    FlashcardDetailView,
    FlashcardListCreateView,
    GenerateFlashcardsView,
)

urlpatterns = [
    path("api/decks/", DeckListCreateView.as_view(), name="deck-list-create"),
    path("api/decks/<int:pk>/", DeckDetailView.as_view(), name="deck-detail"),
    path(
        "api/flashcards/",
        FlashcardListCreateView.as_view(),
        name="flashcard-list-create",
    ),
    path(
        "api/flashcards/<int:pk>/",
        FlashcardDetailView.as_view(),
        name="flashcard-detail",
    ),
    path(
        "api/feedback/", FeedbackListCreateView.as_view(), name="feedback-list-create"
    ),
    path(
        "api/feedback/<int:pk>/", FeedbackDetailView.as_view(), name="feedback-detail"
    ),
    path(
        "api/generate-flashcards/",
        GenerateFlashcardsView.as_view(),
        name="generate-flashcards",
    ),
]
