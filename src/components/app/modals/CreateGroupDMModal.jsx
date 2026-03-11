import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import ModalWrapper from './ModalWrapper';

export default function CreateGroupDMModal({ onClose, friends, onCreate }) {
  const [selected, setSelected] = useState([]);
  const [name, setName] = useState('');

  const toggle = (f) => setSelected(prev => prev.find(s => s.friend_id === f.friend_id) ? prev.filter(s => s.friend_id !== f.friend_id) : [...prev, f]);

  const create = () => {
    if (selected.length < 1) return;
    onCreate({ name: name.trim() || undefined, participants: selected.map(f => ({ user_id: f.friend_id, user_email: f.friend_email, user_name: f.friend_name, avatar: f.friend_avatar })) });
  };

  return (
    <ModalWrapper title="Create Group" onClose={onClose} width={400}>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Group Name (optional)</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Squad chat" className="w-full px-3 py-2 rounded-xl text-sm outline-none"
            style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
        </div>
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selected.map(s => (
              <span key={s.friend_id} onClick={() => toggle(s)} className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] cursor-pointer"
                style={{ background: 'var(--bg-glass-active)', color: 'var(--text-cream)', border: '1px solid var(--border-light)' }}>
                {s.friend_name} <X className="w-2.5 h-2.5" />
              </span>
            ))}
          </div>
        )}
        <div className="max-h-52 overflow-y-auto scrollbar-none space-y-1">
          {(friends || []).map(f => {
            const isSelected = selected.find(s => s.friend_id === f.friend_id);
            return (
              <button key={f.id} onClick={() => toggle(f)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                style={{ background: isSelected ? 'var(--bg-glass-active)' : 'var(--bg-glass)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden"
                  style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>
                  {f.friend_avatar ? <img src={f.friend_avatar} className="w-full h-full object-cover" /> : (f.friend_name || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="text-sm flex-1 text-left" style={{ color: 'var(--text-primary)' }}>{f.friend_name}</span>
                {isSelected && <Check className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />}
              </button>
            );
          })}
        </div>
        <button onClick={create} disabled={selected.length < 1} className="w-full py-2.5 rounded-xl text-sm font-medium disabled:opacity-30"
          style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>Create Group ({selected.length + 1} members)</button>
      </div>
    </ModalWrapper>
  );
}