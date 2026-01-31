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
      );
    },
    enabled: !!userId,
  });

  const createOrGetConversation = useMutation({
    mutationFn: async ({ friendId, friendName, friendAvatar, userName, userAvatar }) => {
      // Check if conversation exists
      const existing = conversations.find(c => 
        c.participants?.some(p => p.user_id === friendId)
      );
      if (existing) return existing;

      return base44.entities.Conversation.create({
        participants: [
          { user_id: userId, user_name: userName, user_avatar: userAvatar },
          { user_id: friendId, user_name: friendName, user_avatar: friendAvatar },
        ],
        is_group: false,
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
  };
}

export function useDMMessages(conversationId) {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['dmMessages', conversationId],
    queryFn: async () => {
      const msgs = await base44.entities.DirectMessage.filter({ conversation_id: conversationId });
      return msgs.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    enabled: !!conversationId,
  });

  // Real-time subscription
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
    mutationFn: async ({ content, attachments, senderId, senderName, senderAvatar }) => {
      return base44.entities.DirectMessage.create({
        conversation_id: conversationId,
        sender_id: senderId,
        sender_name: senderName,
        sender_avatar: senderAvatar,
        content,
        attachments,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dmMessages', conversationId] });
    },
  });

  return {
    messages,
    isLoading,
    sendMessage: sendMessage.mutateAsync,
    isSending: sendMessage.isPending,
  };
}