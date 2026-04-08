import json
import logging

import wikipedia
from wikipedia.exceptions import DisambiguationError, PageError

logger = logging.getLogger(__name__)


class WikipediaNotFoundError(Exception):
    pass


class WikipediaAmbiguousError(Exception):
    pass


def fetch_wikipedia_content(topic):
    """
    Fetches Wikipedia page title and summary for a given topic.
    Returns (page_title, wiki_summary) on success.
    Raises WikipediaNotFoundError or WikipediaAmbiguousError on failure.
    """
    logger.info(f"Searching for topic: {topic}")

    try:
        wiki_page = wikipedia.page(topic, auto_suggest=False)
        logger.info(f"Found direct match: {wiki_page.title}")
        return wiki_page.title, wiki_page.summary

    except PageError:
        logger.info("No exact match, trying with auto-suggest...")
        try:
            wiki_page = wikipedia.page(topic, auto_suggest=True)
            topic_words = set(topic.lower().split())
            title_words = set(wiki_page.title.lower().split())
            if not topic_words.intersection(title_words):
                logger.warning(
                    f"Auto-suggest result '{wiki_page.title}' doesn't match '{topic}'"
                )
                raise PageError(topic)
            logger.info(f"Found match with auto-suggest: {wiki_page.title}")
            return wiki_page.title, wiki_page.summary

        except PageError:
            logger.info("Auto-suggest failed, falling back to search...")
            search_results = wikipedia.search(topic, results=5)
            logger.info(f"Search results: {search_results}")

            if not search_results:
                raise WikipediaNotFoundError(
                    f"No Wikipedia page found for '{topic}'."
                )

            topic_lower = topic.lower()
            best_match = next(
                (r for r in search_results if r.lower() == topic_lower),
                search_results[0],
            )
            logger.info(f"Using best match from search: {best_match}")

            try:
                wiki_page = wikipedia.page(best_match, auto_suggest=False)
                logger.info(f"Successfully fetched page: {wiki_page.title}")
                return wiki_page.title, wiki_page.summary
            except PageError:
                raise WikipediaNotFoundError(
                    f"Could not fetch Wikipedia content for '{topic}'."
                )

    except DisambiguationError as e:
        logger.info(f"Disambiguation needed. Options: {e.options[:3]}")
        try:
            wiki_page = wikipedia.page(e.options[0], auto_suggest=False)
            logger.info(f"Used first disambiguation option: {wiki_page.title}")
            return wiki_page.title, wiki_page.summary
        except (PageError, IndexError):
            raise WikipediaAmbiguousError(
                f"The topic '{topic}' is ambiguous. Please be more specific."
            )


def validate_flashcard(ai_output):
    flashcards = []
    try:
        cleaned = ai_output.strip()

        if cleaned.startswith("```"):
            logger.info("Detected markdown code block, cleaning...")
            lines = cleaned.split("\n")[1:]
            if lines and lines[-1].strip() == "```":
                lines = lines[:-1]
            cleaned = "\n".join(lines)

        logger.info(f"Cleaned JSON: {cleaned[:200]}...")

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
        logger.error(f"Failed to parse: {ai_output[:500]}")
    except Exception as e:
        logger.error(f"Validation error: {e}")

    return flashcards
