import { useOutletContext, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const DeckDetailPage = () => {
  const {
    selectedDeck,
    selectDeck,
    flashcards,
    deleteFlashcard,
    createFlashcard,
  } = useOutletContext();
  const navigate = useNavigate();
  const { deckId } = useParams();

  // State for popup form
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    hint: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  //The deckId provided in the URL is a string, so we need to convert it to a number
  useEffect(() => {
    if (!selectedDeck || selectedDeck.id !== Number(deckId)) {
      selectDeck({ id: Number(deckId) });
    }
  }, [deckId, selectedDeck, selectDeck]);

  //Just provides a loading message to the user
  if (!selectedDeck) {
    return <div>Loading deck...</div>;
  }

  const handleDelete = async (cardId) => {
    if (window.confirm("Are you sure you want to delete this flashcard?")) {
      await deleteFlashcard(cardId);
    }
  };

  //We get use the card id and go to the flashcard detail page
  const handleEdit = (card) => {
    navigate(`/decks/${selectedDeck.id}/flashcards/${card.id}`);
  };

  //The name and value of the input fields are stored in the formData state
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  //Finally we call the create our flashcard using the createFlashcard function from the layout
  const handleCreateFlashcard = async (e) => {
    e.preventDefault();

    // Validate required fields and make sure they are not empty utilizing the trim() method
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert("Question and Answer are required!");
      return;
    }

    setIsSubmitting(true);
    try {
      await createFlashcard(formData);

      // Reset form and close popup
      setFormData({ question: "", answer: "", hint: "" });
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to create flashcard:", error);
      alert("Failed to create flashcard. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  //We close the form and reset the state
  const handleCancelCreate = () => {
    setFormData({ question: "", answer: "", hint: "" });
    setShowCreateForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {selectedDeck.title}
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedDeck.description || "No description available"}
              </p>

              {/* Stats */}
              <div className="flex items-center space-x-6">
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-sm text-blue-600 font-medium">
                    {flashcards.length}{" "}
                    {flashcards.length === 1 ? "Card" : "Cards"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate(`/decks/${selectedDeck.id}/study`)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center gap-2"
              >
                Start Studying
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium flex items-center gap-2"
              >
                <span className="text-xl">+</span>
                Add Flashcard
              </button>
            </div>
          </div>
        </div>

        {/* Flashcards Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
              Your Flashcards
            </h2>
            {flashcards.length > 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {flashcards.length} card{flashcards.length !== 1 ? "s" : ""} in
                this deck
              </div>
            )}
          </div>

          {flashcards.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                No flashcards yet
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-6 max-w-md mx-auto">
                Get started by adding your first flashcard to this deck. You can
                create them manually or let AI help you generate content.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
              >
                Create Your First Flashcard
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {flashcards.map((card, index) => (
                <div
                  key={card.id}
                  className="group bg-gradient-to-br from-slate-50 to-gray-50 dark:from-gray-700 dark:to-gray-750 border border-gray-200 dark:border-gray-600 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden"
                >
                  {/* Card Number Badge */}
                  <div className="absolute top-3 right-3 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border-l-4 border-blue-400">
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Question</p>
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{card.question}</p>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border-l-4 border-green-400">
                      <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">Answer</p>
                      <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{card.answer}</p>
                    </div>

                    {card.hint && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg border-l-4 border-yellow-400">
                        <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">Hint</p>
                        <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{card.hint}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between gap-2">
                    <button
                      onClick={() => handleEdit(card)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(card.id)}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Flashcard Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Add New Flashcard
                </h3>
                <button
                  onClick={handleCancelCreate}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateFlashcard} className="space-y-6">
                <div>
                  <label htmlFor="question" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Question *
                  </label>
                  <textarea
                    id="question"
                    name="question"
                    value={formData.question}
                    onChange={handleFormChange}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                    rows="4"
                    placeholder="What do you want to ask on this flashcard?"
                  />
                </div>

                <div>
                  <label htmlFor="answer" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Answer *
                  </label>
                  <textarea
                    id="answer"
                    name="answer"
                    value={formData.answer}
                    onChange={handleFormChange}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                    rows="4"
                    placeholder="What's the correct answer?"
                  />
                </div>

                <div>
                  <label htmlFor="hint" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Hint (Optional)
                  </label>
                  <input
                    type="text"
                    id="hint"
                    name="hint"
                    value={formData.hint}
                    onChange={handleFormChange}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Add a helpful hint (optional)"
                  />
                </div>

                <div className="flex justify-end gap-4 pt-6">
                  <button
                    type="button"
                    onClick={handleCancelCreate}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </div>
                    ) : (
                      "Save Flashcard"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckDetailPage;
