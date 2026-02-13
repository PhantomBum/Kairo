import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function CreateServerModal({ onClose, onCreate, isCreating }) {
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (!name.trim() || isCreating) return;
    onCreate({ name: name.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 rounded-xl overflow-hidden" style={{ background: '#1a1a1a' }}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Create a Server</h2>
            <button onClick={onClose}><X className="w-5 h-5 text-zinc-500 hover:text-white" /></button>
          </div>
          <p className="text-sm text-zinc-500 mb-4">Give your server a name to get started.</p>
          <div>
            <label className="text-[11px] font-semibold uppercase text-zinc-500 mb-2 block">Server Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="My Awesome Server"
              autoFocus onKeyDown={e => e.key === 'Enter' && handleCreate()}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none" style={{ background: '#111' }} />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4" style={{ background: '#151515' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleCreate} disabled={!name.trim() || isCreating}
            className="px-4 py-2 rounded-lg text-sm font-medium text-black disabled:opacity-50" style={{ background: '#fff' }}>
            {isCreating ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}