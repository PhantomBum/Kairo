import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import ModalWrapper from './ModalWrapper';

export default function CreateGroupDMModal({ onClose, friends, onCreate }) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]);

  const toggle = (f) => {
    setSelected(prev => prev.some(s => s.friend_id === f.friend_id) ? prev.filter(s => s.friend_id !== f.friend_id) : [...prev, f]);
  };

  const handleCreate = () => {
    if (selected.length < 1) return;
    onCreate({
      name: name.trim() || selected.map(f => f.friend_name).join(', '),
      participants: selected.map(f => ({ user_id: f.friend_id, user_email: f.friend_email, user_name: f.friend_name, avatar: f.friend_avatar })),
    });
  };

  return (
    <ModalWrapper title="Create Group DM" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Group Name (optional)</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="My Group"
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
        </div>

        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selected.map(f => (
              <span key={f.friend_id} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                style={{ background: 'var(--accent-dim)', color: 'var(--text-primary)' }}>
                {f.friend_name}
                <button onClick={() => toggle(f)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}

        <div className="max-h-48 overflow-y-auto space-y-0.5">
          {friends.map(f => {
            const isSelected = selected.some(s => s.friend_id === f.friend_id);
            return (
              <button key={f.id} onClick={() => toggle(f)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
                style={{ background: isSelected ? 'var(--accent-dim)' : 'transparent' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs overflow-hidden"
                  style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                  {f.friend_avatar ? <img src={f.friend_avatar} className="w-full h-full object-cover" /> : (f.friend_name || 'U').charAt(0)}
                </div>
                <span className="flex-1 text-sm text-left" style={{ color: 'var(--text-primary)' }}>{f.friend_name}</span>
                {isSelected && <Check className="w-4 h-4 text-green-400" />}
              </button>
            );
          })}
          {friends.length === 0 && <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>Add friends first</p>}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleCreate} disabled={selected.length < 1}
            className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
            style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>Create ({selected.length})</button>
        </div>
      </div>
    </ModalWrapper>
  );
}