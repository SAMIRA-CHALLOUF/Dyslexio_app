import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import AjouterEleveDialog from '../../components/dashboard/AjouterEleveDialog';
import { useElevesState } from '../../store/elevesStore';
import { API, authHeaders, colors, layout } from '../../styles/dashboardStyles';

const badgeStyle = (statut) => ({
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 500,
  background:
    statut === 'payé' ? '#d1fae5' :
    statut === 'retard' ? '#fee2e2' : '#fef9c3',
  color:
    statut === 'payé' ? '#065f46' :
    statut === 'retard' ? '#991b1b' : '#854d0e',
});

export default function Eleves() {
  const { eleves, loading, error, setEleves } = useElevesState();
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('Tous');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = useMemo(() => eleves.filter((e) => {
    const q = search.toLowerCase();
    const okSearch = !q || `${e.prenom} ${e.nom} ${e.classe}`.toLowerCase().includes(q);
    const okStatut = filterStatut === 'Tous' || e.paiement.statut === filterStatut;
    return okSearch && okStatut;
  }), [eleves, search, filterStatut]);

  const removeEleve = async (id) => {
    await fetch(`${API}/eleves/${id}`, { method: 'DELETE', headers: authHeaders() });
    setEleves((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <DashboardLayout>
      <div style={layout.pageHeader}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Élèves</h1>
          <p style={{ margin: 4, color: colors.muted, fontSize: 13 }}>{eleves.length} inscrit(s)</p>
        </div>
        <AjouterEleveDialog onEleveAdded={(e) => setEleves((p) => [...p, e])} />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: 8, width: 280, borderRadius: 8, border: `1px solid ${colors.border}` }}
        />
        <select
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
          style={{ padding: 8, borderRadius: 8, border: `1px solid ${colors.border}` }}
        >
          <option>Tous</option>
          <option>payé</option>
          <option>en attente</option>
          <option>retard</option>
        </select>
      </div>

      {error && <p style={{ color: colors.danger }}>{error}</p>}

      {loading ? <p>Chargement...</p> : (
        <div style={{ ...layout.card, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Élève', 'Classe', 'Parent', 'Statut', 'Montant', ''].map((h) => (
                  <th key={h} style={layout.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...layout.td, textAlign: 'center', color: colors.muted, padding: 24 }}>
                    Aucun élève trouvé
                  </td>
                </tr>
              ) : filtered.map((e) => (
                <tr key={e.id}>
                  <td style={layout.td}>
                    <div style={{ fontWeight: 500 }}>{e.prenom} {e.nom}</div>
                    <div style={{ fontSize: 12, color: colors.muted }}>{e.email}</div>
                  </td>
                  <td style={layout.td}>{e.classe} / {e.niveau}</td>
                  <td style={layout.td}>
                    <div>{e.parentNom}</div>
                    <div style={{ fontSize: 12, color: colors.muted }}>{e.parentTelephone}</div>
                  </td>
                  <td style={layout.td}>
                    <span style={badgeStyle(e.paiement.statut)}>{e.paiement.statut}</span>
                  </td>
                  <td style={layout.td}>{e.paiement.montant} $</td>
                  <td style={layout.td}>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(e.id)}
                      style={layout.btn('ghost')}
                    >
                      Suppr.
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: '#0006', display: 'grid', placeItems: 'center', zIndex: 1000 }}>
          <div style={{ ...layout.card, padding: 24 }}>
            <p>Supprimer cet élève ?</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                type="button"
                style={layout.btn('danger')}
                onClick={() => { removeEleve(confirmDelete); setConfirmDelete(null); }}
              >
                Oui, supprimer
              </button>
              <button
                type="button"
                style={layout.btn('ghost')}
                onClick={() => setConfirmDelete(null)}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
