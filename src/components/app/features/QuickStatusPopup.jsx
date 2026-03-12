import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

const STATUSES = [
  { id: 'online', label: 'Online', color: colors.status.online },
  { id: 'idle', label: 'Idle', color: colors.status.idle },
  { id: 'dnd', label: 'Do Not Disturb', color: colors.status.dnd },
  { id: 'invisible', label: 'Invisible', color: colors.status.invisible },
];

const RECENT_KEY = 'kairo-recent-statuses';
function getRecentStatuses() { try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; } }

export default function QuickStatusPopup({ currentStatus, customStatus, onSave, onClose }) {
  const [selected, setSelected] = useState(currentStatus || 'online');
  const [text, setText] = useState(customStatus?.text || '');
  const [emoji, setEmoji] = useState(customStatus?.emoji || '');
  const [recent] = useState(getRecentStatuses);
  const popupRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) onClose();
    };
    // Delay to prevent immediate close from the click that opened it
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [onClose]);

  const handleSave = (status, customText, customEmoji) => {
    const s = status || selected;
    const ct = customText !== undefined ? customText : text;
    const ce = customEmoji !== undefined ? customEmoji : emoji;
    if (ct) {
      const updated = [ct, ...recent.filter(r => r !== ct)].slice(0, 5);
      try { localStorage.setItem(RECENT_KEY, JSON.stringify(updated)); } catch {}
    }
    onSave({ status: s, customStatus: ct ? { text: ct, emoji: ce } : null });
  };

  return (
    <div ref={popupRef} className="absolute bottom-full left-0 mb-2 w-[260px] rounded-xl p-3 k-scale-in z-50"
      style={{ background: colors.bg.float, border: `1px solid ${colors.border.strong}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
      onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: colors.text.muted }}>Set Status</span>
        <button onClick={onClose} className="w-5 h-5 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,0.06)]">
          <X className="w-3 h-3" style={{ color: colors.text.disabled }} />
        </button>
      </div>

      <div className="space-y-0.5 mb-3">
        {STATUSES.map(s => (
          <button key={s.id} onClick={() => { setSelected(s.id); handleSave(s.id, text, emoji); }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors"
            style={{ background: selected === s.id ? 'rgba(255,255,255,0.06)' : 'transparent', color: colors.text.primary }}>
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: s.color }} />
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 p-2 rounded-lg mb-2" style={{ background: colors.bg.overlay, border: `1px solid ${colors.border.default}` }}>
        <input ref={inputRef} value={text} onChange={e => setText(e.target.value)} placeholder="Custom status..."
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleSave(); } e.stopPropagation(); }}
          className="flex-1 bg-transparent text-[13px] outline-none min-w-0" style={{ color: colors.text.primary }} />
        {text && <button onClick={() => { setText(''); setEmoji(''); }} className="flex-shrink-0"><X className="w-3 h-3" style={{ color: colors.text.disabled }} /></button>}
      </div>

      {recent.length > 0 && (
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-wider block mb-1 px-1" style={{ color: colors.text.disabled }}>Recent</span>
          {recent.slice(0, 3).map((r, i) => (
            <button key={i} onClick={() => { setText(r); handleSave(selected, r, ''); }}
              className="w-full text-left px-2 py-1.5 rounded-md text-[12px] truncate hover:bg-[rgba(255,255,255,0.04)]"
              style={{ color: colors.text.muted }}>{r}</button>
          ))}
        </div>
      )}
    </div>
  );
}