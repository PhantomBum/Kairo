// Kairo Design System - Inspired by Kloak's privacy-first, clean aesthetic

export const colors = {
  // Core backgrounds
  bg: {
    primary: '#0a0a0b',      // Main app background
    secondary: '#0c0c0d',    // Server sidebar
    tertiary: '#111113',     // Channel/DM sidebars
    elevated: '#18181b',     // Cards, modals, dropdowns
    hover: 'rgba(255,255,255,0.04)',
    active: 'rgba(255,255,255,0.08)',
  },
  
  // Text
  text: {
    primary: '#ffffff',
    secondary: '#a1a1aa',
    muted: '#71717a',
    disabled: '#52525b',
  },
  
  // Borders
  border: {
    default: 'rgba(255,255,255,0.06)',
    subtle: 'rgba(255,255,255,0.04)',
    strong: 'rgba(255,255,255,0.12)',
  },
  
  // Accent colors
  accent: {
    primary: '#6366f1',      // Indigo - main brand
    secondary: '#8b5cf6',    // Violet - secondary brand
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
  },
  
  // Status colors
  status: {
    online: '#22c55e',
    idle: '#f59e0b',
    dnd: '#ef4444',
    invisible: '#6b7280',
    offline: '#6b7280',
  },
};

export const statusConfig = {
  online: { color: colors.status.online, label: 'Online' },
  idle: { color: colors.status.idle, label: 'Idle' },
  dnd: { color: colors.status.dnd, label: 'Do Not Disturb' },
  invisible: { color: colors.status.invisible, label: 'Invisible' },
  offline: { color: colors.status.offline, label: 'Offline' },
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem',
};

export const borderRadius = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  xxl: '1.5rem',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  glow: {
    indigo: '0 0 20px rgba(99, 102, 241, 0.3)',
    emerald: '0 0 20px rgba(34, 197, 94, 0.3)',
    red: '0 0 20px rgba(239, 68, 68, 0.3)',
  },
};

export const transitions = {
  fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
  normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
  slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
  spring: { type: 'spring', stiffness: 400, damping: 30 },
};

// Animation variants for Framer Motion
export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  },
  slideDown: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  popIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 25 } },
    exit: { opacity: 0, scale: 0.9 },
  },
};

// Typography
export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};