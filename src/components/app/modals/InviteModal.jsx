import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import ModalWrapper from './ModalWrapper';

export default function InviteModal({ onClose, server }) {
  const [copied, setCopied] = useState(false);
  const code = server?.invite_code || '';
  const url = `${window.location.origin}/invite/${code}`;

  const copy = () => { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <ModalWrapper title="Invite People" onClose={onClose} width={420}>
      <div className="space-y-4">
        <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Share this link to invite people to <span className="font-semibold" style={{ color: 'var(--text-cream)' }}>{server?.name}</span></p>
        <div className="flex gap-2">
          <div className="flex-1 px-3 py-2.5 rounded-xl text-[13px] font-mono truncate select-all"
            style={{ background: 'var(--bg-glass)', color: 'var(--text-cream)', border: '1px solid var(--border)' }}>{url}</div>
          <button onClick={copy} className="px-4 rounded-xl flex items-center gap-2 text-sm font-medium transition-all"
            style={{ background: copied ? 'var(--accent-green)' : 'var(--text-cream)', color: 'var(--bg-deep)' }}>
            {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
          </button>
        </div>
        <div className="pt-2">
          <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Invite Code</label>
          <div className="px-3 py-2.5 rounded-xl text-lg font-mono tracking-[0.3em] text-center select-all"
            style={{ background: 'var(--bg-glass)', color: 'var(--text-cream)', border: '1px solid var(--border)' }}>{code}</div>
        </div>
      </div>
    </ModalWrapper>
  );
}