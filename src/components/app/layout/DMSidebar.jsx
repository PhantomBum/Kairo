import React, { useState } from 'react';
import { Search, Users, Plus, MessageSquare } from 'lucide-react';

export default function DMSidebar({ conversations, activeId, onSelect, onFriends, onCreateGroup, currentUserId }) {
  const [search, setSearch] = useState('');

  const getLabel = (c) => {
    if (c.name) return c.name;
    const other = c.participants?.find(p => p.user_id !== currentUserId);
    return other?.user_name || other?.user_email?.split('@')[0] || 'DM';
  };
  const getAvatar = (c) => {
    if (c.icon_url) return c.icon_url;
    const other = c.participants?.find(p => p.user_id !== currentUserId);
    return other?.avatar;
  };

  const filtered = (conversations || []).filter(c => !search || getLabel(c).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="h-12 px-3 flex items-center flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
          <Search className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a conversation"
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-[var(--text-faint)]" style={{ color: 'var(--text-primary)' }} />
        </div>
      </div>
      {/* Actions */}
      <div className="p-2 space-y-px">
        <button onClick={onFriends} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors hover:bg-[var(--bg-glass-hover)]"
          style={{ color: 'var(--text-secondary)' }}>
          <Users className="w-4 h-4 opacity-50" /> Friends
        </button>
        <button onClick={onCreateGroup} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors hover:bg-[var(--bg-glass-hover)]"
          style={{ color: 'var(--text-secondary)' }}>
          <Plus className="w-4 h-4 opacity-50" /> New Group
        </button>
      </div>
      {/* Label */}
      <div className="px-3 py-1">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)' }}>Direct Messages</span>
      </div>
      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-2 space-y-px">
        {filtered.map(c => {
          const label = getLabel(c);
          const avatar = getAvatar(c);
          const active = activeId === c.id;
          return (
            <button key={c.id} onClick={() => onSelect(c)}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all duration-150"
              style={{ background: active ? 'var(--bg-glass-active)' : 'transparent' }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium flex-shrink-0 overflow-hidden"
                style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>
                {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : label.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-[13px] truncate" style={{ color: active ? 'var(--text-cream)' : 'var(--text-primary)' }}>{label}</div>
                {c.last_message_preview && (
                  <div className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>{c.last_message_preview}</div>
                )}
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-20" style={{ color: 'var(--text-muted)' }} />
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>No conversations yet</p>
          </div>
        )}
      </div>
    </div>
  );
}