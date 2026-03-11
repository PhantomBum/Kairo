import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useCallback, useEffect, useRef } from 'react';

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
    staleTime: 30000,
  });
}

export function useCategories(serverId) {
  return useQuery({
    queryKey: ['categories', serverId],
    queryFn: () => base44.entities.Category.filter({ server_id: serverId }),
    enabled: !!serverId,
    staleTime: 60000,
  });
}

export function useChannels(serverId) {
  return useQuery({
    queryKey: ['channels', serverId],
    queryFn: () => base44.entities.Channel.filter({ server_id: serverId }),
    enabled: !!serverId,
    staleTime: 30000,
  });
}

export function useMembers(serverId) {
  return useQuery({
    queryKey: ['members', serverId],
    queryFn: () => base44.entities.ServerMember.filter({ server_id: serverId }),
    enabled: !!serverId,
    staleTime: 30000,
  });
}

export function useRoles(serverId) {
  return useQuery({
    queryKey: ['roles', serverId],
    queryFn: () => base44.entities.Role.filter({ server_id: serverId }),
    enabled: !!serverId,
    staleTime: 60000,
  });
}

// ── Messages with real-time subscriptions ──
export function useMessages(channelId) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!channelId) return;
    const unsub = base44.entities.Message.subscribe((event) => {
      qc.invalidateQueries({ queryKey: ['messages', channelId] });
    });
    return unsub;
  }, [channelId, qc]);

  return useQuery({
    queryKey: ['messages', channelId],
    queryFn: async () => {
      const msgs = await base44.entities.Message.filter({ channel_id: channelId }, '-created_date', 100);
      return msgs.filter(m => !m.is_deleted).reverse();
    },
    enabled: !!channelId,
    staleTime: 5000,
  });
}

export function useDMMessages(conversationId) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;
    const unsub = base44.entities.DirectMessage.subscribe((event) => {
      qc.invalidateQueries({ queryKey: ['dmMessages', conversationId] });
    });
    return unsub;
  }, [conversationId, qc]);

  return useQuery({
    queryKey: ['dmMessages', conversationId],
    queryFn: async () => {
      const msgs = await base44.entities.DirectMessage.filter({ conversation_id: conversationId }, '-created_date', 100);
      return msgs.filter(m => !m.is_deleted).reverse();
    },
    enabled: !!conversationId,
    staleTime: 5000,
  });
}

// ── Conversations ──
export function useConversations(userEmail, userId) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!userEmail) return;
    const unsub = base44.entities.Conversation.subscribe(() => {
      qc.invalidateQueries({ queryKey: ['conversations', userEmail] });
    });
    return unsub;
  }, [userEmail, qc]);

  return useQuery({
    queryKey: ['conversations', userEmail],
    queryFn: async () => {
      const all = await base44.entities.Conversation.list('-last_message_at', 50);
      return all.filter(c => c.participants?.some(p => p.user_email === userEmail || p.user_id === userId));
    },
    enabled: !!userEmail,
    staleTime: 10000,
  });
}

// ── Friends ──
export function useFriends(userId) {
  return useQuery({
    queryKey: ['friends', userId],
    queryFn: () => base44.entities.Friendship.filter({ user_id: userId, status: 'accepted' }),
    enabled: !!userId,
    staleTime: 30000,
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
    staleTime: 15000,
  });
  const outgoing = useQuery({
    queryKey: ['outgoingRequests', userId],
    queryFn: () => base44.entities.Friendship.filter({ user_id: userId, status: 'pending' }),
    enabled: !!userId,
    staleTime: 15000,
  });
  return { incoming: incoming.data || [], outgoing: outgoing.data || [] };
}

// ── Blocked ──
export function useBlocked(userId) {
  return useQuery({
    queryKey: ['blocked', userId],
    queryFn: () => base44.entities.BlockedUser.filter({ user_id: userId }),
    enabled: !!userId,
    staleTime: 60000,
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
    staleTime: 30000,
  });
}