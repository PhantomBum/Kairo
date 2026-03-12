import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';

export default function TypingIndicator({ channelId, conversationId, currentUserId }) {
  const [typers, setTypers] = useState([]);

  useEffect(() => {
    if (!channelId && !conversationId) return;
    const targetId = channelId || conversationId;

    const fetch = async () => {
      const indicators = await base44.entities.TypingIndicator.filter({ channel_id: targetId });
      const now = Date.now();
      // Only show indicators from last 5 seconds, not from current user
      const active = indicators.filter(t =>
        t.user_id !== currentUserId &&
        (now - new Date(t.updated_date || t.created_date).getTime()) < 6000
      );
      setTypers(active);
    };

    fetch();
    const interval = setInterval(fetch, 2000);
    const unsub = base44.entities.TypingIndicator.subscribe(() => fetch());

    return () => { clearInterval(interval); unsub(); };
  }, [channelId, conversationId, currentUserId]);

  if (typers.length === 0) return null;

  const names = typers.map(t => t.user_name || 'Someone');
  const text = names.length === 1
    ? `${names[0]} is typing`
    : names.length === 2
    ? `${names[0]} and ${names[1]} are typing`
    : `${names[0]} and ${names.length - 1} others are typing`;

  return (
    <div className="h-6 px-4 flex items-center gap-2" style={{ background: colors.bg.elevated }}>
      <div className="flex gap-0.5">
        {[0, 1, 2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{ background: colors.text.muted, animationDelay: `${i * 0.15}s`, animationDuration: '0.6s' }} />
        ))}
      </div>
      <span className="text-[11px] font-medium" style={{ color: colors.text.muted }}>{text}</span>
    </div>
  );
}