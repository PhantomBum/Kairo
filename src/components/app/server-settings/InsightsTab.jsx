import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, Users, MessageSquare, Hash, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';

export default function InsightsTab({ serverId, members, channels }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (serverId) {
      base44.entities.Message.filter({ server_id: serverId }, '-created_date', 200).then(m => { setMessages(m); setLoading(false); });
    }
  }, [serverId]);

  const stats = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const recentMsgs = messages.filter(m => new Date(m.created_date) > weekAgo);
    const uniqueAuthors = new Set(recentMsgs.map(m => m.author_id));
    
    // Channel activity
    const channelCounts = {};
    recentMsgs.forEach(m => { channelCounts[m.channel_id] = (channelCounts[m.channel_id] || 0) + 1; });
    const topChannels = Object.entries(channelCounts)
      .sort(([,a], [,b]) => b - a).slice(0, 5)
      .map(([id, count]) => ({ channel: (channels || []).find(c => c.id === id), count }));

    return { totalMessages: messages.length, weekMessages: recentMsgs.length, activeMembers: uniqueAuthors.size, topChannels };
  }, [messages, channels]);

  if (loading) return <div className="text-center py-12"><div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: colors.border.light, borderTopColor: colors.accent.primary }} /></div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Messages', value: stats.totalMessages, icon: MessageSquare, color: colors.accent.primary },
          { label: 'This Week', value: stats.weekMessages, icon: TrendingUp, color: colors.success },
          { label: 'Active Members', value: stats.activeMembers, icon: Users, color: colors.info },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
              <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: colors.text.disabled }}>{s.label}</span>
            </div>
            <p className="text-[24px] font-bold" style={{ color: colors.text.primary }}>{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
        <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: colors.text.disabled }}>Most Active Channels (7 days)</p>
        {stats.topChannels.length === 0 ? (
          <p className="text-[13px]" style={{ color: colors.text.muted }}>No activity yet</p>
        ) : (
          <div className="space-y-2">
            {stats.topChannels.map(({ channel, count }, i) => {
              const maxCount = stats.topChannels[0]?.count || 1;
              return (
                <div key={i} className="flex items-center gap-3">
                  <Hash className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.text.disabled }} />
                  <span className="text-[13px] w-24 truncate" style={{ color: colors.text.primary }}>{channel?.name || 'Unknown'}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: colors.bg.overlay }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${(count / maxCount) * 100}%`, background: colors.accent.primary }} />
                  </div>
                  <span className="text-[11px] w-8 text-right" style={{ color: colors.text.muted }}>{count}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
        <p className="text-[11px] uppercase tracking-wider font-semibold mb-2" style={{ color: colors.text.disabled }}>Members</p>
        <p className="text-[20px] font-bold" style={{ color: colors.text.primary }}>{(members || []).length}</p>
        <p className="text-[12px]" style={{ color: colors.text.muted }}>Total server members</p>
      </div>
    </div>
  );
}