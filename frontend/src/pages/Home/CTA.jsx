import React from 'react';
import { TEAL, DARK } from '../../constants/colors';

export default function CTA() {
  return (
    <section style={{ padding: "5rem 2rem" }}>
      <div style={{
        maxWidth: 800, margin: "0 auto", textAlign: "center",
        background: `linear-gradient(135deg, ${DARK} 0%, #2D4A3E 100%)`,
        borderRadius: 32, padding: "4rem 3rem",
        boxShadow: `0 20px 60px ${DARK}44`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -40, right: -40, width: 200, height: 200,
          background: `radial-gradient(circle, ${TEAL}33, transparent)`,
          borderRadius: "50%",
        }} />
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
        <h2 style={{
          fontFamily: "'Nunito', sans-serif", fontWeight: 900,
          fontSize: "clamp(1.6rem, 4vw, 2.4rem)", color: "#fff",
          marginBottom: "1rem", lineHeight: 1.3,
        }}>
          Commencez votre essai gratuit dès aujourd'hui
        </h2>
        <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", lineHeight: 1.8, marginBottom: "2rem", maxWidth: 500, margin: "0 auto 2rem" }}>
          Sans carte bancaire. Sans engagement. Accédez à toutes les fonctionnalités pendant 14 jours.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button style={{
            background: `linear-gradient(135deg, ${TEAL}, #0F6E56)`,
            color: "#fff", border: "none",
            padding: "1rem 2.5rem", borderRadius: 50,
            fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.05rem",
            cursor: "pointer", boxShadow: `0 6px 24px ${TEAL}66`,
          }}>
             Essayer gratuitement
          </button>
          <button style={{
            background: "transparent", color: "#fff",
            border: "2px solid rgba(255,255,255,0.3)",
            padding: "1rem 2.5rem", borderRadius: 50,
            fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: "1rem",
            cursor: "pointer",
          }}>
            Voir les tarifs
          </button>
        </div>
      </div>
    </section>
  );
}
