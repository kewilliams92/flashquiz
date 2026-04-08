import { motion } from "framer-motion";

const FlipCard = ({ front, back, flipped, onClick }) => {
  return (
    <div
      className="w-80 h-48 cursor-pointer perspective-[1000px]"
      onClick={onClick}
    >
      <motion.div
        className="w-full h-full transform-style-preserve-3d relative"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 backface-hidden bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center p-4 text-center text-gray-900 dark:text-gray-100 font-medium shadow-md">
          {front}
        </div>
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-indigo-100 dark:bg-indigo-900 border-2 border-indigo-300 dark:border-indigo-700 rounded-xl flex items-center justify-center p-4 text-center text-indigo-900 dark:text-indigo-100 font-medium shadow-md">
          {back}
        </div>
      </motion.div>
    </div>
  );
};

export default FlipCard;
