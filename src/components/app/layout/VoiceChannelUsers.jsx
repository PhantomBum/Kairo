import React from 'react';
import { MicOff, Headphones } from 'lucide-react';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  muted: '#5d7a8a', accent: '#2dd4bf',
};

export default function VoiceChannelUsers({ voiceStates }) {
  if (!voiceStates || voiceStates.length === 0) return null;

  return (
    <div className="pl-8 pr-2 pb-1.5 pt-0.5">
      {/* Stacked avatars row */}
      <div className="flex items-center -space-x-2 mb-0.5">
        {voiceStates.slice(0, 8).map((vs) => (
          <div key={vs.user_id || vs.id} className="relative flex-shrink-0">
            <div className="w-6 h-6 rounded-full flex items-center justify-center overflow-hidden"
              style={{
                background: P.elevated,
                border: `2px solid ${P.surface}`,
                boxShadow: vs.is_speaking ? `0 0 0 2px ${P.accent}` : 'none',
                transition: 'box-shadow 200ms ease',
              }}>
              {vs.user_avatar ? (
                <img src={vs.user_avatar} className="w-full h-full object-cover" alt="" />
              ) : (
                <span className="text-[8px] font-bold" style={{ color: P.muted }}>
                  {(vs.user_name || '?').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            {/* Speaking ring pulse */}
            {vs.is_speaking && (
              <div className="absolute inset-0 rounded-full animate-ping"
                style={{ border: `2px solid ${P.accent}`, opacity: 0.4 }} />
            )}
          </div>
        ))}
        {voiceStates.length > 8 && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
            style={{ background: P.elevated, color: P.muted, border: `2px solid ${P.surface}` }}>
            +{voiceStates.length - 8}
          </div>
        )}
      </div>

      {/* User list with names */}
      {voiceStates.map((vs) => (
        <div key={vs.user_id || vs.id}
          className="flex items-center gap-1.5 py-[2px] rounded px-1"
          style={{ color: P.muted }}>
          <div className="relative w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{ background: P.elevated }}>
            {vs.user_avatar ? (
              <img src={vs.user_avatar} className="w-full h-full object-cover" alt="" />
            ) : (
              <span className="text-[7px] font-semibold">{(vs.user_name || '?').charAt(0).toUpperCase()}</span>
            )}
            {vs.is_speaking && (
              <div className="absolute inset-0 rounded-full"
                style={{ border: `1.5px solid ${P.accent}` }} />
            )}
          </div>
          <span className="text-[12px] truncate flex-1"
            style={{ color: vs.is_speaking ? P.accent : P.muted }}>
            {vs.user_name || 'User'}
          </span>
          {(vs.is_self_muted || vs.is_muted) && (
            <MicOff className="w-3 h-3 flex-shrink-0" style={{ color: '#ed4245', opacity: 0.6 }} />
          )}
          {(vs.is_self_deafened || vs.is_deafened) && (
            <Headphones className="w-3 h-3 flex-shrink-0" style={{ color: '#ed4245', opacity: 0.6 }} />
          )}
        </div>
      ))}
    </div>
  );
}
