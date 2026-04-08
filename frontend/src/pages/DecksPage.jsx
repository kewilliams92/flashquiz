import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Decks from "../components/Decks.jsx";

const DecksPage = () => {
  const {
    decks,
    fetchDecks,
    deleteDeck,
    deleting,
    aiConstructedDeck,
    createDeck,
    selectDeck,
  } = useOutletContext();

  const [aiTopic, setAiTopic] = useState("");
  const [manualTopic, setManualTopic] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateDeck = async () => {
    if (!aiTopic) return alert("Please enter a topic for the AI-generated deck!");
    setLoading(true);
    try {
      await aiConstructedDeck(aiTopic);
      fetchDecks();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setAiTopic("");
    }
  };

  const handleCreateDeck = async (topic, description) => {
    if (!topic || !description) return alert("Please enter a topic and description for the new deck!");
    setLoading(true);
    try {
      await createDeck(topic, description);
      fetchDecks();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setManualTopic("");
      setManualDescription("");
    }
  };

  return (
    <>
      <div className="min-h-full bg-gradient-to-br from-slate-200 via-blue-100 to-indigo-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-8">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">My Study Decks</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Create new flashcard decks manually or let AI generate them for you. Start learning smarter today!
            </p>
          </div>

          {/* Creation Controls */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">Create New Deck</h2>
            <div className="grid md:grid-cols-2 gap-8">

              {/* Manual Creation */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Manual Creation</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter deck title"
                    value={manualTopic}
                    onChange={(e) => setManualTopic(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  />
                  <textarea
                    placeholder="Enter deck description"
                    value={manualDescription}
                    onChange={(e) => setManualDescription(e.target.value)}
                    rows="3"
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all resize-none"
                  />
                  <button
                    onClick={() => handleCreateDeck(manualTopic, manualDescription)}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating..." : "Create Deck"}
                  </button>
                </div>
              </div>

              {/* AI Generation */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">AI Generation</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter topic for AI deck (e.g., 'Spanish', 'Earth')"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                  <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      AI will automatically generate flashcards and content based on your topic
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateDeck}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Generating..." : "Generate AI Deck"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading bar */}
          {loading && (
            <div className="mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">Creating your deck...</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse w-3/4" />
                </div>
              </div>
            </div>
          )}

          {/* Decks List */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
              Total Decks: {decks.length}
            </h2>
            <Decks decks={decks} deleteDeck={deleteDeck} selectDeck={selectDeck} />
          </div>
        </div>
      </div>

      {/* Delete toast */}
      <AnimatePresence>
        {deleting && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="fixed top-20 right-6 z-50 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 rounded-xl shadow-xl px-5 py-4 flex items-center gap-3"
          >
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500 flex-shrink-0" />
            <div>
              <p className="text-gray-800 dark:text-gray-100 font-semibold text-sm">Deleting deck</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs">Please wait...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DecksPage;
