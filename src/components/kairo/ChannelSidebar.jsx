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
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-2xl transition-all group text-left relative",
              isActive 
                ? "bg-gradient-to-r from-violet-500/15 to-indigo-500/10 text-white" 
                : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50"
            )}
          >
            {isActive && (
              <motion.div 
                layoutId="activeChannelIndicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-violet-400 to-indigo-500 rounded-r-full"
              />
            )}
            <div className={cn(
              "w-7 h-7 rounded-xl flex items-center justify-center transition-all",
              isActive ? "bg-violet-500/20" : "bg-transparent group-hover:bg-zinc-800/50"
            )}>
              <Icon className={cn(
                "w-4 h-4",
                isActive ? "text-violet-400" : "text-zinc-500 group-hover:text-zinc-400"
              )} />
            </div>
            
            <span className="flex-1 truncate text-sm font-medium">
              {channel.name}
            </span>

            {channel.is_private && (
              <Lock className="w-3 h-3 text-zinc-600" />
            )}
            
            {isVoice && voiceUsers.length > 0 && (
              <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full">
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
      <ContextMenuContent className="w-52 bg-zinc-900/95 backdrop-blur-xl border-zinc-800/80 rounded-2xl p-1.5">
        <ContextMenuItem 
          onClick={() => window.dispatchEvent(new CustomEvent('kairo:edit-channel', { detail: channel }))}
          className="text-zinc-300 focus:bg-zinc-800 rounded-xl px-3 py-2"
        >
          <Edit className="w-4 h-4 mr-2.5 text-zinc-500" />
          Edit Channel
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/channel/${channel.id}`)}
          className="text-zinc-300 focus:bg-zinc-800 rounded-xl px-3 py-2"
        >
          <Copy className="w-4 h-4 mr-2.5 text-zinc-500" />
          Copy Link
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-zinc-800/50 my-1" />
        <ContextMenuItem 
          onClick={() => window.dispatchEvent(new CustomEvent('kairo:delete-channel', { detail: channel }))}
          className="text-rose-400 focus:bg-rose-500/10 rounded-xl px-3 py-2"
        >
          <Trash2 className="w-4 h-4 mr-2.5" />
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
    <div className="mt-6 first:mt-2">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-2 px-2 w-full group py-1"
      >
        <ChevronRight className={cn(
          "w-3 h-3 text-zinc-600 transition-transform",
          !isCollapsed && "rotate-90"
        )} />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-400 truncate transition-colors">
          {category.name}
        </span>
        <button 
          onClick={(e) => { e.stopPropagation(); onCreateChannel?.(category.id); }}
          className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 rounded-lg transition-all"
        >
          <Plus className="w-3 h-3 text-zinc-500 hover:text-zinc-300" />
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
    <div className="w-72 h-full bg-gradient-to-b from-zinc-900/70 to-zinc-900/50 flex flex-col border-r border-zinc-800/20 relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/[0.02] to-indigo-500/[0.02] pointer-events-none" />
      
      {/* Server Banner */}
      {server?.banner_url && (
        <div className="relative h-28 w-full">
          <img 
            src={server.banner_url} 
            alt="" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/60 to-zinc-900" />
        </div>
      )}
      
      {/* Server header */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button 
            whileHover={{ backgroundColor: 'rgba(39, 39, 42, 0.5)' }}
            className="relative p-4 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {server?.icon_url ? (
                <img src={server.icon_url} alt="" className="w-12 h-12 rounded-2xl flex-shrink-0 shadow-xl ring-2 ring-zinc-800/50" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-xl ring-2 ring-violet-500/20">
                  <span className="text-white font-bold text-lg">{server?.name?.charAt(0)}</span>
                </div>
              )}
              <div className="min-w-0">
                <h2 className="font-bold text-white truncate text-base">{server?.name || 'Server'}</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                  <p className="text-xs text-zinc-400">{server?.member_count || 0} members</p>
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-60 bg-zinc-900/95 backdrop-blur-xl border-zinc-800/80 rounded-2xl p-1.5" align="start">
          <DropdownMenuItem onClick={onInvite} className="text-violet-400 focus:bg-violet-500/10 rounded-xl px-3 py-2.5">
            <UserPlus className="w-4 h-4 mr-2.5" />
            Invite People
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800/50 my-1" />
          <DropdownMenuItem onClick={onServerSettings} className="text-zinc-300 focus:bg-zinc-800 rounded-xl px-3 py-2.5">
            <Settings className="w-4 h-4 mr-2.5 text-zinc-500" />
            Server Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCreateChannel?.()} className="text-zinc-300 focus:bg-zinc-800 rounded-xl px-3 py-2.5">
            <Plus className="w-4 h-4 mr-2.5 text-zinc-500" />
            Create Channel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.dispatchEvent(new CustomEvent('kairo:show-apps'))} className="text-zinc-300 focus:bg-zinc-800 rounded-xl px-3 py-2.5">
            <Sparkles className="w-4 h-4 mr-2.5 text-zinc-500" />
            App Marketplace
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800/50 my-1" />
          <DropdownMenuItem 
            onClick={() => window.dispatchEvent(new CustomEvent('kairo:leave-server', { detail: server }))}
            className="text-rose-400 focus:bg-rose-500/10 rounded-xl px-3 py-2.5"
          >
            Leave Server
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Search */}
      <div className="relative px-3 pb-4">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => window.dispatchEvent(new CustomEvent('kairo:open-search'))}
          className="w-full flex items-center gap-2.5 px-4 py-2.5 bg-zinc-800/40 hover:bg-zinc-800/60 rounded-2xl text-sm text-zinc-500 hover:text-zinc-300 transition-all border border-zinc-800/30 hover:border-zinc-700/50"
        >
          <Search className="w-4 h-4" />
          <span>Search channels</span>
          <span className="ml-auto text-[10px] bg-zinc-800/80 px-1.5 py-0.5 rounded-md font-medium">⌘F</span>
        </motion.button>
      </div>

      {/* Channels list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4">
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