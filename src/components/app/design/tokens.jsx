// KAIRO DESIGN SYSTEM — Single source of truth for all design tokens
// Every color, spacing, radius, shadow, animation value must come from here

export const colors = {
  // Backgrounds
  bg: {
    base: '#0f0f13',
    surface: '#161619',
    elevated: '#1e1e24',
    overlay: '#26262e',
    modal: '#2e2e38',
  },
  // Accent
  accent: {
    primary: '#7c5cbf',
    hover: '#8f6fd4',
    active: '#6a4aad',
    subtle: 'rgba(124,92,191,0.09)',
    muted: 'rgba(124,92,191,0.18)',
  },
  // Status
  status: {
    online: '#23a55a',
    idle: '#f0b232',
    dnd: '#f23f43',
    offline: '#80848e',
    invisible: '#80848e',
  },
  // Semantic
  danger: '#f23f43',
  warning: '#f0b232',
  success: '#23a55a',
  info: '#5865f2',
  // Text
  text: {
    primary: '#f2f3f5',
    secondary: '#b5bac1',
    muted: '#80848e',
    disabled: '#4e5058',
    link: '#00a8fc',
  },
  // Borders
  border: {
    default: 'rgba(255,255,255,0.06)',
    light: 'rgba(255,255,255,0.1)',
    strong: 'rgba(255,255,255,0.14)',
  },
};

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
};

export const radius = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  pill: '9999px',
};

export const shadows = {
  subtle: '0 1px 4px rgba(0,0,0,0.2), 0 0 1px rgba(0,0,0,0.1)',
  medium: '0 4px 16px rgba(0,0,0,0.3), 0 0 1px rgba(0,0,0,0.1)',
  strong: '0 8px 32px rgba(0,0,0,0.45), 0 0 1px rgba(0,0,0,0.15)',
  glow: '0 0 24px rgba(124,92,191,0.15)',
};

export const typography = {
  caption: { size: '11px', weight: 400, lineHeight: '16px', letterSpacing: '0.02em' },
  small: { size: '12px', weight: 400, lineHeight: '16px', letterSpacing: '0' },
  body: { size: '14px', weight: 400, lineHeight: '20px', letterSpacing: '0' },
  bodyLg: { size: '16px', weight: 400, lineHeight: '22px', letterSpacing: '0' },
  subtitle: { size: '18px', weight: 600, lineHeight: '24px', letterSpacing: '-0.01em' },
  title: { size: '24px', weight: 700, lineHeight: '30px', letterSpacing: '-0.02em' },
  heading: { size: '32px', weight: 700, lineHeight: '40px', letterSpacing: '-0.02em' },
  display: { size: '48px', weight: 700, lineHeight: '56px', letterSpacing: '-0.03em' },
  label: { size: '11px', weight: 600, lineHeight: '16px', letterSpacing: '0.06em' },
};

export const animation = {
  easing: {
    enter: 'cubic-bezier(0, 0, 0.2, 1)',
    exit: 'cubic-bezier(0.4, 0, 1, 1)',
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: { type: 'spring', damping: 25, stiffness: 350 },
  },
  duration: {
    instant: 80,
    fast: 150,
    normal: 250,
    slow: 400,
    verySlow: 600,
  },
};

// CSS custom properties string to inject
export const cssVariables = `
  --k-bg-base: ${colors.bg.base};
  --k-bg-surface: ${colors.bg.surface};
  --k-bg-elevated: ${colors.bg.elevated};
  --k-bg-overlay: ${colors.bg.overlay};
  --k-bg-modal: ${colors.bg.modal};
  --k-accent: ${colors.accent.primary};
  --k-accent-hover: ${colors.accent.hover};
  --k-accent-active: ${colors.accent.active};
  --k-accent-subtle: ${colors.accent.subtle};
  --k-accent-muted: ${colors.accent.muted};
  --k-status-online: ${colors.status.online};
  --k-status-idle: ${colors.status.idle};
  --k-status-dnd: ${colors.status.dnd};
  --k-status-offline: ${colors.status.offline};
  --k-danger: ${colors.danger};
  --k-warning: ${colors.warning};
  --k-success: ${colors.success};
  --k-info: ${colors.info};
  --k-text-primary: ${colors.text.primary};
  --k-text-secondary: ${colors.text.secondary};
  --k-text-muted: ${colors.text.muted};
  --k-text-disabled: ${colors.text.disabled};
  --k-text-link: ${colors.text.link};
  --k-border: ${colors.border.default};
  --k-border-light: ${colors.border.light};
  --k-border-strong: ${colors.border.strong};
  --k-shadow-subtle: ${shadows.subtle};
  --k-shadow-medium: ${shadows.medium};
  --k-shadow-strong: ${shadows.strong};
  --k-shadow-glow: ${shadows.glow};
  --k-radius-xs: ${radius.xs};
  --k-radius-sm: ${radius.sm};
  --k-radius-md: ${radius.md};
  --k-radius-lg: ${radius.lg};
  --k-radius-xl: ${radius.xl};
  --k-radius-pill: ${radius.pill};
`;