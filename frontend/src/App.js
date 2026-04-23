// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import Editor from './pages/Editor';
import ProfilePage from './pages/ProfilePage';

function App() {
  const [user, setUser] = useState(null);

  // ✅ Charger l'utilisateur depuis localStorage au démarrage
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try { setUser(JSON.parse(saved)); }
      catch { localStorage.removeItem('user'); }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <HomePage
            user={user}
            isLoggedIn={!!user}
            onLoginSuccess={handleLoginSuccess}  // ✅ nom correct
            onLogout={handleLogout}
          />
        } />
        <Route path="/editor" element={<Editor />} />
        <Route path="/profile" element={
          <ProfilePage
            user={user}
            onUserUpdate={handleUserUpdate}
            onLogout={handleLogout}
          />
        } />
      </Routes>
    </Router>
  );
}

export default App;
