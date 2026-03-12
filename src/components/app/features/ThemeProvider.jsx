import { useEffect } from 'react';

// Theme CSS variable overrides
const THEMES = {
  dark: {}, // default — no overrides needed
  amoled: {
    '--k-bg-base': '#000000',
    '--k-bg-surface': '#000000',
    '--k-bg-elevated': '#0a0a0a',
    '--k-bg-overlay': '#0f0f0f',
    '--k-bg-modal': '#050505',
    '--k-bg-float': '#080808',
    '--bg-deep': '#000000',
    '--bg-base': '#000000',
    '--bg-surface': '#000000',
    '--bg-elevated': '#0a0a0a',
    '--bg-overlay': '#0f0f0f',
  },
  midnight: {
    '--k-bg-base': '#0d0d1a',
    '--k-bg-surface': '#12122a',
    '--k-bg-elevated': '#161636',
    '--k-bg-overlay': '#1a1a3e',
    '--k-bg-modal': '#0f0f24',
    '--k-bg-float': '#101028',
    '--bg-deep': '#0d0d1a',
    '--bg-base': '#0d0d1a',
    '--bg-surface': '#12122a',
    '--bg-elevated': '#161636',
    '--bg-overlay': '#1a1a3e',
  },
};

export default function ThemeProvider({ theme, fontScale, saturation }) {
  useEffect(() => {
    const root = document.documentElement;
    const overrides = THEMES[theme] || {};

    // Reset to defaults first by removing overrides
    Object.keys(THEMES.amoled).concat(Object.keys(THEMES.midnight)).forEach(k => {
      root.style.removeProperty(k);
    });

    // Apply theme overrides
    Object.entries(overrides).forEach(([k, v]) => {
      root.style.setProperty(k, v);
    });

    // Font scaling
    const scale = fontScale || 100;
    root.style.fontSize = `${(scale / 100) * 14}px`;

    // Color saturation
    const sat = saturation ?? 100;
    if (sat !== 100) {
      root.style.filter = `saturate(${sat}%)`;
    } else {
      root.style.filter = '';
    }

    return () => {
      Object.keys(overrides).forEach(k => root.style.removeProperty(k));
      root.style.fontSize = '';
      root.style.filter = '';
    };
  }, [theme, fontScale, saturation]);

  return null;
}