import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Plus, Search, X, UserPlus, Settings, MessageCircle,
  MoreHorizontal, UserX, VolumeX, Trash2, ShoppingBag, Compass, Link2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const statusColors = {
  online: 'bg-emerald-500',
  idle: 'bg-amber-500',
  dnd: 'bg-red-500',
  invisible: 'bg-zinc-500',
  offline: 'bg-zinc-600'
};

function ConversationItem({ conversation, isActive, onClick, onClose }) {
  const isGroup = conversation.type === 'group';
  const displayName = isGroup 
    ? conversation.name 
    : conversation.participants?.[0]?.user_name;
  const avatar = isGroup 
    ? conversation.icon_url 
    : conversation.participants?.[0]?.avatar;
  const status = conversation.participants?.[0]?.status;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          onClick={() => onClick(conversation)}
          className={cn(
            "group flex items-center gap-2.5 px-2 py-1.5 mx-1 rounded cursor-pointer transition-colors",
            isActive 
              ? "bg-white/10 text-white" 
              : "text-zinc-400 hover:text-white hover:bg-white/5"
          )}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10">
              {avatar ? (
                <img src={avatar} alt="" className="w-full h-full object-cover" />
              ) : isGroup ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Users className="w-3.5 h-3.5 text-white" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-medium">
                  {displayName?.charAt(0)}
                </div>
              )}
            </div>
            {!isGroup && status && (
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0b]",
                statusColors[status] || statusColors.offline
              )} />
            )}
          </div>

          {/* Name and preview */}
          <div className="flex-1 min-w-0">
            <span className="font-medium text-xs truncate block">{displayName}</span>
            {conversation.last_message_preview && (
              <p className="text-[10px] text-zinc-600 truncate">
                {conversation.last_message_preview}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose?.(conversation); }}
            className="hidden group-hover:flex p-1 hover:bg-white/10 rounded transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-44 bg-[#0a0a0b] border-white/10 rounded-lg p-1">
        <ContextMenuItem className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 text-xs">
          <VolumeX className="w-3.5 h-3.5 mr-2" />
          Mute
        </ContextMenuItem>
        {!isGroup && (
          <>
            <ContextMenuItem className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 text-xs">
              View Profile
            </ContextMenuItem>
            <ContextMenuSeparator className="bg-white/5 my-1" />
            <ContextMenuItem className="text-red-400 focus:bg-red-500/10 rounded px-3 py-2 text-xs">
              <UserX className="w-3.5 h-3.5 mr-2" />
              Block
            </ContextMenuItem>
          </>
        )}
        <ContextMenuSeparator className="bg-white/5 my-1" />
        <ContextMenuItem 
          onClick={() => onClose?.(conversation)}
          className="text-red-400 focus:bg-red-500/10 rounded px-3 py-2 text-xs"
        >
          <Trash2 className="w-3.5 h-3.5 mr-2" />
          Close
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function FriendItem({ friend, onMessage, onRemove }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className="group flex items-center gap-2.5 px-2 py-1.5 mx-1 hover:bg-white/5 rounded cursor-pointer transition-colors"
        >
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10">
              {friend.friend_avatar ? (
                <img src={friend.friend_avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-medium">
                  {friend.friend_name?.charAt(0)}
                </div>
              )}
            </div>
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0b]",
              statusColors[friend.status] || statusColors.offline
            )} />
          </div>

          <div className="flex-1 min-w-0">
            <span className="font-medium text-white text-xs truncate block">
              {friend.friend_name}
            </span>
            <span className="text-[10px] text-zinc-600 capitalize">
              {friend.status || 'Offline'}
            </span>
          </div>

          <div className="hidden group-hover:flex items-center">
            <button
              onClick={(e) => { e.stopPropagation(); onMessage?.(friend); }}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-44 bg-[#0a0a0b] border-white/10 rounded-lg p-1">
        <ContextMenuItem 
          onClick={() => onMessage?.(friend)}
          className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 text-xs"
        >
          <MessageCircle className="w-3.5 h-3.5 mr-2" />
          Message
        </ContextMenuItem>
        <ContextMenuItem className="text-zinc-300 focus:bg-white/5 focus:text-white rounded px-3 py-2 text-xs">
          View Profile
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/5 my-1" />
        <ContextMenuItem 
          onClick={() => onRemove?.(friend)}
          className="text-red-400 focus:bg-red-500/10 rounded px-3 py-2 text-xs"
        >
          <UserX className="w-3.5 h-3.5 mr-2" />
          Remove
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default function DMSidebar({ 
  conversations = [],
  friends = [],
  pendingRequests = [],
  activeConversationId,
  onConversationSelect,
  onConversationClose,
  onNewDM,
  onAddFriend,
  onJoinServer,
  view = 'conversations'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState('conversations');

  const filteredConversations = conversations.filter(c => {
    const name = c.type === 'group' ? c.name : c.participants?.[0]?.user_name;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredFriends = friends.filter(f => 
    f.friend_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-[260px] md:w-60 h-full bg-[#0a0a0b] flex flex-col border-r border-white/5">
      {/* Header */}
      <div className="px-3 py-3 border-b border-white/5">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full pl-8 h-8 bg-white/5 border-white/5 rounded text-xs text-white placeholder-zinc-600"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="px-2 py-2 space-y-0.5">
        <button
          onClick={() => setActiveView('friends')}
          className={cn(
            "w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded transition-colors",
            activeView === 'friends' 
              ? "bg-white/10 text-white" 
              : "hover:bg-white/5 text-zinc-500 hover:text-white"
          )}
        >
          <Users className="w-4 h-4" />
          <span className="text-xs font-medium">Friends</span>
          {pendingRequests.length > 0 && (
            <span className="ml-auto bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={onAddFriend}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span className="text-xs font-medium">Add Friend</span>
        </button>
        <button
          onClick={onJoinServer}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
        >
          <Link2 className="w-4 h-4" />
          <span className="text-xs font-medium">Join Server</span>
        </button>
      </div>

      <div className="h-px bg-white/5 mx-2" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activeView === 'friends' ? (
          <>
            <div className="px-3 py-2 text-[9px] font-semibold uppercase tracking-wider text-zinc-600">
              Friends — {filteredFriends.length}
            </div>
            {filteredFriends.map((friend) => (
              <FriendItem
                key={friend.id}
                friend={friend}
                onMessage={() => {
                  const existingConvo = conversations.find(c => 
                    c.type === 'dm' && 
                    c.participants?.some(p => p.user_id === friend.friend_id)
                  );
                  if (existingConvo) {
                    onConversationSelect(existingConvo);
                  } else {
                    onNewDM?.(friend);
                  }
                  setActiveView('conversations');
                }}
              />
            ))}
            {filteredFriends.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-zinc-600">
                <Users className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs">No friends yet</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">
                Messages
              </span>
              <button
                onClick={onNewDM}
                className="p-1 hover:bg-white/5 rounded transition-colors text-zinc-600 hover:text-white"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={activeConversationId === conversation.id}
                onClick={onConversationSelect}
                onClose={onConversationClose}
              />
            ))}
            {filteredConversations.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-zinc-600">
                <MessageCircle className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs">No messages</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}