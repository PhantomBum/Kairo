import React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm',
  secondary: 'bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.08]',
  ghost: 'hover:bg-white/[0.04] text-zinc-400 hover:text-white',
  danger: 'bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20',
  success: 'bg-emerald-600 hover:bg-emerald-500 text-white',
  outline: 'border border-white/[0.1] hover:bg-white/[0.04] text-zinc-300 hover:text-white',
};

const sizes = {
  xs: 'h-7 px-2.5 text-xs gap-1.5',
  sm: 'h-8 px-3 text-sm gap-2',
  md: 'h-9 px-4 text-sm gap-2',
  lg: 'h-10 px-5 text-base gap-2',
  icon: 'h-9 w-9',
  'icon-sm': 'h-8 w-8',
  'icon-xs': 'h-7 w-7',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  loading,
  leftIcon,
  rightIcon,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg',
        'transition-all duration-150 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-0',
        'disabled:opacity-50 disabled:pointer-events-none',
        'active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
}