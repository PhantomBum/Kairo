import React from 'react';
import { cn } from '@/lib/utils';

// Base skeleton component
export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-white/5",
        className
      )}
      {...props}
    />
  );
}

// Message skeleton
export function MessageSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-4 w-full max-w-md" />
            {i % 2 === 0 && <Skeleton className="h-4 w-3/4 max-w-sm" />}
          </div>
        </div>
      ))}
    </div>
  );
}

// Channel list skeleton
export function ChannelListSkeleton({ count = 5 }) {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-2 py-1.5">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-4 flex-1" style={{ width: `${60 + Math.random() * 30}%` }} />
        </div>
      ))}
    </div>
  );
}

// Member list skeleton
export function MemberListSkeleton({ count = 8 }) {
  return (
    <div className="space-y-1 p-2">
      <Skeleton className="h-3 w-20 mb-2" />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-2 py-1.5">
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-3.5 w-24" />
            {i % 3 === 0 && <Skeleton className="h-2.5 w-16" />}
          </div>
        </div>
      ))}
    </div>
  );
}

// Server icon skeleton
export function ServerIconSkeleton({ count = 4 }) {
  return (
    <div className="flex flex-col items-center gap-2 p-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="w-12 h-12 rounded-2xl" />
      ))}
    </div>
  );
}

// Profile skeleton
export function ProfileSkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="w-20 h-20 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

// Card skeleton
export function CardSkeleton({ showImage = false }) {
  return (
    <div className="rounded-xl border border-white/[0.06] overflow-hidden">
      {showImage && <Skeleton className="h-32 w-full" />}
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 p-3 border-b border-white/[0.06]">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4" style={{ flex: i === 0 ? 2 : 1 }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex gap-4 p-3">
          {Array.from({ length: columns }).map((_, col) => (
            <Skeleton key={col} className="h-4" style={{ flex: col === 0 ? 2 : 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

// Full page loading
export function PageSkeleton() {
  return (
    <div className="flex h-screen bg-[#0a0a0b]">
      {/* Sidebar */}
      <div className="w-[72px] border-r border-white/[0.06] p-2">
        <ServerIconSkeleton count={5} />
      </div>
      
      {/* Channel sidebar */}
      <div className="w-60 border-r border-white/[0.06]">
        <div className="p-4 border-b border-white/[0.06]">
          <Skeleton className="h-6 w-32" />
        </div>
        <ChannelListSkeleton count={8} />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-12 border-b border-white/[0.06] flex items-center px-4 gap-2">
          <Skeleton className="w-5 h-5 rounded" />
          <Skeleton className="h-5 w-32" />
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-hidden">
          <MessageSkeleton count={6} />
        </div>
        
        {/* Input */}
        <div className="p-4 border-t border-white/[0.06]">
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
      </div>
      
      {/* Member list */}
      <div className="w-60 border-l border-white/[0.06]">
        <MemberListSkeleton count={10} />
      </div>
    </div>
  );
}

// Inline loading spinner
export function InlineSpinner({ size = 'md', className }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  return (
    <svg
      className={cn("animate-spin text-zinc-500", sizes[size], className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
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
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}