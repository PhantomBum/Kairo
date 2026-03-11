import React, { useState } from 'react';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';

const statuses = [
  { id: 'online', label: 'Online', desc: 'You are visible to everyone' },
  { id: 'idle', label: 'Idle', desc: 'Shown as away' },
  { id: 'dnd', label: 'Do Not Disturb', desc: 'Suppress all notifications' },
  { id: 'invisible', label: 'Invisible', desc: 'Appear offline to others' },
];

export default function StatusPickerModal({ onClose, currentStatus, customStatus, onSave }) {
  const [status, setStatus] = useState(currentStatus || 'online');
  const [emoji, setEmoji] = useState(customStatus?.emoji || '');
  const [text, setText] = useState(customStatus?.text || '');

  return (
    <ModalWrapper title="Set Your Status" subtitle="Let others know what you're up to" onClose={onClose} width={380}>
      <div className="space-y-4">
        {/* Status selection */}
        <div className="space-y-1">
          {statuses.map(s => (
            <button key={s.id} onClick={() => setStatus(s.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg"
              style={{
                background: status === s.id ? colors.accent.subtle : 'transparent',
                border: `1px solid ${status === s.id ? colors.accent.muted : 'transparent'}`,
              }}
              aria-pressed={status === s.id}>
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: colors.status[s.id] || colors.status.offline }} />
              <div className="text-left">
                <div className="text-[14px] font-medium" style={{ color: colors.text.primary }}>{s.label}</div>
                <div className="text-[12px]" style={{ color: colors.text.muted }}>{s.desc}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Custom status */}
        <div className="pt-2" style={{ borderTop: `1px solid ${colors.border.default}` }}>
          <label className="text-[11px] font-semibold uppercase tracking-[0.06em] block mb-2" style={{ color: colors.text.muted }}>Custom Status</label>
          <div className="flex gap-2">
            <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="😊" maxLength={2}
              className="w-12 px-2 py-2.5 rounded-lg text-center text-base outline-none"
              style={{ background: colors.bg.base, border: `1px solid ${colors.border.default}`, color: colors.text.primary }}
              aria-label="Status emoji" />
            <input value={text} onChange={e => setText(e.target.value)} placeholder="What's happening?"
              className="flex-1 px-3 py-2.5 rounded-lg text-[14px] outline-none"
              style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}
              aria-label="Status text" />
          </div>
        </div>

        {/* Save */}
        <button onClick={() => onSave({ status, customStatus: (emoji || text) ? { emoji, text } : null })}
          className="w-full py-2.5 rounded-lg text-[14px] font-semibold"
          style={{ background: colors.accent.primary, color: '#fff' }}>
          Save Status
        </button>
      </div>
    </ModalWrapper>
  );
}