import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

export default function InviteModal({ onClose, server }) {
  const [copied, setCopied] = useState(false);
  const link = `kairo.app/invite/${server.invite_code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(server.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 rounded-xl overflow-hidden" style={{ background: '#1a1a1a' }}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Invite to {server.name}</h2>
            <button onClick={onClose}><X className="w-5 h-5 text-zinc-500 hover:text-white" /></button>
          </div>
          <p className="text-sm text-zinc-500 mb-4">Share this invite code with friends</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 rounded-lg text-sm text-white font-mono" style={{ background: '#111' }}>
              {server.invite_code}
            </div>
            <button onClick={handleCopy}
              className="px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
              style={{ background: copied ? '#22c55e' : '#fff', color: copied ? '#fff' : '#000' }}>
              {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
            </button>
          </div>
          <p className="text-[11px] text-zinc-600 mt-3">Or share the full link: {link}</p>
        </div>
      </div>
    </div>
  );
}