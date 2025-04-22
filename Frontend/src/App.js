import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PictoraApp from "./PictoraApp"; // Homepage component
import VisualsPage from "./components/VisualsPage";
import StorylinesPage from "./components/StorylinesPage";
import StoryGenerator from "./components/StoryGenerator";
import Login from "./components/Login";
import ComicsPage from "./components/Comics";
function App() {
  // Simple auth check (replace with your real auth logic)
  const isLoggedIn = localStorage.getItem('loggedIn') === 'true';

  return (
    <Routes>
      <Route
        path="/login"
        element={isLoggedIn ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/"
        element={isLoggedIn ? <PictoraApp /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/visuals"
        element={isLoggedIn ? <VisualsPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/comics"
        element={isLoggedIn ? <ComicsPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/storylines"
        element={isLoggedIn ? <StorylinesPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/story-generator"
        element={isLoggedIn ? <StoryGenerator /> : <Navigate to="/login" replace />}
      />
      {/* Redirect any unknown routes to login or home */}
      <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
