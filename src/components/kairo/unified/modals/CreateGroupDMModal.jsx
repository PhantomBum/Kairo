import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Users } from 'lucide-react';

export default function CreateGroupDMModal({ onClose, friends = [], onCreate }) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]);

  const toggle = (friend) => {
    setSelected(prev => prev.find(f => f.friend_id === friend.friend_id) ? prev.filter(f => f.friend_id !== friend.friend_id) : [...prev, friend]);
  };

  const handleCreate = () => {
    if (selected.length === 0) return;
    const participants = selected.map(f => ({ user_id: f.friend_id, user_email: f.friend_email, user_name: f.friend_name, avatar: f.friend_avatar }));
    onCreate({ name: name.trim() || selected.map(f => f.friend_name).join(', '), participants });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-sm mx-4 rounded-2xl overflow-hidden" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-zinc-400" />
              <h2 className="text-lg font-bold text-white">Create Group DM</h2>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all"><X className="w-4 h-4" /></button>
          </div>
          <p className="text-sm text-zinc-500 mb-4">Select friends to add to your group.</p>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Group name (optional)"
            className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/10 mb-4 transition-all"
            style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)' }} />
          
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {selected.map(f => (
                <div key={f.friend_id} onClick={() => toggle(f)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs text-white cursor-pointer hover:bg-white/10 transition-all"
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  {f.friend_name} <X className="w-3 h-3 text-zinc-400" />
                </div>
              ))}
            </div>
          )}

          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2">Friends</div>
          <div className="max-h-[240px] overflow-y-auto space-y-0.5 scrollbar-thin">
            {friends.map(f => {
              const isSel = selected.find(s => s.friend_id === f.friend_id);
              return (
                <button key={f.id} onClick={() => toggle(f)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                  style={{ background: isSel ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {f.friend_avatar ? <img src={f.friend_avatar} className="w-full h-full object-cover" /> : <span className="text-zinc-500">{(f.friend_name || 'U').charAt(0).toUpperCase()}</span>}
                  </div>
                  <span className="text-sm text-zinc-300 flex-1 text-left">{f.friend_name}</span>
                  <div className="w-5 h-5 rounded-md flex items-center justify-center transition-all"
                    style={{ background: isSel ? '#6366f1' : 'rgba(255,255,255,0.06)', border: isSel ? 'none' : '1px solid rgba(255,255,255,0.08)' }}>
                    {isSel && <Check className="w-3 h-3 text-white" />}
                  </div>
                </button>
              );
            })}
            {friends.length === 0 && <div className="text-center py-8 text-sm text-zinc-600">No friends yet</div>}
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4" style={{ background: '#0f0f0f', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleCreate} disabled={selected.length === 0}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-40 transition-all" style={{ background: '#fff' }}>
            Create Group ({selected.length})
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}