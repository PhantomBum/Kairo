import { useEffect } from 'react';
import { colors as defaultColors } from '@/components/app/design/tokens';

const THEME_OVERRIDES = {
  dark: {},
  amoled: {
    '--k-bg-base': '#000000',
    '--k-bg-surface': '#0a0a0a',
    '--k-bg-elevated': '#0d0d0d',
    '--k-bg-overlay': '#111111',
    '--k-bg-modal': '#090909',
    '--k-bg-float': '#080808',
    '--bg-deep': '#000000',
    '--bg-base': '#000000',
    '--bg-surface': '#0a0a0a',
    '--bg-elevated': '#0d0d0d',
    '--bg-overlay': '#111111',
  },
  midnight: {
    '--k-bg-base': '#0d0d1a',
    '--k-bg-surface': '#12122a',
    '--k-bg-elevated': '#161636',
    '--k-bg-overlay': '#1a1a40',
    '--k-bg-modal': '#101028',
    '--k-bg-float': '#0e0e22',
    '--bg-deep': '#0d0d1a',
    '--bg-base': '#0d0d1a',
    '--bg-surface': '#12122a',
    '--bg-elevated': '#161636',
    '--bg-overlay': '#1a1a40',
  },
};

export default function ThemeEnforcer({ theme, fontScaling, saturation, accentColor, reducedMotion }) {
  useEffect(() => {
    const root = document.documentElement;
    const overrides = THEME_OVERRIDES[theme] || {};
    
    // Apply theme color overrides
    Object.entries(overrides).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Reset to defaults if switching back to dark
    if (!overrides || Object.keys(overrides).length === 0) {
      Object.keys(THEME_OVERRIDES.amoled).forEach(key => {
        root.style.removeProperty(key);
      });
    }

    return () => {
      Object.keys(THEME_OVERRIDES.amoled).forEach(key => {
        root.style.removeProperty(key);
      });
    };
  }, [theme]);

  // Font scaling
  useEffect(() => {
    const scale = fontScaling || 100;
    document.documentElement.style.fontSize = `${scale}%`;
    return () => { document.documentElement.style.fontSize = ''; };
  }, [fontScaling]);

  // Saturation
  useEffect(() => {
    const sat = saturation ?? 100;
    if (sat !== 100) {
      document.documentElement.style.filter = `saturate(${sat / 100})`;
    } else {
      document.documentElement.style.filter = '';
    }
    return () => { document.documentElement.style.filter = ''; };
  }, [saturation]);

  // Reduced motion
  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
    return () => document.documentElement.classList.remove('reduced-motion');
  }, [reducedMotion]);

  // Accent color
  useEffect(() => {
    if (accentColor) {
      document.documentElement.style.setProperty('--k-accent', accentColor);
      document.documentElement.style.setProperty('--accent', accentColor);
    }
    return () => {
      document.documentElement.style.removeProperty('--k-accent');
      document.documentElement.style.removeProperty('--accent');
    };
  }, [accentColor]);

  return null;
}