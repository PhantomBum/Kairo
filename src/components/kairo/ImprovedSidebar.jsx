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
    online: 'bg-emerald-500',
    idle: 'bg-amber-500',
    dnd: 'bg-rose-500',
    invisible: 'bg-zinc-500',
    offline: 'bg-zinc-600'
  };
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3'
  };
  return (
    <div className={cn("rounded-full", sizes[size], colors[status] || colors.offline)} />
  );
}

function MoreMenu({ isCollapsed, onOpenShortcuts }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isCollapsed ? (
          <button className="w-10 h-10 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        ) : (
          <button className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-sm">More</span>
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="w-48 bg-[#111113] border-white/[0.06] rounded-lg p-1">
        <DropdownMenuItem 
          className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 cursor-pointer text-sm"
          onClick={() => window.dispatchEvent(new CustomEvent('kairo:open-nitro'))}
        >
          <Crown className="w-4 h-4 mr-2 text-amber-500" />
          Nitro
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-white/5 my-1" />
        <DropdownMenuItem className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 cursor-pointer text-sm">
          <Palette className="w-4 h-4 mr-2 text-zinc-500" />
          Themes
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 cursor-pointer text-sm" 
          onClick={() => window.dispatchEvent(new CustomEvent('kairo:open-shortcuts'))}
        >
          <Keyboard className="w-4 h-4 mr-2 text-zinc-500" />
          Shortcuts
        </DropdownMenuItem>
        <DropdownMenuItem className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 cursor-pointer text-sm">
          <Headphones className="w-4 h-4 mr-2 text-zinc-500" />
          Audio
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function NavItem({ icon: Icon, label, isActive, badge, onClick, isCollapsed }) {
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onClick}
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors relative",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              )}
            >
              <Icon className="w-5 h-5" />
              {badge > 0 && (
                <div className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-red-500 rounded-full text-[10px] font-medium text-white flex items-center justify-center">
                  {badge > 99 ? '99+' : badge}
                </div>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-[#111113] border-white/[0.06] text-zinc-300 text-xs px-2 py-1 rounded">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-2 py-1.5 rounded-md transition-colors",
        isActive 
          ? "bg-white/10 text-white" 
          : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm">{label}</span>
      {badge > 0 && (
        <div className="ml-auto min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-medium text-white flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </div>
      )}
    </button>
  );
}

function ServerItem({ server, isActive, isCollapsed, index, onClick, onLeave }) {
  const hasActivity = server.unread > 0 || server.has_activity;
  
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              <ContextMenu>
                <ContextMenuTrigger>
                  <button
                    onClick={onClick}
                    className={cn(
                      "w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden transition-all relative",
                      isActive 
                        ? "rounded-xl" 
                        : "hover:rounded-xl"
                    )}
                  >
                    {server.icon_url ? (
                      <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className={cn(
                        "w-full h-full flex items-center justify-center text-white text-sm font-medium",
                        isActive ? "bg-white/10" : "bg-white/5 hover:bg-white/10"
                      )}>
                        {server.name?.charAt(0)}
                      </div>
                    )}
                    
                    {/* Activity indicator */}
                    {hasActivity && !isActive && (
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-full" />
                    )}
                    {isActive && (
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-10 bg-white rounded-full" />
                    )}
                  </button>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-48 bg-[#111113] border-white/[0.06] rounded-lg p-1">
                  <ContextMenuItem className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 cursor-pointer text-sm">
                    <UserPlus className="w-4 h-4 mr-2 text-zinc-500" />
                    Invite People
                  </ContextMenuItem>
                  <ContextMenuItem className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 cursor-pointer text-sm">
                    <Settings className="w-4 h-4 mr-2 text-zinc-500" />
                    Server Settings
                  </ContextMenuItem>
                  <ContextMenuSeparator className="bg-white/5 my-1" />
                  <ContextMenuItem 
                    onClick={() => onLeave?.(server)} 
                    className="text-red-400 focus:bg-red-500/10 rounded px-3 py-2 cursor-pointer text-sm"
                  >
                    Leave Server
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
              
              {server.unread > 0 && (
                <div className="absolute -bottom-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 bg-red-500 rounded-full text-[10px] font-medium text-white flex items-center justify-center">
                  {server.unread > 99 ? '99+' : server.unread}
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-[#111113] border-white/[0.06] text-zinc-300 rounded px-2 py-1.5">
            <p className="font-medium">{server.name}</p>
            <p className="text-xs text-zinc-500">{server.member_count || 0} members</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <button
          onClick={onClick}
          className={cn(
            "w-full flex items-center gap-3 px-2 py-1.5 rounded-md transition-colors relative",
            isActive ? "bg-white/10" : "hover:bg-white/5"
          )}
        >
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-white rounded-r-full" />
          )}
          
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
            {server.icon_url ? (
              <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className={cn(
                "w-full h-full flex items-center justify-center text-white text-sm font-medium",
                isActive ? "bg-white/10" : "bg-white/5"
              )}>
                {server.name?.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 text-left">
            <p className={cn("text-sm truncate", isActive ? "text-white" : "text-zinc-300")}>
              {server.name}
            </p>
            <p className="text-[11px] text-zinc-500">{server.member_count || 0} members</p>
          </div>
          
          {server.unread > 0 && (
            <div className="min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-medium text-white flex items-center justify-center">
              {server.unread > 99 ? '99+' : server.unread}
            </div>
          )}
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-[#111113] border-white/[0.06] rounded-lg p-1">
        <ContextMenuItem className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 cursor-pointer text-sm">
          <UserPlus className="w-4 h-4 mr-2 text-zinc-500" />
          Invite People
        </ContextMenuItem>
        <ContextMenuItem className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 cursor-pointer text-sm">
          <Settings className="w-4 h-4 mr-2 text-zinc-500" />
          Server Settings
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/5 my-1" />
        <ContextMenuItem 
          onClick={() => onLeave?.(server)} 
          className="text-red-400 focus:bg-red-500/10 rounded px-3 py-2 cursor-pointer text-sm"
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
    <div 
      style={{ width: isCollapsed ? collapsedWidth : expandedWidth }}
      className="h-full flex flex-col bg-[#0a0a0b] transition-all duration-200"
    >
      {/* Content */}
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-3 border-b border-white/[0.04]">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#111113] border border-white/[0.06] flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <span className="font-medium text-zinc-300 text-sm">Kairo</span>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-7 h-7 rounded flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", isCollapsed && "rotate-180")} />
          </button>
        </div>

        {/* Quick Navigation */}
        <div className={cn("px-2 py-2 space-y-0.5", isCollapsed && "px-2")}>
          <NavItem 
            icon={MessageCircle} 
            label="Messages" 
            isActive={isDMsActive} 
            badge={unreadDMs} 
            onClick={() => { onDMsClick?.(); onMobileClose?.(); }} 
            isCollapsed={isCollapsed}
          />
          <NavItem 
            icon={Users} 
            label="Friends" 
            onClick={() => { onFriendsClick?.(); onMobileClose?.(); }} 
            isCollapsed={isCollapsed}
          />
        </div>

        {/* Divider */}
        <div className="px-3 py-1">
          <div className="h-px bg-white/5" />
        </div>

        {/* Servers Section */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
          {!isCollapsed && (
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Servers</span>
              <button
                onClick={onCreateServer}
                className="w-5 h-5 rounded flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className={cn("space-y-1", isCollapsed && "flex flex-col items-center space-y-2")}>
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
                    <button
                      onClick={() => { onDiscoverClick?.(); onMobileClose?.(); }}
                      className="w-11 h-11 rounded-2xl hover:rounded-xl bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white flex items-center justify-center transition-all border border-white/5 hover:border-white/10"
                    >
                      <Compass className="w-5 h-5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-[#111113] border-white/[0.06] text-zinc-300 text-xs px-2 py-1.5 rounded">
                    Discover Servers
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <button
                onClick={() => { onDiscoverClick?.(); onMobileClose?.(); }}
                className="w-full flex items-center gap-3 px-2 py-1.5 rounded-md text-zinc-500 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Compass className="w-5 h-5" />
                <span className="text-sm">Discover</span>
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="px-3 py-1">
          <div className="h-px bg-white/5" />
        </div>

        {/* Quick Actions */}
        <div className={cn("px-2 py-2 space-y-0.5", isCollapsed && "px-2")}>
          <NavItem 
            icon={Sparkles} 
            label="What's New" 
            badge={hasNewUpdates ? 1 : 0} 
            onClick={() => { onUpdateLogsClick?.(); onMobileClose?.(); }} 
            isCollapsed={isCollapsed}
          />
          <NavItem 
            icon={Bell} 
            label="Notifications" 
            badge={notifications?.length || 0} 
            onClick={() => { onNotificationsClick?.(); onMobileClose?.(); }} 
            isCollapsed={isCollapsed}
          />
          <NavItem 
            icon={ShoppingBag} 
            label="Shop" 
            onClick={() => { onShopClick?.(); onMobileClose?.(); }} 
            isCollapsed={isCollapsed}
          />
          <MoreMenu isCollapsed={isCollapsed} />
        </div>
        </div>
        </div>
        );
}