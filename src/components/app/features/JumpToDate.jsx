import React, { useState } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

export default function JumpToDate({ onClose, onJump }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleJump = () => {
    if (!date) return;
    onJump(new Date(date));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="w-full max-w-[340px] rounded-2xl overflow-hidden" style={{ background: colors.bg.surface, border: `1px solid ${colors.border.light}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${colors.border.default}` }}>
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" style={{ color: colors.accent.primary }} />
            <span className="text-[14px] font-semibold" style={{ color: colors.text.primary }}>Jump to Date</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)]">
            <X className="w-4 h-4" style={{ color: colors.text.disabled }} />
          </button>
        </div>
        <div className="p-5">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none" style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}`, colorScheme: 'dark' }} />
          <button onClick={handleJump} className="w-full mt-3 py-2.5 rounded-lg text-[13px] font-semibold" style={{ background: colors.accent.primary, color: '#fff' }}>
            Jump
          </button>
        </div>
      </div>
    </div>
  );
}