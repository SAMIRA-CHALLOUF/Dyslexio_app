import React from 'react';
import { AUDIENCES } from '../../constants/content';
import { DARK } from '../../constants/colors';

export default function Audiences() {
  return (
    <section style={{ padding: "4rem 2rem" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: DARK }}>
            Pour chaque âge, chaque besoin
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "2rem" }}>
          {AUDIENCES.map((a) => (
            <div key={a.label} style={{
              background: "#fff", borderRadius: 24, overflow: "hidden",
              boxShadow: "0 8px 30px rgba(0,0,0,0.07)",
              border: `2px solid ${a.color}33`,
            }}>
              <div style={{ background: a.bg, padding: "2rem", textAlign: "center" }}>
                <div style={{ fontSize: 52 }}>{a.emoji}</div>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: "1.5rem", color: a.color, marginTop: 8 }}>
                  {a.label}
                </div>
                <div style={{ fontSize: "0.82rem", color: "#777", marginTop: 4 }}>{a.age}</div>
              </div>
              <div style={{ padding: "1.5rem" }}>
                {a.points.map((p) => (
                  <div key={p} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: a.bg, display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.color }} />
                    </div>
                    <span style={{ fontSize: "0.92rem", color: "#444", lineHeight: 1.5 }}>{p}</span>
                  </div>
                ))}
                <button style={{
                  width: "100%", marginTop: 8, padding: "0.8rem",
                  background: a.color, color: "#fff", border: "none",
                  borderRadius: 50, fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700, fontSize: "0.95rem", cursor: "pointer",
                  boxShadow: `0 4px 16px ${a.color}44`,
                }}>
                  En savoir plus →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
