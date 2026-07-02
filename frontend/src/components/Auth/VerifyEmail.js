import React, { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { API_URL } from '../../config/api';

const TEAL = '#0D9373';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const token = searchParams.get('token');

    if (!token) {
      window.location.replace('/signin?verify_error=token_manquant');
      return;
    }

    const verifyUrl = `${API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`;
    window.location.replace(verifyUrl);
  }, [searchParams]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
    }}>
      <div style={{
        maxWidth: 420,
        width: '90%',
        background: '#fff',
        borderRadius: 16,
        padding: '40px 32px',
        textAlign: 'center',
        boxShadow: '0 4px 24px #0001',
        border: '1px solid #e2e8f0',
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: `3px solid ${TEAL}30`,
          borderTop: `3px solid ${TEAL}`,
          borderRadius: '50%',
          margin: '0 auto 20px',
          animation: 'spin 0.8s linear infinite',
        }} />
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>
          Vérification en cours…
        </h2>
        <p style={{ fontSize: 14, color: '#64748b' }}>
          Redirection vers le serveur, veuillez patienter.
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

export default VerifyEmail;
