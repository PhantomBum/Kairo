import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Users, MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../primitives/Avatar';
import Input from '../primitives/Input';
import IconButton from '../primitives/IconButton';
import { Panel, PanelHeader, PanelContent, PanelFooter } from '../layout/AppShell';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

function ConversationItem({ conversation, isActive, onClick, onClose, onMute, onBlock }) {
  const isGroup = conversation.is_group;
  const name = conversation.name || conversation.participants?.[0]?.user_name || 'Unknown';
  const avatar = conversation.icon_url || conversation.participants?.[0]?.user_avatar;
  const status = conversation.participants?.[0]?.status || 'offline';
  const lastMessage = conversation.last_message;
  const unread = conversation.unread_count || 0;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <button
          onClick={onClick}
          className={cn(
            'w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-colors',
            isActive 
              ? 'bg-white/[0.08]' 
              : 'hover:bg-white/[0.04]'
          )}
        >
          <div className="relative">
            <Avatar
              src={avatar}
              name={name}
              status={!isGroup ? status : undefined}
              size="md"
            />
            {isGroup && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[#0a0a0b] rounded-full flex items-center justify-center">
                <Users className="w-2.5 h-2.5 text-zinc-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between">
              <span className={cn(
                'text-sm font-medium truncate',
                isActive ? 'text-white' : 'text-zinc-300'
              )}>
                {name}
              </span>
              {unread > 0 && (
                <span className="ml-2 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </div>
            {lastMessage && (
              <p className="text-xs text-zinc-500 truncate">
                {lastMessage.content}
              </p>
            )}
          </div>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-[#111113] border-white/[0.08]">
        <ContextMenuItem 
          onClick={onMute}
          className="text-zinc-300 focus:text-white focus:bg-white/[0.06]"
        >
          Mute Conversation
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/[0.06]" />
        <ContextMenuItem 
          onClick={onClose}
          className="text-zinc-300 focus:text-white focus:bg-white/[0.06]"
        >
          Close DM
        </ContextMenuItem>
        {!isGroup && (
          <ContextMenuItem 
            onClick={onBlock}
            className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
          >
            Block User
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

function FriendItem({ friend, onClick, onRemove }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/[0.04] transition-colors"
    >
      <Avatar
        src={friend.friend_avatar}
        name={friend.friend_name}
        status={friend.status || 'offline'}
        size="sm"
      />
      <div className="flex-1 min-w-0 text-left">
        <span className="text-sm text-zinc-300 truncate block">{friend.friend_name}</span>
        <span className="text-xs text-zinc-600 capitalize">{friend.status || 'Offline'}</span>
      </div>
    </button>
  );
}

export default function DMPanel({
  conversations = [],
  friends = [],
  activeConversationId,
  onConversationSelect,
  onFriendSelect,
  onCreateDM,
  onCreateGroupDM,
  onShowFriends,
  onCloseConversation,
  onMuteConversation,
  onBlockUser,
}) {
  const [search, setSearch] = useState('');
  const [view, setView] = useState('conversations'); // conversations | friends

  const filteredConversations = conversations.filter(c => {
    const name = c.name || c.participants?.[0]?.user_name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const filteredFriends = friends.filter(f =>
    f.friend_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Panel width={240}>
      <PanelHeader className="flex-col items-stretch gap-2 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={onShowFriends}
            className="flex items-center gap-2 px-2 py-1 -ml-2 rounded hover:bg-white/[0.04] transition-colors"
          >
            <Users className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium text-white">Friends</span>
          </button>
          <IconButton
            icon={Plus}
            size="sm"
            variant="ghost"
            tooltip="New DM"
            onClick={onCreateDM}
          />
        </div>
        
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          leftIcon={<Search className="w-4 h-4" />}
          className="h-8"
        />
      </PanelHeader>

      <PanelContent className="px-2 py-2">
        {/* Tab buttons */}
        <div className="flex gap-1 mb-3 p-1 bg-white/[0.02] rounded-lg">
          <button
            onClick={() => setView('conversations')}
            className={cn(
              'flex-1 py-1.5 text-xs font-medium rounded-md transition-colors',
              view === 'conversations' 
                ? 'bg-white/[0.08] text-white' 
                : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            Messages
          </button>
          <button
            onClick={() => setView('friends')}
            className={cn(
              'flex-1 py-1.5 text-xs font-medium rounded-md transition-colors',
              view === 'friends' 
                ? 'bg-white/[0.08] text-white' 
                : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            Friends
          </button>
        </div>

        <AnimatePresence mode="wait">
          {view === 'conversations' ? (
            <motion.div
              key="conversations"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-0.5"
            >
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-8 h-8 mx-auto text-zinc-700 mb-2" />
                  <p className="text-xs text-zinc-600">No conversations</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={activeConversationId === conv.id}
                    onClick={() => onConversationSelect(conv)}
                    onClose={() => onCloseConversation?.(conv)}
                    onMute={() => onMuteConversation?.(conv)}
                    onBlock={() => onBlockUser?.(conv.participants?.[0])}
                  />
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="friends"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-0.5"
            >
              {filteredFriends.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-8 h-8 mx-auto text-zinc-700 mb-2" />
                  <p className="text-xs text-zinc-600">No friends online</p>
                </div>
              ) : (
                filteredFriends.map((friend) => (
                  <FriendItem
                    key={friend.id}
                    friend={friend}
                    onClick={() => onFriendSelect(friend)}
                  />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </PanelContent>
    </Panel>
  );
}