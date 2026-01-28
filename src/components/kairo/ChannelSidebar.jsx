import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Hash, Volume2, ChevronDown, ChevronRight, Plus, Settings,
  Video, Megaphone, MessagesSquare, ImageIcon, Lock, Users,
  MoreHorizontal, Edit, Trash2, Bell, BellOff, Copy, UserPlus
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
            "group flex items-center gap-2 px-2 py-1.5 mx-2 rounded-md cursor-pointer transition-colors",
            isActive ? "bg-zinc-700/50 text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
          )}
        >
          <Icon className={cn(
            "w-5 h-5 flex-shrink-0",
            channel.is_private && "text-zinc-500"
          )} />
          
          <span className="flex-1 truncate text-sm">
            {channel.name}
          </span>

          {channel.is_private && (
            <Lock className="w-3 h-3 text-zinc-500" />
          )}

          <div className="hidden group-hover:flex items-center gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onContextAction?.('invite', channel); }}
              className="p-1 hover:bg-zinc-700 rounded"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onContextAction?.('settings', channel); }}
              className="p-1 hover:bg-zinc-700 rounded"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
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
    <div className="mt-4 first:mt-2">
      <ContextMenu>
        <ContextMenuTrigger>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-1 px-2 w-full group"
          >
            <ChevronRight className={cn(
              "w-3 h-3 text-zinc-500 transition-transform",
              !isCollapsed && "rotate-90"
            )} />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300 truncate">
              {category.name}
            </span>
            <button 
              onClick={(e) => { e.stopPropagation(); onCreateChannel?.(category.id); }}
              className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 rounded"
            >
              <Plus className="w-3 h-3 text-zinc-400" />
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
    <div className="w-60 h-full bg-[#121214] flex flex-col">
      {/* Server header */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="h-12 px-4 flex items-center justify-between border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
            <h2 className="font-semibold text-white truncate">{server?.name || 'Server'}</h2>
            <ChevronDown className="w-4 h-4 text-zinc-400" />
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
          <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
            <Bell className="w-4 h-4 mr-2" />
            Notification Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-zinc-800" />
          <DropdownMenuItem className="text-red-400 focus:bg-red-500/20 focus:text-red-400">
            Leave Server
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Channels list */}
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
    </div>
  );
}