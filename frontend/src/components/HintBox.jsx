import { useState } from "react";

const HintBox = ({ hint }) => {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="flex items-center space-x-2 mt-4">
      <button
        onClick={() => setShowHint(!showHint)}
        className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500 transition"
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
