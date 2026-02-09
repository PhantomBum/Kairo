import React, { useState } from 'react';
import { Users, Compass, Search, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../ui/Avatar';

function NavItem({ icon: Icon, label, onClick, active, badge }) {
  return (
    <button onClick={onClick} className={cn(
      'w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors',
      active ? 'bg-white/[0.08] text-white' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
    )}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {badge > 0 && (
        <span className="ml-auto min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">{badge}</span>
      )}
    </button>
  );
}

export default function DMSidebar({ conversations = [], activeConversationId, onConversationSelect, onShowFriends, onCreateDM, onCloseConversation, currentUserId }) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter(c => {
    if (!search) return true;
    const name = c.participant_1_id === currentUserId ? c.participant_2_name : c.participant_1_name;
    return name?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="h-12 px-4 flex items-center">
        <span className="font-semibold text-white text-[15px]">Home</span>
      </div>

      {/* Nav */}
      <div className="px-2 py-2 space-y-0.5">
        <NavItem icon={Users} label="Friends" onClick={onShowFriends} />
        <NavItem icon={Compass} label="Explore" />
      </div>

      {/* Search */}
      <div className="px-3 mb-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Find or start a conversation"
            className="w-full h-7 pl-7 pr-2 bg-[#0c0c0c] rounded text-xs text-white placeholder:text-zinc-600 focus:outline-none" />
        </div>
      </div>

      {/* DM Header */}
      <div className="flex items-center justify-between px-4 mb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600">Direct Messages</span>
        <button onClick={onCreateDM} className="text-zinc-600 hover:text-white"><Plus className="w-4 h-4" /></button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 space-y-0.5">
        {filtered.length === 0 && (
          <div className="text-center py-8 px-4">
            <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-white/[0.04] flex items-center justify-center">
              <span className="text-xl">💬</span>
            </div>
            <p className="text-xs text-zinc-600 mb-1">No direct messages yet</p>
            <p className="text-[11px] text-zinc-700">Start a conversation with a friend</p>
          </div>
        )}
        {filtered.map((conv) => {
          const isP1 = conv.participant_1_id === currentUserId;
          const name = isP1 ? conv.participant_2_name : conv.participant_1_name;
          const avatar = isP1 ? conv.participant_2_avatar : conv.participant_1_avatar;
          
          return (
            <div key={conv.id} onClick={() => onConversationSelect(conv)}
              className={cn(
                'w-full flex items-center gap-2.5 px-2 py-1.5 rounded text-left transition-colors group cursor-pointer',
                activeConversationId === conv.id ? 'bg-white/[0.08] text-white' : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
              )}
            >
              <Avatar src={avatar} name={name} size="sm" />
              <span className="flex-1 text-sm truncate">{name}</span>
              <button onClick={(e) => { e.stopPropagation(); onCloseConversation?.(); }}
                className="w-4 h-4 rounded flex items-center justify-center text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}