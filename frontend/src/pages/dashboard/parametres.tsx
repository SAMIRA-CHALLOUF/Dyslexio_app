import React, { useState } from "react";
import DashboardLayout from "../../components/dashboard/DashboardLayout.tsx";
import { layout, colors } from "../../styles/dashboardStyles.ts";
import { Save, Building2, Bell, Shield, Palette, Info } from "lucide-react";

const STORAGE_KEY = "lexiaide_parametres";

function loadParams() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const defaults = {
  // École
  nomEtablissement: "École Saadia",
  adresse: "",
  ville: "Casablanca",
  pays: "Maroc",
  telephone: "",
  email: "",
  siteWeb: "",
  directeur: "",
  capacite: "",

  // Paiements
  monnaie: "DH",
  montantDefaut: "2500",
  prefixeReference: "INSC",
  anneeScol: "2025-2026",
  delaiPaiement: "30",
  rappelRetard: true,

  // Notifications
  notifInscription: true,
  notifRetard: true,
  notifEmail: false,
  emailNotif: "",

  // Affichage
  theme: "clair",
  langue: "fr",
  dateFormat: "DD/MM/YYYY",
};

type Params = typeof defaults;

export default function Parametres() {
  const [params, setParams] = useState<Params>(() => ({ ...defaults, ...loadParams() }));
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"ecole" | "paiements" | "notifications" | "apparence">("ecole");

  const set = (k: keyof Params) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setParams((p) => ({ ...p, [k]: e.target.value }));

  const toggle = (k: keyof Params) => () =>
    setParams((p) => ({ ...p, [k]: !(p[k] as boolean) }));

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs = [
    { id: "ecole", label: "Établissement", icon: <Building2 size={15} /> },
    { id: "paiements", label: "Paiements", icon: <Shield size={15} /> },
    { id: "notifications", label: "Notifications", icon: <Bell size={15} /> },
    { id: "apparence", label: "Affichage", icon: <Palette size={15} /> },
  ] as const;

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={layout.pageHeader}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-.5px" }}>Paramètres</h1>
          <p style={{ margin: "4px 0 0", color: colors.muted, fontSize: 13 }}>
            Configurez votre établissement et vos préférences.
          </p>
        </div>
        <button style={layout.btn("primary")} onClick={save}>
          <Save size={15} />
          {saved ? "✓ Enregistré !" : "Enregistrer"}
        </button>
      </div>

      {saved && (
        <div style={{
          background: colors.greenLight, color: colors.green,
          padding: "10px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600,
          marginBottom: 16, display: "flex", alignItems: "center", gap: 8,
          border: `1px solid ${colors.green}30`,
        }}>
          ✓ Vos paramètres ont été enregistrés avec succès.
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20, alignItems: "start" }}>
        {/* Tabs sidebar */}
        <div style={{ ...layout.card, padding: "10px 8px" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8,
                padding: "9px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: activeTab === tab.id ? 700 : 500, textAlign: "left",
                background: activeTab === tab.id ? colors.primaryLight : "transparent",
                color: activeTab === tab.id ? colors.primaryDark : colors.muted,
                transition: "all .15s",
                marginBottom: 2,
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ ...layout.card, padding: "26px 28px" }}>
          {activeTab === "ecole" && (
            <Section title="Informations de l'établissement" icon="🏫">
              <div style={layout.row2}>
                <Field label="Nom de l'établissement">
                  <input style={layout.input} value={params.nomEtablissement} onChange={set("nomEtablissement")} />
                </Field>
                <Field label="Nom du directeur">
                  <input style={layout.input} value={params.directeur} onChange={set("directeur")} placeholder="M. / Mme …" />
                </Field>
              </div>
              <Field label="Adresse">
                <input style={layout.input} value={params.adresse} onChange={set("adresse")} placeholder="123 Rue de l'École" />
              </Field>
              <div style={layout.row3}>
                <Field label="Ville">
                  <input style={layout.input} value={params.ville} onChange={set("ville")} />
                </Field>
                <Field label="Pays">
                  <input style={layout.input} value={params.pays} onChange={set("pays")} />
                </Field>
                <Field label="Capacité d'accueil">
                  <input type="number" style={layout.input} value={params.capacite} onChange={set("capacite")} placeholder="200" />
                </Field>
              </div>
              <div style={layout.row2}>
                <Field label="Téléphone">
                  <input style={layout.input} value={params.telephone} onChange={set("telephone")} placeholder="+212 …" />
                </Field>
                <Field label="Email officiel">
                  <input type="email" style={layout.input} value={params.email} onChange={set("email")} placeholder="contact@ecole.ma" />
                </Field>
              </div>
              <Field label="Site web">
                <input style={layout.input} value={params.siteWeb} onChange={set("siteWeb")} placeholder="https://ecole.ma" />
              </Field>
            </Section>
          )}

          {activeTab === "paiements" && (
            <Section title="Configuration des paiements" icon="💳">
              <div style={layout.row2}>
                <Field label="Année scolaire">
                  <input style={layout.input} value={params.anneeScol} onChange={set("anneeScol")} placeholder="2025-2026" />
                </Field>
                <Field label="Monnaie">
                  <select style={layout.input} value={params.monnaie} onChange={set("monnaie")}>
                    <option value="DH">DH – Dirham marocain</option>
                    <option value="TND">TND – Dinar tunisien</option>
                    <option value="EUR">EUR – Euro</option>
                    <option value="USD">USD – Dollar américain</option>
                    <option value="DZD">DZD – Dinar algérien</option>
                  </select>
                </Field>
              </div>
              <div style={layout.row2}>
                <Field label="Montant par défaut">
                  <input type="number" style={layout.input} value={params.montantDefaut} onChange={set("montantDefaut")} placeholder="2500" />
                </Field>
                <Field label="Délai de paiement (jours)">
                  <input type="number" style={layout.input} value={params.delaiPaiement} onChange={set("delaiPaiement")} placeholder="30" />
                </Field>
              </div>
              <Field label="Préfixe de référence">
                <input style={layout.input} value={params.prefixeReference} onChange={set("prefixeReference")} placeholder="INSC" />
                <span style={{ fontSize: 11, color: colors.muted }}>
                  Exemple : {params.prefixeReference || "INSC"}-{params.anneeScol.replace("-", "")}-001
                </span>
              </Field>
              <ToggleRow
                label="Alerte retard de paiement"
                sub="Marquer automatiquement les paiements dépassant le délai"
                checked={params.rappelRetard as boolean}
                onToggle={toggle("rappelRetard")}
              />
              <InfoBox>
                Les montants sont affichés en {params.monnaie} dans tout le tableau de bord.
                L'année scolaire active est <strong>{params.anneeScol}</strong>.
              </InfoBox>
            </Section>
          )}

          {activeTab === "notifications" && (
            <Section title="Notifications" icon="🔔">
              <ToggleRow
                label="Notification à l'inscription"
                sub="Recevoir une alerte à chaque nouvel élève inscrit"
                checked={params.notifInscription as boolean}
                onToggle={toggle("notifInscription")}
              />
              <ToggleRow
                label="Alertes de retard"
                sub="Être notifié lorsqu'un paiement est en retard"
                checked={params.notifRetard as boolean}
                onToggle={toggle("notifRetard")}
              />
              <ToggleRow
                label="Notifications par email"
                sub="Envoyer les alertes à une adresse email"
                checked={params.notifEmail as boolean}
                onToggle={toggle("notifEmail")}
              />
              {params.notifEmail && (
                <Field label="Email de notification">
                  <input type="email" style={layout.input} value={params.emailNotif} onChange={set("emailNotif")} placeholder="admin@ecole.ma" />
                </Field>
              )}
            </Section>
          )}

          {activeTab === "apparence" && (
            <Section title="Affichage et langue" icon="🎨">
              <div style={layout.row2}>
                <Field label="Langue de l'interface">
                  <select style={layout.input} value={params.langue} onChange={set("langue")}>
                    <option value="fr">Français</option>
                    <option value="ar">العربية</option>
                    <option value="en">English</option>
                  </select>
                </Field>
                <Field label="Format de date">
                  <select style={layout.input} value={params.dateFormat} onChange={set("dateFormat")}>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </Field>
              </div>
              <Field label="Thème">
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  {[
                    { value: "clair", label: "☀️ Clair", bg: "#F7F8FB", border: "#E2E5EF" },
                    { value: "sombre", label: "🌙 Sombre", bg: "#1A1F2C", border: "#2D3448" },
                    { value: "systeme", label: "💻 Système", bg: "linear-gradient(135deg, #F7F8FB 50%, #1A1F2C 50%)", border: colors.primary },
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setParams((p) => ({ ...p, theme: t.value }))}
                      style={{
                        padding: "10px 16px", borderRadius: 9, fontSize: 13, fontWeight: 600,
                        cursor: "pointer", border: `2px solid ${params.theme === t.value ? colors.primary : colors.border}`,
                        background: params.theme === t.value ? colors.primaryLight : "#fff",
                        color: params.theme === t.value ? colors.primaryDark : colors.muted,
                        transition: "all .15s",
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </Field>
              <InfoBox>
                Les modifications de thème seront appliquées au prochain rechargement.
              </InfoBox>
            </Section>
          )}
        </div>
      </div>

      {/* Danger zone */}
      <div style={{ ...layout.card, padding: "20px 24px", marginTop: 20, borderColor: colors.dangerLight }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: colors.danger }}>Zone dangereuse</div>
            <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>
              Réinitialiser toutes les données de l'application. Cette action est irréversible.
            </div>
          </div>
          <button
            style={layout.btn("danger")}
            onClick={() => {
              if (window.confirm("Êtes-vous sûr ? Toutes les données seront supprimées.")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
        <span>{icon}</span> {title}
      </div>
      <div style={{ display: "grid", gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={layout.field}>
      <label style={layout.label}>{label}</label>
      {children}
    </div>
  );
}

function ToggleRow({ label, sub, checked, onToggle }: { label: string; sub: string; checked: boolean; onToggle: () => void }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 16px", borderRadius: 10, background: colors.bg, border: `1px solid ${colors.border}`,
    }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
        <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{sub}</div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: 44, height: 24, borderRadius: 99, border: "none", cursor: "pointer",
          background: checked ? colors.primary : colors.border,
          position: "relative", transition: "background .2s", flexShrink: 0,
        }}
      >
        <span style={{
          position: "absolute", top: 3, left: checked ? 23 : 3,
          width: 18, height: 18, borderRadius: "50%", background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,.2)", transition: "left .2s",
        }} />
      </button>
    </div>
  );
}

function InfoBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: "flex", gap: 8, alignItems: "flex-start",
      padding: "10px 14px", borderRadius: 9,
      background: colors.primaryLight, color: colors.primaryDark,
      fontSize: 12, fontWeight: 500,
    }}>
      <Info size={14} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{children}</span>
    </div>
  );
}