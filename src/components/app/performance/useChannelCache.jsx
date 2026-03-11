import { useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const MAX_CACHED_CHANNELS = 5;

export function useChannelCache() {
  const qc = useQueryClient();
  const recentChannels = useRef([]);

  const trackChannel = useCallback((channelId) => {
    if (!channelId) return;
    recentChannels.current = [channelId, ...recentChannels.current.filter(id => id !== channelId)].slice(0, MAX_CACHED_CHANNELS);
  }, []);

  // Pre-fetch adjacent channels when switching
  const prefetchNearby = useCallback(async (channels, currentId) => {
    if (!channels?.length || !currentId) return;
    const idx = channels.findIndex(c => c.id === currentId);
    const nearby = channels.slice(Math.max(0, idx - 2), idx + 3).filter(c => c.id !== currentId && c.type === 'text');
    for (const ch of nearby.slice(0, 3)) {
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