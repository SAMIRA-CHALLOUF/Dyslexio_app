import React from 'react';
import { useTranslation } from 'react-i18next';
import { DARK, TEAL } from '../../constants/colors';

export default function DemoVideo() {
  const { t } = useTranslation();
  return (
    <section style={{ padding: "4rem 2rem", background: "#f8fafc" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{
          fontFamily: "'Nunito', sans-serif", fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
          fontWeight: 900, color: DARK, marginBottom: "1rem"
        }}>
          {t('home.demoVideo.title')}
        </h2>
        <p style={{ color: "#666", fontSize: "1.05rem", marginBottom: "3rem", maxWidth: 600, margin: "0 auto 3rem" }}>
          {t('home.demoVideo.description')}
        </p>
        
        {/* Conteneur de la vidéo */}
        <div style={{
          position: "relative",
          paddingBottom: "56.25%" /* 16:9 ratio */,
          height: 0,
          overflow: "hidden",
          borderRadius: 24,
          boxShadow: `0 20px 40px rgba(0,0,0,0.1)`,
          border: `4px solid ${TEAL}22`,
          background: "#000"
        }}>
          <video 
            style={{
              position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none", objectFit: "cover"
            }}
            src="/demo.mp4" 
            controls 
            autoPlay 
            muted 
            loop
          >
            {t('home.demoVideo.videoFallback')}
          </video>
        </div>
      </div>
    </section>
  );
}