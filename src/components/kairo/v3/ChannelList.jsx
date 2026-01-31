// Kairo Channel List v3.0 - Clean, minimal channel navigation

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hash, Volume2, ChevronRight, Plus, Settings, UserPlus,
  Video, Megaphone, Lock, Users, ChevronDown, MoreHorizontal,
  Edit, Trash2, Copy, Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Text, Avatar, Divider, IconButton } from '../ui/DesignSystem';
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

const channelIcons = {
  text: Hash,
  voice: Volume2,
  video: Video,
  announcement: Megaphone,
  stage: Users
};

function ChannelItem({ channel, isActive, onClick, voiceUsers = [] }) {
  const Icon = channelIcons[channel.type] || Hash;
  const isVoice = channel.type === 'voice' || channel.type === 'stage';
  
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div>
          <button
            onClick={() => onClick(channel)}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all group text-left",
              isActive 
                ? "bg-white/[0.08] text-white" 
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
            )}
          >
            <Icon className={cn(
              "w-4 h-4 flex-shrink-0 transition-colors",
              isActive ? "text-zinc-300" : "text-zinc-600"
            )} />
            
            <span className="flex-1 text-[13px] truncate font-medium">
              {channel.name}
            </span>

            {channel.is_private && (
              <Lock className="w-3 h-3 text-zinc-600" />
            )}
            
            {isVoice && voiceUsers.length > 0 && (
              <span className="text-[11px] text-zinc-500 font-medium">
                {voiceUsers.length}
              </span>
            )}
          </button>

          {/* Voice users in channel */}
          <AnimatePresence>
            {isVoice && voiceUsers.length > 0 && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="ml-6 mt-0.5 space-y-0.5 pb-1 overflow-hidden"
              >
                {voiceUsers.map((user, idx) => (
                  <div 
                    key={user.user_id || `voice-user-${idx}`}
                    className="flex items-center gap-2 px-2 py-1 text-[11px] text-zinc-500"
                  >
                    <Avatar 
                      src={user.user_avatar} 
                      name={user.user_name} 
                      size="xs" 
                    />
                    <span className="truncate">{user.user_name}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-[#111114] border-white/[0.06] rounded-xl p-1.5">
        <ContextMenuItem className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2 text-sm">
          <Bell className="w-4 h-4 mr-2.5 text-zinc-500" />
          Notifications
        </ContextMenuItem>
        <ContextMenuItem className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2 text-sm">
          <Edit className="w-4 h-4 mr-2.5 text-zinc-500" />
          Edit Channel
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/channel/${channel.id}`)}
          className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2 text-sm"
        >
          <Copy className="w-4 h-4 mr-2.5 text-zinc-500" />
          Copy Link
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/[0.04] my-1" />
        <ContextMenuItem className="text-red-400 focus:bg-red-500/10 rounded-lg px-3 py-2 text-sm">
          <Trash2 className="w-4 h-4 mr-2.5" />
          Delete Channel
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function CategorySection({ category, channels, activeChannelId, onChannelClick, onCreateChannel, voiceStates }) {
  const [isExpanded, setIsExpanded] = useState(!category.is_collapsed);
  const categoryChannels = channels.filter(c => c.category_id === category.id);

  if (categoryChannels.length === 0) return null;

  return (
    <div className="mt-4 first:mt-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1 px-2 w-full group py-1 hover:text-zinc-400 transition-colors"
      >
        <ChevronRight className={cn(
          "w-3 h-3 text-zinc-600 transition-transform",
          isExpanded && "rotate-90"
        )} />
        <Text variant="tiny" color="muted" weight="semibold" className="uppercase tracking-wider flex-1 text-left">
          {category.name}
        </Text>
        <button 
          onClick={(e) => { e.stopPropagation(); onCreateChannel?.(category.id); }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/[0.06] rounded transition-all"
        >
          <Plus className="w-3 h-3 text-zinc-500" />
        </button>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden mt-1 space-y-0.5"
          >
            {categoryChannels.map((channel) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                isActive={activeChannelId === channel.id}
                onClick={onChannelClick}
                voiceUsers={voiceStates?.filter(v => v.channel_id === channel.id) || []}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChannelListV3({ 
  server, 
  categories = [], 
  channels = [], 
  activeChannelId,
  onChannelClick,
  onServerSettings,
  onCreateChannel,
  onInvite,
  voiceStates = []
}) {
  const uncategorizedChannels = channels.filter(c => !c.category_id);

  return (
    <div className="w-60 h-full bg-[#0c0c0e] flex flex-col border-r border-white/[0.04]">
      {/* Server header */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-14 px-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors border-b border-white/[0.04]">
            <Text variant="body" color="primary" weight="semibold" className="truncate">
              {server?.name || 'Server'}
            </Text>
            <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-[#111114] border-white/[0.06] rounded-xl p-1.5" align="start">
          <DropdownMenuItem 
            onClick={onInvite}
            className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2.5"
          >
            <UserPlus className="w-4 h-4 mr-2.5 text-zinc-500" />
            Invite People
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={onServerSettings}
            className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2.5"
          >
            <Settings className="w-4 h-4 mr-2.5 text-zinc-500" />
            Server Settings
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => onCreateChannel?.()}
            className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2.5"
          >
            <Plus className="w-4 h-4 mr-2.5 text-zinc-500" />
            Create Channel
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/[0.04] my-1" />
          <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 rounded-lg px-3 py-2.5">
            Leave Server
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Channels list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-3">
        {/* Uncategorized channels */}
        {uncategorizedChannels.length > 0 && (
          <div className="space-y-0.5 mb-3">
            {uncategorizedChannels.map((channel) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                isActive={activeChannelId === channel.id}
                onClick={onChannelClick}
                voiceUsers={voiceStates?.filter(v => v.channel_id === channel.id) || []}
              />
            ))}
          </div>
        )}

        {/* Categories with channels */}
        {categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            channels={channels}
            activeChannelId={activeChannelId}
            onChannelClick={onChannelClick}
            onCreateChannel={onCreateChannel}
            voiceStates={voiceStates}
          />
        ))}
      </div>
    </div>
  );
}