import React from 'react';
import { Users, Search } from 'lucide-react';

export default function DMPanel({ conversations, activeConversationId, onSelect, onFriendsClick, currentUserId }) {
  const [search, setSearch] = React.useState('');

  const filtered = conversations.filter(c => {
    if (!search) return true;
    const other = c.participants?.find(p => p.user_id !== currentUserId);
    return other?.user_name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="h-12 px-4 flex items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-[15px] font-semibold text-white">Messages</span>
      </div>

      <div className="px-2 pt-2">
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full h-7 pl-7 pr-2 rounded text-xs text-white placeholder:text-zinc-600 focus:outline-none"
            style={{ background: '#0e0e0e' }} />
        </div>

        <button onClick={onFriendsClick}
          className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded text-sm text-zinc-400 hover:text-white transition-colors"
          style={{ background: 'transparent' }}>
          <Users className="w-4 h-4" />
          <span>Friends</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pt-1 scrollbar-thin">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 px-2 py-1.5">
          Direct Messages
        </div>
        {filtered.map(conv => {
          const other = conv.participants?.find(p => p.user_id !== currentUserId) || conv.participants?.[0];
          const name = other?.user_name || 'User';
          const active = conv.id === activeConversationId;
          return (
            <div key={conv.id} onClick={() => onSelect(conv)}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded cursor-pointer transition-colors"
              style={{
                background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: active ? '#fff' : '#888',
              }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                style={{ background: '#222' }}>
                {other?.avatar ? <img src={other.avatar} className="w-full h-full rounded-full object-cover" /> : name.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm truncate">{name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}