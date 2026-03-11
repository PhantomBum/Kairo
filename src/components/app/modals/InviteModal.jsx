import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import ModalWrapper from './ModalWrapper';

export default function InviteModal({ onClose, server }) {
  const [copied, setCopied] = useState(false);
  const link = `kairo.app/invite/${server?.invite_code || ''}`;

  const copy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ModalWrapper title={`Invite to ${server?.name}`} onClose={onClose}>
      <div className="space-y-3">
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Share this link to invite people:</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2.5 rounded-lg text-sm" style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
            {link}
          </div>
          <button onClick={copy} className="px-3 py-2.5 rounded-lg text-sm font-medium"
            style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
}