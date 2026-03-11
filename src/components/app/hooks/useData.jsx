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
  // Debounce invalidation to prevent duplicate real-time events
  const debounceRef = useRef(null);
  // Track seen event IDs to prevent duplicate processing on reconnection
  const seenEventsRef = useRef(new Set());

  useEffect(() => {
    if (!channelId) return;
    // Reset seen events on channel change
    seenEventsRef.current = new Set();
    const unsub = base44.entities.Message.subscribe((event) => {
      // Only invalidate if this event is for our channel
      if (event.data?.channel_id && event.data.channel_id !== channelId) return;
      // Deduplicate events (handles reconnection replay)
      const eventKey = `${event.type}_${event.id}_${event.data?.updated_date || event.data?.created_date || ''}`;
      if (seenEventsRef.current.has(eventKey)) return;
      seenEventsRef.current.add(eventKey);
      // Keep seen set bounded
      if (seenEventsRef.current.size > 500) {
        const arr = [...seenEventsRef.current];
        seenEventsRef.current = new Set(arr.slice(-250));
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        qc.invalidateQueries({ queryKey: ['messages', channelId] });
      }, 200);
    });
    return () => {
      unsub();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
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
  const debounceRef = useRef(null);
  const seenEventsRef = useRef(new Set());

  useEffect(() => {
    if (!conversationId) return;
    seenEventsRef.current = new Set();
    const unsub = base44.entities.DirectMessage.subscribe((event) => {
      if (event.data?.conversation_id && event.data.conversation_id !== conversationId) return;
      const eventKey = `${event.type}_${event.id}_${event.data?.updated_date || event.data?.created_date || ''}`;
      if (seenEventsRef.current.has(eventKey)) return;
      seenEventsRef.current.add(eventKey);
      if (seenEventsRef.current.size > 500) {
        const arr = [...seenEventsRef.current];
        seenEventsRef.current = new Set(arr.slice(-250));
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        qc.invalidateQueries({ queryKey: ['dmMessages', conversationId] });
      }, 200);
    });
    return () => {
      unsub();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
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

// ── Conversations with real-time sync (group name/icon updates) ──
export function useConversations(userEmail, userId) {
  const qc = useQueryClient();
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!userEmail) return;
    const unsub = base44.entities.Conversation.subscribe(() => {
      // Debounce to prevent rapid re-fetches when multiple events arrive
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        qc.invalidateQueries({ queryKey: ['conversations', userEmail] });
      }, 300);
    });
    return () => { unsub(); if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [userEmail, qc]);

  // Also listen for new DMs to refresh conversation order
  useEffect(() => {
    if (!userEmail) return;
    const unsub = base44.entities.DirectMessage.subscribe(() => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        qc.invalidateQueries({ queryKey: ['conversations', userEmail] });
      }, 300);
    });
    return () => { unsub(); if (debounceRef.current) clearTimeout(debounceRef.current); };
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

// ── Friends with real-time subscription ──
export function useFriends(userId) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const unsub = base44.entities.Friendship.subscribe(() => {
      qc.invalidateQueries({ queryKey: ['friends', userId] });
    });
    return unsub;
  }, [userId, qc]);

  return useQuery({
    queryKey: ['friends', userId],
    queryFn: () => base44.entities.Friendship.filter({ user_id: userId, status: 'accepted' }),
    enabled: !!userId,
    staleTime: 30000,
  });
}

export function useFriendRequests(userId, userEmail) {
  const qc = useQueryClient();

  // Real-time subscription for friend requests — appear without refresh
  useEffect(() => {
    if (!userId) return;
    const unsub = base44.entities.Friendship.subscribe(() => {
      // Immediately invalidate both incoming and outgoing so requests show in real-time
      qc.invalidateQueries({ queryKey: ['incomingRequests', userId] });
      qc.invalidateQueries({ queryKey: ['outgoingRequests', userId] });
      // Also refresh friends list in case a request was accepted
      qc.invalidateQueries({ queryKey: ['friends', userId] });
    });
    return unsub;
  }, [userId, qc]);

  const incoming = useQuery({
    queryKey: ['incomingRequests', userId],
    queryFn: async () => {
      const all = await base44.entities.Friendship.filter({ status: 'pending' });
      return all.filter(f => f.friend_id === userId || f.friend_email === userEmail);
    },
    enabled: !!userId,
    staleTime: 5000, // Reduced from 15s for more responsive updates
    refetchOnWindowFocus: true,
  });
  const outgoing = useQuery({
    queryKey: ['outgoingRequests', userId],
    queryFn: () => base44.entities.Friendship.filter({ user_id: userId, status: 'pending' }),
    enabled: !!userId,
    staleTime: 5000,
    refetchOnWindowFocus: true,
  });
  return { incoming: incoming.data || [], outgoing: outgoing.data || [] };
}

// ── Blocked ──
export function useBlocked(userId) {
  const qc = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    const unsub = base44.entities.BlockedUser.subscribe(() => {
      qc.invalidateQueries({ queryKey: ['blocked', userId] });
      // Also refresh conversations and friends when block list changes
      qc.invalidateQueries({ queryKey: ['conversations'] });
      qc.invalidateQueries({ queryKey: ['friends', userId] });
    });
    return unsub;
  }, [userId, qc]);

  return useQuery({
    queryKey: ['blocked', userId],
    queryFn: () => base44.entities.BlockedUser.filter({ user_id: userId }),
    enabled: !!userId,
    staleTime: 30000,
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