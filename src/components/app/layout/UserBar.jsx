import React from 'react';
import { Mic, MicOff, Headphones, HeadphoneOff, Settings, Ghost, Shield } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

const P = {
  base: colors.bg.base,
  textPrimary: colors.text.primary,
  muted: colors.text.muted,
  accent: colors.accent.primary,
};

const ADMIN_EMAILS = ['ilikebagels1612@gmail.com', 'rdw1612@gmail.com'];

const STATUS_COLORS = {
  online: colors.status.online,
  idle: colors.status.idle,
  dnd: colors.status.dnd,
  offline: colors.text.muted,
  invisible: colors.text.muted,
};

export default function UserBar({ profile, isMuted, isDeafened, onToggleMute, onToggleDeafen, onSettings, onStatusClick, userEmail }) {
  const name = profile?.display_name || profile?.username || 'User';
  const avatar = profile?.avatar_url;
  const status = profile?.status || 'online';
  const statusColor = STATUS_COLORS[status] || STATUS_COLORS.offline;
  const customText = profile?.custom_status?.text;
  const customEmoji = profile?.custom_status?.emoji;
  const isGhost = profile?.settings?.ghost_mode;
  const isAdmin = ADMIN_EMAILS.includes(userEmail?.toLowerCase());

  return (
    <div className="k-user-bar px-3 h-[60px] min-h-[60px] max-h-[60px] flex items-center gap-2 flex-shrink-0"
      style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-faint)',
        boxShadow: 'inset 0 1px 0 var(--surface-glass)',
      }}
      role="status" aria-label="User panel">

      {/* Avatar + name + status */}
      <button onClick={onStatusClick}
        className="flex items-center gap-3 flex-1 min-w-0 px-2 py-2 rounded-[10px] transition-colors hover:bg-[var(--surface-glass)]"
        aria-label="Change status">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-semibold overflow-hidden"
            style={{
              background: avatar ? 'transparent' : P.accent,
              color: avatar ? undefined : '#0d1117', // dark text on teal for contrast
              boxShadow: `0 0 0 2px var(--bg-surface), 0 0 0 4px ${isGhost ? STATUS_COLORS.invisible : statusColor}`,
            }}>
            {avatar
              ? <img src={avatar} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} />
              : name.charAt(0).toUpperCase()
            }
          </div>
          {isAdmin && (
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: 'var(--accent-primary)', boxShadow: `0 0 0 2px ${P.base}` }}>
              <Shield className="w-2.5 h-2.5" style={{ color: '#0d1117' }} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="text-[14px] font-semibold truncate leading-tight flex items-center gap-1"
            style={{ color: P.textPrimary }}>
            {name}
            {isGhost && <Ghost className="w-3 h-3 flex-shrink-0" style={{ color: P.accent, opacity: 0.7 }} />}
          </div>
          <div className="text-[12px] truncate leading-tight mt-px" style={{ color: 'var(--text-muted)' }}>
            {isGhost
              ? 'Ghost Mode'
              : (customEmoji ? customEmoji + ' ' : '') + (
                customText || (
                  status === 'online' ? 'Online'
                  : status === 'idle' ? 'Idle'
                  : status === 'dnd' ? 'Do Not Disturb'
                  : status
                )
              )
            }
          </div>
        </div>
      </button>

      {/* Action buttons — 32px each */}
      <div className="flex items-center gap-1" role="group" aria-label="Audio controls">
        <button onClick={onToggleMute}
          className="w-8 h-8 flex items-center justify-center rounded-[10px] transition-colors"
          style={{ background: isMuted ? 'rgba(240,71,71,0.15)' : 'transparent' }}
          onMouseEnter={e => { if (!isMuted) e.currentTarget.style.background = 'var(--surface-glass)'; }}
          onMouseLeave={e => { if (!isMuted) e.currentTarget.style.background = 'transparent'; }}
          title={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted
            ? <MicOff className="w-[18px] h-[18px]" style={{ color: 'var(--color-danger)' }} />
            : <Mic className="w-[18px] h-[18px]" style={{ color: P.muted }} />
          }
        </button>
        <button onClick={onToggleDeafen}
          className="w-8 h-8 flex items-center justify-center rounded-[10px] transition-colors hover:bg-[var(--surface-glass)]"
          title={isDeafened ? 'Undeafen' : 'Deafen'}>
          {isDeafened
            ? <HeadphoneOff className="w-[18px] h-[18px]" style={{ color: 'var(--color-danger)' }} />
            : <Headphones className="w-[18px] h-[18px]" style={{ color: P.muted }} />
          }
        </button>
        <button onClick={onSettings}
          className="w-8 h-8 flex items-center justify-center rounded-[10px] transition-colors hover:bg-[var(--surface-glass)]"
          title="User Settings">
          <Settings className="w-[18px] h-[18px]" style={{ color: P.muted }} />
        </button>
      </div>
    </div>
  );
}
