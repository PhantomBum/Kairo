import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

export default function DangerTab({ server, onDelete }) {
  const [confirmText, setConfirmText] = useState('');

  return (
    <div className="space-y-4">
      <div className="p-5 rounded-xl" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
        <div className="flex items-center gap-3 mb-3">
          <AlertTriangle className="w-6 h-6" style={{ color: colors.danger }} />
          <h3 className="text-[16px] font-bold" style={{ color: colors.danger }}>Delete Server</h3>
        </div>
        <p className="text-[13px] mb-1" style={{ color: colors.text.secondary }}>
          This action is <strong>permanent</strong> and cannot be undone. All channels, messages, roles, and member data will be permanently deleted.
        </p>
        <p className="text-[13px] mb-4" style={{ color: colors.text.muted }}>
          Type <span className="font-mono font-bold px-1 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.1)', color: colors.danger }}>{server?.name}</span> to confirm.
        </p>
        <input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder={server?.name}
          className="w-full px-3 py-2.5 rounded-xl text-[14px] outline-none font-mono mb-3"
          style={{ background: colors.bg.elevated, color: colors.danger, border: '1px solid rgba(239,68,68,0.2)' }} />
        <button onClick={() => confirmText === server?.name && onDelete()} disabled={confirmText !== server?.name}
          className="w-full py-3 rounded-xl text-[14px] font-bold disabled:opacity-20 transition-opacity"
          style={{ background: colors.danger, color: '#fff' }}>
          Delete Server Forever
        </button>
      </div>
    </div>
  );
}