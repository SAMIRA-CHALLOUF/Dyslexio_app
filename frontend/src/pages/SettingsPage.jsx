// src/pages/Settings/SettingsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TEAL = '#1A9E7E';

// ── Sidebar items ──
const MENU = [
  { id: 'password', label: 'Mot de passe' },
  { id: 'security', label: 'Sécurité' },
  { id: 'notifs',   label: 'Notifications' },
  { id: 'theme',    label: 'Thème' },
  { id: 'delete',   label: 'Supprimer le compte' },
];

// ── Reusable section header ──
const SectionHeader = ({ title }) => (
  <div style={{
    background: `linear-gradient(135deg, ${TEAL}, #0F6E56)`,
    borderRadius: '12px 12px 0 0',
    padding: '16px 24px',
  }}>
    <h3 style={{ margin: 0, color: '#fff', fontSize: '1.05rem', fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
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
          border: '1.5px solid #e2e8f0', borderRadius: 10,
          fontSize: '0.95rem', fontFamily: "'Nunito', sans-serif",
          outline: 'none', boxSizing: 'border-box',
          transition: 'border 0.2s',
          color: '#334155',
        }}
        onFocus={(e) => (e.target.style.border = `1.5px solid ${TEAL}`)}
        onBlur={(e) => (e.target.style.border = '1.5px solid #e2e8f0')}
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

// ── Toggle switch ──
function Toggle({ checked, onChange, label, sublabel }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div>
        <div style={{ fontWeight: 600, color: '#334155', fontSize: '0.95rem', fontFamily: "'Nunito', sans-serif" }}>{label}</div>
        {sublabel && <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: 2 }}>{sublabel}</div>}
      </div>
      <div
        onClick={onChange}
        style={{
          width: 52, height: 28, borderRadius: 14, cursor: 'pointer',
          background: checked ? TEAL : '#cbd5e1',
          position: 'relative', transition: 'background 0.3s',
          flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: 3,
          left: checked ? 27 : 3,
          width: 22, height: 22, borderRadius: '50%',
          background: '#fff', transition: 'left 0.3s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        }} />
      </div>
    </div>
  );
}

// ── Save button ──
const SaveBtn = ({ label = 'Modifier', onClick, danger }) => (
  <button
    onClick={onClick}
    style={{
      marginTop: 8,
      padding: '10px 28px', borderRadius: 50,
      background: danger ? '#ef4444' : `linear-gradient(135deg, ${TEAL}, #0F6E56)`,
      color: '#fff', border: 'none', cursor: 'pointer',
      fontSize: '0.92rem', fontWeight: 700,
      fontFamily: "'Nunito', sans-serif",
      boxShadow: danger ? '0 4px 14px #ef444455' : `0 4px 14px ${TEAL}55`,
      transition: 'opacity 0.2s',
    }}
    onMouseOver={(e) => (e.currentTarget.style.opacity = 0.88)}
    onMouseOut={(e) => (e.currentTarget.style.opacity = 1)}
  >
    {label}
  </button>
);

// ══════════════════════════════════════════
//  SECTIONS
// ══════════════════════════════════════════

function PasswordSection() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [msg, setMsg] = useState(null);

  const handleSubmit = () => {
    if (!form.current || !form.next || !form.confirm) return setMsg({ type: 'error', text: 'Tous les champs sont obligatoires.' });
    if (form.next !== form.confirm) return setMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
    setMsg({ type: 'success', text: 'Mot de passe modifié avec succès !' });
    setForm({ current: '', next: '', confirm: '' });
  };

  return (
    <div>
      <SectionHeader title=" Modifier le mot de passe" />
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '24px' }}>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 20, fontFamily: "'Nunito', sans-serif" }}>
          Entrez votre mot de passe courant et sélectionnez un nouveau mot de passe.
        </p>
        <PasswordInput placeholder="Mot de passe courant *" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
        <PasswordInput placeholder="Nouveau mot de passe *" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} />
        <PasswordInput placeholder="Confirmation nouveau mot de passe *" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        {msg && (
          <div style={{
            padding: '10px 16px', borderRadius: 8, marginBottom: 12,
            background: msg.type === 'error' ? '#fef2f2' : '#f0fdf4',
            color: msg.type === 'error' ? '#ef4444' : '#16a34a',
            fontSize: '0.88rem', fontFamily: "'Nunito', sans-serif",
          }}>{msg.text}</div>
        )}
        <SaveBtn onClick={handleSubmit} />
      </div>
    </div>
  );
}

function SecuritySection() {
  const [twoFA, setTwoFA] = useState(false);
  const [sessions, setSessions] = useState(true);

  return (
    <div>
      <SectionHeader title=" Sécurité" />
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '24px' }}>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 4, fontFamily: "'Nunito', sans-serif" }}>
          Gérez les paramètres de sécurité de votre compte.
        </p>
        <Toggle
          checked={twoFA}
          onChange={() => setTwoFA(!twoFA)}
          label="Vérification en deux étapes"
          sublabel="Ajoutez une couche de sécurité supplémentaire à votre compte."
        />
        <Toggle
          checked={sessions}
          onChange={() => setSessions(!sessions)}
          label="Déconnecter les autres sessions"
          sublabel="Déconnectez tous les appareils sauf celui-ci."
        />
        <div style={{ marginTop: 20, padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155', marginBottom: 8, fontFamily: "'Nunito', sans-serif" }}>
            🖥️ Sessions actives
          </div>
          {[
            { device: 'Chrome — Windows', location: 'Sfax, Tunisie', current: true },
            { device: 'Safari — iPhone', location: 'Tunis, Tunisie', current: false },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i === 0 ? '1px solid #e2e8f0' : 'none' }}>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155', fontFamily: "'Nunito', sans-serif" }}>{s.device}</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{s.location}</div>
              </div>
              {s.current
                ? <span style={{ fontSize: '0.75rem', background: `${TEAL}15`, color: TEAL, padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>Session actuelle</span>
                : <button style={{ fontSize: '0.78rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Révoquer</button>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function NotifsSection() {
  const [notifs, setNotifs] = useState({
    email: true, push: false, updates: true, tips: false, newsletter: true,
  });
  const toggle = (k) => setNotifs({ ...notifs, [k]: !notifs[k] });

  return (
    <div>
      <SectionHeader title=" Notifications" />
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '24px' }}>
        <Toggle checked={notifs.email}      onChange={() => toggle('email')}      label="Notifications par email"       sublabel="Recevez des alertes importantes par email." />
        <Toggle checked={notifs.push}       onChange={() => toggle('push')}       label="Notifications push"            sublabel="Activez les notifications dans le navigateur." />
        <Toggle checked={notifs.updates}    onChange={() => toggle('updates')}    label="Mises à jour du produit"       sublabel="Soyez informé des nouvelles fonctionnalités." />
        <Toggle checked={notifs.tips}       onChange={() => toggle('tips')}       label="Conseils & astuces"            sublabel="Des conseils pour mieux utiliser l'application." />
        <Toggle checked={notifs.newsletter} onChange={() => toggle('newsletter')} label="Newsletter mensuelle"          sublabel="Recevez notre résumé mensuel." />
        <SaveBtn label="Enregistrer les préférences" />
      </div>
    </div>
  );
}

function ThemeSection() {
  const [theme, setTheme] = useState('light');
  const [accent, setAccent] = useState(TEAL);
  const ACCENTS = ['#1A9E7E', '#3b82f6', '#8b5cf6', '#f97316', '#ec4899'];

  return (
    <div>
      <SectionHeader title=" Thème & Apparence" />
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '24px' }}>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 20, fontFamily: "'Nunito', sans-serif" }}>
          Personnalisez l'apparence de l'application.
        </p>

        {/* Mode clair/sombre */}
        <div style={{ fontWeight: 700, color: '#334155', marginBottom: 12, fontFamily: "'Nunito', sans-serif" }}>Mode d'affichage</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {[
            { id: 'light', label: '☀️ Clair' },
            { id: 'dark',  label: '🌙 Sombre' },
            { id: 'auto',  label: '⚙️ Automatique' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              style={{
                flex: 1, padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
                border: `2px solid ${theme === t.id ? TEAL : '#e2e8f0'}`,
                background: theme === t.id ? `${TEAL}10` : '#f8fafc',
                color: theme === t.id ? TEAL : '#64748b',
                fontWeight: theme === t.id ? 700 : 500,
                fontSize: '0.88rem', fontFamily: "'Nunito', sans-serif",
                transition: 'all 0.2s',
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Couleur d'accent */}
        <div style={{ fontWeight: 700, color: '#334155', marginBottom: 12, fontFamily: "'Nunito', sans-serif" }}>Couleur principale</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
          {ACCENTS.map((c) => (
            <div
              key={c}
              onClick={() => setAccent(c)}
              style={{
                width: 36, height: 36, borderRadius: '50%', background: c, cursor: 'pointer',
                border: accent === c ? `3px solid #334155` : '3px solid transparent',
                boxSizing: 'border-box', transition: 'border 0.2s',
                boxShadow: `0 2px 8px ${c}66`,
              }}
            />
          ))}
        </div>

        <SaveBtn label="Appliquer le thème" />
      </div>
    </div>
  );
}

function DeleteSection() {
  const [confirm, setConfirm] = useState('');
  const [step, setStep] = useState(1);

  return (
    <div>
      <SectionHeader title="Supprimer le compte" />
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '24px' }}>
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '16px', marginBottom: 20 }}>
          <p style={{ margin: 0, color: '#b91c1c', fontSize: '0.9rem', fontFamily: "'Nunito', sans-serif", fontWeight: 600 }}>
            ⚠️ Cette action est irréversible. Toutes vos données seront définitivement supprimées.
          </p>
        </div>

        {step === 1 && (
          <>
            <p style={{ color: '#64748b', fontSize: '0.9rem', fontFamily: "'Nunito', sans-serif" }}>
              Avant de supprimer votre compte, veuillez noter que :
            </p>
            <ul style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.8, fontFamily: "'Nunito', sans-serif" }}>
              <li>Tous vos documents et données seront supprimés</li>
              <li>Votre abonnement sera annulé immédiatement</li>
              <li>Vous ne pourrez pas récupérer votre compte</li>
            </ul>
            <SaveBtn label="Je comprends, continuer" danger onClick={() => setStep(2)} />
          </>
        )}

        {step === 2 && (
          <>
            <p style={{ color: '#334155', fontSize: '0.9rem', marginBottom: 12, fontFamily: "'Nunito', sans-serif" }}>
              Tapez <strong>SUPPRIMER</strong> pour confirmer la suppression :
            </p>
            <input
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="SUPPRIMER"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                border: '1.5px solid #fca5a5', outline: 'none',
                fontSize: '0.95rem', fontFamily: "'Nunito', sans-serif",
                boxSizing: 'border-box', marginBottom: 16, color: '#334155',
              }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: '10px 20px', borderRadius: 50,
                  border: `2px solid ${TEAL}`, background: 'transparent',
                  color: TEAL, fontWeight: 700, cursor: 'pointer',
                  fontFamily: "'Nunito', sans-serif",
                }}
              >Annuler</button>
              <SaveBtn
                label="Supprimer définitivement"
                danger
                onClick={() => confirm === 'SUPPRIMER' && alert('Compte supprimé.')}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════
//  PAGE PRINCIPALE
// ══════════════════════════════════════════
export default function SettingsPage() {
  const [active, setActive] = useState('password');
  const navigate = useNavigate();

  const renderSection = () => {
    switch (active) {
      case 'password': return <PasswordSection />;
      case 'security': return <SecuritySection />;
      case 'notifs':   return <NotifsSection />;
      case 'theme':    return <ThemeSection />;
      case 'delete':   return <DeleteSection />;
      default:         return null;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Nunito', sans-serif", padding: '40px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Back button + Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 50,
              border: `2px solid ${TEAL}`, background: 'transparent',
              color: TEAL, fontWeight: 700, cursor: 'pointer',
              fontSize: '0.9rem', fontFamily: "'Nunito', sans-serif",
              transition: 'all 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = TEAL; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEAL; }}
          >
            ← 
          </button>
          <h1 style={{
            fontSize: '2rem', fontWeight: 800, color: '#1e293b',
            margin: 0, letterSpacing: '-0.5px',
            fontFamily: "'Nunito', sans-serif",
          }}>
            MES PARAMÈTRES
          </h1>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>

          {/* ── Sidebar ── */}
          <div style={{
            width: 230, flexShrink: 0,
            background: '#fff', borderRadius: 14,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
          }}>
            {MENU.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                style={{
                  width: '100%', padding: '15px 20px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: active === item.id ? TEAL : 'none',
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  fontSize: '0.95rem',
                  fontWeight: active === item.id ? 700 : 500,
                  color: active === item.id ? '#fff' : '#334155',
                  fontFamily: "'Nunito', sans-serif",
                  transition: 'all 0.2s',
                  borderBottom: '1px solid #f1f5f9',
                }}
                onMouseOver={(e) => { if (active !== item.id) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseOut={(e) => { if (active !== item.id) e.currentTarget.style.background = 'none'; }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* ── Content ── */}
          <div style={{ flex: 1 }}>
            {renderSection()}
          </div>

        </div>
      </div>
    </div>
  );
}