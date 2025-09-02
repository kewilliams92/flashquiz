import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import Decks from "../components/Decks.jsx";

const DecksPage = () => {
  const {
    decks,
    fetchDecks,
    deleteDeck,
    aiConstructedDeck,
    createDeck,
    selectDeck,
  } = useOutletContext();

  //Our state to hold the manual topics and descriptions, along with the AI-generated topic
  const [aiTopic, setAiTopic] = useState("");
  const [manualTopic, setManualTopic] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [loading, setLoading] = useState(false);

  //We receive the topic from the user, and use it to generate a deck using OpenAI
  const handleGenerateDeck = async () => {
    if (!aiTopic)
      return alert("Please enter a topic for the AI-generated deck!");
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

  //We take the topic and description from the user, and use them to create a new deck
  const handleCreateDeck = async (topic, description) => {
    if (!topic || !description)
      return alert("Please enter a topic and description for the new deck!");
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            My Study Decks
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Create new flashcard decks manually or let AI generate them for you.
            Start learning smarter today!
          </p>
        </div>

        {/* Creation Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Create New Deck
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Manual Creation */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <h3 className="text-lg font-medium text-gray-700">
                  Manual Creation
                </h3>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter deck title"
                  value={manualTopic}
                  onChange={(e) => setManualTopic(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <textarea
                  placeholder="Enter deck description"
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                />
                <button
                  onClick={() =>
                    handleCreateDeck(manualTopic, manualDescription)
                  }
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating..." : "Create Deck"}
                </button>
              </div>
            </div>

            {/* AI Generation */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <h3 className="text-lg font-medium text-gray-700">
                  AI Generation
                </h3>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter topic for AI deck (e.g., 'Spanish', 'Earth')"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    AI will automatically generate flashcards and content based
                    on your topic
                  </p>
                </div>
                <button
                  onClick={handleGenerateDeck}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Generating..." : "Generate AI Deck"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {loading && (
          <div className="mb-8">
            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="flex items-center space-x-3 mb-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <span className="text-gray-700 font-medium">
                  {loading ? "Creating your deck..." : "Processing..."}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full animate-pulse w-3/4 transition-all duration-1000"></div>
              </div>
            </div>
          </div>
        )}

        {/* Decks List */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Total Decks: {decks.length}
          </h2>
          <Decks
            decks={decks}
            deleteDeck={deleteDeck}
            selectDeck={selectDeck}
          />
        </div>
      </div>
    </div>
  );
};

export default DecksPage;
