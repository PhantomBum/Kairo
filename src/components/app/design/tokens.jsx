/**
 * Kairo Design System — Kloak-inspired Dark
 * Deep, rich blacks. Muted accents. Private, focused, minimal.
 */

/* Backgrounds — deep void layers */
const BG_VOID = '#060608';
const BG_BASE = '#0a0a0f';
const BG_SURFACE = '#0d0d12';
const BG_ELEVATED = '#111118';
const BG_RAISED = '#16161d';
const BG_FLOAT = '#1a1a23';
const BG_OVERLAY = '#1e1e28';

/* Borders — subtle, barely there */
const BORDER_FAINT = 'rgba(255,255,255,0.04)';
const BORDER_SUBTLE = 'rgba(255,255,255,0.06)';
const BORDER_MEDIUM = 'rgba(255,255,255,0.08)';
const BORDER_STRONG = 'rgba(255,255,255,0.12)';

/* Text — clear, slightly cool */
const TEXT_PRIMARY = '#e4e4e8';
const TEXT_SECONDARY = '#8b8b96';
const TEXT_MUTED = '#5c5c66';
const TEXT_FAINT = '#3a3a40';

/* Accent — muted teal */
const ACCENT_PRIMARY = '#22c9b3';
const ACCENT_BRIGHT = '#4dd4c0';
const ACCENT_DIM = 'rgba(34,201,179,0.15)';
const ACCENT_GLOW = 'rgba(34,201,179,0.25)';

/* Semantic */
const COLOR_SUCCESS = '#2ecc71';
const COLOR_WARNING = '#e6b84c';
const COLOR_DANGER = '#e74c3c';
const COLOR_INFO = '#5b8def';

/* Special surfaces */
const SURFACE_GLASS = 'rgba(255,255,255,0.02)';
const SURFACE_BRAND = 'rgba(34,201,179,0.08)';

export const colors = {
  bg: {
    void: BG_VOID,
    base: BG_BASE,
    surface: BG_SURFACE,
    elevated: BG_ELEVATED,
    raised: BG_RAISED,
    float: BG_FLOAT,
    overlay: BG_OVERLAY,
    hover: SURFACE_GLASS,
    active: ACCENT_DIM,
    modal: BG_FLOAT,
  },
  border: {
    faint: BORDER_FAINT,
    subtle: BORDER_SUBTLE,
    medium: BORDER_MEDIUM,
    strong: BORDER_STRONG,
    default: BORDER_SUBTLE,
    light: BORDER_FAINT,
  },
  text: {
    primary: TEXT_PRIMARY,
    secondary: TEXT_SECONDARY,
    muted: TEXT_MUTED,
    faint: TEXT_FAINT,
    disabled: TEXT_FAINT,
    link: ACCENT_BRIGHT,
  },
  accent: {
    primary: ACCENT_PRIMARY,
    bright: ACCENT_BRIGHT,
    dim: ACCENT_DIM,
    glow: ACCENT_GLOW,
    hover: ACCENT_BRIGHT,
    active: '#22b8a3',
    subtle: ACCENT_DIM,
    muted: ACCENT_DIM,
  },
  status: {
    online: '#3ba55d',
    idle: '#faa81a',
    dnd: '#ed4245',
    offline: '#555566',
    invisible: '#555566',
  },
  success: COLOR_SUCCESS,
  warning: COLOR_WARNING,
  danger: COLOR_DANGER,
  info: COLOR_INFO,
};

export const shadows = {
  sm: '0 2px 8px rgba(0,0,0,0.3)',
  md: '0 4px 24px rgba(0,0,0,0.4)',
  lg: '0 8px 32px rgba(0,0,0,0.5)',
  xl: '0 16px 48px rgba(0,0,0,0.6)',
  glow: '0 0 20px var(--accent-glow)',
  glowSm: '0 0 10px var(--accent-glow)',
  subtle: '0 2px 8px rgba(0,0,0,0.3)',
  medium: '0 4px 24px rgba(0,0,0,0.4)',
  strong: '0 8px 32px rgba(0,0,0,0.5)',
  elevated: '0 4px 24px rgba(0,0,0,0.4)',
  floating: '0 8px 32px rgba(0,0,0,0.5)',
  elevation: {
    low: '0 1px 0 rgba(0,0,0,0.3)',
    high: '0 8px 24px rgba(0,0,0,0.5)',
  },
};

export const radius = {
  xs: '6px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '22px',
  '2xl': '30px',
  server: '18px',
  full: '9999px',
  pill: '9999px',
};

export const typography = {
  xs: { size: '11px', weight: 400 },
  sm: { size: '12px', weight: 400 },
  base: { size: '14px', weight: 400 },
  md: { size: '15px', weight: 400 },
  lg: { size: '16px', weight: 400 },
  xl: { size: '18px', weight: 600 },
  '2xl': { size: '22px', weight: 600 },
  '3xl': { size: '28px', weight: 700 },
  '4xl': { size: '36px', weight: 700 },
  weight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  tiny: { size: '11px', weight: 400, lineHeight: '16px', letterSpacing: '0.02em' },
  caption: { size: '11px', weight: 400, lineHeight: '16px', letterSpacing: '0.02em' },
  small: { size: '12px', weight: 400, lineHeight: '16px' },
  compact: { size: '13px', weight: 400, lineHeight: '18px' },
  body: { size: '15px', weight: 400, lineHeight: '22px' },
  bodyLg: { size: '16px', weight: 400, lineHeight: '24px' },
  subtitle: { size: '18px', weight: 600, lineHeight: '24px' },
  title: { size: '20px', weight: 600, lineHeight: '28px' },
  heading: { size: '24px', weight: 700, lineHeight: '32px' },
  hero: { size: '32px', weight: 700, lineHeight: '40px' },
  label: { size: '11px', weight: 700, lineHeight: '16px', letterSpacing: '0.08em' },
};

export const animation = {
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1.0)',
    spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
    out: 'ease-out',
    in: 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',
  },
  duration: { fast: 80, hover: 120, normal: 150, slow: 250 },
};

export const glass = {
  rail: { background: BG_BASE },
  surface: { background: BG_SURFACE },
  card: { background: BG_OVERLAY },
  hover: { background: SURFACE_GLASS },
  active: { background: ACCENT_DIM },
  bubble: { background: BG_OVERLAY },
  bubbleOwn: { background: ACCENT_DIM },
};

export const spacing = {
  0: '0px', 1: '4px', 2: '8px', 3: '12px', 4: '16px', '4.5': '18px',
  5: '20px', 6: '24px', 7: '28px', 8: '32px', 10: '40px', 11: '44px', 12: '48px', 14: '56px', 16: '64px',
};

export const KAIRO_LOGO_URL = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697a93eea52ff0ef8406c21a/e96e433dc_generated_image.png';

export const cssVariables = `
  /* Backgrounds */
  --bg-void: ${BG_VOID};
  --bg-base: ${BG_BASE};
  --bg-surface: ${BG_SURFACE};
  --bg-elevated: ${BG_ELEVATED};
  --bg-raised: ${BG_RAISED};
  --bg-float: ${BG_FLOAT};
  --bg-overlay: ${BG_OVERLAY};
  
  /* Borders */
  --border-faint: ${BORDER_FAINT};
  --border-subtle: ${BORDER_SUBTLE};
  --border-medium: ${BORDER_MEDIUM};
  --border-strong: ${BORDER_STRONG};
  
  /* Text */
  --text-primary: ${TEXT_PRIMARY};
  --text-secondary: ${TEXT_SECONDARY};
  --text-muted: ${TEXT_MUTED};
  --text-faint: ${TEXT_FAINT};
  
  /* Accent */
  --accent-primary: ${ACCENT_PRIMARY};
  --accent-bright: ${ACCENT_BRIGHT};
  --accent-dim: ${ACCENT_DIM};
  --accent-glow: ${ACCENT_GLOW};
  
  /* Semantic */
  --color-success: ${COLOR_SUCCESS};
  --color-warning: ${COLOR_WARNING};
  --color-danger: ${COLOR_DANGER};
  --color-info: ${COLOR_INFO};
  
  /* Special */
  --surface-glass: ${SURFACE_GLASS};
  --surface-brand: ${SURFACE_BRAND};
  
  /* Radius */
  --radius-xs: 6px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 22px;
  --radius-2xl: 30px;
  --radius-server: 18px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 24px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.5);
  --shadow-xl: 0 16px 48px rgba(0,0,0,0.6);
  --shadow-elevated: 0 4px 24px rgba(0,0,0,0.4);
  --shadow-floating: 0 8px 32px rgba(0,0,0,0.5);
  --shadow-glow: 0 0 20px ${ACCENT_GLOW};
  --shadow-glow-sm: 0 0 10px ${ACCENT_GLOW};
  
  /* Typography scale */
  --text-xs: 11px;
  --text-sm: 12px;
  --text-base: 14px;
  --text-md: 15px;
  --text-lg: 16px;
  --text-xl: 18px;
  --text-2xl: 22px;
  --text-3xl: 28px;
  --text-4xl: 36px;
  
  /* Legacy compatibility */
  --k-bg-base: ${BG_BASE};
  --k-bg-surface: ${BG_SURFACE};
  --k-bg-elevated: ${BG_ELEVATED};
  --k-bg-overlay: ${BG_OVERLAY};
  --k-bg-float: ${BG_FLOAT};
  --k-accent: ${ACCENT_PRIMARY};
  --k-accent-hover: ${ACCENT_BRIGHT};
  --k-accent-subtle: ${ACCENT_DIM};
  --k-status-online: #3ba55d;
  --k-status-idle: #faa81a;
  --k-status-dnd: #ed4245;
  --k-status-offline: #555566;
  --k-danger: ${COLOR_DANGER};
  --k-warning: ${COLOR_WARNING};
  --k-success: ${COLOR_SUCCESS};
  --k-info: ${COLOR_INFO};
  --k-text-primary: ${TEXT_PRIMARY};
  --k-text-secondary: ${TEXT_SECONDARY};
  --k-text-muted: ${TEXT_MUTED};
  --k-text-disabled: ${TEXT_FAINT};
  --k-text-link: ${ACCENT_BRIGHT};
  --k-border: ${BORDER_SUBTLE};
  --k-border-light: ${BORDER_FAINT};
  --k-border-strong: ${BORDER_MEDIUM};
  --bg-deep: ${BG_VOID};
  --bg-glass: ${SURFACE_GLASS};
  --bg-glass-hover: rgba(255,255,255,0.04);
  --bg-glass-active: rgba(255,255,255,0.07);
  --text-cream: ${TEXT_PRIMARY};
  --accent: ${ACCENT_PRIMARY};
  --accent-warm: ${COLOR_WARNING};
  --accent-blue: ${COLOR_INFO};
  --accent-green: ${COLOR_SUCCESS};
  --accent-red: ${COLOR_DANGER};
  --accent-purple: #5eead4;
  --accent-amber: ${COLOR_WARNING};
  --accent-glow: ${ACCENT_GLOW};
  --border: ${BORDER_SUBTLE};
  --border-light: ${BORDER_FAINT};
  --border-glow: ${BORDER_MEDIUM};
  --glass-blur: 20px;
`;
