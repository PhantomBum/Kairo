import React from 'react';
import { cn } from '@/lib/utils';
import { statusConfig } from '../theme';

const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const statusSizes = {
  xs: 'w-2 h-2 border',
  sm: 'w-2.5 h-2.5 border-[1.5px]',
  md: 'w-3 h-3 border-2',
  lg: 'w-3.5 h-3.5 border-2',
  xl: 'w-4 h-4 border-2',
};

export default function Avatar({ 
  src, 
  name = '', 
  size = 'md', 
  status,
  className,
  onClick,
}) {
  const initials = name?.charAt(0)?.toUpperCase() || '?';
  const statusColor = status ? statusConfig[status]?.color : null;

  return (
    <div 
      className={cn('relative flex-shrink-0', onClick && 'cursor-pointer')}
      onClick={onClick}
    >
      <div 
        className={cn(
          'rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center overflow-hidden',
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
      {status && statusColor && (
        <div 
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-[#0a0a0b]',
            statusSizes[size]
          )}
          style={{ backgroundColor: statusColor }}
        />
      )}
    </div>
  );
}