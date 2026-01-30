import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hash, Volume2, ChevronDown, ChevronRight, Plus, Settings,
  Video, Megaphone, MessagesSquare, ImageIcon, Lock, Users,
  MoreHorizontal, Edit, Trash2, Bell, BellOff, Copy, UserPlus,
  FolderPlus, Code, Webhook, Search, Link2, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const channelIcons = {
  text: Hash,
  voice: Volume2,
  video: Video,
  announcement: Megaphone,
  forum: MessagesSquare,
  media: ImageIcon,
  stage: Users
};

function ChannelItem({ channel, isActive, onClick, voiceUsers = [] }) {
  const Icon = channelIcons[channel.type] || Hash;
  const isVoice = channel.type === 'voice' || channel.type === 'stage';
  
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div>
          <motion.button
            onClick={() => onClick(channel)}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 rounded transition-all group text-left relative",
              isActive 
                ? "bg-white/10 text-white" 
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            )}
          >
            <Icon className={cn(
              "w-4 h-4 flex-shrink-0",
              isActive ? "text-zinc-300" : "text-zinc-600"
            )} />
            
            <span className="flex-1 truncate text-sm">
              {channel.name}
            </span>

            {channel.is_private && (
              <Lock className="w-3 h-3 text-zinc-600" />
            )}
            
            {isVoice && voiceUsers.length > 0 && (
              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded">
                {voiceUsers.length}
              </span>
            )}
          </motion.button>

          {/* Voice users in channel */}
          <AnimatePresence>
            {isVoice && voiceUsers.length > 0 && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="ml-10 mt-1 space-y-0.5 pb-1 overflow-hidden"
              >
                {voiceUsers.map((user) => (
                  <motion.div 
                    key={user.user_id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 px-2 py-1.5 text-xs text-zinc-400 rounded-xl hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-zinc-700 overflow-hidden ring-2 ring-emerald-500/30">
                      {user.user_avatar ? (
                        <img src={user.user_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] font-medium">
                          {user.user_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="truncate font-medium">{user.user_name}</span>
                    <div className="ml-auto w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-[#0a0a0b] border-white/10 rounded-lg p-1">
        <ContextMenuItem 
          onClick={() => window.dispatchEvent(new CustomEvent('kairo:edit-channel', { detail: channel }))}
          className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 text-sm"
        >
          <Edit className="w-4 h-4 mr-2 text-zinc-500" />
          Edit Channel
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/channel/${channel.id}`)}
          className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 text-sm"
        >
          <Copy className="w-4 h-4 mr-2 text-zinc-500" />
          Copy Link
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/5 my-1" />
        <ContextMenuItem 
          onClick={() => window.dispatchEvent(new CustomEvent('kairo:delete-channel', { detail: channel }))}
          className="text-red-400 focus:bg-red-500/10 rounded px-3 py-2 text-sm"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete Channel
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function CategoryItem({ category, channels, activeChannelId, onChannelClick, onCreateChannel, voiceStates }) {
  const [isCollapsed, setIsCollapsed] = useState(category.is_collapsed || false);
  const categoryChannels = channels.filter(c => c.category_id === category.id);

  return (
    <div className="mt-4 first:mt-2">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-1.5 px-2 w-full group py-1"
      >
        <ChevronRight className={cn(
          "w-2.5 h-2.5 text-zinc-600 transition-transform",
          !isCollapsed && "rotate-90"
        )} />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 group-hover:text-zinc-500 truncate transition-colors">
          {category.name}
        </span>
        <button 
          onClick={(e) => { e.stopPropagation(); onCreateChannel?.(category.id); }}
          className="ml-auto opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/5 rounded transition-all"
        >
          <Plus className="w-3 h-3 text-zinc-600 hover:text-zinc-400" />
        </button>
      </button>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
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

export default function ChannelSidebar({ 
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
    <div className="w-[280px] md:w-72 h-full bg-[#0a0a0b] flex flex-col border-r border-white/5 relative overflow-hidden">
      
      {/* Server Banner - Always show */}
      <div className="relative h-24 w-full flex-shrink-0">
        {server?.banner_url ? (
          <img 
            src={server.banner_url} 
            alt="" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full"
            style={{ 
              background: server?.banner_color 
                ? `linear-gradient(135deg, ${server.banner_color}80, ${server.banner_color}40)`
                : 'linear-gradient(135deg, #3b82f680, #8b5cf640)'
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0b]/60 to-[#0a0a0b]" />
      </div>
      
      {/* Server header */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button 
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
            className="relative px-4 py-3 flex items-center justify-between transition-colors -mt-8"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {server?.icon_url ? (
                <img src={server.icon_url} alt="" className="w-10 h-10 rounded-xl flex-shrink-0 shadow-lg border border-white/10" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shadow-lg border border-white/10">
                  <span className="text-white font-bold text-sm">{server?.name?.charAt(0)}</span>
                </div>
              )}
              <div className="min-w-0">
                <h2 className="font-semibold text-white truncate text-sm">{server?.name || 'Server'}</h2>
                <p className="text-[11px] text-zinc-500">{server?.member_count || 0} members</p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-600 flex-shrink-0" />
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-[#0a0a0b] border-white/10 rounded-lg p-1" align="start">
          <DropdownMenuItem onClick={onInvite} className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 text-sm">
            <UserPlus className="w-4 h-4 mr-2.5 text-zinc-500" />
            Invite People
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/5 my-1" />
          <DropdownMenuItem onClick={onServerSettings} className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 text-sm">
            <Settings className="w-4 h-4 mr-2.5 text-zinc-500" />
            Server Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCreateChannel?.()} className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 text-sm">
            <Plus className="w-4 h-4 mr-2.5 text-zinc-500" />
            Create Channel
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/5 my-1" />
          <DropdownMenuItem 
            onClick={() => window.dispatchEvent(new CustomEvent('kairo:leave-server', { detail: server }))}
            className="text-red-400 focus:bg-red-500/10 rounded px-3 py-2 text-sm"
          >
            Leave Server
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Search */}
      <div className="relative px-3 pb-3">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('kairo:open-search'))}
          className="w-full flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/[0.07] rounded text-xs text-zinc-500 hover:text-zinc-400 transition-all"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
        </button>
      </div>

      {/* Channels list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4 pt-2">
        {/* Uncategorized channels */}
        <div className="space-y-1">
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

        {/* Categories with channels */}
        {categories.map((category) => (
          <CategoryItem
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