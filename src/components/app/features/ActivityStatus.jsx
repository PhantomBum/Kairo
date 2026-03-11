import React, { useState } from 'react';
import { Gamepad2, Music, Eye, Radio, Trophy, X } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';
import ModalWrapper from '@/components/app/modals/ModalWrapper';

const TYPES = [
  { id: 'playing', label: 'Playing', icon: Gamepad2, color: '#23a55a' },
  { id: 'listening', label: 'Listening to', icon: Music, color: '#1DB954' },
  { id: 'watching', label: 'Watching', icon: Eye, color: '#5865f2' },
  { id: 'streaming', label: 'Streaming', icon: Radio, color: '#f23f43' },
  { id: 'competing', label: 'Competing in', icon: Trophy, color: '#f0b232' },
];

export default function ActivityStatus({ onClose, profile, onUpdate }) {
  const [type, setType] = useState(profile?.rich_presence?.type || '');
  const [name, setName] = useState(profile?.rich_presence?.name || '');
  const [details, setDetails] = useState(profile?.rich_presence?.details || '');

  const save = () => {
    if (!type || !name.trim()) {
      onUpdate({ rich_presence: null });
    } else {
      onUpdate({ rich_presence: { type, name: name.trim(), details: details.trim(), start_timestamp: Date.now() } });
    }
    onClose();
  };

  const clear = () => { onUpdate({ rich_presence: null }); onClose(); };

  return (
    <ModalWrapper title="Set Activity" onClose={onClose} width={400}>
      <div className="space-y-4">
        <div className="grid grid-cols-5 gap-2">
          {TYPES.map(t => (
            <button key={t.id} onClick={() => setType(t.id)} className="flex flex-col items-center gap-1.5 p-2.5 rounded-lg transition-colors"
              style={{ background: type === t.id ? `${t.color}15` : colors.bg.elevated, border: `2px solid ${type === t.id ? t.color : 'transparent'}` }}>
              <t.icon className="w-5 h-5" style={{ color: type === t.id ? t.color : colors.text.muted }} />
              <span className="text-[10px]" style={{ color: type === t.id ? t.color : colors.text.muted }}>{t.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: colors.text.muted }}>
            {TYPES.find(t => t.id === type)?.label || 'Activity'} Name
          </label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Minecraft, Spotify, Netflix..."
            className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none" style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: colors.text.muted }}>Details (optional)</label>
          <input value={details} onChange={e => setDetails(e.target.value)} placeholder="e.g. Building a castle, Playing ranked..."
            className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none" style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
        </div>
        <div className="flex gap-2">
          <button onClick={clear} className="flex-1 py-2.5 rounded-xl text-[14px] font-medium" style={{ color: colors.text.muted }}>Clear Activity</button>
          <button onClick={save} className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold" style={{ background: colors.accent.primary, color: '#fff' }}>Save</button>
        </div>
      </div>
    </ModalWrapper>
  );
}