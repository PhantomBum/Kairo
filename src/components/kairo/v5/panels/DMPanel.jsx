import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Users, MessageCircle, UserPlus, Globe, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../primitives/Avatar';
import IconButton from '../primitives/IconButton';
import { Panel, PanelHeader, PanelContent, SectionHeader } from '../layout/AppShell';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-8 pl-8 pr-3 text-sm bg-[#0a0a0c] border border-white/[0.06] rounded-md text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
      />
    </div>
  );
}

function ConversationItem({ conversation, isActive, onClick, onClose }) {
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
            'relative w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors text-left',
            isActive 
              ? 'bg-white/[0.08] text-white' 
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
          )}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileTap={{ scale: 0.98 }}
        >
          <Avatar
            src={avatar}
            name={name}
            status={!isGroup ? status : undefined}
            size="sm"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className={cn(
                'text-[13px] font-medium truncate',
                unread > 0 && !isActive && 'text-white'
              )}>
                {name}
              </span>
              {unread > 0 && (
                <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                  {unread > 99 ? '99+' : unread}
                </span>
              )}
            </div>
            {lastMessage && (
              <p className="text-[11px] text-zinc-500 truncate">
                {lastMessage.content}
              </p>
            )}
          </div>
          
          {/* Close button on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={(e) => { e.stopPropagation(); onClose?.(); }}
                className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/[0.08] text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3 h-3" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-[#111113] border-white/10">
        <ContextMenuItem className="text-zinc-300">Mute Conversation</ContextMenuItem>
        <ContextMenuSeparator className="bg-white/[0.06]" />
        <ContextMenuItem onClick={onClose} className="text-red-400 focus:text-red-300">
          Close DM
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-1 p-2.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.04] transition-colors group"
    >
      <div className="w-7 h-7 rounded-md bg-white/[0.06] group-hover:bg-white/[0.1] flex items-center justify-center transition-colors">
        <Icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors" />
      </div>
      <span className="text-[10px] font-medium text-zinc-500 group-hover:text-zinc-300 transition-colors">{label}</span>
    </button>
  );
}

export default function DMPanel({
  conversations = [],
  friends = [],
  activeConversationId,
  onConversationSelect,
  onShowFriends,
  onCreateDM,
  onCloseConversation,
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
    <Panel width={240}>
      <PanelHeader className="flex-col gap-2.5 !h-auto py-3 px-3">
        {/* Friends button */}
        <button
          onClick={onShowFriends}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-white hover:bg-white/[0.06] transition-colors"
        >
          <Users className="w-5 h-5 text-zinc-400" />
          <span className="font-semibold text-sm">Friends</span>
          {onlineFriends.length > 0 && (
            <span className="ml-auto px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded">
              {onlineFriends.length}
            </span>
          )}
        </button>
        
        {/* Search */}
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Find or start a conversation"
        />
      </PanelHeader>

      <PanelContent padding={false} className="px-2 py-2">
        {/* Quick Actions */}
        <div className="flex gap-1.5 mb-3">
          <QuickAction icon={UserPlus} label="Add Friend" onClick={onCreateDM} />
          <QuickAction icon={Globe} label="Join Server" onClick={onJoinServer} />
          <QuickAction icon={Sparkles} label="Premium" onClick={onNitro} />
        </div>
        
        <SectionHeader count={filteredConversations.length}>
          Direct Messages
        </SectionHeader>

        {/* Conversations */}
        <div className="space-y-0.5">
          <AnimatePresence mode="popLayout">
            {filteredConversations.length === 0 ? (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-[#111113] flex items-center justify-center mb-2">
                  <MessageCircle className="w-5 h-5 text-zinc-600" />
                </div>
                <p className="text-xs text-zinc-600">No conversations yet</p>
              </motion.div>
            ) : (
              filteredConversations.map((conv, i) => (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <ConversationItem
                    conversation={conv}
                    isActive={activeConversationId === conv.id}
                    onClick={() => onConversationSelect(conv)}
                    onClose={() => onCloseConversation?.(conv)}
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