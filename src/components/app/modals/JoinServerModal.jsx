import React, { useState } from 'react';
import ModalWrapper from './ModalWrapper';

export default function JoinServerModal({ onClose, onJoin, isJoining }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handle = async () => {
    if (!code.trim()) return;
    setError('');
    try { await onJoin(code); } catch (e) { setError(e.message || 'Invalid invite code'); }
  };

  return (
    <ModalWrapper title="Join a Server" onClose={onClose} width={420}>
      <div className="space-y-4">
        <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Enter an invite code to join an existing server.</p>
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Invite Code</label>
          <input value={code} onChange={e => setCode(e.target.value)} placeholder="ABC123" onKeyDown={e => e.key === 'Enter' && handle()}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none font-mono uppercase tracking-wider"
            style={{ background: 'var(--bg-glass)', color: 'var(--text-cream)', border: '1px solid var(--border)' }} autoFocus />
        </div>
        {error && <p className="text-[11px]" style={{ color: 'var(--accent-red)' }}>{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm hover:bg-[var(--bg-glass-hover)]" style={{ color: 'var(--text-secondary)' }}>Cancel</button>
          <button onClick={handle} disabled={!code.trim() || isJoining} className="px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-30"
            style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>{isJoining ? 'Joining...' : 'Join'}</button>
        </div>
      </div>
    </ModalWrapper>
  );
}