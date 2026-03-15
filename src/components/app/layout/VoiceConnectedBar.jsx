import React from 'react';
import { Signal, Mic, MicOff, Headphones, HeadphoneOff, PhoneOff, Video } from 'lucide-react';

const P = {
  base: '#18181c', surface: '#1e1e23', border: '#33333d',
  textPrimary: '#f0eff4', muted: '#68677a',
  accent: '#2dd4bf', success: '#34d399', danger: '#f87171',
};

export default function VoiceConnectedBar({
  channelName, serverName, isMuted, isDeafened,
  onToggleMute, onToggleDeafen, onDisconnect, onClick,
}) {
  if (!channelName) return null;

  return (
    <div className="px-2 py-1.5 flex items-center gap-2" style={{ background: P.surface, borderTop: `1px solid ${P.border}` }}>
      <button onClick={onClick} className="flex-1 min-w-0 flex items-center gap-2 px-1.5 py-1 rounded-md transition-colors hover:bg-[rgba(255,255,255,0.04)]">
        <Signal className="w-3.5 h-3.5 flex-shrink-0" style={{ color: P.success }} />
        <div className="min-w-0">
          <div className="text-[12px] font-semibold truncate leading-tight" style={{ color: P.success }}>Voice Connected</div>
          <div className="text-[11px] truncate" style={{ color: P.muted }}>{channelName} / {serverName}</div>
        </div>
      </button>
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button onClick={onToggleMute}
          className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-[rgba(255,255,255,0.06)]"
          title={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted ? <MicOff className="w-3.5 h-3.5" style={{ color: P.danger }} /> : <Mic className="w-3.5 h-3.5" style={{ color: P.muted }} />}
        </button>
        <button onClick={onToggleDeafen}
          className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-[rgba(255,255,255,0.06)]"
          title={isDeafened ? 'Undeafen' : 'Deafen'}>
          {isDeafened ? <HeadphoneOff className="w-3.5 h-3.5" style={{ color: P.danger }} /> : <Headphones className="w-3.5 h-3.5" style={{ color: P.muted }} />}
        </button>
        <button onClick={onDisconnect}
          className="w-7 h-7 flex items-center justify-center rounded-md transition-colors hover:bg-[rgba(237,66,69,0.1)]"
          title="Disconnect">
          <PhoneOff className="w-3.5 h-3.5" style={{ color: P.danger }} />
        </button>
      </div>
    </div>
  );
}
