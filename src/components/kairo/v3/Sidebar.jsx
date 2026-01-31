// Kairo Sidebar v3.0 - Minimal, focused navigation

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Users, Compass, Bell, Plus, Settings,
  ChevronLeft, MoreHorizontal, Crown, Zap, Search,
  Palette, Keyboard, Headphones, Sparkles, ShoppingBag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, StatusDot, Text, IconButton, Divider, Section } from '../ui/DesignSystem';
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

// Server icon with indicator
function ServerIcon({ server, isActive, onClick, onContextMenu }) {
  const hasUnread = server.unread > 0;
  
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <ContextMenu>
            <ContextMenuTrigger>
              <button
                onClick={onClick}
                className="relative group"
              >
                {/* Activity indicator */}
                <div className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-white transition-all",
                  isActive ? "h-10" : hasUnread ? "h-2" : "h-0 group-hover:h-2"
                )} />
                
                {/* Server icon */}
                <div className={cn(
                  "w-12 h-12 rounded-[16px] overflow-hidden transition-all duration-200 ml-2",
                  isActive ? "rounded-[12px]" : "hover:rounded-[12px]"
                )}>
                  {server.icon_url ? (
                    <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className={cn(
                      "w-full h-full flex items-center justify-center text-white font-semibold text-lg",
                      isActive ? "bg-white/15" : "bg-white/5 group-hover:bg-white/10"
                    )}>
                      {server.name?.charAt(0)}
                    </div>
                  )}
                </div>
                
                {/* Unread badge */}
                {server.unread > 0 && (
                  <div className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-[#09090b]">
                    {server.unread > 99 ? '99+' : server.unread}
                  </div>
                )}
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-52 bg-[#111114] border-white/[0.06] rounded-xl p-1.5">
              <ContextMenuItem className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2 text-sm">
                Mark as Read
              </ContextMenuItem>
              <ContextMenuItem className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2 text-sm">
                <Settings className="w-4 h-4 mr-2.5 text-zinc-500" />
                Server Settings
              </ContextMenuItem>
              <ContextMenuSeparator className="bg-white/[0.04] my-1" />
              <ContextMenuItem className="text-red-400 focus:bg-red-500/10 rounded-lg px-3 py-2 text-sm">
                Leave Server
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-[#111114] border-white/[0.06] px-3 py-2 rounded-lg">
          <p className="font-medium text-white text-sm">{server.name}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Quick action button
function QuickAction({ icon: Icon, label, badge, active, onClick }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "relative w-12 h-12 rounded-[16px] flex items-center justify-center transition-all ml-2",
              active 
                ? "bg-white/10 text-white" 
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
            )}
          >
            <Icon className="w-5 h-5" />
            {badge > 0 && (
              <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {badge > 99 ? '99+' : badge}
              </div>
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-[#111114] border-white/[0.06] px-3 py-2 rounded-lg">
          <p className="text-sm text-zinc-300">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function SidebarV3({
  servers = [],
  activeServerId,
  onServerSelect,
  onDMsClick,
  onDiscoverClick,
  onCreateServer,
  onSettingsClick,
  onFriendsClick,
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
  return (
    <div className="w-[72px] h-full bg-[#09090b] flex flex-col items-center py-3 border-r border-white/[0.04]">
      {/* Logo */}
      <div className="mb-3">
        <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
          <Zap className="w-5 h-5 text-emerald-400" />
        </div>
      </div>
      
      <Divider className="w-8 my-2" />
      
      {/* Quick Actions */}
      <div className="space-y-1.5">
        <QuickAction 
          icon={MessageCircle} 
          label="Messages" 
          badge={unreadDMs}
          active={isDMsActive}
          onClick={() => { onDMsClick?.(); onMobileClose?.(); }}
        />
        <QuickAction 
          icon={Users} 
          label="Friends"
          onClick={() => { onFriendsClick?.(); onMobileClose?.(); }}
        />
      </div>
      
      <Divider className="w-8 my-3" />
      
      {/* Servers */}
      <div className="flex-1 overflow-y-auto scrollbar-none space-y-2 w-full">
        {servers.map((server) => (
          <ServerIcon
            key={server.id}
            server={server}
            isActive={activeServerId === server.id}
            onClick={() => { onServerSelect(server); onMobileClose?.(); }}
          />
        ))}
        
        {/* Add Server */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onCreateServer}
                className="w-12 h-12 rounded-[16px] hover:rounded-[12px] bg-white/[0.04] hover:bg-emerald-500/20 text-zinc-500 hover:text-emerald-400 flex items-center justify-center transition-all ml-2 border border-transparent hover:border-emerald-500/30"
              >
                <Plus className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#111114] border-white/[0.06] px-3 py-2 rounded-lg">
              <p className="text-sm text-zinc-300">Create Server</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Discover */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => { onDiscoverClick?.(); onMobileClose?.(); }}
                className="w-12 h-12 rounded-[16px] hover:rounded-[12px] bg-white/[0.04] hover:bg-white/[0.06] text-zinc-500 hover:text-zinc-300 flex items-center justify-center transition-all ml-2"
              >
                <Compass className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-[#111114] border-white/[0.06] px-3 py-2 rounded-lg">
              <p className="text-sm text-zinc-300">Discover Servers</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Divider className="w-8 my-2" />
      
      {/* Bottom Actions */}
      <div className="space-y-1.5">
        <QuickAction 
          icon={Sparkles} 
          label="What's New" 
          badge={hasNewUpdates ? 1 : 0}
          onClick={() => { onUpdateLogsClick?.(); onMobileClose?.(); }}
        />
        <QuickAction 
          icon={Bell} 
          label="Notifications" 
          badge={notifications?.length || 0}
          onClick={() => { onNotificationsClick?.(); onMobileClose?.(); }}
        />
        
        {/* More Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-12 h-12 rounded-[16px] flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-all ml-2">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-52 bg-[#111114] border-white/[0.06] rounded-xl p-1.5">
            <DropdownMenuItem 
              onClick={() => window.dispatchEvent(new CustomEvent('kairo:open-nitro'))}
              className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2.5"
            >
              <Crown className="w-4 h-4 mr-2.5 text-amber-400" />
              Nitro
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => { onShopClick?.(); onMobileClose?.(); }}
              className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2.5"
            >
              <ShoppingBag className="w-4 h-4 mr-2.5 text-zinc-500" />
              Shop
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/[0.04] my-1" />
            <DropdownMenuItem 
              className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2.5"
            >
              <Keyboard className="w-4 h-4 mr-2.5 text-zinc-500" />
              Shortcuts
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={onSettingsClick}
              className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2.5"
            >
              <Settings className="w-4 h-4 mr-2.5 text-zinc-500" />
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}