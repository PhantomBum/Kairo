import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const Input = forwardRef(({
  className,
  type = 'text',
  error,
  leftIcon,
  rightIcon,
  ...props
}, ref) => {
  return (
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
          {leftIcon}
        </div>
      )}
      <input
        type={type}
        ref={ref}
        className={cn(
          'w-full h-10 px-3 rounded-lg',
          'bg-white/[0.04] border border-white/[0.08]',
          'text-white text-sm placeholder:text-zinc-600',
          'transition-all duration-150',
          'focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06]',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-red-500/50 focus:border-red-500/50',
          leftIcon && 'pl-10',
          rightIcon && 'pr-10',
          className
        )}
        {...props}
      />
      {rightIcon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
          {rightIcon}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;