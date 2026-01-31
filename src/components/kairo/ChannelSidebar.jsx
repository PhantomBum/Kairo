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
          <button
            onClick={() => onClick(channel)}
            className={cn(
              "w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-sm transition-colors group text-left",
              isActive 
                ? "bg-white/10 text-white" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
            )}
          >
            <Icon className={cn(
              "w-5 h-5 flex-shrink-0",
              isActive ? "text-white" : "text-zinc-500"
            )} />
            
            <span className="flex-1 truncate">
              {channel.name}
            </span>

            {channel.is_private && (
              <Lock className="w-3.5 h-3.5 text-zinc-600" />
            )}
            
            {isVoice && voiceUsers.length > 0 && (
              <span className="text-xs text-zinc-400">
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
                className="ml-5 mt-0.5 space-y-0.5 pb-1 overflow-hidden"
              >
                {voiceUsers.map((user, idx) => (
                  <div 
                    key={user.user_id || user.id || `voice-${idx}`}
                    className="flex items-center gap-1.5 px-2 py-1 text-[11px] text-zinc-500"
                  >
                    <div className="w-4 h-4 rounded bg-zinc-700 overflow-hidden">
                      {user.user_avatar ? (
                        <img src={user.user_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px]">
                          {user.user_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="truncate">{user.user_name}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-44 bg-[#1a1a1a] border-white/10 rounded-lg p-1">
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
    <div className="mt-4 first:mt-0">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-1 px-1 w-full group py-1"
      >
        <ChevronRight className={cn(
          "w-3 h-3 text-zinc-500 transition-transform",
          !isCollapsed && "rotate-90"
        )} />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 group-hover:text-zinc-400 truncate">
          {category.name}
        </span>
        <button 
          onClick={(e) => { e.stopPropagation(); onCreateChannel?.(category.id); }}
          className="ml-auto opacity-0 group-hover:opacity-100 p-0.5 hover:bg-white/10 rounded transition-all"
        >
          <Plus className="w-3 h-3 text-zinc-500" />
        </button>
      </button>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden mt-0.5 space-y-0.5"
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

// Premium V2 ChannelSidebar
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
    <div className="w-60 h-full bg-[#0c0c0d] flex flex-col border-r border-white/[0.04]">
      
      {/* Server header - Clean style */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="px-4 h-12 flex items-center justify-between hover:bg-white/5 transition-colors shadow-sm">
            <span className="font-semibold text-white text-sm truncate">{server?.name || 'Server'}</span>
            <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52 bg-[#1a1a1a] border-white/10 rounded-lg p-1" align="start">
          <DropdownMenuItem onClick={onInvite} className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 text-sm">
            <UserPlus className="w-4 h-4 mr-2 text-zinc-500" />
            Invite People
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/5 my-1" />
          <DropdownMenuItem onClick={onServerSettings} className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 text-sm">
            <Settings className="w-4 h-4 mr-2 text-zinc-500" />
            Server Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCreateChannel?.()} className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 text-sm">
            <Plus className="w-4 h-4 mr-2 text-zinc-500" />
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

      {/* Channels list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2">
        {/* Uncategorized channels */}
        {uncategorizedChannels.length > 0 && (
          <div className="space-y-0.5 mb-2">
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