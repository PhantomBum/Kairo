// Kairo DM Panel v3.0 - Clean conversation list

import React, { useState } from 'react';
import { 
  Users, Plus, Search, X, UserPlus, MessageCircle,
  MoreHorizontal, VolumeX, Trash2, Link2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Text, Avatar, StatusDot, Section, IconButton, Divider } from '../ui/DesignSystem';
import { Input } from '@/components/ui/input';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

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
        <button
          onClick={() => onClick(conversation)}
          className={cn(
            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors group text-left",
            isActive 
              ? "bg-white/[0.06] text-white" 
              : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03]"
          )}
        >
          <Avatar 
            src={avatar}
            name={displayName}
            size="sm"
            status={!isGroup ? status : undefined}
          />
          <div className="flex-1 min-w-0">
            <Text variant="small" weight="medium" color={isActive ? 'primary' : 'secondary'} className="truncate block">
              {displayName}
            </Text>
            {conversation.last_message_preview && (
              <Text variant="tiny" color="muted" className="truncate block">
                {conversation.last_message_preview}
              </Text>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClose?.(conversation); }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/[0.06] rounded transition-all"
          >
            <X className="w-3 h-3 text-zinc-500" />
          </button>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-[#111114] border-white/[0.06] rounded-xl p-1.5">
        <ContextMenuItem className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2 text-sm">
          <VolumeX className="w-4 h-4 mr-2.5 text-zinc-500" />
          Mute
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/[0.04] my-1" />
        <ContextMenuItem 
          onClick={() => onClose?.(conversation)}
          className="text-red-400 focus:bg-red-500/10 rounded-lg px-3 py-2 text-sm"
        >
          <Trash2 className="w-4 h-4 mr-2.5" />
          Close
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function FriendItem({ friend, onMessage }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <button
          onClick={() => onMessage?.(friend)}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition-colors group text-left"
        >
          <Avatar 
            src={friend.friend_avatar}
            name={friend.friend_name}
            size="sm"
            status={friend.status}
          />
          <div className="flex-1 min-w-0">
            <Text variant="small" weight="medium" color="secondary" className="truncate block">
              {friend.friend_name}
            </Text>
            <Text variant="tiny" color="muted" className="capitalize">
              {friend.status || 'Offline'}
            </Text>
          </div>
          <div className="opacity-0 group-hover:opacity-100">
            <IconButton size="sm" variant="ghost">
              <MessageCircle className="w-3.5 h-3.5" />
            </IconButton>
          </div>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-[#111114] border-white/[0.06] rounded-xl p-1.5">
        <ContextMenuItem 
          onClick={() => onMessage?.(friend)}
          className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2 text-sm"
        >
          <MessageCircle className="w-4 h-4 mr-2.5 text-zinc-500" />
          Message
        </ContextMenuItem>
        <ContextMenuItem className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2 text-sm">
          View Profile
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default function DMPanelV3({ 
  conversations = [],
  friends = [],
  activeConversationId,
  onConversationSelect,
  onConversationClose,
  onNewDM,
  onAddFriend,
  onJoinServer
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
    <div className="w-60 h-full bg-[#0c0c0e] flex flex-col border-r border-white/[0.04]">
      {/* Search */}
      <div className="px-3 py-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="w-full pl-8 h-8 bg-[#111114] border-white/[0.04] rounded-lg text-xs text-white placeholder-zinc-600"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-2 space-y-0.5">
        <button
          onClick={() => setActiveView('friends')}
          className={cn(
            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors",
            activeView === 'friends' 
              ? "bg-white/[0.06] text-white" 
              : "hover:bg-white/[0.03] text-zinc-500 hover:text-zinc-300"
          )}
        >
          <Users className="w-4 h-4" />
          <Text variant="small" weight="medium">Friends</Text>
        </button>
        <button
          onClick={onAddFriend}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <Text variant="small" weight="medium">Add Friend</Text>
        </button>
        <button
          onClick={onJoinServer}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Link2 className="w-4 h-4" />
          <Text variant="small" weight="medium">Join Server</Text>
        </button>
      </div>

      <Divider className="my-2 mx-3" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2">
        {activeView === 'friends' ? (
          <Section title={`Friends — ${filteredFriends.length}`}>
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend, idx) => (
                <FriendItem
                  key={friend.id || `friend-${idx}`}
                  friend={friend}
                  onMessage={() => {
                    const existingConvo = conversations.find(c => 
                      c.type === 'dm' && c.participants?.some(p => p.user_id === friend.friend_id)
                    );
                    if (existingConvo) {
                      onConversationSelect(existingConvo);
                    } else {
                      onNewDM?.(friend);
                    }
                    setActiveView('conversations');
                  }}
                />
              ))
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <Users className="w-8 h-8 text-zinc-700 mb-2" />
                <Text variant="small" color="muted">No friends yet</Text>
              </div>
            )}
          </Section>
        ) : (
          <Section 
            title="Messages"
            action={
              <IconButton size="sm" variant="ghost" onClick={onNewDM}>
                <Plus className="w-3.5 h-3.5" />
              </IconButton>
            }
          >
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation, idx) => (
                <ConversationItem
                  key={conversation.id || `convo-${idx}`}
                  conversation={conversation}
                  isActive={activeConversationId === conversation.id}
                  onClick={onConversationSelect}
                  onClose={onConversationClose}
                />
              ))
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <MessageCircle className="w-8 h-8 text-zinc-700 mb-2" />
                <Text variant="small" color="muted">No messages</Text>
              </div>
            )}
          </Section>
        )}
      </div>
    </div>
  );
}