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
              <motion.button
                onClick={handleClick}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                  "w-full flex items-center gap-3 px-2.5 py-2 rounded-xl transition-all group relative",
                  isActive 
                    ? "bg-white/10 text-white border border-white/20" 
                    : "text-zinc-500 hover:bg-white/[0.03] hover:text-white border border-transparent hover:border-white/5"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeServerIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 bg-white rounded-r-full" 
                  />
                )}
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all overflow-hidden",
                  isActive 
                    ? "bg-white/10 border border-white/20" 
                    : "bg-white/[0.02] border border-white/5 group-hover:border-white/10"
                )}>
                  {server.icon_url ? (
                    <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-medium text-white">{server.name?.charAt(0)}</span>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-medium text-sm truncate">{server.name}</p>
                    <p className="text-[10px] text-zinc-600">{server.member_count || 0} members</p>
                  </div>
                )}
                {!isCollapsed && server.unread > 0 && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="min-w-[18px] h-[18px] px-1 bg-white text-black rounded-md text-[10px] font-bold flex items-center justify-center"
                  >
                    {server.unread > 99 ? '99+' : server.unread}
                  </motion.div>
                )}
              </motion.button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="bg-zinc-900/95 backdrop-blur-xl border-white/10 text-white">
                <p className="font-medium">{server.name}</p>
                <p className="text-[10px] text-zinc-500">{server.member_count || 0} members</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-zinc-900/95 backdrop-blur-xl border-white/10 rounded-xl p-1">
        <ContextMenuItem className="text-zinc-400 focus:bg-white/5 focus:text-white rounded-lg px-3 py-2 text-sm">
          <Hash className="w-4 h-4 mr-2 text-zinc-600" />
          View Channels
        </ContextMenuItem>
        <ContextMenuItem className="text-zinc-400 focus:bg-white/5 focus:text-white rounded-lg px-3 py-2 text-sm">
          <Bell className="w-4 h-4 mr-2 text-zinc-600" />
          Notifications
        </ContextMenuItem>
        <ContextMenuItem className="text-zinc-400 focus:bg-white/5 focus:text-white rounded-lg px-3 py-2 text-sm">
          <Settings className="w-4 h-4 mr-2 text-zinc-600" />
          Settings
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/5 my-1" />
        <ContextMenuItem 
          className="text-red-400 focus:bg-red-500/10 rounded-lg px-3 py-2 text-sm"
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
          <motion.button
            onClick={handleClick}
            whileHover={{ x: 1 }}
            whileTap={{ scale: 0.99 }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all relative",
              isActive 
                ? "bg-white/10 text-white border border-white/10" 
                : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300 border border-transparent"
            )}
          >
            <div className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
              isActive ? "bg-white/10" : "bg-transparent"
            )}>
              <Icon className="w-4 h-4" />
            </div>
            {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
            {!isCollapsed && shortcut && (
              <span className="ml-auto text-[10px] text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded-md hidden md:inline">{shortcut}</span>
            )}
            {badge > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  "bg-white text-black text-[10px] font-bold rounded-md flex items-center justify-center",
                  isCollapsed ? "absolute -top-1 -right-1 w-4 h-4" : "ml-auto min-w-[18px] h-[18px] px-1"
                )}
              >
                {badge > 99 ? '99+' : badge}
              </motion.div>
            )}
          </motion.button>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" className="bg-zinc-900/95 backdrop-blur-xl border-white/10 text-white text-xs">
            <span>{label}</span>
            {shortcut && <span className="ml-2 text-zinc-500">{shortcut}</span>}
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
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="h-full bg-[#050506] flex flex-col border-r border-white/5 relative overflow-hidden w-[280px] md:w-auto"
    >
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />
      
      {/* Header */}
      <div className="relative p-4 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-white font-bold">K</span>
            </div>
            <div>
              <span className="font-medium text-white/90 text-base">Kairo</span>
              <p className="text-[10px] text-zinc-600">v4.0.0</p>
            </div>
          </motion.div>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex text-zinc-600 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </motion.button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="relative px-3 mb-3">
          <motion.button 
            whileHover={{ scale: 1.005 }}
            whileTap={{ scale: 0.995 }}
            onClick={() => window.dispatchEvent(new CustomEvent('kairo:open-search'))}
            className="w-full flex items-center gap-2 px-3 py-2 bg-white/[0.02] hover:bg-white/[0.04] rounded-lg text-zinc-500 text-xs transition-all border border-white/5 hover:border-white/10"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search...</span>
            <span className="ml-auto text-[10px] text-zinc-600 bg-white/5 px-1.5 py-0.5 rounded">⌘K</span>
          </motion.button>
        </div>
      )}

      {/* User Profile Card */}
      <div className="px-3 mb-3">
        <motion.button
          whileHover={{ scale: 1.005 }}
          onClick={onProfileClick}
          className="w-full p-2.5 flex items-center gap-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl transition-all border border-white/5 hover:border-white/10 group"
        >
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-white/20 transition-all">
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-[#050506] rounded-full">
              <StatusDot status={userProfile?.status} />
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-white text-sm truncate">{userProfile?.display_name || 'User'}</p>
              <p className="text-[10px] text-zinc-600 truncate">{userProfile?.custom_status?.text || 'Set a status'}</p>
            </div>
          )}
        </motion.button>
      </div>

      {/* Navigation */}
      <div className="px-3 py-2 space-y-1">
        <NavButton icon={MessageCircle} label="Messages" onClick={onDMsClick} isActive={isDMsActive} badge={unreadDMs} isCollapsed={isCollapsed} shortcut="⌘D" onMobileClose={onMobileClose} />
        <NavButton icon={Users} label="Friends" onClick={onFriendsClick} isCollapsed={isCollapsed} onMobileClose={onMobileClose} />
        <NavButton icon={Compass} label="Discover" onClick={onDiscoverClick} isCollapsed={isCollapsed} onMobileClose={onMobileClose} />
      </div>
      
      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="px-3 py-2 flex gap-1.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.dispatchEvent(new CustomEvent('kairo:show-soundboard'))}
            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg text-zinc-500 hover:text-white text-[11px] font-medium transition-colors border border-white/5"
          >
            <Volume2 className="w-3 h-3" />
            Sounds
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.dispatchEvent(new CustomEvent('kairo:show-notes'))}
            className="flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg text-zinc-500 hover:text-white text-[11px] font-medium transition-colors border border-white/5"
          >
            <StickyNote className="w-3 h-3" />
            Notes
          </motion.button>
        </div>
      )}

      {/* Servers */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2">
        {!isCollapsed && (
          <div className="flex items-center justify-between mb-2 px-1">
            <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-wider">Spaces</p>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onCreateServer}
              className="p-1 text-zinc-600 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors"
            >
              <Plus className="w-3 h-3" />
            </motion.button>
          </div>
        )}
        <div className="space-y-1">
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
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <LayoutGrid className="w-5 h-5 text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-400 font-medium mb-1">No spaces</p>
            <p className="text-[11px] text-zinc-600 mb-3">Create or join one</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCreateServer}
              className="px-4 py-2 bg-white text-black text-xs font-medium rounded-lg"
            >
              Create Space
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="relative p-3 border-t border-white/5 space-y-1">
        <NavButton icon={ShoppingBag} label="Shop" onClick={onShopClick} isCollapsed={isCollapsed} onMobileClose={onMobileClose} />
        <NavButton icon={Bell} label="Notifications" onClick={onNotificationsClick} badge={notifications.length} isCollapsed={isCollapsed} onMobileClose={onMobileClose} />
        <NavButton 
          icon={Sparkles} 
          label="What's New" 
          onClick={onUpdateLogsClick} 
          badge={hasNewUpdates ? 1 : 0}
          isCollapsed={isCollapsed}
          onMobileClose={onMobileClose}
        />
        <NavButton icon={Settings} label="Settings" onClick={onSettingsClick} isCollapsed={isCollapsed} shortcut="⌘," onMobileClose={onMobileClose} />
      </div>
    </motion.div>
  );
}