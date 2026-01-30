import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hash, Volume2, ChevronDown, ChevronRight, Plus, Settings,
  Video, Megaphone, MessagesSquare, ImageIcon, Lock, Users,
  MoreHorizontal, Edit, Trash2, Bell, BellOff, Copy, UserPlus,
  FolderPlus, Code, Webhook
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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

function ChannelItem({ channel, isActive, onClick, onContextAction, voiceUsers = [] }) {
  const Icon = channelIcons[channel.type] || Hash;
  const isVoice = channel.type === 'voice' || channel.type === 'stage';
  
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.div
          whileHover={{ x: 2 }}
          onClick={() => onClick(channel)}
          className={cn(
            "group flex items-center gap-2 px-2 py-1.5 mx-2 rounded-md cursor-pointer transition-all",
            isActive ? "bg-zinc-800/70 text-white" : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40"
          )}
        >
          <Icon className={cn(
            "w-[18px] h-[18px] flex-shrink-0",
            channel.is_private && "text-zinc-600"
          )} />
          
          <span className="flex-1 truncate text-[14px] font-medium">
            {channel.name}
          </span>

          {channel.is_private && (
            <Lock className="w-3 h-3 text-zinc-600" />
          )}
        </motion.div>

        {/* Voice users in channel */}
        {isVoice && voiceUsers.length > 0 && (
          <div className="ml-7 space-y-0.5 pb-1">
            {voiceUsers.map((user) => (
              <div 
                key={user.user_id}
                className="flex items-center gap-2 px-2 py-1 text-xs text-zinc-400"
              >
                <div className="w-5 h-5 rounded-full bg-zinc-700 overflow-hidden">
                  {user.user_avatar ? (
                    <img src={user.user_avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px]">
                      {user.user_name?.charAt(0)}
                    </div>
                  )}
                </div>
                <span className="truncate">{user.user_name}</span>
                {user.is_self_muted && <Volume2 className="w-3 h-3 text-red-400" />}
              </div>
            ))}
          </div>
        )}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-zinc-900 border-zinc-800">
        <ContextMenuItem className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white">
          <Edit className="w-4 h-4 mr-2" />
          Edit Channel
        </ContextMenuItem>
        <ContextMenuItem className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white">
          <Copy className="w-4 h-4 mr-2" />
          Copy Link
        </ContextMenuItem>
        <ContextMenuItem className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white">
          <Bell className="w-4 h-4 mr-2" />
          Notification Settings
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-zinc-800" />
        <ContextMenuItem className="text-red-400 focus:bg-red-500/20 focus:text-red-400">
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
    <div className="mt-5 first:mt-3">
      <ContextMenu>
        <ContextMenuTrigger>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1.5 px-2 w-full group py-1"
          >
            <ChevronRight className={cn(
              "w-3 h-3 text-zinc-600 transition-transform",
              !isCollapsed && "rotate-90"
            )} />
            <span className="text-[11px] font-bold uppercase tracking-wide text-zinc-600 group-hover:text-zinc-400 truncate transition-colors">
              {category.name}
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); onCreateChannel?.(category.id); }}
              className="ml-auto opacity-0 group-hover:opacity-100 p-0.5 hover:bg-zinc-800 rounded"
            >
              <Plus className="w-3.5 h-3.5 text-zinc-600 hover:text-zinc-400" />
            </button>
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48 bg-zinc-900 border-zinc-800">
          <ContextMenuItem className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white">
            <Edit className="w-4 h-4 mr-2" />
            Edit Category
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={() => onCreateChannel?.(category.id)}
            className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Channel
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-zinc-800" />
          <ContextMenuItem className="text-red-400 focus:bg-red-500/20 focus:text-red-400">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Category
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
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
    <div className="w-60 h-full bg-[#0f0f11] flex flex-col border-r border-zinc-800/30">
      {/* Server Banner */}
      {server?.banner_url && (
        <div className="relative h-20 w-full">
          <img 
            src={server.banner_url} 
            alt="" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f0f11]/50 to-[#0f0f11]" />
        </div>
      )}
      
      {/* Server header */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-14 px-4 flex items-center justify-between border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {server?.icon_url && (
                <img src={server.icon_url} alt="" className="w-8 h-8 rounded-lg flex-shrink-0" />
              )}
              <h2 className="font-semibold text-white truncate text-[15px]">{server?.name || 'Server'}</h2>
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0 ml-2" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-zinc-900 border-zinc-800" align="start">
          <DropdownMenuItem onClick={onInvite} className="text-indigo-400 focus:bg-indigo-500/20 focus:text-indigo-300">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite People
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem onClick={onServerSettings} className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
            <Settings className="w-4 h-4 mr-2" />
            Server Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCreateChannel?.()} className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Channel
          </DropdownMenuItem>
          <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-white" onClick={() => onCreateChannel?.()}>
            <FolderPlus className="w-4 h-4 mr-2" />
            Create Category
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-white" onClick={() => window.dispatchEvent(new CustomEvent('kairo:show-apps'))}>
            <Code className="w-4 h-4 mr-2" />
            App Marketplace
          </DropdownMenuItem>
          <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-white" onClick={() => window.dispatchEvent(new CustomEvent('kairo:show-webhooks'))}>
            <Webhook className="w-4 h-4 mr-2" />
            Webhooks
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem 
            onClick={() => window.dispatchEvent(new CustomEvent('kairo:leave-server', { detail: server }))}
            className="text-red-400 focus:bg-red-500/20 focus:text-red-400"
          >
            Leave Server
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Channels list */}
      <ContextMenu>
        <ContextMenuTrigger>
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent py-2">
        {/* Uncategorized channels */}
        {uncategorizedChannels.map((channel) => (
          <ChannelItem
            key={channel.id}
            channel={channel}
            isActive={activeChannelId === channel.id}
            onClick={onChannelClick}
            voiceUsers={voiceStates?.filter(v => v.channel_id === channel.id) || []}
          />
        ))}

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
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48 bg-zinc-900 border-zinc-800">
          <ContextMenuItem 
            onClick={() => onCreateChannel?.()}
            className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Channel
          </ContextMenuItem>
          <ContextMenuItem className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Category
          </ContextMenuItem>
          <ContextMenuSeparator className="bg-zinc-800" />
          <ContextMenuItem 
            onClick={onInvite}
            className="text-indigo-400 focus:bg-indigo-500/20 focus:text-indigo-300"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Invite People
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}