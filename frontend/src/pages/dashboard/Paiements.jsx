import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import { useEleves, updatePaiementStatut, getPaiementStats } from '../../store/elevesStore';
import { layout, colors, API, authHeaders } from '../../styles/dashboardStyles';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from '../../config/api';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// ─── Modal paiement individuel (inchangé) ────────────────────────────────────
const PaymentModal = ({ eleve, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token') || '';
      let etablissementId = null;
      try { const p = JSON.parse(atob(token.split('.')[1])); etablissementId = p.sub || p.id || p.etablissementId; } catch {}
      const res = await fetch(`${API}/payment/create-eleve-payment-intent`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          amount: eleve.paiement.montant || 0,
          eleveId: Number(eleve.id),
          etablissementId: Number(etablissementId),
        }),
      });
      if (!res.ok) throw new Error('Impossible de créer le paiement');
      const { clientSecret } = await res.json();
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (result.error) throw new Error(result.error.message);
      if (result.paymentIntent?.status !== 'succeeded') throw new Error('Paiement non confirmé.');
      // Mettre à jour statut de l'élève
      await fetch(`${API}/eleves/${eleve.id}/paiement`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ statut: 'payé', reference: result.paymentIntent.id, montant: eleve.paiement.montant }),
      });
      window.location.reload();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: '#0006', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div style={{ ...layout.card, padding: 24, width: '100%', maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Payer pour {eleve.prenom} {eleve.nom}</h3>
        <p>Montant : <strong>{eleve.paiement.montant} $</strong></p>
        <div style={{ border: '1px solid #ccc', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
        </div>
        {error && <p style={{ color: colors.danger, fontSize: 13 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={layout.btn('ghost')}>Annuler</button>
          <button onClick={handlePay} disabled={loading || !stripe} style={layout.btn('primary')}>
            {loading ? 'Traitement...' : 'Payer'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Modal paiement groupé (bulk) ────────────────────────────────────────────
const BulkPaymentModal = ({ eleves, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const totalMontant = eleves.reduce((sum, e) => sum + (e.paiement.montant || 0), 0);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token') || '';
      let etablissementId = null;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        etablissementId = payload.sub || payload.id || payload.etablissementId;
      } catch {}
      if (!etablissementId) throw new Error('Session expirée, veuillez vous reconnecter.');

      // Appel backend : un seul PaymentIntent pour tous les élèves sélectionnés
      const res = await fetch(`${API}/payment/create-bulk-payment-intent`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          eleveIds: eleves.map(e => Number(e.id)),
          etablissementId: Number(etablissementId),
          amount: totalMontant,
        }),
      });
      if (!res.ok) throw new Error('Impossible de créer le paiement groupé');
      const { clientSecret } = await res.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });
      if (result.error) throw new Error(result.error.message);
      if (result.paymentIntent?.status !== 'succeeded') throw new Error('Paiement non confirmé.');

      // Mettre à jour statut de tous les élèves sélectionnés
      await Promise.all(eleves.map(e =>
        fetch(`${API}/eleves/${e.id}/paiement`, {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({ statut: 'payé', reference: result.paymentIntent.id, montant: e.paiement.montant }),
        })
      ));
      window.location.reload();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: '#0006', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}
    >
      <div style={{ ...layout.card, padding: 24, width: '100%', maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        <h3 style={{ marginTop: 0 }}>Paiement groupé — {eleves.length} élève{eleves.length > 1 ? 's' : ''}</h3>

        {/* Liste des élèves sélectionnés */}
        <div style={{ maxHeight: 160, overflowY: 'auto', marginBottom: 12, border: `1px solid ${colors.border}`, borderRadius: 8, padding: 8 }}>
          {eleves.map(e => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
              <span>{e.prenom} {e.nom}</span>
              <span style={{ fontWeight: 600 }}>{e.paiement.montant} $</span>
            </div>
          ))}
        </div>

        <p style={{ fontWeight: 700, fontSize: 16, margin: '8px 0 16px' }}>
          Total : {totalMontant.toLocaleString('fr-FR')} $
        </p>

        <div style={{ border: '1px solid #ccc', padding: 12, borderRadius: 8, marginBottom: 16 }}>
          <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
        </div>

        {error && <p style={{ color: colors.danger, fontSize: 13 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={layout.btn('ghost')}>Annuler</button>
          <button onClick={handlePay} disabled={loading || !stripe} style={layout.btn('primary')}>
            {loading ? 'Traitement...' : `Payer ${totalMontant.toLocaleString('fr-FR')} $`}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Page principale ──────────────────────────────────────────────────────────
export default function Paiements() {
  const eleves = useEleves();
  const stats = getPaiementStats(eleves);

  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('Tous');
  const [payEleve, setPayEleve] = useState(null);         // paiement individuel
  const [selected, setSelected] = useState([]);            // ids sélectionnés
  const [showBulk, setShowBulk] = useState(false);        // modal bulk

  const filtered = useMemo(() => eleves.filter((e) => {
    const q = search.toLowerCase();
    return (!q || `${e.prenom} ${e.nom}`.toLowerCase().includes(q))
      && (filterStatut === 'Tous' || e.paiement.statut === filterStatut);
  }), [eleves, search, filterStatut]);

  // Élèves non payés dans la liste filtrée (seuls ceux-là sont sélectionnables)
  const selectables = filtered.filter(e => ['en attente', 'retard'].includes(e.paiement.statut));

  const allChecked = selectables.length > 0 && selectables.every(e => selected.includes(e.id));

  const toggleAll = () => {
    if (allChecked) {
      setSelected(prev => prev.filter(id => !selectables.map(e => e.id).includes(id)));
    } else {
      setSelected(prev => [...new Set([...prev, ...selectables.map(e => e.id)])]);
    }
  };

  const toggleOne = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectedEleves = eleves.filter(e => selected.includes(e.id));
  const totalSelected = selectedEleves.reduce((sum, e) => sum + (e.paiement.montant || 0), 0);

  const exportCSV = () => {
    const rows = [['Prenom', 'Nom', 'Montant', 'Statut', 'Date'], ...eleves.map((e) => [
      e.prenom, e.nom, e.paiement.montant, e.paiement.statut, e.paiement.datePaiement || '',
    ])];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'paiements.csv';
    a.click();
  };

  return (
    <DashboardLayout>
      {/* ── En-tête ── */}
      <div style={layout.pageHeader}>
        <h1 style={{ margin: 0 }}>Paiements</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {selected.length > 0 && (
            <button
              type="button"
              style={layout.btn('primary')}
              onClick={() => setShowBulk(true)}
            >
              Payer la sélection ({selected.length} élève{selected.length > 1 ? 's' : ''} — {totalSelected.toLocaleString('fr-FR')} $)
            </button>
          )}
          <button type="button" style={layout.btn('ghost')} onClick={exportCSV}>Exporter CSV</button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div style={layout.grid4}>
        <div style={{ ...layout.card, padding: 16 }}><small>Total</small><div>{stats.total.toLocaleString('fr-FR')} $</div></div>
        <div style={{ ...layout.card, padding: 16 }}><small>Payés</small><div>{stats.payes.length}</div></div>
        <div style={{ ...layout.card, padding: 16 }}><small>En attente</small><div>{stats.enAttente.length}</div></div>
        <div style={{ ...layout.card, padding: 16 }}><small>Retard</small><div>{stats.retard.length}</div></div>
      </div>

      {/* ── Filtres ── */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '12px 0' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un élève..."
          style={{ padding: 8, width: 240, borderRadius: 8, border: `1px solid ${colors.border}` }}
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

      {/* ── Tableau ── */}
      <div style={{ ...layout.card, marginTop: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {/* Checkbox Select All */}
              <th style={{ ...layout.th, width: 40, textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                  title="Sélectionner tous les non-payés"
                  style={{ cursor: 'pointer', width: 16, height: 16 }}
                />
              </th>
              {['Élève', 'Référence', 'Montant', 'Statut', 'Date'].map((h) => (
                <th key={h} style={layout.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => {
              const isSelectable = ['en attente', 'retard'].includes(e.paiement.statut);
              const isChecked = selected.includes(e.id);
              return (
                <tr
                  key={e.id}
                  style={{ background: isChecked ? '#f0f7ff' : 'transparent', transition: 'background 0.15s' }}
                >
                  {/* Checkbox individuelle */}
                  <td style={{ ...layout.td, textAlign: 'center' }}>
                    {isSelectable ? (
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOne(e.id)}
                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                      />
                    ) : (
                      <span style={{ color: colors.success, fontSize: 16 }}>✓</span>
                    )}
                  </td>
                  <td style={layout.td}>{e.prenom} {e.nom}</td>
                  <td style={layout.td}>{e.paiement.reference || '-'}</td>
                  <td style={layout.td}>{e.paiement.montant} $</td>
                  <td style={layout.td}>
                    <span style={{
                      display: 'inline-block',
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 500,
                      background: e.paiement.statut === 'payé' ? '#d1fae5' : e.paiement.statut === 'retard' ? '#fee2e2' : '#fef9c3',
                      color: e.paiement.statut === 'payé' ? '#065f46' : e.paiement.statut === 'retard' ? '#991b1b' : '#854d0e',
                    }}>
                      {e.paiement.statut}
                    </span>
                  </td>
                  <td style={layout.td}>{e.paiement.datePaiement || '-'}</td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ ...layout.td, textAlign: 'center', color: colors.muted, padding: 24 }}>
                  Aucun élève trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Modal paiement individuel ── */}
      {payEleve && (
        <Elements stripe={stripePromise}>
          <PaymentModal eleve={payEleve} onClose={() => setPayEleve(null)} />
        </Elements>
      )}

      {/* ── Modal paiement groupé ── */}
      {showBulk && selectedEleves.length > 0 && (
        <Elements stripe={stripePromise}>
          <BulkPaymentModal
            eleves={selectedEleves}
            onClose={() => setShowBulk(false)}
          />
        </Elements>
      )}
    </DashboardLayout>
  );
}
