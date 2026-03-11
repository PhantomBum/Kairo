import React, { useState } from 'react';
import { Hash, Volume2, Megaphone, ChevronDown, ChevronRight, Plus, Settings, UserPlus } from 'lucide-react';

const typeIcons = { text: Hash, voice: Volume2, announcement: Megaphone, stage: Volume2, forum: Hash };

function ChannelItem({ channel, active, onClick }) {
  const Icon = typeIcons[channel.type] || Hash;
  return (
    <button onClick={() => onClick(channel)}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[13px] transition-all duration-150 group"
      style={{
        background: active ? 'var(--bg-glass-active)' : 'transparent',
        color: active ? 'var(--text-cream)' : 'var(--text-secondary)',
      }}>
      <Icon className="w-4 h-4 flex-shrink-0 opacity-50" />
      <span className="truncate">{channel.name}</span>
    </button>
  );
}

function CategoryGroup({ category, channels, activeId, onSelect, onAdd }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-1">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-1 px-1 py-1 group">
        {open ? <ChevronDown className="w-2.5 h-2.5" style={{ color: 'var(--text-muted)' }} /> : <ChevronRight className="w-2.5 h-2.5" style={{ color: 'var(--text-muted)' }} />}
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] flex-1 text-left truncate" style={{ color: 'var(--text-muted)' }}>{category.name}</span>
        <Plus onClick={(e) => { e.stopPropagation(); onAdd(category.id); }} className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" style={{ color: 'var(--text-muted)' }} />
      </button>
      {open && (
        <div className="ml-1 space-y-px">
          {channels.sort((a,b) => (a.position||0) - (b.position||0)).map(ch => (
            <ChannelItem key={ch.id} channel={ch} active={activeId === ch.id} onClick={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChannelSidebar({ server, categories, channels, activeId, onSelect, onAdd, onSettings, onInvite, isOwner }) {
  const sorted = [...(categories || [])].sort((a,b) => (a.position||0) - (b.position||0));
  const catIds = new Set(sorted.map(c => c.id));
  const uncategorized = (channels || []).filter(ch => !ch.category_id || !catIds.has(ch.category_id));

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Server header */}
      <div className="h-12 px-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-[14px] font-semibold truncate" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>{server?.name}</span>
        <div className="flex items-center gap-1">
          {isOwner && (
            <button onClick={onInvite} className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-glass-hover)]">
              <UserPlus className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
          {isOwner && (
            <button onClick={onSettings} className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-glass-hover)]">
              <Settings className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
        </div>
      </div>
      {/* Channels */}
      <div className="flex-1 overflow-y-auto scrollbar-none p-2 space-y-0.5">
        {uncategorized.sort((a,b) => (a.position||0) - (b.position||0)).map(ch => (
          <ChannelItem key={ch.id} channel={ch} active={activeId === ch.id} onClick={onSelect} />
        ))}
        {sorted.map(cat => (
          <CategoryGroup key={cat.id} category={cat} channels={(channels || []).filter(ch => ch.category_id === cat.id)}
            activeId={activeId} onSelect={onSelect} onAdd={onAdd} />
        ))}
      </div>
    </div>
  );
}