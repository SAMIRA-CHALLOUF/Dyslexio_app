// src/components/Auth/PendingVerification.jsx
import React from 'react';

const TEAL = '#0D9373';

const PendingVerification = ({ email }) => {
  return (
    <div style={{ textAlign: 'center', padding: '32px 24px' }}>

      {/* Icône envelope animée */}
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: `${TEAL}15`, border: `2px solid ${TEAL}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
          stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      </div>

      <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>
        Vérifiez votre email
      </h2>

      <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, maxWidth: 320, margin: '0 auto 20px' }}>
        Un lien de confirmation a été envoyé à{' '}
        <span style={{ fontWeight: 700, color: '#0f172a' }}>{email}</span>.
        <br />
        Cliquez sur le lien pour activer votre compte et accéder à l'application.
      </p>

      <div style={{
        background: `${TEAL}10`, border: `1px solid ${TEAL}25`,
        borderRadius: 10, padding: '12px 16px',
        fontSize: 12, color: '#0F6E56', lineHeight: 1.5,
        maxWidth: 320, margin: '0 auto',
      }}>
        Le lien expire dans <strong>24 heures</strong>.<br />
        Vérifiez aussi vos spams si vous ne le recevez pas.
      </div>

    </div>
  );
};

export default PendingVerification;