import React, { useState } from 'react';
import { Copy, Check, Link } from 'lucide-react';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';

export default function InviteModal({ onClose, server }) {
  const [copied, setCopied] = useState(false);
  const code = server?.invite_code || '';
  const url = `${window.location.origin}/invite/${code}`;

  const copy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ModalWrapper title="Invite People" subtitle={`Share this link to invite friends to ${server?.name}`} onClose={onClose} width={420}>
      <div className="space-y-5">
        {/* Invite link */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-2" style={{ color: colors.text.muted }}>Invite Link</label>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg text-[13px] truncate select-all"
              style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}>
              <Link className="w-4 h-4 flex-shrink-0" style={{ color: colors.text.disabled }} />
              <span className="truncate">{url}</span>
            </div>
            <button onClick={copy} className="px-4 rounded-lg flex items-center gap-2 text-[13px] font-semibold flex-shrink-0"
              style={{ background: copied ? colors.success : colors.accent.primary, color: '#fff' }}
              aria-label={copied ? 'Copied' : 'Copy invite link'}>
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>
        </div>

        {/* Invite code */}
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-2" style={{ color: colors.text.muted }}>Invite Code</label>
          <div className="px-3 py-3 rounded-lg text-[18px] font-semibold tracking-[0.25em] text-center select-all tabular-nums"
            style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}`, letterSpacing: '0.25em' }}>
            {code}
          </div>
        </div>

        <p className="text-[12px] leading-relaxed" style={{ color: colors.text.muted }}>
          Anyone with this link or code can join your server. You can change this in server settings.
        </p>
      </div>
    </ModalWrapper>
  );
}