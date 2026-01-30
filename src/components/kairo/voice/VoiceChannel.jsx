import React from 'react';
import AgoraVoiceChat from './AgoraVoiceChat';

// Voice channel wrapper - now uses Agora for real-time voice
export default function VoiceChannel({ 
  channel, 
  server,
  participants = [], 
  currentUser,
  onLeave,
  onUpdateVoiceState
}) {
  return (
    <AgoraVoiceChat
      channelId={channel?.id}
      channelName={channel?.name}
      serverName={server?.name}
      participants={participants}
      currentUser={currentUser}
      onLeave={onLeave}
      onUpdateVoiceState={onUpdateVoiceState}
    />
  );
}