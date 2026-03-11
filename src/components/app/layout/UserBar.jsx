import React from 'react';
import { Mic, MicOff, Headphones, Settings } from 'lucide-react';

const statusColors = { online: '#7bc9a4', idle: '#c9b47b', dnd: '#c97b7b', invisible: '#555248', offline: '#555248' };

export default function UserBar({ profile, isMuted, isDeafened, onToggleMute, onToggleDeafen, onSettings, onStatusClick }) {
  const name = profile?.display_name || profile?.username || 'User';
  const avatar = profile?.avatar_url;
  const status = profile?.status || 'online';

  return (
    <div className="h-14 px-2 flex items-center gap-1 flex-shrink-0" style={{ background: 'var(--bg-deep)', borderTop: '1px solid var(--border)' }}>
      <button onClick={onStatusClick} className="flex items-center gap-2 flex-1 min-w-0 px-1.5 py-1 rounded-lg transition-colors hover:bg-[var(--bg-glass-hover)]">
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium overflow-hidden"
            style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
            {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : name.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
            style={{ background: statusColors[status], borderColor: 'var(--bg-deep)' }} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[11px] font-medium truncate" style={{ color: 'var(--text-cream)' }}>{name}</div>
          <div className="text-[9px] truncate" style={{ color: 'var(--text-muted)' }}>
            {profile?.custom_status?.emoji ? profile.custom_status.emoji + ' ' : ''}{profile?.custom_status?.text || status}
          </div>
        </div>
      </button>
      <div className="flex items-center gap-px">
        <button onClick={onToggleMute} className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-glass-hover)]">
          {isMuted ? <MicOff className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} /> : <Mic className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
        </button>
        <button onClick={onToggleDeafen} className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-glass-hover)]">
          <Headphones className="w-3.5 h-3.5" style={{ color: isDeafened ? 'var(--accent-red)' : 'var(--text-muted)' }} />
        </button>
        <button onClick={onSettings} className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-glass-hover)]">
          <Settings className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>
    </div>
  );
}