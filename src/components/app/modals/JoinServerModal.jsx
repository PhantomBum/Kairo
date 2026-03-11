import React, { useState } from 'react';
import ModalWrapper from './ModalWrapper';

export default function JoinServerModal({ onClose, onJoin, isJoining }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async () => {
    setError('');
    try { await onJoin(code); }
    catch { setError('Invalid invite code'); }
  };

  return (
    <ModalWrapper title="Join a server" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Invite Code</label>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="Enter code or link"
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
            className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
            style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} autoFocus />
          {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handleJoin} disabled={!code.trim() || isJoining}
            className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
            style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>
            {isJoining ? 'Joining...' : 'Join'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}