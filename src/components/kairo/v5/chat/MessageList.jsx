import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { Hash, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import MessageItem from './MessageItem';

function DateDivider({ date }) {
  const formatDate = (date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };
  
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex-1 h-px bg-white/[0.06]" />
      <span className="text-[11px] font-medium text-zinc-600">{formatDate(date)}</span>
      <div className="flex-1 h-px bg-white/[0.06]" />
    </div>
  );
}

function WelcomeMessage({ channelName }) {
  return (
    <div className="px-4 py-8">
      <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-4">
        <Hash className="w-8 h-8 text-zinc-500" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-1">Welcome to #{channelName}</h1>
      <p className="text-sm text-zinc-500">This is the start of the #{channelName} channel.</p>
    </div>
  );
}

export default function MessageList({
  messages = [],
  currentUserId,
  channelName,
  isLoading,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onToggleReaction,
  onPin,
  onAvatarClick,
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);
  
  // Group messages by author and time for compact display
  const groupMessages = (messages) => {
    const groups = [];
    let currentGroup = null;
    
    messages.forEach((msg, index) => {
      const msgDate = new Date(msg.created_date);
      const prevMsg = messages[index - 1];
      const prevDate = prevMsg ? new Date(prevMsg.created_date) : null;
      
      // Check if we need a date divider
      const needsDateDivider = !prevDate || !isSameDay(msgDate, prevDate);
      
      // Check if this message should be grouped with previous
      const shouldGroup = 
        prevMsg &&
        msg.author_id === prevMsg.author_id &&
        !msg.reply_to_id &&
        !prevMsg.reply_to_id &&
        !needsDateDivider &&
        (msgDate.getTime() - new Date(prevMsg.created_date).getTime()) < 5 * 60 * 1000; // 5 minutes
      
      if (needsDateDivider) {
        groups.push({ type: 'divider', date: msgDate });
      }
      
      groups.push({
        type: 'message',
        message: msg,
        isGrouped: shouldGroup,
        isFirst: !shouldGroup,
      });
    });
    
    return groups;
  };
  
  const groupedMessages = groupMessages(messages.filter(m => !m.is_deleted));
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }
  
  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/5 hover:scrollbar-thumb-white/10 scrollbar-track-transparent"
    >
      <WelcomeMessage channelName={channelName} />
      
      <div className="pb-6">
        <AnimatePresence mode="popLayout" initial={false}>
          {groupedMessages.map((item, index) => {
            if (item.type === 'divider') {
              return <DateDivider key={`divider-${index}`} date={item.date} />;
            }
            
            return (
              <MessageItem
                key={item.message.id}
                message={item.message}
                isOwn={item.message.author_id === currentUserId}
                isGrouped={item.isGrouped}
                onReply={() => onReply?.(item.message)}
                onEdit={() => onEdit?.(item.message)}
                onDelete={() => onDelete?.(item.message)}
                onReact={() => onReact?.(item.message)}
                onToggleReaction={(emoji) => onToggleReaction?.(item.message, emoji)}
                onPin={() => onPin?.(item.message)}
                onAvatarClick={() => onAvatarClick?.(item.message.author_id)}
                currentUserId={currentUserId}
              />
            );
          })}
        </AnimatePresence>
      </div>
      
      <div ref={bottomRef} />
    </div>
  );
}