import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Link, ArrowRight } from 'lucide-react';

export default function JoinServerModal({ onClose, onJoin, isJoining }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!code.trim() || isJoining) return;
    setError('');
    try { await onJoin(code.trim()); } catch (e) { setError(e.message || 'Invalid invite code'); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-[420px] mx-4 rounded-2xl overflow-hidden" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-white">Join a Server</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all"><X className="w-4 h-4" /></button>
          </div>
          <p className="text-sm text-zinc-500 mb-5">Enter an invite code or link below</p>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 mb-2 block">Invite Link / Code</label>
            <div className="relative">
              <Link className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <input value={code} onChange={e => { setCode(e.target.value); setError(''); }} placeholder="kairo.app/invite/ABC123 or ABC123"
                autoFocus onKeyDown={e => e.key === 'Enter' && handleJoin()}
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all"
                style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)' }} />
            </div>
          </div>
          {error && <div className="mt-3 text-sm text-red-400 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />{error}</div>}
          <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="text-[11px] text-zinc-500 font-medium mb-1.5">Invites look like</div>
            <div className="flex flex-wrap gap-1.5">
              {['ABC123', 'kairo.app/invite/ABC123'].map(ex => (
                <code key={ex} className="text-[11px] px-2 py-1 rounded-md text-zinc-400" style={{ background: '#0a0a0a' }}>{ex}</code>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4" style={{ background: '#0f0f0f', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-white transition-colors">Back</button>
          <button onClick={handleJoin} disabled={!code.trim() || isJoining}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black disabled:opacity-40 transition-all"
            style={{ background: '#fff' }}>
            {isJoining ? 'Joining...' : <>Join Server <ArrowRight className="w-3.5 h-3.5" /></>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}