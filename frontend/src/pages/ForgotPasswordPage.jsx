// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TEAL } from '../constants/colors';

const BACKEND = 'http://localhost:3001';

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 12,
  fontSize: 15,
  fontFamily: "'Atkinson Hyperlegible', sans-serif",
  color: '#1A1A2E',
  background: '#f8fafc',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erreur lors de l\'envoi');
      }
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f1f5f9',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Atkinson Hyperlegible', sans-serif",
    }}>
      <div style={{
        background: '#fff', borderRadius: 20, padding: '40px 36px',
        width: '100%', maxWidth: 420,
        boxShadow: '0 8px 32px rgba(0,0,0,0.10)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${TEAL}, #0F6E56)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>📖</div>
          <span style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 20, color: '#1A1A2E' }}>
            Logopédie
          </span>
        </div>

        {success ? (
          /* ── Succès ── */
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <h2 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 22, color: '#1A1A2E', marginBottom: 12 }}>
              Email envoyé !
            </h2>
            <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
              Un lien de réinitialisation a été envoyé à <strong>{email}</strong>. Vérifiez votre boîte mail.
            </p>
            <button
              onClick={() => navigate('/signin')}
              style={{
                padding: '11px 28px', border: 'none', borderRadius: 12,
                background: `linear-gradient(135deg, ${TEAL}, #0F6E56)`,
                color: '#fff', fontSize: 14, fontWeight: 800,
                fontFamily: "'Nunito', sans-serif", cursor: 'pointer',
              }}
            >
              Retour à la connexion
            </button>
          </div>
        ) : (
          /* ── Formulaire ── */
          <>
            <h2 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 22, color: '#1A1A2E', marginBottom: 8 }}>
              Mot de passe oublié
            </h2>
            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Entrez votre email et on vous enverra un lien pour réinitialiser votre mot de passe.
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, fontFamily: "'Nunito', sans-serif", color: '#475569', marginBottom: 6 }}>
                  Adresse email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="votre@email.com"
                  required
                  disabled={loading}
                  style={{ ...inputStyle, borderColor: error ? '#ef4444' : '#e2e8f0' }}
                />
              </div>

              {error && (
                <div style={{
                  padding: '10px 14px', borderRadius: 8,
                  background: '#fef2f2', color: '#dc2626',
                  fontSize: 13, fontWeight: 600,
                  border: '1px solid #fecaca',
                }}>
                  ❌ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px 0', border: 'none', borderRadius: 12,
                  background: loading ? '#94a3b8' : `linear-gradient(135deg, ${TEAL}, #0F6E56)`,
                  color: '#fff', fontSize: 15, fontWeight: 800,
                  fontFamily: "'Nunito', sans-serif",
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: `0 4px 18px ${TEAL}44`,
                  marginTop: 4,
                }}
              >
                {loading ? '⏳ Envoi en cours...' : 'Envoyer le lien'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/signin')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#64748b', fontSize: 13, fontWeight: 600,
                  fontFamily: "'Nunito', sans-serif", textAlign: 'center',
                  padding: 0,
                }}
              >
                ← Retour à la connexion
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}