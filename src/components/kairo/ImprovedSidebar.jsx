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

function ServerItem({ server, isActive, onClick, isCollapsed, onLeave }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <TooltipProvider delayDuration={isCollapsed ? 100 : 1000}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={onClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "w-full flex items-center gap-3 px-2.5 py-2 rounded-2xl transition-all group relative",
                  isActive 
                    ? "bg-gradient-to-r from-violet-500/20 to-indigo-500/15 text-white shadow-lg shadow-violet-500/5" 
                    : "text-zinc-400 hover:bg-zinc-800/70 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeServerIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-violet-400 to-indigo-500 rounded-r-full shadow-lg shadow-violet-500/50" 
                  />
                )}
                <div className={cn(
                  "w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all overflow-hidden ring-2 ring-transparent",
                  isActive 
                    ? "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/30 ring-violet-500/30" 
                    : "bg-zinc-800/90 group-hover:bg-zinc-700 group-hover:ring-zinc-600/50"
                )}>
                  {server.icon_url ? (
                    <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-base font-bold text-white">{server.name?.charAt(0)}</span>
                  )}
                </div>
                {!isCollapsed && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="font-semibold text-sm truncate">{server.name}</p>
                    <p className="text-[11px] text-zinc-500">{server.member_count || 0} members</p>
                  </div>
                )}
                {!isCollapsed && server.unread > 0 && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="min-w-[22px] h-[22px] px-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full text-[11px] font-bold flex items-center justify-center text-white shadow-lg shadow-violet-500/30"
                  >
                    {server.unread > 99 ? '99+' : server.unread}
                  </motion.div>
                )}
              </motion.button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right" className="bg-zinc-900 border-zinc-800 text-white">
                <p className="font-medium">{server.name}</p>
                <p className="text-xs text-zinc-400">{server.member_count || 0} members</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52 bg-zinc-900/95 backdrop-blur-xl border-zinc-800/80 rounded-2xl shadow-2xl p-1.5">
        <ContextMenuItem className="text-zinc-300 focus:bg-zinc-800 rounded-xl px-3 py-2">
          <Hash className="w-4 h-4 mr-2.5 text-zinc-500" />
          View Channels
        </ContextMenuItem>
        <ContextMenuItem className="text-zinc-300 focus:bg-zinc-800 rounded-xl px-3 py-2">
          <Bell className="w-4 h-4 mr-2.5 text-zinc-500" />
          Notifications
        </ContextMenuItem>
        <ContextMenuItem className="text-zinc-300 focus:bg-zinc-800 rounded-xl px-3 py-2">
          <Settings className="w-4 h-4 mr-2.5 text-zinc-500" />
          Settings
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-zinc-800/50 my-1" />
        <ContextMenuItem 
          className="text-rose-400 focus:bg-rose-500/10 rounded-xl px-3 py-2"
          onClick={() => onLeave?.(server)}
        >
          Leave Server
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function NavButton({ icon: Icon, label, onClick, isActive, badge, isCollapsed, shortcut }) {
  return (
    <TooltipProvider delayDuration={isCollapsed ? 100 : 1000}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={onClick}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl transition-all relative",
              isActive 
                ? "bg-gradient-to-r from-zinc-800 to-zinc-800/50 text-white shadow-inner" 
                : "text-zinc-500 hover:bg-zinc-800/60 hover:text-zinc-300"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
              isActive ? "bg-violet-500/20 text-violet-400" : "bg-transparent"
            )}>
              <Icon className="w-[18px] h-[18px]" />
            </div>
            {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
            {!isCollapsed && shortcut && (
              <span className="ml-auto text-[10px] text-zinc-600 bg-zinc-800/80 px-1.5 py-0.5 rounded-md">{shortcut}</span>
            )}
            {badge > 0 && (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  "bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30",
                  isCollapsed ? "absolute -top-1 -right-1 w-5 h-5" : "ml-auto min-w-[20px] h-5 px-1.5"
                )}
              >
                {badge > 99 ? '99+' : badge}
              </motion.div>
            )}
          </motion.button>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" className="bg-zinc-900 border-zinc-800">
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
  hasNewUpdates = false
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.div 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="h-full bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900/95 flex flex-col border-r border-zinc-800/30 relative overflow-hidden"
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.02] to-indigo-500/[0.02] pointer-events-none" />
      
      {/* Header */}
      <div className="relative p-4 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/30 ring-2 ring-violet-500/20">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <div>
              <span className="font-bold text-white tracking-tight text-lg">Kairo</span>
              <p className="text-[10px] text-zinc-500 font-medium">v3.6.0</p>
            </div>
          </motion.div>
        )}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-zinc-500 hover:text-white p-2 rounded-xl hover:bg-zinc-800/50 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </motion.button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="relative px-3 mb-4">
          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => window.dispatchEvent(new CustomEvent('kairo:open-search'))}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-zinc-900/60 hover:bg-zinc-800/80 rounded-2xl text-zinc-500 text-sm transition-all border border-zinc-800/30 hover:border-zinc-700/50"
          >
            <Search className="w-4 h-4" />
            <span>Search everything...</span>
            <span className="ml-auto text-[10px] text-zinc-600 bg-zinc-800/80 px-2 py-1 rounded-lg font-medium">⌘K</span>
          </motion.button>
        </div>
      )}

      {/* User Profile Card */}
      <div className="px-3 mb-4">
        <motion.button
          whileHover={{ scale: 1.01 }}
          onClick={onProfileClick}
          className="w-full p-3 flex items-center gap-3 bg-gradient-to-r from-zinc-900/80 to-zinc-900/40 hover:from-zinc-800/80 hover:to-zinc-800/40 rounded-2xl transition-all border border-zinc-800/30 hover:border-zinc-700/50 group"
        >
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center overflow-hidden ring-2 ring-violet-500/20 group-hover:ring-violet-500/40 transition-all shadow-lg">
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-zinc-900 rounded-full ring-2 ring-zinc-900">
              <StatusDot status={userProfile?.status} />
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="font-semibold text-white text-sm truncate">{userProfile?.display_name || 'User'}</p>
              <p className="text-xs text-zinc-500 truncate">{userProfile?.custom_status?.text || '✨ Set a status'}</p>
            </div>
          )}
        </motion.button>
      </div>

      {/* Navigation */}
      <div className="px-3 py-2 space-y-1">
        <NavButton icon={MessageCircle} label="Messages" onClick={onDMsClick} isActive={isDMsActive} badge={unreadDMs} isCollapsed={isCollapsed} shortcut="⌘D" />
        <NavButton icon={Users} label="Friends" onClick={onFriendsClick} isCollapsed={isCollapsed} />
        <NavButton icon={Compass} label="Discover" onClick={onDiscoverClick} isCollapsed={isCollapsed} />
      </div>
      
      {/* Quick Actions - New in v3.6 */}
      {!isCollapsed && (
        <div className="px-3 py-2 flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.dispatchEvent(new CustomEvent('kairo:show-soundboard'))}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900/50 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-300 text-xs font-medium transition-colors border border-zinc-800/30"
          >
            <Volume2 className="w-3.5 h-3.5" />
            Sounds
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.dispatchEvent(new CustomEvent('kairo:show-notes'))}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-zinc-900/50 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-300 text-xs font-medium transition-colors border border-zinc-800/30"
          >
            <StickyNote className="w-3.5 h-3.5" />
            Notes
          </motion.button>
        </div>
      )}

      {/* Servers */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2">
        {!isCollapsed && (
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Your Spaces</p>
            <motion.button 
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onCreateServer}
              className="p-1.5 text-zinc-500 hover:text-white bg-zinc-800/50 hover:bg-violet-500 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        )}
        <div className="space-y-1.5">
          <AnimatePresence>
            {servers.map((server, i) => (
              <motion.div
                key={server.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <ServerItem
                  server={server}
                  isActive={activeServerId === server.id}
                  onClick={() => onServerSelect(server)}
                  isCollapsed={isCollapsed}
                  onLeave={onLeaveServer}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {servers.length === 0 && !isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-10"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center border border-zinc-800">
              <LayoutGrid className="w-7 h-7 text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-400 font-medium mb-1">No spaces yet</p>
            <p className="text-xs text-zinc-600 mb-4">Create or join a community</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onCreateServer}
              className="px-4 py-2 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-medium rounded-xl shadow-lg shadow-violet-500/25"
            >
              Create Space
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="relative p-3 border-t border-zinc-800/30 space-y-1 bg-gradient-to-t from-zinc-950 to-transparent">
        <NavButton icon={ShoppingBag} label="Shop" onClick={onShopClick} isCollapsed={isCollapsed} />
        <NavButton icon={Bell} label="Notifications" onClick={onNotificationsClick} badge={notifications.length} isCollapsed={isCollapsed} />
        <NavButton 
          icon={Sparkles} 
          label="What's New" 
          onClick={onUpdateLogsClick} 
          badge={hasNewUpdates ? 1 : 0}
          isCollapsed={isCollapsed} 
        />
        <NavButton icon={Settings} label="Settings" onClick={onSettingsClick} isCollapsed={isCollapsed} shortcut="⌘," />
      </div>
    </motion.div>
  );
}