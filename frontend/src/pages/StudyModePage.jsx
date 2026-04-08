import { useState, useEffect } from "react";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import FlipCard from "../components/FlipCard";
import HintBox from "../components/HintBox";
import StudyTimer from "../components/StudyTimer";

const StudyModePage = () => {
  const { deckId } = useParams();
  const { decks, selectedDeck, selectDeck, flashcards } = useOutletContext();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [cardsStudied, setCardsStudied] = useState(new Set());
  const [restartCount, setRestartCount] = useState(0);

  useEffect(() => {
    if (!selectedDeck || selectedDeck.id !== Number(deckId)) {
      const deck = decks.find((d) => d.id === Number(deckId));
      if (deck) selectDeck(deck);
    }
  }, [deckId, selectedDeck, decks, selectDeck]);

  useEffect(() => {
    setCards(flashcards);
    setCurrentIndex(0);
    setFlipped(false);
    setCardsStudied(new Set());
  }, [flashcards]);

  useEffect(() => {
    setFlipped(false);
  }, [currentIndex]);

  useEffect(() => {
    if (flipped) {
      setCardsStudied((prev) => new Set([...prev, currentIndex]));
    }
  }, [flipped, currentIndex]);

  if (!selectedDeck || !cards.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading study session...
          </p>
        </motion.div>
      </div>
    );
  }

  const isLastCard = currentIndex === cards.length - 1;

  const handleNext = () => setCurrentIndex((prev) => prev + 1);
  const handlePrev = () =>
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);

  const shuffleCards = (arr) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleRestartStudy = () => {
    setCards((prev) => shuffleCards(prev));
    setCardsStudied(new Set());
    setCurrentIndex(0);
    setFlipped(false);
    setRestartCount((c) => c + 1);
  };

  const progressPercentage = (cardsStudied.size / cards.length) * 100;
  const currentCard = cards[currentIndex];

  return (
    <div className="h-full bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col overflow-hidden">
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-3 flex flex-col gap-3 overflow-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-md px-5 py-3 border border-gray-100 dark:border-gray-700 flex-shrink-0"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                {selectedDeck.title}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Study Mode • Focus and learn
              </p>
            </div>
            <div className="flex items-center gap-5">
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {cardsStudied.size}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Studied
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {cards.length}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Total
                </div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600 dark:text-green-400">
                  <StudyTimer stopped={isLastCard} resetKey={restartCount} />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Time
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <motion.div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-1.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Main Study Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-4 p-5 overflow-hidden"
        >
          {/* Card Counter */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.15 }}
              className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 px-5 py-2 rounded-full"
            >
              <span className="text-purple-700 dark:text-purple-300 font-semibold text-sm">
                Card {currentIndex + 1} of {cards.length}
              </span>
            </motion.div>
          </AnimatePresence>

          <FlipCard
            front={currentCard.question}
            back={currentCard.answer}
            flipped={flipped}
            onClick={() => setFlipped(!flipped)}
          />

          <HintBox hint={currentCard.hint} currentIndex={currentIndex} />

          {/* Navigation Controls */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrev}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg font-medium flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </motion.button>

            {isLastCard ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRestartStudy}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg font-medium flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Restart
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/decks")}
                  className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-8 py-3 rounded-xl hover:from-red-600 hover:to-rose-600 transition-all duration-200 shadow-lg font-medium flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Exit
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg font-medium flex items-center gap-2"
              >
                Next
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </motion.button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleRestartStudy}
              className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700 px-5 py-2 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/60 transition-all duration-200 text-sm font-semibold flex items-center gap-1.5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Restart
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(`/decks/${deckId}`)}
              className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 px-5 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-200 text-sm font-semibold flex items-center gap-1.5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit Deck
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudyModePage;
