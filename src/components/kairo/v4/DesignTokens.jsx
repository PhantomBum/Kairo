// Kairo V4 Design System - Design Tokens & Theme
// Centralized design tokens for consistent UI across the app

export const colors = {
  // Background colors
  bg: {
    primary: '#09090b',      // Main background
    secondary: '#0f0f11',    // Cards, panels
    tertiary: '#141416',     // Elevated elements
    hover: 'rgba(255,255,255,0.03)',
    active: 'rgba(255,255,255,0.06)',
    overlay: 'rgba(0,0,0,0.8)',
  },
  
  // Border colors
  border: {
    default: 'rgba(255,255,255,0.06)',
    subtle: 'rgba(255,255,255,0.04)',
    strong: 'rgba(255,255,255,0.1)',
    focus: 'rgba(99,102,241,0.5)',
  },
  
  // Text colors
  text: {
    primary: '#ffffff',
    secondary: '#a1a1aa',
    muted: '#71717a',
    disabled: '#52525b',
  },
  
  // Accent colors
  accent: {
    primary: '#6366f1',      // Indigo
    success: '#10b981',      // Emerald
    warning: '#f59e0b',      // Amber
    danger: '#ef4444',       // Red
    info: '#3b82f6',         // Blue
  },
  
  // Status colors
  status: {
    online: '#10b981',
    idle: '#f59e0b',
    dnd: '#ef4444',
    offline: '#52525b',
    invisible: '#52525b',
  },
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '48px',
};

export const radius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

export const typography = {
  sizes: {
    xs: '11px',
    sm: '13px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '20px',
    '3xl': '24px',
  },
  weights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const shadows = {
  sm: '0 1px 2px rgba(0,0,0,0.3)',
  md: '0 4px 6px rgba(0,0,0,0.4)',
  lg: '0 10px 15px rgba(0,0,0,0.5)',
  xl: '0 20px 25px rgba(0,0,0,0.6)',
  glow: '0 0 20px rgba(99,102,241,0.3)',
};

export const transitions = {
  fast: '100ms ease',
  normal: '150ms ease',
  slow: '300ms ease',
};

// Utility function to get CSS variable
export const cssVar = (path) => {
  const parts = path.split('.');
  let value = { colors, spacing, radius, typography, shadows, transitions };
  for (const part of parts) {
    value = value[part];
  }
  return value;
};

// Tailwind class helpers
export const tw = {
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-0',
  transition: 'transition-all duration-150 ease-out',
  hoverBg: 'hover:bg-white/[0.04]',
  activeBg: 'active:bg-white/[0.06]',
};