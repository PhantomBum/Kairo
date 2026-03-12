// KAIRO DESIGN SYSTEM — Kloak-inspired: deep black + clean white
// No warm cream — pure white text, cold grays, high contrast

export const KAIRO_LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697a93eea52ff0ef8406c21a/e96e433dc_generated_image.png';

export const colors = {
  bg: {
    base: '#0a0a0a',        // server rail — true black
    surface: '#111111',     // sidebar panels
    elevated: '#161616',    // main chat area
    overlay: '#1a1a1a',     // inputs, cards, dropdowns
    modal: '#131313',       // modals
    hover: 'rgba(255,255,255,0.04)',
    active: 'rgba(255,255,255,0.07)',
    float: '#0e0e0e',       // tooltips, popouts, context menus
  },
  accent: {
    primary: '#5865F2',     // Kloak-style blue-violet accent
    hover: '#4752C4',
    active: '#3C45A5',
    subtle: 'rgba(88,101,242,0.1)',
    muted: 'rgba(88,101,242,0.18)',
    glow: 'rgba(88,101,242,0.06)',
  },
  status: {
    online: '#3ba55c',
    idle: '#faa61a',
    dnd: '#ed4245',
    offline: '#4f4f4f',
    invisible: '#4f4f4f',
  },
  danger: '#ed4245',
  warning: '#faa61a',
  success: '#3ba55c',
  info: '#5865F2',
  text: {
    primary: '#ffffff',        // pure white — main text
    secondary: '#b5bac1',     // cool gray
    muted: '#6d6f78',          // mid gray
    disabled: '#4e4f56',       // dim gray
    link: '#00AFF4',           // Kloak-style link blue
  },
  border: {
    default: 'rgba(255,255,255,0.06)',
    light: 'rgba(255,255,255,0.04)',
    strong: 'rgba(255,255,255,0.1)',
  },
};

export const shadows = {
  subtle: '0 1px 3px rgba(0,0,0,0.5)',
  medium: '0 4px 16px rgba(0,0,0,0.6)',
  strong: '0 8px 32px rgba(0,0,0,0.7)',
  glow: '0 0 24px rgba(88,101,242,0.04)',
  elevation: {
    low: '0 1px 0 rgba(0,0,0,0.4)',
    high: '0 8px 24px rgba(0,0,0,0.6)',
  },
};

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
  --bg-glass: rgba(255,255,255,0.02);
  --bg-glass-hover: rgba(255,255,255,0.04);
  --bg-glass-active: rgba(255,255,255,0.07);
  --bg-glass-strong: rgba(255,255,255,0.03);
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
  --accent-purple: #a78bfa;
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