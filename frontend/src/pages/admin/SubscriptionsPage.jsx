import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from './utils/adminService';

const TEAL = '#1D9E75';
const TEAL_LIGHT = '#E1F5EE';
const AMBER = '#EF9F27';
const AMBER_LIGHT = '#FAEEDA';
const CORAL = '#D85A30';
const CORAL_LIGHT = '#FAECE7';
const DARK = '#1A1A2E';

const statusStyle = (status) => ({
  active: { bg: TEAL_LIGHT, text: TEAL, label: 'Actif' },
  expired: { bg: '#F5F5F5', text: '#aaa', label: 'Expiré' },
  pending: { bg: AMBER_LIGHT, text: AMBER, label: 'En attente' },
  cancelled: { bg: CORAL_LIGHT, text: CORAL, label: 'Annulé' },
}[status] || { bg: '#F5F5F5', text: '#888', label: status });

const PLAN_ICONS = {
  basic: '🌱',
  pro: '⚡',
  enterprise: '🏢',
};

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [subs, subsStats] = await Promise.all([
        adminService.getSubscriptions({ status: filter === 'all' ? '' : filter, search }),
        adminService.getSubscriptionStats(),
      ]);
      setSubscriptions(subs);
      setStats(subsStats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => { load(); }, [load]);

  const FILTERS = [
    { value: 'all', label: 'Tous' },
    { value: 'active', label: 'Actifs' },
    { value: 'expired', label: 'Expirés' },
    { value: 'pending', label: 'En attente' },
    { value: 'cancelled', label: 'Annulés' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: DARK, margin: 0 }}>
          Abonnements
        </h1>
        <p style={{ fontSize: 14, color: '#888', marginTop: 4 }}>
          Consultez et gérez tous les abonnements de la plateforme
        </p>
      </div>

      {/* Stats cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16, marginBottom: 28,
        }}>
          {[
            { label: 'Actifs', value: stats.active, color: TEAL, bg: TEAL_LIGHT },
            { label: 'En attente', value: stats.pending, color: AMBER, bg: AMBER_LIGHT },
            { label: 'Expirés', value: stats.expired, color: '#aaa', bg: '#F5F5F5' },
            { label: 'Annulés', value: stats.cancelled, color: CORAL, bg: CORAL_LIGHT },
          ].map((s) => (
            <div key={s.label} style={{
              background: '#fff', border: '1px solid #EBEBEB',
              borderRadius: 14, padding: '16px 20px',
            }}>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters & search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#fff', border: '1px solid #EBEBEB', borderRadius: 10,
          padding: '8px 14px', flex: '1 1 200px', maxWidth: 320,
        }}>
          <span style={{ color: '#aaa' }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            style={{
              border: 'none', outline: 'none', fontSize: 14,
              color: DARK, background: 'transparent', width: '100%',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, background: '#F5F5F5', borderRadius: 10, padding: 4 }}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 500,
                background: filter === f.value ? '#fff' : 'transparent',
                color: filter === f.value ? DARK : '#888',
                boxShadow: filter === f.value ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {f.label}
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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#FAFAFA', borderBottom: '1px solid #F0F0F0' }}>
                  {['Utilisateur', 'Plan', 'Statut', 'Date début', 'Date fin', 'Montant'].map((h) => (
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
                {subscriptions.map((sub) => {
                  const ss = statusStyle(sub.status);
                  return (
                    <tr key={sub.id} style={{ borderBottom: '1px solid #F5F5F5' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 500, color: DARK }}>{sub.userName}</div>
                          <div style={{ fontSize: 12, color: '#aaa' }}>{sub.userEmail}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 16 }}>{PLAN_ICONS[sub.plan] || '📦'}</span>
                          <span style={{ fontSize: 14, fontWeight: 500, color: DARK, textTransform: 'capitalize' }}>
                            {sub.plan}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: ss.bg, color: ss.text,
                          fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                        }}>
                          {ss.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#666' }}>
                        {new Date(sub.startDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: '#666' }}>
                        {sub.endDate ? new Date(sub.endDate).toLocaleDateString('fr-FR') : '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: DARK }}>
                          {sub.amount ? `${sub.amount.toFixed(2)} TND` : '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {subscriptions.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 48, color: '#aaa', fontSize: 14 }}>
                      Aucun abonnement trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsPage;