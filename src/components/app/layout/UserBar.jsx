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
    <div className="px-2 py-[6px] flex items-center gap-0.5 flex-shrink-0"
      style={{ background: '#232428' }} role="status" aria-label="User panel">
      <button onClick={onStatusClick} className="flex items-center gap-2 flex-1 min-w-0 px-1 py-1 rounded hover:bg-[rgba(255,255,255,0.06)] transition-colors" aria-label="Change status">
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold overflow-hidden"
            style={{ background: colors.accent.primary, color: '#fff' }}>
            {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : name.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-[14px] h-[14px] rounded-full border-[3px]"
            style={{ background: isGhost ? colors.status.invisible : statusColor, borderColor: '#232428' }} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[13px] font-semibold truncate leading-tight flex items-center gap-1" style={{ color: '#fff' }}>
            {name}
            {isGhost && <Ghost className="w-3 h-3 flex-shrink-0" style={{ color: colors.accent.primary, opacity: 0.7 }} />}
          </div>
          <div className="text-[11px] truncate leading-tight" style={{ color: colors.text.muted }}>
            {isGhost ? '👻 Ghost Mode' : (customEmoji ? customEmoji + ' ' : '') + (customText || (status === 'online' ? 'Online' : status === 'idle' ? 'Idle' : status === 'dnd' ? 'Do Not Disturb' : status))}
          </div>
        </div>
      </button>
      <div className="flex items-center" role="group" aria-label="Audio controls">
        <button onClick={onToggleMute} className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors" title={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted ? <MicOff className="w-[18px] h-[18px]" style={{ color: colors.danger }} /> : <Mic className="w-[18px] h-[18px]" style={{ color: colors.text.secondary }} />}
        </button>
        <button onClick={onToggleDeafen} className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors" title={isDeafened ? 'Undeafen' : 'Deafen'}>
          {isDeafened ? <HeadphoneOff className="w-[18px] h-[18px]" style={{ color: colors.danger }} /> : <Headphones className="w-[18px] h-[18px]" style={{ color: colors.text.secondary }} />}
        </button>
        <button onClick={onSettings} className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors" title="User Settings">
          <Settings className="w-[18px] h-[18px]" style={{ color: colors.text.secondary }} />
        </button>
      </div>
    </div>
  );
}