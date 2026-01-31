import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hash, Volume2, ChevronDown, ChevronRight, Plus, 
  Settings, UserPlus, Lock, Radio, Video, Bell, BellOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Panel, PanelHeader, PanelContent, PanelFooter } from './AppShell';
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
  announcement: Bell,
  stage: Radio,
  video: Video,
};

function ChannelItem({ channel, isActive, onClick, voiceUsers = [] }) {
  const Icon = channelIcons[channel.type] || Hash;
  const isVoice = channel.type === 'voice' || channel.type === 'stage';
  
  return (
    <div>
      <button
        onClick={onClick}
        className={cn(
          'w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors group',
          isActive 
            ? 'bg-white/[0.08] text-white' 
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
        )}
      >
        <Icon className="w-4 h-4 flex-shrink-0 opacity-60" />
        <span className="flex-1 text-sm truncate text-left">{channel.name}</span>
        {channel.is_private && <Lock className="w-3 h-3 opacity-40" />}
        
        {/* Voice user count */}
        {isVoice && voiceUsers.length > 0 && (
          <span className="text-xs text-zinc-500">{voiceUsers.length}</span>
        )}
      </button>
      
      {/* Voice users in channel */}
      {isVoice && voiceUsers.length > 0 && (
        <div className="ml-6 mt-1 space-y-0.5">
          {voiceUsers.slice(0, 5).map((user) => (
            <div key={user.id} className="flex items-center gap-2 px-2 py-1">
              <div className="w-5 h-5 rounded-full bg-zinc-700 overflow-hidden">
                {user.user_avatar && (
                  <img src={user.user_avatar} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <span className="text-xs text-zinc-500 truncate">{user.user_name}</span>
            </div>
          ))}
          {voiceUsers.length > 5 && (
            <span className="text-xs text-zinc-600 px-2">+{voiceUsers.length - 5} more</span>
          )}
        </div>
      )}
    </div>
  );
}

function CategorySection({ category, channels, activeChannelId, onChannelClick, onCreateChannel, voiceStates = [] }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const categoryChannels = channels.filter(c => c.category_id === category.id);
  
  if (categoryChannels.length === 0) return null;
  
  return (
    <div className="mb-2">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider hover:text-zinc-300 group"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
        <span className="flex-1 text-left truncate">{category.name}</span>
        <Plus 
          className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity hover:text-white"
          onClick={(e) => { e.stopPropagation(); onCreateChannel?.(category.id); }}
        />
      </button>
      
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-0.5 overflow-hidden"
          >
            {categoryChannels.map((channel) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                isActive={activeChannelId === channel.id}
                onClick={() => onChannelClick(channel)}
                voiceUsers={voiceStates.filter(v => v.channel_id === channel.id)}
              />
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
    <Panel width={240}>
      {/* Server header */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <PanelHeader className="cursor-pointer hover:bg-white/[0.04] transition-colors">
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-white text-sm truncate">{server?.name || 'Server'}</h2>
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          </PanelHeader>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-[#111113] border-white/[0.08]">
          <DropdownMenuItem onClick={onInvite} className="text-indigo-400 focus:text-indigo-300 focus:bg-indigo-500/10">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite People
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/[0.06]" />
          <DropdownMenuItem onClick={onServerSettings} className="text-zinc-300 focus:text-white focus:bg-white/[0.06]">
            <Settings className="w-4 h-4 mr-2" />
            Server Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCreateChannel?.(null)} className="text-zinc-300 focus:text-white focus:bg-white/[0.06]">
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
            {uncategorizedChannels.map((channel) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                isActive={activeChannelId === channel.id}
                onClick={() => onChannelClick(channel)}
                voiceUsers={voiceStates.filter(v => v.channel_id === channel.id)}
              />
            ))}
          </div>
        )}
        
        {/* Categorized channels */}
        {categories
          .sort((a, b) => (a.position || 0) - (b.position || 0))
          .map((category) => (
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
      </PanelContent>
    </Panel>
  );
}