import React, { useState } from 'react';
import { Hash, Volume2 } from 'lucide-react';
import ModalWrapper from './ModalWrapper';

export default function CreateChannelModal({ onClose, onCreate, categories, defaultCategoryId }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [catId, setCatId] = useState(defaultCategoryId || '');

  const handleCreate = () => { if (name.trim()) onCreate({ name: name.trim().toLowerCase().replace(/\s+/g, '-'), type, category_id: catId || undefined }); };

  const types = [
    { id: 'text', label: 'Text', icon: Hash },
    { id: 'voice', label: 'Voice', icon: Volume2 },
  ];

  return (
    <ModalWrapper title="Create channel" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex gap-2">
          {types.map(t => (
            <button key={t.id} onClick={() => setType(t.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition-colors"
              style={{
                background: type === t.id ? 'var(--accent-dim)' : 'var(--bg)',
                color: type === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                border: `1px solid ${type === t.id ? 'var(--border-hover)' : 'var(--border)'}`,
              }}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="new-channel"
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} autoFocus />
        </div>
        {categories.length > 0 && (
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Category</label>
            <select value={catId} onChange={e => setCatId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
              style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              <option value="">No category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleCreate} disabled={!name.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
            style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>Create</button>
        </div>
      </div>
    </ModalWrapper>
  );
}