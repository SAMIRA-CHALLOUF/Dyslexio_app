// src/pages/HomePage.jsx
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from './Home/Navbar';
import Hero from './Home/Hero';
import DemoVideo from './Home/DemoVideo';
import Stats from './Home/Stats';
import Features from './Home/Features';
import HowItWorks from './Home/HowItWorks';
import Audiences from './Home/Audiences';
import Testimonials from './Home/Testimonials';
import CTA from './Home/CTA';
import Footer from './Home/Footer';
import AuthModal from '../components/Auth/AuthModal';
import { CREAM } from '../constants/colors';

export default function HomePage({ user, isLoggedIn, onLoginSuccess, onLogout, openAuthModal }) {
  const [searchParams] = useSearchParams();
  const justVerified = searchParams.get('verified') === 'true';
  const hasError     = searchParams.get('error');

  // Ouvre le modal automatiquement si on arrive sur /signin
  const [authModal, setAuthModal] = useState({
    open: openAuthModal === 'signin',
    signUp: false,
  });

  const openLogin  = () => setAuthModal({ open: true,  signUp: false });
  const openSignUp = () => setAuthModal({ open: true,  signUp: true  });
  const closeModal = () => setAuthModal({ open: false, signUp: false });

  const handleLoginSuccess = (userData) => {
    if (onLoginSuccess) onLoginSuccess(userData);
    closeModal();
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: CREAM,
      fontFamily: "'Atkinson Hyperlegible', sans-serif",
    }}>

      {/* ❌ Bandeau erreur token */}
      {hasError === 'invalid_token' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
          background: '#ef4444', color: '#fff',
          padding: '14px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          fontSize: 14, fontWeight: 700,
          fontFamily: "'Nunito', sans-serif",
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Lien invalide ou déjà utilisé. Veuillez vous réinscrire.
        </div>
      )}

      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        onLogin={openLogin}
        onSignUp={openSignUp}
        onLogout={onLogout}
        style={{ marginTop: justVerified || hasError ? 52 : 0 }}
      />

      {/* ✅ isLoggedIn + onOpenLogin passés depuis ta version */}
      <Hero isLoggedIn={isLoggedIn} onOpenLogin={openLogin} />

      {/* ✅ DemoVideo ajouté depuis ta version */}
      <DemoVideo />

      <Stats />
      <Features />
      <HowItWorks />
      <Audiences />
      <Testimonials />

      {/* ✅ isLoggedIn + onOpenLogin passés depuis ta version */}
      <CTA isLoggedIn={isLoggedIn} onOpenLogin={openLogin} />

      <Footer />

      <AuthModal
        isOpen={authModal.open}
        defaultSignUp={authModal.signUp}
        onClose={closeModal}
        onLoginSuccess={handleLoginSuccess}
        verifiedMessage={justVerified}
      />
    </div>
  );
}