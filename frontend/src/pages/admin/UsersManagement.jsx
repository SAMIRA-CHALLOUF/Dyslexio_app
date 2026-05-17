import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { adminService } from './utils/adminService';

const TEAL = '#1D9E75';
const TEAL_LIGHT = '#E1F5EE';
const AMBER = '#EF9F27';
const AMBER_LIGHT = '#FAEEDA';
const CORAL = '#D85A30';
const CORAL_LIGHT = '#FAECE7';
const DARK = '#1A1A2E';

const USER_TYPES = [
  { value: '', label: 'Tous' },
  { value: 'client', label: 'Clients' },
  { value: 'eleve', label: 'Élèves' },
  { value: 'etablissement', label: 'Établissements' },
];

const typeStyle = (type) => ({
  client: { bg: TEAL_LIGHT, text: TEAL },
  eleve: { bg: AMBER_LIGHT, text: AMBER },
  etablissement: { bg: CORAL_LIGHT, text: CORAL },
}[type] || { bg: '#F5F5F5', text: '#888' });

// ── Modal de détail utilisateur ──
const UserModal = ({ user, onClose, onToggleActive, onDelete }) => {
  if (!user) return null;
  const tc = typeStyle(user.type);
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 20,
          padding: 32, width: 480, maxWidth: '90vw',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 54, height: 54, borderRadius: '50%',
            background: tc.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: tc.text, fontWeight: 700, fontSize: 20,
          }}>
            {user.name[0].toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: DARK }}>{user.name}</h2>
            <span style={{
              background: tc.bg, color: tc.text,
              fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20,
            }}>
              {user.type}
            </span>
          </div>
          <button onClick={onClose} style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            fontSize: 20, cursor: 'pointer', color: '#aaa',
          }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {[
            ['Email', user.email, '📧'],
            ['Téléphone', user.phone || '—', '📞'],
            ['Inscrit le', new Date(user.createdAt).toLocaleDateString('fr-FR'), '📅'],
            ['Statut', user.isActive ? 'Actif' : 'Inactif', '●'],
          ].map(([label, value, icon]) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', background: '#FAFAFA', borderRadius: 10,
            }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              <span style={{ fontSize: 13, color: '#888', width: 100 }}>{label}</span>
              <span style={{ fontSize: 14, color: DARK, fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => onToggleActive(user)}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
              border: `1px solid ${user.isActive ? CORAL : TEAL}`,
              background: user.isActive ? CORAL_LIGHT : TEAL_LIGHT,
              color: user.isActive ? CORAL : TEAL,
              fontSize: 13, fontWeight: 600,
            }}
          >
            {user.isActive ? 'Désactiver' : 'Activer'}
          </button>
          <button
            onClick={() => { if (window.confirm('Supprimer cet utilisateur ?')) onDelete(user.id); }}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10, cursor: 'pointer',
              border: `1px solid ${CORAL}`, background: CORAL_LIGHT, color: CORAL,
              fontSize: 13, fontWeight: 600,
            }}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Page principale ──
const UsersManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const PER_PAGE = 10;

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { users: data, total: t } = await adminService.getUsers({
        type: selectedType,
        search,
        page,
        limit: PER_PAGE,
      });
      setUsers(data);
      setTotal(t);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedType, search, page]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setPage(1);
    if (type) setSearchParams({ type });
    else setSearchParams({});
  };

  const handleToggleActive = async (user) => {
    await adminService.toggleUserStatus(user.id, !user.isActive);
    setSelectedUser(null);
    loadUsers();
  };

  const handleDelete = async (id) => {
    await adminService.deleteUser(id);
    setSelectedUser(null);
    loadUsers();
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: DARK, margin: 0 }}>
          Gestion des utilisateurs
        </h1>
        <p style={{ fontSize: 14, color: '#888', marginTop: 4 }}>
          {total} utilisateur{total > 1 ? 's' : ''} au total
        </p>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        flexWrap: 'wrap', marginBottom: 24,
      }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', border: '1px solid #EBEBEB', borderRadius: 10,
          padding: '8px 14px', flex: '1 1 220px', maxWidth: 340,
        }}>
          <span style={{ color: '#aaa' }}>🔍</span>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher un utilisateur..."
            style={{
              border: 'none', outline: 'none', fontSize: 14,
              color: DARK, background: 'transparent', width: '100%',
            }}
          />
        </div>

        {/* Type tabs */}
        <div style={{ display: 'flex', gap: 6, background: '#F5F5F5', borderRadius: 10, padding: 4 }}>
          {USER_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => handleTypeChange(t.value)}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 500,
                background: selectedType === t.value ? '#fff' : 'transparent',
                color: selectedType === t.value ? DARK : '#888',
                boxShadow: selectedType === t.value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: '#fff', border: '1px solid #EBEBEB',
        borderRadius: 16, overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <div style={{
              width: 32, height: 32, border: '3px solid #E1F5EE',
              borderTop: `3px solid ${TEAL}`, borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }}>
                    {['Utilisateur', 'Type', 'Email', 'Date inscription', 'Statut', 'Actions'].map((h) => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left',
                        fontSize: 11, color: '#aaa', fontWeight: 600, letterSpacing: 0.5,
                      }}>
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const tc = typeStyle(u.type);
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid #F5F5F5' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              width: 34, height: 34, borderRadius: '50%',
                              background: tc.bg, color: tc.text,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: 13,
                            }}>
                              {u.name[0].toUpperCase()}
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 500, color: DARK }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: tc.bg, color: tc.text,
                            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                          }}>
                            {u.type}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#666' }}>{u.email}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#888' }}>
                          {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            background: u.isActive ? TEAL_LIGHT : '#F5F5F5',
                            color: u.isActive ? TEAL : '#aaa',
                            fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                          }}>
                            {u.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <button
                            onClick={() => setSelectedUser(u)}
                            style={{
                              background: 'none', border: `1px solid #EBEBEB`,
                              borderRadius: 8, padding: '5px 12px',
                              cursor: 'pointer', fontSize: 12, color: TEAL,
                              fontWeight: 500,
                            }}
                          >
                            Détails
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: '#aaa', fontSize: 14 }}>
                        Aucun utilisateur trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, padding: '16px 0', borderTop: '1px solid #F5F5F5',
              }}>
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    background: 'none', border: '1px solid #EBEBEB', borderRadius: 8,
                    padding: '6px 12px', cursor: page === 1 ? 'default' : 'pointer',
                    color: page === 1 ? '#ccc' : DARK, fontSize: 13,
                  }}
                >
                  ←
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      width: 34, height: 34, borderRadius: 8,
                      border: p === page ? 'none' : '1px solid #EBEBEB',
                      background: p === page ? TEAL : 'none',
                      color: p === page ? '#fff' : DARK,
                      cursor: 'pointer', fontSize: 13, fontWeight: p === page ? 600 : 400,
                    }}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    background: 'none', border: '1px solid #EBEBEB', borderRadius: 8,
                    padding: '6px 12px', cursor: page === totalPages ? 'default' : 'pointer',
                    color: page === totalPages ? '#ccc' : DARK, fontSize: 13,
                  }}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* User detail modal */}
      <UserModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default UsersManagement;