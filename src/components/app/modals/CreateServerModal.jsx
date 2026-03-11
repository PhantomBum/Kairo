import React, { useState } from 'react';
import ModalWrapper from './ModalWrapper';

export default function CreateServerModal({ onClose, onCreate, isCreating }) {
  const [name, setName] = useState('');
  const handleCreate = () => { if (name.trim()) onCreate({ name: name.trim(), template: 'blank' }); };

  return (
    <ModalWrapper title="Create a server" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Server Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="My Server"
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} autoFocus />
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleCreate} disabled={!name.trim() || isCreating}
            className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
            style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>
            {isCreating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}