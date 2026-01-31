import React from 'react';
import { cn } from '@/lib/utils';

export default function Input({
  className,
  leftIcon,
  rightIcon,
  error,
  ...props
}) {
  return (
    <div className="relative">
      {leftIcon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
          {leftIcon}
        </div>
      )}
      <input
        className={cn(
          'w-full h-10 px-3 text-sm bg-[#0a0a0b] border rounded-lg',
          'text-white placeholder:text-zinc-600',
          'focus:outline-none transition-colors',
          leftIcon && 'pl-10',
          rightIcon && 'pr-10',
          error 
            ? 'border-red-500/50 focus:border-red-500' 
            : 'border-white/[0.08] focus:border-indigo-500/50',
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
}

export function Textarea({
  className,
  error,
  ...props
}) {
  return (
    <textarea
      className={cn(
        'w-full px-3 py-2 text-sm bg-[#0a0a0b] border rounded-lg resize-none',
        'text-white placeholder:text-zinc-600',
        'focus:outline-none transition-colors',
        error 
          ? 'border-red-500/50 focus:border-red-500' 
          : 'border-white/[0.08] focus:border-indigo-500/50',
        className
      )}
      {...props}
    />
  );
}