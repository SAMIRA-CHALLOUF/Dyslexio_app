// src/pages/Home/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TEAL, DARK } from '../../constants/colors';
import { NAV_LINKS } from '../../constants/content';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  {
    code: 'fr', label: 'Français',
    flag: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" width="24" height="16" style={{ borderRadius: 3, display: 'block' }}>
        <rect width="1" height="2" fill="#002395" />
        <rect x="1" width="1" height="2" fill="#fff" />
        <rect x="2" width="1" height="2" fill="#ED2939" />
      </svg>
    ),
  },
  {
    code: 'en', label: 'English',
    flag: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" width="24" height="16" style={{ borderRadius: 3, display: 'block' }}>
        <rect width="60" height="30" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 V30 M0,15 H60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 V30 M0,15 H60" stroke="#C8102E" strokeWidth="6" />
      </svg>
    ),
  },
  {
    code: 'de', label: 'Deutsch',
    flag: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" width="24" height="16" style={{ borderRadius: 3, display: 'block' }}>
        <rect width="5" height="1" fill="#000" />
        <rect y="1" width="5" height="1" fill="#D00" />
        <rect y="2" width="5" height="1" fill="#FFCE00" />
      </svg>
    ),
  },
  {
    code: 'it', label: 'Italiano',
    flag: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" width="24" height="16" style={{ borderRadius: 3, display: 'block' }}>
        <rect width="1" height="2" fill="#009246" />
        <rect x="1" width="1" height="2" fill="#fff" />
        <rect x="2" width="1" height="2" fill="#CE2B37" />
      </svg>
    ),
  },
  {
    code: 'es', label: 'Español',
    flag: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" width="24" height="16" style={{ borderRadius: 3, display: 'block' }}>
        <rect width="3" height="2" fill="#c60b1e" />
        <rect y="0.5" width="3" height="1" fill="#ffc400" />
      </svg>
    ),
  },
];

export default function Navbar({ isLoggedIn, user, onLogin, onSignUp, onLogout }) {
  // ✅ i18n
  const { t, i18n } = useTranslation();

  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  // ✅ selectedLang suit i18n.language
  const [selectedLang, setSelectedLang] = useState(
    LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0]
  );
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('#lang-menu') && !e.target.closest('#lang-btn')) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ✅ Change la langue dans i18n ET met à jour l'affichage
  const handleLangChange = (lang) => {
    setSelectedLang(lang);
    i18n.changeLanguage(lang.code);
    setShowLangMenu(false);
  };

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: scrolled ? 'rgba(253,251,245,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(12px)' : 'none',
      boxShadow: scrolled ? '0 1px 20px rgba(0,0,0,0.06)' : 'none',
      transition: 'all 0.3s ease',
      padding: '0 2rem',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68,
      }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14,
            background: `linear-gradient(135deg, ${TEAL}, #0F6E56)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: `0 4px 14px ${TEAL}44`,
          }}>📖</div>
          <div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '1.1rem', color: DARK }}>
              {t('nav.brand')}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#888', lineHeight: 1 }}>{t('nav.tagline')}</div>
          </div>
        </Link>

        {/* Liens de navigation */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {NAV_LINKS.map((l) => {
            if (l === 'nav.editor' && !isLoggedIn) return null;
            if (l === 'nav.editor') {
              return (
                <Link key={l} to="/editor"
                  style={{ fontSize: '0.9rem', color: '#444', textDecoration: 'none', fontWeight: 500 }}
                  onMouseOver={(e) => (e.target.style.color = TEAL)}
                  onMouseOut={(e) => (e.target.style.color = '#444')}
                >{t('nav.editor')}</Link>
              );
            }
            return (
              <a key={l} href="#"
                style={{ fontSize: '0.9rem', color: '#444', textDecoration: 'none', fontWeight: 500 }}
                onMouseOver={(e) => (e.target.style.color = TEAL)}
                onMouseOut={(e) => (e.target.style.color = '#444')}
              >{t(l)}</a>
            );
          })}

          {/* ── Language Selector ── */}
          <div style={{ position: 'relative' }}>
            <button
              id="lang-btn"
              onClick={() => { setShowLangMenu(!showLangMenu); setShowProfileMenu(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '6px 12px', borderRadius: 8,
                border: `1.5px solid ${showLangMenu ? TEAL : '#e2e8f0'}`,
                background: showLangMenu ? `${TEAL}10` : '#f8fafc',
                cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700,
                color: '#334155', transition: 'all 0.2s',
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', lineHeight: 0 }}>
                {selectedLang.flag}
              </span>
              <span>{selectedLang.code.toUpperCase()}</span>
              <span style={{
                fontSize: 10, marginLeft: 2, transition: 'transform 0.2s',
                display: 'inline-block',
                transform: showLangMenu ? 'rotate(180deg)' : 'rotate(0deg)',
              }}>▼</span>
            </button>

            {showLangMenu && (
              <div id="lang-menu" style={{
                position: 'absolute', top: 46, right: 0,
                background: '#fff', borderRadius: 12,
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                border: '1px solid #e2e8f0',
                padding: '6px 0', minWidth: 160, zIndex: 300,
                animation: 'fadeIn 0.15s ease',
              }}>
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLangChange(lang)} // ✅ connecté à i18n
                    style={{
                      width: '100%', padding: '10px 16px',
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: selectedLang.code === lang.code ? `${TEAL}10` : 'none',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                      fontSize: '0.9rem', fontWeight: selectedLang.code === lang.code ? 700 : 500,
                      color: selectedLang.code === lang.code ? TEAL : '#334155',
                      fontFamily: "'Nunito', sans-serif", transition: 'background 0.15s',
                    }}
                    onMouseOver={(e) => { if (selectedLang.code !== lang.code) e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseOut={(e) => { if (selectedLang.code !== lang.code) e.currentTarget.style.background = 'none'; }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', lineHeight: 0 }}>
                      {lang.flag}
                    </span>
                    {lang.label}
                    {selectedLang.code === lang.code && (
                      <span style={{ marginLeft: 'auto', color: TEAL, fontSize: 12 }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Séparateur */}
          <div style={{ width: 1, height: 24, background: 'rgba(0,0,0,0.12)', borderRadius: 1 }} />

          {/* Zone Auth */}
          {!isLoggedIn ? (
            <>
              <button onClick={onLogin} style={{
                fontSize: '0.88rem', fontWeight: 700, color: TEAL, cursor: 'pointer',
                padding: '0.45rem 1.1rem', borderRadius: 50, border: `2px solid ${TEAL}`,
                background: 'transparent', transition: 'all 0.2s ease',
              }}
                onMouseOver={(e) => { e.currentTarget.style.background = TEAL; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEAL; }}
              >
                {t('nav.login')}
              </button>

              <button onClick={onSignUp} style={{
                background: `linear-gradient(135deg, ${TEAL}, #0F6E56)`,
                color: '#fff', padding: '0.5rem 1.2rem', borderRadius: 50,
                fontSize: '0.88rem', fontWeight: 700, border: 'none', cursor: 'pointer',
                boxShadow: `0 4px 14px ${TEAL}55`,
              }}>
                ✨ {t('nav.signup')}
              </button>
            </>
          ) : (
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowLangMenu(false); }}
                style={{
                  width: 42, height: 42, borderRadius: '50%', overflow: 'hidden',
                  border: `2px solid ${TEAL}`, cursor: 'pointer',
                  boxShadow: `0 2px 10px ${TEAL}30`,
                }}
              >
                {user?.image ? (
                  <img src={user.image} alt="Profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{
                    width: '100%', height: '100%', background: TEAL, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', fontWeight: 700,
                  }}>
                    {user?.prenom?.[0] || 'U'}
                  </div>
                )}
              </div>

              {showProfileMenu && (
                <div style={{
                  position: 'absolute', top: 55, right: 0, background: '#fff',
                  borderRadius: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  padding: '8px 0', width: 200, zIndex: 200, border: '1px solid #e2e8f0',
                }}
                  onMouseLeave={() => setShowProfileMenu(false)}
                >
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontWeight: 700 }}>{user?.prenom} {user?.nom}</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{user?.email}</div>
                  </div>

                  <button style={menuItemStyle} onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}>
                    👤 {t('nav.myProfile')}
                  </button>
                  <button style={menuItemStyle}>⚙️ {t('nav.settings')}</button>
                  <button style={menuItemStyle}>📖 {t('nav.myDocuments')}</button>

                  <div style={{ height: 1, background: '#e2e8f0', margin: '8px 0' }} />

                  <button onClick={() => { setShowProfileMenu(false); onLogout(); }}
                    style={{ ...menuItemStyle, color: '#ef4444' }}>
                    ⬅️ {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </nav>
  );
}

const menuItemStyle = {
  width: '100%', padding: '12px 20px', textAlign: 'left',
  background: 'none', border: 'none', cursor: 'pointer',
  fontSize: '0.95rem', color: '#334155', transition: 'background 0.2s',
  display: 'flex', alignItems: 'center', gap: 10,
};