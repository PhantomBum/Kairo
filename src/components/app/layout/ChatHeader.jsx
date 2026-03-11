import React from 'react';
import { Hash, Users, Pin, AtSign } from 'lucide-react';

export default function ChatHeader({ channel, conversation, currentUserId, showMembers, onToggleMembers, isDM, onPinned, pinnedCount }) {
  const label = isDM
    ? (conversation?.name || conversation?.participants?.find(p => p.user_id !== currentUserId)?.user_name || 'DM')
    : (channel?.name || '');

  return (
    <div className="h-12 px-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-glass)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center gap-2.5 min-w-0">
        {isDM ? <AtSign className="w-4 h-4 flex-shrink-0 opacity-40" style={{ color: 'var(--text-muted)' }} />
               : <Hash className="w-4 h-4 flex-shrink-0 opacity-40" style={{ color: 'var(--text-muted)' }} />}
        <span className="text-[14px] font-semibold truncate" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>{label}</span>
        {channel?.description && (
          <>
            <div className="w-px h-4" style={{ background: 'var(--border-light)' }} />
            <span className="text-[11px] truncate opacity-50" style={{ color: 'var(--text-secondary)' }}>{channel.description}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        {!isDM && onPinned && (
          <button onClick={onPinned} className="relative p-1.5 rounded-md transition-colors hover:bg-[var(--bg-glass-hover)]">
            <Pin className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            {pinnedCount > 0 && (
              <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center"
                style={{ background: 'var(--accent-amber)', color: '#000' }}>{pinnedCount}</div>
            )}
          </button>
        )}
        {!isDM && (
          <button onClick={onToggleMembers} className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-glass-hover)]">
            <Users className="w-4 h-4" style={{ color: showMembers ? 'var(--text-cream)' : 'var(--text-muted)' }} />
          </button>
        )}
      </div>
    </div>
  );
}