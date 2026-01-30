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

function ServerItem({ server, isActive, onClick, isCollapsed, onLeave, onMobileClose }) {
  const handleClick = () => {
    onClick?.();
    onMobileClose?.();
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <TooltipProvider delayDuration={isCollapsed ? 100 : 1000}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleClick}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2 py-1.5 rounded transition-all group relative",
                  isActive 
                    ? "bg-white/10 text-white" 
                    : "text-zinc-500 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden",
                  isActive ? "bg-white/10" : "bg-white/5"
                )}>
                  {server.icon_url ? (
                    <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-medium text-white">{server.name?.charAt(0)}</span>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-xs truncate">{server.name}</p>
                    <p className="text-[10px] text-zinc-600">{server.member_count || 0} members</p>
                  </div>
                )}
                {!isCollapsed && server.unread > 0 && (
                  <div className="min-w-[16px] h-[16px] px-1 bg-red-500 text-white rounded text-[9px] font-bold flex items-center justify-center">
                    {server.unread > 99 ? '99+' : server.unread}
                  </div>
                )}
              </motion.button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="bg-[#111113] border-white/10 text-white text-xs">
                <p className="font-medium">{server.name}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-44 bg-[#0a0a0b] border-white/10 rounded-lg p-1">
        <ContextMenuItem className="text-zinc-400 focus:bg-white/5 focus:text-white rounded px-3 py-2 text-xs">
          <Hash className="w-3.5 h-3.5 mr-2 text-zinc-600" />
          View Channels
        </ContextMenuItem>
        <ContextMenuItem className="text-zinc-400 focus:bg-white/5 focus:text-white rounded px-3 py-2 text-xs">
          <Settings className="w-3.5 h-3.5 mr-2 text-zinc-600" />
          Settings
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/5 my-1" />
        <ContextMenuItem 
          className="text-red-400 focus:bg-red-500/10 rounded px-3 py-2 text-xs"
          onClick={() => onLeave?.(server)}
        >
          Leave Server
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function NavButton({ icon: Icon, label, onClick, isActive, badge, isCollapsed, shortcut, onMobileClose }) {
  const handleClick = () => {
    onClick?.();
    onMobileClose?.();
  };

  return (
    <TooltipProvider delayDuration={isCollapsed ? 100 : 1000}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className={cn(
              "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded transition-all relative",
              isActive 
                ? "bg-white/10 text-white" 
                : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
            )}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="text-xs font-medium">{label}</span>}
            {badge > 0 && (
              <div className={cn(
                "bg-red-500 text-white text-[9px] font-bold rounded flex items-center justify-center",
                isCollapsed ? "absolute -top-1 -right-1 w-4 h-4" : "ml-auto min-w-[16px] h-[16px] px-1"
              )}>
                {badge > 99 ? '99+' : badge}
              </div>
            )}
          </button>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" className="bg-[#111113] border-white/10 text-white text-xs">
            <span>{label}</span>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

function StatusDot({ status }) {
  const colors = {
    online: 'bg-emerald-400',
    idle: 'bg-amber-400',
    dnd: 'bg-rose-400',
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
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="h-full bg-[#0a0a0b] flex flex-col border-r border-white/5 relative overflow-hidden w-[260px] md:w-auto"
    >

      
      {/* Header */}
      <div className="relative px-3 py-3 flex items-center justify-between border-b border-white/5">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
              <span className="text-white font-bold text-xs">K</span>
            </div>
            <span className="font-semibold text-white/90 text-sm">Kairo</span>
          </motion.div>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex text-zinc-600 hover:text-white p-1.5 rounded hover:bg-white/5 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </motion.button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="relative px-3 py-2">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('kairo:open-search'))}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 bg-white/5 hover:bg-white/[0.07] rounded text-zinc-600 text-xs transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </div>
      )}

      {/* User Profile Card */}
      <div className="px-3 py-2 border-b border-white/5">
        <button
          onClick={onProfileClick}
          className="w-full p-2 flex items-center gap-2.5 hover:bg-white/5 rounded transition-all group"
        >
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-[#0a0a0b] rounded-full">
              <StatusDot status={userProfile?.status} />
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-white text-xs truncate">{userProfile?.display_name || 'User'}</p>
              <p className="text-[10px] text-zinc-600 truncate">{userProfile?.custom_status?.text || 'Online'}</p>
            </div>
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="px-3 py-2 space-y-1">
        <NavButton icon={MessageCircle} label="Messages" onClick={onDMsClick} isActive={isDMsActive} badge={unreadDMs} isCollapsed={isCollapsed} shortcut="⌘D" onMobileClose={onMobileClose} />
        <NavButton icon={Users} label="Friends" onClick={onFriendsClick} isCollapsed={isCollapsed} onMobileClose={onMobileClose} />
        <NavButton icon={Compass} label="Discover" onClick={onDiscoverClick} isCollapsed={isCollapsed} onMobileClose={onMobileClose} />
      </div>
      


      {/* Servers */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2">
        {!isCollapsed && (
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[9px] font-semibold text-zinc-600 uppercase tracking-wider">Servers</p>
            <button 
              onClick={onCreateServer}
              className="p-0.5 text-zinc-600 hover:text-white hover:bg-white/5 rounded transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        )}
        <div className="space-y-0.5">
          <AnimatePresence>
            {servers.map((server, i) => (
              <motion.div
                key={server.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
              >
                <ServerItem
                  server={server}
                  isActive={activeServerId === server.id}
                  onClick={() => onServerSelect(server)}
                  isCollapsed={isCollapsed}
                  onLeave={onLeaveServer}
                  onMobileClose={onMobileClose}
                />
              </motion.div>
            ))}
            </AnimatePresence>
        </div>
        {servers.length === 0 && !isCollapsed && (
          <div className="text-center py-6">
            <p className="text-xs text-zinc-600 mb-3">No servers</p>
            <button
              onClick={onCreateServer}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-medium rounded transition-colors"
            >
              Create Server
            </button>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="relative px-3 py-2 border-t border-white/5 space-y-0.5">
        <NavButton icon={Settings} label="Settings" onClick={onSettingsClick} isCollapsed={isCollapsed} onMobileClose={onMobileClose} />
      </div>
    </motion.div>
  );
}