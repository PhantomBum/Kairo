import React from 'react';
import { cn } from '@/lib/utils';

const sizes = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-20 h-20 text-xl' };
const statusSizes = { xs: 'w-2 h-2 border', sm: 'w-2.5 h-2.5 border-[1.5px]', md: 'w-3 h-3 border-2', lg: 'w-3.5 h-3.5 border-2', xl: 'w-5 h-5 border-[3px]' };
const statusColors = { online: '#22c55e', idle: '#f59e0b', dnd: '#ef4444', invisible: '#6b7280', offline: '#6b7280' };

const bgColors = [
  'bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-pink-600',
  'bg-cyan-600', 'bg-purple-600', 'bg-red-600', 'bg-teal-600',
];

export default function Avatar({ src, name = '', size = 'md', status, className, onClick }) {
  const initials = name?.charAt(0)?.toUpperCase() || '?';
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const bg = bgColors[Math.abs(hash) % bgColors.length];

  return (
    <div className={cn('relative flex-shrink-0', onClick && 'cursor-pointer')} onClick={onClick}>
      <div className={cn('rounded-full flex items-center justify-center overflow-hidden', bg, sizes[size], className)}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
        ) : (
          <span className="font-semibold text-white">{initials}</span>
        )}
      </div>
      {status && statusColors[status] && (
        <div className={cn('absolute bottom-0 right-0 rounded-full border-[#191919]', statusSizes[size])}
          style={{ backgroundColor: statusColors[status] }} />
      )}
    </div>
  );
}