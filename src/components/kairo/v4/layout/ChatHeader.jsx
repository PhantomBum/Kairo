import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hash, Volume2, Users, Pin, Search, Menu, Phone, Video, Bell, BellOff, MoreVertical, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import IconButton from '../primitives/IconButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ChatHeader({
  channel,
  conversation,
  memberCount,
  showMembers,
  onToggleMembers,
  onShowPinned,
  onShowSearch,
  onMenuToggle,
  onStartCall,
  onStartVideo,
  onMuteChannel,
  onNotificationSettings,
}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const isChannel = !!channel;
  const Icon = isChannel 
    ? (channel.type === 'voice' ? Volume2 : Hash)
    : null;
  
  const name = isChannel 
    ? channel.name 
    : conversation?.name || conversation?.participants?.find(p => p.user_name)?.user_name;
  
  const description = isChannel ? channel.description : null;
  const otherParticipant = conversation?.participants?.[0];

  return (
    <motion.div 
      className="h-14 px-4 flex items-center justify-between border-b border-white/[0.06] bg-gradient-to-r from-[#0c0c0e]/80 to-[#09090b]/80 backdrop-blur-xl flex-shrink-0 relative overflow-hidden"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Subtle glow effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-32 h-full bg-indigo-500/5 blur-2xl" />
      </div>
      
      <div className="relative flex items-center gap-4 min-w-0 flex-1">
        {/* Mobile menu toggle */}
        <IconButton
          icon={Menu}
          size="sm"
          variant="ghost"
          className="md:hidden"
          onClick={onMenuToggle}
        />
        
        {/* Channel/DM info */}
        <div className="flex items-center gap-3 min-w-0">
          {isChannel ? (
            <motion.div 
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/[0.08]"
              whileHover={{ scale: 1.05 }}
            >
              <Icon className="w-4 h-4 text-indigo-300" />
            </motion.div>
          ) : otherParticipant ? (
            <div className="relative">
              <img 
                src={otherParticipant.user_avatar} 
                alt="" 
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-white/[0.08]"
              />
              <div className={cn(
                'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0c0c0e]',
                otherParticipant.status === 'online' ? 'bg-emerald-500' :
                otherParticipant.status === 'idle' ? 'bg-amber-500' :
                otherParticipant.status === 'dnd' ? 'bg-red-500' : 'bg-zinc-500'
              )} />
            </div>
          ) : null}
          
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-white truncate">{name}</h2>
              {channel?.is_nsfw && (
                <span className="px-1.5 py-0.5 text-[9px] font-bold bg-gradient-to-r from-red-500/30 to-pink-500/30 text-red-300 rounded-md">
                  NSFW
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-zinc-500 truncate max-w-xs hidden md:block">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="relative flex items-center gap-1">
        {/* DM call buttons */}
        {!isChannel && (
          <div className="flex items-center gap-1 mr-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <IconButton
                icon={Phone}
                size="sm"
                variant="ghost"
                tooltip="Start Call"
                onClick={onStartCall}
                className="text-emerald-400 hover:bg-emerald-500/10"
              />
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <IconButton
                icon={Video}
                size="sm"
                variant="ghost"
                tooltip="Start Video Call"
                onClick={onStartVideo}
                className="text-indigo-400 hover:bg-indigo-500/10"
              />
            </motion.div>
          </div>
        )}
        
        {/* Divider */}
        <div className="hidden md:block w-px h-6 bg-white/[0.08] mx-1" />
        
        {/* Search with animation */}
        <motion.div
          className="hidden md:flex items-center"
          animate={{ width: isSearchFocused ? 200 : 32 }}
          transition={{ duration: 0.2 }}
        >
          {isSearchFocused ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.06] rounded-lg border border-white/[0.08] w-full">
              <Search className="w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none w-full"
                autoFocus
                onBlur={() => setIsSearchFocused(false)}
              />
            </div>
          ) : (
            <IconButton
              icon={Search}
              size="sm"
              variant="ghost"
              tooltip="Search"
              onClick={() => {
                setIsSearchFocused(true);
                onShowSearch?.();
              }}
            />
          )}
        </motion.div>
        
        {/* Pinned messages */}
        {isChannel && (
          <IconButton
            icon={Pin}
            size="sm"
            variant="ghost"
            tooltip="Pinned Messages"
            onClick={onShowPinned}
          />
        )}
        
        {/* Member toggle */}
        {isChannel && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <IconButton
              icon={Users}
              size="sm"
              variant="ghost"
              tooltip={showMembers ? 'Hide Members' : 'Show Members'}
              onClick={onToggleMembers}
              active={showMembers}
              className={cn(
                "hidden md:flex",
                showMembers && "bg-white/[0.08] text-white"
              )}
            />
          </motion.div>
        )}
        
        {/* More options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-[#18181b]/95 backdrop-blur-xl border-white/[0.1]">
            <DropdownMenuItem onClick={onMuteChannel} className="text-zinc-300 focus:text-white focus:bg-white/[0.08]">
              <BellOff className="w-4 h-4 mr-2" />
              Mute Channel
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onNotificationSettings} className="text-zinc-300 focus:text-white focus:bg-white/[0.08]">
              <Bell className="w-4 h-4 mr-2" />
              Notification Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}