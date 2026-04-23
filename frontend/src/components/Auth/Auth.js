// src/components/Auth/Auth.js
import React, { useState } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';
import { TEAL } from '../../constants/colors';
import { useTranslation } from 'react-i18next';

const Auth = ({ defaultSignUp = false, onClose, onLoginSuccess }) => {
  const { t } = useTranslation(); // ✅ INSIDE the component
  const [isSignUp, setIsSignUp] = useState(defaultSignUp);
  const [signUpStep, setSignUpStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          motDePasse: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const msg = Array.isArray(result.message)
          ? result.message[0]
          : result.message || '';

        if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('existe')) {
          setError(t('auth.errorEmail'));
        } else if (msg.toLowerCase().includes('mot de passe') || msg.toLowerCase().includes('incorrect')) {
          setError(t('auth.errorPassword'));
        } else {
          setError(msg || t('auth.errorLogin'));
        }
        return;
      }

      const { access_token, user } = result;
      localStorage.setItem('token', access_token);
      if (onLoginSuccess) onLoginSuccess(user);

    } catch (err) {
      console.error('Erreur connexion:', err);
      setError(t('auth.errorServer'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: 24,
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      fontFamily: "'Nunito', sans-serif",
    }}>
      {/* Logo + Title — caché sur step 2 & 3 */}
      {(!isSignUp || signUpStep === 0) && (
        <div style={{ padding: '32px 36px 0', textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 16, margin: '0 auto 12px',
            background: `linear-gradient(135deg, ${TEAL}, #0F6E56)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, boxShadow: `0 8px 24px ${TEAL}44`,
          }}>📖</div>
          <div style={{ fontWeight: 900, fontSize: 22, color: '#0f172a', letterSpacing: '-0.5px' }}>
            {t('nav.brand')}
          </div>
        </div>
      )}

      {/* Tabs — cachés sur step 2 & 3 */}
      {(!isSignUp || signUpStep === 0) && (
        <div style={{ display: 'flex', margin: '20px 36px 0', background: '#f8fafc', borderRadius: 14, padding: 6, border: '1px solid #f1f5f9' }}>
          {[
            { label: t('auth.loginTab'), value: false },
            { label: t('auth.signupTab'), value: true  },
          ].map(({ label, value }) => (
            <button
              key={label}
              onClick={() => { setIsSignUp(value); setError(''); setSignUpStep(0); }}
              style={{
                flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
                borderRadius: 10, fontSize: 14, fontWeight: value === isSignUp ? 800 : 700,
                fontFamily: "'Nunito', sans-serif",
                background: isSignUp === value ? '#fff' : 'transparent',
                color:      isSignUp === value ? TEAL   : '#64748b',
                boxShadow:  isSignUp === value ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.2s',
              }}
            >{label}</button>
          ))}
        </div>
      )}

      {/* Formulaire */}
      <div style={{
        padding: (!isSignUp || signUpStep === 0) ? '20px 36px 36px' : '28px 36px',
        minHeight: 360, height: 'auto',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        transition: 'padding 0.3s',
      }}>
        {isSignUp
          ? <SignUp onStepChange={setSignUpStep} />
          : <SignIn onSubmit={handleSubmit} loading={loading} error={error} />
        }
      </div>
    </div>
  );
};

export default Auth;