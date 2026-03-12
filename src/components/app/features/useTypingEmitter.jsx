import { useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';

export function useTypingEmitter(currentUser, profile) {
  const lastEmitRef = useRef(0);
  const indicatorIdRef = useRef(null);

  const emitTyping = useCallback(async (channelId) => {
    if (!channelId || !currentUser?.id) return;
    if (profile?.settings?.ghost_mode) return; // Ghost mode: no typing
    if (profile?.settings?.typing_indicators === false) return; // Disabled

    const now = Date.now();
    if (now - lastEmitRef.current < 3000) return; // Throttle to 3s
    lastEmitRef.current = now;

    // Upsert typing indicator
    if (indicatorIdRef.current) {
      try {
        await base44.entities.TypingIndicator.update(indicatorIdRef.current, { channel_id: channelId });
      } catch {
        indicatorIdRef.current = null;
      }
    }
    if (!indicatorIdRef.current) {
      const indicator = await base44.entities.TypingIndicator.create({
        channel_id: channelId,
        user_id: currentUser.id,
        user_name: profile?.display_name || currentUser.full_name,
      });
      indicatorIdRef.current = indicator.id;
      // Auto-cleanup after 6 seconds
      setTimeout(async () => {
        try { await base44.entities.TypingIndicator.delete(indicator.id); } catch {}
        if (indicatorIdRef.current === indicator.id) indicatorIdRef.current = null;
      }, 6000);
    }
  }, [currentUser?.id, profile?.display_name, profile?.settings?.ghost_mode, profile?.settings?.typing_indicators]);

  return emitTyping;
}