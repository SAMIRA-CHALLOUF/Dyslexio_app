// src/pages/SettingsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccessibility } from '../context/AccessibilityContext';

const BACKEND = process.env.REACT_APP_API_URL || 'http://localhost:3001';
// Menu will be built per-user inside the SettingsPage component

// Sidebar navigation component
function Sidebar({ active, setActive, menu }) {
  return (
    <nav className="w-48 flex-shrink-0 border-r border-slate-200">
      {menu.map(item => (
        <button
          key={item.id}
          onClick={() => setActive(item.id)}
          className={`flex items-center gap-2 w-full px-4 py-3 text-left ${active===item.id ? 'bg-teal-100 text-teal-800' : 'text-slate-700 hover:bg-teal-50'} transition`}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

const TEAL = '#1D9E75';

// ── Sidebar items ──


// ── Reusable section header ──
const SectionHeader = ({ title }) => (
  <div style={{
    background: `linear-gradient(135deg, ${TEAL}, #0F6E56)`,
    borderRadius: '12px 12px 0 0',
    padding: '16px 24px',
  }}>
    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', fontWeight: 700, fontFamily: "var(--font-family, 'Nunito'), sans-serif" }}>
      {title}
    </h3>
  </div>
);

// ── Password input with eye toggle ──
function PasswordInput({ placeholder, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', marginBottom: 12 }}>
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          width: '100%', padding: '12px 48px 12px 16px',
          border: '1.5px solid var(--border-color, #e2e8f0)', borderRadius: 10,
          fontSize: '0.95rem', fontFamily: 'var(--font-family)',
          outline: 'none', boxSizing: 'border-box',
          transition: 'border 0.2s, background-color 0.3s, color 0.3s',
          color: 'var(--text-secondary, #334155)',
          backgroundColor: 'var(--input-bg, #f8fafc)',
        }}
        onFocus={(e) => (e.target.style.border = `1.5px solid ${TEAL}`)}
        onBlur={(e) => (e.target.style.border = '1.5px solid var(--border-color, #e2e8f0)')}
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        style={{
          position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
          background: TEAL, border: 'none', borderRadius: 6,
          width: 30, height: 30, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, color: '#fff',
        }}
      >
        {show ? '🙈' : '👁️'}
      </button>
    </div>
  );
}

// ── Save button ──
const SaveBtn = ({ label = 'Modifier', onClick, danger, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      marginTop: 8,
      padding: '10px 28px', borderRadius: 50,
      background: danger ? '#ef4444' : `linear-gradient(135deg, ${TEAL}, #0F6E56)`,
      color: '#fff', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '0.92rem', fontWeight: 700,
      fontFamily: 'var(--font-family)',
      boxShadow: danger ? '0 4px 14px #ef444455' : `0 4px 14px ${TEAL}55`,
      transition: 'opacity 0.2s, transform 0.2s',
      opacity: disabled ? 0.6 : 1,
    }}
    onMouseOver={(e) => { if (!disabled) e.currentTarget.style.opacity = 0.88; }}
    onMouseOut={(e) => { if (!disabled) e.currentTarget.style.opacity = 1; }}
  >
    {label}
  </button>
);

// ══════════════════════════════════════════
//  SECTIONS
// ══════════════════════════════════════════

function SecuritySection() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [msg, setMsg] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteStep, setDeleteStep] = useState(1);

  const handlePasswordSubmit = () => {
    if (!form.current || !form.next || !form.confirm) return setMsg({ type: 'error', text: 'Tous les champs sont obligatoires.' });
    if (form.next !== form.confirm) return setMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
    setMsg({ type: 'success', text: 'Mot de passe modifié avec succès !' });
    setForm({ current: '', next: '', confirm: '' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <SectionHeader title=" Mot de passe" />
        <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color, #e2e8f0)', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '24px' }}>
          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.9rem', marginBottom: 20, fontFamily: 'var(--font-family)' }}>
            Mettez à jour votre mot de passe pour sécuriser votre compte.
          </p>
          <PasswordInput placeholder="Mot de passe courant *" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
          <PasswordInput placeholder="Nouveau mot de passe *" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} />
          <PasswordInput placeholder="Confirmation nouveau mot de passe *" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          {msg && (
            <div style={{
              padding: '10px 16px', borderRadius: 8, marginBottom: 12,
              background: msg.type === 'error' ? 'var(--danger-bg, #fef2f2)' : 'var(--success-bg, #f0fdf4)',
              color: msg.type === 'error' ? 'var(--error-text, #ef4444)' : 'var(--success-text, #16a34a)',
              fontSize: '0.88rem', fontFamily: 'var(--font-family)',
            }}>{msg.text}</div>
          )}
          <SaveBtn label="Mettre à jour" onClick={handlePasswordSubmit} />
        </div>
      </div>

      <div>
        <SectionHeader title=" Zone de danger" />
        <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color, #e2e8f0)', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '24px' }}>
          <div style={{ background: 'var(--danger-bg, #fef2f2)', border: '1px solid var(--danger-border, #fecaca)', borderRadius: 10, padding: '16px', marginBottom: 20 }}>
            <p style={{ margin: 0, color: '#b91c1c', fontSize: '0.9rem', fontFamily: 'var(--font-family)', fontWeight: 600 }}>
              ⚠️ Cette action est irréversible. Toutes vos données seront définitivement supprimées.
            </p>
          </div>

          {deleteStep === 1 && (
            <SaveBtn label="Supprimer mon compte" danger onClick={() => setDeleteStep(2)} />
          )}

          {deleteStep === 2 && (
            <>
              <p style={{ color: 'var(--text-secondary, #334155)', fontSize: '0.9rem', marginBottom: 12, fontFamily: 'var(--font-family)' }}>
                Tapez <strong>SUPPRIMER</strong> pour confirmer :
              </p>
              <input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="SUPPRIMER"
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 10,
                  border: '1.5px solid #fca5a5', outline: 'none',
                  fontSize: '0.95rem', fontFamily: 'var(--font-family)',
                  boxSizing: 'border-box', marginBottom: 16,
                  color: 'var(--text-secondary, #334155)',
                  backgroundColor: 'var(--input-bg, #fff)',
                }}
              />
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  onClick={() => setDeleteStep(1)}
                  style={{
                    padding: '10px 20px', borderRadius: 50,
                    border: `2px solid ${TEAL}`, background: 'transparent',
                    color: TEAL, fontWeight: 700, cursor: 'pointer',
                    fontFamily: 'var(--font-family)',
                  }}
                >Annuler</button>
                <SaveBtn
                  label="Confirmer la suppression"
                  danger
                  onClick={() => deleteConfirm === 'SUPPRIMER' && alert('Compte supprimé.')}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ThemeSection() {
  const {
    theme, setTheme,
    font, setFont,
    fontSize, setFontSize,
  } = useAccessibility();

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const previewStyles = {
    light: { bg: '#f8fafc', text: '#1e293b', border: '#e2e8f0' },
    dark:  { bg: '#1e293b', text: '#f1f5f9', border: '#334155' },
    sepia: { bg: '#faf6f1', text: '#44403c', border: '#e7e0d5' },
  };

  return (
    <div>
      <SectionHeader title=" Apparence & Accessibilité" />
      <div style={{
        background: 'var(--card-bg, #fff)',
        border: '1px solid var(--border-color, #e2e8f0)',
        borderTop: 'none',
        borderRadius: '0 0 12px 12px',
        padding: '24px',
      }}>
        <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.9rem', marginBottom: 24, fontFamily: 'var(--font-family)' }}>
          Adaptez l'interface pour un confort de lecture optimal (idéal pour la dyslexie).
        </p>

        <div style={{ fontWeight: 700, color: 'var(--text-secondary, #334155)', marginBottom: 12, fontFamily: 'var(--font-family)' }}>Contraste & Thème</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { id: 'light', label: '☀️ Clair',                emoji: '☀️' },
            { id: 'dark',  label: '🌙 Sombre (Reposant)',     emoji: '🌙' },
            { id: 'sepia', label: '🟤 Sépia (Doux)',           emoji: '🟤' },
          ].map((t) => {
            const isActive = theme === t.id;
            const preview = previewStyles[t.id];
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{
                  flex: 1, minWidth: 140, padding: '14px 12px', borderRadius: 12, cursor: 'pointer',
                  border: `2.5px solid ${isActive ? TEAL : 'var(--border-color, #e2e8f0)'}`,
                  background: isActive ? `${TEAL}15` : 'var(--bg-tertiary, #f8fafc)',
                  color: isActive ? TEAL : 'var(--text-muted, #64748b)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem', fontFamily: 'var(--font-family)',
                  transition: 'all 0.25s ease',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isActive ? `0 4px 16px ${TEAL}25` : 'none',
                }}
              >
                <div style={{
                  width: '100%', height: 36, borderRadius: 6,
                  background: preview.bg, border: `1px solid ${preview.border}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', color: preview.text, fontWeight: 600,
                  transition: 'all 0.3s ease',
                }}>
                  Aa Bb
                </div>
                {t.label}
                {isActive && <span style={{ fontSize: '0.7rem', color: TEAL, fontWeight: 800 }}>✓ Actif</span>}
              </button>
            );
          })}
        </div>

        <div style={{ fontWeight: 700, color: 'var(--text-secondary, #334155)', marginBottom: 12, fontFamily: 'var(--font-family)' }}>Police de caractères</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          {[
            { id: 'hyperlegible', label: 'Atkinson Hyperlegible', sub: '(Recommandé)', style: "'Atkinson Hyperlegible', sans-serif" },
            { id: 'opendyslexic', label: 'OpenDyslexic',          sub: '(Dyslexie)',    style: "OpenDyslexic, sans-serif" },
            { id: 'arial',        label: 'Arial / Standard',       sub: '(Classique)',   style: "Arial, sans-serif" },
          ].map((f) => {
            const isActive = font === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFont(f.id)}
                style={{
                  flex: 1, padding: '14px 12px', borderRadius: 12, cursor: 'pointer', minWidth: 170,
                  border: `2.5px solid ${isActive ? TEAL : 'var(--border-color, #e2e8f0)'}`,
                  background: isActive ? `${TEAL}15` : 'var(--bg-tertiary, #f8fafc)',
                  color: isActive ? TEAL : 'var(--text-muted, #64748b)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.95rem', fontFamily: f.style,
                  transition: 'all 0.25s ease',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isActive ? `0 4px 16px ${TEAL}25` : 'none',
                }}
              >
                <span>{f.label}</span>
                <span style={{ fontSize: '0.72rem', opacity: 0.7, fontFamily: f.style }}>{f.sub}</span>
                {isActive && <span style={{ fontSize: '0.7rem', color: TEAL, fontWeight: 800, marginTop: 2 }}>✓ Actif</span>}
              </button>
            );
          })}
        </div>

        <div style={{ fontWeight: 700, color: 'var(--text-secondary, #334155)', marginBottom: 12, fontFamily: 'var(--font-family)' }}>Taille du texte</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {[
            { id: 'small',  label: 'A-',  desc: 'Petit',    size: '0.85rem' },
            { id: 'medium', label: 'A',   desc: 'Normal',   size: '1rem' },
            { id: 'large',  label: 'A+',  desc: 'Grand',    size: '1.2rem' },
            { id: 'xlarge', label: 'A++', desc: 'Très grand', size: '1.4rem' },
          ].map((s) => {
            const isActive = fontSize === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setFontSize(s.id)}
                style={{
                  flex: 1, padding: '14px 8px', borderRadius: 12, cursor: 'pointer',
                  border: `2.5px solid ${isActive ? TEAL : 'var(--border-color, #e2e8f0)'}`,
                  background: isActive ? `${TEAL}15` : 'var(--bg-tertiary, #f8fafc)',
                  color: isActive ? TEAL : 'var(--text-muted, #64748b)',
                  fontWeight: 700,
                  fontSize: s.size, fontFamily: 'var(--font-family)',
                  transition: 'all 0.25s ease',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isActive ? `0 4px 16px ${TEAL}25` : 'none',
                }}
              >
                {s.label}
                <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>{s.desc}</span>
              </button>
            );
          })}
        </div>

        <div style={{
          padding: '16px 20px', borderRadius: 12,
          border: `2px dashed var(--border-color, #e2e8f0)`,
          background: 'var(--bg-tertiary, #f1f5f9)',
          marginBottom: 24,
          transition: 'all 0.3s ease',
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: TEAL, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🔍 Aperçu en direct
          </div>
          <p style={{
            margin: 0,
            fontFamily: 'var(--font-family)',
            fontSize: 'var(--font-size-base)',
            color: 'var(--text-primary)',
            lineHeight: 1.7,
          }}>
            Bonjour ! Ceci est un texte d'exemple pour voir comment l'interface s'adapte à vos préférences d'accessibilité. 
            Les lettres <strong>b, d, p, q</strong> sont souvent confondues par les personnes dyslexiques.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <SaveBtn
            label={saved ? '✓ Préférences enregistrées !' : 'Enregistrer les préférences'}
            onClick={handleSave}
            disabled={saved}
          />
          <button
            onClick={() => {
              setTheme('light');
              setFont('hyperlegible');
              setFontSize('medium');
            }}
            style={{
              marginTop: 8, padding: '10px 20px', borderRadius: 50,
              border: `2px solid var(--border-color, #e2e8f0)`,
              background: 'transparent',
              color: 'var(--text-muted, #64748b)',
              fontSize: '0.88rem', fontWeight: 600,
              fontFamily: 'var(--font-family)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = TEAL; e.currentTarget.style.color = TEAL; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color, #e2e8f0)'; e.currentTarget.style.color = 'var(--text-muted, #64748b)'; }}
          >
            Réinitialiser
          </button>
        </div>

        {saved && (
          <div style={{
            marginTop: 12, padding: '10px 16px', borderRadius: 8,
            background: 'var(--success-bg, #f0fdf4)',
            color: 'var(--success-text, #16a34a)',
            fontSize: '0.88rem', fontFamily: 'var(--font-family)',
            animation: 'fadeIn 0.3s ease-out',
          }}>
            ✅ Vos préférences d'accessibilité ont été enregistrées et appliquées avec succès.
          </div>
        )}
      </div>
    </div>
  );
}

// ── ExamSection component for élèves ──
function ExamSection() {
  const navigate = useNavigate();
  const savedUser = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();
  const [showExamModal, setShowExamModal] = useState(false);
  const [examDuration, setExamDuration] = useState(60);
  const [examModalError, setExamModalError] = useState('');
  const [examLoading, setExamLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleStartExam = async () => {
    if (!savedUser?.id) return;
    if (!examDuration || examDuration < 1) {
      setExamModalError('Veuillez entrer une durée valide');
      return;
    }
    setExamLoading(true);
    setExamModalError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND}/eleves/${savedUser.id}/exam/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ duration: Number(examDuration) }),
      });
      if (!res.ok) throw new Error('Erreur lors du démarrage de l\'examen');
      const data = await res.json();
      localStorage.setItem('examEndTime', data.examEndTime);
      localStorage.setItem('examInProgress', 'true');
      const u = { ...savedUser, ...data };
      localStorage.setItem('user', JSON.stringify(u));
      setShowExamModal(false);
      navigate('/exam-mode');
    } catch (err) {
      setExamModalError(err.message);
    } finally {
      setExamLoading(false);
    }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <SectionHeader title="Mode Examen (élève)" />
      <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border-color, #e2e8f0)', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '18px' }}>
        <p style={{ margin: 0, color: 'var(--text-muted, #64748b)', fontSize: '0.9rem', fontFamily: 'var(--font-family)' }}>{'Démarrer une session d\'examen (éditeur en lecture seule).'}</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' }}>
          <button onClick={() => setShowExamModal(true)} style={{ padding: '10px 16px', borderRadius: 10, background: TEAL, color: '#fff', border: 'none', cursor: 'pointer' }} disabled={examLoading}>Mode Examen</button>
          <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{savedUser?.examEndTime ? 'Examen en cours' : 'Aucun examen actif'}</span>
        </div>
      </div>

      {showExamModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
          <div style={{ width: 480, background: '#fff', borderRadius: 12, padding: 20 }}>
            <h3 style={{ marginTop: 0 }}>Démarrer le mode examen</h3>
            <p style={{ color: '#374151', marginBottom: 12 }}>Entrez la durée en minutes (1 - 480)</p>
            <input type="number" min={1} max={480} value={examDuration} onChange={(e) => setExamDuration(Number(e.target.value))} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 8 }} />
            {examModalError && <div style={{ color: '#dc2626', marginBottom: 8 }}>{examModalError}</div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowExamModal(false)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'transparent' }}>Annuler</button>
              <button onClick={handleStartExam} disabled={examLoading} style={{ padding: '8px 14px', borderRadius: 8, background: TEAL, color: '#fff', border: 'none' }}>{examLoading ? '...' : 'Démarrer'}</button>
            </div>
          </div>
        </div>
      )}

      {saved && (
        <div style={{ marginTop: 12, padding: '10px 16px', borderRadius: 8, background: 'var(--success-bg, #f0fdf4)', color: 'var(--success-text, #16a34a)', fontSize: '0.88rem', fontFamily: 'var(--font-family)', animation: 'fadeIn 0.3s ease-out' }}>
          ✅ Vos préférences d'accessibilité ont été enregistrées et appliquées avec succès.
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════
//  PAGE PRINCIPALE
// ══════════════════════════════════════════
export default function SettingsPage() {
  const [active, setActive] = useState('theme');
  const navigate = useNavigate();

  // Determine saved user to adapt the settings menu (show exam only for élèves)
  const savedUser = (() => { try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; } })();

  const MENU = [
    { id: 'theme', label: 'Apparence & Accessibilité', icon: '👁️' },
    { id: 'security', label: 'Sécurité & Accès', icon: '🔒' },
  ];
  if (savedUser?.typeCompte === 'eleve') {
    MENU.push({ id: 'exam', label: 'Mode Examen', icon: '⏱️' });
  }

  const renderSection = () => {
    switch (active) {
      case 'theme':    return <ThemeSection />;
      case 'security': return <SecuritySection />;
      case 'exam':    return <ExamSection />;
      default:         return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary, #f8fafc)',
      fontFamily: 'var(--font-family)',
      padding: '40px 24px',
      transition: 'background-color 0.3s ease, color 0.3s ease',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* Back button + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 50,
              border: `2px solid ${TEAL}`, background: 'transparent',
              color: TEAL, fontWeight: 700, cursor: 'pointer',
              fontSize: '0.9rem', fontFamily: 'var(--font-family)',
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = TEAL; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEAL; }}
          >
            ← 
          </button>
          <h1 style={{
            fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary, #1e293b)',
            margin: 0, letterSpacing: '-0.5px',
            fontFamily: 'var(--font-family)',
          }}>
            MES PARAMÈTRES
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>

          {/* ── Sidebar ── */}
          <div style={{
            width: window.innerWidth < 768 ? '100%' : 260, flexShrink: 0,
            background: 'var(--card-bg, #fff)', borderRadius: 14,
            border: '1px solid var(--border-color, #e2e8f0)',
            overflow: 'hidden',
            boxShadow: '0 2px 12px var(--shadow-color, rgba(0,0,0,0.05))',
          }}>
            {MENU.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                style={{
                  width: '100%', padding: '15px 20px',
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: active === item.id ? TEAL : 'none',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  fontSize: '0.95rem',
                  fontWeight: active === item.id ? 800 : 600,
                  color: active === item.id ? '#fff' : 'var(--text-secondary, #334155)',
                  fontFamily: 'var(--font-family)',
                  transition: 'all 0.2s',
                  borderBottom: '1px solid var(--border-light, #f1f5f9)',
                }}
                onMouseOver={(e) => { if (active !== item.id) e.currentTarget.style.background = 'var(--bg-tertiary, #f8fafc)'; }}
                onMouseOut={(e) => { if (active !== item.id) e.currentTarget.style.background = 'none'; }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* ── Content ── */}
          <div style={{ flex: 1, width: '100%' }}>
            <div className="fade-in-section">
              {renderSection()}
            </div>
          </div>

        </div>
      </div>
      <style>{`
        .fade-in-section {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}