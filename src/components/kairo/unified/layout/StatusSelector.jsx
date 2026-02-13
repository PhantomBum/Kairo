import React, { useState } from 'react';
import { Circle, Moon, MinusCircle, EyeOff, Smile, X } from 'lucide-react';

const statuses = [
  { id: 'online', label: 'Online', color: '#22c55e', icon: Circle },
  { id: 'idle', label: 'Idle', color: '#eab308', icon: Moon },
  { id: 'dnd', label: 'Do Not Disturb', color: '#ef4444', icon: MinusCircle },
  { id: 'invisible', label: 'Invisible', color: '#555', icon: EyeOff },
];

export default function StatusSelector({ currentStatus, customStatus, onStatusChange, onCustomStatusChange, onClose }) {
  const [customText, setCustomText] = useState(customStatus?.text || '');
  const [customEmoji, setCustomEmoji] = useState(customStatus?.emoji || '😀');

  const handleSetCustom = () => {
    if (customText.trim()) {
      onCustomStatusChange({ emoji: customEmoji, text: customText.trim() });
    }
    onClose();
  };

  const handleClearCustom = () => {
    onCustomStatusChange(null);
    setCustomText('');
  };

  return (
    <div className="absolute bottom-full left-0 mb-2 w-64 rounded-xl overflow-hidden z-50"
      style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
      <div className="p-2 space-y-0.5">
        {statuses.map(s => (
          <button key={s.id} onClick={() => { onStatusChange(s.id); onClose(); }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/[0.06]"
            style={{ color: currentStatus === s.id ? '#fff' : '#999' }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
            {s.label}
            {currentStatus === s.id && <span className="ml-auto text-[10px] text-zinc-500">Current</span>}
          </button>
        ))}
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="p-3">
        <div className="text-[11px] font-semibold uppercase text-zinc-500 mb-2">Custom Status</div>
        {customStatus?.text && (
          <div className="flex items-center gap-2 mb-2 px-2 py-1.5 rounded-lg" style={{ background: '#111' }}>
            <span>{customStatus.emoji}</span>
            <span className="text-sm text-zinc-300 flex-1 truncate">{customStatus.text}</span>
            <button onClick={handleClearCustom}><X className="w-3 h-3 text-zinc-500 hover:text-white" /></button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <button onClick={() => {
            const emojis = ['😀','😎','🎮','💻','🎵','📚','☕','🌙','🔥','✨','💪','🎯'];
            setCustomEmoji(emojis[Math.floor(Math.random() * emojis.length)]);
          }} className="w-9 h-9 rounded-lg flex items-center justify-center text-lg" style={{ background: '#111' }}>
            {customEmoji}
          </button>
          <input value={customText} onChange={e => setCustomText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSetCustom()}
            placeholder="Set a status..." className="flex-1 h-9 px-2 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none" style={{ background: '#111' }} />
        </div>
        {customText.trim() && (
          <button onClick={handleSetCustom} className="w-full mt-2 py-1.5 rounded-lg text-sm font-medium text-black" style={{ background: '#fff' }}>
            Set Status
          </button>
        )}
      </div>
    </div>
  );
}