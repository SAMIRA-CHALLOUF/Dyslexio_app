import { useState, useEffect } from "react";

export type Paiement = {
  methode: "virement" | "especes" | "cheque" | "carte";
  montant: number;
  rib?: string;
  titulaire?: string;
  reference: string;
  datePaiement: string;
  statut: "payé" | "en attente" | "retard";
};

export type Eleve = {
  id: string;
  nom: string;
  prenom: string;
  dateNaissance?: string;
  niveau: string;
  classe: string;
  email?: string;
  telephone?: string;
  parentNom: string;
  parentTelephone: string;
  paiement: Paiement;
  dateInscription: string;
};

const STORAGE_KEY = "lexiaide_eleves";

function load(): Eleve[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(list: Eleve[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

let _eleves: Eleve[] = load();
const _listeners = new Set<() => void>();

function notify() {
  _listeners.forEach((fn) => fn());
}

export function useEleves(): Eleve[] {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const fn = () => forceUpdate((n) => n + 1);
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  }, []);
  return _eleves;
}

export function addEleve(data: Omit<Eleve, "id" | "dateInscription">) {
  const newEleve: Eleve = {
    ...data,
    id: crypto.randomUUID(),
    dateInscription: new Date().toISOString().slice(0, 10),
  };
  _eleves = [newEleve, ..._eleves];
  save(_eleves);
  notify();
}

export function removeEleve(id: string) {
  _eleves = _eleves.filter((e) => e.id !== id);
  save(_eleves);
  notify();
}

export function updatePaiementStatut(id: string, statut: Paiement["statut"]) {
  _eleves = _eleves.map((e) =>
    e.id === id ? { ...e, paiement: { ...e.paiement, statut } } : e
  );
  save(_eleves);
  notify();
}

// Aggregated stats
export function getPaiementStats(eleves: Eleve[]) {
  const total = eleves.reduce((s, e) => s + e.paiement.montant, 0);
  const payes = eleves.filter((e) => e.paiement.statut === "payé");
  const enAttente = eleves.filter((e) => e.paiement.statut === "en attente");
  const retard = eleves.filter((e) => e.paiement.statut === "retard");
  const tauxRecouvrement = eleves.length ? Math.round((payes.length / eleves.length) * 100) : 0;
  return { total, payes, enAttente, retard, tauxRecouvrement };
}