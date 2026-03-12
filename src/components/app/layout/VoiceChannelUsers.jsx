import React from 'react';
import { Mic, MicOff, Headphones } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

export default function VoiceChannelUsers({ voiceStates }) {
  if (!voiceStates || voiceStates.length === 0) return null;

  return (
    <div className="pl-7 pr-2 pb-1 space-y-0.5">
      {voiceStates.map((vs) => (
        <div key={vs.user_id || vs.id} className="flex items-center gap-2 py-0.5 rounded px-1.5"
          style={{ color: colors.text.muted }}>
          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ background: colors.bg.overlay }}>
            {vs.user_avatar ? (
              <img src={vs.user_avatar} className="w-full h-full object-cover" alt="" />
            ) : (
              <span className="text-[9px] font-semibold">{(vs.user_name || '?').charAt(0).toUpperCase()}</span>
            )}
          </div>
          <span className="text-[13px] truncate flex-1">{vs.user_name || 'User'}</span>
          {(vs.is_self_muted || vs.is_muted) && <MicOff className="w-3 h-3 flex-shrink-0" style={{ color: colors.danger, opacity: 0.6 }} />}
          {(vs.is_self_deafened || vs.is_deafened) && <Headphones className="w-3 h-3 flex-shrink-0" style={{ color: colors.danger, opacity: 0.6 }} />}
        </div>
      ))}
    </div>
  );
}