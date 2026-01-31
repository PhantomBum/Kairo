import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, MessageSquare, Users, Bell, BellOff, Pin, Hash,
  ChevronDown, Send, Smile, Paperclip, AtSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function ThreadMessage({ message, isOwn, onReply }) {
  return (
    <div className={cn(
      "group flex gap-3 px-4 py-2 hover:bg-white/[0.02] transition-colors",
      isOwn && "flex-row-reverse"
    )}>
      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
        {message.author_avatar ? (
          <img src={message.author_avatar} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {message.author_name?.charAt(0) || '?'}
            </span>
          </div>
        )}
      </div>
      
      <div className={cn("flex-1 min-w-0", isOwn && "text-right")}>
        <div className={cn("flex items-center gap-2 mb-1", isOwn && "flex-row-reverse")}>
          <span className="text-sm font-medium text-white">{message.author_name}</span>
          <span className="text-xs text-zinc-600">{format(new Date(message.created_date), 'h:mm a')}</span>
        </div>
        <p className="text-sm text-zinc-300">{message.content}</p>
      </div>
    </div>
  );
}

export default function ThreadView({
  isOpen,
  onClose,
  parentMessage,
  channelId,
  currentUser,
  serverName
}) {
  const [newMessage, setNewMessage] = useState('');
  const [isNotifying, setIsNotifying] = useState(true);
  const messagesEndRef = useRef(null);
  const queryClient = useQueryClient();

  // Fetch thread messages
  const { data: threadMessages = [], isLoading } = useQuery({
    queryKey: ['threadMessages', parentMessage?.id],
    queryFn: async () => {
      if (!parentMessage?.id) return [];
      const messages = await base44.entities.Message.filter({
        thread_id: parentMessage.id
      });
      return messages.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: !!parentMessage?.id && isOpen
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content) => {
      return base44.entities.Message.create({
        channel_id: channelId,
        thread_id: parentMessage.id,
        author_id: currentUser.user_id,
        author_name: currentUser.display_name,
        author_avatar: currentUser.avatar_url,
        content,
        type: 'default'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threadMessages', parentMessage?.id] });
      setNewMessage('');
    }
  });

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen || !parentMessage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-96 h-full bg-[#111113] border-l border-white/[0.06] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Thread</p>
              <p className="text-xs text-zinc-500">{serverName}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsNotifying(!isNotifying)}
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                isNotifying ? "text-white bg-white/5" : "text-zinc-500 hover:text-white hover:bg-white/5"
              )}
            >
              {isNotifying ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Parent message */}
        <div className="px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              {parentMessage.author_avatar ? (
                <img src={parentMessage.author_avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {parentMessage.author_name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-white">{parentMessage.author_name}</span>
                <span className="text-xs text-zinc-600">
                  {format(new Date(parentMessage.created_date), 'MMM d, h:mm a')}
                </span>
              </div>
              <p className="text-sm text-zinc-300 line-clamp-3">{parentMessage.content}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {threadMessages.length} replies
            </span>
            {threadMessages.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {new Set(threadMessages.map(m => m.author_id)).size} participants
              </span>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" />
            </div>
          ) : threadMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center px-4">
              <MessageSquare className="w-10 h-10 text-zinc-700 mb-2" />
              <p className="text-sm text-zinc-500">No replies yet</p>
              <p className="text-xs text-zinc-600">Be the first to reply!</p>
            </div>
          ) : (
            <div className="py-2">
              {threadMessages.map((message) => (
                <ThreadMessage
                  key={message.id}
                  message={message}
                  isOwn={message.author_id === currentUser?.user_id}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/[0.06]">
          <div className="flex items-center gap-2 bg-white/5 rounded-lg border border-white/10 px-3 py-2">
            <input
              type="text"
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Reply to thread..."
              className="flex-1 bg-transparent text-white text-sm placeholder:text-zinc-600 focus:outline-none"
            />
            <div className="flex items-center gap-1">
              <button className="w-7 h-7 rounded flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
                <Smile className="w-4 h-4" />
              </button>
              <button
                onClick={handleSend}
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
                className={cn(
                  "w-7 h-7 rounded flex items-center justify-center transition-colors",
                  newMessage.trim() 
                    ? "text-indigo-400 hover:text-indigo-300" 
                    : "text-zinc-600"
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}