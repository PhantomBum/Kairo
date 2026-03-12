import React, { useState, useEffect, useRef } from 'react';
import { StickyNote, X } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

export default function ServerNotes({ serverId, onClose }) {
  const key = `kairo-server-note-${serverId}`;
  const [note, setNote] = useState('');
  const saveRef = useRef(null);

  useEffect(() => {
    try { setNote(localStorage.getItem(key) || ''); } catch {}
  }, [key]);

  const handleChange = (val) => {
    setNote(val);
    // Immediate local save
    try { localStorage.setItem(key, val); } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
      <div className="w-full max-w-[400px] rounded-2xl overflow-hidden" style={{ background: colors.bg.surface, border: `1px solid ${colors.border.light}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${colors.border.default}` }}>
          <div className="flex items-center gap-2">
            <StickyNote className="w-4 h-4" style={{ color: colors.warning }} />
            <span className="text-[14px] font-semibold" style={{ color: colors.text.primary }}>Server Notes</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)]">
            <X className="w-4 h-4" style={{ color: colors.text.disabled }} />
          </button>
        </div>
        <div className="p-4">
          <textarea value={note} onChange={e => handleChange(e.target.value)} rows={6} placeholder="Write private notes about this server..."
            className="w-full text-[13px] rounded-lg p-3 resize-none outline-none" style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
          <p className="text-[11px] mt-2" style={{ color: colors.text.disabled }}>Only visible to you · Saves automatically</p>
        </div>
      </div>
    </div>
  );
}