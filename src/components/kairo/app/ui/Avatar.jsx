import React from 'react';
import { cn } from '@/lib/utils';

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-xl',
};

const statusSizes = {
  xs: 'w-2 h-2 border',
  sm: 'w-2.5 h-2.5 border-[1.5px]',
  md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2',
  xl: 'w-5 h-5 border-[3px]',
};

const statusColors = {
  online: '#22c55e',
  idle: '#f59e0b',
  dnd: '#ef4444',
  invisible: '#6b7280',
  offline: '#6b7280',
};

export default function Avatar({ 
  src, 
  name = '', 
  size = 'md', 
  status,
  className,
  onClick,
  ring,
  ringColor = 'indigo',
}) {
  const initials = name?.charAt(0)?.toUpperCase() || '?';
  const statusColor = status ? statusColors[status] : null;

  // Generate consistent color from name
  const generateColor = (str) => {
    const colors = [
      'from-indigo-500 to-violet-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-pink-500 to-rose-600',
      'from-cyan-500 to-blue-600',
      'from-purple-500 to-fuchsia-600',
      'from-red-500 to-pink-600',
      'from-lime-500 to-emerald-600',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div 
      className={cn('relative flex-shrink-0', onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      {/* Ring effect */}
      {ring && (
        <div className={cn(
          'absolute inset-0 rounded-full -m-0.5 animate-pulse',
          ringColor === 'indigo' && 'bg-indigo-500/30',
          ringColor === 'green' && 'bg-green-500/30',
        )} />
      )}
      
      <div 
        className={cn(
          'rounded-full flex items-center justify-center overflow-hidden',
          `bg-gradient-to-br ${generateColor(name)}`,
          sizes[size],
          className
        )}
      >
        {src ? (
          <img 
            src={src} 
            alt={name} 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <span className="font-semibold text-white">{initials}</span>
        )}
      </div>
      
      {/* Status indicator */}
      {status && statusColor && (
        <div 
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-[#111113]',
            statusSizes[size]
          )}
          style={{ backgroundColor: statusColor }}
        />
      )}
    </div>
  );
}