import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import DecksPage from "./pages/DecksPage";

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  return <SignedIn>{children}</SignedIn>;
}

function App() {
  return (
    <Router>
      <header>
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <SignedIn>
              <Navigate to="/decks" />
            </SignedIn>
          }
        />
        <Route
          path="/decks"
          element={
            <ProtectedRoute>
              <DecksPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

// import "./App.css";
// import {
//   SignedIn,
//   SignedOut,
//   SignInButton,
//   UserButton,
// } from "@clerk/clerk-react";
//
// function App() {
//   return (
//     <>
//       <header>
//         <SignedOut>
//           <SignInButton />
//         </SignedOut>
//         <SignedIn>
//           <UserButton />
//         </SignedIn>
//       </header>
//     </>
//   );
// }
//
// export default App;
