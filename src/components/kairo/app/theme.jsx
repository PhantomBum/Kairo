// Kairo Design System - The Foundation
export const theme = {
  colors: {
    // Backgrounds
    bg: {
      primary: '#0a0a0b',
      secondary: '#0f0f10',
      tertiary: '#141415',
      elevated: '#1a1a1c',
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
    // Accent
    accent: {
      primary: '#6366f1',
      hover: '#818cf8',
      muted: 'rgba(99,102,241,0.15)',
    },
    // Status
    status: {
      online: '#22c55e',
      idle: '#eab308',
      dnd: '#ef4444',
      offline: '#71717a',
    },
    // Semantic
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    // Border
    border: {
      default: 'rgba(255,255,255,0.06)',
      hover: 'rgba(255,255,255,0.1)',
      focus: 'rgba(99,102,241,0.5)',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },
  fontSize: {
    xs: '11px',
    sm: '13px',
    md: '14px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.3)',
    md: '0 4px 12px rgba(0,0,0,0.4)',
    lg: '0 8px 24px rgba(0,0,0,0.5)',
    xl: '0 16px 48px rgba(0,0,0,0.6)',
  },
  transition: {
    fast: '100ms ease',
    normal: '150ms ease',
    slow: '250ms ease',
  },
  zIndex: {
    dropdown: 100,
    modal: 200,
    tooltip: 300,
    toast: 400,
  },
};

// Status config
export const statusConfig = {
  online: { color: theme.colors.status.online, label: 'Online' },
  idle: { color: theme.colors.status.idle, label: 'Idle' },
  dnd: { color: theme.colors.status.dnd, label: 'Do Not Disturb' },
  invisible: { color: theme.colors.status.offline, label: 'Invisible' },
  offline: { color: theme.colors.status.offline, label: 'Offline' },
};

// Channel type config
export const channelConfig = {
  text: { icon: 'Hash', label: 'Text' },
  voice: { icon: 'Volume2', label: 'Voice' },
  announcement: { icon: 'Megaphone', label: 'Announcement' },
  forum: { icon: 'MessageSquare', label: 'Forum' },
  stage: { icon: 'Radio', label: 'Stage' },
};