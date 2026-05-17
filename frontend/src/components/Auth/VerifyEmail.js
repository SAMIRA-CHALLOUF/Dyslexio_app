// src/components/Auth/VerifyEmail.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TEAL = '#0D9373';

const VerifyEmail = () => {
  const [status, setStatus]   = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');

    if (!token) {
      setStatus('error');
      setMessage('Token manquant ou invalide.');
      return;
    }

    fetch('http://localhost:3001/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message);
          setTimeout(() => navigate('/login'), 3000); // Redirection après 3s
        } else {
          setStatus('error');
          setMessage(data.message || 'Lien invalide ou expiré.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Erreur de connexion au serveur.');
      });
  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f8fafc',
    }}>
      <div style={{
        maxWidth: 420, width: '90%', background: '#fff',
        borderRadius: 16, padding: '40px 32px', textAlign: 'center',
        boxShadow: '0 4px 24px #0001', border: '1px solid #e2e8f0',
      }}>

        {/* ── Loading ── */}
        {status === 'loading' && (
          <>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: `${TEAL}15`, border: `2px solid ${TEAL}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>
              Vérification en cours…
            </h2>
            <p style={{ fontSize: 14, color: '#64748b' }}>
              Veuillez patienter quelques secondes.
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {/* ── Success ── */}
        {status === 'success' && (
          <>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: `${TEAL}15`, border: `2px solid ${TEAL}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                stroke={TEAL} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>
              Email vérifié !
            </h2>

            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6,
              maxWidth: 300, margin: '0 auto 20px' }}>
              {message}
            </p>

            <div style={{
              background: `${TEAL}10`, border: `1px solid ${TEAL}25`,
              borderRadius: 10, padding: '12px 16px',
              fontSize: 12, color: '#0F6E56', lineHeight: 1.5,
              maxWidth: 300, margin: '0 auto 24px',
            }}>
              Votre compte est maintenant <strong>actif</strong>.<br />
              Vous pouvez vous connecter dès maintenant.
            </div>

            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '10px 40px', border: 'none', borderRadius: 10,
                background: `linear-gradient(135deg, ${TEAL}, #0F6E56)`,
                color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer',
              }}>
              Se connecter
            </button>
          </>
        )}

        {/* ── Error ── */}
        {status === 'error' && (
          <>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: '#fef2f2', border: '2px solid #fca5a530',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>

            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>
              Lien invalide
            </h2>

            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6,
              maxWidth: 300, margin: '0 auto 20px' }}>
              {message}
            </p>

            <div style={{
              background: '#fef2f2', border: '1px solid #fca5a530',
              borderRadius: 10, padding: '12px 16px',
              fontSize: 12, color: '#ef4444', lineHeight: 1.5,
              maxWidth: 300, margin: '0 auto 24px',
            }}>
              Le lien a peut-être <strong>expiré</strong> ou déjà été utilisé.<br />
              Veuillez vous réinscrire pour recevoir un nouveau lien.
            </div>

            <button
              onClick={() => navigate('/')}
              style={{
                padding: '10px 40px', border: `1.5px solid ${TEAL}`, borderRadius: 10,
                background: 'transparent', color: TEAL,
                fontSize: 14, fontWeight: 800, cursor: 'pointer',
              }}>
              Retour à l'accueil
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;