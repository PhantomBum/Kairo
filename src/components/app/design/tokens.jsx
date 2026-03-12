// KAIRO V2 DESIGN SYSTEM — Lighter, breathable dark palette
// Inspired by Kloak: charcoal tones, not pure black

export const colors = {
  // Backgrounds — lighter charcoal scale
  bg: {
    base: '#1a1b1e',        // darkest: server rail
    surface: '#1e1f23',     // sidebar panels
    elevated: '#25262b',    // chat area, main content
    overlay: '#2c2d33',     // cards, dropdowns
    modal: '#2c2d33',       // modals
    hover: 'rgba(255,255,255,0.05)',
    active: 'rgba(255,255,255,0.08)',
  },
  // Accent — muted purple-blue
  accent: {
    primary: '#6c7adb',
    hover: '#8b96e9',
    active: '#5b69c9',
    subtle: 'rgba(108,122,219,0.1)',
    muted: 'rgba(108,122,219,0.2)',
    glow: 'rgba(108,122,219,0.12)',
  },
  // Status
  status: {
    online: '#3ba55d',
    idle: '#faa81a',
    dnd: '#ed4245',
    offline: '#6b6d75',
    invisible: '#6b6d75',
  },
  // Semantic
  danger: '#ed4245',
  warning: '#faa81a',
  success: '#3ba55d',
  info: '#5865f2',
  // Text — slightly warm off-whites
  text: {
    primary: '#f0f1f3',
    secondary: '#a8aab2',
    muted: '#8b8d95',
    disabled: '#6b6d75',
    link: '#6c7adb',
  },
  // Borders — visible but soft
  border: {
    default: '#3a3b42',
    light: '#44454d',
    strong: '#52535c',
  },
};

export const spacing = {
  0: '0px', 1: '4px', 2: '8px', 3: '12px', 4: '16px',
  5: '20px', 6: '24px', 8: '32px', 10: '40px', 12: '48px', 16: '64px',
};

export const radius = {
  xs: '6px', sm: '10px', md: '14px', lg: '18px', xl: '24px', pill: '9999px',
};

export const shadows = {
  subtle: '0 1px 3px rgba(0,0,0,0.2)',
  medium: '0 4px 12px rgba(0,0,0,0.25)',
  strong: '0 8px 24px rgba(0,0,0,0.35)',
  glow: '0 0 20px rgba(108,122,219,0.1)',
  accentGlow: '0 0 16px rgba(108,122,219,0.2)',
};

export const glass = {
  rail: { background: colors.bg.base, border: `1px solid ${colors.border.default}` },
  surface: { background: colors.bg.surface, border: `1px solid ${colors.border.default}` },
  card: { background: colors.bg.overlay, border: `1px solid ${colors.border.default}` },
  hover: { background: colors.bg.hover },
  active: { background: 'rgba(108,122,219,0.12)', border: `1px solid rgba(108,122,219,0.25)` },
  bubble: { background: colors.bg.overlay, border: `1px solid ${colors.border.default}` },
  bubbleOwn: { background: 'rgba(108,122,219,0.12)', border: '1px solid rgba(108,122,219,0.2)' },
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
    enter: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',
    exit: 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
    spring: { type: 'spring', damping: 25, stiffness: 350 },
  },
  duration: {
    hover: 100,
    fast: 150,
    panel: 200,
    modal: 300,
    celebrate: 500,
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

  /* Backwards-compatible aliases */
  --bg-deep: ${colors.bg.base};
  --bg-base: ${colors.bg.base};
  --bg-surface: ${colors.bg.surface};
  --bg-elevated: ${colors.bg.elevated};
  --bg-overlay: ${colors.bg.overlay};
  --bg-glass: rgba(255,255,255,0.04);
  --bg-glass-hover: rgba(255,255,255,0.06);
  --bg-glass-active: rgba(255,255,255,0.09);
  --bg-glass-strong: rgba(255,255,255,0.1);
  --text-cream: ${colors.text.primary};
  --text-primary: ${colors.text.primary};
  --text-secondary: ${colors.text.secondary};
  --text-muted: ${colors.text.muted};
  --text-faint: ${colors.text.disabled};
  --accent: ${colors.accent.primary};
  --accent-warm: ${colors.warning};
  --accent-blue: ${colors.info};
  --accent-green: ${colors.success};
  --accent-red: ${colors.danger};
  --accent-purple: ${colors.accent.primary};
  --accent-amber: ${colors.warning};
  --accent-glow: ${colors.accent.subtle};
  --border: ${colors.border.default};
  --border-light: ${colors.border.light};
  --border-glow: ${colors.border.strong};
  --glass-blur: 16px;
  --radius-sm: ${radius.sm};
  --radius-md: ${radius.md};
  --radius-lg: ${radius.lg};
  --radius-xl: ${radius.xl};
  --radius-full: ${radius.pill};
  --shadow-sm: ${shadows.subtle};
  --shadow-md: ${shadows.medium};
  --shadow-lg: ${shadows.strong};
  --shadow-glow: ${shadows.glow};
`;