import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const RealtimeContext = createContext(null);

// Presence system for real-time user states
export function RealtimeProvider({ children, currentUser }) {
  const [presenceMap, setPresenceMap] = useState({}); // userId -> presence data
  const [typingUsers, setTypingUsers] = useState({}); // channelId -> [userId, ...]
  const [voiceStates, setVoiceStates] = useState({}); // channelId -> [voiceState, ...]
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [lastSync, setLastSync] = useState(null);
  
  const subscriptions = useRef([]);
  const heartbeatInterval = useRef(null);
  const typingTimeouts = useRef({});

  // Initialize subscriptions
  useEffect(() => {
    if (!currentUser?.id) return;

    setConnectionStatus('connecting');

    // Subscribe to message updates
    const msgUnsub = base44.entities.Message.subscribe((event) => {
      // Handle real-time message events
      window.dispatchEvent(new CustomEvent('kairo:message', { detail: event }));
    });
    subscriptions.current.push(msgUnsub);

    // Subscribe to voice state updates
    const voiceUnsub = base44.entities.VoiceState.subscribe((event) => {
      setVoiceStates(prev => {
        const channelId = event.data?.channel_id;
        if (!channelId) return prev;
        
        const channelStates = prev[channelId] || [];
        if (event.type === 'create') {
          return { ...prev, [channelId]: [...channelStates, event.data] };
        } else if (event.type === 'update') {
          return { ...prev, [channelId]: channelStates.map(s => s.id === event.id ? event.data : s) };
        } else if (event.type === 'delete') {
          return { ...prev, [channelId]: channelStates.filter(s => s.id !== event.id) };
        }
        return prev;
      });
    });
    subscriptions.current.push(voiceUnsub);

    // Subscribe to typing indicators
    const typingUnsub = base44.entities.TypingIndicator.subscribe((event) => {
      const data = event.data;
      const key = data?.channel_id || data?.conversation_id;
      if (!key || data?.user_id === currentUser.id) return;

      if (event.type === 'create' || event.type === 'update') {
        setTypingUsers(prev => {
          const existing = prev[key] || [];
          const filtered = existing.filter(u => u.user_id !== data.user_id);
          return { ...prev, [key]: [...filtered, data] };
        });

        // Auto-remove after 5 seconds
        const timeoutKey = `${key}-${data.user_id}`;
        if (typingTimeouts.current[timeoutKey]) {
          clearTimeout(typingTimeouts.current[timeoutKey]);
        }
        typingTimeouts.current[timeoutKey] = setTimeout(() => {
          setTypingUsers(prev => ({
            ...prev,
            [key]: (prev[key] || []).filter(u => u.user_id !== data.user_id)
          }));
        }, 5000);
      }
    });
    subscriptions.current.push(typingUnsub);

    // Start heartbeat for presence
    heartbeatInterval.current = setInterval(() => {
      updatePresence({ last_active: new Date().toISOString() });
    }, 30000);

    setConnectionStatus('connected');
    setLastSync(new Date());

    return () => {
      subscriptions.current.forEach(unsub => unsub?.());
      subscriptions.current = [];
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      Object.values(typingTimeouts.current).forEach(clearTimeout);
    };
  }, [currentUser?.id]);

  // Update own presence
  const updatePresence = useCallback(async (data) => {
    if (!currentUser?.id) return;
    // Update presence data (would typically be a separate presence system)
    setPresenceMap(prev => ({
      ...prev,
      [currentUser.id]: { ...prev[currentUser.id], ...data, updated_at: new Date().toISOString() }
    }));
  }, [currentUser?.id]);

  // Send typing indicator
  const sendTyping = useCallback(async (channelId, conversationId) => {
    if (!currentUser?.id) return;
    
    const filter = channelId 
      ? { user_id: currentUser.id, channel_id: channelId }
      : { user_id: currentUser.id, conversation_id: conversationId };
    
    const existing = await base44.entities.TypingIndicator.filter(filter);
    if (existing.length > 0) {
      await base44.entities.TypingIndicator.update(existing[0].id, { 
        started_at: new Date().toISOString() 
      });
    } else {
      await base44.entities.TypingIndicator.create({
        ...filter,
        user_name: currentUser.full_name,
        started_at: new Date().toISOString()
      });
    }
  }, [currentUser?.id, currentUser?.full_name]);

  // Get typing users for a channel/conversation
  const getTypingUsers = useCallback((channelId, conversationId) => {
    const key = channelId || conversationId;
    return typingUsers[key] || [];
  }, [typingUsers]);

  // Get voice states for a channel
  const getVoiceStates = useCallback((channelId) => {
    return voiceStates[channelId] || [];
  }, [voiceStates]);

  // Manual sync for offline recovery
  const forceSync = useCallback(async () => {
    setConnectionStatus('syncing');
    // Reload data as needed
    setLastSync(new Date());
    setConnectionStatus('connected');
  }, []);

  return (
    <RealtimeContext.Provider value={{
      presenceMap,
      updatePresence,
      typingUsers,
      sendTyping,
      getTypingUsers,
      voiceStates,
      getVoiceStates,
      connectionStatus,
      lastSync,
      forceSync
    }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtime must be used within RealtimeProvider');
  }
  return context;
}

export default RealtimeProvider;