import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hash, Volume2, Megaphone, Users, ChevronDown, ChevronRight,
  Settings, UserPlus, Lock, Video, MessageSquare, Sparkles, Podcast
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

const channelIcons = {
  text: Hash,
  voice: Volume2,
  announcement: Megaphone,
  stage: Podcast,
  forum: MessageSquare,
};

function ChannelItem({ channel, isActive, onClick, voiceUsers = [], isNSFW }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = channelIcons[channel.type] || Hash;
  const isVoice = channel.type === 'voice' || channel.type === 'stage';
  
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'group w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors',
        isActive 
          ? 'bg-white/[0.08] text-white' 
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
      )}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileTap={{ scale: 0.98 }}
    >
      {channel.is_private ? (
        <Lock className="w-4 h-4 flex-shrink-0 text-zinc-500" />
      ) : (
        <Icon className={cn(
          'w-4 h-4 flex-shrink-0 transition-colors',
          isActive ? 'text-white' : 'text-zinc-500'
        )} />
      )}
      
      <span className={cn(
        'flex-1 truncate text-[13px] font-medium',
        channel.unread && !isActive && 'text-white font-semibold'
      )}>
        {channel.name}
      </span>
      
      {isNSFW && (
        <span className="px-1 py-0.5 text-[9px] font-bold bg-red-500/20 text-red-400 rounded">
          18+
        </span>
      )}
      
      {channel.unread && !isActive && (
        <div className="w-2 h-2 rounded-full bg-white" />
      )}
      
      {/* Voice channel users */}
      {isVoice && voiceUsers.length > 0 && (
        <div className="flex -space-x-1">
          {voiceUsers.slice(0, 3).map((user, i) => (
            <div 
              key={user.id || i}
              className="w-5 h-5 rounded-full bg-zinc-700 border-2 border-[#0a0a0c] overflow-hidden"
            >
              {user.avatar && <img src={user.avatar} alt="" className="w-full h-full object-cover" />}
            </div>
          ))}
          {voiceUsers.length > 3 && (
            <div className="w-5 h-5 rounded-full bg-zinc-800 border-2 border-[#0a0a0c] flex items-center justify-center">
              <span className="text-[8px] font-bold text-zinc-400">+{voiceUsers.length - 3}</span>
            </div>
          )}
        </div>
      )}
      
      {/* Hover actions */}
      <AnimatePresence>
        {isHovered && !isVoice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-0.5"
          >
            <div className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/[0.08] text-zinc-500 hover:text-zinc-300">
              <UserPlus className="w-3 h-3" />
            </div>
            <div className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/[0.08] text-zinc-500 hover:text-zinc-300">
              <Settings className="w-3 h-3" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function Category({ category, channels, activeChannelId, onChannelClick, voiceStates = [] }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const categoryChannels = channels.filter(c => c.category_id === category?.id);
  
  return (
    <div className="mb-2">
      {category && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-1 px-1 py-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-300 uppercase tracking-wider"
        >
          <motion.div
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.15 }}
          >
            <ChevronDown className="w-3 h-3" />
          </motion.div>
          {category.name}
        </button>
      )}
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 pl-1">
              {categoryChannels.map(channel => {
                const voiceUsers = voiceStates
                  .filter(vs => vs.channel_id === channel.id)
                  .map(vs => ({ id: vs.user_id, avatar: vs.user_avatar }));
                
                return (
                  <ChannelItem
                    key={channel.id}
                    channel={channel}
                    isActive={activeChannelId === channel.id}
                    onClick={() => onChannelClick(channel)}
                    voiceUsers={voiceUsers}
                    isNSFW={channel.is_nsfw}
                  />
                );
              })}
            </div>
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
  onInvite,
  voiceStates = [],
}) {
  if (!server) return null;
  
  // Channels without category
  const uncategorizedChannels = channels.filter(c => !c.category_id);
  
  return (
    <Panel width={240} variant="default">
      {/* Server header */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full h-12 px-4 flex items-center justify-between hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <h2 className="font-semibold text-white truncate text-[15px]">
                {server.name}
              </h2>
              {server.features?.includes('verified') && (
                <Sparkles className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-[#111113] border-white/10">
          <DropdownMenuItem onClick={onInvite} className="text-indigo-400 focus:text-indigo-300">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite People
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/[0.06]" />
          <DropdownMenuItem onClick={onServerSettings}>
            <Settings className="w-4 h-4 mr-2" />
            Server Settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Server banner if exists */}
      {server.banner_url && (
        <div className="relative h-24 mx-2 rounded-lg overflow-hidden mb-2">
          <img src={server.banner_url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}
      
      {/* Channel list */}
      <PanelContent padding={false} className="px-2 py-2">
        {/* Uncategorized channels */}
        {uncategorizedChannels.length > 0 && (
          <div className="mb-2 space-y-0.5">
            {uncategorizedChannels.map(channel => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                isActive={activeChannelId === channel.id}
                onClick={() => onChannelClick(channel)}
                isNSFW={channel.is_nsfw}
              />
            ))}
          </div>
        )}
        
        {/* Categories with channels */}
        {categories.map(category => (
          <Category
            key={category.id}
            category={category}
            channels={channels}
            activeChannelId={activeChannelId}
            onChannelClick={onChannelClick}
            voiceStates={voiceStates}
          />
        ))}
      </PanelContent>
    </Panel>
  );
}