import React, { useState } from 'react';
import { BADGE_CONFIG, RARITY } from './badgeConfig';
import { colors } from '@/components/app/design/tokens';

export default function ProfileBadge({ badge, size = 'md' }) {
  const [hovered, setHovered] = useState(false);
  const cfg = BADGE_CONFIG[badge];
  if (!cfg) return null;
  const Icon = cfg.icon;
  const rarity = RARITY[cfg.rarity];
  const isAnimated = cfg.animated || rarity.glow;
  const sz = size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const iconSz = size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';

  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div
        className={`${sz} rounded-full flex items-center justify-center cursor-default transition-transform hover:scale-110`}
        style={{
          background: `${cfg.color}18`,
          border: `1px solid ${cfg.color}30`,
          boxShadow: isAnimated ? `0 0 8px ${cfg.color}25` : 'none',
        }}
      >
        {isAnimated && (
          <style>{`
            @keyframes badge-shimmer-${badge} {
              0%, 80% { opacity: 0; }
              90% { opacity: 0.6; }
              100% { opacity: 0; }
            }
          `}</style>
        )}
        <div className="relative">
          <Icon className={iconSz} style={{ color: cfg.color }} />
          {isAnimated && (
            <div className="absolute inset-0 rounded-full" style={{
              background: `radial-gradient(circle, ${cfg.color}40 0%, transparent 70%)`,
              animation: `badge-shimmer-${badge} 3s ease-in-out infinite`,
            }} />
          )}
        </div>
      </div>

      {/* Tooltip — centered above badge */}
      {hovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 k-fade-in pointer-events-none"
          style={{ minWidth: 120 }}>
          <div className="px-3 py-2 rounded-lg text-center"
            style={{ background: '#0e0e0e', border: `1px solid ${colors.border.strong}`, boxShadow: '0 8px 24px rgba(0,0,0,0.7)' }}>
            <p className="text-[11px] font-bold whitespace-nowrap" style={{ color: cfg.color }}>{cfg.label}</p>
            <p className="text-[11px] whitespace-nowrap" style={{ color: colors.text.muted }}>{cfg.desc}</p>
            <p className="text-[11px] font-semibold mt-0.5" style={{ color: rarity.color }}>{rarity.label}</p>
          </div>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-0 h-0"
            style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #0e0e0e' }} />
        </div>
      )}
    </div>
  );
}