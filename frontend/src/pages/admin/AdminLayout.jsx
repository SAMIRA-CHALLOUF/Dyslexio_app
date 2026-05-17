import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import SidebarNav from './components/SidebarNav';

const TEAL       = '#1D9E75';
const TEAL_LIGHT = '#E1F5EE';
const DARK       = '#1A1A2E';
const CREAM      = '#FDFBF5';

export const NAV_ITEMS = [
  { label: 'Dashboard',     icon: '📊', path: '/admin',               end: true },
  {
    label: 'Utilisateurs',  icon: '👥', path: '/admin/users',
    children: [
      { label: 'Clients',        path: '/admin/users?type=client' },
      { label: 'Élèves',         path: '/admin/users?type=eleve' },
      { label: 'Établissements', path: '/admin/users?type=etablissement' },
    ],
  },
  { label: 'Abonnements',   icon: '💳', path: '/admin/subscriptions' },
  { label: 'Statistiques',  icon: '📈', path: '/admin/statistics' },
  { label: 'Paramètres',    icon: '⚙️', path: '/admin/settings' },
];

// ✅ Reçoit user et onLogout directement depuis App.js (plus de useAuth)
const AdminLayout = ({ user, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: CREAM,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      {/* Sidebar */}
      <SidebarNav
        items={NAV_ITEMS}
        open={sidebarOpen}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Topbar */}
        <header style={{
          height: 64,
          background: '#fff',
          borderBottom: '1px solid #EBEBEB',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 16,
          flexShrink: 0,
        }}>
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 20, color: '#888', padding: 4,
              lineHeight: 1, borderRadius: 6, transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#F5F5F5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
          >☰</button>

          <div style={{ flex: 1 }} />

          {/* Notification bell */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <span style={{ fontSize: 20 }}>🔔</span>
            <span style={{
              position: 'absolute', top: -4, right: -4,
              background: TEAL, color: '#fff',
              fontSize: 9, fontWeight: 700,
              borderRadius: 10, padding: '1px 5px', lineHeight: '14px',
            }}>3</span>
          </div>

          {/* Avatar */}
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: TEAL_LIGHT,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: TEAL, fontWeight: 700, fontSize: 13, cursor: 'pointer',
          }}>
            {user?.nom?.[0]?.toUpperCase() || 'A'}
          </div>
        </header>

        {/* Page content — Outlet affiche le composant enfant (Dashboard, Users...) */}
        <main style={{ flex: 1, overflow: 'auto', padding: '32px 32px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;