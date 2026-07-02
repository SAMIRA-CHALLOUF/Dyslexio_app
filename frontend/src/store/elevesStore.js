import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API, authHeaders } from '../styles/dashboardStyles';

const ElevesContext = createContext({
  eleves: [],
  loading: true,
  error: '',
  refresh: async () => {},
  setEleves: () => {},
});

export function ElevesProvider({ children }) {
  const [eleves, setEleves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Connectez-vous en tant qu’établissement.');
      const res = await fetch(`${API}/eleves`, { headers: authHeaders() });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || 'Impossible de charger les élèves');
      }
      const data = await res.json();
      setEleves(
        data.map((e) => ({
          ...e,
          id: String(e.id),
          paiement: {
            montant: e.paiement?.montant ?? 0,
            statut: e.paiement?.statut ?? 'en attente',
            reference: e.paiement?.reference ?? '',
            methode: e.paiement?.methode ?? 'especes',
            datePaiement: e.paiement?.datePaiement ?? '',
          },
        })),
      );
    } catch (e) {
      setError(e.message);
      setEleves([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <ElevesContext.Provider value={{ eleves, loading, error, refresh, setEleves }}>
      {children}
    </ElevesContext.Provider>
  );
}

export function useEleves() {
  return useContext(ElevesContext).eleves;
}

export function useElevesState() {
  return useContext(ElevesContext);
}

export async function updatePaiementStatut(id, statut) {
  const res = await fetch(`${API}/eleves/${id}/paiement`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ statut }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.message || 'Mise à jour impossible');
  }
  return res.json();
}

export function getPaiementStats(eleves) {
  const payes = eleves.filter((e) => e.paiement.statut === 'payé');
  const enAttente = eleves.filter((e) => e.paiement.statut === 'en attente');
  const retard = eleves.filter((e) => e.paiement.statut === 'retard');
  const total = eleves.reduce((s, e) => s + (e.paiement.montant || 0), 0);
  const encaisse = payes.reduce((s, e) => s + (e.paiement.montant || 0), 0);
  return { payes, enAttente, retard, total, encaisse };
}
