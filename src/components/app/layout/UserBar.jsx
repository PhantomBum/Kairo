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
    <div className="px-2 py-1.5 flex items-center gap-1 flex-shrink-0" style={{ background: colors.bg.base, borderTop: `1px solid ${colors.border.default}` }} role="status" aria-label="User panel">
      <button onClick={onStatusClick} className="flex items-center gap-2.5 flex-1 min-w-0 px-2 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.04)]" aria-label="Change status">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${colors.bg.overlay}, ${colors.bg.elevated})`, color: colors.text.muted }}>
            {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : name.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-[14px] h-[14px] rounded-full border-[3px]"
            style={{ background: isGhost ? colors.status.invisible : statusColor, borderColor: colors.bg.base }} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[13px] font-semibold truncate leading-tight flex items-center gap-1.5" style={{ color: colors.text.primary }}>
            {name}
            {isGhost && <Ghost className="w-3 h-3 flex-shrink-0" style={{ color: colors.accent.primary, opacity: 0.7 }} />}
          </div>
          <div className="text-[11px] truncate leading-tight mt-0.5" style={{ color: colors.text.muted }}>
            {isGhost ? '👻 Ghost Mode' : (customEmoji ? customEmoji + ' ' : '') + (customText || (status === 'online' ? 'Online' : status === 'idle' ? 'Idle' : status === 'dnd' ? 'Do Not Disturb' : status))}
          </div>
        </div>
      </button>
      <div className="flex items-center gap-0.5" role="group" aria-label="Audio controls">
        <button onClick={onToggleMute} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)]"
          title={isMuted ? 'Unmute' : 'Mute'} aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'} aria-pressed={isMuted}>
          {isMuted ? <MicOff className="w-[18px] h-[18px]" style={{ color: colors.danger }} /> : <Mic className="w-[18px] h-[18px]" style={{ color: colors.text.muted }} />}
        </button>
        <button onClick={onToggleDeafen} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)]"
          title={isDeafened ? 'Undeafen' : 'Deafen'} aria-label={isDeafened ? 'Undeafen audio' : 'Deafen audio'} aria-pressed={isDeafened}>
          {isDeafened ? <HeadphoneOff className="w-[18px] h-[18px]" style={{ color: colors.danger }} /> : <Headphones className="w-[18px] h-[18px]" style={{ color: colors.text.muted }} />}
        </button>
        <button onClick={onSettings} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)]"
          title="User Settings" aria-label="User settings">
          <Settings className="w-[18px] h-[18px]" style={{ color: colors.text.muted }} />
        </button>
      </div>
    </div>
  );
}