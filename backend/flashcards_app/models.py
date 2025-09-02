from django.conf import settings
from django.db import models


# Create your models here.
class Deck(models.Model):
    user_id = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.user_id})"


class Flashcard(models.Model):
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name="flashcards")
    question = models.TextField()
    answer = models.TextField()
    hint = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Q: {self.question[:30]}..."


# NOTE: Might use for future social app?
class Feedback(models.Model):
    user_id = models.CharField(max_length=255)  # Store Clerk user ID
    deck = models.ForeignKey(Deck, on_delete=models.CASCADE, related_name="feedback")
    comment = models.TextField()
    rating = models.PositiveIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback from {self.user_id} on {self.deck.title}"
