import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Upload, Gamepad2, Code, Users, Lock, Palette, Calendar } from 'lucide-react';

const templates = [
  { id: 'blank', label: 'Start Fresh', icon: Palette, desc: 'Empty server' },
  { id: 'gaming', label: 'Gaming', icon: Gamepad2, desc: 'For your squad' },
  { id: 'community', label: 'Community', icon: Users, desc: 'Public community' },
  { id: 'development', label: 'Dev Team', icon: Code, desc: 'For developers' },
  { id: 'private', label: 'Friends', icon: Lock, desc: 'Private group' },
  { id: 'event', label: 'Event', icon: Calendar, desc: 'Organize events' },
];

export default function CreateServerModal({ onClose, onCreate, isCreating }) {
  const [name, setName] = useState('');
  const [template, setTemplate] = useState('blank');

  const handleCreate = () => {
    if (!name.trim() || isCreating) return;
    onCreate({ name: name.trim(), template });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-[460px] mx-4 rounded-2xl overflow-hidden" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-white">Create Your Server</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-zinc-500 mb-5">Your server is where you and your friends hang out.</p>

          {/* Template grid */}
          <div className="grid grid-cols-3 gap-2 mb-5">
            {templates.map(t => (
              <button key={t.id} onClick={() => setTemplate(t.id)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-150"
                style={{
                  background: template === t.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${template === t.id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)'}`,
                }}>
                <t.icon className="w-5 h-5" style={{ color: template === t.id ? '#fff' : '#666' }} />
                <span className="text-[11px] font-medium" style={{ color: template === t.id ? '#fff' : '#888' }}>{t.label}</span>
              </button>
            ))}
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">Server Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="My Awesome Server"
              autoFocus onKeyDown={e => e.key === 'Enter' && handleCreate()}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all"
              style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)' }} />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4" style={{ background: '#0f0f0f', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white transition-colors">Back</button>
          <button onClick={handleCreate} disabled={!name.trim() || isCreating}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-40 transition-all hover:shadow-lg"
            style={{ background: '#fff' }}>
            {isCreating ? 'Creating...' : 'Create Server'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}