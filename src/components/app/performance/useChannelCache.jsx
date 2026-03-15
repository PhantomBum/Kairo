import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const MAX_CACHED_CHANNELS = 8;

export function useChannelCache() {
  const qc = useQueryClient();
  const recentChannels = useRef([]);

  const trackChannel = useCallback((channelId) => {
    if (!channelId) return;
    const recent = recentChannels.current;
    if (recent[0] === channelId) return;
    recentChannels.current = [channelId, ...recent.filter(id => id !== channelId)].slice(0, MAX_CACHED_CHANNELS);

    const existing = qc.getQueryData(['messages', channelId]);
    if (!existing) {
      qc.prefetchQuery({
        queryKey: ['messages', channelId],
        queryFn: async () => {
          const msgs = await base44.entities.Message.filter({ channel_id: channelId }, '-created_date', 100);
          return msgs.filter(m => !m.is_deleted).reverse();
        },
        staleTime: 5000,
      });
    }
  }, [qc]);

  const prefetchNearby = useCallback(async (channels, currentId) => {
    if (!channels?.length || !currentId) return;
    const idx = channels.findIndex(c => c.id === currentId);
    const nearby = channels.slice(Math.max(0, idx - 1), idx + 3)
      .filter(c => c.id !== currentId && c.type === 'text');

    for (const ch of nearby.slice(0, 2)) {
      if (recentChannels.current.includes(ch.id)) continue;
      qc.prefetchQuery({
        queryKey: ['messages', ch.id],
        queryFn: async () => {
          const msgs = await base44.entities.Message.filter({ channel_id: ch.id }, '-created_date', 50);
          return msgs.filter(m => !m.is_deleted).reverse();
        },
        staleTime: 30000,
      });
    }
  }, [qc]);

  return { trackChannel, prefetchNearby, recentChannels };
}
