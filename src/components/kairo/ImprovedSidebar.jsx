import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Users, Settings, Plus, 
  Compass, Bell, ChevronLeft, ChevronRight,
  Sparkles, ShoppingBag, Gift, Palette, Keyboard, Headphones,
  Zap, UserPlus, MoreHorizontal, Crown, Star, Flame,
  Radio, Volume2
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function StatusDot({ status, size = 'md' }) {
  const colors = {
    online: 'bg-emerald-400 shadow-emerald-400/50',
    idle: 'bg-amber-400 shadow-amber-400/50',
    dnd: 'bg-rose-400 shadow-rose-400/50',
    invisible: 'bg-zinc-500',
    offline: 'bg-zinc-600'
  };
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3'
  };
  return (
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        "rounded-full shadow-lg",
        sizes[size],
        colors[status] || colors.offline
      )} 
    />
  );
}

function MoreMenu({ isCollapsed, onOpenShortcuts }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isCollapsed ? (
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-2xl flex items-center justify-center bg-gradient-to-br from-white/[0.08] to-white/[0.02] hover:from-white/[0.12] hover:to-white/[0.05] text-zinc-400 hover:text-white transition-all duration-300 border border-white/[0.05] hover:border-white/[0.1] backdrop-blur-sm"
          >
            <MoreHorizontal className="w-5 h-5" />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-white/[0.06] hover:to-transparent group"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.05] group-hover:border-white/[0.1] transition-all flex-shrink-0">
              <MoreHorizontal className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">More</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        side="right" 
        align="end" 
        className="w-52 bg-[#18181b]/95 backdrop-blur-xl border-white/[0.08] rounded-2xl p-2 shadow-2xl shadow-black/50"
      >
        <DropdownMenuItem className="text-amber-400 focus:bg-gradient-to-r focus:from-amber-500/20 focus:to-transparent focus:text-amber-300 rounded-xl px-3 py-2.5 cursor-pointer group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/30 to-orange-500/20 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
            <Crown className="w-4 h-4" />
          </div>
          <span className="font-medium">Nitro</span>
          <Sparkles className="w-3.5 h-3.5 ml-auto opacity-50" />
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/[0.06] my-2" />
        <DropdownMenuItem className="text-zinc-300 focus:bg-white/[0.06] focus:text-white rounded-xl px-3 py-2.5 cursor-pointer group">
          <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center mr-3 group-hover:bg-violet-500/20 transition-colors">
            <Palette className="w-4 h-4 text-zinc-500 group-hover:text-violet-400 transition-colors" />
          </div>
          <span className="font-medium">Themes</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-zinc-300 focus:bg-white/[0.06] focus:text-white rounded-xl px-3 py-2.5 cursor-pointer group" 
          onClick={() => window.dispatchEvent(new CustomEvent('kairo:open-shortcuts'))}
        >
          <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center mr-3 group-hover:bg-blue-500/20 transition-colors">
            <Keyboard className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
          </div>
          <span className="font-medium">Shortcuts</span>
          <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-white/[0.08] text-zinc-500">⌘/</kbd>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-zinc-300 focus:bg-white/[0.06] focus:text-white rounded-xl px-3 py-2.5 cursor-pointer group">
          <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center mr-3 group-hover:bg-emerald-500/20 transition-colors">
            <Headphones className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <span className="font-medium">Audio Settings</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavItem({ icon: Icon, label, isActive, badge, onClick, isCollapsed, gradient }) {
  const activeGradient = gradient || 'from-emerald-500 to-teal-500';
  
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClick}
              className={cn(
                "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 relative overflow-hidden group",
                isActive 
                  ? `bg-gradient-to-br ${activeGradient} text-white shadow-lg` 
                  : "bg-gradient-to-br from-white/[0.08] to-white/[0.02] hover:from-white/[0.12] hover:to-white/[0.05] text-zinc-400 hover:text-white border border-white/[0.05] hover:border-white/[0.1]"
              )}
            >
              {!isActive && (
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity", activeGradient)} />
              )}
              <Icon className="w-5 h-5 relative z-10" />
              {badge > 0 && (
                <motion.div 
                  initial={{ scale: 0, y: -10 }} 
                  animate={{ scale: 1, y: 0 }}
                  className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-lg shadow-rose-500/30"
                >
                  {badge > 99 ? '99+' : badge}
                </motion.div>
              )}
            </motion.button>
          </TooltipTrigger>
          <TooltipContent 
            side="right" 
            className="bg-[#18181b]/95 backdrop-blur-xl border-white/[0.08] text-white text-xs font-medium px-3 py-2 rounded-xl shadow-xl"
          >
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <motion.button
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden group",
        isActive 
          ? "text-white" 
          : "text-zinc-400 hover:text-white"
      )}
    >
      {isActive && (
        <motion.div 
          layoutId="nav-active-bg"
          className={cn("absolute inset-0 bg-gradient-to-r opacity-20 rounded-xl", activeGradient)}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <div className={cn("absolute inset-0 bg-gradient-to-r from-white/[0.06] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl", !isActive && "group-hover:opacity-100")} />
      
      <div className={cn(
        "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 relative z-10",
        isActive 
          ? `bg-gradient-to-br ${activeGradient} shadow-lg` 
          : "bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.05] group-hover:border-white/[0.1]"
      )}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-medium relative z-10">{label}</span>
      {badge > 0 && (
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }}
          className="ml-auto min-w-[22px] h-[22px] px-1.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-lg shadow-rose-500/30 relative z-10"
        >
          {badge > 99 ? '99+' : badge}
        </motion.div>
      )}
    </motion.button>
  );
}

function ServerItem({ server, isActive, isCollapsed, index, onClick, onLeave }) {
  const hasActivity = server.unread > 0 || server.has_activity;
  
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div className="relative">
              <ContextMenu>
                <ContextMenuTrigger>
                  <motion.button
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.04, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClick}
                    className={cn(
                      "w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden transition-all duration-300 relative group",
                      isActive 
                        ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#0d0d0f] shadow-lg shadow-emerald-500/20" 
                        : "hover:ring-2 hover:ring-white/20 hover:ring-offset-2 hover:ring-offset-[#0d0d0f]"
                    )}
                  >
                    {server.icon_url ? (
                      <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className={cn(
                        "w-full h-full flex items-center justify-center text-white text-sm font-bold",
                        isActive 
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600" 
                          : "bg-gradient-to-br from-zinc-700 to-zinc-800 group-hover:from-zinc-600 group-hover:to-zinc-700"
                      )}>
                        {server.name?.charAt(0)}
                      </div>
                    )}
                    
                    {/* Activity indicator */}
                    {hasActivity && !isActive && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-full"
                      />
                    )}
                  </motion.button>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-52 bg-[#18181b]/95 backdrop-blur-xl border-white/[0.08] rounded-2xl p-2 shadow-2xl">
                  <ContextMenuItem className="text-zinc-300 focus:bg-white/[0.06] focus:text-white rounded-xl px-3 py-2.5 cursor-pointer">
                    <UserPlus className="w-4 h-4 mr-3 text-zinc-500" />
                    Invite People
                  </ContextMenuItem>
                  <ContextMenuItem className="text-zinc-300 focus:bg-white/[0.06] focus:text-white rounded-xl px-3 py-2.5 cursor-pointer">
                    <Settings className="w-4 h-4 mr-3 text-zinc-500" />
                    Server Settings
                  </ContextMenuItem>
                  <ContextMenuSeparator className="bg-white/[0.06] my-2" />
                  <ContextMenuItem 
                    onClick={() => onLeave?.(server)} 
                    className="text-rose-400 focus:bg-rose-500/10 focus:text-rose-300 rounded-xl px-3 py-2.5 cursor-pointer"
                  >
                    Leave Server
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
              
              {/* Unread badge */}
              {server.unread > 0 && (
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -bottom-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-lg shadow-rose-500/30"
                >
                  {server.unread > 99 ? '99+' : server.unread}
                </motion.div>
              )}
            </motion.div>
          </TooltipTrigger>
          <TooltipContent 
            side="right" 
            className="bg-[#18181b]/95 backdrop-blur-xl border-white/[0.08] text-white rounded-xl shadow-xl px-3 py-2"
          >
            <p className="font-semibold">{server.name}</p>
            <p className="text-xs text-zinc-500">{server.member_count || 0} members</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.04, duration: 0.3 }}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={onClick}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 relative overflow-hidden group",
            isActive && "bg-gradient-to-r from-emerald-500/10 to-transparent"
          )}
        >
          {/* Active indicator line */}
          <AnimatePresence>
            {isActive && (
              <motion.div 
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ scaleY: 0 }}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-r-full"
              />
            )}
          </AnimatePresence>
          
          {/* Hover bg */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
          
          <div className={cn(
            "w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 relative z-10",
            isActive && "ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/20"
          )}>
            {server.icon_url ? (
              <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className={cn(
                "w-full h-full flex items-center justify-center text-white text-sm font-bold transition-all",
                isActive 
                  ? "bg-gradient-to-br from-emerald-500 to-teal-600" 
                  : "bg-gradient-to-br from-zinc-700 to-zinc-800 group-hover:from-zinc-600 group-hover:to-zinc-700"
              )}>
                {server.name?.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 text-left relative z-10">
            <p className={cn(
              "text-sm truncate font-medium transition-colors",
              isActive ? "text-emerald-400" : "text-zinc-300 group-hover:text-white"
            )}>
              {server.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-zinc-500">{server.online_count || Math.floor((server.member_count || 1) * 0.3)} online</span>
              </div>
              <span className="text-zinc-700">·</span>
              <span className="text-[10px] text-zinc-600">{server.member_count || 0} members</span>
            </div>
          </div>
          
          {server.unread > 0 && (
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }}
              className="min-w-[22px] h-[22px] px-1.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-lg shadow-rose-500/30 relative z-10"
            >
              {server.unread > 99 ? '99+' : server.unread}
            </motion.div>
          )}
        </motion.button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52 bg-[#18181b]/95 backdrop-blur-xl border-white/[0.08] rounded-2xl p-2 shadow-2xl">
        <ContextMenuItem className="text-zinc-300 focus:bg-white/[0.06] focus:text-white rounded-xl px-3 py-2.5 cursor-pointer">
          <UserPlus className="w-4 h-4 mr-3 text-zinc-500" />
          Invite People
        </ContextMenuItem>
        <ContextMenuItem className="text-zinc-300 focus:bg-white/[0.06] focus:text-white rounded-xl px-3 py-2.5 cursor-pointer">
          <Settings className="w-4 h-4 mr-3 text-zinc-500" />
          Server Settings
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/[0.06] my-2" />
        <ContextMenuItem 
          onClick={() => onLeave?.(server)} 
          className="text-rose-400 focus:bg-rose-500/10 focus:text-rose-300 rounded-xl px-3 py-2.5 cursor-pointer"
        >
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
  const expandedWidth = 260;
  const collapsedWidth = 72;

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ 
        x: 0, 
        opacity: 1,
        width: isCollapsed ? collapsedWidth : expandedWidth 
      }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className="h-full flex flex-col relative overflow-hidden"
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f12] via-[#0c0c0e] to-[#0a0a0c]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.05),transparent_50%)]" />
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-emerald-400 to-cyan-600 rounded-2xl opacity-30 blur-lg -z-10" />
                </div>
                <div>
                  <span className="font-bold text-white text-lg tracking-tight">Kairo</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-zinc-500 font-medium">Connected</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-500 hover:text-white flex items-center justify-center transition-all duration-300 border border-white/[0.05] hover:border-white/[0.1]"
          >
            <motion.div 
              animate={{ rotate: isCollapsed ? 180 : 0 }} 
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <ChevronLeft className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </div>

        {/* Quick Navigation */}
        <div className={cn("px-3 py-2 space-y-1", isCollapsed && "px-2")}>
          <NavItem 
            icon={MessageCircle} 
            label="Messages" 
            isActive={isDMsActive} 
            badge={unreadDMs} 
            onClick={() => { onDMsClick?.(); onMobileClose?.(); }} 
            isCollapsed={isCollapsed}
            gradient="from-violet-500 to-purple-600"
          />
          <NavItem 
            icon={Users} 
            label="Friends" 
            onClick={() => { onFriendsClick?.(); onMobileClose?.(); }} 
            isCollapsed={isCollapsed}
            gradient="from-blue-500 to-cyan-500"
          />
        </div>

        {/* Divider */}
        <div className="px-4 py-2">
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>

        {/* Servers Section */}
        <div className="flex-1 overflow-y-auto scrollbar-none px-3">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-1 mb-3">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Servers</span>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onCreateServer}
                className="w-6 h-6 rounded-lg bg-white/[0.05] hover:bg-emerald-500 text-zinc-500 hover:text-white flex items-center justify-center transition-all duration-300"
              >
                <Plus className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          )}
          
          <div className={cn("space-y-1.5", isCollapsed && "flex flex-col items-center space-y-2")}>
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

            {/* Add Server / Discover */}
            {isCollapsed ? (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { onDiscoverClick?.(); onMobileClose?.(); }}
                      className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] hover:from-emerald-500/20 hover:to-teal-500/10 text-zinc-500 hover:text-emerald-400 flex items-center justify-center transition-all duration-300 border border-white/[0.05] hover:border-emerald-500/30 border-dashed"
                    >
                      <Compass className="w-5 h-5" />
                    </motion.button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-[#18181b]/95 backdrop-blur-xl border-white/[0.08] text-white text-xs font-medium px-3 py-2 rounded-xl">
                    Discover Servers
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { onDiscoverClick?.(); onMobileClose?.(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-emerald-400 transition-all duration-300 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-transparent border border-transparent hover:border-emerald-500/20 border-dashed group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.05] group-hover:border-emerald-500/30 flex items-center justify-center transition-all">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Discover Servers</span>
              </motion.button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="px-4 py-2">
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        </div>

        {/* Quick Actions */}
        <div className={cn("px-3 py-3 space-y-1", isCollapsed && "px-2")}>
          <NavItem 
            icon={Sparkles} 
            label="What's New" 
            badge={hasNewUpdates ? 1 : 0} 
            onClick={() => { onUpdateLogsClick?.(); onMobileClose?.(); }} 
            isCollapsed={isCollapsed}
            gradient="from-pink-500 to-rose-500"
          />
          <NavItem 
            icon={Bell} 
            label="Notifications" 
            badge={notifications?.length || 0} 
            onClick={() => { onNotificationsClick?.(); onMobileClose?.(); }} 
            isCollapsed={isCollapsed}
            gradient="from-amber-500 to-orange-500"
          />
          <NavItem 
            icon={ShoppingBag} 
            label="Shop" 
            onClick={() => { onShopClick?.(); onMobileClose?.(); }} 
            isCollapsed={isCollapsed}
            gradient="from-fuchsia-500 to-purple-600"
          />
          <MoreMenu isCollapsed={isCollapsed} />
        </div>
      </div>
    </motion.div>
  );
}