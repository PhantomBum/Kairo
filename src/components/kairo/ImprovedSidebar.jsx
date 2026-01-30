import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Users, Settings, ChevronDown, Plus, 
  Compass, User, Bell, ChevronLeft, ChevronRight,
  Hash, Sparkles, ShoppingBag, Search, LayoutGrid,
  Volume2, StickyNote, Keyboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator 
} from '@/components/ui/context-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Server item removed - now using icon-only list in main component

function StatusDot({ status }) {
  const colors = {
    online: 'bg-emerald-500',
    idle: 'bg-amber-500',
    dnd: 'bg-rose-500',
    invisible: 'bg-zinc-500',
    offline: 'bg-zinc-500'
  };
  return <div className={cn("w-2.5 h-2.5 rounded-full", colors[status] || colors.offline)} />;
}

export default function ImprovedSidebar({ 
  servers = [], 
  activeServerId, 
  onServerSelect, 
  onDMsClick,
  onDiscoverClick,
  onCreateServer,
  onSettingsClick,
  onFriendsClick,
  onProfileClick,
  onUpdateLogsClick,
  onNotificationsClick,
  onShopClick,
  onLeaveServer,
  isDMsActive,
  userProfile,
  unreadDMs = 0,
  notifications = [],
  hasNewUpdates = false,
  onMobileClose
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 56 : 64 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="h-full bg-[#0d0d0f] flex flex-col border-r border-white/5 relative overflow-hidden w-16 md:w-auto"
    >

      
      {/* Servers - Kloak style icon list */}
      <div className="flex-1 overflow-y-auto scrollbar-none py-2 flex flex-col items-center gap-2">
        {/* Home / DMs button */}
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => { onDMsClick?.(); onMobileClose?.(); }}
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                  isDMsActive 
                    ? "bg-emerald-500 text-white" 
                    : "bg-white/10 text-zinc-400 hover:bg-white/20 hover:text-white"
                )}
              >
                <MessageCircle className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#1a1a1d] border-white/10 text-white text-xs">
              Messages {unreadDMs > 0 && `(${unreadDMs})`}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="w-8 h-px bg-white/10" />

        {/* Server icons */}
        {servers.map((server) => (
          <TooltipProvider key={server.id} delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => { onServerSelect(server); onMobileClose?.(); }}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden transition-all relative",
                    activeServerId === server.id 
                      ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#0d0d0f]" 
                      : "hover:ring-2 hover:ring-white/20 hover:ring-offset-2 hover:ring-offset-[#0d0d0f]"
                  )}
                >
                  {server.icon_url ? (
                    <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-white text-sm font-bold">
                      {server.name?.charAt(0)}
                    </div>
                  )}
                  {server.unread > 0 && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                      {server.unread > 9 ? '9+' : server.unread}
                    </div>
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-[#1a1a1d] border-white/10 text-white text-xs">
                {server.name}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}

        {/* Add server button */}
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onCreateServer}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-emerald-500 text-zinc-500 hover:text-white flex items-center justify-center transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#1a1a1d] border-white/10 text-white text-xs">
              Create Server
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => { onDiscoverClick?.(); onMobileClose?.(); }}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white flex items-center justify-center transition-all"
              >
                <Compass className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#1a1a1d] border-white/10 text-white text-xs">
              Discover Servers
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Bottom actions */}
      <div className="py-2 flex flex-col items-center gap-2 border-t border-white/5">
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onProfileClick}
                className="w-10 h-10 rounded-full overflow-hidden bg-white/10 relative"
              >
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                    {userProfile?.display_name?.charAt(0) || '?'}
                  </div>
                )}
                <div className={cn(
                  "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0d0d0f]",
                  userProfile?.status === 'online' ? 'bg-emerald-500' :
                  userProfile?.status === 'idle' ? 'bg-amber-500' :
                  userProfile?.status === 'dnd' ? 'bg-rose-500' : 'bg-zinc-500'
                )} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#1a1a1d] border-white/10 text-white text-xs">
              {userProfile?.display_name || 'Profile'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onSettingsClick}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white flex items-center justify-center transition-all"
              >
                <Settings className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#1a1a1d] border-white/10 text-white text-xs">
              Settings
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  );
}