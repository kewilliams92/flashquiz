import { motion } from "framer-motion";

const FlipCard = ({ front, back, flipped, onClick }) => {
  return (
    <div
      style={{ perspective: "1000px" }}
      className="w-80 h-48 cursor-pointer"
      onClick={onClick}
    >
      <motion.div
        style={{ transformStyle: "preserve-3d", position: "relative" }}
        className="w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <div
          style={{ backfaceVisibility: "hidden" }}
          className="absolute inset-0 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl flex items-center justify-center p-4 text-center text-gray-800 dark:text-gray-100 font-medium shadow-sm"
        >
          {front}
        </div>
        <div
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900 border-2 border-indigo-200 dark:border-indigo-700 rounded-xl flex items-center justify-center p-4 text-center text-indigo-900 dark:text-indigo-100 font-medium shadow-sm"
        >
          {back}
        </div>
      </motion.div>
    </div>
  );
};

export default FlipCard;
