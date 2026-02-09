import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Hash, Volume2, Megaphone, Plus, Lock, Settings, UserPlus, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const channelIcons = { text: Hash, voice: Volume2, announcement: Megaphone, forum: Hash, stage: Volume2 };

function CategorySection({ category, channels, activeChannelId, onChannelClick, isExpanded, onToggle }) {
  return (
    <div>
      <button onClick={onToggle} className="flex items-center gap-1 w-full px-1 pt-4 pb-1 group">
        <ChevronDown className={cn('w-3 h-3 text-zinc-600 transition-transform duration-150', !isExpanded && '-rotate-90')} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 group-hover:text-zinc-400 transition-colors truncate">
          {category?.name}
        </span>
        <div className="flex-1" />
        <Plus className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            {channels.map((channel) => {
              const Icon = channelIcons[channel.type] || Hash;
              return (
                <button key={channel.id} onClick={() => onChannelClick(channel)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-[6px] rounded text-sm transition-colors',
                    activeChannelId === channel.id
                      ? 'bg-white/[0.08] text-white font-medium'
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{channel.name}</span>
                  {channel.is_private && <Lock className="w-3 h-3 text-zinc-700 ml-auto" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ChannelSidebar({ server, categories = [], channels = [], activeChannelId, onChannelClick, onServerSettings, onInvite }) {
  const [expandedCats, setExpandedCats] = useState(() => new Set(categories.map(c => c.id)));

  const toggleCat = (id) => {
    const next = new Set(expandedCats);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedCats(next);
  };

  const channelsByCat = channels.reduce((acc, ch) => {
    const catId = ch.category_id || 'uncategorized';
    (acc[catId] = acc[catId] || []).push(ch);
    return acc;
  }, {});

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Server header with banner area */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="relative h-12 px-4 flex items-center justify-between hover:bg-white/[0.03] transition-colors text-left">
            <span className="font-semibold text-white text-[15px] truncate">{server?.name}</span>
            <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 bg-[#1a1a1a] border-white/[0.08]">
          <DropdownMenuItem onClick={onInvite} className="gap-2 cursor-pointer text-indigo-400">
            <UserPlus className="w-4 h-4" /> Invite People
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/[0.06]" />
          <DropdownMenuItem onClick={onServerSettings} className="gap-2 cursor-pointer">
            <Settings className="w-4 h-4" /> Server Settings
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2 cursor-pointer">
            <Star className="w-4 h-4" /> Boost Server
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-2">
        {channelsByCat['uncategorized']?.map((ch) => {
          const Icon = channelIcons[ch.type] || Hash;
          return (
            <button key={ch.id} onClick={() => onChannelClick(ch)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-[6px] rounded text-sm transition-colors',
                activeChannelId === ch.id ? 'bg-white/[0.08] text-white font-medium' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{ch.name}</span>
            </button>
          );
        })}

        {categories.map((cat) => (
          <CategorySection key={cat.id} category={cat} channels={channelsByCat[cat.id] || []}
            activeChannelId={activeChannelId} onChannelClick={onChannelClick}
            isExpanded={expandedCats.has(cat.id)} onToggle={() => toggleCat(cat.id)} />
        ))}
      </div>
    </div>
  );
}