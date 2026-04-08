import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, UserButton, SignInButton } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";

function Navbar() {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [dark, setDark] = useState(() => localStorage.getItem("theme") === "dark");

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const isActiveLink = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 w-full z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-lg">
      <div className="w-full px-6">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(isSignedIn ? "/decks" : "/")}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center shadow-md">
              <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Flash<span className="text-indigo-200 dark:text-indigo-400">Quiz</span>
            </span>
          </motion.button>

          {/* Navigation Links */}
          {isSignedIn && (
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/decks"
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActiveLink("/decks")
                    ? "bg-white/20 text-white shadow-inner"
                    : "text-indigo-100 hover:bg-white/10 hover:text-white"
                }`}
              >
                {isActiveLink("/decks") && (
                  <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-lg bg-white/20" />
                )}
                <span className="relative flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  My Decks
                </span>
              </Link>
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">

            {/* Dark mode toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDark((d) => !d)}
              className="w-9 h-9 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
              aria-label="Toggle dark mode"
            >
              <AnimatePresence mode="wait" initial={false}>
                {dark ? (
                  <motion.svg
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-5 h-5 text-yellow-300"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </motion.svg>
                ) : (
                  <motion.svg
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-5 h-5 text-white"
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </motion.svg>
                )}
              </AnimatePresence>
            </motion.button>

            <div className="h-6 w-px bg-white/30" />

            {/* Auth */}
            {!isLoaded ? (
              <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse" />
            ) : isSignedIn ? (
              <UserButton
                appearance={{ elements: { avatarBox: "w-8 h-8 ring-2 ring-white/50" } }}
                afterSignOutUrl="/"
              />
            ) : (
              <SignInButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 px-5 py-2 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Sign In
                </motion.button>
              </SignInButton>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
