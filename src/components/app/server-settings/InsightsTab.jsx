import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Users, MessageSquare, Hash, TrendingUp, Calendar } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', danger: '#f87171', success: '#34d399', info: '#60a5fa',
};

export default function InsightsTab({ serverId, members, channels }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(7);

  useEffect(() => {
    if (serverId) {
      base44.entities.Message.filter({ server_id: serverId }, '-created_date', 500).then(m => {
        setMessages(m);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [serverId]);

  const stats = useMemo(() => {
    const now = new Date();
    const rangeStart = new Date(now - range * 24 * 60 * 60 * 1000);
    const recentMsgs = messages.filter(m => new Date(m.created_date) > rangeStart);
    const uniqueAuthors = new Set(recentMsgs.map(m => m.author_id));

    // Messages per day chart
    const days = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      const count = messages.filter(m => m.created_date?.startsWith(key)).length;
      days.push({ date: key, count, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
    }
    const maxDay = Math.max(...days.map(d => d.count), 1);

    // Active members per day
    const activeDays = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      const active = new Set(messages.filter(m => m.created_date?.startsWith(key)).map(m => m.author_id)).size;
      activeDays.push({ date: key, count: active, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
    }
    const maxActive = Math.max(...activeDays.map(d => d.count), 1);

    // Channel activity
    const channelCounts = {};
    recentMsgs.forEach(m => { channelCounts[m.channel_id] = (channelCounts[m.channel_id] || 0) + 1; });
    const topChannels = Object.entries(channelCounts)
      .sort(([, a], [, b]) => b - a).slice(0, 5)
      .map(([id, count]) => ({ channel: (channels || []).find(c => c.id === id), count }));

    const avgPerDay = days.length > 0 ? Math.round(days.reduce((s, d) => s + d.count, 0) / days.length) : 0;

    return { totalMessages: messages.length, recentMessages: recentMsgs.length, activeMembers: uniqueAuthors.size, days, maxDay, activeDays, maxActive, topChannels, avgPerDay };
  }, [messages, channels, range]);

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: P.border, borderTopColor: P.accent }} />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Range selector */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: P.elevated }}>
        {[{ v: 7, l: '7 days' }, { v: 14, l: '14 days' }, { v: 30, l: '30 days' }].map(r => (
          <button key={r.v} onClick={() => setRange(r.v)}
            className="flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
            style={{ background: range === r.v ? `${P.accent}20` : 'transparent', color: range === r.v ? P.accent : P.muted }}>
            {r.l}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total Messages', value: stats.totalMessages, icon: MessageSquare, color: P.accent },
          { label: `Last ${range} days`, value: stats.recentMessages, icon: TrendingUp, color: P.success },
          { label: 'Active Members', value: stats.activeMembers, icon: Users, color: P.info },
          { label: 'Avg/Day', value: stats.avgPerDay, icon: BarChart3, color: P.accent },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-xl" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
            <div className="flex items-center gap-1.5 mb-1">
              <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: P.muted }}>{s.label}</span>
            </div>
            <p className="text-[22px] font-bold" style={{ color: P.textPrimary }}>{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Messages per day chart */}
      <div className="p-4 rounded-xl" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
        <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: P.muted }}>Messages per Day</p>
        <div className="flex items-end gap-[2px] h-24">
          {stats.days.map((d, i) => (
            <div key={i} className="flex-1 rounded-t group relative cursor-default"
              style={{ height: `${Math.max((d.count / stats.maxDay) * 100, 3)}%`, background: d.count > 0 ? P.accent : `${P.muted}20`, transition: 'height 300ms ease' }}>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                style={{ background: P.floating, color: P.textPrimary, border: `1px solid ${P.border}` }}>{d.label}: {d.count}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[11px]" style={{ color: P.muted }}>{stats.days[0]?.label}</span>
          <span className="text-[11px]" style={{ color: P.muted }}>{stats.days[stats.days.length - 1]?.label}</span>
        </div>
      </div>

      {/* Active members per day chart */}
      <div className="p-4 rounded-xl" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
        <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: P.muted }}>Active Members per Day</p>
        <div className="flex items-end gap-[2px] h-20">
          {stats.activeDays.map((d, i) => (
            <div key={i} className="flex-1 rounded-t group relative cursor-default"
              style={{ height: `${Math.max((d.count / stats.maxActive) * 100, 3)}%`, background: d.count > 0 ? P.success : `${P.muted}20`, transition: 'height 300ms ease' }}>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[11px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                style={{ background: P.floating, color: P.textPrimary, border: `1px solid ${P.border}` }}>{d.label}: {d.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top channels */}
      <div className="p-4 rounded-xl" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
        <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: P.muted }}>Most Active Channels ({range} days)</p>
        {stats.topChannels.length === 0 ? (
          <p className="text-[13px]" style={{ color: P.muted }}>No activity yet</p>
        ) : (
          <div className="space-y-2">
            {stats.topChannels.map(({ channel, count }, i) => {
              const maxCount = stats.topChannels[0]?.count || 1;
              return (
                <div key={i} className="flex items-center gap-3">
                  <Hash className="w-3.5 h-3.5 flex-shrink-0" style={{ color: P.muted }} />
                  <span className="text-[13px] w-28 truncate" style={{ color: P.textPrimary }}>{channel?.name || 'Unknown'}</span>
                  <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: `${P.muted}20` }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${(count / maxCount) * 100}%`, background: P.accent }} />
                  </div>
                  <span className="text-[11px] w-10 text-right font-medium" style={{ color: P.muted }}>{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Members */}
      <div className="p-4 rounded-xl" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
        <p className="text-[11px] uppercase tracking-wider font-semibold mb-1" style={{ color: P.muted }}>Total Members</p>
        <p className="text-[22px] font-bold" style={{ color: P.textPrimary }}>{(members || []).length}</p>
      </div>
    </div>
  );
}
