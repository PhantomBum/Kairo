import React from 'react';
import { Home, Plus, Compass } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function Pill({ active, hover }) {
  return (
    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-white transition-all duration-200"
      style={{ height: active ? 40 : hover ? 20 : 0, opacity: active || hover ? 1 : 0 }} />
  );
}

function RailIcon({ label, active, onClick, children, badge }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative flex items-center justify-center"
            onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <Pill active={active} hover={hovered} />
            <button onClick={onClick}
              className="relative w-12 h-12 flex items-center justify-center transition-all duration-200 overflow-hidden"
              style={{
                borderRadius: active || hovered ? 16 : 24,
                background: active ? '#fff' : '#1a1a1a',
                color: active ? '#000' : '#666',
              }}>
              {children}
              {badge > 0 && (
                <div className="absolute -bottom-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                  style={{ border: '3px solid #0e0e0e' }}>
                  {badge > 99 ? '99+' : badge}
                </div>
              )}
            </button>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-black text-white text-xs border-0 px-3 py-1.5 font-medium">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ServerRail({ servers, activeServerId, onServerSelect, onHomeClick, onCreateServer, onDiscover, isHome, pendingRequests }) {
  return (
    <div className="w-[72px] h-full flex flex-col items-center py-3 gap-1.5 flex-shrink-0 overflow-y-auto scrollbar-none"
      style={{ background: '#0e0e0e' }}>
      
      <RailIcon label="Home" active={isHome} onClick={onHomeClick} badge={pendingRequests}>
        <Home className="w-5 h-5" />
      </RailIcon>

      <div className="w-8 h-px my-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

      {servers.map(server => (
        <RailIcon key={server.id} label={server.name} active={activeServerId === server.id} onClick={() => onServerSelect(server)}>
          {server.icon_url ? (
            <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm font-semibold" style={{ color: activeServerId === server.id ? '#000' : '#888' }}>
              {server.name?.charAt(0)?.toUpperCase()}
            </span>
          )}
        </RailIcon>
      ))}

      <div className="w-8 h-px my-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

      <RailIcon label="Create Server" onClick={onCreateServer}>
        <Plus className="w-5 h-5" />
      </RailIcon>

      <RailIcon label="Discover" onClick={onDiscover}>
        <Compass className="w-5 h-5" />
      </RailIcon>
    </div>
  );
}