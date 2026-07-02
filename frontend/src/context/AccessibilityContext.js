// src/context/AccessibilityContext.js
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';

const AccessibilityContext = createContext(null);

// ── Theme definitions ──
const THEMES = {
  light: {
    '--bg-primary': '#f8fafc',
    '--bg-secondary': '#ffffff',
    '--bg-tertiary': '#f1f5f9',
    '--text-primary': '#1e293b',
    '--text-secondary': '#334155',
    '--text-muted': '#64748b',
    '--border-color': '#e2e8f0',
    '--border-light': '#f1f5f9',
    '--shadow-color': 'rgba(0, 0, 0, 0.05)',
    '--input-bg': '#f8fafc',
    '--input-focus-bg': '#ffffff',
    '--card-bg': '#ffffff',
    '--danger-bg': '#fef2f2',
    '--danger-border': '#fecaca',
    '--success-bg': '#f0fdf4',
    '--success-text': '#16a34a',
    '--error-text': '#ef4444',
    '--navbar-bg': '#ffffff',
    '--navbar-border': '#e2e8f0',
  },
  dark: {
    '--bg-primary': '#0f172a',
    '--bg-secondary': '#1e293b',
    '--bg-tertiary': '#334155',
    '--text-primary': '#f1f5f9',
    '--text-secondary': '#cbd5e1',
    '--text-muted': '#94a3b8',
    '--border-color': '#334155',
    '--border-light': '#1e293b',
    '--shadow-color': 'rgba(0, 0, 0, 0.3)',
    '--input-bg': '#1e293b',
    '--input-focus-bg': '#334155',
    '--card-bg': '#1e293b',
    '--danger-bg': '#450a0a',
    '--danger-border': '#7f1d1d',
    '--success-bg': '#052e16',
    '--success-text': '#4ade80',
    '--error-text': '#f87171',
    '--navbar-bg': '#1e293b',
    '--navbar-border': '#334155',
  },
  sepia: {
    '--bg-primary': '#faf6f1',
    '--bg-secondary': '#fefcf9',
    '--bg-tertiary': '#f5efe6',
    '--text-primary': '#44403c',
    '--text-secondary': '#57534e',
    '--text-muted': '#78716c',
    '--border-color': '#e7e0d5',
    '--border-light': '#f5efe6',
    '--shadow-color': 'rgba(120, 80, 40, 0.06)',
    '--input-bg': '#f5efe6',
    '--input-focus-bg': '#fefcf9',
    '--card-bg': '#fefcf9',
    '--danger-bg': '#fef2f2',
    '--danger-border': '#fecaca',
    '--success-bg': '#f0fdf4',
    '--success-text': '#16a34a',
    '--error-text': '#ef4444',
    '--navbar-bg': '#fefcf9',
    '--navbar-border': '#e7e0d5',
  },
};

// ── Font definitions ──
const FONTS = {
  hyperlegible: "'Atkinson Hyperlegible', sans-serif",
  opendyslexic: "'OpenDyslexic', sans-serif",
  arial: "Arial, Helvetica, sans-serif",
};

// ── Font size scale ──
const FONT_SIZES = {
  small: '14px',
  medium: '16px',
  large: '18px',
  xlarge: '20px',
};

// ── Default settings ──
const DEFAULTS = {
  theme: 'light',
  font: 'hyperlegible',
  fontSize: 'medium',
};

const STORAGE_KEY = 'dyslexio_accessibility';

export function AccessibilityProvider({ children }) {
  // Load initial state from localStorage
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULTS, ...parsed };
      }
    } catch {
      // Ignore corrupted data
    }
    return { ...DEFAULTS };
  });

  // Apply CSS custom properties whenever settings change
  const applySettings = useCallback((currentSettings) => {
    const root = document.documentElement;

    // Apply theme colors
    const themeVars = THEMES[currentSettings.theme] || THEMES.light;
    Object.entries(themeVars).forEach(([prop, value]) => {
      root.style.setProperty(prop, value);
    });

    // Apply font family
    const fontFamily = FONTS[currentSettings.font] || FONTS.hyperlegible;
    root.style.setProperty('--font-family', fontFamily);

    // Apply font size
    const fontSize = FONT_SIZES[currentSettings.fontSize] || FONT_SIZES.medium;
    root.style.setProperty('--font-size-base', fontSize);

    // Apply data attributes for CSS selectors
    root.setAttribute('data-theme', currentSettings.theme);
    root.setAttribute('data-font', currentSettings.font);
    root.setAttribute('data-fontsize', currentSettings.fontSize);
  }, []);

  // Apply on mount and whenever settings change
  useEffect(() => {
    applySettings(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings, applySettings]);

  // ── Public API ──
  const setTheme = useCallback((theme) => {
    if (THEMES[theme]) {
      setSettings((prev) => ({ ...prev, theme }));
    }
  }, []);

  const setFont = useCallback((font) => {
    if (FONTS[font]) {
      setSettings((prev) => ({ ...prev, font }));
    }
  }, []);

  const setFontSize = useCallback((fontSize) => {
    if (FONT_SIZES[fontSize]) {
      setSettings((prev) => ({ ...prev, fontSize }));
    }
  }, []);

  const resetSettings = useCallback(() => {
    setSettings({ ...DEFAULTS });
  }, []);

  const value = {
    theme: settings.theme,
    font: settings.font,
    fontSize: settings.fontSize,
    setTheme,
    setFont,
    setFontSize,
    resetSettings,
    // Expose constants for UI builders
    THEMES: Object.keys(THEMES),
    FONTS: Object.keys(FONTS),
    FONT_SIZES: Object.keys(FONT_SIZES),
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
