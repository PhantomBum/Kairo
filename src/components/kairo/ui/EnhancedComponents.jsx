import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Loader2 } from 'lucide-react';

// Enhanced Button with loading states and variants
export function EnhancedButton({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  icon: Icon,
  iconPosition = 'left',
  disabled,
  className,
  ...props 
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40',
    secondary: 'bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700',
    ghost: 'bg-transparent text-zinc-400 hover:text-white hover:bg-zinc-800/50',
    danger: 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/25',
    success: 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/25',
    outline: 'bg-transparent border-2 border-violet-500 text-violet-400 hover:bg-violet-500/10',
  };

  const sizes = {
    xs: 'px-2.5 py-1.5 text-xs gap-1.5 rounded-lg',
    sm: 'px-3 py-2 text-sm gap-2 rounded-xl',
    md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
    lg: 'px-6 py-3 text-base gap-2.5 rounded-2xl',
    xl: 'px-8 py-4 text-lg gap-3 rounded-2xl',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all",
        variants[variant],
        sizes[size],
        (disabled || loading) && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4" />
      ) : null}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
    </motion.button>
  );
}

// Enhanced Avatar with status and ring
export function EnhancedAvatar({ 
  src, 
  alt, 
  fallback, 
  size = 'md', 
  status,
  ring = false,
  ringColor = 'violet',
  className 
}) {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
  };

  const statusSizes = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
    '2xl': 'w-5 h-5',
  };

  const statusColors = {
    online: 'bg-emerald-400',
    idle: 'bg-amber-400',
    dnd: 'bg-rose-400',
    invisible: 'bg-zinc-500',
    offline: 'bg-zinc-600',
  };

  const ringColors = {
    violet: 'ring-violet-500/30',
    indigo: 'ring-indigo-500/30',
    emerald: 'ring-emerald-500/30',
    amber: 'ring-amber-500/30',
    rose: 'ring-rose-500/30',
  };

  return (
    <div className="relative inline-flex">
      <div className={cn(
        "rounded-2xl overflow-hidden bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-white",
        sizes[size],
        ring && `ring-2 ${ringColors[ringColor]}`,
        className
      )}>
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <span>{fallback?.charAt(0) || '?'}</span>
        )}
      </div>
      {status && (
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 rounded-full border-[2.5px] border-zinc-900",
          statusSizes[size],
          statusColors[status]
        )} />
      )}
    </div>
  );
}

// Enhanced Badge with animations
export function EnhancedBadge({ 
  children, 
  variant = 'default', 
  size = 'sm',
  dot = false,
  pulse = false,
  className 
}) {
  const variants = {
    default: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    primary: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    danger: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    info: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  };

  const sizes = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  const dotColors = {
    default: 'bg-zinc-400',
    primary: 'bg-violet-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-sky-400',
  };

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border font-medium",
      variants[variant],
      sizes[size],
      className
    )}>
      {dot && (
        <span className="relative flex">
          <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[variant])} />
          {pulse && (
            <span className={cn(
              "absolute inset-0 rounded-full animate-ping opacity-75",
              dotColors[variant]
            )} />
          )}
        </span>
      )}
      {children}
    </span>
  );
}

// Enhanced Card with hover effects
export function EnhancedCard({ 
  children, 
  variant = 'default',
  hover = true,
  glow = false,
  className,
  ...props 
}) {
  const variants = {
    default: 'bg-zinc-900/80 border-zinc-800/50',
    elevated: 'bg-zinc-900/90 border-zinc-800/30 shadow-xl',
    glass: 'bg-zinc-900/50 backdrop-blur-xl border-zinc-800/30',
  };

  return (
    <motion.div
      whileHover={hover ? { y: -2, scale: 1.01 } : {}}
      className={cn(
        "rounded-2xl border transition-all",
        variants[variant],
        glow && "shadow-lg shadow-violet-500/5 hover:shadow-violet-500/10",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Enhanced Input with floating label
export function EnhancedInput({ 
  label, 
  error, 
  icon: Icon,
  className,
  ...props 
}) {
  const [focused, setFocused] = React.useState(false);
  const hasValue = props.value?.length > 0;

  return (
    <div className="relative">
      {Icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
          <Icon className="w-4 h-4" />
        </div>
      )}
      <input
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        className={cn(
          "w-full px-4 py-3 bg-zinc-900/80 border rounded-xl text-white placeholder-zinc-500 transition-all",
          "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50",
          error ? "border-rose-500/50" : "border-zinc-800/50",
          Icon && "pl-10",
          className
        )}
      />
      {label && (
        <motion.label
          initial={false}
          animate={{
            y: focused || hasValue ? -28 : 0,
            x: focused || hasValue ? (Icon ? -24 : 0) : 0,
            scale: focused || hasValue ? 0.85 : 1,
          }}
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none transition-colors",
            Icon && "left-10",
            (focused || hasValue) && "text-violet-400"
          )}
        >
          {label}
        </motion.label>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-rose-400">{error}</p>
      )}
    </div>
  );
}

// Enhanced Skeleton
export function EnhancedSkeleton({ variant = 'text', className }) {
  const variants = {
    text: 'h-4 rounded',
    title: 'h-6 rounded',
    avatar: 'w-10 h-10 rounded-2xl',
    button: 'h-10 rounded-xl',
    card: 'h-32 rounded-2xl',
  };

  return (
    <div className={cn(
      "animate-pulse bg-zinc-800/50",
      variants[variant],
      className
    )} />
  );
}

// Enhanced Divider
export function EnhancedDivider({ label, className }) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      {label && (
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
      )}
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
    </div>
  );
}

// Enhanced Tooltip (simple version)
export function EnhancedTooltip({ children, content, side = 'top' }) {
  const [show, setShow] = React.useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div 
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={cn(
            "absolute z-50 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white whitespace-nowrap",
            positions[side]
          )}
        >
          {content}
        </motion.div>
      )}
    </div>
  );
}

export default {
  EnhancedButton,
  EnhancedAvatar,
  EnhancedBadge,
  EnhancedCard,
  EnhancedInput,
  EnhancedSkeleton,
  EnhancedDivider,
  EnhancedTooltip,
};