import { useState, useEffect } from "react";
import { useOutletContext, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import FlipCard from "../components/FlipCard";
import HintBox from "../components/HintBox";

const StudyModePage = () => {
  const { deckId } = useParams();
  const { decks, selectedDeck, selectDeck, flashcards } = useOutletContext();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [studyStartTime] = useState(Date.now());
  const [cardsStudied, setCardsStudied] = useState(new Set());

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

  // Track studied cards
  useEffect(() => {
    if (flipped) {
      setCardsStudied((prev) => new Set([...prev, currentIndex]));
    }
  }, [flipped, currentIndex]);

  if (!selectedDeck || !cards.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 pt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 text-center"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading study session...</p>
        </motion.div>
      </div>
    );
  }

  const handleNext = () => {
    if (flipped) setFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleRestartStudy = () => {
    setCardsStudied(new Set());
    setCurrentIndex(0);
    setFlipped(false);
  };

  const getStudyTime = () => {
    const minutes = Math.floor((Date.now() - studyStartTime) / 60000);
    return minutes > 0 ? `${minutes}m` : "Just started";
  };

  const progressPercentage = (cardsStudied.size / cards.length) * 100;
  const currentCard = cards[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 pt-20">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedDeck.title}
              </h1>
              <p className="text-gray-600">Study Mode • Focus and learn</p>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {cardsStudied.size}
                </div>
                <div className="text-sm text-gray-600">Studied</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {cards.length}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {getStudyTime()}
                </div>
                <div className="text-sm text-gray-600">Time</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
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
          className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
        >
          <div className="flex flex-col items-center space-y-8">
            {/* Card Counter - Fixed Animation */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 px-6 py-3 rounded-full">
              <AnimatePresence mode="wait">
                <motion.span
                  key={currentIndex}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="text-purple-700 font-semibold"
                >
                  Card {currentIndex + 1} of {cards.length}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Flip Card */}
            <FlipCard
              key={currentIndex}
              front={currentCard.question}
              back={currentCard.answer}
              flipped={flipped}
              onClick={() => setFlipped(!flipped)}
            />

            {/* Hint Box */}
            <HintBox hint={currentCard.hint} />

            {/* Navigation Controls */}
            <div className="flex items-center space-x-6">
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
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-4 pt-4">
              <button
                onClick={() => navigate(`/decks/${deckId}`)}
                className="text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
              >
                Back to Deck
              </button>
              <span className="text-gray-300">•</span>
              <button
                onClick={handleRestartStudy}
                className="text-purple-600 hover:text-purple-800 transition-colors text-sm font-medium"
              >
                Restart Study
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudyModePage;
//
// import { useState, useEffect } from "react";
// import { useOutletContext, useParams, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import FlipCard from "../components/FlipCard";
// import HintBox from "../components/HintBox";
//
// const StudyModePage = () => {
//   const { deckId } = useParams();
//   const { decks, selectedDeck, selectDeck, flashcards } = useOutletContext();
//   const navigate = useNavigate();
//   const [cards, setCards] = useState([]);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [flipped, setFlipped] = useState(false);
//   const [studyStartTime] = useState(Date.now());
//   const [cardsStudied, setCardsStudied] = useState(new Set());
//
//   useEffect(() => {
//     if (!selectedDeck || selectedDeck.id !== Number(deckId)) {
//       const deck = decks.find((d) => d.id === Number(deckId));
//       if (deck) selectDeck(deck);
//     }
//   }, [deckId, selectedDeck, decks, selectDeck]);
//
//   useEffect(() => {
//     setCards(flashcards);
//     setCurrentIndex(0);
//     setFlipped(false);
//     setCardsStudied(new Set());
//   }, [flashcards]);
//
//   useEffect(() => {
//     setFlipped(false);
//   }, [currentIndex]);
//
//   // Track studied cards
//   useEffect(() => {
//     if (flipped) {
//       setCardsStudied((prev) => new Set([...prev, currentIndex]));
//     }
//   }, [flipped, currentIndex]);
//
//   if (!selectedDeck || !cards.length) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 pt-20 flex items-center justify-center">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           className="bg-white rounded-2xl shadow-lg p-8 text-center"
//         >
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading study session...</p>
//         </motion.div>
//       </div>
//     );
//   }
//
//   const handleNext = () => {
//     if (flipped) setFlipped(false);
//     setCurrentIndex((prev) => (prev + 1) % cards.length);
//   };
//
//   const handlePrev = () => {
//     setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
//   };
//
//   const handleRestartStudy = () => {
//     setCardsStudied(new Set());
//     setCurrentIndex(0);
//     setFlipped(false);
//   };
//
//   const getStudyTime = () => {
//     const minutes = Math.floor((Date.now() - studyStartTime) / 60000);
//     return minutes > 0 ? `${minutes}m` : "Just started";
//   };
//
//   const progressPercentage = (cardsStudied.size / cards.length) * 100;
//   const currentCard = cards[currentIndex];
//
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 pt-20">
//       <div className="max-w-6xl mx-auto px-6 py-8">
//         {/* Header */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
//         >
//           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                 {selectedDeck.title}
//               </h1>
//               <p className="text-gray-600">Study Mode • Focus and learn</p>
//             </div>
//
//             <div className="flex items-center space-x-6">
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-purple-600">
//                   {cardsStudied.size}
//                 </div>
//                 <div className="text-sm text-gray-600">Studied</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-blue-600">
//                   {cards.length}
//                 </div>
//                 <div className="text-sm text-gray-600">Total</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-green-600">
//                   {getStudyTime()}
//                 </div>
//                 <div className="text-sm text-gray-600">Time</div>
//               </div>
//             </div>
//           </div>
//
//           {/* Progress Bar */}
//           <div className="mt-6">
//             <div className="flex justify-between text-sm text-gray-600 mb-2">
//               <span>Progress</span>
//               <span>{Math.round(progressPercentage)}% Complete</span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-2">
//               <motion.div
//                 className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
//                 initial={{ width: 0 }}
//                 animate={{ width: `${progressPercentage}%` }}
//                 transition={{ duration: 0.5 }}
//               />
//             </div>
//           </div>
//         </motion.div>
//
//         {/* Main Study Area */}
//         <motion.div
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ delay: 0.2 }}
//           className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100"
//         >
//           <div className="flex flex-col items-center space-y-8">
//             {/* Card Counter */}
//             <motion.div
//               key={currentIndex}
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="bg-gradient-to-r from-purple-100 to-blue-100 px-6 py-3 rounded-full"
//             >
//               <span className="text-purple-700 font-semibold">
//                 Card {currentIndex + 1} of {cards.length}
//               </span>
//             </motion.div>
//
//             {/* Flip Card */}
//             <FlipCard
//               key={currentIndex}
//               front={currentCard.question}
//               back={currentCard.answer}
//               flipped={flipped}
//               onClick={() => setFlipped(!flipped)}
//             />
//
//             {/* Hint Box */}
//             <HintBox hint={currentCard.hint} />
//
//             {/* Navigation Controls */}
//             <div className="flex items-center space-x-6">
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={handlePrev}
//                 className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg font-medium flex items-center gap-2"
//               >
//                 <svg
//                   className="w-5 h-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M15 19l-7-7 7-7"
//                   />
//                 </svg>
//                 Previous
//               </motion.button>
//
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={handleNext}
//                 className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg font-medium flex items-center gap-2"
//               >
//                 Next
//                 <svg
//                   className="w-5 h-5"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M9 5l7 7-7 7"
//                   />
//                 </svg>
//               </motion.button>
//             </div>
//
//             {/* Quick Actions */}
//             <div className="flex items-center space-x-4 pt-4">
//               <button
//                 onClick={() => navigate(`/decks/${deckId}`)}
//                 className="text-gray-600 hover:text-gray-800 transition-colors text-sm font-medium"
//               >
//                 Back to Deck
//               </button>
//               <span className="text-gray-300">•</span>
//               <button
//                 onClick={handleRestartStudy}
//                 className="text-purple-600 hover:text-purple-800 transition-colors text-sm font-medium"
//               >
//                 Restart Study
//               </button>
//             </div>
//           </div>
//         </motion.div>
//       </div>
//     </div>
//   );
// };
//
// export default StudyModePage;
