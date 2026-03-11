import React, { useState } from 'react';
import { Home, Plus, Compass } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function RailIcon({ label, active, onClick, children, badge, accent }) {
  const [hovered, setHovered] = useState(false);
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative flex items-center justify-center py-[3px]"
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            {/* Pill indicator */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
              style={{
                width: active ? 4 : 3,
                height: active ? 32 : hovered ? 18 : 0,
                opacity: active || hovered ? 1 : 0,
                background: 'var(--text-primary)',
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              }} />
            <button onClick={onClick}
              className="relative w-12 h-12 flex items-center justify-center overflow-hidden"
              style={{
                borderRadius: active || hovered ? 16 : 24,
                background: active ? (accent || 'var(--text-primary)') : hovered ? 'var(--bg-hover)' : 'var(--bg-tertiary)',
                color: active ? (accent ? '#fff' : 'var(--bg)') : hovered ? 'var(--text-primary)' : 'var(--text-muted)',
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}>
              {children}
              {badge > 0 && (
                <div className="absolute -bottom-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                  style={{ background: '#dc2626', border: '2px solid var(--bg)' }}>
                  {badge > 99 ? '99+' : badge}
                </div>
              )}
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="text-xs font-medium border-0 px-3 py-1.5"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ServerRail({ servers, activeServerId, onServerSelect, onHomeClick, onCreateServer, onDiscover, isHome, badge }) {
  return (
    <div className="w-[72px] h-full flex flex-col items-center py-3 gap-0.5 flex-shrink-0 overflow-y-auto scrollbar-none"
      style={{ background: 'var(--bg)' }}>
      <RailIcon label="Home" active={isHome} onClick={onHomeClick} badge={badge}>
        <Home className="w-5 h-5" />
      </RailIcon>

      <div className="w-8 h-px my-1.5" style={{ background: 'var(--border)' }} />

      {servers.map(s => (
        <RailIcon key={s.id} label={s.name} active={activeServerId === s.id} onClick={() => onServerSelect(s)}>
          {s.icon_url ? (
            <img src={s.icon_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-semibold">{s.name?.charAt(0)?.toUpperCase()}</span>
          )}
        </RailIcon>
      ))}

      <div className="w-8 h-px my-1.5" style={{ background: 'var(--border)' }} />

      <RailIcon label="Create Server" onClick={onCreateServer} accent="#22c55e">
        <Plus className="w-5 h-5" />
      </RailIcon>
      <RailIcon label="Discover" onClick={onDiscover} accent="#6366f1">
        <Compass className="w-5 h-5" />
      </RailIcon>
    </div>
  );
}