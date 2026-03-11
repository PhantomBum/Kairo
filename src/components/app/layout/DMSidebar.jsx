import React, { useState } from 'react';
import { Search, Users, MessageSquarePlus } from 'lucide-react';

export default function DMSidebar({ conversations, activeId, onSelect, onFriends, onCreateGroup, currentUserId }) {
  const [query, setQuery] = useState('');

  const getLabel = (conv) => {
    if (conv.name) return conv.name;
    const other = conv.participants?.find(p => p.user_id !== currentUserId);
    return other?.user_name || other?.user_email?.split('@')[0] || 'User';
  };

  const getAvatar = (conv) => {
    if (conv.icon_url) return conv.icon_url;
    const other = conv.participants?.find(p => p.user_id !== currentUserId);
    return other?.avatar;
  };

  const filtered = conversations.filter(c => getLabel(c).toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Search */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md"
          style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <Search className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search conversations..."
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-[var(--text-muted)]"
            style={{ color: 'var(--text-primary)' }} />
        </div>
      </div>

      {/* Quick nav */}
      <div className="px-2 pb-2 space-y-0.5">
        <button onClick={onFriends}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-secondary)' }}>
          <Users className="w-4 h-4" /> Friends
        </button>
      </div>

      <div className="px-3 flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Messages
        </span>
        <button onClick={onCreateGroup} className="p-0.5 rounded transition-colors hover:bg-[var(--bg-hover)]">
          <MessageSquarePlus className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 scrollbar-none">
        {filtered.map(conv => {
          const label = getLabel(conv);
          const avatar = getAvatar(conv);
          const active = conv.id === activeId;
          return (
            <button key={conv.id} onClick={() => onSelect(conv)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition-colors mb-0.5"
              style={{
                background: active ? 'var(--accent-dim)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 overflow-hidden"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : label.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] truncate">{label}</div>
                {conv.last_message_preview && (
                  <div className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                    {conv.last_message_preview}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}