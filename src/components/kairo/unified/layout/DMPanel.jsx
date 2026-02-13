import React from 'react';
import { Users, Search, Plus, Inbox, Store } from 'lucide-react';

export default function DMPanel({ conversations, activeConversationId, onSelect, onFriendsClick, currentUserId, onCreateGroupDM }) {
  const [search, setSearch] = React.useState('');

  const filtered = conversations.filter(c => {
    if (!search) return true;
    const other = c.participants?.find(p => p.user_id !== currentUserId);
    return other?.user_name?.toLowerCase().includes(search.toLowerCase()) || c.name?.toLowerCase().includes(search.toLowerCase());
  });

  const statusColors = { online: '#22c55e', idle: '#eab308', dnd: '#ef4444' };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Search bar in header area */}
      <div className="px-2.5 pt-3 pb-1.5 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find or start a conversation"
            className="w-full h-[30px] pl-8 pr-2 rounded-[4px] text-[12px] text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
            style={{ background: '#0a0a0a' }} />
        </div>
      </div>

      {/* Quick navigation */}
      <div className="px-2 space-y-[1px]">
        <button onClick={onFriendsClick}
          className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all">
          <Users className="w-[18px] h-[18px]" /><span>Friends</span>
        </button>
        <button className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all">
          <Inbox className="w-[18px] h-[18px]" /><span>Inbox</span>
        </button>
        <button className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all">
          <Store className="w-[18px] h-[18px]" /><span>Shop</span>
        </button>
      </div>

      {/* DM list */}
      <div className="flex-1 overflow-y-auto px-2 pt-3 scrollbar-thin">
        <div className="flex items-center justify-between px-1.5 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-zinc-600">Direct Messages</span>
          {onCreateGroupDM && (
            <button onClick={onCreateGroupDM} className="p-0.5 text-zinc-600 hover:text-zinc-300 transition-colors" title="New Group DM">
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="space-y-[1px]">
          {filtered.map(conv => {
            const other = conv.participants?.find(p => p.user_id !== currentUserId) || conv.participants?.[0];
            const name = conv.type === 'group' ? conv.name : (other?.user_name || 'User');
            const active = conv.id === activeConversationId;
            return (
              <div key={conv.id} onClick={() => onSelect(conv)}
                className="flex items-center gap-2.5 px-2 py-[6px] rounded-md cursor-pointer transition-all duration-100 group/dm"
                style={{ background: active ? 'rgba(255,255,255,0.07)' : 'transparent' }}>
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {conv.type === 'group' ? <Users className="w-4 h-4 text-zinc-500" />
                      : other?.avatar ? <img src={other.avatar} className="w-full h-full object-cover" />
                      : <span className="text-zinc-500">{name.charAt(0).toUpperCase()}</span>}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] truncate block" style={{ color: active ? '#fff' : '#b5b5b5' }}>{name}</span>
                  {conv.last_message_preview && (
                    <span className="text-[11px] text-zinc-600 truncate block leading-tight">{conv.last_message_preview}</span>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="text-center py-8 text-zinc-600 text-[11px]">No conversations yet</div>}
        </div>
      </div>
    </div>
  );
}