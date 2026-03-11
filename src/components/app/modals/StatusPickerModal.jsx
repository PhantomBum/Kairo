import React, { useState } from 'react';
import ModalWrapper from './ModalWrapper';

const statuses = [
  { id: 'online', label: 'Online', color: '#22c55e' },
  { id: 'idle', label: 'Idle', color: '#eab308' },
  { id: 'dnd', label: 'Do Not Disturb', color: '#ef4444' },
  { id: 'invisible', label: 'Invisible', color: '#555' },
];

export default function StatusPickerModal({ onClose, currentStatus, customStatus, onSave }) {
  const [status, setStatus] = useState(currentStatus || 'online');
  const [emoji, setEmoji] = useState(customStatus?.emoji || '');
  const [text, setText] = useState(customStatus?.text || '');

  return (
    <ModalWrapper title="Set Status" onClose={onClose} width={360}>
      <div className="space-y-4">
        <div className="space-y-1">
          {statuses.map(s => (
            <button key={s.id} onClick={() => setStatus(s.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors"
              style={{ background: status === s.id ? 'var(--accent-dim)' : 'transparent' }}>
              <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
              <span className="text-sm" style={{ color: status === s.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{s.label}</span>
            </button>
          ))}
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
          <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Custom Status</label>
          <div className="flex gap-2">
            <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="😀" maxLength={2}
              className="w-12 px-2 py-2 rounded-lg text-center text-sm outline-none"
              style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
            <input value={text} onChange={e => setText(e.target.value)} placeholder="What's on your mind?"
              className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={() => onSave({ status, customStatus: (emoji || text) ? { emoji, text } : null })}
            className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>Save</button>
        </div>
      </div>
    </ModalWrapper>
  );
}