import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Compass, Plus, Settings, Users, 
  ChevronDown, Hash, Volume2, LogOut, Moon, Ghost,
  Search, Bell, User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

function ServerIcon({ server, isActive, onClick }) {
  const hasIcon = server?.icon_url;
  
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <ContextMenu>
            <ContextMenuTrigger>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClick}
                className="relative group cursor-pointer"
              >
                {/* Active indicator */}
                <motion.div
                  initial={false}
                  animate={{ 
                    height: isActive ? 36 : 0,
                    opacity: isActive ? 1 : 0
                  }}
                  className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 bg-white rounded-r-full"
                />
                
                {/* Hover indicator */}
                <div className={cn(
                  "absolute -left-3 top-1/2 -translate-y-1/2 w-1 bg-white/50 rounded-r-full transition-all duration-200",
                  "h-0 group-hover:h-5",
                  isActive && "!h-0"
                )} />

                <div className={cn(
                  "w-12 h-12 rounded-[24px] flex items-center justify-center transition-all duration-200 overflow-hidden",
                  "bg-zinc-800 hover:bg-indigo-500 group-hover:rounded-[16px]",
                  isActive && "bg-indigo-500 rounded-[16px]"
                )}>
                  {hasIcon ? (
                    <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-medium text-zinc-300 group-hover:text-white">
                      {server?.name?.charAt(0) || 'S'}
                    </span>
                  )}
                </div>
              </motion.div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48 bg-zinc-900 border-zinc-800">
              <ContextMenuItem className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white">
                Mark as Read
              </ContextMenuItem>
              <ContextMenuItem className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white">
                Mute Server
              </ContextMenuItem>
              <ContextMenuItem className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white">
                Server Settings
              </ContextMenuItem>
              <ContextMenuSeparator className="bg-zinc-800" />
              <ContextMenuItem className="text-red-400 focus:bg-red-500/20 focus:text-red-400">
                Leave Server
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-zinc-900 border-zinc-800 text-white">
          {server?.name || 'Server'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function ActionButton({ icon: Icon, label, onClick, variant = 'default', badge }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={cn(
              "w-12 h-12 rounded-[24px] flex items-center justify-center transition-all duration-200 relative",
              "hover:rounded-[16px]",
              variant === 'default' && "bg-zinc-800 hover:bg-indigo-500 text-zinc-400 hover:text-white",
              variant === 'success' && "bg-zinc-800 hover:bg-emerald-500 text-emerald-500 hover:text-white",
              variant === 'danger' && "bg-zinc-800 hover:bg-red-500 text-red-500 hover:text-white"
            )}
          >
            <Icon className="w-5 h-5" />
            {badge && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {badge}
              </span>
            )}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-zinc-900 border-zinc-800 text-white">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function Sidebar({ 
  servers = [], 
  activeServerId, 
  onServerSelect, 
  onDMsClick,
  onDiscoverClick,
  onCreateServer,
  onSettingsClick,
  onProfileClick,
  isDMsActive,
  unreadDMs = 0,
  notifications = 0,
  userProfile
}) {
  return (
    <div className="w-[72px] h-full bg-[#0a0a0b] flex flex-col items-center py-3 gap-2">
      {/* DMs Button */}
      <div className="relative">
        <ActionButton 
          icon={MessageCircle} 
          label="Direct Messages" 
          onClick={onDMsClick}
          badge={unreadDMs > 0 ? (unreadDMs > 9 ? '9+' : unreadDMs) : null}
        />
        {isDMsActive && (
          <motion.div
            layoutId="active-indicator"
            className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-9 bg-white rounded-r-full"
          />
        )}
      </div>

      {/* Divider */}
      <div className="w-8 h-0.5 bg-zinc-800 rounded-full my-1" />

      {/* Servers */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-none flex flex-col items-center gap-2 py-1">
        {servers.map((server) => (
          <ServerIcon
            key={server.id}
            server={server}
            isActive={activeServerId === server.id}
            onClick={() => onServerSelect(server)}
          />
        ))}

        {/* Add Server */}
        <ActionButton 
          icon={Plus} 
          label="Create Server" 
          variant="success"
          onClick={onCreateServer}
        />

        {/* Discover */}
        <ActionButton 
          icon={Compass} 
          label="Explore Servers" 
          onClick={onDiscoverClick}
        />
      </div>

      {/* Divider */}
      <div className="w-8 h-0.5 bg-zinc-800 rounded-full my-1" />

      {/* Bottom actions */}
      <ActionButton 
        icon={Bell} 
        label="Notifications" 
        badge={notifications > 0 ? (notifications > 9 ? '9+' : notifications) : null}
      />
      
      <ActionButton 
        icon={Settings} 
        label="Settings" 
        onClick={onSettingsClick}
      />

      {/* User Avatar */}
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onProfileClick}
              className="w-12 h-12 rounded-full bg-zinc-800 overflow-hidden relative group"
            >
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              {/* Status indicator */}
              <div className={cn(
                "absolute bottom-0 right-0 w-4 h-4 rounded-full border-[3px] border-[#0a0a0b]",
                userProfile?.status === 'online' && "bg-emerald-500",
                userProfile?.status === 'idle' && "bg-amber-500",
                userProfile?.status === 'dnd' && "bg-red-500",
                userProfile?.status === 'invisible' && "bg-zinc-500",
                (!userProfile?.status || userProfile?.status === 'offline') && "bg-zinc-600"
              )} />
            </motion.button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-zinc-900 border-zinc-800 text-white">
            {userProfile?.display_name || 'Profile'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}