import React, { useState } from 'react';
import { X, Check, Users } from 'lucide-react';

export default function CreateGroupDMModal({ isOpen, onClose, friends = [], onCreate }) {
  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]);

  if (!isOpen) return null;

  const toggle = (friend) => {
    setSelected(prev => 
      prev.find(f => f.friend_id === friend.friend_id)
        ? prev.filter(f => f.friend_id !== friend.friend_id)
        : [...prev, friend]
    );
  };

  const handleCreate = () => {
    if (selected.length === 0) return;
    const participants = selected.map(f => ({
      user_id: f.friend_id,
      user_email: f.friend_email,
      user_name: f.friend_name,
      avatar: f.friend_avatar,
    }));
    const groupName = name.trim() || selected.map(f => f.friend_name).join(', ');
    onCreate({ name: groupName, participants });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-sm mx-4 rounded-xl overflow-hidden" style={{ background: '#1a1a1a' }}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Create Group DM</h2>
            <button onClick={onClose}><X className="w-5 h-5 text-zinc-500 hover:text-white" /></button>
          </div>

          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="Group name (optional)"
            className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none mb-3"
            style={{ background: '#111' }} />

          <div className="text-[11px] font-semibold uppercase text-zinc-500 mb-2">Select Friends</div>
          <div className="max-h-60 overflow-y-auto space-y-1">
            {friends.map(f => {
              const isSelected = selected.find(s => s.friend_id === f.friend_id);
              return (
                <button key={f.id} onClick={() => toggle(f)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                  style={{ background: isSelected ? 'rgba(255,255,255,0.08)' : 'transparent' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden"
                    style={{ background: '#222' }}>
                    {f.friend_avatar ? <img src={f.friend_avatar} className="w-full h-full object-cover" /> : (f.friend_name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-white flex-1 text-left">{f.friend_name}</span>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </button>
              );
            })}
            {friends.length === 0 && (
              <div className="text-center py-6 text-sm text-zinc-500">No friends yet</div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4" style={{ background: '#151515' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-zinc-400">Cancel</button>
          <button onClick={handleCreate} disabled={selected.length === 0}
            className="px-4 py-2 rounded-lg text-sm font-medium text-black disabled:opacity-50"
            style={{ background: '#fff' }}>
            Create ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
}