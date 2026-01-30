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
              "w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 group text-left",
              isActive 
                ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 shadow-sm" 
                : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
            )}
          >
            <div className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
              isActive 
                ? "bg-emerald-500/20" 
                : "bg-white/[0.04] group-hover:bg-white/[0.08]"
            )}>
              <Icon className={cn(
                "w-4 h-4",
                isActive ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300"
              )} />
            </div>
            
            <span className="flex-1 truncate font-medium">
              {channel.name}
            </span>

            {channel.is_private && (
              <Lock className="w-3.5 h-3.5 text-zinc-600" />
            )}
            
            {isVoice && voiceUsers.length > 0 && (
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded-full">
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
                {voiceUsers.map((user) => (
                  <div 
                    key={user.user_id}
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
      <ContextMenuContent className="w-44 bg-[#1a1a1d] border-white/10 rounded-lg p-1">
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
        className="flex items-center gap-2 px-3 w-full group py-2"
      >
        <ChevronRight className={cn(
          "w-3 h-3 text-zinc-600 transition-transform duration-200",
          !isCollapsed && "rotate-90"
        )} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400 truncate transition-colors">
          {category.name}
        </span>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onCreateChannel?.(category.id); }}
          className="ml-auto opacity-0 group-hover:opacity-100 p-1 hover:bg-white/[0.06] rounded-lg transition-all"
        >
          <Plus className="w-3 h-3 text-zinc-500" />
        </motion.button>
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
    <div className="w-60 h-full bg-gradient-to-b from-[#111113] to-[#0e0e10] flex flex-col border-r border-white/[0.06]">
      
      {/* Server header - Premium V2 style */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="px-4 py-4 flex items-center justify-between hover:bg-white/[0.04] transition-all duration-200 border-b border-white/[0.06] group">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-shadow">
                {server?.icon_url ? (
                  <img src={server.icon_url} alt="" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="text-white font-bold text-sm">{server?.name?.charAt(0) || 'K'}</span>
                )}
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-white text-sm block truncate">{server?.name || 'Server'}</span>
                <span className="text-[10px] text-zinc-500">{server?.member_count || 0} members</span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0 group-hover:text-zinc-400 transition-colors" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52 bg-[#1a1a1d] border-white/10 rounded-lg p-1" align="start">
          <DropdownMenuItem onClick={onInvite} className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 text-xs">
            <UserPlus className="w-3.5 h-3.5 mr-2 text-zinc-500" />
            Invite People
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/5 my-1" />
          <DropdownMenuItem onClick={onServerSettings} className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 text-xs">
            <Settings className="w-3.5 h-3.5 mr-2 text-zinc-500" />
            Server Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onCreateChannel?.()} className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 text-xs">
            <Plus className="w-3.5 h-3.5 mr-2 text-zinc-500" />
            Create Channel
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/5 my-1" />
          <DropdownMenuItem 
            onClick={() => window.dispatchEvent(new CustomEvent('kairo:leave-server', { detail: server }))}
            className="text-red-400 focus:bg-red-500/10 rounded px-3 py-2 text-xs"
          >
            Leave Server
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Overview link - Kloak style */}
      <div className="px-2 py-2">
        <button className="w-full flex items-center gap-2 px-2 py-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded text-xs transition-colors">
          <div className="w-4 h-4 rounded border border-zinc-600 flex items-center justify-center">
            <span className="text-[8px]">○</span>
          </div>
          <span>Overview</span>
        </button>
      </div>

      {/* Channels list - Kloak style */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4">
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