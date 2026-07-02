import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { colors } from '../../styles/dashboardStyles';

const NAV = [
  { to: '/dashboard', label: 'Vue d ensemble', end: true },
  { to: '/dashboard/eleves', label: 'Eleves' },
  { to: '/dashboard/paiements', label: 'Paiements' },
  { to: '/dashboard/parametres', label: 'Parametres' },
];

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#FDFBF5', fontFamily: "'Nunito', sans-serif" }}>
      <aside style={{
        width: 240,
        background: '#fff',
        borderRight: `1px solid ${colors.border}`,
        padding: '24px 16px',
        flexShrink: 0,
      }}>
        <div style={{ fontWeight: 900, fontSize: 18, color: colors.primary, marginBottom: 8 }}>
          Lexiaide Ecole
        </div>
        <p style={{ fontSize: 12, color: colors.muted, margin: '0 0 24px' }}>
          {user.prenom} {user.nom}
        </p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                padding: '10px 14px',
                borderRadius: 10,
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600,
                color: isActive ? colors.primary : colors.text,
                background: isActive ? colors.primaryLight : 'transparent',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={logout}
          style={{
            marginTop: 32,
            width: '100%',
            padding: '10px',
            borderRadius: 10,
            border: `1px solid ${colors.border}`,
            background: '#fff',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Deconnexion
        </button>
      </aside>
      <main style={{ flex: 1, padding: '28px 32px', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}