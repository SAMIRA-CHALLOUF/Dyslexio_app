// src/components/Auth/SignIn.js
import React, { useState } from 'react';
import { TEAL } from '../../constants/colors';
import { useTranslation } from 'react-i18next';

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

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  fontFamily: "'Nunito', sans-serif",
  color: '#475569',
  marginBottom: 6,
};

const SignIn = ({ onSubmit, loading = false, error = '' }) => {
  const { t } = useTranslation(); 
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    onSubmit({
      email: formData.email.trim(),
      password: formData.password,
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Email */}
      <div>
        <label style={labelStyle}>{t('auth.email')}</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="votre@email.com"
          required
          disabled={loading}
          style={{ ...inputStyle, borderColor: error ? '#ef4444' : '#e2e8f0' }}
        />
      </div>

      {/* Mot de passe */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>{t('auth.password')}</label>
          <span style={{ fontSize: 12, color: TEAL, fontWeight: 600, cursor: 'pointer' }}>
            {t('auth.forgotPassword')}
          </span>
        </div>
        <div style={{ position: 'relative' }}>
          <input
            type={showPass ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={t('auth.password')}
            required
            disabled={loading}
            style={{ ...inputStyle, paddingRight: 44, borderColor: error ? '#ef4444' : '#e2e8f0' }}
          />
          {/* Toggle password — SVG eye icon, no emoji */}
          <button
            type="button"
            onClick={() => setShowPass(p => !p)}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0,
            }}
            disabled={loading}
          >
            {showPass ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <p style={{ color: '#ef4444', fontSize: 14, margin: '8px 0 0 0', textAlign: 'center', fontWeight: 600 }}>
          {error}
        </p>
      )}

      {/* Bouton Connexion */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%', padding: '13px 0', border: 'none', borderRadius: 12,
          background: loading ? '#94a3b8' : `linear-gradient(135deg, ${TEAL}, #0F6E56)`,
          color: '#fff', fontSize: 16, fontWeight: 800,
          fontFamily: "'Nunito', sans-serif",
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: `0 4px 18px ${TEAL}44`,
          transition: 'all 0.2s', marginTop: 4, opacity: loading ? 0.85 : 1,
        }}
      >
        {loading ? t('auth.loggingIn') : t('auth.loginBtn')}
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{t('auth.continueWith')}</span>
        <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
      </div>

      {/* Google — SVG icon, no emoji */}
      <button
        type="button"
        style={{
          width: '100%', padding: '11px 0', border: '1.5px solid #e2e8f0',
          borderRadius: 12, background: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontSize: 14, fontWeight: 700, fontFamily: "'Nunito', sans-serif", color: '#374151',
        }}
        disabled={loading}
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
        {t('auth.continueGoogle')}
      </button>
    </form>
  );
};

export default SignIn;