import React, { useState } from 'react';
import ModalWrapper from './ModalWrapper';

const statusColors = { online: '#7bc9a4', idle: '#c9b47b', dnd: '#c97b7b', invisible: '#555248' };
const statuses = [
  { id: 'online', label: 'Online', desc: 'You are visible to everyone' },
  { id: 'idle', label: 'Idle', desc: 'Shown as away' },
  { id: 'dnd', label: 'Do Not Disturb', desc: 'Suppress all notifications' },
  { id: 'invisible', label: 'Invisible', desc: 'Appear offline' },
];

export default function StatusPickerModal({ onClose, currentStatus, customStatus, onSave }) {
  const [status, setStatus] = useState(currentStatus || 'online');
  const [emoji, setEmoji] = useState(customStatus?.emoji || '');
  const [text, setText] = useState(customStatus?.text || '');

  return (
    <ModalWrapper title="Set Status" onClose={onClose} width={380}>
      <div className="space-y-4">
        <div className="space-y-1">
          {statuses.map(s => (
            <button key={s.id} onClick={() => setStatus(s.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
              style={{ background: status === s.id ? 'var(--bg-glass-active)' : 'transparent', border: `1px solid ${status === s.id ? 'var(--border-light)' : 'transparent'}` }}>
              <div className="w-3 h-3 rounded-full" style={{ background: statusColors[s.id] }} />
              <div className="text-left">
                <div className="text-sm" style={{ color: 'var(--text-cream)' }}>{s.label}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.desc}</div>
              </div>
            </button>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--border)' }} className="pt-4">
          <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Custom Status</label>
          <div className="flex gap-2">
            <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="😊" maxLength={2}
              className="w-12 px-2 py-2.5 rounded-xl text-center text-base outline-none" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }} />
            <input value={text} onChange={e => setText(e.target.value)} placeholder="What's happening?"
              className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
        </div>
        <button onClick={() => onSave({ status, customStatus: (emoji || text) ? { emoji, text } : null })}
          className="w-full py-2.5 rounded-xl text-sm font-medium"
          style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>Save</button>
      </div>
    </ModalWrapper>
  );
}