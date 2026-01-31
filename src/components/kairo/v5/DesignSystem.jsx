// Kairo V5 Design System - Next-Gen UI
// Premium, fluid, and immersive

export const colors = {
  // Base backgrounds with depth
  bg: {
    base: '#050506',
    elevated: '#0a0a0c',
    surface: '#101012',
    overlay: '#161618',
    hover: '#1c1c1f',
    active: '#222225',
  },
  
  // Accent colors - vibrant and modern
  accent: {
    primary: '#6366f1',      // Indigo
    secondary: '#8b5cf6',    // Purple
    success: '#10b981',      // Emerald
    warning: '#f59e0b',      // Amber
    error: '#ef4444',        // Red
    info: '#06b6d4',         // Cyan
  },
  
  // Gradient presets
  gradients: {
    primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    success: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
    premium: 'linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)',
    cosmic: 'linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #f97316 100%)',
    dark: 'linear-gradient(180deg, #0a0a0c 0%, #050506 100%)',
  },
  
  // Text hierarchy
  text: {
    primary: '#fafafa',
    secondary: '#a1a1aa',
    muted: '#71717a',
    disabled: '#52525b',
  },
  
  // Border colors
  border: {
    subtle: 'rgba(255, 255, 255, 0.04)',
    default: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.12)',
    focus: 'rgba(99, 102, 241, 0.5)',
  }
};

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
  md: '0 4px 12px rgba(0, 0, 0, 0.5)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.6)',
  xl: '0 16px 48px rgba(0, 0, 0, 0.7)',
  glow: {
    primary: '0 0 24px rgba(99, 102, 241, 0.3)',
    success: '0 0 24px rgba(16, 185, 129, 0.3)',
    premium: '0 0 32px rgba(245, 158, 11, 0.3)',
  }
};

export const animations = {
  // Spring presets
  spring: {
    default: { type: 'spring', stiffness: 400, damping: 30 },
    gentle: { type: 'spring', stiffness: 200, damping: 25 },
    bouncy: { type: 'spring', stiffness: 500, damping: 20 },
    snappy: { type: 'spring', stiffness: 600, damping: 35 },
  },
  
  // Duration presets
  duration: {
    instant: 0.1,
    fast: 0.15,
    normal: 0.2,
    slow: 0.3,
    verySlow: 0.5,
  },
  
  // Easing functions
  easing: {
    easeOut: [0.16, 1, 0.3, 1],
    easeIn: [0.4, 0, 1, 1],
    easeInOut: [0.4, 0, 0.2, 1],
  }
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
};

export const radii = {
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '18px',
  full: '9999px',
};