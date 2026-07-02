// src/pages/ProfilePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, User, Mail, CheckCircle, Trash2, ArrowLeft, Loader2, Save } from 'lucide-react';

const BACKEND = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export default function ProfilePage({ user, onUserUpdate, onLogout }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Profile form states
  const [formData, setFormData] = useState({ nom: '', prenom: '', email: '' });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Determine user role path
  const rolePath = user?.typeCompte === 'etablissement' ? 'etablissement' : 'client';

  useEffect(() => {
    if (user) {
      setFormData({ 
        nom: user.nom || '', 
        prenom: user.prenom || '', 
        email: user.email || ''
      });
      if (user.image) setImagePreview(user.image);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccessMsg('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const payload = { nom: formData.nom, prenom: formData.prenom, email: formData.email };
      if (imagePreview && imagePreview !== user?.image) payload.image = imagePreview;

      const res = await fetch(`${BACKEND}/${rolePath}/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(t('profile.saveError', 'Erreur lors de la sauvegarde'));
      const updated = await res.json();
      
      // Keep existing properties like typeCompte when updating context
      if (onUserUpdate) onUserUpdate({ ...user, ...updated });
      
      setSuccessMsg(t('profile.saveSuccess', 'Profil mis à jour avec succès !'));
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccessMsg(''), 3000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('profile.deleteConfirm', 'Voulez-vous vraiment supprimer votre compte ?'))) return;
    if (!user?.id) return;
    try {
      await fetch(`${BACKEND}/${rolePath}/${user.id}`, { method: 'DELETE' });
      if (onLogout) onLogout();
      navigate('/');
    } catch {
      setError(t('profile.saveError', 'Erreur lors de la suppression'));
    }
  };

  const avatarLetter = user?.prenom?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-teal-200 selection:text-teal-900">
      
      {/* Top Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center text-xl shadow-lg shadow-teal-500/20">
            📖
          </div>
          <span className="font-extrabold text-xl text-slate-900 tracking-tight">Logopédie</span>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold transition-colors"
        >
          <ArrowLeft size={18} />
          {t('profile.backHome', 'Retour')}
        </button>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Header */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl font-black text-slate-900 mb-2">{t('profile.title', 'Mon Profil')}</h1>
        
          <p className="text-slate-500 font-medium">
            Gérez vos informations personnelles et vos paramètres de sécurité.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Left Column - Avatar & Role */}
          <div className="w-full md:w-80 flex-shrink-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Avatar Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 flex flex-col items-center border border-slate-100 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-teal-50 to-emerald-50 -z-10 group-hover:scale-105 transition-transform duration-700"></div>
              
              <div className="relative mb-6">
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-2xl shadow-teal-500/20 bg-teal-500 flex items-center justify-center text-5xl font-black text-white relative z-10 group-hover:-translate-y-1 transition-transform duration-300">
                  {imagePreview ? (
                    <img src={imagePreview} alt="profil" className="w-full h-full object-cover" />
                  ) : (
                    avatarLetter
                  )}
                </div>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100 text-teal-600 hover:text-teal-700 hover:scale-110 transition-all z-20"
                  title="Modifier la photo"
                  type="button"
                >
                  <Camera size={20} strokeWidth={2.5} />
                </button>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

              <h2 className="text-xl font-bold text-slate-800 mb-1">{formData.prenom} {formData.nom}</h2>
              <p className="text-sm text-slate-500 font-medium mb-6">{formData.email}</p>
              
              <div className="w-full px-4 py-3 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rôle</span>
                <span className="text-xs font-extrabold text-teal-700 bg-teal-100 px-3 py-1 rounded-full uppercase tracking-wide">
                  {user?.typeCompte || 'Client'}
                </span>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-6 bg-red-50/50 rounded-3xl p-6 border border-red-100">
              <h3 className="text-sm font-bold text-red-800 mb-2 uppercase tracking-wider">{t('profile.dangerZone', 'Zone de danger')}</h3>
              <p className="text-xs text-red-600/80 mb-4 font-medium leading-relaxed">
                La suppression de votre compte est irréversible et supprimera toutes vos données associées.
              </p>
              <button 
                onClick={handleDelete}
                type="button"
                className="w-full py-2.5 px-4 bg-white border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                {t('profile.deleteAccount', 'Supprimer le compte')}
              </button>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="flex-1 w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                <User size={18} strokeWidth={2.5} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">{t('profile.accountDetails', 'Informations personnelles')}</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Prénom */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">{t('profile.firstName', 'Prénom')}</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                      <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      name="prenom" 
                      value={formData.prenom} 
                      onChange={handleChange} 
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Nom */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">{t('profile.lastName', 'Nom')}</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                      <User size={18} />
                    </div>
                    <input 
                      type="text" 
                      name="nom" 
                      value={formData.nom} 
                      onChange={handleChange} 
                      required
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2 mb-8">
                <label className="text-sm font-bold text-slate-700 ml-1">{t('profile.emailAddress', 'Adresse email')}</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-teal-500 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Alerts */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
                  <div className="text-red-500 mt-0.5">⚠️</div>
                  <div className="text-sm font-semibold text-red-800">{error}</div>
                </div>
              )}

              {successMsg && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
                  <div className="text-emerald-500 mt-0.5"><CheckCircle size={18} /></div>
                  <div className="text-sm font-semibold text-emerald-800">{successMsg}</div>
                </div>
              )}

              {/* Submit Action */}
              <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="relative overflow-hidden group py-3 px-8 rounded-xl bg-slate-900 text-white text-sm font-bold shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 transition-all flex items-center gap-2"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <><Loader2 size={18} className="animate-spin" /> {t('profile.saving', 'Sauvegarde...')}</>
                    ) : (
                      <><Save size={18} /> {t('profile.saveChanges', 'Enregistrer')}</>
                    )}
                  </span>
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}