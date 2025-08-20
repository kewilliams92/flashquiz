import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";

const DecksLayout = () => {
  const { getToken } = useAuth({ template: "flashquiz" });

  // Shared state
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [flashcards, setFlashcards] = useState([]);

  // Fetch all decks
  const fetchDecks = async () => {
    try {
      const token = await getToken();
      const res = await axios.get("/api/decks/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDecks(res.data);
    } catch (err) {
      console.error("Error fetching decks:", err);
    }
  };

  // Select a deck and fetch its flashcards
  const selectDeck = async (deck) => {
    if (!deck) {
      setSelectedDeck(null);
      setFlashcards([]);
      return;
    }

    setSelectedDeck(deck);

    try {
      const token = await getToken();
      const res = await axios.get("/api/flashcards/", {
        params: { deck_id: deck.id },
        headers: { Authorization: `Bearer ${token}` },
      });
      setFlashcards(res.data);
    } catch (err) {
      console.error("Error fetching flashcards:", err);
      setFlashcards([]);
    }
  };

  const createDeck = async () => {
    //Current confirmation
    if (!window.confirm("Are you sure you want to create a new deck?")) return;

    try {
      const token = await getToken();
      await axios.post(
        `/api/decks/`,
        { title: "New Deck", description: "" },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSelectedDeck(null);
      fetchDecks();
    } catch (err) {
      console.error("Error creating deck:", err);
    }
  };

  // Delete a deck
  const deleteDeck = async (deckId) => {
    //Current confirmation
    if (!window.confirm("Are you sure you want to delete this deck?")) return;

    try {
      const token = await getToken();
      await axios.delete(`/api/decks/${deckId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedDeck(null);
      fetchDecks();
    } catch (err) {
      console.error("Error deleting deck:", err);
    }
  };

  const aiConstructedDeck = async (topic) => {
    //Current confirmation
    if (!topic) return alert("Please enter a topic!");

    try {
      const token = await getToken();

      const res = await axios.post(
        "/api/generate-flashcards/",
        { topic },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const newDeck = res.data.deck;
      const newFlashcards = res.data.flashcards;

      // Update state: add the new deck to the deck list
      setDecks((prev) => [...prev, newDeck]);

      setSelectedDeck(newDeck);
      setFlashcards(newFlashcards);

      return newDeck; // return if the UI wants to use it
    } catch (err) {
      console.error("Error generating AI deck:", err);
      alert("Failed to generate AI deck. Please try again.");
    }
  };

  // Fetch a single flashcard by ID
  const fetchFlashcard = async (flashcardId) => {
    try {
      const token = await getToken();
      const res = await axios.get(`/api/flashcards/${flashcardId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      console.error("Error fetching flashcard:", err);
      return null;
    }
  };

  // Edit/update a flashcard
  const editFlashcard = async (flashcardId, updatedData) => {
    try {
      const token = await getToken();
      const res = await axios.put(
        `/api/flashcards/${flashcardId}/`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Update local flashcards state
      setFlashcards((prev) =>
        prev.map((f) => (f.id === flashcardId ? res.data : f)),
      );

      return res.data;
    } catch (err) {
      console.error("Error updating flashcard:", err);
      throw err;
    }
  };

  const deleteFlashcard = async (flashcardId) => {
    try {
      const token = await getToken();
      await axios.delete(`/api/flashcards/${flashcardId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the deleted flashcard from state
      setFlashcards((prev) => prev.filter((fc) => fc.id !== flashcardId));
    } catch (err) {
      console.error("Error deleting flashcard:", err);
    }
  };
  // Fetch decks on initial render
  useEffect(() => {
    fetchDecks();
  }, []);

  return (
    <Outlet
      context={{
        aiConstructedDeck,
        decks,
        selectedDeck,
        createDeck,
        flashcards,
        setFlashcards,
        fetchDecks,
        selectDeck,
        deleteDeck,
        fetchFlashcard,
        editFlashcard,
        deleteFlashcard,
      }}
    />
  );
};

export default DecksLayout;
