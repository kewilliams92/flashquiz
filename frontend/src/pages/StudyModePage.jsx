import { useState, useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import FlipCard from "../components/FlipCard";
import HintBox from "../components/HintBox";

const StudyModePage = () => {
  const { deckId } = useParams();
  const { decks, selectedDeck, selectDeck, flashcards } = useOutletContext();
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  useEffect(() => {
    if (!selectedDeck || selectedDeck.id !== Number(deckId)) {
      const deck = decks.find((d) => d.id === Number(deckId));
      if (deck) selectDeck(deck);
    }
  }, [deckId, selectedDeck, decks, selectDeck]);

  useEffect(() => {
    setCards(flashcards);
    setCurrentIndex(0); // Reset to first card
    setFlipped(false);
  }, [flashcards]);

  useEffect(() => {
    setFlipped(false);
    setShowHint(false);
  }, [currentIndex]);

  if (!selectedDeck || !cards.length) return <p>Loading...</p>;

  const handleNext = () => {
    if (flipped) setFlipped(false); // flip back instantly first
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const currentCard = cards[currentIndex];

  return (
    <div className="p-6 flex flex-col items-center space-y-6">
      <h1 className="text-2xl font-bold">{selectedDeck.title} - Study Mode</h1>

      <FlipCard
        key={currentIndex}
        front={
          <div className="text-center text-lg font-semibold">
            {currentCard.question}
          </div>
        }
        back={
          <div className="text-center text-lg font-semibold">
            {currentCard.answer}
          </div>
        }
        flipped={flipped}
        onClick={() => setFlipped(!flipped)}
      />

      <HintBox hint={currentCard.hint} />

      <div className="flex space-x-4">
        <button
          onClick={handlePrev}
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Next
        </button>
      </div>

      <p>
        Card {currentIndex + 1} of {cards.length}
      </p>
    </div>
  );
};

export default StudyModePage;
