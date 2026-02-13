import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useEffect } from 'react';

export function useConversations(userId, userEmail) {
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      const convos = await base44.entities.Conversation.filter({});
      return convos.filter(c => 
        c.participants?.some(p => 
          p.user_id === userId || p.user_email === userEmail
        )
      ).sort((a, b) => new Date(b.last_message_at || b.created_date) - new Date(a.last_message_at || a.created_date));
    },
    enabled: !!userId,
  });

  const createOrGetConversation = useMutation({
    mutationFn: async ({ friendId, friendName, friendAvatar, userName, userAvatar }) => {
      const existing = conversations.find(c => 
        c.participants?.some(p => p.user_id === friendId)
      );
      if (existing) return existing;

      return base44.entities.Conversation.create({
        type: 'dm',
        participants: [
          { user_id: userId, user_email: userEmail, user_name: userName, avatar: userAvatar },
          { user_id: friendId, user_name: friendName, avatar: friendAvatar },
        ],
        last_message_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const createGroupConversation = useMutation({
    mutationFn: async ({ name, participantList }) => {
      return base44.entities.Conversation.create({
        type: 'group',
        name,
        participants: participantList,
        owner_id: userId,
        last_message_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  return {
    conversations,
    isLoading,
    startConversation: createOrGetConversation.mutateAsync,
    createGroupConversation: createGroupConversation.mutateAsync,
  };
}

export function useDMMessages(conversationId) {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['dmMessages', conversationId],
    queryFn: async () => {
      const msgs = await base44.entities.DirectMessage.filter({ conversation_id: conversationId });
      return msgs
        .filter(m => !m.is_deleted)
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = base44.entities.DirectMessage.subscribe((event) => {
      if (event.data?.conversation_id === conversationId) {
        queryClient.invalidateQueries({ queryKey: ['dmMessages', conversationId] });
      }
    });
    return unsubscribe;
  }, [conversationId, queryClient]);

  const sendMessage = useMutation({
    mutationFn: async ({ content, attachments, replyToId, replyPreview, senderId, senderName, senderAvatar }) => {
      const msg = await base44.entities.DirectMessage.create({
        conversation_id: conversationId,
        author_id: senderId,
        author_name: senderName,
        author_avatar: senderAvatar,
        content,
        attachments,
        reply_to_id: replyToId,
        type: replyToId ? 'reply' : 'default',
      });
      await base44.entities.Conversation.update(conversationId, {
        last_message_at: new Date().toISOString(),
        last_message_preview: content?.slice(0, 50),
      });
      return msg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dmMessages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const editMessage = useMutation({
    mutationFn: async ({ messageId, content }) => {
      return base44.entities.DirectMessage.update(messageId, {
        content,
        is_edited: true,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dmMessages', conversationId] });
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async (messageId) => {
      return base44.entities.DirectMessage.update(messageId, { is_deleted: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dmMessages', conversationId] });
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
          newReactions = reactions.map(r => r.emoji === emoji ? { ...r, count: r.count - 1, users: r.users.filter(u => u !== userId) } : r).filter(r => r.count > 0);
        } else {
          newReactions = reactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, users: [...(r.users || []), userId] } : r);
        }
      } else {
        newReactions = [...reactions, { emoji, count: 1, users: [userId] }];
      }
      return base44.entities.DirectMessage.update(messageId, { reactions: newReactions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dmMessages', conversationId] });
    },
  });

  return {
    messages,
    isLoading,
    sendMessage: sendMessage.mutateAsync,
    editMessage: editMessage.mutateAsync,
    deleteMessage: deleteMessage.mutateAsync,
    toggleReaction: toggleReaction.mutateAsync,
    isSending: sendMessage.isPending,
  };
}