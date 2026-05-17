import React from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/dashboard/DashboardLayout.tsx";
import { useEleves } from "../../store/elevesStore.tsx";
import { layout, colors } from "../../styles/dashboardStyles.ts";

export default function Overview() {
  const eleves = useEleves();
  const total = eleves.reduce((s, e) => s + e.paiement.montant, 0);
  const classes = new Set(eleves.map((e) => e.classe)).size;

  return (
    <DashboardLayout>
      <div>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800 }}>Bienvenue 👋</h1>
        <p style={{ marginTop: 4, color: colors.muted }}>Vue d'ensemble de votre établissement.</p>
      </div>

      <div style={{ ...layout.grid3, marginTop: 24 }}>
        <div style={{ ...layout.card, padding: 20, background: `linear-gradient(135deg, ${colors.primary}, ${colors.teal})`, color: "#fff", border: "none" }}>
          <div style={{ fontSize: 22 }}>👥</div>
          <div style={{ fontSize: 28, fontWeight: 800, marginTop: 12 }}>{eleves.length}</div>
          <div style={{ opacity: .9, fontSize: 13 }}>Élèves inscrits</div>
        </div>
        <StatCard icon="💰" iconBg={colors.amberLight} iconColor={colors.amber} value={`${total.toLocaleString("fr-FR")} DH`} label="Total encaissé" />
        <StatCard icon="🎓" iconBg={colors.coralLight} iconColor={colors.coral} value={classes} label="Classes actives" />
      </div>

      <Link to="/dashboard/eleves" style={{ ...layout.card, padding: 20, marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none", color: "inherit" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>Gérer les élèves</div>
          <div style={{ color: colors.muted, fontSize: 13, marginTop: 2 }}>
            Ajouter, consulter et suivre les inscriptions et paiements.
          </div>
        </div>
        <span style={{ color: colors.teal, fontSize: 20 }}>→</span>
      </Link>
    </DashboardLayout>
  );
}

function StatCard({ icon, iconBg, iconColor, value, label }: { icon: string; iconBg: string; iconColor: string; value: string | number; label: string }) {
  return (
    <div style={{ ...layout.card, ...layout.statCard }}>
      <div>
        <div style={layout.statLabel}>{label}</div>
        <div style={layout.statValue}>{value}</div>
      </div>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, color: iconColor, display: "grid", placeItems: "center", fontSize: 20 }}>
        {icon}
      </div>
    </div>
  );
}
