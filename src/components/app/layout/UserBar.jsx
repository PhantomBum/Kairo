import React from 'react';
import { Mic, MicOff, Headphones, HeadphoneOff, Settings, Ghost } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

export default function UserBar({ profile, isMuted, isDeafened, onToggleMute, onToggleDeafen, onSettings, onStatusClick }) {
  const name = profile?.display_name || profile?.username || 'User';
  const avatar = profile?.avatar_url;
  const status = profile?.status || 'online';
  const statusColor = colors.status[status] || colors.status.offline;
  const customText = profile?.custom_status?.text;
  const customEmoji = profile?.custom_status?.emoji;
  const isGhost = profile?.settings?.ghost_mode;

  return (
    <div className="px-1.5 py-1 flex items-center gap-px flex-shrink-0"
      style={{ background: colors.bg.base, borderTop: `1px solid rgba(255,255,255,0.04)` }} role="status" aria-label="User panel">
      <button onClick={onStatusClick} className="flex items-center gap-2 flex-1 min-w-0 px-1.5 py-1 rounded-md hover:bg-[rgba(255,255,255,0.05)] transition-colors" aria-label="Change status">
        <div className="relative flex-shrink-0">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold overflow-hidden"
            style={{ background: colors.accent.primary, color: '#fff' }}>
            {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : name.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
            style={{ background: isGhost ? colors.status.invisible : statusColor, borderColor: colors.bg.base }} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[12px] font-semibold truncate leading-tight flex items-center gap-1" style={{ color: colors.text.primary }}>
            {name}
            {isGhost && <Ghost className="w-2.5 h-2.5 flex-shrink-0" style={{ color: colors.accent.primary, opacity: 0.7 }} />}
          </div>
          <div className="text-[10px] truncate leading-tight" style={{ color: colors.text.muted }}>
            {isGhost ? '👻 Ghost Mode' : (customEmoji ? customEmoji + ' ' : '') + (customText || (status === 'online' ? 'Online' : status === 'idle' ? 'Idle' : status === 'dnd' ? 'Do Not Disturb' : status))}
          </div>
        </div>
      </button>
      <div className="flex items-center" role="group" aria-label="Audio controls">
        <button onClick={onToggleMute} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.08)] transition-colors" title={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted ? <MicOff className="w-4 h-4" style={{ color: colors.danger }} /> : <Mic className="w-4 h-4" style={{ color: colors.text.muted }} />}
        </button>
        <button onClick={onToggleDeafen} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.08)] transition-colors" title={isDeafened ? 'Undeafen' : 'Deafen'}>
          {isDeafened ? <HeadphoneOff className="w-4 h-4" style={{ color: colors.danger }} /> : <Headphones className="w-4 h-4" style={{ color: colors.text.muted }} />}
        </button>
        <button onClick={onSettings} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.08)] transition-colors" title="User Settings">
          <Settings className="w-4 h-4" style={{ color: colors.text.muted }} />
        </button>
      </div>
    </div>
  );
}