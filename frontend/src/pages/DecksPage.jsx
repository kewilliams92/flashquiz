import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { useState } from "react";

function DecksPage() {
  const { getToken } = useAuth({ template: "flashquiz" });
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [topic, setTopic] = useState("");
  const [flashcards, setFlashcards] = useState([]);

  // Helper for making authenticated requests
  const authRequest = async (axiosConfig) => {
    const token = await getToken(); // always fresh token
    return axios({
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const fetchDecks = async () => {
    try {
      const res = await authRequest({ method: "GET", url: "/api/decks/" });
      setDecks(res.data);
    } catch (err) {
      console.error("Error fetching decks:", err);
    }
  };

  const createDeck = async () => {
    try {
      await authRequest({
        method: "POST",
        url: "/api/decks/",
        data: { title: "My First Deck", description: "" },
      });
      fetchDecks();
    } catch (err) {
      console.error("Error creating deck:", err);
    }
  };

  const deleteDeck = async (deckId) => {
    if (!window.confirm("Are you sure you want to delete this deck?")) return;

    try {
      await authRequest({ method: "DELETE", url: `/api/decks/${deckId}/` });
      setSelectedDeck(null);
      fetchDecks();
    } catch (err) {
      console.error("Error deleting deck:", err);
    }
  };

  const selectDeck = async (deck) => {
    setSelectedDeck(deck);
    try {
      const res = await authRequest({
        method: "GET",
        url: "/api/flashcards/",
        params: { deck_id: deck.id },
      });
      setFlashcards(res.data);
    } catch (err) {
      console.error("Error fetching flashcards:", err);
      setFlashcards([]);
    }
  };

  const generateFlashcards = async () => {
    if (!selectedDeck) return alert("Please select a deck first!");
    if (!topic) return alert("Please enter a topic!");

    try {
      const res = await authRequest({
        method: "POST",
        url: "/api/generate-flashcards/",
        data: { topic },
      });
      setFlashcards(res.data.flashcards || []);
    } catch (err) {
      console.error("Error generating flashcards:", err);
    }
  };

  return (
    <div>
      <h1>Decks</h1>
      <button onClick={createDeck}>Create Deck</button>
      <button onClick={fetchDecks}>Fetch Decks</button>

      <ul>
        {decks.map((deck) => (
          <li key={deck.id}>
            <span
              style={{
                cursor: "pointer",
                fontWeight: selectedDeck?.id === deck.id ? "bold" : "normal",
              }}
              onClick={() => selectDeck(deck)}
            >
              {deck.title}
            </span>
            <button onClick={() => deleteDeck(deck.id)}>Delete</button>
          </li>
        ))}
      </ul>

      {selectedDeck && (
        <>
          <h2>Selected Deck: {selectedDeck.title}</h2>
          <h3>Generate AI Flashcards</h3>
          <input
            type="text"
            placeholder="Enter topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
          <button onClick={generateFlashcards}>Generate Flashcards</button>

          <h3>Flashcards</h3>
          {flashcards.length === 0 && <p>No flashcards yet.</p>}
          <ul>
            {flashcards.map((card, index) => (
              <li key={index}>
                <strong>Q:</strong> {card.question} <br />
                <strong>A:</strong> {card.answer} <br />
                <strong>Hint:</strong> {card.hint}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default DecksPage;
