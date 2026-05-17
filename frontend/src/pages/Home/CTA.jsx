import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function CTA() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section style={{
      padding: "80px 24px",
      background: "#fff",
      borderTop: "1px solid #F0F0F0",
    }}>
      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 48,
        flexWrap: "wrap",
      }}>
        {/* Left: text */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={{
            display: "inline-block",
            background: "#E8F5F0",
            color: "#1A8A6C",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: ".08em",
            textTransform: "uppercase",
            padding: "4px 12px",
            borderRadius: 99,
            marginBottom: 16,
          }}>
            Essai maintenant
          </div>

          <h2 style={{
            fontSize: "clamp(24px, 3vw, 36px)",
            fontWeight: 800,
            color: "#0F172A",
            margin: "0 0 16px",
            lineHeight: 1.2,
          }}>
            Prêt à transformer votre<br />expérience de lecture ?
          </h2>

          <p style={{
            fontSize: 16,
            color: "#64748B",
            margin: "0 0 32px",
            lineHeight: 1.7,
            maxWidth: 480,
          }}>
            Rejoignez plus de 50 000 familles qui utilisent Logopédie chaque jour.
            Aucune carte bancaire requise.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/auth")}
              style={{
                height: 48,
                padding: "0 28px",
                borderRadius: 10,
                border: "none",
                background: "#1A8A6C",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 14px rgba(26,138,108,.25)",
                transition: "all .2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "#157A5E"}
              onMouseLeave={e => e.currentTarget.style.background = "#1A8A6C"}
            >
              Commencer gratuitement →
            </button>

            <button
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                height: 48,
                padding: "0 24px",
                borderRadius: 10,
                border: "1.5px solid #E2E8F0",
                background: "transparent",
                color: "#0F172A",
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all .2s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#1A8A6C"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#E2E8F0"}
            >
              Voir les fonctionnalités
            </button>
          </div>
        </div>

        {/* Right: trust badges */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          flexShrink: 0,
        }}>
          {[
            { icon: "🔒", label: "Données sécurisées", sub: "RGPD conforme" },
            { icon: "⚡", label: "Accès immédiat", sub: "Sans installation" },
            { icon: "🎯", label: "Conçu par experts", sub: "Orthophonistes" },
            { icon: "📱", label: "Multi-appareils", sub: "Web, mobile, tablette" },
          ].map((item) => (
            <div key={item.label} style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: 12,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#0F172A" }}>{item.label}</div>
                <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}