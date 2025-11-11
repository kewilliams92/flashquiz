import json
import logging

logger = logging.getLogger(__name__)

# NOTE: We need to validate the data we get from the AI to make sure it's in the format we expect
# FIX: Create a custom exception that will send back a helpful message to the user letting them know our AI had a hiccup in it's response

def validate_flashcard(ai_output):
    flashcards = []
    try:
        # Clean the response - remove markdown code blocks if present
        cleaned = ai_output.strip()
        
        # Remove ```json ... ``` wrapper if present
        if cleaned.startswith("```"):
            logger.info("Detected markdown code block, cleaning...")
            lines = cleaned.split("\n")
            # Remove first line (```json or ```)
            lines = lines[1:]
            # Remove last line if it's ```
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            cleaned = "\n".join(lines)
        
        logger.info(f"Cleaned JSON: {cleaned[:200]}...")  # Log first 200 chars
        
        data = json.loads(cleaned)
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
        logger.info(f"Successfully parsed {len(flashcards)} flashcards")
    except json.JSONDecodeError as e:
        logger.error(f"JSON Decode Error: {e}")
        logger.error(f"Failed to parse: {ai_output[:500]}")  # Log first 500 chars
    except Exception as e:
        logger.error(f"Validation error: {e}")
    
    return flashcards
