import React from 'react';
import { Mic, MicOff, Headphones, Settings, Ghost } from 'lucide-react';
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
    <div className="px-2 py-2 flex items-center gap-1 flex-shrink-0" style={{ background: colors.bg.base, borderTop: `1px solid ${colors.border.default}` }} role="status" aria-label="User panel">
      <button onClick={onStatusClick} className="flex items-center gap-2.5 flex-1 min-w-0 px-1.5 py-1.5 rounded-md hover:bg-[rgba(255,255,255,0.04)]" aria-label="Change status">
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold overflow-hidden"
            style={{ background: colors.bg.overlay, color: colors.text.muted }}>
            {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : name.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-[14px] h-[14px] rounded-full border-[3px]"
            style={{ background: isGhost ? colors.status.invisible : statusColor, borderColor: colors.bg.base }} />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-[13px] font-semibold truncate leading-tight flex items-center gap-1" style={{ color: colors.text.primary }}>
            {name}
            {isGhost && <Ghost className="w-3 h-3 flex-shrink-0" style={{ color: colors.accent.primary, opacity: 0.6 }} />}
          </div>
          <div className="text-[11px] truncate leading-tight" style={{ color: colors.text.muted }}>
            {isGhost ? '👻 Ghost Mode' : (customEmoji ? customEmoji + ' ' : '') + (customText || status)}
          </div>
        </div>
      </button>
      <div className="flex items-center" role="group" aria-label="Audio controls">
        <button onClick={onToggleMute} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)]"
          title={isMuted ? 'Unmute' : 'Mute'} aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'} aria-pressed={isMuted}>
          {isMuted ? <MicOff className="w-[18px] h-[18px]" style={{ color: colors.danger }} /> : <Mic className="w-[18px] h-[18px]" style={{ color: colors.text.muted }} />}
        </button>
        <button onClick={onToggleDeafen} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)]"
          title={isDeafened ? 'Undeafen' : 'Deafen'} aria-label={isDeafened ? 'Undeafen audio' : 'Deafen audio'} aria-pressed={isDeafened}>
          <Headphones className="w-[18px] h-[18px]" style={{ color: isDeafened ? colors.danger : colors.text.muted }} />
        </button>
        <button onClick={onSettings} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)]"
          title="User Settings" aria-label="User settings">
          <Settings className="w-[18px] h-[18px]" style={{ color: colors.text.muted }} />
        </button>
      </div>
    </div>
  );
}