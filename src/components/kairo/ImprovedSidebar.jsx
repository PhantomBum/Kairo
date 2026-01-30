import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Users, Settings, ChevronDown, Plus, 
  Compass, User, Bell, ChevronLeft, ChevronRight,
  Hash, Sparkles, ShoppingBag, Search, LayoutGrid,
  Volume2, StickyNote, Keyboard, Bookmark, Clock,
  Zap, Shield, Palette, Download, Star, Activity,
  UserPlus, Gift, Crown, Headphones
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

function NavItem({ icon: Icon, label, isActive, badge, onClick, isCollapsed, premium }) {
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClick}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors relative",
                isActive ? "bg-emerald-500 text-white" : "bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white",
                premium && "bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 hover:from-amber-500/30 hover:to-orange-500/30"
              )}
            >
              <Icon className="w-5 h-5" />
              {badge > 0 && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {badge > 9 ? '9+' : badge}
                </motion.div>
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-[#1a1a1d] border-white/10 text-white text-xs">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <motion.button
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors relative",
        isActive ? "bg-emerald-500/20 text-emerald-400" : "text-zinc-400 hover:text-white",
        premium && "text-amber-400"
      )}
    >
      <div className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
        isActive ? "bg-emerald-500/20" : "bg-white/5",
        premium && "bg-gradient-to-br from-amber-500/20 to-orange-500/20"
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm truncate flex-1 text-left">{label}</span>
      {badge > 0 && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </motion.div>
      )}
      {premium && <Crown className="w-3.5 h-3.5 text-amber-400" />}
    </motion.button>
  );
}

function ServerItem({ server, isActive, isCollapsed, index, onClick, onLeave }) {
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.03, duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClick}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden transition-all relative",
                isActive ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#0d0d0f]" : "hover:ring-2 hover:ring-white/20 hover:ring-offset-2 hover:ring-offset-[#0d0d0f]"
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
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
                  {server.unread > 9 ? '9+' : server.unread}
                </motion.div>
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-[#1a1a1d] border-white/10 text-white text-xs">
            {server.name}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03, duration: 0.2 }}
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          whileTap={{ scale: 0.98 }}
          onClick={onClick}
          className={cn(
            "w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors relative",
            isActive ? "bg-emerald-500/20" : ""
          )}
        >
          <div className={cn(
            "w-8 h-8 rounded-lg overflow-hidden flex-shrink-0",
            isActive && "ring-2 ring-emerald-500"
          )}>
            {server.icon_url ? (
              <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-white text-xs font-bold">
                {server.name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className={cn("text-sm truncate", isActive ? "text-emerald-400 font-medium" : "text-zinc-300")}>{server.name}</p>
            <p className="text-[10px] text-zinc-600">{server.member_count || 0} members</p>
          </div>
          {server.unread > 0 && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {server.unread > 9 ? '9+' : server.unread}
            </motion.div>
          )}
        </motion.button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-[#1a1a1d] border-white/10 rounded-lg p-1 kairo-stagger">
        <ContextMenuItem className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 text-xs">
          <UserPlus className="w-3.5 h-3.5 mr-2 text-zinc-500" />
          Invite People
        </ContextMenuItem>
        <ContextMenuItem className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 text-xs">
          <Settings className="w-3.5 h-3.5 mr-2 text-zinc-500" />
          Server Settings
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/5 my-1" />
        <ContextMenuItem onClick={() => onLeave?.(server)} className="text-red-400 focus:bg-red-500/10 rounded px-3 py-2 text-xs">
          Leave Server
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
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
  const expandedWidth = 220;
  const collapsedWidth = 64;

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ 
        x: 0, 
        opacity: 1,
        width: isCollapsed ? collapsedWidth : expandedWidth 
      }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="h-full bg-[#0d0d0f] flex flex-col border-r border-white/5 relative overflow-hidden"
    >
      {/* Header with Logo and Collapse */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-white/5">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-sm">Kairo</span>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white flex items-center justify-center transition-colors"
        >
          <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronLeft className="w-4 h-4" />
          </motion.div>
        </motion.button>
      </div>

      {/* Quick Navigation */}
      <div className="px-2 py-2 border-b border-white/5 space-y-1">
        <NavItem icon={MessageCircle} label="Messages" isActive={isDMsActive} badge={unreadDMs} onClick={() => { onDMsClick?.(); onMobileClose?.(); }} isCollapsed={isCollapsed} />
        <NavItem icon={Users} label="Friends" onClick={() => { onFriendsClick?.(); onMobileClose?.(); }} isCollapsed={isCollapsed} />
        <NavItem icon={Bookmark} label="Saved" onClick={() => {}} isCollapsed={isCollapsed} />
        <NavItem icon={Clock} label="Activity" onClick={() => {}} isCollapsed={isCollapsed} />
      </div>

      {/* Servers Section */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2">
        {!isCollapsed && (
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Servers</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onCreateServer}
              className="w-5 h-5 rounded bg-white/5 hover:bg-emerald-500 text-zinc-500 hover:text-white flex items-center justify-center transition-colors"
            >
              <Plus className="w-3 h-3" />
            </motion.button>
          </div>
        )}
        <div className={cn("space-y-1", isCollapsed && "flex flex-col items-center")}
          {servers.map((server, index) => (
            <ServerItem 
              key={server.id}
              server={server}
              isActive={activeServerId === server.id}
              isCollapsed={isCollapsed}
              index={index}
              onClick={() => { onServerSelect(server); onMobileClose?.(); }}
              onLeave={onLeaveServer}
            />
          ))}

          {/* Discover button */}
          {isCollapsed ? (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { onDiscoverClick?.(); onMobileClose?.(); }}
                    className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white flex items-center justify-center transition-colors"
                  >
                    <Compass className="w-5 h-5" />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[#1a1a1d] border-white/10 text-white text-xs">
                  Discover Servers
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <motion.button
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              onClick={() => { onDiscoverClick?.(); onMobileClose?.(); }}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-zinc-500 hover:text-white transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-sm truncate">Discover</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="px-2 py-2 border-t border-white/5 space-y-1">
        {!isCollapsed && (
          <div className="px-2 mb-2">
            <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Quick Actions</span>
          </div>
        )}
        <NavItem icon={Sparkles} label="Updates" badge={hasNewUpdates ? 1 : 0} onClick={() => { onUpdateLogsClick?.(); onMobileClose?.(); }} isCollapsed={isCollapsed} />
        <NavItem icon={Bell} label="Notifications" badge={notifications?.length || 0} onClick={() => { onNotificationsClick?.(); onMobileClose?.(); }} isCollapsed={isCollapsed} />
        <NavItem icon={ShoppingBag} label="Shop" onClick={() => { onShopClick?.(); onMobileClose?.(); }} isCollapsed={isCollapsed} />
        <NavItem icon={Gift} label="Nitro" onClick={() => {}} isCollapsed={isCollapsed} premium />
      </div>

      {/* Tools Section */}
      <div className="px-2 py-2 border-t border-white/5 space-y-1">
        {!isCollapsed && (
          <div className="px-2 mb-2">
            <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Tools</span>
          </div>
        )}
        <NavItem icon={Palette} label="Themes" onClick={() => {}} isCollapsed={isCollapsed} />
        <NavItem icon={Keyboard} label="Shortcuts" onClick={() => window.dispatchEvent(new CustomEvent('kairo:open-shortcuts'))} isCollapsed={isCollapsed} />
        <NavItem icon={Headphones} label="Audio" onClick={() => {}} isCollapsed={isCollapsed} />
      </div>

      {/* User Section */}
      <div className="px-2 py-3 border-t border-white/5">
        <motion.button
          whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          onClick={onProfileClick}
          className={cn(
            "w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors",
            isCollapsed && "justify-center"
          )}
        >
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-white/10">
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                  {userProfile?.display_name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <motion.div 
              className={cn(
                "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0d0d0f]",
                userProfile?.status === 'online' ? 'bg-emerald-500' :
                userProfile?.status === 'idle' ? 'bg-amber-500' :
                userProfile?.status === 'dnd' ? 'bg-rose-500' : 'bg-zinc-500'
              )}
              animate={userProfile?.status === 'online' ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate">{userProfile?.display_name || 'User'}</p>
              <p className="text-[10px] text-zinc-500 truncate">{userProfile?.custom_status?.text || userProfile?.status || 'Online'}</p>
            </div>
          )}
          {!isCollapsed && (
            <motion.button
              whileHover={{ scale: 1.1, rotate: 45 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); onSettingsClick?.(); }}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white flex items-center justify-center transition-colors"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}