import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useEffect } from 'react';

export function useMessages(channelId) {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', channelId],
    queryFn: async () => {
      const msgs = await base44.entities.Message.filter({ channel_id: channelId });
      return msgs
        .filter(m => !m.is_deleted)
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: !!channelId,
  });

  // Real-time subscription
  useEffect(() => {
    if (!channelId) return;
    
    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data?.channel_id === channelId || event.data?.channel_id === channelId) {
        queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
      }
    });

    return unsubscribe;
  }, [channelId, queryClient]);

  const sendMessage = useMutation({
    mutationFn: async ({ content, attachments, replyToId, channelId, serverId, author }) => {
      return base44.entities.Message.create({
        channel_id: channelId,
        server_id: serverId,
        author_id: author.id,
        author_name: author.name,
        author_avatar: author.avatar,
        author_badges: author.badges || [],
        content,
        attachments,
        reply_to_id: replyToId,
        type: replyToId ? 'reply' : 'default',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
    },
  });

  const editMessage = useMutation({
    mutationFn: async ({ messageId, content }) => {
      return base44.entities.Message.update(messageId, {
        content,
        is_edited: true,
        edited_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async (messageId) => {
      return base44.entities.Message.update(messageId, { is_deleted: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
    },
  });

  const toggleReaction = useMutation({
    mutationFn: async ({ messageId, emoji, userId, currentReactions }) => {
      const reactions = currentReactions || [];
      const existing = reactions.find(r => r.emoji === emoji);
      
      let newReactions;
      if (existing) {
        const hasReacted = existing.users?.includes(userId);
        if (hasReacted) {
          newReactions = reactions.map(r => 
            r.emoji === emoji 
              ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== userId) }
              : r
          ).filter(r => r.count > 0);
        } else {
          newReactions = reactions.map(r => 
            r.emoji === emoji 
              ? { ...r, count: r.count + 1, users: [...(r.users || []), userId] }
              : r
          );
        }
      } else {
        newReactions = [...reactions, { emoji, count: 1, users: [userId] }];
      }
      
      return base44.entities.Message.update(messageId, { reactions: newReactions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
    },
  });

  const pinMessage = useMutation({
    mutationFn: async ({ messageId, isPinned }) => {
      return base44.entities.Message.update(messageId, { is_pinned: !isPinned });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
    },
  });

  return {
    messages,
    isLoading,
    sendMessage: sendMessage.mutateAsync,
    editMessage: editMessage.mutateAsync,
    deleteMessage: deleteMessage.mutateAsync,
    toggleReaction: toggleReaction.mutateAsync,
    pinMessage: pinMessage.mutateAsync,
    isSending: sendMessage.isPending,
  };
}