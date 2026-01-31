import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Users, UserPlus, X, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../ui/Avatar';
import Input from '../ui/Input';

function ConversationItem({ conversation, isActive, onClick, onClose }) {
  const [hovered, setHovered] = useState(false);
  const isGroup = conversation.is_group;
  const otherParticipant = conversation.participants?.find(p => p.user_id !== conversation.current_user_id);
  const name = conversation.name || otherParticipant?.user_name || 'Unknown';
  const avatar = conversation.icon_url || otherParticipant?.user_avatar;
  const status = otherParticipant?.status || 'offline';

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors text-left relative',
        isActive 
          ? 'bg-white/[0.08] text-white' 
          : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
      )}
    >
      <Avatar
        src={avatar}
        name={name}
        status={!isGroup ? status : undefined}
        size="sm"
      />
      <span className="flex-1 text-sm font-medium truncate">{name}</span>
      
      <AnimatePresence>
        {hovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e) => {
              e.stopPropagation();
              onClose?.();
            }}
            className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/[0.1] text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-3 h-3" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default function DMSidebar({
  conversations = [],
  activeConversationId,
  onConversationSelect,
  onShowFriends,
  onCreateDM,
  onCloseConversation,
  currentUserId,
}) {
  const [search, setSearch] = useState('');

  const filteredConversations = conversations.filter(c => {
    const name = c.name || c.participants?.find(p => p.user_id !== currentUserId)?.user_name || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="w-60 h-full bg-[#0f0f10] flex flex-col">
      {/* Header */}
      <div className="p-3 space-y-3">
        {/* Search */}
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Find a conversation"
          leftIcon={<Search className="w-4 h-4" />}
          className="h-8 text-xs"
        />
        
        {/* Friends button */}
        <button
          onClick={onShowFriends}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-white hover:bg-white/[0.06] transition-colors"
        >
          <Users className="w-5 h-5 text-zinc-400" />
          <span className="font-medium text-sm">Friends</span>
        </button>
      </div>
      
      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-2 scrollbar-thin">
        <div className="flex items-center justify-between px-2 py-2">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Direct Messages
          </span>
          <button 
            onClick={onCreateDM}
            className="text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-0.5">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-zinc-600">No conversations yet</p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={{ ...conv, current_user_id: currentUserId }}
                isActive={activeConversationId === conv.id}
                onClick={() => onConversationSelect(conv)}
                onClose={() => onCloseConversation?.(conv)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}