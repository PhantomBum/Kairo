import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, Crown, Medal, Star, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useProfiles } from '@/components/app/providers/ProfileProvider';

export default function ServerLeaderboard({ server, members }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getProfile } = useProfiles();

  useEffect(() => {
    if (!server?.id) return;
    base44.entities.Message.filter({ server_id: server.id }).then(m => { setMessages(m); setLoading(false); });
  }, [server?.id]);

  const leaderboard = useMemo(() => {
    const scores = {};
    messages.forEach(m => {
      if (!m.author_id) return;
      if (!scores[m.author_id]) scores[m.author_id] = { id: m.author_id, name: m.author_name, avatar: m.author_avatar, xp: 0, messages: 0, reactions: 0 };
      scores[m.author_id].messages++;
      scores[m.author_id].xp += 15; // 15 xp per message
      (m.reactions || []).forEach(r => { scores[m.author_id].reactions += (r.count || 0); scores[m.author_id].xp += (r.count || 0) * 5; });
    });
    return Object.values(scores).sort((a, b) => b.xp - a.xp).slice(0, 15);
  }, [messages]);

  const rankIcon = (i) => {
    if (i === 0) return <Crown className="w-4 h-4" style={{ color: '#c9b47b' }} />;
    if (i === 1) return <Medal className="w-4 h-4" style={{ color: '#b0b0b0' }} />;
    if (i === 2) return <Medal className="w-4 h-4" style={{ color: '#cd7f32' }} />;
    return <span className="text-[11px] font-mono w-4 text-center" style={{ color: 'var(--text-faint)' }}>{i + 1}</span>;
  };

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text-muted)' }} />
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5" style={{ color: 'var(--accent-amber)' }} />
        <h3 className="text-[14px] font-semibold" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Server Leaderboard</h3>
      </div>

      {/* Top 3 podium */}
      {leaderboard.length >= 3 && (
        <div className="flex items-end justify-center gap-3 mb-4">
          {[1, 0, 2].map(idx => {
            const u = leaderboard[idx];
            if (!u) return null;
            const isFirst = idx === 0;
            return (
              <div key={idx} className="flex flex-col items-center" style={{ marginBottom: isFirst ? 16 : 0 }}>
                <div className={`w-${isFirst ? 14 : 11} h-${isFirst ? 14 : 11} rounded-full flex items-center justify-center text-sm font-medium overflow-hidden mb-1`}
                  style={{ width: isFirst ? 56 : 44, height: isFirst ? 56 : 44, background: 'var(--bg-glass-strong)', color: 'var(--text-muted)', border: `2px solid ${idx === 0 ? '#c9b47b' : idx === 1 ? '#b0b0b0' : '#cd7f32'}` }}>
                  {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : (u.name || '?').charAt(0).toUpperCase()}
                </div>
                <span className="text-[11px] font-medium truncate max-w-[60px]" style={{ color: 'var(--text-cream)' }}>{u.name}</span>
                <span className="text-[11px] font-mono" style={{ color: 'var(--accent-amber)' }}>{u.xp.toLocaleString()} XP</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <div className="space-y-1">
        {leaderboard.map((u, i) => {
          const p = getProfile(u.id);
          return (
            <div key={u.id} className="flex items-center gap-3 px-3 py-2 rounded-xl transition-colors" style={{ background: i < 3 ? 'var(--bg-glass)' : 'transparent' }}>
              <div className="w-5 flex items-center justify-center">{rankIcon(i)}</div>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium overflow-hidden"
                style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>
                {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : (u.name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[12px] truncate" style={{ color: i < 3 ? 'var(--text-cream)' : 'var(--text-primary)' }}>{u.name}</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>
                <span>{u.messages} msgs</span>
                <span className="font-semibold" style={{ color: 'var(--accent-amber)' }}>{u.xp.toLocaleString()} XP</span>
              </div>
            </div>
          );
        })}
      </div>
      {leaderboard.length === 0 && <p className="text-center py-6 text-[12px]" style={{ color: 'var(--text-muted)' }}>No activity yet</p>}
    </div>
  );
}