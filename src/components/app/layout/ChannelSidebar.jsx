import React, { useState } from 'react';
import { Hash, Volume2, Megaphone, Radio, MessageSquare, HelpCircle, Lock, ListChecks, BookOpen, Ticket, Calendar, Bell, ChevronDown, ChevronRight, Plus, Settings, UserPlus, Shield, Crown } from 'lucide-react';

const typeIcons = { text: Hash, voice: Volume2, announcement: Megaphone, stage: Radio, forum: MessageSquare, rules: BookOpen, tickets: Ticket, events: Calendar, polls: ListChecks, faq: HelpCircle, alerts: Bell, private: Lock };

function ChannelItem({ channel, active, onClick, voiceUsers }) {
  const Icon = typeIcons[channel.type] || Hash;
  const isVoice = channel.type === 'voice' || channel.type === 'stage';

  return (
    <div>
      <button onClick={() => onClick(channel)}
        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[13px] transition-all duration-150 group"
        style={{ background: active ? 'var(--bg-glass-active)' : 'transparent', color: active ? 'var(--text-cream)' : 'var(--text-secondary)' }}>
        <Icon className="w-4 h-4 flex-shrink-0 opacity-50" />
        <span className="truncate flex-1 text-left">{channel.name}</span>
        {channel.is_nsfw && <span className="text-[7px] px-1 rounded" style={{ background: 'rgba(201,123,123,0.15)', color: 'var(--accent-red)' }}>18+</span>}
        {channel.is_private && <Lock className="w-2.5 h-2.5 opacity-30" />}
        {isVoice && voiceUsers > 0 && <span className="text-[11px] px-1.5 rounded-full" style={{ background: 'rgba(123,201,164,0.15)', color: 'var(--accent-green)' }}>{voiceUsers}</span>}
      </button>
    </div>
  );
}

function CategoryGroup({ category, channels, activeId, onSelect, onAdd }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mb-1">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-1 px-1 py-1 group">
        {open ? <ChevronDown className="w-2.5 h-2.5" style={{ color: 'var(--text-muted)' }} /> : <ChevronRight className="w-2.5 h-2.5" style={{ color: 'var(--text-muted)' }} />}
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] flex-1 text-left truncate" style={{ color: 'var(--text-muted)' }}>{category.name}</span>
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

export default function ChannelSidebar({ server, categories, channels, activeId, onSelect, onAdd, onSettings, onInvite, onModPanel, isOwner }) {
  const sorted = [...(categories || [])].sort((a,b) => (a.position||0) - (b.position||0));
  const catIds = new Set(sorted.map(c => c.id));
  const uncategorized = (channels || []).filter(ch => !ch.category_id || !catIds.has(ch.category_id));

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Server header */}
      <div className="h-12 px-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {server?.icon_url ? (
            <img src={server.icon_url} className="w-5 h-5 rounded-md object-cover flex-shrink-0" />
          ) : null}
          <span className="text-[14px] font-semibold truncate" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>{server?.name}</span>
        </div>
        <div className="flex items-center gap-0.5">
          {isOwner && (
            <button onClick={onModPanel} className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-glass-hover)]" title="Mod Panel">
              <Shield className="w-3.5 h-3.5" style={{ color: 'var(--accent-amber)' }} />
            </button>
          )}
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

      {/* Server boost banner */}
      {server?.features?.includes('boost_progress') && (
        <div className="px-3 py-2 flex items-center gap-2" style={{ background: 'rgba(164,123,201,0.04)', borderBottom: '1px solid var(--border)' }}>
          <Crown className="w-3 h-3" style={{ color: 'var(--accent-purple)' }} />
          <span className="text-[11px]" style={{ color: 'var(--accent-purple)' }}>Level 1 · 2 Boosts</span>
        </div>
      )}

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