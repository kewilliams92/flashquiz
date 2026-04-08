import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

//NOTE: I wanted a handy hint box for my flashcards, so I created this component.  It uses Framer Motion to animate the hint box in and out for the user to control.
const HintBox = ({ hint, currentIndex }) => {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setShowHint(false);
  }, [currentIndex]);

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <button
        onClick={() => setShowHint((prev) => !prev)}
        className="bg-yellow-500 dark:bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-400 dark:hover:bg-yellow-500 transition"
      >
        {showHint ? "Hide Hint" : "Show Hint"}
      </button>

      <AnimatePresence>
        {showHint && hint && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="bg-amber-50 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700 text-amber-900 dark:text-amber-200 rounded-lg px-4 py-2 max-w-xs text-center text-sm"
          >
            {hint}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HintBox;
