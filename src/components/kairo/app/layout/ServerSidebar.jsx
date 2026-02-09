import React from 'react';
import { Plus, Compass, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function SidebarTooltip({ children, label }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="right" className="bg-[#1a1a1a] border-white/[0.08] text-white text-xs font-medium px-3 py-1.5">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ServerIcon({ server, isActive, onClick }) {
  return (
    <SidebarTooltip label={server.name}>
      <div className="relative group flex justify-center">
        <div className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-white transition-all duration-200',
          isActive ? 'h-10' : 'h-0 group-hover:h-5'
        )} />
        
        <button
          onClick={onClick}
          className={cn(
            'w-12 h-12 overflow-hidden transition-all duration-200',
            isActive ? 'rounded-[16px]' : 'rounded-[24px] hover:rounded-[16px]'
          )}
        >
          {server.icon_url ? (
            <img src={server.icon_url} alt={server.name} className="w-full h-full object-cover" />
          ) : (
            <div className={cn(
              'w-full h-full flex items-center justify-center text-sm font-semibold transition-all duration-200',
              isActive ? 'bg-indigo-600 text-white' : 'bg-[#2a2a2a] text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white'
            )}>
              {server.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </button>
      </div>
    </SidebarTooltip>
  );
}

export default function ServerSidebar({
  servers = [], activeServerId, onServerSelect, onDMsClick,
  onCreateServer, onDiscoverClick, isDMsActive, pendingRequests = 0,
}) {
  return (
    <div className="w-[72px] h-full bg-[#111111] flex flex-col items-center py-3 gap-2 flex-shrink-0">
      {/* Home */}
      <SidebarTooltip label="Home">
        <div className="relative group flex justify-center">
          <div className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-white transition-all duration-200',
            isDMsActive ? 'h-10' : 'h-0 group-hover:h-5'
          )} />
          <button onClick={onDMsClick} className={cn(
            'relative w-12 h-12 flex items-center justify-center transition-all duration-200',
            isDMsActive ? 'rounded-[16px] bg-indigo-600 text-white' : 'rounded-[24px] bg-[#2a2a2a] text-zinc-400 hover:rounded-[16px] hover:bg-indigo-600 hover:text-white'
          )}>
            <Home className="w-5 h-5" />
            {pendingRequests > 0 && (
              <div className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-[#111111]">
                {pendingRequests}
              </div>
            )}
          </button>
        </div>
      </SidebarTooltip>
      
      <div className="w-8 h-[2px] bg-white/[0.06] rounded-full my-1" />
      
      {/* Servers */}
      <div className="flex-1 overflow-y-auto scrollbar-none space-y-2 w-full flex flex-col items-center">
        {servers.map((server) => (
          <ServerIcon key={server.id} server={server} isActive={activeServerId === server.id} onClick={() => onServerSelect(server)} />
        ))}
      </div>
      
      <div className="w-8 h-[2px] bg-white/[0.06] rounded-full my-1" />
      
      {/* Add server */}
      <SidebarTooltip label="Add a Server">
        <button onClick={onCreateServer} className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#2a2a2a] text-emerald-400 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all duration-200">
          <Plus className="w-5 h-5" />
        </button>
      </SidebarTooltip>
      
      <SidebarTooltip label="Explore Servers">
        <button onClick={onDiscoverClick} className="w-12 h-12 rounded-[24px] hover:rounded-[16px] bg-[#2a2a2a] text-emerald-400 hover:bg-emerald-600 hover:text-white flex items-center justify-center transition-all duration-200">
          <Compass className="w-5 h-5" />
        </button>
      </SidebarTooltip>
    </div>
  );
}