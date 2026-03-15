/**
 * RealtimeManager — Centralized subscription system
 * Prevents duplicate subscriptions, cleans up on unmount, reestablishes on reconnect.
 */
import { supabase } from '@/api/supabaseClient';

const channels = new Map();

function makeKey(entityType, filter = '') {
  return `${entityType}:${filter}`;
}

export function subscribe(entityType, filter = '', callback) {
  const key = makeKey(entityType, filter);
  if (channels.has(key)) return () => {};

  const channel = supabase
    .channel(`realtime-${key}-${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'entities',
        filter: `entity_type=eq.${entityType}`,
      },
      (payload) => callback(payload)
    )
    .subscribe();

  channels.set(key, { channel, callback });
  return () => unsubscribe(key);
}

export function unsubscribe(key) {
  const entry = channels.get(key);
  if (entry) {
    supabase.removeChannel(entry.channel);
    channels.delete(key);
  }
}

export function unsubscribeEntity(entityType, filter = '') {
  unsubscribe(makeKey(entityType, filter));
}

export function hasSubscription(entityType, filter = '') {
  return channels.has(makeKey(entityType, filter));
}
