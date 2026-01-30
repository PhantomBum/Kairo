import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Hash, MessageSquare } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import MessageList from '../MessageList';
import MessageInput from '../MessageInput';
import { format } from 'date-fns';

export default function ThreadPanel({ 
  thread, 
  parentMessage, 
  currentUser, 
  onClose,
  channelName 
}) {
  const queryClient = useQueryClient();
  const [replyTo, setReplyTo] = useState(null);

  // Fetch thread messages
  const { data: threadMessages = [], isLoading } = useQuery({
    queryKey: ['threadMessages', thread?.id],
    queryFn: () => base44.entities.Message.filter({ thread_id: thread.id }, 'created_date', 100),
    enabled: !!thread?.id,
    refetchInterval: 3000
  });

  // Send message to thread
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, attachments }) => {
      const message = await base44.entities.Message.create({
        channel_id: parentMessage.channel_id,
        server_id: parentMessage.server_id,
        thread_id: thread.id,
        author_id: currentUser.id,
        author_name: currentUser.display_name || currentUser.full_name,
        author_avatar: currentUser.avatar_url,
        author_badges: currentUser.badges || [],
        content,
        attachments,
        type: 'default'
      });
      
      // Update thread message count
      await base44.entities.Thread.update(thread.id, {
        message_count: (thread.message_count || 0) + 1,
        last_message_at: new Date().toISOString()
      });
      
      return message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['threadMessages', thread?.id] });
      queryClient.invalidateQueries({ queryKey: ['threads'] });
    }
  });

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'tween', duration: 0.2 }}
      className="absolute inset-0 bg-[#121214] border-l border-zinc-800 flex flex-col z-50"
    >
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-zinc-800/50">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="font-semibold text-white">Thread</h3>
            <p className="text-xs text-zinc-500">
              <Hash className="w-3 h-3 inline" /> {channelName}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Parent message */}
      <div className="px-4 py-3 border-b border-zinc-800/50 bg-zinc-900/30">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            {parentMessage.author_avatar ? (
              <img src={parentMessage.author_avatar} alt="" className="w-full h-full rounded-full" />
            ) : (
              <span className="text-white text-sm font-medium">
                {parentMessage.author_name?.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-white">{parentMessage.author_name}</span>
              <span className="text-xs text-zinc-500">
                {format(new Date(parentMessage.created_date), 'MMM d, h:mm a')}
              </span>
            </div>
            <p className="text-sm text-zinc-300">{parentMessage.content}</p>
            <p className="text-xs text-indigo-400 mt-2">
              {thread.message_count || 0} {thread.message_count === 1 ? 'reply' : 'replies'}
            </p>
          </div>
        </div>
      </div>

      {/* Thread messages */}
      <div className="flex-1 flex flex-col min-h-0">
        <MessageList
          messages={threadMessages}
          currentUserId={currentUser.id}
          onReply={setReplyTo}
          onReact={() => {}}
          isLoading={isLoading}
        />
        <MessageInput
          channelName="Thread"
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          onSendMessage={(data) => sendMessageMutation.mutate(data)}
          placeholder="Reply to thread..."
        />
      </div>
    </motion.div>
  );
}