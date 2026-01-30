// Presence sync hooks - DISABLED to improve performance
// All syncing disabled to prevent constant API hammering

export function usePresenceSync(userId) {
  // Disabled - causes too many API calls
  return null;
}

export function useVoiceStateSync(userId, voiceChannel) {
  // Disabled - causes too many API calls
  return null;
}

export function useMessageSync(channelId, enabled = true) {
  // Disabled - messages use optimistic updates instead
  return null;
}