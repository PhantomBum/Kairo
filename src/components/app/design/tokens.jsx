// KAIRO V2 DESIGN SYSTEM — Refined visual identity
// Every color, spacing, radius, shadow, animation value must come from here

export const colors = {
  // Backgrounds — deeper, more intentional
  bg: {
    base: '#0c0c10',
    surface: '#13131a',
    elevated: '#1a1a24',
    overlay: '#22222e',
    modal: '#2a2a38',
    hover: 'rgba(255,255,255,0.035)',
    active: 'rgba(255,255,255,0.06)',
  },
  // Accent — Kairo's signature purple, more saturated
  accent: {
    primary: '#8b5cf6',
    hover: '#a78bfa',
    active: '#7c3aed',
    subtle: 'rgba(139,92,246,0.08)',
    muted: 'rgba(139,92,246,0.16)',
    glow: 'rgba(139,92,246,0.12)',
  },
  // Status
  status: {
    online: '#22c55e',
    idle: '#eab308',
    dnd: '#ef4444',
    offline: '#6b7280',
    invisible: '#6b7280',
  },
  // Semantic
  danger: '#ef4444',
  warning: '#eab308',
  success: '#22c55e',
  info: '#6366f1',
  // Text — better contrast hierarchy
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    muted: '#94a3b8',
    disabled: '#475569',
    link: '#38bdf8',
  },
  // Borders
  border: {
    default: 'rgba(255,255,255,0.06)',
    light: 'rgba(255,255,255,0.1)',
    strong: 'rgba(255,255,255,0.16)',
  },
};

export const spacing = {
  0: '0px', 1: '4px', 2: '8px', 3: '12px', 4: '16px',
  5: '20px', 6: '24px', 8: '32px', 10: '40px', 12: '48px', 16: '64px',
};

export const radius = {
  xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px', pill: '9999px',
};

export const shadows = {
  subtle: '0 1px 4px rgba(0,0,0,0.25), 0 0 1px rgba(0,0,0,0.12)',
  medium: '0 4px 16px rgba(0,0,0,0.35), 0 0 1px rgba(0,0,0,0.12)',
  strong: '0 8px 32px rgba(0,0,0,0.5), 0 0 1px rgba(0,0,0,0.18)',
  glow: '0 0 24px rgba(139,92,246,0.12)',
  accentGlow: '0 0 20px rgba(139,92,246,0.25), 0 0 60px rgba(139,92,246,0.08)',
};

// Kairo glass styles — reusable frosted glass surfaces
export const glass = {
  rail: { background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.06)' },
  surface: { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.06)' },
  card: { background: 'rgba(255,255,255,0.035)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.05)' },
  hover: { background: 'rgba(255,255,255,0.06)' },
  active: { background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' },
  bubble: { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.06)' },
  bubbleOwn: { background: 'rgba(139,92,246,0.1)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(139,92,246,0.18)' },
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
  --bg-glass: rgba(255,255,255,0.03);
  --bg-glass-hover: rgba(255,255,255,0.05);
  --bg-glass-active: rgba(255,255,255,0.07);
  --bg-glass-strong: rgba(255,255,255,0.08);
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
  --glass-blur: 20px;
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