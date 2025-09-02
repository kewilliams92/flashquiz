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
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();

  //NOTE: Fetches and loads the flashcard data when the component mounts or when the flashcard ID changes
  useEffect(() => {
    const loadFlashcard = async () => {
      setLoading(true);
      const card = await fetchFlashcard(flashcardId);
      if (card) {
        setFlashcard(card);
        setEditedQuestion(card.question);
        setEditedAnswer(card.answer);
        setEditedHint(card.hint || "");
      }
      setLoading(false);
    };
    loadFlashcard();
  }, [flashcardId, fetchFlashcard]);

  //NOTE: Checks if any of the flashcard fields have changed
  useEffect(() => {
    if (flashcard) {
      const changed =
        editedQuestion !== flashcard.question ||
        editedAnswer !== flashcard.answer ||
        editedHint !== (flashcard.hint || "");
      setHasChanges(changed);
    }
  }, [editedQuestion, editedAnswer, editedHint, flashcard]);

  if (loading) {
    return <div className="text-gray-600">Loading flashcard...</div>;
  }

  //If the user tries to access a non-existent flashcard we'll show an error
  if (!flashcard) {
    return (
      <>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Flashcard Not Found
        </h2>
        <button onClick={() => navigate("/decks")}>Go Back to Decks</button>
      </>
    );
  }

  //NOTE: Once the user clicks the save button, we'll call the editFlashcard function to update the flashcard
  const handleSave = async () => {
    if (!editedQuestion.trim() || !editedAnswer.trim()) {
      alert("Question and Answer are required!");
      return;
    }

    setSaving(true);
    try {
      await editFlashcard(flashcard.id, {
        question: editedQuestion.trim(),
        answer: editedAnswer.trim(),
        hint: editedHint.trim(),
      });
      // Navigate back to the deck detail page
      navigate(`/decks/${flashcard.deck}`);
    } catch (err) {
      console.error("Failed to update flashcard:", err);
      alert("Failed to update flashcard. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  //NOTE:If the user changes their mind and wants to cancel their changes
  const handleCancel = () => {
    if (hasChanges) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to leave?",
        )
      ) {
        navigate(`/decks/${flashcard.deck}`);
      }
    } else {
      navigate(`/decks/${flashcard.deck}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 pt-20">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Edit Flashcard
              </h1>
              <p className="text-gray-600">
                Make changes to your flashcard content
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8">
            <div className="flex items-center justify-center  gap-8">
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
                  Edit Content
                </h2>

                <div>
                  <label
                    htmlFor="question"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Question *
                  </label>
                  <textarea
                    id="question"
                    value={editedQuestion}
                    onChange={(e) => setEditedQuestion(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows="4"
                    placeholder="Enter your question..."
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {editedQuestion.length}/500 characters
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="answer"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Answer *
                  </label>
                  <textarea
                    id="answer"
                    value={editedAnswer}
                    onChange={(e) => setEditedAnswer(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows="4"
                    placeholder="Enter the answer..."
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {editedAnswer.length}/500 characters
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="hint"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Hint (Optional)
                  </label>
                  <input
                    type="text"
                    id="hint"
                    value={editedHint}
                    onChange={(e) => setEditedHint(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Add a helpful hint..."
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {editedHint.length}/200 characters
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                {hasChanges ? (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                    You have unsaved changes
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    All changes saved
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={
                    saving ||
                    !hasChanges ||
                    !editedQuestion.trim() ||
                    !editedAnswer.trim()
                  }
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashcardDetailPage;
