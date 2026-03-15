import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const P = {
  base: '#18181c', elevated: '#26262d', border: '#33333d',
  textPrimary: '#f0eff4', muted: '#68677a',
};

const dotKeyframes = `
@keyframes typingDot {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-4px); opacity: 1; }
}
`;

export default function TypingIndicator({ channelId, conversationId, currentUserId }) {
  const [typers, setTypers] = useState([]);

  useEffect(() => {
    if (!channelId && !conversationId) return;
    const targetId = channelId || conversationId;

    const fetch = async () => {
      try {
        const indicators = await base44.entities.TypingIndicator.filter({ channel_id: targetId });
        const now = Date.now();
        const active = indicators.filter(t =>
          t.user_id !== currentUserId &&
          (now - new Date(t.updated_date || t.created_date).getTime()) < 6000
        );
        setTypers(active);
      } catch {}
    };

    fetch();
    const interval = setInterval(fetch, 2000);
    let unsub;
    try { unsub = base44.entities.TypingIndicator.subscribe(() => fetch()); } catch {}

    return () => { clearInterval(interval); unsub?.(); };
  }, [channelId, conversationId, currentUserId]);

  if (typers.length === 0) return null;

  const names = typers.map(t => t.user_name || 'Someone');
  const text = names.length === 1
    ? <><strong style={{ color: P.textPrimary }}>{names[0]}</strong> is typing...</>
    : names.length === 2
    ? <><strong style={{ color: P.textPrimary }}>{names[0]}</strong> and <strong style={{ color: P.textPrimary }}>{names[1]}</strong> are typing...</>
    : <>Several people are typing...</>;

  return (
    <>
      <style>{dotKeyframes}</style>
      <div className="h-6 px-4 flex items-center gap-2" style={{ background: P.elevated }}>
        {/* Avatar thumbnails */}
        <div className="flex -space-x-1.5">
          {typers.slice(0, 3).map((t, i) => (
            <div key={t.user_id || i} className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center border"
              style={{ background: P.base, borderColor: P.elevated }}>
              {t.user_avatar
                ? <img src={t.user_avatar} className="w-full h-full object-cover" alt="" />
                : <span className="text-[7px] font-bold" style={{ color: P.muted }}>{(t.user_name || 'U').charAt(0)}</span>}
            </div>
          ))}
        </div>

        {/* Three dot wave animation with 100ms stagger */}
        <div className="flex items-center gap-[3px]">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full"
              style={{
                background: P.textPrimary,
                animation: `typingDot 1.2s ease-in-out ${i * 0.1}s infinite`,
              }} />
          ))}
        </div>

        <span className="text-[11px] font-medium" style={{ color: P.muted }}>{text}</span>
      </div>
    </>
  );
}
