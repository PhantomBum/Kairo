import React, { useState } from 'react';
import { Crown, AlertTriangle, Search } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

export default function OwnershipTab({ server, members, currentUserId, onTransfer }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [transferring, setTransferring] = useState(false);

  const isOwner = server?.owner_id === currentUserId;
  const eligible = members.filter(m => m.user_id !== currentUserId && !m.is_banned);
  const filtered = eligible.filter(m =>
    (m.user_email || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.nickname || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleTransfer = async () => {
    if (confirmText !== 'TRANSFER' || !selected) return;
    setTransferring(true);
    await onTransfer(selected.user_id);
    setTransferring(false);
  };

  if (!isOwner) {
    return (
      <div className="text-center py-12">
        <Crown className="w-10 h-10 mx-auto mb-3" style={{ color: colors.text.disabled }} />
        <p className="text-[14px] font-medium" style={{ color: colors.text.muted }}>Only the server owner can transfer ownership</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="p-4 rounded-xl" style={{ background: 'rgba(240,178,50,0.06)', border: '1px solid rgba(240,178,50,0.15)' }}>
        <div className="flex items-center gap-3 mb-2">
          <Crown className="w-5 h-5" style={{ color: '#f0b232' }} />
          <h3 className="text-[15px] font-bold" style={{ color: '#f0b232' }}>Transfer Ownership</h3>
        </div>
        <p className="text-[13px]" style={{ color: colors.text.secondary }}>
          Transfer server ownership to another member. You will become a regular member and lose all owner privileges.
        </p>
      </div>

      {!selected ? (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.text.disabled }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
              className="w-full pl-10 pr-3 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
          </div>

          <div className="max-h-[300px] overflow-y-auto scrollbar-none space-y-1">
            {filtered.length === 0 ? (
              <p className="text-center py-8 text-[13px]" style={{ color: colors.text.disabled }}>
                {eligible.length === 0 ? 'No other members in this server' : 'No members match your search'}
              </p>
            ) : filtered.map(m => (
              <button key={m.id} onClick={() => setSelected(m)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors"
                style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold"
                  style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                  {(m.nickname || m.user_email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: colors.text.primary }}>{m.nickname || m.user_email}</p>
                  {m.nickname && <p className="text-[11px] truncate" style={{ color: colors.text.disabled }}>{m.user_email}</p>}
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-xl flex items-center gap-3" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-semibold"
              style={{ background: colors.accent.subtle, color: colors.accent.primary }}>
              {(selected.nickname || selected.user_email || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[14px] font-semibold" style={{ color: colors.text.primary }}>{selected.nickname || selected.user_email}</p>
              <p className="text-[12px]" style={{ color: colors.text.disabled }}>Will become the new owner</p>
            </div>
            <button onClick={() => { setSelected(null); setConfirmText(''); }} className="ml-auto text-[12px] px-3 py-1.5 rounded-lg"
              style={{ background: colors.bg.overlay, color: colors.text.muted }}>Change</button>
          </div>

          <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4" style={{ color: colors.danger }} />
              <p className="text-[13px] font-semibold" style={{ color: colors.danger }}>This action cannot be undone</p>
            </div>
            <p className="text-[12px] mb-3" style={{ color: colors.text.muted }}>
              Type <span className="font-mono font-bold px-1 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.1)', color: colors.danger }}>TRANSFER</span> to confirm.
            </p>
            <input value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="TRANSFER"
              className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none font-mono mb-3"
              style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${confirmText === 'TRANSFER' ? colors.success : colors.border.default}` }} />
            <button onClick={handleTransfer} disabled={confirmText !== 'TRANSFER' || transferring}
              className="w-full py-2.5 rounded-lg text-[13px] font-bold disabled:opacity-20 transition-opacity"
              style={{ background: colors.danger, color: '#fff' }}>
              {transferring ? 'Transferring...' : 'Transfer Ownership'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}