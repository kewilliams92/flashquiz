import { useState } from "react";
import { motion } from "framer-motion";

//NOTE: I wanted a handy hint box for my flashcards, so I created this component.  It uses Framer Motion to animate the hint box in and out for the user to control.
const HintBox = ({ hint }) => {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="flex items-center space-x-2 mt-4">
      <button
        onClick={() => setShowHint(!showHint)}
        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-500 transition"
      >
        Hint
      </button>

      <div
        className={`transition-all duration-300 overflow-hidden border rounded px-3 py-2 min-w-[200px] ${
          showHint ? "bg-gray-100 text-gray-800" : "bg-gray-50 text-gray-50"
        }`}
      >
        {showHint ? hint : ""}
      </div>
    </div>
  );
};

export default HintBox;
