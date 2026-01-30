import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hash, Volume2, ChevronDown, ChevronRight, Plus, Settings,
  Video, Megaphone, MessagesSquare, ImageIcon, Lock, Users,
  MoreHorizontal, Edit, Trash2, Bell, BellOff, Copy, UserPlus,
  FolderPlus, Code, Webhook, Search, Link2
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
          <button
            onClick={() => onClick(channel)}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all group text-left",
              isActive 
                ? "bg-zinc-800/80 text-white" 
                : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40"
            )}
          >
            <Icon className={cn(
              "w-[18px] h-[18px] flex-shrink-0",
              isActive ? "text-violet-400" : "text-zinc-500 group-hover:text-zinc-400"
            )} />
            
            <span className="flex-1 truncate text-[13px] font-medium">
              {channel.name}
            </span>

            {channel.is_private && (
              <Lock className="w-3 h-3 text-zinc-600" />
            )}
          </button>

          {/* Voice users in channel */}
          {isVoice && voiceUsers.length > 0 && (
            <div className="ml-8 mt-1 space-y-0.5 pb-1">
              {voiceUsers.map((user) => (
                <div 
                  key={user.user_id}
                  className="flex items-center gap-2 px-2 py-1.5 text-xs text-zinc-400 rounded-lg hover:bg-zinc-800/30"
                >
                  <div className="w-5 h-5 rounded-lg bg-zinc-700 overflow-hidden">
                    {user.user_avatar ? (
                      <img src={user.user_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px]">
                        {user.user_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="truncate">{user.user_name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-zinc-900/95 backdrop-blur-xl border-zinc-800/80 rounded-xl">
        <ContextMenuItem 
          onClick={() => window.dispatchEvent(new CustomEvent('kairo:edit-channel', { detail: channel }))}
          className="text-zinc-300 focus:bg-zinc-800 rounded-lg mx-1"
        >
          <Edit className="w-4 h-4 mr-2 text-zinc-500" />
          Edit Channel
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/channel/${channel.id}`)}
          className="text-zinc-300 focus:bg-zinc-800 rounded-lg mx-1"
        >
          <Copy className="w-4 h-4 mr-2 text-zinc-500" />
          Copy Link
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-zinc-800/50 my-1" />
        <ContextMenuItem 
          onClick={() => window.dispatchEvent(new CustomEvent('kairo:delete-channel', { detail: channel }))}
          className="text-rose-400 focus:bg-rose-500/10 rounded-lg mx-1"
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
    <div className="w-64 h-full bg-zinc-900/50 flex flex-col border-r border-zinc-800/30">
      {/* Server Banner */}
      {server?.banner_url && (
        <div className="relative h-24 w-full">
          <img 
            src={server.banner_url} 
            alt="" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/50 to-zinc-900/95" />
        </div>
      )}
      
      {/* Server header */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {server?.icon_url ? (
                <img src={server.icon_url} alt="" className="w-10 h-10 rounded-xl flex-shrink-0 shadow-lg" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold">{server?.name?.charAt(0)}</span>
                </div>
              )}
              <div className="min-w-0">
                <h2 className="font-semibold text-white truncate text-[15px]">{server?.name || 'Server'}</h2>
                <p className="text-xs text-zinc-500">{server?.member_count || 0} members</p>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-zinc-900/95 backdrop-blur-xl border-zinc-800/80 rounded-xl p-1" align="start">
          <DropdownMenuItem onClick={onInvite} className="text-violet-400 focus:bg-violet-500/10 rounded-lg">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite People
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800/50 my-1" />
          <DropdownMenuItem onClick={onServerSettings} className="text-zinc-300 focus:bg-zinc-800 rounded-lg">
            <Settings className="w-4 h-4 mr-2 text-zinc-500" />
            Server Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCreateChannel?.()} className="text-zinc-300 focus:bg-zinc-800 rounded-lg">
            <Plus className="w-4 h-4 mr-2 text-zinc-500" />
            Create Channel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.dispatchEvent(new CustomEvent('kairo:show-apps'))} className="text-zinc-300 focus:bg-zinc-800 rounded-lg">
            <Code className="w-4 h-4 mr-2 text-zinc-500" />
            App Marketplace
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800/50 my-1" />
          <DropdownMenuItem 
            onClick={() => window.dispatchEvent(new CustomEvent('kairo:leave-server', { detail: server }))}
            className="text-rose-400 focus:bg-rose-500/10 rounded-lg"
          >
            Leave Server
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Search */}
      <div className="px-3 pb-3">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('kairo:open-search'))}
          className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Search channels</span>
        </button>
      </div>

      {/* Channels list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4">
        {/* Uncategorized channels */}
        <div className="space-y-0.5">
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