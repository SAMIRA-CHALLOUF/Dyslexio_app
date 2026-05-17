import React, { useState, useMemo } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout.tsx";
import { useEleves, updatePaiementStatut, getPaiementStats } from "../../store/elevesStore.tsx";
import { layout, colors } from "../../styles/dashboardStyles.ts";
import { Download, Search, TrendingUp, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const methodIcons: Record<string, string> = {
  virement: "🏦", especes: "💵", cheque: "📄", carte: "💳",
};

export default function Paiements() {
  const eleves = useEleves();
  const stats = getPaiementStats(eleves);
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [filterMethode, setFilterMethode] = useState("Tous");
  const [sortBy, setSortBy] = useState<"date" | "montant" | "nom">("date");

  const classes = useMemo(() => {
    const map: Record<string, { count: number; total: number; payes: number }> = {};
    for (const e of eleves) {
      if (!map[e.classe]) map[e.classe] = { count: 0, total: 0, payes: 0 };
      map[e.classe].count++;
      map[e.classe].total += e.paiement.montant;
      if (e.paiement.statut === "payé") map[e.classe].payes++;
    }
    return Object.entries(map).map(([classe, d]) => ({ classe, ...d }));
  }, [eleves]);

  const filtered = useMemo(() => {
    let list = eleves.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch = !q || `${e.prenom} ${e.nom} ${e.paiement.reference} ${e.classe}`.toLowerCase().includes(q);
      const matchStatut = filterStatut === "Tous" || e.paiement.statut === filterStatut;
      const matchMethode = filterMethode === "Tous" || e.paiement.methode === filterMethode;
      return matchSearch && matchStatut && matchMethode;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === "montant") return b.paiement.montant - a.paiement.montant;
      if (sortBy === "nom") return `${a.nom} ${a.prenom}`.localeCompare(`${b.nom} ${b.prenom}`);
      return b.paiement.datePaiement.localeCompare(a.paiement.datePaiement);
    });
    return list;
  }, [eleves, search, filterStatut, filterMethode, sortBy]);

  const exportCSV = () => {
    const rows = [
      ["Prénom", "Nom", "Classe", "Niveau", "Parent", "Référence", "Méthode", "Montant (DH)", "Statut", "Date paiement"],
      ...eleves.map((e) => [
        e.prenom, e.nom, e.classe, e.niveau, e.parentNom,
        e.paiement.reference, e.paiement.methode,
        e.paiement.montant, e.paiement.statut, e.paiement.datePaiement,
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `paiements_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={layout.pageHeader}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-.5px" }}>Paiements</h1>
          <p style={{ margin: "4px 0 0", color: colors.muted, fontSize: 13 }}>
            Suivi des paiements et des encaissements.
          </p>
        </div>
        <button style={layout.btn("ghost")} onClick={exportCSV}>
          <Download size={15} /> Exporter CSV
        </button>
      </div>

      {/* KPI */}
      <div style={layout.grid4}>
        <KpiCard
          icon={<TrendingUp size={17} />}
          bg={colors.primaryLight} fg={colors.primary}
          label="Total encaissé"
          value={`${stats.total.toLocaleString("fr-FR")} DH`}
          sub={`${eleves.length} élève${eleves.length !== 1 ? "s" : ""}`}
        />
        <KpiCard
          icon={<CheckCircle2 size={17} />}
          bg={colors.greenLight} fg={colors.green}
          label="Paiements confirmés"
          value={stats.payes.length}
          sub={`${stats.tauxRecouvrement}% de recouvrement`}
        />
        <KpiCard
          icon={<Clock size={17} />}
          bg={colors.amberLight} fg={colors.amber}
          label="En attente"
          value={stats.enAttente.length}
          sub={`${stats.enAttente.reduce((s, e) => s + e.paiement.montant, 0).toLocaleString("fr-FR")} DH`}
        />
        <KpiCard
          icon={<AlertTriangle size={17} />}
          bg={colors.dangerLight} fg={colors.danger}
          label="En retard"
          value={stats.retard.length}
          sub={`${stats.retard.reduce((s, e) => s + e.paiement.montant, 0).toLocaleString("fr-FR")} DH`}
        />
      </div>

      {/* Progress bar */}
      {eleves.length > 0 && (
        <div style={{ ...layout.card, padding: "18px 22px", marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Taux de recouvrement global</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: stats.tauxRecouvrement >= 80 ? colors.green : stats.tauxRecouvrement >= 50 ? colors.amber : colors.danger }}>
              {stats.tauxRecouvrement}%
            </div>
          </div>
          <div style={{ height: 10, background: colors.border, borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 99,
              width: `${stats.tauxRecouvrement}%`,
              background: stats.tauxRecouvrement >= 80
                ? `linear-gradient(90deg, ${colors.green}, ${colors.teal})`
                : stats.tauxRecouvrement >= 50
                ? `linear-gradient(90deg, ${colors.amber}, ${colors.orange})`
                : `linear-gradient(90deg, ${colors.danger}, ${colors.coral})`,
              transition: "width .6s ease",
            }} />
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
            <Legend color={colors.green} label={`Payé (${stats.payes.length})`} />
            <Legend color={colors.amber} label={`En attente (${stats.enAttente.length})`} />
            <Legend color={colors.danger} label={`Retard (${stats.retard.length})`} />
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, marginTop: 16, alignItems: "start" }}>
        {/* Main table */}
        <div style={{ ...layout.card, overflow: "hidden", minWidth: 0 }}>
          {/* Toolbar */}
          <div style={{ padding: "13px 16px", borderBottom: `1px solid ${colors.border}`, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 180 }}>
              <Search size={13} color={colors.muted} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }} />
              <input
                style={{ ...layout.searchInput, width: "100%", paddingLeft: 28, height: 34, fontSize: 13 }}
                placeholder="Nom, référence, classe…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select style={{ ...layout.input, height: 34, fontSize: 13, cursor: "pointer" }} value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}>
              <option value="Tous">Tous statuts</option>
              <option value="payé">Payé</option>
              <option value="en attente">En attente</option>
              <option value="retard">Retard</option>
            </select>
            <select style={{ ...layout.input, height: 34, fontSize: 13, cursor: "pointer" }} value={filterMethode} onChange={(e) => setFilterMethode(e.target.value)}>
              <option value="Tous">Toutes méthodes</option>
              <option value="virement">Virement</option>
              <option value="especes">Espèces</option>
              <option value="cheque">Chèque</option>
              <option value="carte">Carte</option>
            </select>
            <select style={{ ...layout.input, height: 34, fontSize: 13, cursor: "pointer" }} value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="date">Trier par date</option>
              <option value="montant">Trier par montant</option>
              <option value="nom">Trier par nom</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div style={layout.emptyState}>
              <div style={{ fontSize: 32 }}>💳</div>
              <p style={{ fontWeight: 700, color: colors.text, marginTop: 8 }}>
                {eleves.length === 0 ? "Aucun paiement enregistré" : "Aucun résultat"}
              </p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Ajoutez des élèves pour commencer à suivre les paiements.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={layout.table}>
                <thead>
                  <tr>
                    <th style={layout.th}>Élève</th>
                    <th style={layout.th}>Classe</th>
                    <th style={layout.th}>Méthode</th>
                    <th style={layout.th}>Référence</th>
                    <th style={layout.th}>Date</th>
                    <th style={layout.th}>Statut</th>
                    <th style={{ ...layout.th, textAlign: "right" }}>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((e) => (
                    <tr key={e.id}
                      onMouseEnter={(ev) => (ev.currentTarget.style.background = "#FAFBFD")}
                      onMouseLeave={(ev) => (ev.currentTarget.style.background = "")}
                    >
                      <td style={layout.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={layout.avatar}>{e.prenom[0]}{e.nom[0]}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{e.prenom} {e.nom}</div>
                            <div style={{ fontSize: 11, color: colors.muted }}>{e.parentNom}</div>
                          </div>
                        </div>
                      </td>
                      <td style={layout.td}>
                        <span style={{ fontSize: 13 }}>{e.classe}</span>
                      </td>
                      <td style={layout.td}>
                        <span style={{ fontSize: 13 }}>
                          {methodIcons[e.paiement.methode]} {e.paiement.methode.charAt(0).toUpperCase() + e.paiement.methode.slice(1)}
                        </span>
                      </td>
                      <td style={layout.td}>
                        <span style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, background: colors.bg, padding: "3px 7px", borderRadius: 5 }}>
                          {e.paiement.reference}
                        </span>
                      </td>
                      <td style={layout.td}>
                        <span style={{ fontSize: 13, color: colors.muted }}>{e.paiement.datePaiement}</span>
                      </td>
                      <td style={layout.td}>
                        <select
                          value={e.paiement.statut}
                          onChange={(ev) => updatePaiementStatut(e.id, ev.target.value as any)}
                          style={{
                            ...layout.badge(e.paiement.statut === "payé" ? "green" : e.paiement.statut === "retard" ? "coral" : "amber"),
                            border: "none", cursor: "pointer", outline: "none",
                            appearance: "none", WebkitAppearance: "none",
                          }}
                        >
                          <option value="payé">✅ Payé</option>
                          <option value="en attente">⏳ En attente</option>
                          <option value="retard">⚠️ Retard</option>
                        </select>
                      </td>
                      <td style={{ ...layout.td, textAlign: "right" }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: e.paiement.statut === "payé" ? colors.teal : colors.amber }}>
                          {e.paiement.montant.toLocaleString("fr-FR")} DH
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Classes sidebar */}
        {classes.length > 0 && (
          <div style={{ ...layout.card, padding: "18px 16px", width: 220, flexShrink: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 14 }}>Par classe</div>
            <div style={{ display: "grid", gap: 10 }}>
              {classes.map((c) => (
                <div key={c.classe}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{c.classe}</span>
                    <span style={{ fontSize: 11, color: colors.muted }}>{c.payes}/{c.count}</span>
                  </div>
                  <div style={{ height: 5, background: colors.border, borderRadius: 99, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 99,
                      width: `${c.count > 0 ? (c.payes / c.count) * 100 : 0}%`,
                      background: `linear-gradient(90deg, ${colors.primary}, ${colors.teal})`,
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: colors.muted, marginTop: 3 }}>
                    {c.total.toLocaleString("fr-FR")} DH
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function KpiCard({ icon, bg, fg, label, value, sub }: any) {
  return (
    <div style={{ ...layout.card, padding: "18px 20px" }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: bg, color: fg, display: "grid", placeItems: "center" }}>
        {icon}
      </div>
      <div style={{ marginTop: 12 }}>
        <div style={layout.statLabel}>{label}</div>
        <div style={{ ...layout.statValue, fontSize: 22 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: colors.muted }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
    </div>
  );
}