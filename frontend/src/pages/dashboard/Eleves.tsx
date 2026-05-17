import React, { useState, useEffect, useMemo } from "react";          // ✅ Fix 1: added useMemo
import DashboardLayout from "../../components/dashboard/DashboardLayout.tsx";
import AjouterEleveDialog from "../../components/dashboard/AjouterEleveDialog.tsx";
import { Search, Trash2, Filter } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
// ✅ Fix 4: Eleve type declared
interface Paiement {
  montant: number;
  statut: string;
  reference: string;
  methode: string;
  datePaiement: string;
}

interface Eleve {
  id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  classe: string;
  niveau: string;
  parentNom: string;
  parentTelephone: string;
  paiement: Paiement;
}

// ─── Design tokens ────────────────────────────────────────────────────────────
// ✅ Fix 2: colors and layout defined
const colors = {
  primary:      "#0D9373",
  primaryLight: "#E1F5EE",
  green:        "#16a34a",
  greenLight:   "#dcfce7",
  amber:        "#d97706",
  amberLight:   "#fef3c7",
  teal:         "#0D9373",
  tealLight:    "#ccfbf1",
  danger:       "#ef4444",
  muted:        "#94a3b8",
  text:         "#0f172a",
  border:       "#e2e8f0",
  bg:           "#f8fafc",
};

const layout = {
  pageHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 20,
  } as React.CSSProperties,
  grid4: {
    display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14,
  } as React.CSSProperties,
  card: {
    background: "#fff", borderRadius: 14,
    border: `1px solid ${colors.border}`,
    boxShadow: "0 1px 4px #0001",
  } as React.CSSProperties,
  statCard: {
    padding: "16px 18px", display: "flex",
    justifyContent: "space-between", alignItems: "center",
  } as React.CSSProperties,
  statLabel: { fontSize: 12, color: colors.muted, marginBottom: 4 } as React.CSSProperties,
  statValue: { fontWeight: 800, color: colors.text } as React.CSSProperties,
  th: {
    padding: "10px 14px", textAlign: "left" as const,
    fontSize: 11, fontWeight: 700, color: colors.muted,
    textTransform: "uppercase" as const, letterSpacing: ".04em",
    borderBottom: `1px solid ${colors.border}`, background: colors.bg,
  } as React.CSSProperties,
  td: {
    padding: "12px 14px", borderBottom: `1px solid ${colors.border}`,
    verticalAlign: "middle",
  } as React.CSSProperties,
  avatar: {
    width: 34, height: 34, borderRadius: "50%",
    background: colors.primaryLight, color: colors.primary,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 800, fontSize: 12, flexShrink: 0,
  } as React.CSSProperties,
  searchInput: {
    border: `1.5px solid ${colors.border}`, borderRadius: 8,
    padding: "0 12px", fontSize: 13, background: colors.bg, outline: "none",
  } as React.CSSProperties,
  input: {
    border: `1.5px solid ${colors.border}`, borderRadius: 8,
    background: colors.bg, outline: "none",
  } as React.CSSProperties,
  iconBtn: {
    background: "none", border: "none", cursor: "pointer",
    padding: 4, borderRadius: 6, display: "flex", alignItems: "center",
  } as React.CSSProperties,
  modalOverlay: {
    position: "fixed" as const, inset: 0,
    background: "#0006", display: "flex",
    alignItems: "center", justifyContent: "center", zIndex: 1000,
  } as React.CSSProperties,
  modal: {
    background: "#fff", borderRadius: 16, width: "90%",
    boxShadow: "0 8px 40px #0003", overflow: "hidden",
  } as React.CSSProperties,
  modalHeader: { padding: "20px 24px", borderBottom: `1px solid ${colors.border}` } as React.CSSProperties,
  modalFooter: {
    padding: "14px 24px", display: "flex",
    justifyContent: "flex-end", gap: 10,
  } as React.CSSProperties,
  btn: (variant: "ghost" | "danger") => ({
    padding: "8px 18px", borderRadius: 8, fontWeight: 700,
    fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
    ...(variant === "ghost"
      ? { background: "none", border: `1.5px solid ${colors.border}`, color: colors.text }
      : { background: colors.danger, border: "none", color: "#fff" }),
  } as React.CSSProperties),
  badge: (color: "green" | "amber" | "coral" | "muted") => {
    const map = {
      green: { bg: colors.greenLight, fg: colors.green },
      amber: { bg: colors.amberLight, fg: colors.amber },
      coral: { bg: "#fef2f2",         fg: "#ef4444"    },
      muted: { bg: colors.bg,         fg: colors.muted },
    };
    const c = map[color] ?? map.muted;
    return {
      background: c.bg, color: c.fg,
      padding: "3px 10px", borderRadius: 20,
      fontSize: 11, fontWeight: 700,
    } as React.CSSProperties;
  },
};

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUT_COLORS: Record<string, "green" | "amber" | "coral"> = {
  "payé":       "green",
  "en attente": "amber",
  "retard":     "coral",
};

const methodIcons: Record<string, string> = {
  virement: "🏦", especes: "💵", cheque: "📄", carte: "💳",
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Eleves() {
  const [eleves, setEleves]           = useState<Eleve[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState("");
  const [filterNiveau, setFilterNiveau] = useState("Tous");
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchEleves = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("Token non trouvé. Veuillez vous reconnecter.");

        const response = await fetch('http://localhost:3001/eleves', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Impossible de récupérer les élèves.');
        }
        setEleves(await response.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEleves();
  }, []);

  // ✅ Fix 3a: removeEleve defined
  const removeEleve = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/eleves/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setEleves(prev => prev.filter(e => e.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ✅ Fix 3b: updatePaiementStatut defined
  const updatePaiementStatut = async (id: string, statut: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:3001/eleves/${id}/paiement`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statut }),
      });
      setEleves(prev =>
        prev.map(e => e.id === id
          ? { ...e, paiement: { ...e.paiement, statut } }
          : e
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEleveAdded = (newEleve: Eleve) => {
    setEleves(prev => [...prev, newEleve]);
  };

  // ✅ Fix 5: guard against undefined paiement with optional chaining
  const total     = eleves.reduce((s, e) => s + (e.paiement?.montant ?? 0), 0);
  const payes     = eleves.filter(e => e.paiement?.statut === "payé");
  const enAttente = eleves.filter(e => e.paiement?.statut !== "payé");

  const niveaux = ["Tous", ...Array.from(new Set(eleves.map(e => e.niveau)))];
  const statuts = ["Tous", "payé", "en attente", "retard"];

  const filtered = useMemo(() => {
    return eleves.filter(e => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        `${e.prenom} ${e.nom} ${e.classe} ${e.parentNom} ${e.paiement?.reference ?? ""}`
          .toLowerCase().includes(q);
      const matchNiveau = filterNiveau === "Tous" || e.niveau === filterNiveau;
      const matchStatut = filterStatut === "Tous" || e.paiement?.statut === filterStatut;
      return matchSearch && matchNiveau && matchStatut;
    });
  }, [eleves, search, filterNiveau, filterStatut]);

  const stats = [
    { label: "Élèves inscrits",  value: eleves.length,                          icon: "👥", bg: colors.primaryLight, fg: colors.primary },
    { label: "Paiements reçus",  value: payes.length,                           icon: "✅", bg: colors.greenLight,   fg: colors.green   },
    { label: "En attente",       value: enAttente.length,                       icon: "⏳", bg: colors.amberLight,   fg: colors.amber   },
    { label: "Total encaissé",   value: `${total.toLocaleString("fr-FR")} DH`,  icon: "💰", bg: colors.tealLight,    fg: colors.teal    },
  ];

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={layout.pageHeader}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-.5px" }}>
            Gestion des élèves
          </h1>
          <p style={{ margin: "4px 0 0", color: colors.muted, fontSize: 13 }}>
            {eleves.length} élève{eleves.length !== 1 ? "s" : ""} inscrit{eleves.length !== 1 ? "s" : ""}
          </p>
        </div>
        <AjouterEleveDialog onEleveAdded={handleEleveAdded} />
      </div>

      {/* Stats */}
      <div style={layout.grid4}>
        {stats.map(s => (
          <div key={s.label} style={{ ...layout.card, ...layout.statCard }}>
            <div>
              <div style={layout.statLabel}>{s.label}</div>
              <div style={{ ...layout.statValue, fontSize: 22 }}>{s.value}</div>
            </div>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, color: s.fg, display: "grid", placeItems: "center", fontSize: 17 }}>
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={{ ...layout.card, marginTop: 20, overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${colors.border}`, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={14} color={colors.muted} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            <input
              style={{ ...layout.searchInput, width: "100%", paddingLeft: 32, height: 36 }}
              placeholder="Rechercher par nom, classe, référence…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Filter size={14} color={colors.muted} />
            <select
              style={{ ...layout.input, height: 36, paddingLeft: 10, paddingRight: 8, fontSize: 13, cursor: "pointer" }}
              value={filterNiveau}
              onChange={e => setFilterNiveau(e.target.value)}
            >
              {niveaux.map(n => <option key={n}>{n}</option>)}
            </select>
            <select
              style={{ ...layout.input, height: 36, paddingLeft: 10, paddingRight: 8, fontSize: 13, cursor: "pointer" }}
              value={filterStatut}
              onChange={e => setFilterStatut(e.target.value)}
            >
              {statuts.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        {loading && (
          <div style={{ padding: "40px", textAlign: "center", color: colors.muted }}>
            Chargement des élèves...
          </div>
        )}
        {error && (
          <div style={{ padding: "40px", textAlign: "center", color: colors.danger }}>
            Erreur : {error}
          </div>
        )}

        {!loading && !error && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={layout.th}>Élève</th>
                <th style={layout.th}>Classe</th>
                <th style={layout.th}>Parent / Tuteur</th>
                <th style={layout.th}>Référence</th>
                <th style={layout.th}>Méthode</th>
                <th style={layout.th}>Statut</th>
                <th style={{ ...layout.th, textAlign: "right" }}>Montant</th>
                <th style={layout.th} />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: "40px", textAlign: "center", color: colors.muted }}>
                    Aucun élève trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map(e => (
                  <EleveRow
                    key={e.id}
                    eleve={e}
                    onDelete={() => setConfirmDelete(e.id)}
                    onStatutChange={s => updatePaiementStatut(e.id, s)}
                  />
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div style={layout.modalOverlay} onClick={() => setConfirmDelete(null)}>
          <div style={{ ...layout.modal, maxWidth: 400 }} onClick={ev => ev.stopPropagation()}>
            <div style={layout.modalHeader}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>Confirmer la suppression</h2>
              <p style={{ margin: "6px 0 0", color: colors.muted, fontSize: 13 }}>
                Cette action est irréversible. L'élève et son paiement seront définitivement supprimés.
              </p>
            </div>
            <div style={layout.modalFooter}>
              <button style={layout.btn("ghost")} onClick={() => setConfirmDelete(null)}>
                Annuler
              </button>
              <button
                style={layout.btn("danger")}
                onClick={() => { removeEleve(confirmDelete); setConfirmDelete(null); }}
              >
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// ─── Row component ────────────────────────────────────────────────────────────
function EleveRow({ eleve: e, onDelete, onStatutChange }: {
  eleve: Eleve;
  onDelete: () => void;
  onStatutChange: (s: string) => void;
}) {
  return (
    <tr
      style={{ transition: "background .1s" }}
      onMouseEnter={ev => (ev.currentTarget.style.background = "#FAFBFD")}
      onMouseLeave={ev => (ev.currentTarget.style.background = "")}
    >
      <td style={layout.td}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={layout.avatar}>{e.prenom[0]}{e.nom[0]}</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{e.prenom} {e.nom}</div>
            <div style={{ fontSize: 11, color: colors.muted }}>{e.email || e.telephone || "—"}</div>
          </div>
        </div>
      </td>
      <td style={layout.td}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{e.classe}</div>
        <div style={{ fontSize: 11, color: colors.muted }}>{e.niveau}</div>
      </td>
      <td style={layout.td}>
        <div style={{ fontWeight: 500, fontSize: 13 }}>{e.parentNom}</div>
        <div style={{ fontSize: 11, color: colors.muted }}>{e.parentTelephone}</div>
      </td>
      <td style={layout.td}>
        <span style={{ background: colors.bg, padding: "3px 8px", borderRadius: 6, fontFamily: "ui-monospace, monospace", fontSize: 11, color: colors.text }}>
          {e.paiement?.reference ?? "—"}
        </span>
      </td>
      <td style={layout.td}>
        <span style={{ fontSize: 13 }}>
          {methodIcons[e.paiement?.methode] || "💳"}{" "}
          {e.paiement?.methode
            ? e.paiement.methode.charAt(0).toUpperCase() + e.paiement.methode.slice(1)
            : "—"}
        </span>
      </td>
      <td style={layout.td}>
        <select
          value={e.paiement?.statut ?? "en attente"}
          onChange={ev => onStatutChange(ev.target.value)}
          style={{
            ...layout.badge(STATUT_COLORS[e.paiement?.statut] || "muted"),
            border: "none", cursor: "pointer", outline: "none",
            appearance: "none", WebkitAppearance: "none", paddingRight: 8,
          }}
        >
          <option value="payé">✅ Payé</option>
          <option value="en attente">⏳ En attente</option>
          <option value="retard">⚠️ Retard</option>
        </select>
      </td>
      <td style={{ ...layout.td, textAlign: "right" }}>
        <div style={{ fontWeight: 800, color: colors.teal, fontSize: 14 }}>
          {(e.paiement?.montant ?? 0).toLocaleString("fr-FR")} DH
        </div>
        <div style={{ fontSize: 10, color: colors.muted }}>
          {e.paiement?.datePaiement ?? "—"}
        </div>
      </td>
      <td style={layout.td}>
        <button
          onClick={onDelete}
          style={{ ...layout.iconBtn, color: colors.muted }}
          title="Supprimer"
          onMouseEnter={ev => (ev.currentTarget.style.color = colors.danger)}
          onMouseLeave={ev => (ev.currentTarget.style.color = colors.muted)}
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}