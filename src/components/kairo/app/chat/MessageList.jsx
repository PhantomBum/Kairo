import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hash, Loader2 } from 'lucide-react';
import MessageItem from './MessageItem';

export default function MessageList({
  messages = [],
  currentUserId,
  channelName,
  isLoading,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onPin,
}) {
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
      {/* Welcome message */}
      {messages.length === 0 && (
        <div className="p-6 pt-16">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a1c] flex items-center justify-center mb-4">
            <Hash className="w-8 h-8 text-zinc-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Welcome to #{channelName}
          </h2>
          <p className="text-zinc-500">
            This is the start of the #{channelName} channel.
          </p>
        </div>
      )}

      {/* Messages */}
      <div className="p-4 space-y-1">
        <AnimatePresence initial={false}>
          {messages.map((message, i) => {
            const prevMessage = messages[i - 1];
            const showHeader = !prevMessage || 
              prevMessage.author_id !== message.author_id ||
              new Date(message.created_date) - new Date(prevMessage.created_date) > 5 * 60 * 1000;

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <MessageItem
                  message={message}
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
        <div ref={bottomRef} />
      </div>
    </div>
  );
}