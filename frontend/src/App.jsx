import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import DecksLayout from "./layouts/DecksLayout";
import DecksPage from "./pages/DecksPage";
import HomePage from "./pages/HomePage.jsx";
import Navbar from "./components/Navbar.jsx";
import DeckDetailPage from "./pages/DeckDetailPage.jsx";
import FlashcardDetailPage from "./pages/FlashcardDetailPage.jsx";
import StudyModePage from "./pages/StudyModePage.jsx";

function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <HomePage />;
  return children;
}

function App() {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <>
      <Navbar />
      <Routes>
        {/* Home route */}
        <Route
          path="/"
          element={isSignedIn ? <Navigate to="/decks" replace /> : <HomePage />}
        />
        {/* Decks layout route */}
        <Route
          path="/decks/*"
          element={
            <ProtectedRoute>
              <DecksLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DecksPage />} />
          <Route path=":deckId" element={<DeckDetailPage />} />
          <Route
            path=":deckId/flashcards/:flashcardId"
            element={<FlashcardDetailPage />}
          />
          <Route path=":deckId/study" element={<StudyModePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
