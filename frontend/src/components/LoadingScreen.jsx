import { motion } from "framer-motion";

const LoadingScreen = () => {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-200 via-blue-100 to-indigo-200" role="status" aria-live="polite">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          FlashQuiz
        </h1>

        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 0.7,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut",
              }}
              aria-hidden="true"
            />
          ))}
        </div>

        <span className="sr-only">Loading, please wait</span>
        <p className="text-gray-500 text-sm">Let's do this!</p>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;