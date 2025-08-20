import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, UserButton, SignInButton } from "@clerk/clerk-react";

function Navbar() {
  const { isSignedIn, isLoaded } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActiveLink = (path) => location.pathname === path;

  return (
    <nav className="sticky bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button
              onClick={() => {
                if (!isSignedIn) {
                  navigate("/");
                } else {
                  navigate("/decks");
                }
              }}
              className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
            >
              FlashQuiz
            </button>
          </div>

          {/* Navigation Links */}
          {isSignedIn && (
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/decks"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveLink("/decks")
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  Decks
                </Link>
              </div>
            </div>
          )}

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {!isLoaded ? (
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            ) : isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                  },
                }}
                afterSignOutUrl="/"
              />
            ) : (
              <SignInButton mode="modal">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
