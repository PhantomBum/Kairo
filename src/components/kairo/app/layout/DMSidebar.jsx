import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, X, Search, Inbox, Store, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../ui/Avatar';
import Tooltip from '../ui/Tooltip';

function NavButton({ icon: Icon, label, onClick, active, badge }) {
  return (
    <motion.button
      whileHover={{ x: 2 }}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
        active 
          ? 'bg-white/[0.08] text-white' 
          : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
      {badge > 0 && (
        <div className="ml-auto min-w-[20px] h-5 px-1.5 bg-red-500 rounded-full text-[11px] font-bold text-white flex items-center justify-center">
          {badge}
        </div>
      )}
    </motion.button>
  );
}

function ConversationItem({ conversation, isActive, onClick, onClose, currentUserId }) {
  const [showClose, setShowClose] = useState(false);
  
  // Determine other participant
  const isParticipant1 = conversation.participant_1_id === currentUserId;
  const otherName = isParticipant1 ? conversation.participant_2_name : conversation.participant_1_name;
  const otherAvatar = isParticipant1 ? conversation.participant_2_avatar : conversation.participant_1_avatar;
  const status = isParticipant1 ? conversation.participant_2_status : conversation.participant_1_status;

  return (
    <motion.div
      whileHover={{ x: 2 }}
      onMouseEnter={() => setShowClose(true)}
      onMouseLeave={() => setShowClose(false)}
      className="relative"
    >
      <button
        onClick={onClick}
        className={cn(
          'w-full flex items-center gap-3 px-2 py-1.5 rounded-lg transition-colors',
          isActive 
            ? 'bg-white/[0.08] text-white' 
            : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
        )}
      >
        <Avatar 
          src={otherAvatar} 
          name={otherName} 
          size="sm" 
          status={status}
        />
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium truncate">{otherName}</p>
          {conversation.last_message && (
            <p className="text-xs text-zinc-500 truncate">
              {conversation.last_message}
            </p>
          )}
        </div>
        {conversation.unread_count > 0 && (
          <div className="min-w-[20px] h-5 px-1.5 bg-red-500 rounded-full text-[11px] font-bold text-white flex items-center justify-center">
            {conversation.unread_count}
          </div>
        )}
      </button>

      {/* Close button */}
      <AnimatePresence>
        {showClose && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e) => { e.stopPropagation(); onClose?.(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 rounded flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.1]"
          >
            <X className="w-3.5 h-3.5" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
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
  friendRequestCount = 0,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const name = conv.participant_1_id === currentUserId 
      ? conv.participant_2_name 
      : conv.participant_1_name;
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-60 h-full bg-[#111113] flex flex-col border-r border-white/[0.04]">
      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Find or start a conversation"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 bg-[#0a0a0b] border border-white/[0.06] rounded-md text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        </div>
      </div>

      {/* Navigation */}
      <div className="px-2 space-y-0.5">
        <NavButton 
          icon={Users} 
          label="Friends" 
          onClick={onShowFriends}
          badge={friendRequestCount}
        />
        <NavButton icon={Inbox} label="Inbox" />
        <NavButton icon={Store} label="Shop" />
      </div>

      {/* DM Header */}
      <div className="flex items-center justify-between px-4 mt-4 mb-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          Direct Messages
        </h3>
        <Tooltip content="Create DM">
          <button 
            onClick={onCreateDM}
            className="w-4 h-4 rounded flex items-center justify-center text-zinc-500 hover:text-white"
          >
            <Plus className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 space-y-0.5">
        {filteredConversations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-zinc-600">No conversations yet</p>
            <button 
              onClick={onShowFriends}
              className="mt-2 text-sm text-indigo-400 hover:text-indigo-300"
            >
              Find friends to chat with
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {filteredConversations.map((conv) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <ConversationItem
                  conversation={conv}
                  isActive={activeConversationId === conv.id}
                  onClick={() => onConversationSelect(conv)}
                  onClose={() => onCloseConversation?.(conv.id)}
                  currentUserId={currentUserId}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}