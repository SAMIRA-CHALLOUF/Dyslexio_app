// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TEAL } from '../constants/colors';

const BACKEND = 'http://localhost:3001';

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  border: '1.5px solid #e2e8f0',
  borderRadius: 8,
  fontSize: 14,
  background: '#fff',
  outline: 'none',
  fontFamily: "'Atkinson Hyperlegible', sans-serif",
  color: '#1A1A2E',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  fontFamily: "'Nunito', sans-serif",
  color: '#374151',
  marginBottom: 6,
};

export default function ProfilePage({ user, onUserUpdate, onLogout }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '', motDePasse: '' });
  const [imagePreview, setImagePreview] = useState(null);
  const [focused, setFocused] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({ nom: user.nom || '', prenom: user.prenom || '', email: user.email || '', motDePasse: '' });
      if (user.image) setImagePreview(user.image);
    }
  }, [user]);

  const focusStyle = (name) =>
    focused === name ? { borderColor: TEAL, boxShadow: `0 0 0 3px ${TEAL}22` } : {};

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const payload = { nom: formData.nom, prenom: formData.prenom, email: formData.email };
      if (formData.motDePasse) payload.motDePasse = formData.motDePasse;
      if (imagePreview && imagePreview !== user?.image) payload.image = imagePreview;

      const res = await fetch(`${BACKEND}/client/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(t('profile.saveError'));
      const updated = await res.json();
      if (onUserUpdate) onUserUpdate(updated);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('profile.deleteConfirm'))) return;
    if (!user?.id) return;
    try {
      await fetch(`${BACKEND}/client/${user.id}`, { method: 'DELETE' });
      if (onLogout) onLogout();
      navigate('/');
    } catch {
      setError(t('profile.saveError'));
    }
  };

  const avatarLetter = user?.prenom?.[0]?.toUpperCase() || 'U';

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Atkinson Hyperlegible', sans-serif" }}>

      {/* Top navbar */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 20, color: '#1A1A2E', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${TEAL}, #0F6E56)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📖</div>
          Logopédie
        </div>
        <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 14, fontWeight: 600, fontFamily: "'Nunito', sans-serif" }}>
          {t('profile.backHome')}
        </button>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 40px' }}>

        {/* Breadcrumb + Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 26, color: '#1A1A2E', margin: 0 }}>
            {t('profile.title')}
          </h1>
          <div style={{ fontSize: 13 }}>
            <span style={{ color: TEAL, cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/')}>
              {t('profile.home')}
            </span>
            <span style={{ color: '#94a3b8', margin: '0 6px' }}>/</span>
            <span style={{ color: '#64748b' }}>{t('profile.breadcrumb')}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* LEFT — Profile Picture */}
          <div style={{ width: 220, flexShrink: 0, background: '#fff', borderRadius: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ alignSelf: 'flex-start', fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14, color: '#374151' }}>
              {t('profile.profilePicture')}
            </div>

            <div style={{ width: 140, height: 140, borderRadius: '50%', overflow: 'hidden', border: `3px solid ${TEAL}`, boxShadow: `0 4px 16px ${TEAL}33`, background: TEAL, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
              {imagePreview
                ? <img src={imagePreview} alt="profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : avatarLetter}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />

            <button
              onClick={() => fileInputRef.current.click()}
              style={{ padding: '10px 18px', border: 'none', borderRadius: 6, background: `linear-gradient(135deg, ${TEAL}, #0F6E56)`, color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: "'Nunito', sans-serif", cursor: 'pointer', boxShadow: `0 4px 14px ${TEAL}44`, transition: 'all 0.2s', width: '100%' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {t('profile.uploadImage')}
            </button>
          </div>

          {/* RIGHT — Account Details */}
          <div style={{ flex: 1, background: '#fff', borderRadius: 0, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '28px 32px' }}>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 15, color: '#374151', marginBottom: 24, paddingBottom: 14, borderBottom: '1px solid #f1f5f9' }}>
              {t('profile.accountDetails')}
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <div style={{ display: 'flex', gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>{t('profile.firstName')}</label>
                  <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required
                    style={{ ...inputStyle, ...focusStyle('prenom') }} onFocus={() => setFocused('prenom')} onBlur={() => setFocused('')} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>{t('profile.lastName')}</label>
                  <input type="text" name="nom" value={formData.nom} onChange={handleChange} required
                    style={{ ...inputStyle, ...focusStyle('nom') }} onFocus={() => setFocused('nom')} onBlur={() => setFocused('')} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>{t('profile.emailAddress')}</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required
                  style={{ ...inputStyle, ...focusStyle('email') }} onFocus={() => setFocused('email')} onBlur={() => setFocused('')} />
              </div>

              <div>
                <label style={labelStyle}>
                  {t('profile.newPassword')}{' '}
                  <span style={{ color: '#94a3b8', fontWeight: 500 }}>{t('profile.passwordHint')}</span>
                </label>
                <input type="password" name="motDePasse" value={formData.motDePasse} onChange={handleChange} placeholder="••••••••"
                  style={{ ...inputStyle, ...focusStyle('motDePasse') }} onFocus={() => setFocused('motDePasse')} onBlur={() => setFocused('')} />
              </div>

              {error && (
                <div style={{ padding: '11px 16px', borderRadius: 8, background: '#fef2f2', color: '#dc2626', fontSize: 13, fontWeight: 600, border: '1px solid #fecaca' }}>
                  ❌ {error}
                </div>
              )}

              <div>
                <button type="submit" disabled={loading}
                  style={{ padding: '11px 28px', border: 'none', borderRadius: 6, background: loading ? '#94a3b8' : `linear-gradient(135deg, ${TEAL}, #0F6E56)`, color: '#fff', fontSize: 14, fontWeight: 800, fontFamily: "'Nunito', sans-serif", cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : `0 4px 14px ${TEAL}44`, transition: 'all 0.2s' }}
                  onMouseOver={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  {loading ? `⏳ ${t('profile.saving')}` : t('profile.saveChanges')}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}