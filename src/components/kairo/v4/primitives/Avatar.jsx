import React from 'react';
import { cn } from '@/lib/utils';

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
};

const statusSizes = {
  xs: 'w-2 h-2 border',
  sm: 'w-2.5 h-2.5 border-[1.5px]',
  md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2',
  xl: 'w-4 h-4 border-2',
  '2xl': 'w-5 h-5 border-[3px]',
};

const statusColors = {
  online: 'bg-emerald-500',
  idle: 'bg-amber-500',
  dnd: 'bg-red-500',
  offline: 'bg-zinc-600',
  invisible: 'bg-zinc-600',
};

export default function Avatar({
  src,
  alt = '',
  name = '',
  size = 'md',
  status,
  className,
  onClick,
}) {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  
  // Generate consistent color from name
  const colors = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-pink-500 to-rose-600',
    'from-cyan-500 to-blue-600',
  ];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  const gradientColor = colors[colorIndex];

  return (
    <div 
      className={cn('relative inline-flex', onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      <div
        className={cn(
          'rounded-full overflow-hidden flex items-center justify-center font-medium',
          'bg-gradient-to-br',
          gradientColor,
          sizes[size],
          className
        )}
      >
        {src ? (
          <img 
            src={src} 
            alt={alt || name} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-white">{initial}</span>
        )}
      </div>
      
      {status && (
        <div
          className={cn(
            'absolute -bottom-0.5 -right-0.5 rounded-full border-[#09090b]',
            statusColors[status] || statusColors.offline,
            statusSizes[size]
          )}
        />
      )}
    </div>
  );
}