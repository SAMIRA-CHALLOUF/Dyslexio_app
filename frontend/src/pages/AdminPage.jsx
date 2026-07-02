import React, { useCallback, useEffect, useState } from 'react';
import { TEAL, CREAM, DARK } from '../constants/colors';

const API = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const card = {
  maxWidth: 1100,
  margin: '0 auto',
  padding: 24,
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 4px 24px rgba(26,26,46,0.08)',
  border: '1px solid #e8e4dc',
};

const btnPrimary = {
  padding: '12px 20px',
  background: TEAL,
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: "'Nunito', sans-serif",
};

const btnGhost = {
  ...btnPrimary,
  background: 'transparent',
  color: DARK,
  border: `1px solid ${DARK}33`,
};

function useAdminApi() {
  const token = () => localStorage.getItem('adminToken');

  const req = useCallback(async (path, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    const t = token();
    if (t) headers.Authorization = `Bearer ${t}`;
    const res = await fetch(`${API}${path}`, { ...options, headers });
    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { message: text };
    }
    if (!res.ok) {
      const msg =
        data?.message ||
        (Array.isArray(data?.message) ? data.message.join(', ') : null) ||
        `Erreur ${res.status}`;
      throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
    return data;
  }, []);

  return { req, token };
}

export default function AdminPage() {
  const { req, token } = useAdminApi();
  const [authed, setAuthed] = useState(!!token());
  const [tab, setTab] = useState('users');
  const [userSubTab, setUserSubTab] = useState('clients');
  const [err, setErr] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', motDePasse: '' });
  const [registerForm, setRegisterForm] = useState({
    nom: '',
    email: '',
    motDePasse: '',
  });
  const [showRegister, setShowRegister] = useState(false);
  const [clients, setClients] = useState([]);
  const [eleves, setEleves] = useState([]);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(false);

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminProfile');
    setAuthed(false);
  };

  const loadClients = useCallback(async () => {
    const data = await req('/admin/users/clients');
    setClients(data);
  }, [req]);

  const loadEleves = useCallback(async () => {
    const data = await req('/admin/users/eleves');
    setEleves(data);
  }, [req]);

  const loadSubs = useCallback(async () => {
    const data = await req('/admin/subscriptions/clients');
    setSubs(data);
  }, [req]);

  useEffect(() => {
    if (!authed) return;
    setErr('');
    setLoading(true);
    (async () => {
      try {
        if (tab === 'users') {
          if (userSubTab === 'clients') await loadClients();
          else await loadEleves();
        } else {
          await loadSubs();
        }
      } catch (e) {
        setErr(e.message);
        if (e.message.includes('401') || e.message.includes('Token')) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [authed, tab, userSubTab, loadClients, loadEleves, loadSubs]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const data = await req('/admin/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      });
      localStorage.setItem('adminToken', data.access_token);
      localStorage.setItem('adminProfile', JSON.stringify(data.admin));
      setAuthed(true);
    } catch (e) {
      setErr(e.message);
    }
  };

  const handleRegisterFirst = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await req('/admin/auth/register-first', {
        method: 'POST',
        body: JSON.stringify(registerForm),
      });
      setShowRegister(false);
      setErr('');
      alert('Compte créé. Connectez-vous.');
    } catch (e) {
      setErr(e.message);
    }
  };

  const deleteClient = async (id) => {
    if (!window.confirm('Supprimer ce client ?')) return;
    setErr('');
    try {
      await req(`/admin/users/clients/${id}`, { method: 'DELETE' });
      await loadClients();
    } catch (e) {
      setErr(e.message);
    }
  };

  const deleteEleve = async (id) => {
    if (!window.confirm('Supprimer cet élève ?')) return;
    setErr('');
    try {
      await req(`/admin/users/eleves/${id}`, { method: 'DELETE' });
      await loadEleves();
    } catch (e) {
      setErr(e.message);
    }
  };

  const saveSubscription = async (id, payload) => {
    setErr('');
    try {
      await req(`/admin/subscriptions/clients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      await loadSubs();
    } catch (e) {
      setErr(e.message);
    }
  };

  if (!authed) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: CREAM,
          padding: 32,
          fontFamily: "'Atkinson Hyperlegible', sans-serif",
        }}
      >
        <div style={{ ...card, maxWidth: 440 }}>
          <h1 style={{ color: DARK, marginTop: 0, fontSize: 26 }}>Administration</h1>
          <p style={{ color: '#555', fontSize: 15, lineHeight: 1.5 }}>
            Connexion réservée aux administrateurs. Cette zone permet uniquement la
            gestion des utilisateurs et des abonnements.
          </p>
          {err && (
            <div
              style={{
                background: '#fee2e2',
                color: '#991b1b',
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 14,
              }}
            >
              {err}
            </div>
          )}
          {!showRegister ? (
            <form onSubmit={handleLogin}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                required
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm((f) => ({ ...f, email: e.target.value }))
                }
                style={inputStyle}
              />
              <label style={labelStyle}>Mot de passe</label>
              <input
                type="password"
                required
                value={loginForm.motDePasse}
                onChange={(e) =>
                  setLoginForm((f) => ({ ...f, motDePasse: e.target.value }))
                }
                style={inputStyle}
              />
              <button type="submit" style={{ ...btnPrimary, width: '100%', marginTop: 8 }}>
                Se connecter
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterFirst}>
              <p style={{ fontSize: 14, color: '#64748b' }}>
                Uniquement si aucun administrateur n’existe encore dans la base.
              </p>
              <label style={labelStyle}>Nom</label>
              <input
                required
                value={registerForm.nom}
                onChange={(e) =>
                  setRegisterForm((f) => ({ ...f, nom: e.target.value }))
                }
                style={inputStyle}
              />
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                required
                value={registerForm.email}
                onChange={(e) =>
                  setRegisterForm((f) => ({ ...f, email: e.target.value }))
                }
                style={inputStyle}
              />
              <label style={labelStyle}>Mot de passe</label>
              <input
                type="password"
                minLength={6}
                required
                value={registerForm.motDePasse}
                onChange={(e) =>
                  setRegisterForm((f) => ({ ...f, motDePasse: e.target.value }))
                }
                style={inputStyle}
              />
              <button type="submit" style={{ ...btnPrimary, width: '100%', marginTop: 8 }}>
                Créer le premier administrateur
              </button>
            </form>
          )}
          <button
            type="button"
            onClick={() => {
              setShowRegister(!showRegister);
              setErr('');
            }}
            style={{ ...btnGhost, width: '100%', marginTop: 12 }}
          >
            {showRegister ? '← Retour à la connexion' : 'Premier administrateur ?'}
          </button>
        </div>
      </div>
    );
  }

  const profile = JSON.parse(localStorage.getItem('adminProfile') || '{}');

  return (
    <div
      style={{
        minHeight: '100vh',
        background: CREAM,
        padding: '24px 16px 48px',
        fontFamily: "'Atkinson Hyperlegible', sans-serif",
        color: DARK,
      }}
    >
      <div style={card}>
        <header
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 24,
            borderBottom: '1px solid #e8e4dc',
            paddingBottom: 16,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 24 }}>Console admin</h1>
            <p style={{ margin: '6px 0 0', color: '#64748b', fontSize: 14 }}>
              {profile.nom} — {profile.email}
            </p>
          </div>
          <button type="button" onClick={logout} style={btnGhost}>
            Déconnexion
          </button>
        </header>

        <nav style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setTab('users')}
            style={tab === 'users' ? btnPrimary : btnGhost}
          >
            Utilisateurs
          </button>
          <button
            type="button"
            onClick={() => setTab('subs')}
            style={tab === 'subs' ? btnPrimary : btnGhost}
          >
            Abonnements
          </button>
        </nav>

        {tab === 'users' && (
          <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => setUserSubTab('clients')}
              style={userSubTab === 'clients' ? btnPrimary : btnGhost}
            >
              Clients
            </button>
            <button
              type="button"
              onClick={() => setUserSubTab('eleves')}
              style={userSubTab === 'eleves' ? btnPrimary : btnGhost}
            >
              Élèves
            </button>
          </div>
        )}

        {err && (
          <div
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              fontSize: 14,
            }}
          >
            {err}
          </div>
        )}

        {loading ? (
          <p style={{ color: '#64748b' }}>Chargement…</p>
        ) : tab === 'users' && userSubTab === 'clients' ? (
          <UsersTable
            rows={clients}
            kind="client"
            onDelete={deleteClient}
            onSaved={loadClients}
            req={req}
            setErr={setErr}
          />
        ) : tab === 'users' ? (
          <UsersTable
            rows={eleves}
            kind="eleve"
            onDelete={deleteEleve}
            onSaved={loadEleves}
            req={req}
            setErr={setErr}
          />
        ) : (
          <SubscriptionsTable rows={subs} onSave={saveSubscription} />
        )}
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 600, marginBottom: 6, fontSize: 14 };
const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #ccc',
  marginBottom: 14,
  fontSize: 15,
  boxSizing: 'border-box',
};

function UsersTable({ rows, kind, onDelete, onSaved, req, setErr }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const startEdit = (row) => {
    setEditing(row.id);
    setForm({
      nom: row.nom,
      prenom: row.prenom,
      email: row.email,
      ...(kind === 'client' ? { status: row.status } : {}),
    });
  };

  const save = async (id) => {
    setErr('');
    try {
      const path =
        kind === 'client'
          ? `/admin/users/clients/${id}`
          : `/admin/users/eleves/${id}`;
      await req(path, { method: 'PATCH', body: JSON.stringify(form) });
      setEditing(null);
      await onSaved();
    } catch (e) {
      setErr(e.message);
    }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #e8e4dc' }}>
            <th style={th}>ID</th>
            <th style={th}>Nom</th>
            <th style={th}>Prénom</th>
            <th style={th}>Email</th>
            {kind === 'client' && <th style={th}>Statut</th>}
            <th style={th} />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} style={{ borderBottom: '1px solid #eee' }}>
              {editing === row.id ? (
                <>
                  <td style={td}>{row.id}</td>
                  <td style={td}>
                    <input
                      value={form.nom}
                      onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                      style={{ ...inputStyle, marginBottom: 0 }}
                    />
                  </td>
                  <td style={td}>
                    <input
                      value={form.prenom}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, prenom: e.target.value }))
                      }
                      style={{ ...inputStyle, marginBottom: 0 }}
                    />
                  </td>
                  <td style={td}>
                    <input
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      style={{ ...inputStyle, marginBottom: 0 }}
                    />
                  </td>
                  {kind === 'client' && (
                    <td style={td}>
                      <select
                        value={form.status}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, status: e.target.value }))
                        }
                        style={{ ...inputStyle, marginBottom: 0 }}
                      >
                        <option value="pending">pending</option>
                        <option value="active">active</option>
                      </select>
                    </td>
                  )}
                  <td style={td}>
                    <button
                      type="button"
                      style={{ ...btnPrimary, padding: '8px 12px', fontSize: 13 }}
                      onClick={() => save(row.id)}
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      style={{ ...btnGhost, padding: '8px 12px', fontSize: 13, marginLeft: 6 }}
                      onClick={() => setEditing(null)}
                    >
                      Annuler
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td style={td}>{row.id}</td>
                  <td style={td}>{row.nom}</td>
                  <td style={td}>{row.prenom}</td>
                  <td style={td}>{row.email}</td>
                  {kind === 'client' && <td style={td}>{row.status}</td>}
                  <td style={td}>
                    <button
                      type="button"
                      style={{ ...btnGhost, padding: '8px 12px', fontSize: 13 }}
                      onClick={() => startEdit(row)}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      style={{ ...btnGhost, padding: '8px 12px', fontSize: 13, marginLeft: 6 }}
                      onClick={() => onDelete(row.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && !editing && (
        <p style={{ color: '#64748b', marginTop: 16 }}>Aucun enregistrement.</p>
      )}
    </div>
  );
}

const th = { padding: '10px 8px', fontFamily: "'Nunito', sans-serif" };
const td = { padding: '10px 8px', verticalAlign: 'middle' };

function SubscriptionsTable({ rows, onSave }) {
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});

  const startEdit = (row) => {
    setEditing(row.id);
    setForm({
      billingPeriod: row.billingPeriod,
      status: row.status,
      subscribedAt: row.subscribedAt?.slice?.(0, 10) || '',
      expiresAt: row.expiresAt?.slice?.(0, 10) || '',
    });
  };

  const save = async (id) => {
    const payload = {
      billingPeriod: form.billingPeriod,
      status: form.status,
    };
    if (form.subscribedAt) payload.subscribedAt = `${form.subscribedAt}T12:00:00.000Z`;
    if (form.expiresAt) payload.expiresAt = `${form.expiresAt}T12:00:00.000Z`;
    await onSave(id, payload);
    setEditing(null);
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <p style={{ color: '#64748b', fontSize: 14, marginTop: 0 }}>
        Période de facturation, dates et statut du compte. Si vous ne changez que la période,
        la date de fin est recalculée à partir de la date de souscription actuelle.
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #e8e4dc' }}>
            <th style={th}>ID</th>
            <th style={th}>Nom</th>
            <th style={th}>Email</th>
            <th style={th}>Période</th>
            <th style={th}>Début</th>
            <th style={th}>Fin</th>
            <th style={th}>Statut</th>
            <th style={th} />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} style={{ borderBottom: '1px solid #eee' }}>
              {editing === row.id ? (
                <>
                  <td style={td}>{row.id}</td>
                  <td style={td}>
                    {row.prenom} {row.nom}
                  </td>
                  <td style={td}>{row.email}</td>
                  <td style={td}>
                    <select
                      value={form.billingPeriod}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, billingPeriod: e.target.value }))
                      }
                      style={{ ...inputStyle, marginBottom: 0 }}
                    >
                      <option value="biannual">biannual</option>
                      <option value="annual">annual</option>
                      <option value="biennial">biennial</option>
                    </select>
                  </td>
                  <td style={td}>
                    <input
                      type="date"
                      value={form.subscribedAt}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, subscribedAt: e.target.value }))
                      }
                      style={{ ...inputStyle, marginBottom: 0 }}
                    />
                  </td>
                  <td style={td}>
                    <input
                      type="date"
                      value={form.expiresAt}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, expiresAt: e.target.value }))
                      }
                      style={{ ...inputStyle, marginBottom: 0 }}
                    />
                  </td>
                  <td style={td}>
                    <select
                      value={form.status}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, status: e.target.value }))
                      }
                      style={{ ...inputStyle, marginBottom: 0 }}
                    >
                      <option value="pending">pending</option>
                      <option value="active">active</option>
                    </select>
                  </td>
                  <td style={td}>
                    <button
                      type="button"
                      style={{ ...btnPrimary, padding: '8px 12px', fontSize: 13 }}
                      onClick={() => save(row.id)}
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      style={{ ...btnGhost, padding: '8px 12px', fontSize: 13, marginLeft: 6 }}
                      onClick={() => setEditing(null)}
                    >
                      Annuler
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td style={td}>{row.id}</td>
                  <td style={td}>
                    {row.prenom} {row.nom}
                  </td>
                  <td style={td}>{row.email}</td>
                  <td style={td}>{row.billingPeriod}</td>
                  <td style={td}>
                    {row.subscribedAt
                      ? new Date(row.subscribedAt).toLocaleDateString('fr-FR')
                      : '—'}
                  </td>
                  <td style={td}>
                    {row.expiresAt
                      ? new Date(row.expiresAt).toLocaleDateString('fr-FR')
                      : '—'}
                  </td>
                  <td style={td}>{row.status}</td>
                  <td style={td}>
                    <button
                      type="button"
                      style={{ ...btnGhost, padding: '8px 12px', fontSize: 13 }}
                      onClick={() => startEdit(row)}
                    >
                      Modifier
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <p style={{ color: '#64748b', marginTop: 16 }}>Aucun client.</p>}
    </div>
  );
}
