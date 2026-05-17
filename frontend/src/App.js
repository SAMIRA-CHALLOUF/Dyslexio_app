// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SettingsPage from './pages/SettingsPage';
import HomePage from './pages/HomePage';
import Editor from './pages/Editor';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Overview from './pages/dashboard/Overview.tsx';
import Eleves from './pages/dashboard/Eleves.tsx';
import Paiements from './pages/dashboard/Paiements.tsx';
import Parametres from './pages/dashboard/parametres.tsx';
import RealtimeTranscription from './pages/RealtimeTranscription';
import VerifyEmail from './components/Auth/VerifyEmail.js';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import SubscriptionsPage from './pages/admin/SubscriptionsPage';



function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        const userData = JSON.parse(saved);
        setUser(userData);
      } catch {
        localStorage.removeItem('user');
      }
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
  const isAdmin = user?.typeCompte === 'admin';
  return (user && user.type === 'etablissement' ? <Navigate to="/dashboard" /> :
          
    <Router>
      <Routes>
        <Route path="/" element={
          <HomePage
            user={user}
            isLoggedIn={!!user}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
          />
        } />

        <Route path="/signin" element={
          <HomePage
            user={user}
            isLoggedIn={!!user}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            openAuthModal="signin"
          />
        } />

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
<Route path="/settings" element={<SettingsPage />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/profile" element={
          <ProfilePage
            user={user}
            onUserUpdate={handleUserUpdate}
            onLogout={handleLogout}
          />
        } />
        <Route path="/dashboard" element={<Overview />} />
        <Route path="/dashboard/eleves" element={<Eleves />} />
        <Route path="/dashboard/paiements" element={<Paiements />} />
        <Route path="/dashboard/parametres" element={<Parametres />} />
        <Route path="/realtime" element={<RealtimeTranscription />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
         <Route
          path="/admin"
          element={
            isAdmin
              ? <AdminLayout user={user} onLogout={handleLogout} />
              : <Navigate to="/" replace />
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
     
    </Router>
  );
}

export default App;