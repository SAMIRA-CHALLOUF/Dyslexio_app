// src/components/Auth/AuthModal.js
import React, { useEffect } from 'react';
import Auth from './Auth';

const AuthModal = ({ 
  isOpen, 
  defaultSignUp = false, 
  onClose, 
  onLoginSuccess   // ← Nouvelle prop importante
}) => {

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { 
      document.body.style.overflow = ''; 
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', 
          inset: 0, 
          zIndex: 200,
          background: 'rgba(15,23,42,0.55)',
          backdropFilter: 'blur(6px)',
          animation: 'fadeBackdrop 0.25s ease both',
        }}
      />

      {/* Modal Container */}
      <div style={{
        position: 'fixed', 
        inset: 0, 
        zIndex: 201,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '1.5rem', 
        pointerEvents: 'none',
      }}>
        <div style={{
          pointerEvents: 'auto',
          width: '100%', 
          maxWidth: 720,
          animation: 'slideUpModal 0.32s cubic-bezier(0.34,1.56,0.64,1) both',
          position: 'relative',
        }}>
          
          {/* Bouton fermer */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', 
              top: 16, 
              right: 16, 
              zIndex: 999,
              width: 36, 
              height: 36, 
              borderRadius: '50%',
              background: '#f1f5f9', 
              border: 'none', 
              cursor: 'pointer',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontSize: 16, 
              color: '#64748b',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => { 
              e.currentTarget.style.background = '#e2e8f0';
              e.currentTarget.style.color = '#0f172a';
            }}
            onMouseOut={(e) => { 
              e.currentTarget.style.background = '#f1f5f9';
              e.currentTarget.style.color = '#64748b';
            }}
          >
            ✕
          </button>

          {/* Composant Auth qui contient SignIn et SignUp */}
          <Auth 
            defaultSignUp={defaultSignUp} 
            onClose={onClose}
            onLoginSuccess={onLoginSuccess}   // ← On passe la fonction ici
          />
        </div>
      </div>

      <style>{`
        @keyframes fadeBackdrop { 
          from { opacity: 0 } 
          to { opacity: 1 } 
        }
        @keyframes slideUpModal { 
          from { 
            opacity: 0; 
            transform: translateY(40px) scale(0.95) 
          } 
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1) 
          } 
        }
      `}</style>
    </>
  );
};

export default AuthModal;