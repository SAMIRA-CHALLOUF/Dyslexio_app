import React, { useState } from 'react';
import { API, authHeaders, colors, layout } from '../../styles/dashboardStyles';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { STRIPE_PUBLISHABLE_KEY } from '../../config/api';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const Required = () => <span style={{ color: '#e24b4a', marginLeft: 2 }}>*</span>;

const PayAfterAddModal = ({ eleve, onSuccess, onSkip }) => {
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

      const montant = eleve.paiement?.montant ?? eleve.montant ?? 0;

      const res = await fetch(`${API}/payment/create-eleve-payment-intent`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          amount: montant,
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

      // ✅ Mettre à jour le statut directement sans webhook
      await fetch(`${API}/eleves/${eleve.id}/paiement`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({
          statut: 'payé',
          reference: result.paymentIntent.id,
          montant,
        }),
      });

      onSuccess();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const montant = eleve.paiement?.montant ?? eleve.montant ?? 0;

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0006', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ ...layout.card, padding: 28, width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: colors.primary || '#4F46E5',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0,
          }}>
            {eleve.prenom?.[0]}{eleve.nom?.[0]}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>{eleve.prenom} {eleve.nom}</div>
            <div style={{ fontSize: 12, color: colors.muted }}>Élève ajouté avec succès ✓</div>
          </div>
        </div>

        <div style={{ background: '#f8f9fa', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: colors.muted }}>Montant à régler</span>
          <span style={{ fontWeight: 700, fontSize: 18 }}>{montant.toLocaleString('fr-FR')} $</span>
        </div>

        {montant > 0 ? (
          <>
            <p style={{ fontSize: 13, color: colors.muted, margin: '0 0 12px' }}>
              Voulez-vous régler le paiement maintenant ?
            </p>
            <div style={{ border: `1px solid ${colors.border || '#e2e8f0'}`, padding: 12, borderRadius: 8, marginBottom: 16 }}>
              <CardElement options={{ style: { base: { fontSize: '15px' } } }} />
            </div>
            {error && <p style={{ color: colors.danger, fontSize: 13, margin: '0 0 12px' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onSkip} style={{ ...layout.btn('ghost'), flex: 1 }}>Plus tard</button>
              <button onClick={handlePay} disabled={loading || !stripe} style={{ ...layout.btn('primary'), flex: 2 }}>
                {loading ? 'Traitement...' : `Payer ${montant.toLocaleString('fr-FR')} $`}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 13, color: colors.muted, marginBottom: 16 }}>Aucun montant défini. L'élève a été enregistré.</p>
            <button onClick={onSkip} style={layout.btn('primary')}>Fermer</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function AjouterEleveDialog({ onEleveAdded }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [newEleve, setNewEleve] = useState(null);

  const emptyForm = {
    nom: '', prenom: '', email: '', motDePasse: '', telephone: '',
    classe: '', niveau: '', parentNom: '', parentTelephone: '',
    montant: 80, paiementStatut: 'en attente', paiementMethode: 'especes',
    paiementReference: '', datePaiement: '',
  };

  const [form, setForm] = useState(emptyForm);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErr('');
    try {
      const res = await fetch(`${API}/eleves`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ ...form, montant: Number(form.montant) || 0 }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(Array.isArray(d.message) ? d.message[0] : d.message || 'Erreur');
      }
      const created = await res.json();
      const eleveFormatted = { ...created, id: String(created.id) };
      setOpen(false);
      setForm(emptyForm);
      setNewEleve(eleveFormatted);
      onEleveAdded(eleveFormatted);
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setLoading(false);
    }
  };

  // Champs du formulaire : [clé, label, obligatoire]
  const fields = [
    ['nom',             'Nom',                    true],
    ['prenom',          'Prénom',                 true],
    ['email',           'Email',                  true],
    ['motDePasse',      'Mot de passe',            true],
    ['classe',          'Classe',                 true],
    ['niveau',          'Niveau',                 true],
    ['parentNom',       'Parent',                 true],
    ['parentTelephone', 'Tél. parent',            true],
    ['montant',         'Montant ($)',             false, true],
  ];

  return (
    <>
      <button type="button" style={layout.btn('primary')} onClick={() => setOpen(true)}>
        + Ajouter un élève
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, background: '#0006', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }} onClick={() => setOpen(false)}>
          <form
            onSubmit={submit}
            onClick={(ev) => ev.stopPropagation()}
            style={{ ...layout.card, width: '100%', maxWidth: 520, padding: 24, maxHeight: '90vh', overflow: 'auto' }}
          >
            <h2 style={{ margin: '0 0 4px' }}>Nouvel élève</h2>
            <p style={{ fontSize: 12, color: colors.muted, margin: '0 0 16px' }}>
              Les champs marqués <span style={{ color: '#e24b4a' }}>*</span> sont obligatoires.
            </p>
            {err && <p style={{ color: colors.danger, fontSize: 13 }}>{err}</p>}

            {fields.map(([k, label, required, readonly]) => (
              <label key={k} style={{ display: 'block', marginBottom: 10, fontSize: 13 }}>
                {label}{required && <Required />}
                <input
                  type={k === 'motDePasse' ? 'password' : k === 'email' ? 'email' : 'text'}
                  required={required}
                  readOnly={readonly}
                  value={form[k]}
                  onChange={readonly ? undefined : set(k)}
                  style={{
                    display: 'block', width: '100%', marginTop: 4,
                    padding: 8, borderRadius: 8,
                    border: `1px solid ${colors.border}`,
                    boxSizing: 'border-box',
                    background: readonly ? '#f1f5f9' : '#fff',
                    color: readonly ? colors.muted : colors.text,
                    cursor: readonly ? 'not-allowed' : 'text',
                  }}
                />
              </label>
            ))}

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button type="button" style={layout.btn('ghost')} onClick={() => setOpen(false)}>Annuler</button>
              <button type="submit" disabled={loading} style={layout.btn('primary')}>
                {loading ? '...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {newEleve && (
        <Elements stripe={stripePromise}>
          <PayAfterAddModal
            eleve={newEleve}
            onSuccess={() => { setNewEleve(null); window.location.reload(); }}
            onSkip={() => setNewEleve(null)}
          />
        </Elements>
      )}
    </>
  );
}
