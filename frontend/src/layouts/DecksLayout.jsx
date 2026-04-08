import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import api from "../services/api";

//NOTE: In this project, I wanted a single source of truth for decks, and flashcards so I created a layout component to hold the state
//reason being that I want to share this state between multiple components (e.g. the DecksPage and the StudyModePage), and use my App.jsx for routing
const DecksLayout = () => {
  const { getToken } = useAuth({ template: "flashquiz" });

  // This is where we store our decks, the currently selected deck, and the flashcards
  const [decks, setDecks] = useState([]);
  const [selectedDeck, setSelectedDeck] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [deleting, setDeleting] = useState(false);

  //First when the page loads, we want to fetch the decks the user has created so far
  const fetchDecks = async () => {
    //NOTE: Through out this layout, you will see that I have to send a header with the user's bearer token in every request
    //Django needs to know who the request is coming from so it can verify the token using Clerk's decorater
    //In a future project, I will need to figure out how to use Clerk's authentication middleware to do this automatically
    //which will help keep my code cleaner
    try {
      //Clerk manages authentication for us.  Here we ask Clerk for the user's token
      const token = await getToken();
      const res = await api.get("/api/decks/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDecks(res.data);
    } catch (err) {
      console.error("Error fetching decks:", err);
    }
  };

  //Select deck keeps track of the currently selected deck for when we want to edit/delete/study
  const selectDeck = async (deck) => {
    //Resets to no deck selected
    if (!deck) {
      setSelectedDeck(null);
      setFlashcards([]);
      return;
    }

    setSelectedDeck(deck);

    try {
      //Fetch flashcards tied to the selected deck
      const token = await getToken();
      const res = await api.get("/api/flashcards/", {
        params: { deck_id: deck.id },
        headers: { Authorization: `Bearer ${token}` },
      });
      setFlashcards(res.data);
    } catch (err) {
      console.error("Error fetching flashcards:", err);
      setFlashcards([]);
    }
  };

  //Create a new deck, using the deckname and description
  const createDeck = async (deckname, desc) => {
    try {
      const token = await getToken();
      await api.post(
        `/api/decks/`,
        { title: `${deckname}`, description: `${desc}` },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchDecks();
    } catch (err) {
      console.error("Error creating deck:", err);
    }
  };

  // Delete a deck
  const deleteDeck = async (deckId) => {
    //Gives the user a confirmation before deleting
    if (!window.confirm("Are you sure you want to delete this deck?")) return;

    setDeleting(true);
    try {
      const token = await getToken();
      await api.delete(`/api/decks/${deckId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchDecks();
    } catch (err) {
      console.error("Error deleting deck:", err);
    } finally {
      setDeleting(false);
    }
  };

  const aiConstructedDeck = async (topic) => {
    //Ensures the user entered a topic for the AI
    if (!topic) return alert("Please enter a topic!");

    //NOTE: Here we are sending the topic to the backend to:
    //1. Retrieve information about the topic from wikipediaAPI
    //2. Generate flashcards based on the topic with OpenAI
    try {
      const token = await getToken();
      const res = await api.post(
        "/api/generate-flashcards/",
        { topic },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      //The AI returns a deck, along with an array of flashcards
      const newDeck = res.data.deck;
      const newFlashcards = res.data.flashcards;

      //Finally once we have the deck and flashcards, we add them to our state
      setDecks((prev) => [...prev, newDeck]);
      setFlashcards(newFlashcards);
    } catch (err) {
      console.error("Error generating AI deck:", err);
      alert("Failed to generate AI deck. Please try again.");
    }
  };

  // Fetch a single flashcard by ID
  const fetchFlashcard = async (flashcardId) => {
    try {
      const token = await getToken();
      const res = await api.get(`/api/flashcards/${flashcardId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      console.error("Error fetching flashcard:", err);
      return null;
    }
  };

  //Create a new flashcard
  const createFlashcard = async (flashcardData) => {
    //We create a payload with the flashcard data and the deck id
    try {
      const token = await getToken();
      const payload = {
        ...flashcardData,
        deck_id: selectedDeck.id,
      };

      //This time we also attach the payload to our Django backend request
      const res = await api.post(`/api/flashcards/`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Add the new flashcard to the local state
      setFlashcards((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Error creating flashcard:", err);
    }
  };

  // Edit/update a flashcard.  The updatedData is an object with the new question, answer, and hint.
  const editFlashcard = async (flashcardId, updatedData) => {
    try {
      const token = await getToken();
      const res = await api.put(
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
    } catch (err) {
      console.error("Error updating flashcard:", err);
      throw err;
    }
  };

  //Deletes a flashcard by being provided that flashcard's ID
  const deleteFlashcard = async (flashcardId) => {
    try {
      const token = await getToken();
      await api.delete(`/api/flashcards/${flashcardId}/`, {
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

  //Finally, we return the Outlet component with the context provided.  Our layout is provided to our App.jsx and the App.jsx provides it to all of our child components
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
        deleting,
        fetchFlashcard,
        editFlashcard,
        deleteFlashcard,
        createFlashcard,
      }}
    />
  );
};

export default DecksLayout;
