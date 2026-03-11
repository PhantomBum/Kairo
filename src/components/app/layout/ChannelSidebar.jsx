import React, { useState } from 'react';
import { Hash, Volume2, ChevronDown, Megaphone, MessagesSquare, Settings, Plus, Shield, UserPlus } from 'lucide-react';

const icons = { text: Hash, voice: Volume2, announcement: Megaphone, forum: MessagesSquare, stage: Volume2 };

function Category({ cat, channels, activeId, onSelect, onAdd }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-1">
      <div className="flex items-center group px-1">
        <button onClick={() => setOpen(!open)}
          className="flex-1 flex items-center gap-1 px-1.5 py-1 text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: 'var(--text-muted)' }}>
          <ChevronDown className={`w-3 h-3 transition-transform ${open ? '' : '-rotate-90'}`} />
          {cat.name}
        </button>
        {onAdd && (
          <button onClick={() => onAdd(cat.id)}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity"
            style={{ color: 'var(--text-muted)' }}>
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>
      {open && channels.map(ch => {
        const Icon = icons[ch.type] || Hash;
        const active = ch.id === activeId;
        return (
          <button key={ch.id} onClick={() => onSelect(ch)}
            className="w-full flex items-center gap-2 px-3 py-[6px] mx-1 rounded-md text-[13px] transition-colors"
            style={{
              width: 'calc(100% - 8px)',
              background: active ? 'var(--accent-dim)' : 'transparent',
              color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
            }}>
            <Icon className="w-4 h-4 flex-shrink-0 opacity-60" />
            <span className="truncate">{ch.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function ChannelSidebar({ server, categories, channels, activeId, onSelect, onAdd, onSettings, onInvite, isOwner }) {
  const grouped = {};
  const uncategorized = [];
  channels.forEach(ch => {
    if (ch.category_id) { (grouped[ch.category_id] = grouped[ch.category_id] || []).push(ch); }
    else uncategorized.push(ch);
  });
  const sorted = [...categories].sort((a, b) => (a.position || 0) - (b.position || 0));

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Header */}
      <div className="h-12 px-3 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-[14px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
          {server?.name}
        </span>
        <div className="flex items-center gap-1">
          {isOwner && (
            <button onClick={onSettings} className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-hover)]">
              <Settings className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
            </button>
          )}
          <button onClick={onInvite} className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-hover)]">
            <UserPlus className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>

      {/* Channels */}
      <div className="flex-1 overflow-y-auto pt-2 pb-1 scrollbar-none">
        {uncategorized.map(ch => {
          const Icon = icons[ch.type] || Hash;
          const active = ch.id === activeId;
          return (
            <button key={ch.id} onClick={() => onSelect(ch)}
              className="w-full flex items-center gap-2 px-3 py-[6px] mx-1 rounded-md text-[13px] transition-colors"
              style={{
                width: 'calc(100% - 8px)',
                background: active ? 'var(--accent-dim)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}>
              <Icon className="w-4 h-4 flex-shrink-0 opacity-60" />
              <span className="truncate">{ch.name}</span>
            </button>
          );
        })}
        {sorted.map(cat => (
          <Category key={cat.id} cat={cat}
            channels={(grouped[cat.id] || []).sort((a, b) => (a.position || 0) - (b.position || 0))}
            activeId={activeId} onSelect={onSelect} onAdd={onAdd} />
        ))}
      </div>
    </div>
  );
}