import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { colors, shadows } from '@/components/app/design/tokens';

export default function NSFWGate({ channelName, onAccept }) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
          style={{ background: 'rgba(242,63,67,0.1)', border: '1px solid rgba(242,63,67,0.2)' }}>
          <ShieldAlert className="w-8 h-8" style={{ color: '#f23f43' }} />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: colors.text.primary }}>NSFW Channel</h2>
        <p className="text-[14px] mb-1 font-medium" style={{ color: colors.text.secondary }}>#{channelName}</p>
        <p className="text-[13px] leading-relaxed mb-6" style={{ color: colors.text.muted }}>
          This channel is marked as age-restricted. You must be 18 or older to view its content.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={onAccept}
            className="px-5 py-2.5 rounded-lg text-[14px] font-semibold"
            style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.light}` }}>
            I'm 18+, Continue
          </button>
        </div>
        <p className="text-[11px] mt-4" style={{ color: colors.text.disabled }}>
          By continuing, you confirm you are at least 18 years old.
        </p>
      </div>
    </div>
  );
}