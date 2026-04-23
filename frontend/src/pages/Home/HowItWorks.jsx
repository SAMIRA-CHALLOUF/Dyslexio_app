import React from 'react';
import { STEPS } from '../../constants/content';
import { AMBER, DARK } from '../../constants/colors';
import { useTranslation } from 'react-i18next';

export default function HowItWorks() {
  const { t } = useTranslation();
  return (
    <section style={{ padding: "4rem 2rem", background: "#fff" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ color: AMBER, fontWeight: 700, fontSize: "0.85rem", letterSpacing: 2, textTransform: "uppercase", marginBottom: 10 }}>
            {t('nav.howItWorks')}
          </div>
          <h2 style={{ fontFamily: "'Nunito', sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: DARK }}>
            {t('home.how.title')}
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "2rem", position: "relative" }}>
          {STEPS.map((s, i) => (
            <div key={s.n} style={{ textAlign: "center", padding: "2rem 1.5rem", position: "relative" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: s.bg, border: `3px solid ${s.color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 1.25rem",
                fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: "1.6rem",
                color: s.color,
              }}>{s.n}</div>
              <h3 style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: "1.05rem", color: DARK, marginBottom: 10 }}>
                {t(s.title)}
              </h3>
              <p style={{ color: "#666", fontSize: "0.92rem", lineHeight: 1.8 }}>{t(s.desc)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
