// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import Navbar from './Home/Navbar';
import Hero from './Home/Hero';
import Stats from './Home/Stats';
import Features from './Home/Features';
import HowItWorks from './Home/HowItWorks';
import Audiences from './Home/Audiences';
import Testimonials from './Home/Testimonials';
import CTA from './Home/CTA';
import Footer from './Home/Footer';
import AuthModal from '../components/Auth/AuthModal';
import { CREAM } from '../constants/colors';

export default function HomePage({ user, isLoggedIn, onLoginSuccess, onLogout }) {
  const [authModal, setAuthModal] = useState({ open: false, signUp: false });

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
      <Navbar
        isLoggedIn={isLoggedIn}
        user={user}
        onLogin={openLogin}
        onSignUp={openSignUp}
        onLogout={onLogout}
      />

      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Audiences />
      <Testimonials />
      <CTA />
      <Footer />

      <AuthModal
        isOpen={authModal.open}
        defaultSignUp={authModal.signUp}
        onClose={closeModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}