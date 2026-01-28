import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  X, Hash, MessageSquare, Users, Bell, BellOff, Archive,
  Lock, Pin, MoreHorizontal, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import MessageList from '../MessageList';
import MessageInput from '../MessageInput';

export default function ThreadPanel({ 
  thread,
  parentMessage,
  currentUser,
  userProfile,
  onClose
}) {
  const queryClient = useQueryClient();
  const [replyTo, setReplyTo] = useState(null);

  const { data: threadMessages = [], isLoading } = useQuery({
    queryKey: ['threadMessages', thread?.id],
    queryFn: () => base44.entities.Message.filter(
      { thread_id: thread.id },
      '-created_date',
      100
    ),
    enabled: !!thread?.id
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, attachments, replyToId }) => {
      // Create message in thread
      await base44.entities.Message.create({
        channel_id: thread.channel_id,
        server_id: thread.server_id,
        thread_id: thread.id,
        author_id: currentUser.id,
        author_name: userProfile?.display_name || currentUser.full_name,
        author_avatar: userProfile?.avatar_url,
        content,
        attachments,
        type: replyToId ? 'reply' : 'default',
        reply_to_id: replyToId
      });

      // Update thread message count
      await base44.entities.Thread.update(thread.id, {
        message_count: (thread.message_count || 0) + 1,
        last_message_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threadMessages', thread?.id] });
      setReplyTo(null);
    }
  });

  if (!thread) return null;

  return (
    <div className="w-96 h-full bg-[#121214] border-l border-zinc-800/50 flex flex-col">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-zinc-800/50">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-zinc-400" />
          <div>
            <h3 className="font-semibold text-white text-sm truncate max-w-[200px]">
              {thread.name}
            </h3>
            <p className="text-xs text-zinc-500">
              {thread.message_count || 0} messages
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors">
            <Bell className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors">
            <Pin className="w-4 h-4" />
          </button>
          <button 
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Parent message */}
      {parentMessage && (
        <div className="p-3 border-b border-zinc-800/50 bg-zinc-800/20">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0">
              {parentMessage.author_avatar ? (
                <img src={parentMessage.author_avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
                  {parentMessage.author_name?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{parentMessage.author_name}</span>
                <span className="text-xs text-zinc-500">
                  {format(new Date(parentMessage.created_date), 'MMM d, h:mm a')}
                </span>
              </div>
              <p className="text-sm text-zinc-300 line-clamp-2">{parentMessage.content}</p>
            </div>
          </div>
        </div>
      )}

      {/* Thread messages */}
      <div className="flex-1 flex flex-col min-h-0">
        <MessageList
          messages={[...threadMessages].reverse()}
          currentUserId={currentUser?.id}
          onReply={setReplyTo}
          isLoading={isLoading}
        />
        <MessageInput
          channelName={thread.name}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          onSendMessage={(data) => sendMessageMutation.mutate(data)}
        />
      </div>
    </div>
  );
}