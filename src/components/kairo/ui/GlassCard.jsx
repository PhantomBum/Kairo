import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Reusable glass morphism card component
export function GlassCard({ children, className, hover = true, glow = false, ...props }) {
  return (
    <motion.div
      whileHover={hover ? { scale: 1.01, y: -2 } : {}}
      className={cn(
        "relative bg-gradient-to-br from-zinc-900/90 to-zinc-950/90 backdrop-blur-xl",
        "border border-zinc-800/50 rounded-2xl overflow-hidden",
        "shadow-xl shadow-black/20",
        glow && "before:absolute before:inset-0 before:rounded-2xl before:p-[1px] before:bg-gradient-to-br before:from-violet-500/20 before:to-indigo-500/20 before:-z-10",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Pill button component
export function PillButton({ children, variant = 'default', size = 'md', active, className, ...props }) {
  const variants = {
    default: active 
      ? 'bg-violet-500/20 text-violet-300 border-violet-500/50' 
      : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50 hover:bg-zinc-800 hover:text-zinc-200',
    primary: 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white border-transparent shadow-lg shadow-violet-500/25',
    ghost: 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-800/50 hover:text-zinc-200',
    danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-full border transition-all",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Floating action button
export function FloatingButton({ icon: Icon, label, onClick, variant = 'primary', className }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-3 rounded-2xl font-medium transition-all",
        "shadow-xl backdrop-blur-xl",
        variant === 'primary' && "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-violet-500/25",
        variant === 'secondary' && "bg-zinc-800/90 text-white border border-zinc-700/50",
        className
      )}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {label && <span>{label}</span>}
    </motion.button>
  );
}

// Status indicator with animation
export function StatusIndicator({ status, size = 'md', pulse = true }) {
  const colors = {
    online: 'bg-emerald-400',
    idle: 'bg-amber-400',
    dnd: 'bg-rose-400',
    invisible: 'bg-zinc-500',
    offline: 'bg-zinc-600',
  };

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span className="relative inline-flex">
      <span className={cn(
        "rounded-full",
        colors[status] || colors.offline,
        sizes[size]
      )} />
      {pulse && status === 'online' && (
        <span className={cn(
          "absolute inset-0 rounded-full animate-ping opacity-75",
          colors.online,
          sizes[size]
        )} />
      )}
    </span>
  );
}

// Animated gradient border
export function GradientBorder({ children, className, colors = 'from-violet-500 via-indigo-500 to-purple-500' }) {
  return (
    <div className={cn("relative p-[1px] rounded-2xl overflow-hidden", className)}>
      <div className={cn("absolute inset-0 bg-gradient-to-r animate-gradient-x", colors)} />
      <div className="relative bg-zinc-900 rounded-[15px]">
        {children}
      </div>
    </div>
  );
}

export default GlassCard;