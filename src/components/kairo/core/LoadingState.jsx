import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ size = 'md', className }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <Loader2 className={cn('animate-spin text-indigo-500', sizeClasses[size], className)} />
  );
}

export function LoadingDots({ className }) {
  return (
    <div className={cn("flex gap-1", className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-indigo-500 rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonMessage() {
  return (
    <div className="px-4 py-3 animate-pulse">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-zinc-800 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-zinc-800 rounded w-32" />
          <div className="h-3 bg-zinc-800 rounded w-full" />
          <div className="h-3 bg-zinc-800 rounded w-3/4" />
        </div>
      </div>
    </div>
  );
}

export function SyncingIndicator({ show }) {
  if (!show) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed bottom-4 right-4 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 flex items-center gap-2 shadow-xl"
    >
      <LoadingSpinner size="sm" />
      <span className="text-sm text-zinc-400">Syncing...</span>
    </motion.div>
  );
}