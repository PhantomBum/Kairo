import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Real-time presence synchronization
export function usePresenceSync(userId) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    // Update presence every 30 seconds
    const updatePresence = async () => {
      try {
        const profile = await base44.entities.UserProfile.filter({ user_id: userId });
        if (profile.length > 0) {
          await base44.entities.UserProfile.update(profile[0].id, {
            last_seen: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error('Failed to update presence:', error);
      }
    };

    updatePresence();
    const interval = setInterval(updatePresence, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  return null;
}

// Voice state synchronization
export function useVoiceStateSync(userId, voiceChannel) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId || !voiceChannel) return;

    // Sync voice state every 10 seconds
    const syncVoiceState = () => {
      queryClient.invalidateQueries({ queryKey: ['voiceStates'] });
    };

    const interval = setInterval(syncVoiceState, 10000);
    return () => clearInterval(interval);
  }, [userId, voiceChannel, queryClient]);

  return null;
}

// Message synchronization
export function useMessageSync(channelId, enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!channelId || !enabled) return;

    // Poll for new messages every 3 seconds
    const syncMessages = () => {
      queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
    };

    const interval = setInterval(syncMessages, 3000);
    return () => clearInterval(interval);
  }, [channelId, enabled, queryClient]);

  return null;
}