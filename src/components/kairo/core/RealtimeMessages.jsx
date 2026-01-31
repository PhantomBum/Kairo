import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Real-time message subscription hook
export function useRealtimeMessages(channelId, enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!channelId || !enabled) return;

    const unsubscribe = base44.entities.Message.subscribe((event) => {
      if (event.data?.channel_id !== channelId) return;

      queryClient.setQueryData(['messages', channelId], (old = []) => {
        if (event.type === 'create') {
          // Check if message already exists (optimistic update)
          const exists = old.some(m => m.id === event.data.id);
          if (exists) return old;
          return [event.data, ...old];
        }
        if (event.type === 'update') {
          return old.map(m => m.id === event.id ? event.data : m);
        }
        if (event.type === 'delete') {
          return old.filter(m => m.id !== event.id);
        }
        return old;
      });
    });

    return unsubscribe;
  }, [channelId, enabled, queryClient]);
}

// Real-time DM subscription hook
export function useRealtimeDMs(conversationId, enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId || !enabled) return;

    const unsubscribe = base44.entities.DirectMessage.subscribe((event) => {
      if (event.data?.conversation_id !== conversationId) return;

      queryClient.setQueryData(['dmMessages', conversationId], (old = []) => {
        if (event.type === 'create') {
          const exists = old.some(m => m.id === event.data.id);
          if (exists) return old;
          return [event.data, ...old];
        }
        if (event.type === 'update') {
          return old.map(m => m.id === event.id ? event.data : m);
        }
        if (event.type === 'delete') {
          return old.filter(m => m.id !== event.id);
        }
        return old;
      });
    });

    return unsubscribe;
  }, [conversationId, enabled, queryClient]);
}

// Real-time typing indicators
export function useRealtimeTyping(channelId, conversationId) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const targetId = channelId || conversationId;
    if (!targetId) return;

    const unsubscribe = base44.entities.TypingIndicator.subscribe((event) => {
      const key = ['typing', targetId];
      
      if (event.type === 'create' || event.type === 'update') {
        const matchesChannel = channelId && event.data?.channel_id === channelId;
        const matchesConvo = conversationId && event.data?.conversation_id === conversationId;
        
        if (matchesChannel || matchesConvo) {
          queryClient.setQueryData(key, (old = []) => {
            const filtered = old.filter(t => t.user_id !== event.data.user_id);
            return [...filtered, event.data];
          });
        }
      }
      
      if (event.type === 'delete') {
        queryClient.setQueryData(key, (old = []) => 
          old.filter(t => t.id !== event.id)
        );
      }
    });

    return unsubscribe;
  }, [channelId, conversationId, queryClient]);
}

// Real-time presence updates
export function useRealtimePresence(userId) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = base44.entities.UserProfile.subscribe((event) => {
      if (event.type === 'update') {
        // Update all profile caches
        queryClient.invalidateQueries({ queryKey: ['allUserProfiles'] });
        queryClient.invalidateQueries({ queryKey: ['members'] });
      }
    });

    return unsubscribe;
  }, [userId, queryClient]);
}

// Real-time voice state updates
export function useRealtimeVoiceStates(serverId) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!serverId) return;

    const unsubscribe = base44.entities.VoiceState.subscribe((event) => {
      if (event.data?.server_id !== serverId && event.type !== 'delete') return;

      queryClient.setQueryData(['voiceStates', serverId], (old = []) => {
        if (event.type === 'create') {
          const exists = old.some(v => v.id === event.data.id);
          if (exists) return old;
          return [...old, event.data];
        }
        if (event.type === 'update') {
          return old.map(v => v.id === event.id ? event.data : v);
        }
        if (event.type === 'delete') {
          return old.filter(v => v.id !== event.id);
        }
        return old;
      });
    });

    return unsubscribe;
  }, [serverId, queryClient]);
}

// Real-time server member updates
export function useRealtimeMembers(serverId) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!serverId) return;

    const unsubscribe = base44.entities.ServerMember.subscribe((event) => {
      if (event.data?.server_id !== serverId && event.type !== 'delete') return;

      queryClient.invalidateQueries({ queryKey: ['members', serverId] });
    });

    return unsubscribe;
  }, [serverId, queryClient]);
}

// Combined hook for channel view
export function useChannelRealtime(channelId, serverId) {
  useRealtimeMessages(channelId);
  useRealtimeTyping(channelId, null);
  useRealtimeVoiceStates(serverId);
  useRealtimeMembers(serverId);
}

// Combined hook for DM view
export function useDMRealtime(conversationId) {
  useRealtimeDMs(conversationId);
  useRealtimeTyping(null, conversationId);
}