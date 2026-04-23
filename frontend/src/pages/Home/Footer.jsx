import React from 'react';
import { DARK } from '../../constants/colors';

export default function Footer() {
  return (
    <footer style={{ background: DARK, color: "rgba(255,255,255,0.6)", padding: "2rem", textAlign: "center" }}>
      <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, color: "#fff", fontSize: "1.1rem", marginBottom: 8 }}>
        📖 Logopédie
      </div>
      <p style={{ fontSize: "0.85rem" }}>© 2026 Logopédie — Aide à la lecture et l'écriture assistée par IA</p>
    </footer>
  );
}
