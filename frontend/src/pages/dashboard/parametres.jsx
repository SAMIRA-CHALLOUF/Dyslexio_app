import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { colors } from '../../styles/dashboardStyles';
import { useAccessibility } from '../../context/AccessibilityContext';

const DEFAULTS = {
  nomEtablissement: 'Mon établissement',
  email: '',
  telephone: '',
  adresse: '',
  montantDefaut: '500',
  delaiPaiement: '30',
};

const P = colors.primary; // #0D9373

// ── Sous-composants ──────────────────────────────────────────────────────────

const SectionCard = ({ title, icon, children }) => (
  <div style={{
    background: '#fff',
    border: `1px solid ${colors.border}`,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  }}>
    <div style={{
      padding: '16px 24px',
      borderBottom: `1px solid ${colors.border}`,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      <span style={{ fontWeight: 600, fontSize: 15, color: colors.text }}>{title}</span>
    </div>
    <div style={{ padding: 24 }}>
      {children}
    </div>
  </div>
);

const Field = ({ label, value, onChange, type = 'text' }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: colors.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      style={{
        width: '100%',
        padding: '10px 14px',
        borderRadius: 10,
        border: `1.5px solid ${colors.border}`,
        fontSize: 14,
        color: colors.text,
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
        background: '#fafafa',
      }}
      onFocus={e => e.target.style.borderColor = P}
      onBlur={e => e.target.style.borderColor = colors.border}
    />
  </div>
);

const ChoiceBtn = ({ active, onClick, children, style = {} }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      flex: 1,
      padding: '10px 8px',
      borderRadius: 10,
      cursor: 'pointer',
      border: `2px solid ${active ? P : colors.border}`,
      background: active ? `${P}12` : '#fafafa',
      color: active ? P : colors.muted,
      fontWeight: active ? 600 : 400,
      fontSize: 13,
      transition: 'all 0.15s',
      ...style,
    }}
  >
    {children}
  </button>
);

// ── Page principale ───────────────────────────────────────────────────────────

export default function Parametres() {
  const [params, setParams] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const { theme, setTheme, font, setFont, fontSize, setFontSize } = useAccessibility();

  useEffect(() => {
    try {
      const raw = localStorage.getItem('lexiaide_parametres');
      if (raw) setParams({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);

  const set = (k) => (e) => setParams((p) => ({ ...p, [k]: e.target.value }));

  const save = (e) => {
    e.preventDefault();
    localStorage.setItem('lexiaide_parametres', JSON.stringify(params));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const themes = [
    { id: 'light', label: 'Clair',  icon: '☀️', bg: '#f8fafc', border: '#e2e8f0' },
    { id: 'dark',  label: 'Sombre', icon: '🌙', bg: '#1e293b', border: '#334155' },
    { id: 'sepia', label: 'Sépia',  icon: '🟤', bg: '#faf6f1', border: '#e7e0d5' },
  ];

  const fonts = [
    { id: 'hyperlegible', label: 'Atkinson',     family: "'Atkinson Hyperlegible', sans-serif" },
    { id: 'opendyslexic', label: 'OpenDyslexic', family: 'OpenDyslexic, sans-serif' },
    { id: 'arial',        label: 'Arial',        family: 'Arial, sans-serif' },
  ];

  const sizes = [
    { id: 'small',  label: 'A',   size: '13px' },
    { id: 'medium', label: 'A',   size: '15px' },
    { id: 'large',  label: 'A',   size: '18px' },
    { id: 'xlarge', label: 'A',   size: '22px' },
  ];

  return (
    <DashboardLayout>
      {/* ── En-tête ── */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: colors.text }}>Paramètres</h1>
        <p style={{ margin: '4px 0 0', color: colors.muted, fontSize: 13 }}>
          Gérez les informations de votre établissement et vos préférences d'affichage
        </p>
      </div>

      <div style={{ maxWidth: 640 }}>

        {/* ── Informations générales ── */}
        <SectionCard title="Informations générales" icon="🏫">
          <form onSubmit={save}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Nom de l'établissement" value={params.nomEtablissement} onChange={set('nomEtablissement')} />
              </div>
              <Field label="Email" value={params.email} onChange={set('email')} type="email" />
              <Field label="Téléphone" value={params.telephone} onChange={set('telephone')} />
              <div style={{ gridColumn: '1 / -1' }}>
                <Field label="Adresse" value={params.adresse} onChange={set('adresse')} />
              </div>
              <Field label="Montant par défaut ($)" value={params.montantDefaut} onChange={set('montantDefaut')} type="number" />
              <Field label="Délai paiement (jours)" value={params.delaiPaiement} onChange={set('delaiPaiement')} type="number" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
              <button
                type="submit"
                style={{
                  background: P,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 24px',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={e => e.target.style.opacity = '0.85'}
                onMouseLeave={e => e.target.style.opacity = '1'}
              >
                Enregistrer
              </button>
              {saved && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: colors.green, fontSize: 13, fontWeight: 500 }}>
                  <span style={{ fontSize: 16 }}>✓</span> Modifications enregistrées
                </span>
              )}
            </div>
          </form>
        </SectionCard>

        {/* ── Thème ── */}
        <SectionCard title="Thème d'affichage" icon="🎨">
          <div style={{ display: 'flex', gap: 10 }}>
            {themes.map(t => (
              <ChoiceBtn key={t.id} active={theme === t.id} onClick={() => setTheme(t.id)}>
                <div style={{ width: '100%', height: 28, borderRadius: 6, background: t.bg, border: `1px solid ${t.border}`, marginBottom: 8 }} />
                <span>{t.icon} {t.label}</span>
              </ChoiceBtn>
            ))}
          </div>
        </SectionCard>

        {/* ── Police ── */}
        <SectionCard title="Police de caractères" icon="🔤">
          <div style={{ display: 'flex', gap: 10 }}>
            {fonts.map(f => (
              <ChoiceBtn key={f.id} active={font === f.id} onClick={() => setFont(f.id)} style={{ fontFamily: f.family }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>Aa</div>
                <div style={{ fontSize: 12 }}>{f.label}</div>
              </ChoiceBtn>
            ))}
          </div>
        </SectionCard>

        {/* ── Taille du texte ── */}
        <SectionCard title="Taille du texte" icon="📐">
          <div style={{ display: 'flex', gap: 10 }}>
            {sizes.map(s => (
              <ChoiceBtn key={s.id} active={fontSize === s.id} onClick={() => setFontSize(s.id)}>
                <span style={{ fontSize: s.size, fontWeight: 600, lineHeight: 1 }}>{s.label}</span>
                <div style={{ fontSize: 11, marginTop: 4, color: colors.muted }}>{s.size}</div>
              </ChoiceBtn>
            ))}
          </div>
          <p style={{ fontSize: 12, color: colors.muted, margin: '14px 0 0' }}>
            Les préférences s'appliquent automatiquement à tout le site.
          </p>
        </SectionCard>

      </div>
    </DashboardLayout>
  );
}
