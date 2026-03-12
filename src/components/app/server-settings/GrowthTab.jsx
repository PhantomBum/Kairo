import React, { useMemo } from 'react';
import { TrendingUp, UserPlus, UserMinus, Calendar } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

export default function GrowthTab({ members }) {
  const growth = useMemo(() => {
    const sorted = [...(members || [])].sort((a, b) => new Date(a.joined_at || 0) - new Date(b.joined_at || 0));
    const now = new Date();
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const newThisWeek = sorted.filter(m => new Date(m.joined_at) > weekAgo).length;
    const newThisMonth = sorted.filter(m => new Date(m.joined_at) > monthAgo).length;

    // Build daily join chart for last 30 days
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      const count = sorted.filter(m => m.joined_at?.startsWith(key)).length;
      days.push({ date: key, count, label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) });
    }
    const maxDay = Math.max(...days.map(d => d.count), 1);

    return { total: members?.length || 0, newThisWeek, newThisMonth, days, maxDay, recentJoins: sorted.slice(-10).reverse() };
  }, [members]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Members', value: growth.total, icon: TrendingUp, color: colors.accent.primary },
          { label: 'This Week', value: `+${growth.newThisWeek}`, icon: UserPlus, color: colors.success },
          { label: 'This Month', value: `+${growth.newThisMonth}`, icon: Calendar, color: colors.info },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
              <span className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: colors.text.disabled }}>{s.label}</span>
            </div>
            <p className="text-[24px] font-bold" style={{ color: colors.text.primary }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Mini bar chart */}
      <div className="p-4 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
        <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: colors.text.disabled }}>Daily Joins (30 days)</p>
        <div className="flex items-end gap-[2px] h-20">
          {growth.days.map((d, i) => (
            <div key={i} className="flex-1 rounded-t transition-all hover:opacity-80 group relative"
              style={{ height: `${Math.max((d.count / growth.maxDay) * 100, 3)}%`, background: d.count > 0 ? colors.accent.primary : colors.bg.overlay }}>
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ background: colors.bg.modal, color: colors.text.primary }}>{d.label}: {d.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent joins */}
      <div className="p-4 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
        <p className="text-[11px] uppercase tracking-wider font-semibold mb-3" style={{ color: colors.text.disabled }}>Recent Joins</p>
        <div className="space-y-2">
          {growth.recentJoins.map(m => (
            <div key={m.id} className="flex items-center gap-2.5 text-[12px]">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]" style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                {(m.user_email || '?').charAt(0).toUpperCase()}
              </div>
              <span className="flex-1 truncate" style={{ color: colors.text.primary }}>{m.user_email?.split('@')[0] || 'User'}</span>
              <span style={{ color: colors.text.disabled }}>{m.joined_at ? new Date(m.joined_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
            </div>
          ))}
          {growth.recentJoins.length === 0 && <p className="text-[12px]" style={{ color: colors.text.muted }}>No members yet</p>}
        </div>
      </div>
    </div>
  );
}