import React, { useState, type FormEvent, type ReactNode } from "react";
import { type ChangeEvent } from "react";
// ✅ Fix 1: removed unused `addEleve` import
// ✅ Fix 2: removed wrong `import "react/jsx-runtime"`
import { layout, colors } from "../../styles/dashboardStyles.ts";
import { X, Plus } from "lucide-react";

const empty = {
  nom: "", prenom: "", dateNaissance: "", niveau: "Primaire", classe: "",
  email: "", telephone: "", parentNom: "", parentTelephone: "",
  montant: "", rib: "", titulaire: "", reference: "", datePaiement: "",
  methode: "virement" as "virement" | "especes" | "cheque" | "carte",
  statut: "payé" as "payé" | "en attente" | "retard",
};

const methodOptions = [
  { value: "virement", label: "Virement", icon: "🏦" },
  { value: "especes",  label: "Espèces",  icon: "💵" },
  { value: "cheque",   label: "Chèque",   icon: "📄" },
  { value: "carte",    label: "Carte",    icon: "💳" },
];

const statutOptions = [
  { value: "payé",       label: "Payé",       color: colors.green  },
  { value: "en attente", label: "En attente", color: colors.amber  },
  { value: "retard",     label: "Retard",     color: colors.danger },
];

const niveauOptions = ["Primaire", "Collège", "Lycée"];

// ✅ Fix 7: typed onEleveAdded prop
export default function AjouterEleveDialog({ onEleveAdded }: { onEleveAdded?: (eleve: any) => void }) {
  const [open, setOpen]       = useState(false);
  const [form, setForm]       = useState(empty);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof empty) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const close = () => { setOpen(false); setForm(empty); setError(""); };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate required fields
    const required: (keyof typeof empty)[] = ["nom", "prenom", "classe", "parentNom", "parentTelephone"];
    for (const k of required) {
      if (!String(form[k]).trim()) {
        setError(`Le champ « ${k} » est requis.`);
        setLoading(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('token');

      // ✅ Fix 5: send all required fields that the entity needs
      const body = {
        nom:              form.nom,
        prenom:           form.prenom,
        email:            form.email       || undefined,
        telephone:        form.telephone   || undefined,
        classe:           form.classe,
        niveau:           form.niveau,
        parentNom:        form.parentNom,
        parentTelephone:  form.parentTelephone,
        montant:          form.montant ? Number(form.montant) : 0,
        paiementStatut:   form.statut,
        paiementMethode:  form.methode,
        paiementReference: form.reference  || undefined,
        datePaiement:     form.datePaiement || undefined,
      };

      const response = await fetch('http://localhost:3001/eleves', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Erreur lors de l'ajout de l'élève");
      }

      const newEleve = await response.json();
      if (onEleveAdded) onEleveAdded(newEleve);
      close();

    } catch (err: any) {   // ✅ Fix 7: typed err
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button style={layout.btn("primary")} onClick={() => setOpen(true)}>
        <Plus size={16} /> Ajouter un élève
      </button>

      {open && (
        <div style={layout.modalOverlay} onClick={close}>
          <div style={layout.modal} onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div style={{ ...layout.modalHeader, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>Ajouter un élève</h2>
                <p style={{ margin: "4px 0 0", color: colors.muted, fontSize: 13 }}>
                  Remplissez les informations d'inscription.
                </p>
              </div>
              <button style={{ ...layout.iconBtn, color: colors.muted }} onClick={close}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submit}>
              <div style={layout.modalBody}>

                {/* ── Élève ── */}
                <SectionLabel>👤 Informations de l'élève</SectionLabel>
                <div style={layout.grid3}>
                  {/* ✅ Fix 3 & 6: Input now has label; Field wraps correctly */}
                  <Field label="Prénom *">
                    <Input value={form.prenom} onChange={set("prenom")} required placeholder="Prénom" />
                  </Field>
                  <Field label="Nom *">
                    <Input value={form.nom} onChange={set("nom")} required placeholder="Nom" />
                  </Field>
                  <Field label="Email">
                    <Input value={form.email} onChange={set("email")} type="email" placeholder="email@exemple.com" />
                  </Field>
                  <Field label="Téléphone">
                    <Input value={form.telephone} onChange={set("telephone")} placeholder="+212 6xx xxx xxx" />
                  </Field>
                </div>

                {/* ── Scolarité ── */}
                <SectionLabel>🏫 Scolarité</SectionLabel>
                <div style={layout.grid3}>
                  <Field label="Niveau *">
                    <select style={layout.input} value={form.niveau} onChange={set("niveau")}>
                      {niveauOptions.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </Field>
                  <Field label="Classe *">
                    <Input value={form.classe} onChange={set("classe")} required placeholder="Ex: 6ème A" />
                  </Field>
                </div>

                {/* ── Parent ── */}
                <SectionLabel>👨‍👩‍👧 Parent / Tuteur</SectionLabel>
                <div style={layout.grid3}>
                  <Field label="Nom du parent *">
                    <Input value={form.parentNom} onChange={set("parentNom")} required placeholder="Nom complet" />
                  </Field>
                  <Field label="Téléphone parent *">
                    <Input value={form.parentTelephone} onChange={set("parentTelephone")} required placeholder="+212 6xx xxx xxx" />
                  </Field>
                </div>

                {/* ── Paiement ── */}
                <SectionLabel>💰 Paiement</SectionLabel>
                <div style={layout.grid3}>
                  <Field label="Montant (DH)">
                    <Input value={form.montant} onChange={set("montant")} type="number" placeholder="0" />
                  </Field>
                  <Field label="Référence">
                    <Input value={form.reference} onChange={set("reference")} placeholder="REF-XXXX" />
                  </Field>
                  <Field label="Méthode">
                    <select style={layout.input} value={form.methode} onChange={set("methode")}>
                      {methodOptions.map(m => (
                        <option key={m.value} value={m.value}>{m.icon} {m.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Statut">
                    <select style={layout.input} value={form.statut} onChange={set("statut")}>
                      {statutOptions.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Date de paiement">
                    <Input value={form.datePaiement} onChange={set("datePaiement")} type="date" />
                  </Field>
                </div>

              </div>

              {/* Footer */}
              <div style={layout.modalFooter}>
                {error && (
                  <p style={{ color: colors.danger, fontSize: 12, flex: 1, textAlign: "left", margin: 0 }}>
                    {error}
                  </p>
                )}
                {/* ✅ Fix 4: btn("ghost") instead of btn() with no argument */}
                <button style={layout.btn("ghost")} type="button" onClick={close} disabled={loading}>
                  Annuler
                </button>
                <button style={layout.btn("primary")} type="submit" disabled={loading}>
                  {loading ? "Ajout en cours…" : "Ajouter l'élève"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{
      fontSize: 12, fontWeight: 700, color: colors.muted,
      textTransform: "uppercase", letterSpacing: ".06em",
      margin: "16px 0 8px",
    }}>
      {children}
    </div>
  );
}

// ✅ Fix 6: Field now actually used as wrapper
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={layout.field}>
      <label style={layout.label}>{label}</label>
      {children}
    </div>
  );
}

// ✅ Fix 3: Input type now includes label (optional) and other missing props
function Input({
  value, onChange, required = false, placeholder = "", type = "text",
}: {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      style={layout.input}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      type={type}
    />
  );
}