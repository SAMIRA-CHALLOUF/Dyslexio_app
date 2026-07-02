export const colors = {
  primary: '#0D9373',
  primaryLight: '#E1F5EE',
  green: '#16a34a',
  greenLight: '#dcfce7',
  amber: '#d97706',
  amberLight: '#fef3c7',
  teal: '#0D9373',
  tealLight: '#ccfbf1',
  danger: '#ef4444',
  muted: '#94a3b8',
  text: '#0f172a',
  border: '#e2e8f0',
  bg: '#f8fafc',
};

export const layout = {
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 12,
  },
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 14,
  },
  card: {
    background: '#fff',
    borderRadius: 14,
    border: `1px solid ${colors.border}`,
    boxShadow: '0 1px 4px #0001',
  },
  statCard: {
    padding: '16px 18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: { fontSize: 12, color: colors.muted, marginBottom: 4 },
  statValue: { fontWeight: 800, color: colors.text },
  th: {
    padding: '10px 14px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 700,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: '.04em',
    borderBottom: `1px solid ${colors.border}`,
    background: colors.bg,
  },
  td: {
    padding: '12px 14px',
    borderBottom: `1px solid ${colors.border}`,
    verticalAlign: 'middle',
  },
  btn: (variant = 'primary') => ({
    padding: '10px 18px',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    border: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    ...(variant === 'primary'
      ? { background: colors.primary, color: '#fff' }
      : variant === 'danger'
        ? { background: colors.danger, color: '#fff' }
        : { background: '#fff', color: colors.text, border: `1.5px solid ${colors.border}` }),
  }),
  badge: (tone) => {
    const map = {
      green: { bg: colors.greenLight, fg: colors.green },
      amber: { bg: colors.amberLight, fg: colors.amber },
      coral: { bg: '#fef2f2', fg: colors.danger },
      muted: { bg: colors.bg, fg: colors.muted },
    };
    const c = map[tone] || map.muted;
    return {
      background: c.bg,
      color: c.fg,
      padding: '3px 10px',
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
    };
  },
};

export const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export function authHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
