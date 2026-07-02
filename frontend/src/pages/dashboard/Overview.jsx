import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useEleves, getPaiementStats } from '../../store/elevesStore';
import { layout, colors } from '../../styles/dashboardStyles';

const statCards = (eleves, stats) => [
  { label: 'Total élèves',  value: eleves.length,                              icon: '👥', bg: colors.primaryLight, accent: colors.primary },
  { label: 'Payés',         value: stats.payes.length,                         icon: '✅', bg: colors.greenLight,   accent: colors.green   },
  { label: 'En attente',    value: stats.enAttente.length,                     icon: '⏳', bg: colors.amberLight,   accent: colors.amber   },
  { label: 'Encaissé',      value: `${stats.encaisse.toLocaleString('fr-FR')} $`, icon: '💰', bg: colors.tealLight, accent: colors.teal   },
];

export default function Overview() {
  const eleves = useEleves();
  const stats  = getPaiementStats(eleves);

  const tauxPaiement = eleves.length > 0
    ? Math.round((stats.payes.length / eleves.length) * 100)
    : 0;

  return (
    <DashboardLayout>

      {/* ── En-tête ── */}
      <div style={layout.pageHeader}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: colors.text }}>
            Tableau de bord
          </h1>
          <p style={{ margin: '4px 0 0', color: colors.muted, fontSize: 13 }}>
            Suivi des inscriptions et paiements de votre établissement
          </p>
        </div>
        <Link
          to="/dashboard/eleves"
          style={{ ...layout.btn('primary'), textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          + Gérer les élèves
        </Link>
      </div>

      {/* ── 4 cartes stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {statCards(eleves, stats).map((s) => (
          <div
            key={s.label}
            style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: 20, display: 'flex', alignItems: 'center', gap: 16, transition: 'box-shadow 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 12, color: colors.muted, fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: s.accent, lineHeight: 1 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Taux de paiement ── */}
      <div style={{ background: '#fff', border: `1px solid ${colors.border}`, borderRadius: 16, padding: 24, maxWidth: 480 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>Taux de paiement</span>
          <span style={{ fontSize: 20, fontWeight: 700, color: colors.primary }}>{tauxPaiement}%</span>
        </div>

        <div style={{ height: 8, background: colors.bg, borderRadius: 99, overflow: 'hidden', marginBottom: 14 }}>
          <div style={{
            height: '100%',
            width: `${tauxPaiement}%`,
            borderRadius: 99,
            background: tauxPaiement >= 75 ? colors.green : tauxPaiement >= 40 ? colors.amber : colors.danger,
            transition: 'width 0.8s ease',
          }} />
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: `${stats.payes.length} payés`,       bg: colors.greenLight, color: colors.green  },
            { label: `${stats.enAttente.length} en attente`, bg: colors.amberLight, color: colors.amber },
            { label: `${stats.retard.length} en retard`,  bg: '#fee2e2',         color: colors.danger  },
          ].map(b => (
            <span key={b.label} style={{ padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 500, background: b.bg, color: b.color }}>
              {b.label}
            </span>
          ))}
        </div>
      </div>

    </DashboardLayout>
  );
}
