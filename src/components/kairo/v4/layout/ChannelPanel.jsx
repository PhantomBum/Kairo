import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hash, Volume2, ChevronDown, ChevronRight, Plus, 
  Settings, UserPlus, Lock, Radio, Video, Bell,
  MessageSquare, Clock, Crown, Sparkles, Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Panel, PanelHeader, PanelContent } from './AppShell';
import IconButton from '../primitives/IconButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const channelIcons = {
  text: Hash,
  voice: Volume2,
  announcement: Bell,
  stage: Radio,
  video: Video,
  forum: MessageSquare,
};

function ChannelItem({ channel, isActive, onClick, voiceUsers = [] }) {
  const Icon = channelIcons[channel.type] || Hash;
  const isVoice = channel.type === 'voice' || channel.type === 'stage';
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div>
      <TooltipProvider delayDuration={0}>
        <motion.button
          onClick={onClick}
          className={cn(
            'relative w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-all group',
            isActive 
              ? 'text-white' 
              : 'text-zinc-400 hover:text-zinc-200'
          )}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Active/hover background */}
          <motion.div
            className={cn(
              'absolute inset-0 rounded-xl',
              isActive 
                ? 'bg-gradient-to-r from-white/[0.1] to-white/[0.04]' 
                : 'bg-white/[0.04]'
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: isActive || isHovered ? 1 : 0 }}
            transition={{ duration: 0.15 }}
          />
          
          {/* Active indicator */}
          {isActive && (
            <motion.div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-r-full"
              layoutId="activeChannel"
            />
          )}
          
          <div className={cn(
            'relative w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors',
            isActive 
              ? 'bg-gradient-to-br from-indigo-500/30 to-purple-500/30' 
              : 'bg-white/[0.04] group-hover:bg-white/[0.08]'
          )}>
            <Icon className={cn(
              'w-4 h-4 transition-colors',
              isActive ? 'text-indigo-300' : 'opacity-70'
            )} />
          </div>
          
          <span className="relative flex-1 text-sm font-medium truncate text-left">{channel.name}</span>
          
          {/* Channel indicators */}
          <div className="relative flex items-center gap-1.5">
            {channel.is_private && (
              <Lock className="w-3 h-3 text-zinc-500" />
            )}
            
            {channel.is_nsfw && (
              <Tooltip>
                <TooltipTrigger>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold bg-gradient-to-r from-red-500/30 to-pink-500/30 text-red-300 rounded-md border border-red-500/20">
                    18+
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[#18181b]/95 backdrop-blur-xl border-white/[0.1]">
                  <span className="text-xs">Age-Restricted Channel</span>
                </TooltipContent>
              </Tooltip>
            )}
            
            {channel.slow_mode_seconds > 0 && (
              <Tooltip>
                <TooltipTrigger>
                  <Clock className="w-3 h-3 text-amber-400/70" />
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[#18181b]/95 backdrop-blur-xl border-white/[0.1]">
                  <span className="text-xs">Slow mode: {channel.slow_mode_seconds}s</span>
                </TooltipContent>
              </Tooltip>
            )}
            
            {/* Voice user count */}
            {isVoice && voiceUsers.length > 0 && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <Users className="w-3 h-3" />
                {voiceUsers.length}
              </span>
            )}
          </div>
        </motion.button>
      </TooltipProvider>
      
      {/* Voice users in channel */}
      <AnimatePresence>
        {isVoice && voiceUsers.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="ml-8 mt-1 space-y-1 overflow-hidden"
          >
            {voiceUsers.slice(0, 5).map((user) => (
              <motion.div 
                key={user.id} 
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/[0.02]"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 overflow-hidden ring-2 ring-emerald-500/30">
                  {user.user_avatar && (
                    <img src={user.user_avatar} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <span className="text-xs text-zinc-400 truncate">{user.user_name}</span>
                {user.is_muted && <Volume2 className="w-3 h-3 text-red-400 line-through" />}
              </motion.div>
            ))}
            {voiceUsers.length > 5 && (
              <span className="text-[11px] text-zinc-600 px-2">+{voiceUsers.length - 5} more</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategorySection({ category, channels, activeChannelId, onChannelClick, onCreateChannel, voiceStates = [] }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const categoryChannels = channels.filter(c => c.category_id === category.id);
  
  if (categoryChannels.length === 0) return null;
  
  return (
    <div className="mb-3">
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider hover:text-zinc-300 group rounded-lg hover:bg-white/[0.02] transition-colors"
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          animate={{ rotate: isCollapsed ? -90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3 h-3" />
        </motion.div>
        <span className="flex-1 text-left truncate">{category.name}</span>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ opacity: 1, scale: 1 }}
          className="opacity-0 group-hover:opacity-100"
        >
          <Plus 
            className="w-4 h-4 text-zinc-500 hover:text-white p-0.5 hover:bg-white/[0.1] rounded transition-colors"
            onClick={(e) => { e.stopPropagation(); onCreateChannel?.(category.id); }}
          />
        </motion.div>
      </motion.button>
      
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-0.5 overflow-hidden mt-1"
          >
            {categoryChannels.map((channel, i) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <ChannelItem
                  channel={channel}
                  isActive={activeChannelId === channel.id}
                  onClick={() => onChannelClick(channel)}
                  voiceUsers={voiceStates.filter(v => v.channel_id === channel.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChannelPanel({
  server,
  categories = [],
  channels = [],
  activeChannelId,
  onChannelClick,
  onServerSettings,
  onCreateChannel,
  onInvite,
  voiceStates = [],
}) {
  const uncategorizedChannels = channels.filter(c => !c.category_id);
  
  return (
    <Panel width={260}>
      {/* Server header with premium styling */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <PanelHeader className="cursor-pointer hover:bg-white/[0.04] transition-all group relative overflow-hidden">
            {/* Banner gradient */}
            {server?.banner_url ? (
              <div className="absolute inset-0 opacity-30">
                <img src={server.banner_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0c0c0e] via-transparent to-[#0c0c0e]" />
              </div>
            ) : (
              <div 
                className="absolute inset-0 opacity-20" 
                style={{ background: `linear-gradient(135deg, ${server?.banner_color || '#5865F2'}40, transparent)` }} 
              />
            )}
            
            <div className="relative flex items-center gap-3 flex-1 min-w-0">
              {server?.icon_url ? (
                <img src={server.icon_url} alt="" className="w-8 h-8 rounded-xl object-cover ring-2 ring-white/[0.1]" />
              ) : (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm">
                  {server?.name?.charAt(0) || '?'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-semibold text-white text-sm truncate">{server?.name || 'Server'}</h2>
                  {server?.features?.includes('verified') && (
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  )}
                </div>
                {server?.member_count && (
                  <p className="text-[10px] text-zinc-500">{server.member_count} members</p>
                )}
              </div>
            </div>
            <motion.div
              animate={{ rotate: 0 }}
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </motion.div>
          </PanelHeader>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-[#18181b]/95 backdrop-blur-xl border-white/[0.1] shadow-xl">
          <DropdownMenuItem onClick={onInvite} className="text-indigo-400 focus:text-indigo-300 focus:bg-indigo-500/10">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite People
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/[0.08]" />
          <DropdownMenuItem onClick={onServerSettings} className="text-zinc-300 focus:text-white focus:bg-white/[0.08]">
            <Settings className="w-4 h-4 mr-2" />
            Server Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCreateChannel?.(null)} className="text-zinc-300 focus:text-white focus:bg-white/[0.08]">
            <Plus className="w-4 h-4 mr-2" />
            Create Channel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Channel list */}
      <PanelContent className="px-2 py-3">
        {/* Uncategorized channels */}
        {uncategorizedChannels.length > 0 && (
          <div className="mb-4 space-y-0.5">
            {uncategorizedChannels.map((channel, i) => (
              <motion.div
                key={channel.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <ChannelItem
                  channel={channel}
                  isActive={activeChannelId === channel.id}
                  onClick={() => onChannelClick(channel)}
                  voiceUsers={voiceStates.filter(v => v.channel_id === channel.id)}
                />
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Categorized channels */}
        {categories
          .sort((a, b) => (a.position || 0) - (b.position || 0))
          .map((category, i) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <CategorySection
                category={category}
                channels={channels}
                activeChannelId={activeChannelId}
                onChannelClick={onChannelClick}
                onCreateChannel={onCreateChannel}
                voiceStates={voiceStates}
              />
            </motion.div>
          ))}
      </PanelContent>
    </Panel>
  );
}