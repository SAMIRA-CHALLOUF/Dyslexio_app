import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const TEAL       = '#1D9E75';
const TEAL_LIGHT = '#E1F5EE';
const DARK       = '#1A1A2E';

const SidebarNav = ({ items = [], open = true, user, onLogout }) => {
  const [expandedPath, setExpandedPath] = useState(null);
  const navigate = useNavigate();

  return (
    <aside
      style={{
        width: open ? 260 : 72,
        background: DARK,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        overflow: 'hidden',
        flexShrink: 0,
        zIndex: 100,
      }}
    >
      {/* ── Logo ── */}
      <div
        style={{
          padding: '24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          minHeight: 72,
        }}
      >
        <div
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: TEAL,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, fontSize: 18, fontWeight: 700, color: '#fff',
          }}
        >
          L
        </div>
        {open && (
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: 0.3 }}>
              Logo Pédie
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 1 }}>
              Admin Panel
            </div>
          </div>
        )}
      </div>

      {/* ── Profil Admin ── */}
      <div
        style={{
          padding: open ? '16px 20px' : '16px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          justifyContent: open ? 'flex-start' : 'center',
        }}
      >
        {/* Avatar cercle avec initiale */}
        <div
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            border: '2px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 16,
            flexShrink: 0,
          }}
        >
          {user?.nom?.[0]?.toUpperCase() || 'A'}
        </div>

        {open && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{
              color: '#fff', fontSize: 14, fontWeight: 600,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {user?.nom ? `${user.prenom || ''} ${user.nom}`.trim() : 'Admin'}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>
              Administrateur
            </div>
          </div>
        )}
      </div>

      {/* ── Nav items ── */}
      <nav style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {items.map((item) => {
          const isExpanded = expandedPath === item.path;

          return (
            <div key={item.path}>
              <NavLink
                to={item.path}
                end={item.end}
                onClick={() => {
                  if (item.children) {
                    setExpandedPath(isExpanded ? null : item.path);
                  }
                }}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 10, marginBottom: 4,
                  textDecoration: 'none',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                  background: isActive ? TEAL : 'transparent',
                  transition: 'all 0.15s', cursor: 'pointer',
                  fontSize: 14, fontWeight: isActive ? 600 : 400,
                  whiteSpace: 'nowrap', overflow: 'hidden',
                })}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                {open && <span>{item.label}</span>}
                {open && item.children && (
                  <span style={{ marginLeft: 'auto', fontSize: 10, opacity: 0.6 }}>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                )}
              </NavLink>

              {/* Sub-links */}
              {item.children && isExpanded && open && (
                <div style={{ paddingLeft: 20, marginBottom: 4 }}>
                  {item.children.map((child) => {
                    // Extraire le type depuis le path ex: /admin/users?type=client → client
                    const urlParams = child.path.includes('?')
                      ? child.path.split('?')[1]
                      : '';
                    const basePath = child.path.split('?')[0];

                    return (
                      <button
                        key={child.path}
                        onClick={() => navigate(`${basePath}${urlParams ? '?' + urlParams : ''}`)}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '7px 12px', borderRadius: 8, marginBottom: 2,
                          border: 'none', cursor: 'pointer',
                          color: 'rgba(255,255,255,0.55)',
                          fontSize: 13, background: 'transparent',
                          transition: 'all 0.15s',
                          borderLeft: '2px solid rgba(255,255,255,0.1)',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = '#fff';
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                          e.currentTarget.style.borderLeft = `2px solid ${TEAL}`;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.borderLeft = '2px solid rgba(255,255,255,0.1)';
                        }}
                      >
                        {child.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Bouton Logout seul en bas ── */}
      <div
        style={{
          padding: '16px 12px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: open ? 'flex-start' : 'center',
        }}
      >
        <button
          onClick={onLogout}
          title="Déconnexion"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(255,255,255,0.55)',
            fontSize: 14,
            fontWeight: 500,
            width: open ? '100%' : 'auto',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(220,50,50,0.15)';
            e.currentTarget.style.color = '#ff6b6b';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
          }}
        >
          {/* Icône cadenas */}
          <svg
            width="18" height="18" viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          {open && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
};

export default SidebarNav;