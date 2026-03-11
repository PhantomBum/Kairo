import React, { useState } from 'react';
import { Hash, Volume2, Megaphone, Radio, MessageSquare, HelpCircle, Lock, ListChecks, BookOpen, Ticket, Calendar, Bell, LayoutGrid } from 'lucide-react';
import ModalWrapper from './ModalWrapper';

const CHANNEL_TYPES = [
  { id: 'text', label: 'Text', icon: Hash, desc: 'Standard text chat' },
  { id: 'voice', label: 'Voice', icon: Volume2, desc: 'Voice conversation' },
  { id: 'board', label: 'Board', icon: LayoutGrid, desc: 'Kanban project board' },
  { id: 'announcement', label: 'Announcement', icon: Megaphone, desc: 'Important updates' },
  { id: 'stage', label: 'Stage', icon: Radio, desc: 'Live speaker events' },
  { id: 'forum', label: 'Forum', icon: MessageSquare, desc: 'Organized discussions' },
  { id: 'rules', label: 'Rules', icon: BookOpen, desc: 'Server rules & guidelines' },
  { id: 'tickets', label: 'Tickets', icon: Ticket, desc: 'Support ticket system' },
  { id: 'events', label: 'Events', icon: Calendar, desc: 'Event scheduling' },
  { id: 'polls', label: 'Polls', icon: ListChecks, desc: 'Community polls & voting' },
  { id: 'faq', label: 'FAQ', icon: HelpCircle, desc: 'Frequently asked questions' },
  { id: 'alerts', label: 'Alerts', icon: Bell, desc: 'Automated notifications' },
  { id: 'private', label: 'Private', icon: Lock, desc: 'Restricted access channel' },
];

export default function CreateChannelModal({ onClose, onCreate, categories, defaultCategoryId }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [catId, setCatId] = useState(defaultCategoryId || categories?.[0]?.id || '');
  const [slowMode, setSlowMode] = useState(0);
  const [nsfw, setNsfw] = useState(false);
  const [desc, setDesc] = useState('');

  return (
    <ModalWrapper title="Create Channel" onClose={onClose} width={480}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto scrollbar-none">
        {/* Type Grid */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Channel Type</label>
          <div className="grid grid-cols-3 gap-1.5">
            {CHANNEL_TYPES.map(t => (
              <button key={t.id} onClick={() => setType(t.id)}
                className="flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all text-center"
                style={{ background: type === t.id ? 'var(--bg-glass-active)' : 'var(--bg-glass)', border: `1px solid ${type === t.id ? 'var(--border-light)' : 'var(--border)'}`, color: type === t.id ? 'var(--text-cream)' : 'var(--text-muted)' }}>
                <t.icon className="w-4 h-4" />
                <span className="text-[10px] font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Name</label>
          <input value={name} onChange={e => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="new-channel"
            onKeyDown={e => e.key === 'Enter' && name.trim() && onCreate({ name: name.trim(), type, category_id: catId, description: desc, slow_mode_seconds: slowMode, is_nsfw: nsfw })}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none font-mono"
            style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} autoFocus />
        </div>

        {/* Description */}
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Description (optional)</label>
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="What is this channel about?"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
        </div>

        {/* Category */}
        {categories?.length > 0 && (
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Category</label>
            <select value={catId} onChange={e => setCatId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        {/* Advanced */}
        {(type === 'text' || type === 'forum') && (
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Slow Mode</label>
            <select value={slowMode} onChange={e => setSlowMode(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none"
              style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              <option value={0}>Off</option>
              <option value={5}>5 seconds</option>
              <option value={10}>10 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
              <option value={900}>15 minutes</option>
              <option value={3600}>1 hour</option>
            </select>
          </div>
        )}

        <div className="flex items-center justify-between py-1">
          <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Age-Restricted (NSFW)</span>
          <button onClick={() => setNsfw(!nsfw)} className="w-10 h-5 rounded-full relative transition-colors" style={{ background: nsfw ? 'var(--accent-red)' : 'var(--bg-overlay)' }}>
            <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: nsfw ? 22 : 2 }} />
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm hover:bg-[var(--bg-glass-hover)]" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={() => name.trim() && onCreate({ name: name.trim(), type, category_id: catId, description: desc, slow_mode_seconds: slowMode, is_nsfw: nsfw })} disabled={!name.trim()}
            className="px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-30"
            style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>Create</button>
        </div>
      </div>
    </ModalWrapper>
  );
}