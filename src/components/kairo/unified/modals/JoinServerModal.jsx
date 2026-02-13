import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function JoinServerModal({ onClose, onJoin, isJoining }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async () => {
    if (!code.trim() || isJoining) return;
    setError('');
    try {
      await onJoin(code.trim());
    } catch (e) {
      setError(e.message || 'Failed to join');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 rounded-xl overflow-hidden" style={{ background: '#1a1a1a' }}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Join a Server</h2>
            <button onClick={onClose}><X className="w-5 h-5 text-zinc-500 hover:text-white" /></button>
          </div>
          <p className="text-sm text-zinc-500 mb-4">Enter an invite code to join an existing server.</p>
          <div>
            <label className="text-[11px] font-semibold uppercase text-zinc-500 mb-2 block">Invite Code</label>
            <input value={code} onChange={e => { setCode(e.target.value); setError(''); }} placeholder="e.g. ABC123"
              autoFocus onKeyDown={e => e.key === 'Enter' && handleJoin()}
              className="w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none" style={{ background: '#111' }} />
          </div>
          {error && <div className="mt-2 text-sm text-red-400">{error}</div>}
        </div>
        <div className="flex justify-end gap-2 px-5 py-4" style={{ background: '#151515' }}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleJoin} disabled={!code.trim() || isJoining}
            className="px-4 py-2 rounded-lg text-sm font-medium text-black disabled:opacity-50" style={{ background: '#fff' }}>
            {isJoining ? 'Joining...' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  );
}