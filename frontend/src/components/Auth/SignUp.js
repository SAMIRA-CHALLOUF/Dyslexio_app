// src/components/Auth/SignUp.js
import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const TEAL = '#0D9373';

// ─── Step indicator ───────────────────────────────────────────────────────────
const Steps = ({ current, isEleve }) => {
  const { t } = useTranslation();
  const labels = isEleve ? [t('auth.stepInfo')] : [t('auth.stepInfo'), t('auth.stepSubscription'), t('auth.stepPayment')];
  if (isEleve) return null;
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
                background: done ? TEAL : active ? TEAL : '#e2e8f0',
                color: done || active ? '#fff' : '#94a3b8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 10, transition: 'all 0.3s',
                boxShadow: active ? `0 0 0 3px ${TEAL}25` : 'none',
              }}>
                {done ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: active ? TEAL : done ? TEAL : '#94a3b8' }}>
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

// ─── Plans data ───────────────────────────────────────────────────────────────
const PLANS = [
  {
    id: 'free', label: 'Free', price: { monthly: 0, biannual: 0, annual: 0, biennial: 0 },
    description: 'auth.plans.free.description',
    features: ['auth.plans.free.features.0','auth.plans.free.features.1','auth.plans.free.features.2','auth.plans.free.features.3'],
    highlight: false,
  },
  {
    id: 'go', label: 'Go', price: { monthly: 5, biannual: 27, annual: 48, biennial: 90 },
    description: 'auth.plans.go.description',
    features: ['auth.plans.go.features.0','auth.plans.go.features.1','auth.plans.go.features.2','auth.plans.go.features.3','auth.plans.go.features.4'],
    highlight: false,
  },
  {
    id: 'plus', label: 'Plus', price: { monthly: 20, biannual: 108, annual: 192, biennial: 360 },
    description: 'auth.plans.plus.description',
    features: ['auth.plans.plus.features.0','auth.plans.plus.features.1','auth.plans.plus.features.2','auth.plans.plus.features.3','auth.plans.plus.features.4'],
    highlight: true,
    badge: 'auth.popularBadge',
  },
  {
    id: 'pro', label: 'Pro', price: { monthly: 100, biannual: 540, annual: 960, biennial: 1800 },
    description: 'auth.plans.pro.description',
    features: ['auth.plans.pro.features.0','auth.plans.pro.features.1','auth.plans.pro.features.2','auth.plans.pro.features.3','auth.plans.pro.features.4'],
    highlight: false,
  },
];

const BILLING = [
  { id: 'biannual', label: 'auth.billing.biannual',  suffix: 'auth.billing.biannual.suffix',  discount: '10% OFF' },
  { id: 'annual',   label: 'auth.billing.annual',    suffix: 'auth.billing.annual.suffix',    discount: '20% OFF' },
  { id: 'biennial', label: 'auth.billing.biennial',  suffix: 'auth.billing.biennial.suffix',  discount: '25% OFF' },
];

// ─── Step 1 : Informations ────────────────────────────────────────────────────
const StepInfo = ({ formData, setFormData, onNext, onSubmitDirect, loading, error, success }) => {
  const { t } = useTranslation();
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [localError, setLocalError] = useState('');
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const isEleve = formData.typeCompte === 'eleve';

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
    if (isEleve) {
      onSubmitDirect();
    } else {
      onNext();
    }
  };

  const inputStyle = {
    width: '100%', padding: '7px 12px', border: '1.5px solid #e2e8f0',
    borderRadius: 10, fontSize: 13, background: '#f8fafc', outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s',
  };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 2, display: 'block' };

  return (
    <form onSubmit={handleNext}>
      <div style={{ display: 'flex', gap: 16, marginBottom: 12, alignItems: 'center' }}>
        {/* Photo upload */}
        <div onClick={() => fileRef.current.click()} style={{
          width: 56, height: 56, borderRadius: '50%', cursor: 'pointer', flexShrink: 0,
          border: `2px dashed ${TEAL}`, background: '#f0fdf9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', position: 'relative',
        }}>
          {preview ? (
            <img src={preview} alt={t('auth.photoAlt')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ textAlign: 'center', color: TEAL }}>
              <div style={{ fontSize: 16, marginBottom: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="1.8">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div style={{ fontSize: 9, fontWeight: 800 }}>{t('auth.photo')}</div>
            </div>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />

        {/* Noms */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 12, flex: 1 }}>
          <div>
            <label style={labelStyle}>{t('auth.nom')}</label>
            <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder={t('auth.nom')} required style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>{t('auth.prenom')}</label>
            <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} placeholder={t('auth.prenom')} required style={inputStyle} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 12, rowGap: 10 }}>
        <div>
          <label style={labelStyle}>{t('auth.email')}</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder={t('auth.emailPlaceholder')} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>{t('auth.accountType')}</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {['eleve', 'client'].map(type => (
              <button key={type} type="button" onClick={() => setFormData(p => ({ ...p, typeCompte: type }))}
                style={{
                  flex: 1, padding: '6px 0', border: `1.5px solid ${formData.typeCompte === type ? TEAL : '#e2e8f0'}`,
                  borderRadius: 10, background: formData.typeCompte === type ? `${TEAL}15` : '#f8fafc',
                  color: formData.typeCompte === type ? TEAL : '#64748b', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}>
                {type === 'eleve' ? t('auth.student') : t('auth.client')}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>{t('auth.password')}</label>
          <div style={{ position: 'relative' }}>
            <input type={showPass ? 'text' : 'password'} name="motDePasse" value={formData.motDePasse} onChange={handleChange}
              placeholder={t('auth.password')} required style={{ ...inputStyle, paddingRight: 36 }} />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>

        <div>
          <label style={labelStyle}>{t('auth.confirmPassword')}</label>
          <div style={{ position: 'relative' }}>
            <input type={showConf ? 'text' : 'password'} name="confirmationMotDePasse" value={formData.confirmationMotDePasse} onChange={handleChange}
              placeholder={t('auth.confirmPassword')} required style={{ ...inputStyle, paddingRight: 36 }} />
            <button type="button" onClick={() => setShowConf(!showConf)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>
      </div>

      {(localError || error) && (
        <p style={{ color: '#ef4444', fontSize: 12, textAlign: 'center', margin: '4px 0 0' }}>
          {localError || error}
        </p>
      )}
      {success && (
        <p style={{ color: '#10b981', fontSize: 12, textAlign: 'center', margin: '4px 0' }}>
          ✅ {t('auth.successCreated')}
        </p>
      )}

      <button type="submit" disabled={loading} style={{
        marginTop: 12, width: '100%', padding: '9px', border: 'none', borderRadius: 10,
        background: loading ? '#94a3b8' : `linear-gradient(135deg, ${TEAL}, #0F6E56)`, color: '#fff',
        fontSize: 14, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
      }}>
        {loading
          ? t('auth.creating')
          : isEleve
            ? t('auth.createBtn')
            : t('auth.next')
        }
      </button>
    </form>
  );
};

// ─── Step 2 : Abonnement ──────────────────────────────────────────────────────
const DUREES = [
  { id: 'biannual', label: 'auth.durations.biannual', pricePerMonth: 9, total: 54,  savings: null,   popular: false },
  { id: 'annual',   label: 'auth.durations.annual',   pricePerMonth: 7, total: 84,  savings: '−17%', popular: true  },
  { id: 'biennial', label: 'auth.durations.biennial',  pricePerMonth: 5, total: 120, savings: '−38%', popular: false },
];

const FEATURES = [
  'auth.features.0',
  'auth.features.1',
  'auth.features.2',
  'auth.features.3',
  'auth.features.4',
  'auth.features.5',
  'auth.features.6',
  'auth.features.7',
];

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
                <span style={{ fontSize: 12, fontWeight: 700, color: active ? TEAL : '#64748b' }}>{d.label}</span>
                {d.savings && (
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, background: '#E1F5EE', color: TEAL }}>
                    {d.savings}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                <span style={{ fontSize: 30, fontWeight: 900, color: active ? TEAL : '#0f172a' }}>{d.pricePerMonth}€</span>
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
          {(t('auth.features', { returnObjects: true })).map((f, i) => (
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
const StepPayment = ({ formData, onBack, onSubmit, loading, error, success }) => {
  const { t } = useTranslation();
  const [pay, setPay] = useState({ cardNumber: '', name: '', expiry: '', cvv: '' });

  const handleChange = (e) => setPay(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const formatCard = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (val) => {
    let v = val.replace(/\D/g, '').slice(0, 4);
    return v.length > 2 ? v.slice(0, 2) + '/' + v.slice(2) : v;
  };

  const plan = PLANS.find(p => p.id === (formData.plan || 'plus'));
  const billingObj = BILLING.find(b => b.id === (formData.billing || 'annual'));
  const price = plan?.price[formData.billing || 'annual'] || 0;

  const inputStyle = {
    width: '100%', padding: '6px 10px', border: '1.5px solid #e2e8f0',
    borderRadius: 8, fontSize: 13, background: '#f8fafc', outline: 'none',
  };
  const labelStyle = { fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 2, display: 'block' };

  return (
    <div>
      <div style={{ background: `${TEAL}0d`, border: `1px solid ${TEAL}30`, borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 2 }}>{t('auth.summary')}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>Plan {plan?.label}</div>
            <div style={{ fontSize: 11, color: '#64748b' }}>{t('auth.billing')} : {billingObj?.label}</div>
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: TEAL }}>
            ${price}<span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{billingObj?.suffix}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 10, rowGap: 8 }}>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>{t('auth.cardNumber')}</label>
          <input name="cardNumber" value={pay.cardNumber}
            onChange={e => setPay(p => ({ ...p, cardNumber: formatCard(e.target.value) }))}
            placeholder="0000 0000 0000 0000" style={inputStyle} />
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <label style={labelStyle}>{t('auth.cardName')}</label>
          <input name="name" value={pay.name} onChange={handleChange} placeholder={t('auth.cardNamePlaceholder')} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>{t('auth.expiry')}</label>
          <input name="expiry" value={pay.expiry}
            onChange={e => setPay(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
            placeholder="MM/AA" style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>{t('auth.cvv')}</label>
          <input name="cvv" value={pay.cvv}
            onChange={e => setPay(p => ({ ...p, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) }))}
            placeholder="123" style={inputStyle} />
        </div>
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: 12, textAlign: 'center', margin: '4px 0' }}>{error}</p>}
      {success && <p style={{ color: '#10b981', fontSize: 12, textAlign: 'center', margin: '4px 0' }}>✅ {t('auth.successCreated')}</p>}

      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
        <button onClick={onBack} style={{ flex: 1, padding: '8px', border: `1.5px solid ${TEAL}`, borderRadius: 10, background: 'transparent', color: TEAL, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
          {t('auth.back')}
        </button>
        <button onClick={onSubmit} disabled={loading} style={{ flex: 2, padding: '8px', border: 'none', borderRadius: 10, background: loading ? '#94a3b8' : `linear-gradient(135deg, ${TEAL}, #0F6E56)`, color: '#fff', fontSize: 13, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? t('auth.creating') : t('auth.createBtn')}
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────
// ─── Page vérification email (client) ────────────────────────────────────────
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
      {t('auth.verifyEmailTitle')}
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

// ─── Main Component ────────────────────────────────────────────────────────────
const SignUp = ({ onStepChange }) => {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [pendingEmail, setPendingEmail] = useState(null); // ← nouveau

  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '',
    motDePasse: '', confirmationMotDePasse: '',
    typeCompte: 'eleve', photo: null,
    plan: 'plus', billing: 'annual',
  });

  const isEleve = formData.typeCompte === 'eleve';

  const handleSetStep = (newStep) => {
    setStep(newStep);
    if (onStepChange) onStepChange(newStep);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = isEleve
        ? 'http://localhost:3001/eleve'
        : 'http://localhost:3001/client';

      // ✅ JSON au lieu de FormData
      const body = isEleve
        ? {
            nom:                    formData.nom,
            prenom:                 formData.prenom,
            email:                  formData.email,
            motDePasse:             formData.motDePasse,
            confirmationMotDePasse: formData.confirmationMotDePasse,
            typeCompte:             formData.typeCompte,
          }
        : {
            nom:                    formData.nom,
            prenom:                 formData.prenom,
            email:                  formData.email,
            motDePasse:             formData.motDePasse,
            confirmationMotDePasse: formData.confirmationMotDePasse,
            typeCompte:             formData.typeCompte,
            billingPeriod:          formData.billing,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        let msg = t('auth.errorCreate');
        try {
          const parsed = JSON.parse(text);
          // NestJS renvoie parfois message comme tableau
          if (Array.isArray(parsed.message)) msg = parsed.message[0];
          else msg = parsed.message || msg;
        } catch {}
        throw new Error(msg);
      }

      if (isEleve) {
        setSuccess(true); // élève → compte créé direct
      } else {
        setPendingEmail(formData.email); // client → page vérification email
      }

    } catch (err) {
      setError(err.message || t('auth.errorCreate'));
    } finally {
      setLoading(false);
    }
  };

  // Client → afficher page vérification email
  if (pendingEmail) {
    return <PendingVerification email={pendingEmail} />;
  }

  const titles = isEleve
    ? [t('auth.createAccount')]
    : [t('auth.createAccount'), t('auth.chooseSubscription'), t('auth.paymentInfo')];

  const subtitles = isEleve
    ? [t('auth.fillInfo')]
    : [t('auth.fillInfo'), t('auth.choosePlan'), t('auth.finalizeSecure')];

  return (
    <div style={{ width: '100%', margin: '0 auto' }}>
      <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', textAlign: 'center', marginBottom: 2 }}>
        {titles[step] ?? titles[0]}
      </h2>
      <p style={{ fontSize: 12, color: '#64748b', textAlign: 'center', marginBottom: 12 }}>
        {subtitles[step] ?? subtitles[0]}
      </p>

      {!isEleve && <Steps current={step} isEleve={isEleve} />}

      {step === 0 && (
        <StepInfo
          formData={formData} setFormData={setFormData}
          onNext={() => handleSetStep(1)}
          onSubmitDirect={handleSubmit}
          loading={loading} error={error} success={success}
        />
      )}
      {step === 1 && !isEleve && (
        <StepSubscription
          formData={formData} setFormData={setFormData}
          onNext={() => handleSetStep(2)}
          onBack={() => handleSetStep(0)}
        />
      )}
      {step === 2 && !isEleve && (
        <StepPayment
          formData={formData}
          onBack={() => handleSetStep(1)}
          onSubmit={handleSubmit}
          loading={loading} error={error} success={success}
        />
      )}
    </div>
  );
};

export default SignUp;