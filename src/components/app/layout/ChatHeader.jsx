import React from 'react';
import { Hash, Users, Pin, Search, AtSign } from 'lucide-react';

export default function ChatHeader({ channel, conversation, currentUserId, memberCount, showMembers, onToggleMembers, isDM }) {
  const label = isDM
    ? (conversation?.name || conversation?.participants?.find(p => p.user_id !== currentUserId)?.user_name || 'DM')
    : (channel?.name || '');

  return (
    <div className="h-12 px-4 flex items-center justify-between flex-shrink-0"
      style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 min-w-0">
        {!isDM && <Hash className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
        {isDM && <AtSign className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
        <span className="text-[14px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{label}</span>
        {channel?.description && (
          <>
            <div className="w-px h-4 mx-1" style={{ background: 'var(--border)' }} />
            <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{channel.description}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-1">
        {!isDM && (
          <button onClick={onToggleMembers}
            className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: showMembers ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            <Users className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}