import React, { useState } from 'react';
import { Hash, Volume2 } from 'lucide-react';
import ModalWrapper from './ModalWrapper';

const types = [{ id: 'text', label: 'Text', icon: Hash }, { id: 'voice', label: 'Voice', icon: Volume2 }];

export default function CreateChannelModal({ onClose, onCreate, categories, defaultCategoryId }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [catId, setCatId] = useState(defaultCategoryId || categories?.[0]?.id || '');

  return (
    <ModalWrapper title="Create Channel" onClose={onClose} width={400}>
      <div className="space-y-4">
        <div className="flex gap-2">
          {types.map(t => (
            <button key={t.id} onClick={() => setType(t.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all"
              style={{ background: type === t.id ? 'var(--bg-glass-active)' : 'var(--bg-glass)', border: `1px solid ${type === t.id ? 'var(--border-light)' : 'var(--border)'}`, color: type === t.id ? 'var(--text-cream)' : 'var(--text-muted)' }}>
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Name</label>
          <input value={name} onChange={e => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="new-channel"
            onKeyDown={e => e.key === 'Enter' && name.trim() && onCreate({ name: name.trim(), type, category_id: catId })}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none font-mono"
            style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} autoFocus />
        </div>
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
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm hover:bg-[var(--bg-glass-hover)]" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={() => name.trim() && onCreate({ name: name.trim(), type, category_id: catId })} disabled={!name.trim()}
            className="px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-30"
            style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>Create</button>
        </div>
      </div>
    </ModalWrapper>
  );
}