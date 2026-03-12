import React, { useState } from 'react';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';

export default function JoinServerModal({ onClose, onJoin, isJoining }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handle = async () => {
    if (!code.trim()) return;
    setError('');
    try { await onJoin(code); } catch (e) { setError(e.message || 'Couldn\'t find that server. Check the code.'); }
  };

  return (
    <ModalWrapper title="Join a server" onClose={onClose} width={400}>
      <div className="space-y-4">
        <div>
          <input value={code} onChange={e => setCode(e.target.value)}
            placeholder="Paste invite code or link"
            onKeyDown={e => e.key === 'Enter' && handle()}
            className="w-full px-3 py-3 rounded-lg text-[14px] outline-none font-mono tracking-wide"
            style={{
              background: colors.bg.base,
              color: colors.text.primary,
              border: `1px solid ${error ? colors.danger : colors.border.default}`,
            }} autoFocus />
          {error && <p className="text-[12px] mt-1.5" style={{ color: colors.danger }}>{error}</p>}
        </div>

        <p className="text-[12px] leading-relaxed" style={{ color: colors.text.disabled }}>
          Invites look like <span className="font-mono" style={{ color: colors.text.muted }}>ABC123</span> or a full URL.
        </p>

        <div className="flex items-center justify-between pt-1">
          <button onClick={onClose} className="text-[13px] font-medium hover:underline" style={{ color: colors.text.disabled }}>
            Cancel
          </button>
          <button onClick={handle} disabled={!code.trim() || isJoining}
            className="px-5 py-2 rounded-lg text-[13px] font-semibold disabled:opacity-30"
            style={{ background: colors.accent.primary, color: '#fff' }}>
            {isJoining ? 'Joining...' : 'Join'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}