import { useOutletContext } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const FlashcardDetailPage = () => {
  const { flashcardId } = useParams();
  const { fetchFlashcard, editFlashcard } = useOutletContext();
  const [flashcard, setFlashcard] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState("");
  const [editedAnswer, setEditedAnswer] = useState("");
  const [editedHint, setEditedHint] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadFlashcard = async () => {
      setLoading(true);
      const card = await fetchFlashcard(flashcardId);
      if (card) {
        setFlashcard(card);
        setEditedQuestion(card.question);
        setEditedAnswer(card.answer);
        setEditedHint(card.hint);
      }
      setLoading(false);
    };
    loadFlashcard();
  }, [flashcardId, fetchFlashcard]);

  if (loading) return <p>Loading flashcard...</p>;
  if (!flashcard) return <p>Flashcard not found.</p>;

  const handleSave = async () => {
    try {
      await editFlashcard(flashcard.id, {
        question: editedQuestion,
        answer: editedAnswer,
        hint: editedHint,
      });

      // Navigate back to the deck detail page
      navigate(`/decks/${flashcard.deck}`);
    } catch (err) {
      alert("Failed to update flashcard. Check console.");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Flashcard</h1>

      <label className="block mb-2 font-semibold">
        Question:
        <input
          type="text"
          value={editedQuestion}
          onChange={(e) => setEditedQuestion(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      <label className="block mb-2 font-semibold">
        Answer:
        <input
          type="text"
          value={editedAnswer}
          onChange={(e) => setEditedAnswer(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      <label className="block mb-4 font-semibold">
        Hint:
        <input
          type="text"
          value={editedHint}
          onChange={(e) => setEditedHint(e.target.value)}
          className="w-full border rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </label>

      <button
        onClick={handleSave}
        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
      >
        Save
      </button>
    </div>
  );
};

export default FlashcardDetailPage;
