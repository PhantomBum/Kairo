/**
 * Kairo — Kloak-style design tokens
 * Pure near-black, minimal, premium. Teal accent.
 */

const BG_BASE = '#0a0a0b';
const BG_SIDEBAR = '#0d0d0f';
const BG_ACTIVE = '#1a1a1f';
const BG_CARD = '#111114';

const BORDER_SUBTLE = 'rgba(255,255,255,0.06)';
const BORDER_MEDIUM = 'rgba(255,255,255,0.08)';

const TEXT_PRIMARY = '#ffffff';
const TEXT_SECONDARY = '#888899';
const TEXT_MUTED = '#555566';
const TEXT_PLACEHOLDER = '#444455';

const ACCENT_TEAL = '#2dd4bf';
const ACCENT_TEAL_HOVER = '#5eead4';

const COLOR_SUCCESS = '#22c55e';
const COLOR_WARNING = '#fbbf24';
const COLOR_DANGER = '#ef4444';

export const colors = {
  bg: {
    base: BG_BASE,
    sidebar: BG_SIDEBAR,
    active: BG_ACTIVE,
    card: BG_CARD,
    elevated: BG_CARD,
    surface: BG_SIDEBAR,
    overlay: BG_CARD,
    float: BG_CARD,
    modal: BG_CARD,
  },
  border: {
    subtle: BORDER_SUBTLE,
    medium: BORDER_MEDIUM,
    default: BORDER_SUBTLE,
    light: BORDER_SUBTLE,
    strong: BORDER_MEDIUM,
  },
  text: {
    primary: TEXT_PRIMARY,
    secondary: TEXT_SECONDARY,
    muted: TEXT_MUTED,
    placeholder: TEXT_PLACEHOLDER,
    disabled: TEXT_MUTED,
  },
  accent: { primary: ACCENT_TEAL, hover: ACCENT_TEAL_HOVER },
  success: COLOR_SUCCESS,
  warning: COLOR_WARNING,
  danger: COLOR_DANGER,
};

export const shadows = {
  sm: '0 1px 3px rgba(0,0,0,0.4)',
  md: '0 4px 12px rgba(0,0,0,0.5)',
  lg: '0 8px 24px rgba(0,0,0,0.5)',
  strong: '0 8px 24px rgba(0,0,0,0.6)',
  elevated: '0 4px 12px rgba(0,0,0,0.5)',
  floating: '0 8px 24px rgba(0,0,0,0.5)',
};

export const radius = { xs: '4px', sm: '6px', md: '8px', lg: '12px', xl: '16px', full: '9999px' };

export const cssVariables = `
  --k-bg-base: ${BG_BASE};
  --k-bg-sidebar: ${BG_SIDEBAR};
  --k-bg-active: ${BG_ACTIVE};
  --k-bg-card: ${BG_CARD};
  --k-border: ${BORDER_SUBTLE};
  --k-border-medium: ${BORDER_MEDIUM};
  --k-text-primary: ${TEXT_PRIMARY};
  --k-text-secondary: ${TEXT_SECONDARY};
  --k-text-muted: ${TEXT_MUTED};
  --k-text-placeholder: ${TEXT_PLACEHOLDER};
  --k-accent: ${ACCENT_TEAL};
  --k-accent-hover: ${ACCENT_TEAL_HOVER};
  --k-success: ${COLOR_SUCCESS};
  --k-warning: ${COLOR_WARNING};
  --k-danger: ${COLOR_DANGER};
  --bg-base: ${BG_BASE};
  --bg-card: ${BG_CARD};
  --text-primary: ${TEXT_PRIMARY};
  --text-secondary: ${TEXT_SECONDARY};
  --text-muted: ${TEXT_MUTED};
  --border-subtle: ${BORDER_SUBTLE};
  --accent-primary: ${ACCENT_TEAL};
  --accent-dim: rgba(45,212,191,0.12);
  --color-success: ${COLOR_SUCCESS};
  --color-danger: ${COLOR_DANGER};
  --color-warning: ${COLOR_WARNING};
`;
