import json


# NOTE: We need to validate the data we get from the AI to make sure it's in the format we expect
# FIX: Create a custom exception that will send back a helpful message to the user letting them know our AI had a hiccup in it's response
def validate_flashcard(ai_output):
    flashcards = []
    try:
        data = json.loads(ai_output)
        if isinstance(data, list):
            for item in data:
                if isinstance(item, dict):
                    flashcards.append(
                        {
                            "question": item.get("question", "").strip(),
                            "answer": item.get("answer", "").strip(),
                            "hint": item.get("hint", "").strip(),
                        }
                    )
    except json.JSONDecodeError:
        pass

    return flashcards
