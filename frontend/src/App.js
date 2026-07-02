import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AccessibilityProvider } from './context/AccessibilityContext';
import SettingsPage from './pages/SettingsPage';
import HomePage from './pages/HomePage';
import Editor from './pages/Editor';
import ExamMode from './pages/ExamMode';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRoute from './pages/admin/AdminRoute';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersManagement from './pages/admin/UsersManagement';
import SubscriptionsPage from './pages/admin/SubscriptionsPage';
import DashboardRoute from './pages/dashboard/DashboardRoute';
import DashboardOverview from './pages/dashboard/Overview';
import DashboardEleves from './pages/dashboard/Eleves';
import DashboardPaiements from './pages/dashboard/Paiements';
import DashboardParametres from './pages/dashboard/parametres';

function App() {
  const [adminUser, setAdminUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('adminUser') || 'null'); }
    catch { return null; }
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
  const saved = localStorage.getItem('user');
  if (saved) {
    try { setUser(JSON.parse(saved)); }
    catch { localStorage.removeItem('user'); }
  }

  // ← AJOUTE : gérer le retour après paiement Twint
  const params = new URLSearchParams(window.location.search);
  if (params.get('redirect_status') === 'succeeded' || 
      sessionStorage.getItem('signupPaymentDone') === 'true') {
    sessionStorage.removeItem('signupPaymentDone');
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

  const handleAdminLogout = () => {
    setAdminUser(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Component wrapper to handle exam mode redirection
  const AppContent = () => {
    const navigate = useNavigate();

    useEffect(() => {
      if (user?.examEndTime && user?.typeCompte === 'eleve') {
        // Check if exam is still active
        const examEndTime = new Date(user.examEndTime).getTime();
        const now = Date.now();
        if (examEndTime > now) {
          // Exam is still active, redirect to exam mode
          localStorage.setItem('examEndTime', user.examEndTime);
          localStorage.setItem('examInProgress', 'true');
          navigate('/exam-mode');
        }
      }
    }, [user?.examEndTime, user?.typeCompte, navigate]);

    return (
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
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout user={adminUser} onLogout={handleAdminLogout} />
          </AdminRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersManagement />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
        </Route>
        <Route path="/dashboard" element={<DashboardRoute><DashboardOverview /></DashboardRoute>} />
        <Route path="/dashboard/eleves" element={<DashboardRoute><DashboardEleves /></DashboardRoute>} />
        <Route path="/dashboard/paiements" element={<DashboardRoute><DashboardPaiements /></DashboardRoute>} />
        <Route path="/dashboard/parametres" element={<DashboardRoute><DashboardParametres /></DashboardRoute>} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/exam-mode" element={<ExamMode user={user} onUserUpdate={handleUserUpdate} />} />
        <Route path="/profile" element={
          <ProfilePage
            user={user}
            onUserUpdate={handleUserUpdate}
            onLogout={handleLogout}
          />
        } />
      </Routes>
    );
  };

  return (
    <AccessibilityProvider>
      <Router>
        <AppContent />
      </Router>
    </AccessibilityProvider>
  );
}

export default App;