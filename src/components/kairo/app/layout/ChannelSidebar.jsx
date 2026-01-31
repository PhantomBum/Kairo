import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, ChevronRight, Hash, Volume2, Video, Megaphone, 
  Settings, UserPlus, Plus, Lock, Mic, Users, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Tooltip from '../ui/Tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const channelIcons = {
  text: Hash,
  voice: Volume2,
  video: Video,
  announcement: Megaphone,
  forum: Hash,
  stage: Mic,
};

function CategoryHeader({ category, isExpanded, onToggle, onAddChannel }) {
  return (
    <div className="flex items-center group px-2 pt-4 pb-1">
      <button 
        onClick={onToggle}
        className="flex items-center gap-1 flex-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <motion.div animate={{ rotate: isExpanded ? 0 : -90 }} transition={{ duration: 0.15 }}>
          <ChevronDown className="w-3 h-3" />
        </motion.div>
        <span className="truncate">{category?.name || 'Channels'}</span>
      </button>
      <Tooltip content="Create Channel">
        <button 
          onClick={onAddChannel}
          className="w-4 h-4 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </Tooltip>
    </div>
  );
}

function ChannelItem({ channel, isActive, onClick, unreadCount, userCount }) {
  const Icon = channelIcons[channel.type] || Hash;
  const isVoice = channel.type === 'voice' || channel.type === 'stage';

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 2 }}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all group/channel',
        isActive 
          ? 'bg-white/[0.08] text-white' 
          : unreadCount > 0
            ? 'text-white hover:bg-white/[0.04]'
            : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
      )}
    >
      <Icon className={cn('w-4 h-4 flex-shrink-0', channel.is_private && 'text-amber-500')} />
      
      <span className={cn(
        'flex-1 truncate text-sm',
        unreadCount > 0 && !isActive && 'font-semibold'
      )}>
        {channel.name}
      </span>

      {channel.is_private && (
        <Lock className="w-3 h-3 text-zinc-600" />
      )}

      {unreadCount > 0 && !isActive && (
        <div className="w-2 h-2 bg-white rounded-full" />
      )}

      {isVoice && userCount > 0 && (
        <div className="flex items-center gap-1 text-xs text-emerald-400">
          <Users className="w-3 h-3" />
          {userCount}
        </div>
      )}

      {/* Hover actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover/channel:opacity-100 transition-opacity">
        <Tooltip content="Invite">
          <button className="w-4 h-4 rounded flex items-center justify-center text-zinc-500 hover:text-white">
            <UserPlus className="w-3 h-3" />
          </button>
        </Tooltip>
        <Tooltip content="Settings">
          <button className="w-4 h-4 rounded flex items-center justify-center text-zinc-500 hover:text-white">
            <Settings className="w-3 h-3" />
          </button>
        </Tooltip>
      </div>
    </motion.button>
  );
}

function VoiceUser({ user }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 ml-6 text-sm text-zinc-400">
      <div className="relative">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-[10px] font-semibold text-white">
          {user.name?.charAt(0)}
        </div>
        {user.is_speaking && (
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-[#111113]" />
        )}
      </div>
      <span className="truncate">{user.name}</span>
      {user.is_muted && <Mic className="w-3 h-3 text-zinc-600 line-through" />}
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
  voiceUsers = {},
}) {
  const [expandedCategories, setExpandedCategories] = useState(new Set(categories.map(c => c.id)));

  const toggleCategory = (categoryId) => {
    const next = new Set(expandedCategories);
    if (next.has(categoryId)) {
      next.delete(categoryId);
    } else {
      next.add(categoryId);
    }
    setExpandedCategories(next);
  };

  // Group channels by category
  const channelsByCategory = channels.reduce((acc, channel) => {
    const catId = channel.category_id || 'uncategorized';
    if (!acc[catId]) acc[catId] = [];
    acc[catId].push(channel);
    return acc;
  }, {});

  return (
    <div className="w-60 h-full bg-[#111113] flex flex-col border-r border-white/[0.04]">
      {/* Server header */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-12 px-4 flex items-center justify-between border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-white truncate">{server?.name}</span>
              {server?.is_verified && (
                <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Star className="w-2.5 h-2.5 text-white fill-white" />
                </div>
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-[#111113] border-white/[0.08]">
          <DropdownMenuItem onClick={onInvite} className="gap-2 cursor-pointer">
            <UserPlus className="w-4 h-4 text-indigo-400" />
            <span>Invite People</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onServerSettings} className="gap-2 cursor-pointer">
            <Settings className="w-4 h-4" />
            <span>Server Settings</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Boost banner */}
      {server?.boost_level > 0 && (
        <div className="mx-2 mt-2 p-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-6 h-6 rounded-full bg-pink-500/20 flex items-center justify-center">
              <Star className="w-3 h-3 text-pink-400 fill-pink-400" />
            </div>
            <span className="text-pink-300 font-medium">Level {server.boost_level} Boosted</span>
          </div>
        </div>
      )}

      {/* Channels */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2">
        {/* Uncategorized channels first */}
        {channelsByCategory['uncategorized']?.map((channel) => (
          <ChannelItem
            key={channel.id}
            channel={channel}
            isActive={activeChannelId === channel.id}
            onClick={() => onChannelClick(channel)}
            userCount={voiceUsers[channel.id]?.length || 0}
          />
        ))}

        {/* Categorized channels */}
        {categories.map((category) => {
          const categoryChannels = channelsByCategory[category.id] || [];
          const isExpanded = expandedCategories.has(category.id);

          return (
            <div key={category.id}>
              <CategoryHeader
                category={category}
                isExpanded={isExpanded}
                onToggle={() => toggleCategory(category.id)}
                onAddChannel={() => {}}
              />
              
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    {categoryChannels.map((channel) => (
                      <div key={channel.id}>
                        <ChannelItem
                          channel={channel}
                          isActive={activeChannelId === channel.id}
                          onClick={() => onChannelClick(channel)}
                          userCount={voiceUsers[channel.id]?.length || 0}
                        />
                        
                        {/* Voice users in channel */}
                        {(channel.type === 'voice' || channel.type === 'stage') && 
                          voiceUsers[channel.id]?.map((user) => (
                            <VoiceUser key={user.id} user={user} />
                          ))
                        }
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}