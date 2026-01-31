import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Compass, Home, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function ServerIcon({ server, isActive, onClick, hasNotification, unreadCount }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative group">
            {/* Activity indicator */}
            <div className={cn(
              'absolute -left-2 top-1/2 -translate-y-1/2 w-1 bg-white rounded-r-full transition-all',
              isActive ? 'h-10' : hasNotification ? 'h-5' : 'h-0 group-hover:h-2'
            )} />
            
            <button
              onClick={onClick}
              className={cn(
                'relative w-12 h-12 rounded-2xl overflow-hidden transition-all duration-200',
                'flex items-center justify-center',
                isActive ? 'rounded-xl' : 'hover:rounded-xl',
                !server.icon_url && 'bg-[#111113] hover:bg-indigo-600'
              )}
            >
              {server.icon_url ? (
                <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-medium">
                  {server.name?.charAt(0) || '?'}
                </span>
              )}
            </button>
            
            {/* Unread badge */}
            {unreadCount > 0 && (
              <div className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-[#09090b]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-[#111113] border-white/[0.08]">
          <p className="font-medium">{server.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ActionButton({ icon: Icon, label, onClick, isActive, badge }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              'relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200',
              'hover:rounded-xl',
              isActive 
                ? 'bg-indigo-600 text-white rounded-xl' 
                : 'bg-[#111113] text-zinc-400 hover:bg-indigo-600 hover:text-white'
            )}
          >
            <Icon className="w-5 h-5" />
            {badge > 0 && (
              <div className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-[#09090b]">
                {badge}
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-[#111113] border-white/[0.08]">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ServerBar({
  servers = [],
  activeServerId,
  onServerSelect,
  onHomeClick,
  onDMsClick,
  onDiscoverClick,
  onCreateServer,
  isDMsActive,
  unreadDMs = 0,
}) {
  return (
    <div className="w-[72px] h-full bg-[#09090b] flex flex-col items-center py-3 gap-2">
      {/* Home / DMs button */}
      <ActionButton
        icon={MessageCircle}
        label="Direct Messages"
        onClick={onDMsClick}
        isActive={isDMsActive}
        badge={unreadDMs}
      />
      
      {/* Divider */}
      <div className="w-8 h-0.5 bg-white/[0.06] rounded-full my-1" />
      
      {/* Server list */}
      <div className="flex-1 w-full overflow-y-auto scrollbar-none flex flex-col items-center gap-2 px-3">
        {servers.map((server) => (
          <ServerIcon
            key={server.id}
            server={server}
            isActive={activeServerId === server.id}
            onClick={() => onServerSelect(server)}
            hasNotification={server.has_activity}
            unreadCount={server.unread || 0}
          />
        ))}
      </div>
      
      {/* Divider */}
      <div className="w-8 h-0.5 bg-white/[0.06] rounded-full my-1" />
      
      {/* Add server */}
      <ActionButton
        icon={Plus}
        label="Add a Server"
        onClick={onCreateServer}
      />
      
      {/* Discover */}
      <ActionButton
        icon={Compass}
        label="Explore Servers"
        onClick={onDiscoverClick}
      />
    </div>
  );
}