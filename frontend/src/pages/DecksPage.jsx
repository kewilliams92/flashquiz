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

  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateDeck = async () => {
    if (!topic) return alert("Please enter a topic for the AI-generated deck!");
    setLoading(true);
    try {
      await aiConstructedDeck(topic);
      fetchDecks();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTopic("");
    }
  };

  const handleCreateDeck = async () => {
    if (!window.confirm("Create a new blank deck?")) return;
    setLoading(true);
    try {
      await createDeck();
      fetchDecks();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Controls for create + AI deck */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <button
          onClick={handleCreateDeck}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
        >
          Create Deck
        </button>

        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter topic for AI deck"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleGenerateDeck}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Generate AI Deck
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {loading && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div className="bg-blue-600 h-2 rounded-full animate-pulse w-1/2"></div>
        </div>
      )}

      <Decks decks={decks} deleteDeck={deleteDeck} selectDeck={selectDeck} />
    </div>
  );
};

export default DecksPage;
