import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Hash, Volume2, Megaphone, MessagesSquare, Lock } from 'lucide-react';

const types = [
  { id: 'text', name: 'Text', icon: Hash, desc: 'Send messages and files' },
  { id: 'voice', name: 'Voice', icon: Volume2, desc: 'Hang out together' },
  { id: 'announcement', name: 'Announce', icon: Megaphone, desc: 'Important updates' },
  { id: 'forum', name: 'Forum', icon: MessagesSquare, desc: 'Organized discussions' },
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
    await onCreate({ name: name.trim().toLowerCase().replace(/\s+/g, '-'), type, category_id: categoryId || null, is_private: isPrivate });
    setCreating(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-[460px] mx-4 rounded-2xl overflow-hidden" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-white">Create Channel</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all"><X className="w-4 h-4" /></button>
          </div>
          <p className="text-sm text-zinc-500 mb-5">Choose a type and name for your new channel.</p>
          <div className="space-y-5">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2.5 block">Channel Type</label>
              <div className="grid grid-cols-2 gap-2">
                {types.map(t => (
                  <button key={t.id} onClick={() => setType(t.id)}
                    className="flex items-center gap-2.5 p-3 rounded-xl text-left transition-all duration-150"
                    style={{
                      background: type === t.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${type === t.id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)'}`,
                    }}>
                    <t.icon className="w-5 h-5 flex-shrink-0" style={{ color: type === t.id ? '#fff' : '#666' }} />
                    <div>
                      <div className="text-[12px] font-medium" style={{ color: type === t.id ? '#fff' : '#999' }}>{t.name}</div>
                      <div className="text-[10px]" style={{ color: '#666' }}>{t.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">Channel Name</label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input value={name} onChange={e => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))} placeholder="new-channel"
                  autoFocus onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all"
                  style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)' }} />
              </div>
            </div>
            {categories.length > 0 && (
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">Category</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none appearance-none cursor-pointer"
                  style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <option value="">No Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            )}
            <label className="flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all hover:bg-white/[0.02]"
              style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.04)' }}>
              <Lock className="w-4 h-4 text-zinc-500" />
              <div className="flex-1">
                <span className="text-sm text-white">Private Channel</span>
                <p className="text-[11px] text-zinc-600">Only selected members and roles can view</p>
              </div>
              <div className="relative">
                <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="sr-only" />
                <div className="w-9 h-5 rounded-full transition-colors" style={{ background: isPrivate ? '#22c55e' : '#333' }}>
                  <div className="w-4 h-4 rounded-full bg-white mt-0.5 transition-all" style={{ marginLeft: isPrivate ? 18 : 2 }} />
                </div>
              </div>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4" style={{ background: '#0f0f0f', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleCreate} disabled={!name.trim() || creating}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-40 transition-all" style={{ background: '#fff' }}>
            {creating ? 'Creating...' : 'Create Channel'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}