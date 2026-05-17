import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from './utils/adminService';

const TEAL = '#1D9E75';
const TEAL_LIGHT = '#E1F5EE';
const AMBER = '#EF9F27';
const AMBER_LIGHT = '#FAEEDA';
const CORAL = '#D85A30';
const CORAL_LIGHT = '#FAECE7';
const DARK = '#1A1A2E';

const StatCard = ({ label, value, icon, color, lightColor, trend, trendLabel }) => (
  <div style={{
    background: '#fff',
    border: '1px solid #EBEBEB',
    borderRadius: 16,
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.15s, box-shadow 0.15s',
    cursor: 'default',
  }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.07)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    <div style={{
      position: 'absolute', right: -12, top: -12,
      width: 80, height: 80, borderRadius: '50%',
      background: lightColor, opacity: 0.7,
    }} />
    <div style={{
      width: 42, height: 42, borderRadius: 12,
      background: lightColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 20,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: DARK, letterSpacing: -0.5 }}>{value}</div>
    </div>
    {trend !== undefined && (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        fontSize: 12,
        color: trend >= 0 ? TEAL : CORAL,
      }}>
        <span>{trend >= 0 ? '↑' : '↓'}</span>
        <span style={{ fontWeight: 600 }}>{Math.abs(trend)}%</span>
        <span style={{ color: '#aaa' }}>{trendLabel}</span>
      </div>
    )}
  </div>
);

const RecentUserRow = ({ user, onView }) => {
  const typeColors = {
    client: { bg: TEAL_LIGHT, text: TEAL },
    eleve: { bg: AMBER_LIGHT, text: AMBER },
    etablissement: { bg: CORAL_LIGHT, text: CORAL },
  };
  const colors = typeColors[user.type] || typeColors.client;

  return (
    <tr style={{ borderBottom: '1px solid #F5F5F5' }}>
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: colors.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: colors.text, fontWeight: 700, fontSize: 13,
          }}>
            {user.name[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: DARK }}>{user.name}</div>
            <div style={{ fontSize: 12, color: '#aaa' }}>{user.email}</div>
          </div>
        </div>
      </td>
      <td style={{ padding: '12px 16px' }}>
        <span style={{
          background: colors.bg, color: colors.text,
          fontSize: 11, fontWeight: 600, padding: '3px 10px',
          borderRadius: 20, textTransform: 'capitalize',
        }}>
          {user.type}
        </span>
      </td>
      <td style={{ padding: '12px 16px', fontSize: 13, color: '#888' }}>
        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
      </td>
      <td style={{ padding: '12px 16px' }}>
        <span style={{
          background: user.isActive ? TEAL_LIGHT : '#F5F5F5',
          color: user.isActive ? TEAL : '#aaa',
          fontSize: 11, fontWeight: 600, padding: '3px 10px',
          borderRadius: 20,
        }}>
          {user.isActive ? 'Actif' : 'Inactif'}
        </span>
      </td>
      <td style={{ padding: '12px 16px' }}>
        <button
          onClick={() => onView(user)}
          style={{
            background: 'none', border: `1px solid ${TEAL}`,
            color: TEAL, borderRadius: 8, padding: '5px 12px',
            cursor: 'pointer', fontSize: 12, fontWeight: 500,
          }}
        >
          Voir
        </button>
      </td>
    </tr>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, usersData] = await Promise.all([
          adminService.getStats(),
          adminService.getRecentUsers(5),
        ]);
        setStats(statsData);
        setRecentUsers(usersData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300 }}>
        <div style={{
          width: 36, height: 36, border: '3px solid #E1F5EE',
          borderTop: `3px solid ${TEAL}`, borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const STAT_CARDS = [
    {
      label: 'Total utilisateurs',
      value: stats?.totalUsers?.toLocaleString('fr-FR') || '0',
      icon: '👥',
      color: TEAL,
      lightColor: TEAL_LIGHT,
      trend: stats?.usersTrend,
      trendLabel: 'ce mois',
    },
    {
      label: 'Abonnements actifs',
      value: stats?.activeSubscriptions?.toLocaleString('fr-FR') || '0',
      icon: '💳',
      color: AMBER,
      lightColor: AMBER_LIGHT,
      trend: stats?.subsTrend,
      trendLabel: 'ce mois',
    },
    {
      label: 'Établissements',
      value: stats?.totalEtablissements?.toLocaleString('fr-FR') || '0',
      icon: '🏫',
      color: CORAL,
      lightColor: CORAL_LIGHT,
      trend: stats?.etablissementsTrend,
      trendLabel: 'ce mois',
    },
    {
      label: 'Élèves inscrits',
      value: stats?.totalEleves?.toLocaleString('fr-FR') || '0',
      icon: '🎓',
      color: '#7C3AED',
      lightColor: '#EDE9FE',
      trend: stats?.elevesTrend,
      trendLabel: 'ce mois',
    },
  ];

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: DARK, margin: 0 }}>
          Tableau de bord
        </h1>
        <p style={{ fontSize: 14, color: '#888', marginTop: 4 }}>
          Bienvenue — voici un aperçu de l'activité de la plateforme.
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 20,
        marginBottom: 32,
      }}>
        {STAT_CARDS.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Recent users */}
      <div style={{
        background: '#fff',
        border: '1px solid #EBEBEB',
        borderRadius: 16,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #F5F5F5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: DARK, margin: 0 }}>
              Derniers utilisateurs inscrits
            </h2>
            <p style={{ fontSize: 12, color: '#aaa', margin: '2px 0 0' }}>5 dernières inscriptions</p>
          </div>
          <button
            onClick={() => navigate('/admin/users')}
            style={{
              background: TEAL_LIGHT, color: TEAL,
              border: 'none', borderRadius: 10,
              padding: '8px 16px', cursor: 'pointer',
              fontSize: 13, fontWeight: 500,
            }}
          >
            Voir tout →
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#FAFAFA' }}>
                {['Utilisateur', 'Type', 'Date inscription', 'Statut', ''].map((h) => (
                  <th key={h} style={{
                    padding: '10px 16px',
                    textAlign: 'left', fontSize: 12,
                    color: '#aaa', fontWeight: 500,
                    letterSpacing: 0.4,
                  }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <RecentUserRow
                  key={u.id}
                  user={u}
                  onView={(user) => navigate(`/admin/users/${user.id}`)}
                />
              ))}
              {recentUsers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#aaa', fontSize: 14 }}>
                    Aucun utilisateur récent
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;