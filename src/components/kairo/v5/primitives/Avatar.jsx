import React from 'react';
import { cn } from '@/lib/utils';

const statusColors = {
  online: 'bg-emerald-500',
  idle: 'bg-amber-500',
  dnd: 'bg-red-500',
  invisible: 'bg-zinc-600',
  offline: 'bg-zinc-600',
};

const sizes = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  xxl: 'w-20 h-20',
};

const statusSizes = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
  xl: 'w-4 h-4',
  xxl: 'w-5 h-5',
};

const textSizes = {
  xs: 'text-[10px]',
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
  xxl: 'text-xl',
};

export default function Avatar({ 
  src, 
  name, 
  status, 
  size = 'md',
  ring,
  className 
}) {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  
  // Generate a consistent color from the name
  const getColorFromName = (name) => {
    if (!name) return 'from-zinc-700 to-zinc-800';
    const colors = [
      'from-red-600 to-rose-700',
      'from-orange-600 to-amber-700',
      'from-yellow-600 to-lime-700',
      'from-green-600 to-emerald-700',
      'from-teal-600 to-cyan-700',
      'from-blue-600 to-indigo-700',
      'from-indigo-600 to-violet-700',
      'from-purple-600 to-fuchsia-700',
      'from-pink-600 to-rose-700',
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  return (
    <div className={cn('relative inline-flex flex-shrink-0', className)}>
      <div 
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center',
          'bg-gradient-to-br',
          !src && getColorFromName(name),
          sizes[size],
          ring && 'ring-2 ring-[#050506]'
        )}
      >
        {src ? (
          <img 
            src={src} 
            alt={name || ''} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={cn('font-semibold text-white/90 select-none', textSizes[size])}>
            {initial}
          </span>
        )}
      </div>
      
      {status && status !== 'offline' && status !== 'invisible' && (
        <div 
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-[#050506]',
            statusSizes[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}