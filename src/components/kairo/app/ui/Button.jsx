import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
  secondary: 'bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200',
  ghost: 'hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-200',
  danger: 'bg-red-600 hover:bg-red-500 text-white',
  success: 'bg-emerald-600 hover:bg-emerald-500 text-white',
};

const sizes = {
  sm: 'h-7 px-2.5 text-xs gap-1.5',
  md: 'h-9 px-3 text-sm gap-2',
  lg: 'h-11 px-4 text-sm gap-2',
  icon: 'h-9 w-9',
  'icon-sm': 'h-7 w-7',
  'icon-lg': 'h-11 w-11',
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
  const isIconOnly = size.startsWith('icon');

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'disabled:opacity-50 disabled:pointer-events-none',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-[#0a0a0b]',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {leftIcon && !isIconOnly && <span className="flex-shrink-0">{leftIcon}</span>}
          {!isIconOnly && children}
          {isIconOnly && (leftIcon || children)}
          {rightIcon && !isIconOnly && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}