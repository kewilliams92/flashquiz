import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-200 via-blue-100 to-indigo-200">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl shadow-xl border border-gray-200 p-12 flex flex-col items-center gap-4 max-w-md w-full mx-4 text-center"
      >
        <h1 className="text-8xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-800">Page not found</h2>
        <p className="text-gray-500">
          The page you're looking for doesn't exist or couldn't be reached.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition-all duration-200"
        >
          Go Home
        </motion.button>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
