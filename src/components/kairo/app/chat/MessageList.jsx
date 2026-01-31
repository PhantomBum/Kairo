import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Loader2, ChevronDown, Sparkles } from 'lucide-react';
import MessageItem from './MessageItem';
import TypingIndicator from './TypingIndicator';

export default function MessageList({
  messages = [],
  currentUserId,
  channelName,
  isLoading,
  typingUsers = [],
  onReply,
  onEdit,
  onDelete,
  onReact,
  onPin,
  onLoadMore,
  hasMore,
}) {
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const lastMessageCount = useRef(messages.length);

  // Track scroll position
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    setIsAtBottom(distanceFromBottom < 100);
    setShowScrollButton(distanceFromBottom > 400);

    // Load more when scrolling to top
    if (scrollTop < 100 && hasMore && !isLoading) {
      onLoadMore?.();
    }
  };

  // Auto-scroll on new messages if at bottom
  useEffect(() => {
    if (messages.length > lastMessageCount.current && isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    lastMessageCount.current = messages.length;
  }, [messages.length, isAtBottom]);

  // Initial scroll to bottom
  useEffect(() => {
    if (messages.length > 0 && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [channelName]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((acc, msg, i) => {
    const date = new Date(msg.created_date).toDateString();
    const prevDate = i > 0 ? new Date(messages[i - 1].created_date).toDateString() : null;
    
    if (date !== prevDate) {
      acc.push({ type: 'divider', date, id: `divider-${date}` });
    }
    acc.push({ type: 'message', data: msg, id: msg.id });
    return acc;
  }, []);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-zinc-500">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <div 
        ref={scrollRef} 
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-thin scroll-smooth"
      >
        {/* Welcome header */}
        <div className="px-4 pt-16 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
              <Hash className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                Welcome to #{channelName}
              </h2>
              <p className="text-zinc-500">
                This is the very beginning of the <span className="font-semibold text-zinc-300">#{channelName}</span> channel.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Loading indicator for older messages */}
        {isLoading && messages.length > 0 && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
          </div>
        )}

        {/* Messages */}
        <div className="px-0 pb-4">
          <AnimatePresence initial={false}>
            {groupedMessages.map((item, i) => {
              if (item.type === 'divider') {
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 px-4 py-4"
                  >
                    <div className="flex-1 h-px bg-white/[0.06]" />
                    <span className="text-xs font-medium text-zinc-600 px-2">
                      {formatDateDivider(item.date)}
                    </span>
                    <div className="flex-1 h-px bg-white/[0.06]" />
                  </motion.div>
                );
              }

              const message = item.data;
              const prevItem = groupedMessages[i - 1];
              const prevMessage = prevItem?.type === 'message' ? prevItem.data : null;
              
              const showHeader = !prevMessage || 
                prevMessage.author_id !== message.author_id ||
                new Date(message.created_date) - new Date(prevMessage.created_date) > 5 * 60 * 1000;

              return (
                <motion.div
                  key={message.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <MessageItem
                    message={{ ...message, current_user_id: currentUserId }}
                    showHeader={showHeader}
                    isOwn={message.author_id === currentUserId}
                    onReply={() => onReply(message)}
                    onEdit={() => onEdit(message)}
                    onDelete={() => onDelete(message)}
                    onReact={(emoji) => onReact(message, emoji)}
                    onPin={() => onPin(message)}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          <div ref={bottomRef} className="h-1" />
        </div>
      </div>

      {/* Typing indicator */}
      <AnimatePresence>
        {typingUsers.length > 0 && (
          <TypingIndicator users={typingUsers} />
        )}
      </AnimatePresence>

      {/* Scroll to bottom button */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-xl shadow-indigo-500/30 flex items-center justify-center transition-colors"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatDateDivider(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}