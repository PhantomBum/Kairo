import React, { useState } from 'react';
import { Volume2, Play, Pause, Upload } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

const DEFAULT_SOUNDS = [
  { name: 'Join Sound', key: 'join', enabled: true },
  { name: 'Leave Sound', key: 'leave', enabled: true },
  { name: 'Notification', key: 'notification', enabled: true },
  { name: 'Mention', key: 'mention', enabled: true },
  { name: 'Message', key: 'message', enabled: false },
];

export default function SoundsTab({ serverId }) {
  const [sounds, setSounds] = useState(DEFAULT_SOUNDS);

  const toggle = (key) => {
    setSounds(s => s.map(x => x.key === key ? { ...x, enabled: !x.enabled } : x));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Volume2 className="w-5 h-5" style={{ color: colors.accent.primary }} />
        <div>
          <p className="text-[14px] font-semibold" style={{ color: colors.text.primary }}>Sound Settings</p>
          <p className="text-[12px]" style={{ color: colors.text.muted }}>Configure notification sounds for your server</p>
        </div>
      </div>

      <div className="space-y-2">
        {sounds.map(s => (
          <div key={s.key} className="flex items-center justify-between p-3.5 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: colors.bg.overlay }}>
                <Volume2 className="w-4 h-4" style={{ color: s.enabled ? colors.accent.primary : colors.text.disabled }} />
              </div>
              <span className="text-[13px] font-medium" style={{ color: colors.text.primary }}>{s.name}</span>
            </div>
            <button onClick={() => toggle(s.key)}
              className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
              style={{ background: s.enabled ? colors.success : colors.bg.overlay }}>
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: s.enabled ? 22 : 2 }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}