import React, { useState } from 'react';
import { Hash, Volume2, ChevronDown, ChevronRight, Megaphone, MessagesSquare, Settings, Plus } from 'lucide-react';

const iconMap = {
  text: Hash,
  voice: Volume2,
  announcement: Megaphone,
  forum: MessagesSquare,
  stage: Volume2,
};

function CategoryGroup({ category, channels, activeChannelId, onChannelClick, onCreateChannel }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-1">
      <div className="flex items-center group">
        <button onClick={() => setOpen(!open)}
          className="flex-1 flex items-center gap-0.5 px-1 py-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors">
          {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          {category.name}
        </button>
        {onCreateChannel && (
          <button onClick={() => onCreateChannel(category.id)} className="opacity-0 group-hover:opacity-100 p-0.5 text-zinc-600 hover:text-zinc-300 transition-all">
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {open && channels.map(ch => {
        const Icon = iconMap[ch.type] || Hash;
        const active = ch.id === activeChannelId;
        return (
          <button key={ch.id} onClick={() => onChannelClick(ch)}
            className="w-full flex items-center gap-2 px-2 py-1 mx-1 rounded text-sm transition-colors"
            style={{
              background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: active ? '#fff' : '#777',
            }}>
            <Icon className="w-4 h-4 flex-shrink-0" style={{ opacity: 0.5 }} />
            <span className="truncate">{ch.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function ChannelPanel({ server, categories, channels, activeChannelId, onChannelClick, onCreateChannel }) {
  const grouped = {};
  const uncategorized = [];
  
  channels.forEach(ch => {
    if (ch.category_id) {
      if (!grouped[ch.category_id]) grouped[ch.category_id] = [];
      grouped[ch.category_id].push(ch);
    } else {
      uncategorized.push(ch);
    }
  });

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="h-12 px-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-[15px] font-semibold text-white truncate">{server.name}</span>
        <Settings className="w-4 h-4 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors" />
      </div>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {uncategorized.map(ch => {
          const Icon = iconMap[ch.type] || Hash;
          const active = ch.id === activeChannelId;
          return (
            <button key={ch.id} onClick={() => onChannelClick(ch)}
              className="w-full flex items-center gap-2 px-2 py-1 rounded text-sm transition-colors mb-0.5"
              style={{
                background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: active ? '#fff' : '#777',
              }}>
              <Icon className="w-4 h-4 flex-shrink-0" style={{ opacity: 0.5 }} />
              <span className="truncate">{ch.name}</span>
            </button>
          );
        })}
        {categories
          .sort((a, b) => (a.position || 0) - (b.position || 0))
          .map(cat => (
            <CategoryGroup
              key={cat.id}
              category={cat}
              channels={(grouped[cat.id] || []).sort((a, b) => (a.position || 0) - (b.position || 0))}
              activeChannelId={activeChannelId}
              onChannelClick={onChannelClick}
              onCreateChannel={onCreateChannel}
            />
          ))}
      </div>
    </div>
  );
}