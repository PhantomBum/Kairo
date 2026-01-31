import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hash, Volume2, Megaphone, MessageSquare, Radio,
  ChevronDown, Settings, UserPlus, Plus, Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Tooltip from '../ui/Tooltip';

const channelIcons = {
  text: Hash,
  voice: Volume2,
  announcement: Megaphone,
  forum: MessageSquare,
  stage: Radio,
};

function ChannelItem({ channel, isActive, onClick, voiceUsers = [] }) {
  const Icon = channelIcons[channel.type] || Hash;
  const isVoice = channel.type === 'voice' || channel.type === 'stage';

  return (
    <div>
      <button
        onClick={onClick}
        className={cn(
          'w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md transition-colors text-left group',
          isActive 
            ? 'bg-white/[0.08] text-white' 
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
        )}
      >
        <Icon className="w-4 h-4 flex-shrink-0 text-zinc-500" />
        <span className="flex-1 text-sm truncate">{channel.name}</span>
        {channel.is_private && <Lock className="w-3 h-3 text-zinc-600" />}
      </button>
      
      {/* Voice channel users */}
      {isVoice && voiceUsers.length > 0 && (
        <div className="ml-6 mt-1 space-y-0.5">
          {voiceUsers.map((user) => (
            <div key={user.id} className="flex items-center gap-2 px-2 py-1 text-xs text-zinc-500">
              <div className="w-5 h-5 rounded-full bg-zinc-700" />
              <span className="truncate">{user.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CategorySection({ category, channels, activeChannelId, onChannelClick, voiceStates }) {
  const [isOpen, setIsOpen] = useState(true);
  const categoryChannels = channels.filter(c => c.category_id === category.id);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-1 px-0.5 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider hover:text-zinc-300 transition-colors"
      >
        <ChevronDown className={cn('w-3 h-3 transition-transform', !isOpen && '-rotate-90')} />
        <span className="truncate">{category.name}</span>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden space-y-0.5"
          >
            {categoryChannels
              .sort((a, b) => (a.position || 0) - (b.position || 0))
              .map((channel) => (
                <ChannelItem
                  key={channel.id}
                  channel={channel}
                  isActive={activeChannelId === channel.id}
                  onClick={() => onChannelClick(channel)}
                  voiceUsers={voiceStates?.filter(v => v.channel_id === channel.id) || []}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChannelSidebar({
  server,
  categories = [],
  channels = [],
  activeChannelId,
  onChannelClick,
  onServerSettings,
  onInvite,
  voiceStates = [],
}) {
  // Channels without category
  const uncategorizedChannels = channels.filter(c => !c.category_id);

  return (
    <div className="w-60 h-full bg-[#0f0f10] flex flex-col">
      {/* Server header */}
      <button
        onClick={onServerSettings}
        className="h-12 px-4 flex items-center justify-between border-b border-white/[0.06] hover:bg-white/[0.04] transition-colors"
      >
        <h2 className="font-semibold text-white truncate">{server?.name}</h2>
        <ChevronDown className="w-4 h-4 text-zinc-400" />
      </button>
      
      {/* Channels */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {/* Uncategorized channels */}
        {uncategorizedChannels.length > 0 && (
          <div className="mb-2 space-y-0.5">
            {uncategorizedChannels.map((channel) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                isActive={activeChannelId === channel.id}
                onClick={() => onChannelClick(channel)}
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
              voiceStates={voiceStates}
            />
          ))}
      </div>
      
      {/* Invite button */}
      <div className="p-2 border-t border-white/[0.06]">
        <button
          onClick={onInvite}
          className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Invite People
        </button>
      </div>
    </div>
  );
}