import React from 'react';
import { Mic, MicOff, Headphones, HeadphoneOff, Settings } from 'lucide-react';

export default function UserBar({ profile, isMuted, isDeafened, onToggleMute, onToggleDeafen, onSettings }) {
  const name = profile?.display_name || profile?.username || 'User';
  const avatar = profile?.avatar_url;
  const status = profile?.status || 'online';

  const statusColors = { online: '#22c55e', idle: '#eab308', dnd: '#ef4444', invisible: '#555', offline: '#555' };

  return (
    <div className="px-2 py-2 flex items-center gap-2" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
      <div className="relative">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden"
          style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
          {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : name.charAt(0).toUpperCase()}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
          style={{ background: statusColors[status], borderColor: 'var(--bg)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[12px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{name}</div>
        <div className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
          {profile?.custom_status?.text || status}
        </div>
      </div>
      <div className="flex items-center gap-0.5">
        <button onClick={onToggleMute} className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-hover)]">
          {isMuted ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
        </button>
        <button onClick={onToggleDeafen} className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-hover)]">
          {isDeafened ? <HeadphoneOff className="w-3.5 h-3.5 text-red-400" /> : <Headphones className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
        </button>
        <button onClick={onSettings} className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-hover)]">
          <Settings className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>
    </div>
  );
}