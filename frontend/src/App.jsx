import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import { whoami } from "./api/client.js";

export default function App() {
  const [user, setUser] = useState(null); // { username, is_admin }
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("ma_token");
    if (!token) {
      setChecking(false);
      return;
    }
    whoami()
      .then((data) => setUser(data))
      .catch(() => localStorage.removeItem("ma_token"))
      .finally(() => setChecking(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ma_token");
    setUser(null);
  };

  if (checking) {
    return <div className="splash">Loading Market Analysis…</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <Login onLogin={setUser} />}
      />
      <Route
        path="/"
        element={
          !user ? (
            <Navigate to="/login" replace />
          ) : user.is_admin ? (
            <AdminDashboard user={user} onLogout={handleLogout} />
          ) : (
            <UserDashboard user={user} onLogout={handleLogout} />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
