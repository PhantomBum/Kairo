import React from 'react';
import { cn } from '@/lib/utils';

export default function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled,
  error,
  leftIcon,
  rightIcon,
  className,
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
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'w-full h-10 px-3 bg-[#0a0a0b] border rounded-lg text-sm text-white placeholder:text-zinc-600',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-all',
          error ? 'border-red-500/50' : 'border-white/[0.08]',
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
}

export function Textarea({
  value,
  onChange,
  placeholder,
  disabled,
  error,
  rows = 3,
  className,
  ...props
}) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className={cn(
        'w-full px-3 py-2 bg-[#0a0a0b] border rounded-lg text-sm text-white placeholder:text-zinc-600',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'resize-none transition-all',
        error ? 'border-red-500/50' : 'border-white/[0.08]',
        className
      )}
      {...props}
    />
  );
}