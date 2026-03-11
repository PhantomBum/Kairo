import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useCallback } from 'react';

// ── Server data ──
export function useServers(userId, userEmail) {
  return useQuery({
    queryKey: ['servers', userId],
    queryFn: async () => {
      const [servers, memberships] = await Promise.all([
        base44.entities.Server.list(),
        base44.entities.ServerMember.list(),
      ]);
      const myIds = new Set(
        memberships
          .filter(m => m.user_id === userId || m.user_email === userEmail || m.created_by === userEmail)
          .map(m => m.server_id)
      );
      return servers.filter(s => myIds.has(s.id) || s.owner_id === userId || s.created_by === userEmail);
    },
    enabled: !!userId,
  });
}

export function useCategories(serverId) {
  return useQuery({
    queryKey: ['categories', serverId],
    queryFn: () => base44.entities.Category.filter({ server_id: serverId }),
    enabled: !!serverId,
  });
}

export function useChannels(serverId) {
  return useQuery({
    queryKey: ['channels', serverId],
    queryFn: () => base44.entities.Channel.filter({ server_id: serverId }),
    enabled: !!serverId,
  });
}

export function useMembers(serverId) {
  return useQuery({
    queryKey: ['members', serverId],
    queryFn: () => base44.entities.ServerMember.filter({ server_id: serverId }),
    enabled: !!serverId,
  });
}

export function useRoles(serverId) {
  return useQuery({
    queryKey: ['roles', serverId],
    queryFn: () => base44.entities.Role.filter({ server_id: serverId }),
    enabled: !!serverId,
  });
}

// ── Messages ──
export function useMessages(channelId) {
  return useQuery({
    queryKey: ['messages', channelId],
    queryFn: async () => {
      const msgs = await base44.entities.Message.filter({ channel_id: channelId }, '-created_date', 100);
      return msgs.filter(m => !m.is_deleted).reverse();
    },
    enabled: !!channelId,
    refetchInterval: 4000,
  });
}

export function useDMMessages(conversationId) {
  return useQuery({
    queryKey: ['dmMessages', conversationId],
    queryFn: async () => {
      const msgs = await base44.entities.DirectMessage.filter({ conversation_id: conversationId }, '-created_date', 100);
      return msgs.filter(m => !m.is_deleted).reverse();
    },
    enabled: !!conversationId,
    refetchInterval: 4000,
  });
}

// ── Conversations ──
export function useConversations(userEmail, userId) {
  return useQuery({
    queryKey: ['conversations', userEmail],
    queryFn: async () => {
      const all = await base44.entities.Conversation.list('-last_message_at', 50);
      return all.filter(c => c.participants?.some(p => p.user_email === userEmail || p.user_id === userId));
    },
    enabled: !!userEmail,
  });
}

// ── Friends ──
export function useFriends(userId) {
  return useQuery({
    queryKey: ['friends', userId],
    queryFn: () => base44.entities.Friendship.filter({ user_id: userId, status: 'accepted' }),
    enabled: !!userId,
  });
}

export function useFriendRequests(userId, userEmail) {
  const incoming = useQuery({
    queryKey: ['incomingRequests', userId],
    queryFn: async () => {
      const all = await base44.entities.Friendship.filter({ status: 'pending' });
      return all.filter(f => f.friend_id === userId || f.friend_email === userEmail);
    },
    enabled: !!userId,
  });
  const outgoing = useQuery({
    queryKey: ['outgoingRequests', userId],
    queryFn: () => base44.entities.Friendship.filter({ user_id: userId, status: 'pending' }),
    enabled: !!userId,
  });
  return { incoming: incoming.data || [], outgoing: outgoing.data || [] };
}

// ── Blocked ──
export function useBlocked(userId) {
  return useQuery({
    queryKey: ['blocked', userId],
    queryFn: () => base44.entities.BlockedUser.filter({ user_id: userId }),
    enabled: !!userId,
  });
}

// ── Profile ──
export function useMyProfile(email) {
  return useQuery({
    queryKey: ['myProfile', email],
    queryFn: async () => {
      const p = await base44.entities.UserProfile.filter({ user_email: email });
      return p[0] || null;
    },
    enabled: !!email,
  });
}