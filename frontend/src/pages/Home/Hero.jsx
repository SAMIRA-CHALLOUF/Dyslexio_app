import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TEAL, TEAL_LIGHT, AMBER, AMBER_LIGHT, CORAL, CORAL_LIGHT, DARK } from '../../constants/colors';

export default function Hero({ isLoggedIn, onOpenLogin }) {
  const navigate  = useNavigate();
  const { t }     = useTranslation();

  const slides = [
    {
      id: 1,
      tag:        t('hero.badge'),
      titleStart: t('hero.title1') + ' ',
      highlight:  t('hero.title2'),
      titleEnd:   ' ' + t('hero.title3'),
      desc:       t('hero.subtitle'),
      mockupType: 'reading',
      color:      TEAL,
      lightColor: TEAL_LIGHT,
    },
    {
      id: 2,
      tag:        t('hero.slide2.badge'),
      titleStart: t('hero.slide2.title1') + ' ',
      highlight:  t('hero.slide2.title2'),
      titleEnd:   ' ' + t('hero.slide2.title3'),
      desc:       t('hero.slide2.subtitle'),
      mockupType: 'dictation',
      color:      '#2E7D32',
      lightColor: '#E8F5E9',
    },
    {
      id: 3,
      tag:        t('hero.slide3.badge'),
      titleStart: t('hero.slide3.title1') + ' ',
      highlight:  t('hero.slide3.title2'),
      titleEnd:   ' ' + t('hero.slide3.title3'),
      desc:       t('hero.slide3.subtitle'),
      mockupType: 'stats',
      color:      '#558B2F',
      lightColor: '#F1F8E9',
    },
  ];

  const [currentSlide,    setCurrentSlide]    = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setTimeout(() => setIsTransitioning(false), 500);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleDotClick = (index) => {
    if (index === currentSlide || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const slide = slides[currentSlide];

  /* ── Mockups dynamiques ── */
  const renderMockup = (type) => {
    if (type === 'reading') {
      return (
        <div style={{ padding: '1.25rem', lineHeight: 2.1, fontSize: '0.97rem', animation: 'fadeIn 0.5s ease-out' }}>
          {t('hero.dyslexia.parts', { returnObjects: true }).map((w, i) => (
            <span key={i} style={{
              background:   i === 3 ? `${AMBER}55` : 'transparent',
              borderRadius: 4,
              padding:      '0 1px',
              borderBottom: i === 3 ? `2.5px solid ${AMBER}` : 'none',
              fontWeight:   i === 3 ? 700 : 400,
              transition:   'all 0.3s ease',
            }}>{w}</span>
          ))}
          <span>{t('hero.dyslexia.post')}</span>
        </div>
      );
    }

    if (type === 'dictation') {
      return (
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 15, animation: 'fadeIn 0.5s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f8fafc', padding: 12, borderRadius: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, background: CORAL, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
              🎙️
            </div>
            <div>
              <div style={{ height: 6, width: 120, background: '#e2e8f0', borderRadius: 4, marginBottom: 6 }} />
              <div style={{ height: 6, width: 80,  background: '#e2e8f0', borderRadius: 4 }} />
            </div>
          </div>
          <div style={{ background: CORAL_LIGHT, border: `1px solid ${CORAL}`, padding: 12, borderRadius: 12, color: CORAL, fontSize: 14, fontWeight: 700 }}>
            ✨ {t('hero.slide2.aiSuccess')}
          </div>
        </div>
      );
    }

    /* stats */
    return (
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 15, animation: 'fadeIn 0.5s ease-out' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1, height: 80, background: AMBER_LIGHT, borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: AMBER }}>12</span>
            <span style={{ fontSize: 11, color: AMBER, fontWeight: 700 }}>{t('hero.slide3.booksRead')}</span>
          </div>
          <div style={{ flex: 1, height: 80, background: TEAL_LIGHT, borderRadius: 12, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: 24, fontWeight: 800, color: TEAL }}>A+</span>
            <span style={{ fontSize: 11, color: TEAL, fontWeight: 700 }}>{t('hero.slide3.avgScore')}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section style={{
      position:        'relative',
      overflow:        'hidden',
      padding:         '5rem 2rem 4rem',
      backgroundColor: '#ffffff',
      minHeight:       '85vh',
      display:         'flex',
      alignItems:      'center',
    }}>
      {/* Blobs décoratifs dynamiques */}
      <div style={{
        position: 'absolute', top: -80, right: -120, width: 480, height: 480,
        background: `radial-gradient(circle, ${slide.color}22, transparent 70%)`,
        borderRadius: '50%', pointerEvents: 'none',
        transition: 'background 1s ease-in-out',
      }} />
      <div style={{
        position: 'absolute', bottom: -60, left: -80, width: 380, height: 380,
        background: `radial-gradient(circle, ${slide.color}15, transparent 70%)`,
        borderRadius: '50%', pointerEvents: 'none',
        transition: 'background 1s ease-in-out',
      }} />

      <div style={{
        maxWidth:  1200,
        margin:    '0 auto',
        display:   'flex',
        alignItems:'center',
        gap:       '4rem',
        flexWrap:  'wrap',
        position:  'relative',
        zIndex:    2,
      }}>
        {/* ── Gauche : texte ── */}
        <div style={{
          flex:      1,
          minWidth:  300,
          maxWidth:  600,
          opacity:   isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'translateY(15px)' : 'translateY(0)',
          transition:'opacity 0.4s ease-out, transform 0.4s ease-out',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: slide.lightColor, color: slide.color,
            border: `1.5px solid ${slide.color}33`,
            borderRadius: 50, padding: '0.4rem 1rem',
            fontSize: '0.85rem', fontWeight: 700, marginBottom: '1.5rem',
          }}>
            ✨ {slide.tag}
          </div>

          {/* Titre */}
          <h1 style={{
            fontFamily:    "'Nunito', sans-serif",
            fontSize:      'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight:    900,
            lineHeight:    1.18,
            color:         DARK,
            marginBottom:  '1.5rem',
            letterSpacing: '-0.5px',
          }}>
            {slide.titleStart}
            <span style={{ color: slide.color, position: 'relative', display: 'inline-block' }}>
              {slide.highlight}
              {/* Soulignement animé SVG */}
              <svg width="100%" height="12" viewBox="0 0 100 12"
                style={{ position: 'absolute', bottom: -4, left: 0, zIndex: -1 }}
                preserveAspectRatio="none">
                <path d="M0,10 Q50,-5 100,10" stroke={slide.lightColor} strokeWidth="8" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            {slide.titleEnd}
          </h1>

          {/* Description */}
          <p style={{ fontSize: '1.15rem', color: '#555', lineHeight: 1.8, maxWidth: 520, marginBottom: '2.5rem', fontWeight: 400 }}>
            {slide.desc}
          </p>

          {/* CTA */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="pulse-btn"
              onClick={() => isLoggedIn ? navigate('/editor') : onOpenLogin()}
              style={{
                background:  `linear-gradient(135deg, ${slide.color}, ${DARK})`,
                color: '#fff', border: 'none',
                padding: '1rem 2.2rem', borderRadius: 50,
                fontSize: '1rem', fontWeight: 800,
                fontFamily: "'Nunito', sans-serif",
                cursor: 'pointer',
                boxShadow: `0 8px 25px ${slide.color}55`,
                display: 'flex', alignItems: 'center', gap: 10,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e)  => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {t('hero.cta')} 
            </button>
          </div>

          {/* Dots indicateurs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: '3rem' }}>
            {slides.map((s, index) => (
              <div
                key={s.id}
                onClick={() => handleDotClick(index)}
                style={{
                  width:      currentSlide === index ? 32 : 10,
                  height:     10,
                  borderRadius: 10,
                  background: currentSlide === index ? slide.color : '#cbd5e1',
                  cursor:     'pointer',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Droite : mockup 3D ── */}
        <div style={{ flex: 1, minWidth: 280, display: 'flex', justifyContent: 'center', perspective: '1000px' }}>
          <div style={{
            width:        'min(420px, 90vw)',
            background:   '#fff',
            borderRadius: 28,
            boxShadow:    `0 35px 60px -15px ${slide.color}35`,
            overflow:     'hidden',
            border:       '1px solid #f1f5f9',
            opacity:      isTransitioning ? 0 : 1,
            transform:    isTransitioning
              ? 'translateY(30px) rotateX(15deg) scale(0.9)'
              : 'translateY(0) rotateX(0deg) scale(1)',
            transformStyle: 'preserve-3d',
            transition:   'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            animation:    !isTransitioning ? 'float3D 6s ease-in-out infinite' : 'none',
          }}>
            {/* Header */}
            <div style={{ background: slide.color, padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background 0.5s' }}>
              <span style={{ color: '#fff', fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '0.95rem' }}>
                {t('hero.readMode')}
              </span>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#FF6B6B', '#FFC107', '#4CAF50'].map((c) => (
                  <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
                ))}
              </div>
            </div>

            {/* Toolbar */}
            <div style={{ background: slide.lightColor, padding: '0.75rem 1.25rem', display: 'flex', gap: 10, transition: 'background 0.5s' }}>
              {[t('hero.toolbar.listen'), t('hero.toolbar.font'), t('hero.toolbar.color')].map((label) => (
                <span key={label} style={{
                  background: '#fff', color: slide.color, fontSize: '0.78rem',
                  padding: '0.4rem 0.85rem', borderRadius: 50, fontWeight: 700,
                  border: `1px solid ${slide.color}33`,
                }}>{label}</span>
              ))}
            </div>

            {/* Contenu dynamique */}
            <div style={{ minHeight: 180 }}>
              {renderMockup(slide.mockupType)}
            </div>

            {/* Progress footer */}
            <div style={{ padding: '0 1.25rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', marginBottom: 8, fontWeight: 600 }}>
                <span>{t('hero.readProgressLabel')}</span>
                <span style={{ color: slide.color, fontWeight: 800 }}>85%</span>
              </div>
              <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', background: slide.color, borderRadius: 4, transition: 'background 0.5s' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animations globales */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float3D {
          0%   { transform: translateY(0px)   rotateX(0deg)  rotateY(0deg);  }
          25%  { transform: translateY(-10px) rotateX(2deg)  rotateY(-2deg); }
          50%  { transform: translateY(-15px) rotateX(0deg)  rotateY(0deg);  }
          75%  { transform: translateY(-10px) rotateX(-2deg) rotateY(2deg);  }
          100% { transform: translateY(0px)   rotateX(0deg)  rotateY(0deg);  }
        }
      `}</style>
    </section>
  );
}