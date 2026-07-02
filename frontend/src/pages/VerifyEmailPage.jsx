import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('Vérification de votre compte en cours...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage("Le lien de vérification est invalide (token manquant).");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/auth/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.');
          
          // Rediriger vers la page de connexion au bout de 4 secondes
          setTimeout(() => {
            navigate('/signin');
          }, 4000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Une erreur est survenue lors de la vérification.');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Impossible de joindre le serveur. Veuillez réessayer plus tard.');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center'
      }}>
        {status === 'loading' && (
          <>
            <svg style={{ animation: 'spin 1s linear infinite', width: '48px', height: '48px', margin: '0 auto', color: '#0D9373' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"></circle>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#1e293b', marginTop: '20px' }}>Patientez...</h2>
            <p style={{ color: '#475569', marginTop: '10px' }}>{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ width: '64px', height: '64px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <svg style={{ width: '32px', height: '32px', color: '#0D9373' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '20px' }}>Compte activé !</h2>
            <p style={{ color: '#334155', marginTop: '10px' }}>{message}</p>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '20px' }}>Redirection vers la page de connexion...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ width: '64px', height: '64px', background: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <svg style={{ width: '32px', height: '32px', color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '20px' }}>Lien invalide</h2>
            <p style={{ color: '#334155', marginTop: '10px' }}>{message}</p>
            <button 
              onClick={() => navigate('/')}
              style={{
                marginTop: '24px',
                background: '#0D9373',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Retour à l'accueil
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmailPage;
