import React from 'react';
import { cn } from '@/lib/utils';

const sizes = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

export default function Spinner({ size = 'md', className }) {
  return (
    <svg
      className={cn('animate-spin', sizes[size], className)}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export function LoadingDots({ className }) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-white/[0.06] rounded',
        className
      )}
    />
  );
}