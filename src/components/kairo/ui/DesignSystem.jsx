// Kairo Design System v3.0
// A minimal, premium design language inspired by Linear, Raycast, and Arc

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// ============================================
// DESIGN TOKENS
// ============================================

export const tokens = {
  colors: {
    // Backgrounds
    bg: {
      primary: '#09090b',      // Main app background
      secondary: '#0c0c0e',    // Sidebars, panels
      tertiary: '#111114',     // Cards, elevated surfaces
      elevated: '#16161a',     // Modals, popovers
      hover: 'rgba(255,255,255,0.03)',
      active: 'rgba(255,255,255,0.06)',
    },
    // Text
    text: {
      primary: '#fafafa',      // Headings, important
      secondary: '#a1a1aa',    // Body text
      tertiary: '#71717a',     // Labels, hints
      muted: '#52525b',        // Disabled, timestamps
    },
    // Borders
    border: {
      default: 'rgba(255,255,255,0.06)',
      hover: 'rgba(255,255,255,0.1)',
      focus: 'rgba(255,255,255,0.15)',
    },
    // Accents
    accent: {
      primary: '#10b981',      // Emerald for primary actions
      secondary: '#8b5cf6',    // Violet for secondary
      danger: '#ef4444',
      warning: '#f59e0b',
      success: '#22c55e',
    },
    // Status
    status: {
      online: '#22c55e',
      idle: '#f59e0b',
      dnd: '#ef4444',
      offline: '#52525b',
    }
  },
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '0.75rem',   // 12px
    lg: '1rem',      // 16px
    xl: '1.5rem',    // 24px
    '2xl': '2rem',   // 32px
  },
  radius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',
  },
  typography: {
    fontSize: {
      xs: '0.6875rem',   // 11px
      sm: '0.8125rem',   // 13px
      base: '0.875rem',  // 14px
      lg: '1rem',        // 16px
      xl: '1.125rem',    // 18px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
    },
  },
};

// ============================================
// ANIMATIONS
// ============================================

export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.15 }
  },
  slideUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 4 },
    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] }
  },
  scale: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
    transition: { duration: 0.15 }
  },
  slideRight: {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -4 },
    transition: { duration: 0.2 }
  }
};

// ============================================
// BASE COMPONENTS
// ============================================

// Surface - A flexible container with consistent styling
export function Surface({ 
  children, 
  className, 
  variant = 'primary', 
  padding = 'md',
  rounded = 'lg',
  border = true,
  ...props 
}) {
  const bgVariants = {
    primary: 'bg-[#0c0c0e]',
    secondary: 'bg-[#111114]',
    elevated: 'bg-[#16161a]',
    transparent: 'bg-transparent',
  };

  const paddingVariants = {
    none: '',
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
    xl: 'p-6',
  };

  const roundedVariants = {
    none: '',
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
  };

  return (
    <div 
      className={cn(
        bgVariants[variant],
        paddingVariants[padding],
        roundedVariants[rounded],
        border && 'border border-white/[0.04]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

// Text - Typography component with variants
export function Text({ 
  children, 
  className, 
  variant = 'body',
  color = 'secondary',
  weight = 'normal',
  as: Component = 'span',
  ...props 
}) {
  const variantStyles = {
    h1: 'text-xl tracking-tight',
    h2: 'text-lg tracking-tight',
    h3: 'text-base',
    body: 'text-sm',
    small: 'text-xs',
    tiny: 'text-[11px]',
  };

  const colorStyles = {
    primary: 'text-white',
    secondary: 'text-zinc-400',
    tertiary: 'text-zinc-500',
    muted: 'text-zinc-600',
    accent: 'text-emerald-500',
  };

  const weightStyles = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
  };

  return (
    <Component 
      className={cn(
        variantStyles[variant],
        colorStyles[color],
        weightStyles[weight],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

// IconButton - Consistent icon button styling
export function IconButton({ 
  children, 
  className, 
  variant = 'ghost',
  size = 'md',
  active = false,
  ...props 
}) {
  const variantStyles = {
    ghost: 'hover:bg-white/[0.04] text-zinc-500 hover:text-zinc-300',
    subtle: 'bg-white/[0.02] hover:bg-white/[0.06] text-zinc-400 hover:text-white',
    solid: 'bg-white/10 hover:bg-white/15 text-white',
  };

  const sizeStyles = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-9 h-9',
  };

  return (
    <button 
      className={cn(
        'flex items-center justify-center rounded-lg transition-colors',
        variantStyles[variant],
        sizeStyles[size],
        active && 'bg-white/[0.06] text-white',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Divider
export function Divider({ className, ...props }) {
  return (
    <div 
      className={cn('h-px bg-white/[0.04]', className)} 
      {...props} 
    />
  );
}

// Badge
export function Badge({ 
  children, 
  className, 
  variant = 'default',
  size = 'sm',
  ...props 
}) {
  const variantStyles = {
    default: 'bg-white/[0.06] text-zinc-400',
    accent: 'bg-emerald-500/15 text-emerald-400',
    danger: 'bg-red-500/15 text-red-400',
    warning: 'bg-amber-500/15 text-amber-400',
  };

  const sizeStyles = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span 
      className={cn(
        'inline-flex items-center font-medium rounded-md',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

// StatusDot
export function StatusDot({ status = 'offline', size = 'sm', className }) {
  const statusColors = {
    online: 'bg-emerald-500',
    idle: 'bg-amber-500',
    dnd: 'bg-red-500',
    invisible: 'bg-zinc-500',
    offline: 'bg-zinc-600',
  };

  const sizeStyles = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
  };

  return (
    <div className={cn(
      'rounded-full',
      statusColors[status],
      sizeStyles[size],
      className
    )} />
  );
}

// Avatar
export function Avatar({ 
  src, 
  name, 
  size = 'md', 
  status,
  className,
  ...props 
}) {
  const sizeStyles = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-10 h-10 text-base',
    xl: 'w-12 h-12 text-lg',
    '2xl': 'w-16 h-16 text-xl',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5 -bottom-0 -right-0',
    sm: 'w-2 h-2 -bottom-0.5 -right-0.5',
    md: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
    lg: 'w-3 h-3 -bottom-0.5 -right-0.5',
    xl: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5',
    '2xl': 'w-4 h-4 -bottom-0.5 -right-0.5',
  };

  return (
    <div className={cn('relative flex-shrink-0', className)} {...props}>
      <div className={cn(
        'rounded-full overflow-hidden bg-white/10',
        sizeStyles[size]
      )}>
        {src ? (
          <img src={src} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-medium">
            {name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
      </div>
      {status && (
        <StatusDot 
          status={status} 
          className={cn(
            'absolute border-2 border-[#0c0c0e]',
            statusSizes[size]
          )} 
        />
      )}
    </div>
  );
}

// ListItem - Reusable list item component
export function ListItem({ 
  children, 
  className, 
  active = false,
  onClick,
  leftSlot,
  rightSlot,
  ...props 
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors text-left',
        active 
          ? 'bg-white/[0.06] text-white' 
          : 'text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-300',
        className
      )}
      {...props}
    >
      {leftSlot}
      <div className="flex-1 min-w-0">
        {children}
      </div>
      {rightSlot}
    </button>
  );
}

// Section - Content section with optional header
export function Section({ 
  title, 
  children, 
  className,
  action,
  ...props 
}) {
  return (
    <div className={cn('space-y-1', className)} {...props}>
      {title && (
        <div className="flex items-center justify-between px-2 mb-1.5">
          <Text variant="tiny" color="muted" weight="semibold" className="uppercase tracking-wider">
            {title}
          </Text>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}