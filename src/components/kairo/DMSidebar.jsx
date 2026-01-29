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
        <motion.div
          whileHover={{ x: 2 }}
          onClick={() => onClick(conversation)}
          className={cn(
            "group flex items-center gap-3 px-2 py-1.5 mx-2 rounded-md cursor-pointer transition-colors",
            isActive 
              ? "bg-zinc-700/50 text-white" 
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
          )}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-700">
              {avatar ? (
                <img src={avatar} alt="" className="w-full h-full object-cover" />
              ) : isGroup ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                  <Users className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-medium">
                  {displayName?.charAt(0)}
                </div>
              )}
            </div>
            {!isGroup && status && (
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#121214]",
                statusColors[status] || statusColors.offline
              )} />
            )}
          </div>

          {/* Name and preview */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm truncate">{displayName}</span>
              {isGroup && (
                <span className="text-xs text-zinc-500">
                  {conversation.participants?.length}
                </span>
              )}
            </div>
            {conversation.last_message_preview && (
              <p className="text-xs text-zinc-500 truncate">
                {conversation.last_message_preview}
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={(e) => { e.stopPropagation(); onClose?.(conversation); }}
            className="hidden group-hover:flex p-1 hover:bg-zinc-700 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-zinc-900 border-zinc-800">
        <ContextMenuItem className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white">
          <VolumeX className="w-4 h-4 mr-2" />
          Mute Conversation
        </ContextMenuItem>
        {!isGroup && (
          <>
            <ContextMenuItem className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white">
              View Profile
            </ContextMenuItem>
            <ContextMenuSeparator className="bg-zinc-800" />
            <ContextMenuItem className="text-red-400 focus:bg-red-500/20 focus:text-red-400">
              <UserX className="w-4 h-4 mr-2" />
              Block
            </ContextMenuItem>
          </>
        )}
        <ContextMenuSeparator className="bg-zinc-800" />
        <ContextMenuItem 
          onClick={() => onClose?.(conversation)}
          className="text-red-400 focus:bg-red-500/20 focus:text-red-400"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Close DM
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function FriendItem({ friend, onMessage, onRemove }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.div
          whileHover={{ x: 2 }}
          className="group flex items-center gap-3 px-3 py-2 hover:bg-zinc-800/50 rounded-md cursor-pointer transition-colors"
        >
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-700">
              {friend.friend_avatar ? (
                <img src={friend.friend_avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium">
                  {friend.friend_name?.charAt(0)}
                </div>
              )}
            </div>
            <div className={cn(
              "absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#121214]",
              statusColors[friend.status] || statusColors.offline
            )} />
          </div>

          <div className="flex-1 min-w-0">
            <span className="font-medium text-white text-sm truncate block">
              {friend.friend_name}
            </span>
            <span className="text-xs text-zinc-500 capitalize">
              {friend.status || 'Offline'}
            </span>
          </div>

          <div className="hidden group-hover:flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onMessage?.(friend); }}
              className="p-1.5 hover:bg-zinc-700 rounded transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-zinc-400" />
            </button>
            <button className="p-1.5 hover:bg-zinc-700 rounded transition-colors">
              <MoreHorizontal className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </motion.div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-zinc-900 border-zinc-800">
        <ContextMenuItem 
          onClick={() => onMessage?.(friend)}
          className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Message
        </ContextMenuItem>
        <ContextMenuItem className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white">
          View Profile
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-zinc-800" />
        <ContextMenuItem 
          onClick={() => onRemove?.(friend)}
          className="text-red-400 focus:bg-red-500/20 focus:text-red-400"
        >
          <UserX className="w-4 h-4 mr-2" />
          Remove Friend
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
  view = 'conversations' // 'conversations' | 'friends' | 'pending'
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeView, setActiveView] = useState(view);

  const filteredConversations = conversations.filter(c => {
    const name = c.type === 'group' ? c.name : c.participants?.[0]?.user_name;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredFriends = friends.filter(f => 
    f.friend_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-60 h-full bg-[#121214] flex flex-col">
      {/* Header */}
      <div className="h-12 px-3 flex items-center border-b border-zinc-800/50">
        <div className="flex-1 relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Find or start a conversation"
            className="w-full pl-8 h-7 bg-zinc-900 border-none text-sm text-white placeholder-zinc-500"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="p-2 space-y-0.5">
        <button
          onClick={() => setActiveView('friends')}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
            activeView === 'friends' 
              ? "bg-zinc-700/50 text-white" 
              : "hover:bg-zinc-800/50 text-zinc-400 hover:text-white"
          )}
        >
          <Users className="w-5 h-5" />
          <span className="text-sm font-medium">Friends</span>
          {pendingRequests.length > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {pendingRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={onAddFriend}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-800/50 text-zinc-400 hover:text-white transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          <span className="text-sm font-medium">Add Friend</span>
        </button>
        <button
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-800/50 text-zinc-400 hover:text-white transition-colors"
        >
          <Link2 className="w-5 h-5" />
          <span className="text-sm font-medium">Join Server</span>
        </button>
      </div>

      <div className="h-px bg-zinc-800/50 mx-2" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent py-2">
        {activeView === 'friends' ? (
          <>
            <h3 className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              All Friends — {filteredFriends.length}
            </h3>
            {filteredFriends.map((friend) => (
              <FriendItem
                key={friend.id}
                friend={friend}
                onMessage={() => {
                  // Find or create conversation
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
              <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                <Users className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm">No friends yet</p>
                <Button
                  variant="link"
                  onClick={onAddFriend}
                  className="text-indigo-400 text-sm"
                >
                  Add a friend
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between px-4 py-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Direct Messages
              </h3>
              <button
                onClick={onNewDM}
                className="p-1 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white"
              >
                <Plus className="w-4 h-4" />
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
              <div className="flex flex-col items-center justify-center py-8 text-zinc-500">
                <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                <p className="text-sm">No conversations</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}