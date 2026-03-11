import React, { useState } from 'react';
import { Compass } from 'lucide-react';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';

export default function JoinServerModal({ onClose, onJoin, isJoining }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handle = async () => {
    if (!code.trim()) return;
    setError('');
    try { await onJoin(code); } catch (e) { setError(e.message || 'That invite code didn\'t work. Double-check and try again.'); }
  };

  return (
    <ModalWrapper title="Join a Server" subtitle="Enter an invite code or link to join a community" onClose={onClose} width={420}>
      <div className="space-y-4">
        <div>
          <label htmlFor="invite-code" className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-2" style={{ color: colors.text.muted }}>Invite Code or Link</label>
          <input id="invite-code" value={code} onChange={e => setCode(e.target.value)} placeholder="ABC123 or https://kairo.app/invite/..."
            onKeyDown={e => e.key === 'Enter' && handle()}
            className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none uppercase tracking-wider"
            style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${error ? colors.danger : colors.border.default}` }} autoFocus />
        </div>
        {error && (
          <p className="text-[12px] flex items-center gap-1.5" style={{ color: colors.danger }}>
            {error}
          </p>
        )}
        <div className="p-3 rounded-lg" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
          <p className="text-[12px] font-medium mb-1" style={{ color: colors.text.secondary }}>Invites look like</p>
          <div className="space-y-0.5">
            <p className="text-[12px]" style={{ color: colors.text.muted }}>ABC123</p>
            <p className="text-[12px]" style={{ color: colors.text.muted }}>https://kairo.app/invite/ABC123</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button onClick={onClose} className="px-4 py-2.5 rounded-lg text-[14px] hover:bg-[rgba(255,255,255,0.04)]" style={{ color: colors.text.secondary }}>Cancel</button>
          <button onClick={handle} disabled={!code.trim() || isJoining}
            className="px-5 py-2.5 rounded-lg text-[14px] font-semibold disabled:opacity-30"
            style={{ background: colors.accent.primary, color: '#fff' }}>
            {isJoining ? 'Joining...' : 'Join Server'}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}