import React, { useState } from 'react';
import {
  Hash, Volume2, Megaphone, Radio, MessageSquare, Lock, ListChecks,
  Ticket, Calendar, LayoutGrid, Image, Pencil, Music, Bookmark,
} from 'lucide-react';
import ModalWrapper from './ModalWrapper';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', danger: '#f87171',
};

const CHANNEL_TYPES = [
  { id: 'text', label: 'Text', icon: Hash, desc: 'Send messages, images, GIFs' },
  { id: 'voice', label: 'Voice', icon: Volume2, desc: 'Voice and video chat' },
  { id: 'announcement', label: 'Announcement', icon: Megaphone, desc: 'Admin-only updates' },
  { id: 'forum', label: 'Forum', icon: MessageSquare, desc: 'Organized discussions' },
  { id: 'stage', label: 'Stage', icon: Radio, desc: 'Live speaker events' },
  { id: 'media', label: 'Media', icon: Image, desc: 'Photo and video gallery' },
  { id: 'polls', label: 'Polls', icon: ListChecks, desc: 'Community polls & voting' },
  { id: 'board', label: 'Board', icon: LayoutGrid, desc: 'Kanban project board' },
  { id: 'canvas', label: 'Canvas', icon: Pencil, desc: 'Collaborative whiteboard' },
  { id: 'sounds', label: 'Sounds', icon: Music, desc: 'Soundboard for voice' },
  { id: 'marks', label: 'Marks', icon: Bookmark, desc: 'Server highlights' },
  { id: 'events', label: 'Events', icon: Calendar, desc: 'Event scheduling' },
  { id: 'tickets', label: 'Tickets', icon: Ticket, desc: 'Support ticket system' },
];

export default function CreateChannelModal({ onClose, onCreate, categories, defaultCategoryId }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [catId, setCatId] = useState(defaultCategoryId || categories?.[0]?.id || '');
  const [slowMode, setSlowMode] = useState(0);
  const [nsfw, setNsfw] = useState(false);
  const [desc, setDesc] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const inputStyle = { background: P.base, color: P.textPrimary, border: `1px solid ${P.border}` };
  const labelStyle = { color: P.muted };

  return (
    <ModalWrapper title="Create Channel" onClose={onClose} width={480}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto scrollbar-none pr-1">
        {/* Type Grid */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-2" style={labelStyle}>Channel Type</label>
          <div className="grid grid-cols-3 gap-1.5">
            {CHANNEL_TYPES.map(t => (
              <button key={t.id} onClick={() => setType(t.id)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all text-center"
                style={{
                  background: type === t.id ? `${P.accent}15` : P.elevated,
                  border: `1px solid ${type === t.id ? `${P.accent}40` : P.border}`,
                  color: type === t.id ? P.textPrimary : P.muted,
                }}>
                <t.icon className="w-4 h-4" style={{ color: type === t.id ? P.accent : P.muted }} />
                <span className="text-[11px] font-medium">{t.label}</span>
              </button>
            ))}
          </div>
          {CHANNEL_TYPES.find(t => t.id === type) && (
            <p className="text-[12px] mt-2" style={{ color: P.muted }}>{CHANNEL_TYPES.find(t => t.id === type).desc}</p>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-2" style={labelStyle}>Channel Name</label>
          <input value={name} onChange={e => setName(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
            placeholder="new-channel"
            onKeyDown={e => e.key === 'Enter' && name.trim() && onCreate({ name: name.trim(), type, category_id: catId, description: desc, slow_mode_seconds: slowMode, is_nsfw: nsfw, is_private: isPrivate })}
            className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none font-mono"
            style={inputStyle} autoFocus />
        </div>

        {/* Description */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-2" style={labelStyle}>Topic (optional)</label>
          <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="What is this channel about?"
            className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none" style={inputStyle} />
        </div>

        {/* Category */}
        {categories?.length > 0 && (
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-2" style={labelStyle}>Category</label>
            <select value={catId} onChange={e => setCatId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none appearance-none cursor-pointer" style={inputStyle}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        {/* Slow Mode */}
        {(type === 'text' || type === 'forum') && (
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-2" style={labelStyle}>Slow Mode</label>
            <select value={slowMode} onChange={e => setSlowMode(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg text-[14px] outline-none appearance-none cursor-pointer" style={inputStyle}>
              <option value={0}>Off</option>
              <option value={5}>5 seconds</option>
              <option value={10}>10 seconds</option>
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
            </select>
          </div>
        )}

        {/* Toggles */}
        <div className="space-y-3 py-1">
          <div className="flex items-center justify-between">
            <span className="text-[13px]" style={{ color: P.textSecondary }}>Private Channel</span>
            <button onClick={() => setIsPrivate(!isPrivate)} className="w-10 h-5 rounded-full relative transition-colors"
              style={{ background: isPrivate ? P.accent : P.elevated }}>
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: isPrivate ? 22 : 2 }} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[13px]" style={{ color: P.textSecondary }}>Age-Restricted (NSFW)</span>
            <button onClick={() => setNsfw(!nsfw)} className="w-10 h-5 rounded-full relative transition-colors"
              style={{ background: nsfw ? P.danger : P.elevated }}>
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: nsfw ? 22 : 2 }} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-[13px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.04)]"
            style={{ color: P.textSecondary }}>Cancel</button>
          <button onClick={() => name.trim() && onCreate({ name: name.trim(), type, category_id: catId, description: desc, slow_mode_seconds: slowMode, is_nsfw: nsfw, is_private: isPrivate })}
            disabled={!name.trim()}
            className="px-5 py-2.5 rounded-lg text-[13px] font-semibold disabled:opacity-30 transition-colors"
            style={{ background: P.accent, color: '#0d1117' }}>Create Channel</button>
        </div>
      </div>
    </ModalWrapper>
  );
}
