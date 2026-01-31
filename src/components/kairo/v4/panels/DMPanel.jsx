import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Users, MessageCircle, UserPlus, Globe, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../primitives/Avatar';
import IconButton from '../primitives/IconButton';
import { Panel, PanelHeader, PanelContent } from '../layout/AppShell';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-indigo-500/20 rounded-lg opacity-0 group-focus-within:opacity-100 blur-lg transition-opacity" />
      <div className="relative flex items-center gap-2 px-3 h-9 bg-white/[0.04] border border-white/[0.06] rounded-lg group-focus-within:border-white/[0.12] transition-colors">
        <Search className="w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-zinc-600 focus:outline-none"
        />
      </div>
    </div>
  );
}

function ConversationItem({ conversation, isActive, onClick, onClose, onMute }) {
  const [isHovered, setIsHovered] = useState(false);
  const isGroup = conversation.is_group;
  const name = conversation.name || conversation.participants?.find(p => p.user_name)?.user_name || 'Unknown';
  const avatar = conversation.icon_url || conversation.participants?.find(p => p.user_avatar)?.user_avatar;
  const status = conversation.participants?.[0]?.status || 'offline';
  const lastMessage = conversation.last_message;
  const unread = conversation.unread_count || 0;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.button
          onClick={onClick}
          className={cn(
            'relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
            isActive 
              ? 'bg-gradient-to-r from-white/[0.08] to-white/[0.04]' 
              : 'hover:bg-white/[0.04]'
          )}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Active indicator */}
          <motion.div
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-emerald-500"
            initial={{ height: 0 }}
            animate={{ height: isActive ? 24 : 0 }}
          />
          
          <div className="relative flex-shrink-0">
            <Avatar
              src={avatar}
              name={name}
              status={!isGroup ? status : undefined}
              size="md"
            />
            {isGroup && (
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-[#0d0d0f]">
                <Users className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between gap-2">
              <span className={cn(
                'text-sm font-medium truncate',
                isActive ? 'text-white' : 'text-zinc-300'
              )}>
                {name}
              </span>
              {unread > 0 && (
                <motion.span 
                  className="min-w-[20px] h-[20px] px-1.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-lg shadow-red-500/30"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                >
                  {unread > 99 ? '99+' : unread}
                </motion.span>
              )}
            </div>
            {lastMessage && (
              <p className="text-xs text-zinc-500 truncate mt-0.5">
                {lastMessage.content}
              </p>
            )}
          </div>
        </motion.button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-[#18181b]/95 backdrop-blur-xl border-white/[0.1]">
        <ContextMenuItem onClick={onMute} className="text-zinc-300 focus:text-white focus:bg-white/[0.08]">
          Mute Conversation
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/[0.08]" />
        <ContextMenuItem onClick={onClose} className="text-red-400 focus:text-red-300 focus:bg-red-500/10">
          Close DM
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function QuickAction({ icon: Icon, label, onClick, gradient }) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all',
        'bg-gradient-to-br border border-white/[0.04]',
        gradient
      )}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="w-8 h-8 rounded-lg bg-white/[0.1] flex items-center justify-center">
        <Icon className="w-4 h-4 text-white" />
      </div>
      <span className="text-[11px] font-medium text-zinc-300">{label}</span>
    </motion.button>
  );
}

export default function DMPanel({
  conversations = [],
  friends = [],
  activeConversationId,
  onConversationSelect,
  onFriendSelect,
  onCreateDM,
  onShowFriends,
  onCloseConversation,
  onMuteConversation,
  onJoinServer,
  onNitro,
}) {
  const [search, setSearch] = useState('');

  const filteredConversations = conversations.filter(c => {
    const name = c.name || c.participants?.find(p => p.user_name)?.user_name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const onlineFriends = friends.filter(f => f.status === 'online' || f.friend_status === 'online');

  return (
    <Panel width={260}>
      <PanelHeader className="flex-col items-stretch gap-3 pt-4 pb-3 px-3 border-b-0">
        {/* Title with friend count */}
        <div className="flex items-center justify-between px-1">
          <motion.button
            onClick={onShowFriends}
            className="flex items-center gap-2 text-white font-semibold hover:text-indigo-400 transition-colors"
            whileHover={{ x: 2 }}
          >
            <Users className="w-5 h-5" />
            <span>Friends</span>
            {onlineFriends.length > 0 && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded">
                {onlineFriends.length}
              </span>
            )}
          </motion.button>
          <IconButton
            icon={Plus}
            size="sm"
            variant="ghost"
            tooltip="New DM"
            onClick={onCreateDM}
          />
        </div>
        
        {/* Search */}
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Find a conversation"
        />
      </PanelHeader>

      <PanelContent className="px-2 py-2">
        {/* Quick Actions */}
        <div className="flex gap-2 mb-3 px-1">
          <QuickAction
            icon={UserPlus}
            label="Add Friend"
            onClick={onCreateDM}
            gradient="from-indigo-500/10 to-indigo-600/5"
          />
          <QuickAction
            icon={Globe}
            label="Join Server"
            onClick={onJoinServer}
            gradient="from-emerald-500/10 to-emerald-600/5"
          />
          <QuickAction
            icon={Sparkles}
            label="Premium"
            onClick={onNitro}
            gradient="from-purple-500/10 to-pink-500/5"
          />
        </div>
        
        {/* Section header */}
        <div className="flex items-center justify-between px-2 py-2">
          <span className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
            Direct Messages
          </span>
          <span className="text-[10px] text-zinc-700">{filteredConversations.length}</span>
        </div>

        {/* Conversations list */}
        <div className="space-y-0.5">
          <AnimatePresence mode="popLayout">
            {filteredConversations.length === 0 ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center mb-3">
                  <MessageCircle className="w-7 h-7 text-zinc-600" />
                </div>
                <p className="text-sm font-medium text-zinc-500">No conversations yet</p>
                <p className="text-xs text-zinc-600 mt-1">Start chatting with friends!</p>
              </motion.div>
            ) : (
              filteredConversations.map((conv, i) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <ConversationItem
                    conversation={conv}
                    isActive={activeConversationId === conv.id}
                    onClick={() => onConversationSelect(conv)}
                    onClose={() => onCloseConversation?.(conv)}
                    onMute={() => onMuteConversation?.(conv)}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </PanelContent>
    </Panel>
  );
}