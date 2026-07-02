// src/components/Auth/SignUp.js
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { API_URL, STRIPE_PUBLISHABLE_KEY } from '../../config/api';

const TEAL = '#0D9373';
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// ─── Step indicator ───────────────────────────────────────────────────────────
const Steps = ({ current }) => {
  const { t } = useTranslation();
  const labels = [t('auth.stepInfo'), t('auth.stepSubscription'), t('auth.stepPayment')];
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
      {labels.map((label, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: done || active ? TEAL : '#e2e8f0',
                color: done || active ? '#fff' : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 10, transition: 'all 0.3s',
                boxShadow: active ? `0 0 0 3px ${TEAL}25` : 'none',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: active || done ? TEAL : '#94a3b8' }}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 6px', marginBottom: 12,
                background: done ? TEAL : '#e2e8f0', transition: 'background 0.3s',
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

const DUREES = [
  { id: 'biannual', label: 'auth.durations.biannual', pricePerMonth: 9,  total: 54,  savings: null,   popular: false },
  { id: 'annual',   label: 'auth.durations.annual',   pricePerMonth: 7,  total: 84,  savings: '−17%', popular: true  },
  { id: 'biennial', label: 'auth.durations.biennial', pricePerMonth: 5,  total: 120, savings: '−38%', popular: false },
];

const getBillingTotal = (billingId) => DUREES.find(d => d.id === billingId)?.total ?? 0;

// ─── Step 1 : Informations ────────────────────────────────────────────────────
const StepInfo = ({ formData, setFormData, onNext, loading, error }) => {
  const { t } = useTranslation();
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [localError, setLocalError] = useState('');
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (localError) setLocalError('');
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData(prev => ({ ...prev, photo: file }));
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (formData.motDePasse !== formData.confirmationMotDePasse) {
      setLocalError(t('auth.passwordNoMatch'));
      return;
    }
    onNext();
  };

  const inputStyle = {
    width: '100%', padding: '7px 12px', border: '1.5px solid #e2e8f0',
    borderRadius: 10, fontSize: 13, background: '#f8fafc', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 2, display: 'block' };

  return (
    <form onSubmit={handleNext}>
      {/* Photo + Nom/Prénom */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, alignItems: 'center' }}>
        <div onClick={() => fileRef.current.click()} style={{
          width: 56, height: 56, borderRadius: '50%', cursor: 'pointer', flexShrink: 0,
          border: `2px dashed ${TEAL}`, background: '#f0fdf9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {preview ? (
            <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ textAlign: 'center', color: TEAL }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <div style={{ fontSize: 9, fontWeight: 800 }}>{t('auth.photo')}</div>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 12, flex: 1 }}>
          <div>
            <label style={labelStyle}>{t('auth.nom')}</label>
            <input type="text" name="nom" value={formData.nom} onChange={handleChange} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>{t('auth.prenom')}</label>
            <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required style={inputStyle} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 12, rowGap: 10 }}>
        <div>
          <label style={labelStyle}>{t('auth.email')}</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>{t('auth.accountType')}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['etablissement', 'client'].map(type => (
              <button key={type} type="button"
                onClick={() => setFormData(p => ({ ...p, typeCompte: type }))}
                style={{
                  flex: 1, padding: '6px 0',
                  border: `1.5px solid ${formData.typeCompte === type ? TEAL : '#e2e8f0'}`,
                  borderRadius: 10,
                  background: formData.typeCompte === type ? `${TEAL}15` : '#f8fafc',
                  color: formData.typeCompte === type ? TEAL : '#64748b',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}>
                {type === 'etablissement' ? 'Etablissement' : t('auth.client')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>{t('auth.password')}</label>
          <div style={{ position: 'relative' }}>
            <input type={showPass ? 'text' : 'password'} name="motDePasse"
              value={formData.motDePasse} onChange={handleChange} required
              style={{ ...inputStyle, paddingRight: 36 }} />
            <button type="button" onClick={() => setShowPass(!showPass)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </div>

        <div>
          <label style={labelStyle}>{t('auth.confirmPassword')}</label>
          <div style={{ position: 'relative' }}>
            <input type={showConf ? 'text' : 'password'} name="confirmationMotDePasse"
              value={formData.confirmationMotDePasse} onChange={handleChange} required
              style={{ ...inputStyle, paddingRight: 36 }} />
            <button type="button" onClick={() => setShowConf(!showConf)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {(localError || error) && (
        <p style={{ color: '#ef4444', fontSize: 12, textAlign: 'center', margin: '4px 0 0' }}>
          {localError || error}
        </p>
      )}

      <button type="submit" disabled={loading} style={{
        marginTop: 12, width: '100%', padding: '9px', border: 'none', borderRadius: 10,
        background: loading ? '#94a3b8' : `linear-gradient(135deg, ${TEAL}, #0F6E56)`,
        color: '#fff', fontSize: 14, fontWeight: 800,
        cursor: loading ? 'not-allowed' : 'pointer',
      }}>
        {loading ? t('auth.creating') : t('auth.next')}
      </button>
    </form>
  );
};

// ─── Step 2 : Abonnement ──────────────────────────────────────────────────────
const StepSubscription = ({ formData, setFormData, onNext, onBack }) => {
  const { t } = useTranslation();
  const selected = formData.billing || 'annual';

  return (
    <div>
      <p style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginBottom: 16 }}>
        · {t('auth.chooseDuration')}
      </p>

      <div style={{ display: 'flex', gap: 12 }}>
        {DUREES.map(d => {
          const active = selected === d.id;
          return (
            <div key={d.id} onClick={() => setFormData(p => ({ ...p, billing: d.id }))}
              style={{
                flex: 1, borderRadius: 12, padding: '14px 12px', cursor: 'pointer',
                border: active ? `2px solid ${TEAL}` : '1.5px solid #e2e8f0',
                background: '#fff', transition: 'all 0.2s',
                boxShadow: active ? `0 0 0 3px ${TEAL}18` : 'none',
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: active ? TEAL : '#64748b' }}>{t(d.label)}</span>
                {d.savings && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#E1F5EE', color: TEAL }}>
                    {d.savings}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: active ? TEAL : '#0f172a' }}>{d.pricePerMonth} CHF</span>
              </div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{t('auth.pricePerMonth', { total: d.total })}</div>
              {d.popular && <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: TEAL }}>{t('auth.popularSave', { amount: 15 })}</div>}
              {d.id === 'biennial' && <div style={{ marginTop: 6, fontSize: 10, fontWeight: 700, color: TEAL }}>{t('auth.bestPriceSave', { amount: 96 })}</div>}
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16, background: '#f8fafc', borderRadius: 10, padding: '12px 14px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {t('auth.includedFeatures')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
          {(t('auth.features', { returnObjects: true }) || []).map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 11, color: '#475569' }}>
              <span style={{ color: TEAL, fontWeight: 800, flexShrink: 0 }}>✓</span> {f}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button onClick={onBack} style={{ flex: 1, padding: '9px', border: `1.5px solid ${TEAL}`, borderRadius: 10, background: 'transparent', color: TEAL, fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
          {t('auth.back')}
        </button>
        <button onClick={onNext} style={{ flex: 2, padding: '9px', border: 'none', borderRadius: 10, background: `linear-gradient(135deg, ${TEAL}, #0F6E56)`, color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
          {t('auth.next')}
        </button>
      </div>
    </div>
  );
};

// ─── Step 3 : Paiement ────────────────────────────────────────────────────────
const StepPaymentInner = ({ formData, onBack, onPaymentSuccess, pendingId }) => {
  const { t } = useTranslation();
  const stripe = useStripe();
  const elements = useElements();
  const [payMethod, setPayMethod] = useState('card');
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');

  const billingId = formData.billing || 'annual';
  const durationObj = DUREES.find(d => d.id === billingId);
  const price = getBillingTotal(billingId);

  const labelStyle = { fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block' };

  const finalizeRegistration = async (resolvedPendingId) => {
    const response = await fetch(`${API_URL}/auth/finalize-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pendingId: resolvedPendingId }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      const msg = Array.isArray(errBody.message) ? errBody.message[0] : errBody.message;
      throw new Error(msg || 'Impossible de finaliser l’inscription');
    }

    return response.json();
  };

  const handlePay = async () => {
    if (!stripe || (payMethod === 'card' && !elements)) {
      setPayError("Stripe n'est pas prêt. Réessayez dans un instant.");
      return;
    }

    setPayLoading(true);
    setPayError('');

    try {
      // Créer le PaymentIntent avec le pendingId en metadata
      const res = await fetch(`${API_URL}/payment/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: price,
          paymentMethod: payMethod,
          email: formData.email,
          pendingId,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        const msg = Array.isArray(errBody.message) ? errBody.message[0] : errBody.message;
        throw new Error(msg || 'Impossible de créer le paiement');
      }

      const data = await res.json();
      const { clientSecret } = data;
      if (!clientSecret) throw new Error('Réponse paiement invalide');

      if (payMethod === 'twint') {
        sessionStorage.setItem('signupPendingEmail', formData.email);
        if (pendingId) sessionStorage.setItem('signupPendingId', pendingId);
        const result = await stripe.confirmTwintPayment(clientSecret, {
          payment_method: {},
          return_url: `${window.location.origin}${window.location.pathname}?signup=twint`,
        });
        if (result.error) {
          setPayError(result.error.message);
          setPayLoading(false);
        }
        return;
      }

      // Paiement par carte
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        setPayError(result.error.message);
        setPayLoading(false);
        return;
      }

      if (result.paymentIntent?.status !== 'succeeded') {
        setPayError('Paiement non confirmé. Réessayez.');
        setPayLoading(false);
        return;
      }

      // Paiement réussi → finaliser immédiatement pour garantir la création du compte et l'email
      sessionStorage.setItem('signupPendingEmail', formData.email);
      if (pendingId) sessionStorage.setItem('signupPendingId', pendingId);
      await finalizeRegistration(pendingId);

      // Afficher la page de vérification
      onPaymentSuccess();
    } catch (err) {
      setPayError(err.message || 'Erreur de paiement, veuillez réessayer.');
      setPayLoading(false);
    }
  };

  return (
    <div>
      {/* Résumé */}
      <div style={{ background: `${TEAL}0d`, border: `1px solid ${TEAL}30`, borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 2 }}>{t('auth.summary')}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>
              {durationObj ? t(durationObj.label) : ''}
            </div>
            <div style={{ fontSize: 11, color: '#64748b' }}>
              {formData.typeCompte === 'etablissement' ? 'Etablissement' : t('auth.client')}
            </div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: TEAL }}>{price} CHF</div>
        </div>
      </div>

      {/* Méthode de paiement */}
      <div style={{ marginBottom: 12 }}>
        <label style={labelStyle}>Méthode de paiement</label>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { id: 'card',  icon: '💳', label: 'Carte bancaire' },
            { id: 'twint', icon: '🔵', label: 'Twint' },
          ].map(m => (
            <div key={m.id} onClick={() => setPayMethod(m.id)} style={{
              flex: 1, border: `2px solid ${payMethod === m.id ? TEAL : '#e2e8f0'}`,
              borderRadius: 10, padding: '10px', cursor: 'pointer',
              background: payMethod === m.id ? `${TEAL}0d` : '#f8fafc',
              display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: 20 }}>{m.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: payMethod === m.id ? TEAL : '#475569' }}>
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Carte */}
      {payMethod === 'card' && (
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Informations de carte</label>
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', background: '#f8fafc' }}>
            <CardElement options={{
              style: {
                base: { fontSize: '14px', color: '#0f172a', '::placeholder': { color: '#94a3b8' } },
                invalid: { color: '#ef4444' },
              },
            }} />
          </div>
        </div>
      )}

      {/* Twint */}
      {payMethod === 'twint' && (
        <div style={{ marginBottom: 12, padding: '10px 14px', background: '#f0fdf9', border: `1px solid ${TEAL}30`, borderRadius: 10, fontSize: 12, color: '#0F6E56' }}>
          🔵 Vous serez redirigé vers l'application <strong>Twint</strong> pour confirmer le paiement.
        </div>
      )}

      {payError && (
        <p style={{ color: '#ef4444', fontSize: 12, textAlign: 'center', margin: '4px 0' }}>{payError}</p>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button onClick={onBack} style={{ flex: 1, padding: '8px', border: `1.5px solid ${TEAL}`, borderRadius: 10, background: 'transparent', color: TEAL, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
          {t('auth.back')}
        </button>
        <button onClick={handlePay} disabled={payLoading || !stripe || (payMethod === 'card' && !elements)} style={{
          flex: 2, padding: '8px', border: 'none', borderRadius: 10,
          background: payLoading ? '#94a3b8' : `linear-gradient(135deg, ${TEAL}, #0F6E56)`,
          color: '#fff', fontSize: 13, fontWeight: 800,
          cursor: payLoading ? 'not-allowed' : 'pointer',
        }}>
          {payLoading ? 'Paiement en cours...' : `Payer ${price} CHF`}
        </button>
      </div>
    </div>
  );
};

const StepPayment = (props) => (
  <Elements stripe={stripePromise}>
    <StepPaymentInner {...props} />
  </Elements>
);

// ─── Page après paiement ──────────────────────────────────────────────────────
const PendingVerification = ({ email }) => {
  const { t } = useTranslation();
  return (
    <div style={{ textAlign: 'center', padding: '32px 24px' }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: '#E1F5EE', border: `2px solid ${TEAL}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 16px',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
          stroke={TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
      </div>
      <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>
        🎉 Paiement confirmé !
      </h2>
      <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, maxWidth: 300, margin: '0 auto 16px' }}>
        {t('auth.verifyEmailSentTo')} <strong style={{ color: '#0f172a' }}>{email}</strong>.<br />
        {t('auth.verifyEmailClick')}
      </p>
      <div style={{
        background: '#E1F5EE', border: `1px solid ${TEAL}25`,
        borderRadius: 10, padding: '10px 14px',
        fontSize: 12, color: '#0F6E56',
        maxWidth: 300, margin: '0 auto',
      }}>
        {t('auth.verifyLinkExpires')} <strong>24 {t('auth.hours')}</strong>.<br />
        {t('auth.checkSpam')}
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const SignUp = ({ onStepChange }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingEmail, setPendingEmail] = useState(null);
  const [pendingId, setPendingId] = useState(null);

  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '',
    motDePasse: '', confirmationMotDePasse: '',
    typeCompte: 'etablissement', photo: null,
    billing: 'annual',
  });

  const handleSetStep = (newStep) => {
    setStep(newStep);
    if (onStepChange) onStepChange(newStep);
  };

  // Retour après Twint
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const redirectStatus = params.get('redirect_status');
    const paymentIntent = params.get('payment_intent');
    
    if (paymentIntent && redirectStatus === 'succeeded') {
      const email = sessionStorage.getItem('signupPendingEmail');
      const storedPendingId = sessionStorage.getItem('signupPendingId');
      (async () => {
        let finalized = false;
        try {
          if (!storedPendingId) {
            throw new Error('Impossible de retrouver la demande en attente après paiement.');
          }

          const response = await fetch(`${API_URL}/auth/finalize-registration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pendingId: storedPendingId }),
          });
          if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            const msg = Array.isArray(errBody.message) ? errBody.message[0] : errBody.message;
            throw new Error(msg || 'Impossible de finaliser l’inscription');
          }

          sessionStorage.removeItem('signupPendingEmail');
          sessionStorage.removeItem('signupPendingId');
          window.history.replaceState({}, '', window.location.pathname);
          finalized = true;
        } catch (err) {
          setError(err.message || 'Impossible de finaliser l’inscription après paiement.');
        } finally {
          if (finalized && email) {
            setPendingEmail(email);
          }
        }
      })();
    }
  }, []);

  const savePending = async () => {
    setLoading(true);
    setError('');
    try {
      const body = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        motDePasse: formData.motDePasse,
        confirmationMotDePasse: formData.confirmationMotDePasse,
        typeCompte: formData.typeCompte,
        billingPeriod: formData.billing,
      };

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        let msg = t('auth.errorCreate');
        try {
          const parsed = JSON.parse(text);
          msg = Array.isArray(parsed.message) ? parsed.message[0] : parsed.message || msg;
        } catch { /* ignore */ }
        throw new Error(msg);
      }

      const data = await response.json();
      setPendingId(data.pendingId);
      sessionStorage.setItem('signupPendingId', data.pendingId);
      return true;
    } catch (err) {
      setError(err.message || t('auth.errorCreate'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleStepInfoNext = async () => {
    const ok = await savePending();
    if (!ok) return;
    
    if (formData.typeCompte === 'etablissement') {
      handleSetStep(2);
    } else {
      handleSetStep(1);
    }
  };

  if (pendingEmail) {
    return <PendingVerification email={pendingEmail} />;
  }

  const isEtab = formData.typeCompte === 'etablissement';
  const titles = [t('auth.createAccount'), t('auth.chooseSubscription'), t('auth.paymentInfo')];
  const subtitles = [t('auth.fillInfo'), t('auth.choosePlan'), t('auth.finalizeSecure')];

  return (
    <div style={{ width: '100%', margin: '0 auto' }}>
      <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', textAlign: 'center', marginBottom: 2 }}>
        {titles[step] ?? titles[0]}
      </h2>
      <p style={{ fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 12 }}>
        {subtitles[step] ?? subtitles[0]}
      </p>

      <Steps current={step} />

      {step === 0 && (
        <StepInfo
          formData={formData}
          setFormData={setFormData}
          onNext={handleStepInfoNext}
          loading={loading}
          error={error}
        />
      )}

      {step === 1 && !isEtab && (
        <StepSubscription
          formData={formData}
          setFormData={setFormData}
          onNext={() => handleSetStep(2)}
          onBack={() => handleSetStep(0)}
        />
      )}

      {step === 2 && (
        <StepPayment
          formData={formData}
          pendingId={pendingId}
          onBack={() => handleSetStep(isEtab ? 0 : 1)}
          onPaymentSuccess={() => setPendingEmail(formData.email)}
        />
      )}
    </div>
  );
};

export default SignUp;