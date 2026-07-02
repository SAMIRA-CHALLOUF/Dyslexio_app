import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TEAL, CREAM, DARK } from '../../constants/colors';
import { adminService } from './utils/adminService';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', motDePasse: '' });
  const [register, setRegister] = useState({ nom: '', email: '', motDePasse: '' });
  const [mode, setMode] = useState('login');
  const [err, setErr] = useState('');

  const onLogin = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');
      localStorage.setItem('adminToken', data.access_token);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));
      navigate('/admin');
    } catch (ex) {
      setErr(ex.message);
    }
  };

  const onRegister = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/admin/auth/register-first`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(register),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');
      setMode('login');
      alert(data.message);
    } catch (ex) {
      setErr(ex.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: CREAM, display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 16, width: '100%', maxWidth: 400, boxShadow: '0 8px 32px #0001' }}>
        <h1 style={{ color: DARK, marginTop: 0 }}>Administration</h1>
        {err && <p style={{ color: '#b91c1c', fontSize: 14 }}>{err}</p>}
        {mode === 'login' ? (
          <form onSubmit={onLogin}>
            <input type="email" required placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: '100%', marginBottom: 12, padding: 10 }} />
            <input type="password" required placeholder="Mot de passe" value={form.motDePasse} onChange={(e) => setForm({ ...form, motDePasse: e.target.value })} style={{ width: '100%', marginBottom: 12, padding: 10 }} />
            <button type="submit" style={{ width: '100%', padding: 12, background: TEAL, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700 }}>Connexion</button>
          </form>
        ) : (
          <form onSubmit={onRegister}>
            <input required placeholder="Nom" value={register.nom} onChange={(e) => setRegister({ ...register, nom: e.target.value })} style={{ width: '100%', marginBottom: 12, padding: 10 }} />
            <input type="email" required placeholder="Email" value={register.email} onChange={(e) => setRegister({ ...register, email: e.target.value })} style={{ width: '100%', marginBottom: 12, padding: 10 }} />
            <input type="password" required minLength={6} placeholder="Mot de passe" value={register.motDePasse} onChange={(e) => setRegister({ ...register, motDePasse: e.target.value })} style={{ width: '100%', marginBottom: 12, padding: 10 }} />
            <button type="submit" style={{ width: '100%', padding: 12, background: TEAL, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700 }}>Creer le premier admin</button>
          </form>
        )}
        <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ marginTop: 12, width: '100%', background: 'none', border: 'none', color: TEAL, cursor: 'pointer' }}>
          {mode === 'login' ? 'Premier administrateur ?' : 'Retour connexion'}
        </button>
      </div>
    </div>
  );
}
