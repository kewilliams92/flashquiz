import { motion } from "framer-motion";

const FlipCard = ({ front, back, flipped, onClick }) => {
  return (
    <motion.div
      className="w-80 h-48 perspective cursor-pointer"
      onClick={onClick}
    >
      <motion.div
        className="relative w-full h-full transform-style-preserve-3d"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute w-full h-full backface-hidden bg-white border rounded-lg flex items-center justify-center p-4">
          {front}
        </div>

        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gray-100 border rounded-lg flex items-center justify-center p-4">
          {back}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FlipCard;
