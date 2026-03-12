// KAIRO DESIGN SYSTEM — True Discord Dark Theme
// Pixel-perfect dark palette, crisp typography, minimal decoration

export const colors = {
  bg: {
    base: '#1e1f22',        // server rail bg
    surface: '#2b2d31',     // sidebar bg  
    elevated: '#313338',    // main chat area
    overlay: '#383a40',     // inputs, cards, dropdowns
    modal: '#313338',       // modals
    hover: 'rgba(255,255,255,0.06)',
    active: 'rgba(255,255,255,0.1)',
    float: '#111214',       // tooltips, popouts, context menus
  },
  accent: {
    primary: '#5865f2',
    hover: '#4752c4',
    active: '#3c45a5',
    subtle: 'rgba(88,101,242,0.15)',
    muted: 'rgba(88,101,242,0.2)',
    glow: 'rgba(88,101,242,0.08)',
  },
  status: {
    online: '#23a559',
    idle: '#f0b232',
    dnd: '#f23f43',
    offline: '#80848e',
    invisible: '#80848e',
  },
  danger: '#f23f43',
  warning: '#f0b232',
  success: '#23a559',
  info: '#5865f2',
  text: {
    primary: '#f2f3f5',
    secondary: '#b5bac1',
    muted: '#949ba4',
    disabled: '#6d6f78',
    link: '#00a8fc',
  },
  border: {
    default: 'rgba(255,255,255,0.06)',
    light: 'rgba(255,255,255,0.08)',
    strong: 'rgba(255,255,255,0.12)',
  },
};

export const shadows = {
  subtle: '0 1px 2px rgba(0,0,0,0.2)',
  medium: '0 4px 12px rgba(0,0,0,0.32)',
  strong: '0 8px 24px rgba(0,0,0,0.4)',
  glow: '0 0 20px rgba(88,101,242,0.06)',
  elevation: {
    low: '0 1px 0 rgba(0,0,0,0.2), 0 1.5px 0 rgba(0,0,0,0.06)',
    high: '0 8px 16px rgba(0,0,0,0.24)',
  },
};

// Legacy compat
export const glass = {
  rail: { background: colors.bg.base },
  surface: { background: colors.bg.surface },
  card: { background: colors.bg.overlay },
  hover: { background: colors.bg.hover },
  active: { background: colors.accent.subtle },
  bubble: { background: colors.bg.overlay },
  bubbleOwn: { background: colors.accent.subtle },
};

export const radius = {
  xs: '3px', sm: '4px', md: '8px', lg: '12px', xl: '16px', pill: '9999px',
};

export const spacing = {
  0: '0px', 1: '4px', 2: '8px', 3: '12px', 4: '16px',
  5: '20px', 6: '24px', 8: '32px', 10: '40px', 12: '48px', 16: '64px',
};

export const typography = {
  caption: { size: '11px', weight: 400, lineHeight: '16px', letterSpacing: '0.02em' },
  small: { size: '12px', weight: 400, lineHeight: '16px' },
  body: { size: '14px', weight: 400, lineHeight: '20px' },
  bodyLg: { size: '16px', weight: 400, lineHeight: '22px' },
  subtitle: { size: '18px', weight: 600, lineHeight: '24px' },
  title: { size: '24px', weight: 700, lineHeight: '30px' },
  heading: { size: '32px', weight: 700, lineHeight: '40px' },
  label: { size: '12px', weight: 700, lineHeight: '16px', letterSpacing: '0.02em' },
};

export const animation = {
  easing: { standard: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)' },
  duration: { fast: 100, normal: 150, slow: 200 },
};

export const cssVariables = `
  --k-bg-base: ${colors.bg.base};
  --k-bg-surface: ${colors.bg.surface};
  --k-bg-elevated: ${colors.bg.elevated};
  --k-bg-overlay: ${colors.bg.overlay};
  --k-bg-modal: ${colors.bg.modal};
  --k-bg-float: ${colors.bg.float};
  --k-accent: ${colors.accent.primary};
  --k-accent-hover: ${colors.accent.hover};
  --k-accent-subtle: ${colors.accent.subtle};
  --k-status-online: ${colors.status.online};
  --k-status-idle: ${colors.status.idle};
  --k-status-dnd: ${colors.status.dnd};
  --k-status-offline: ${colors.status.offline};
  --k-danger: ${colors.danger};
  --k-warning: ${colors.warning};
  --k-success: ${colors.success};
  --k-text-primary: ${colors.text.primary};
  --k-text-secondary: ${colors.text.secondary};
  --k-text-muted: ${colors.text.muted};
  --k-text-disabled: ${colors.text.disabled};
  --k-text-link: ${colors.text.link};
  --k-border: ${colors.border.default};
  --k-border-light: ${colors.border.light};
  --k-border-strong: ${colors.border.strong};

  /* Backwards-compatible aliases */
  --bg-deep: ${colors.bg.base};
  --bg-base: ${colors.bg.base};
  --bg-surface: ${colors.bg.surface};
  --bg-elevated: ${colors.bg.elevated};
  --bg-overlay: ${colors.bg.overlay};
  --bg-glass: rgba(255,255,255,0.03);
  --bg-glass-hover: rgba(255,255,255,0.06);
  --bg-glass-active: rgba(255,255,255,0.1);
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
  --glass-blur: 16px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  --shadow-sm: ${shadows.subtle};
  --shadow-md: ${shadows.medium};
  --shadow-lg: ${shadows.strong};
  --shadow-glow: ${shadows.glow};
`;