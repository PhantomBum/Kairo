import React, { useState } from 'react';
import { X, Hash, Volume2, Megaphone, MessagesSquare, Lock } from 'lucide-react';

const types = [
  { id: 'text', name: 'Text', icon: Hash },
  { id: 'voice', name: 'Voice', icon: Volume2 },
  { id: 'announcement', name: 'Announcement', icon: Megaphone },
  { id: 'forum', name: 'Forum', icon: MessagesSquare },
];

export default function CreateChannelModal({ onClose, onCreate, categories = [], defaultCategoryId }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('text');
  const [categoryId, setCategoryId] = useState(defaultCategoryId || '');
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || creating) return;
    setCreating(true);
    await onCreate({
      name: name.trim().toLowerCase().replace(/\s+/g, '-'),
      type, category_id: categoryId || null, is_private: isPrivate,
    });
    setCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 rounded-xl overflow-hidden" style={{ background: '#1a1a1a' }}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Create Channel</h2>
            <button onClick={onClose}><X className="w-5 h-5 text-zinc-500 hover:text-white" /></button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold uppercase text-zinc-500 mb-2 block">Channel Type</label>
              <div className="grid grid-cols-2 gap-2">
                {types.map(t => (
                  <button key={t.id} onClick={() => setType(t.id)} className="flex items-center gap-2 p-3 rounded-lg text-left transition-colors"
                    style={{ background: type === t.id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${type === t.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                    <t.icon className="w-4 h-4" style={{ color: type === t.id ? '#fff' : '#666' }} />
                    <span className="text-sm" style={{ color: type === t.id ? '#fff' : '#999' }}>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase text-zinc-500 mb-2 block">Channel Name</label>
              <input value={name} onChange={e => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="new-channel"
                autoFocus onKeyDown={e => e.key === 'Enter' && handleCreate()}
                className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none" style={{ background: '#111' }} />
            </div>
            {categories.length > 0 && (
              <div>
                <label className="text-[11px] font-semibold uppercase text-zinc-500 mb-2 block">Category</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none" style={{ background: '#111' }}>
                  <option value="">No Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            <label className="flex items-center gap-3 p-3 rounded-lg cursor-pointer" style={{ background: '#111' }}>
              <Lock className="w-4 h-4 text-zinc-500" />
              <div className="flex-1">
                <span className="text-sm text-white">Private Channel</span>
                <p className="text-[11px] text-zinc-500">Only selected members can view</p>
              </div>
              <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="w-4 h-4 rounded" />
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4" style={{ background: '#151515' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleCreate} disabled={!name.trim() || creating}
            className="px-4 py-2 rounded-lg text-sm font-medium text-black disabled:opacity-50" style={{ background: '#fff' }}>
            {creating ? 'Creating...' : 'Create Channel'}
          </button>
        </div>
      </div>
    </div>
  );
}