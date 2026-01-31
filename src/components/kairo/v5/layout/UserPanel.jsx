import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Headphones, HeadphoneOff, Settings, LogOut, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import IconButton from '../primitives/IconButton';
import Avatar from '../primitives/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const statusColors = {
  online: 'bg-emerald-500',
  idle: 'bg-amber-500',
  dnd: 'bg-red-500',
  invisible: 'bg-zinc-500',
  offline: 'bg-zinc-500',
};

const statusLabels = {
  online: 'Online',
  idle: 'Idle',
  dnd: 'Do Not Disturb',
  invisible: 'Invisible',
  offline: 'Offline',
};

export default function UserPanel({
  profile,
  isMuted,
  isDeafened,
  onToggleMute,
  onToggleDeafen,
  onOpenSettings,
  onStatusChange,
  onLogout,
  isPremium,
}) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  
  const displayName = profile?.display_name || profile?.username || 'User';
  const username = profile?.username || 'user';
  const status = profile?.status || 'online';
  const customStatus = profile?.custom_status;
  
  return (
    <div className="h-[52px] px-2 flex items-center gap-2 bg-[#0a0a0c]/80 backdrop-blur-xl border-t border-white/[0.04]">
      {/* User info */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 flex-1 min-w-0 p-1.5 rounded-md hover:bg-white/[0.06] transition-colors group">
            <div className="relative flex-shrink-0">
              <Avatar
                src={profile?.avatar_url}
                name={displayName}
                status={status}
                size="sm"
              />
              {isPremium && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center ring-2 ring-[#0a0a0c]">
                  <Sparkles className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] font-medium text-white truncate leading-tight">
                {displayName}
              </p>
              <p className="text-[11px] text-zinc-500 truncate leading-tight">
                {customStatus?.text || `@${username}`}
              </p>
            </div>
          </button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="start" side="top" sideOffset={8} className="w-64 bg-[#111113] border-white/10 p-0">
          {/* User card header */}
          <div className="relative">
            <div 
              className="h-16 rounded-t-md"
              style={{ 
                background: profile?.banner_url 
                  ? `url(${profile.banner_url}) center/cover`
                  : profile?.accent_color || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
              }}
            />
            <div className="absolute -bottom-8 left-3">
              <Avatar
                src={profile?.avatar_url}
                name={displayName}
                size="lg"
                status={status}
                ring
              />
            </div>
          </div>
          
          <div className="pt-10 px-3 pb-3">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-white">{displayName}</h3>
              {isPremium && <Sparkles className="w-4 h-4 text-amber-400" />}
            </div>
            <p className="text-xs text-zinc-400">@{username}</p>
          </div>
          
          <DropdownMenuSeparator className="bg-white/[0.06]" />
          
          <DropdownMenuLabel className="text-[10px] text-zinc-500 uppercase tracking-wider px-3 py-1.5">
            Set Status
          </DropdownMenuLabel>
          
          {Object.entries(statusLabels).map(([key, label]) => (
            <DropdownMenuItem
              key={key}
              onClick={() => onStatusChange?.(key)}
              className="px-3 py-2"
            >
              <div className={cn('w-2.5 h-2.5 rounded-full mr-2', statusColors[key])} />
              <span className={status === key ? 'text-white font-medium' : 'text-zinc-400'}>
                {label}
              </span>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator className="bg-white/[0.06]" />
          
          <DropdownMenuItem onClick={onLogout} className="px-3 py-2 text-red-400 focus:text-red-300 focus:bg-red-500/10">
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Audio controls */}
      <div className="flex items-center gap-0.5">
        <IconButton
          icon={isMuted ? MicOff : Mic}
          tooltip={isMuted ? "Unmute" : "Mute"}
          onClick={onToggleMute}
          variant={isMuted ? "danger" : "ghost"}
          size="sm"
        />
        
        <IconButton
          icon={isDeafened ? HeadphoneOff : Headphones}
          tooltip={isDeafened ? "Undeafen" : "Deafen"}
          onClick={onToggleDeafen}
          variant={isDeafened ? "danger" : "ghost"}
          size="sm"
        />
        
        <IconButton
          icon={Settings}
          tooltip="User Settings"
          onClick={onOpenSettings}
          size="sm"
        />
      </div>
    </div>
  );
}