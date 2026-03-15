import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, MessageSquare, Smile, Clock, Hash, ArrowUp, ArrowDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModalWrapper from './ModalWrapper';

const CHART_COLORS = ['#7bc9a4', '#7ba4c9', '#c9b47b', '#a47bc9', '#c97b7b', '#e8e4d9'];

function StatCard({ icon: Icon, label, value, change, color }) {
  const isUp = change > 0;
  return (
    <div className="p-3.5 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-[11px] uppercase tracking-wider font-mono" style={{ color: 'var(--text-muted)' }}>{label}</span>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold font-mono" style={{ color: 'var(--text-cream)' }}>{value}</span>
        {change !== undefined && (
          <div className="flex items-center gap-0.5 text-[11px]" style={{ color: isUp ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {isUp ? <ArrowUp className="w-2.5 h-2.5" /> : <ArrowDown className="w-2.5 h-2.5" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
    </div>
  );
}

const customTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg text-[11px]" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
      <p className="font-mono mb-1" style={{ color: 'var(--text-cream)' }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function AnalyticsDashboardModal({ onClose, server }) {
  const [tab, setTab] = useState('overview');
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!server?.id) return;
    Promise.all([
      base44.entities.Message.filter({ server_id: server.id }),
      base44.entities.ServerMember.filter({ server_id: server.id }),
      base44.entities.Channel.filter({ server_id: server.id }),
    ]).then(([m, mem, ch]) => { setMessages(m); setMembers(mem); setChannels(ch); setLoading(false); });
  }, [server?.id]);

  // Member growth over last 30 days
  const memberGrowth = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const count = members.filter(m => new Date(m.joined_at || m.created_date) <= d).length;
      days.push({ date: key, members: count });
    }
    return days;
  }, [members]);

  // Message volume by day (last 14 days)
  const messageVolume = useMemo(() => {
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toDateString();
      const key = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      const count = messages.filter(m => new Date(m.created_date).toDateString() === ds).length;
      days.push({ date: key, messages: count });
    }
    return days;
  }, [messages]);

  // Active hours (hour of day distribution)
  const activeHours = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, messages: 0 }));
    messages.forEach(m => { const h = new Date(m.created_date).getHours(); hours[h].messages++; });
    return hours;
  }, [messages]);

  // Top channels by message count
  const topChannels = useMemo(() => {
    const counts = {};
    messages.forEach(m => { counts[m.channel_id] = (counts[m.channel_id] || 0) + 1; });
    return Object.entries(counts)
      .map(([id, count]) => ({ name: channels.find(c => c.id === id)?.name || 'unknown', messages: count }))
      .sort((a, b) => b.messages - a.messages).slice(0, 8);
  }, [messages, channels]);

  // Emoji usage
  const emojiUsage = useMemo(() => {
    const counts = {};
    messages.forEach(m => {
      (m.reactions || []).forEach(r => { counts[r.emoji] = (counts[r.emoji] || 0) + (r.count || 1); });
      const emojis = (m.content || '').match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu);
      if (emojis) emojis.forEach(e => { counts[e] = (counts[e] || 0) + 1; });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([emoji, count]) => ({ emoji, count }));
  }, [messages]);

  // Top posters
  const topPosters = useMemo(() => {
    const counts = {};
    messages.forEach(m => {
      const key = m.author_name || m.author_id;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }));
  }, [messages]);

  const totalMsgs = messages.length;
  const todayMsgs = messages.filter(m => new Date(m.created_date).toDateString() === new Date().toDateString()).length;
  const weekMsgs = messages.filter(m => Date.now() - new Date(m.created_date).getTime() < 7 * 86400000).length;
  const prevWeekMsgs = messages.filter(m => { const t = Date.now() - new Date(m.created_date).getTime(); return t >= 7 * 86400000 && t < 14 * 86400000; }).length;
  const msgChange = prevWeekMsgs > 0 ? Math.round(((weekMsgs - prevWeekMsgs) / prevWeekMsgs) * 100) : 0;

  const TABS = ['overview', 'members', 'messages', 'engagement'];

  if (loading) return (
    <ModalWrapper title="Server Analytics" onClose={onClose} width={720}>
      <div className="flex items-center justify-center py-20">
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text-muted)' }} />
      </div>
    </ModalWrapper>
  );

  return (
    <ModalWrapper title="Server Analytics" onClose={onClose} width={720}>
      <div className="space-y-4">
        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-glass)' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className="flex-1 px-3 py-1.5 rounded-lg text-[11px] capitalize font-medium transition-colors"
              style={{ background: tab === t ? 'var(--bg-glass-active)' : 'transparent', color: tab === t ? 'var(--text-cream)' : 'var(--text-muted)' }}>{t}</button>
          ))}
        </div>

        {tab === 'overview' && <>
          <div className="grid grid-cols-4 gap-2">
            <StatCard icon={Users} label="Members" value={members.length} color="var(--accent-blue)" />
            <StatCard icon={MessageSquare} label="Messages" value={totalMsgs.toLocaleString()} change={msgChange} color="var(--accent-green)" />
            <StatCard icon={Hash} label="Channels" value={channels.length} color="var(--accent-purple)" />
            <StatCard icon={Clock} label="Today" value={todayMsgs} color="var(--accent-amber)" />
          </div>

          {/* Message trend */}
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
            <h3 className="text-[11px] uppercase tracking-wider font-mono mb-3" style={{ color: 'var(--text-muted)' }}>Message Trend (14 days)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={messageVolume}>
                <defs><linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#7bc9a4" stopOpacity={0.3} /><stop offset="95%" stopColor="#7bc9a4" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="date" tick={{ fill: '#555248', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#555248', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={customTooltip} />
                <Area type="monotone" dataKey="messages" stroke="#7bc9a4" fill="url(#msgGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Active hours */}
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
            <h3 className="text-[11px] uppercase tracking-wider font-mono mb-3" style={{ color: 'var(--text-muted)' }}>Most Active Hours</h3>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={activeHours}>
                <XAxis dataKey="hour" tick={{ fill: '#555248', fontSize: 8, fontFamily: 'monospace' }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fill: '#555248', fontSize: 8, fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={25} />
                <Tooltip content={customTooltip} />
                <Bar dataKey="messages" fill="#7ba4c9" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>}

        {tab === 'members' && <>
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
            <h3 className="text-[11px] uppercase tracking-wider font-mono mb-3" style={{ color: 'var(--text-muted)' }}>Member Growth (30 days)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={memberGrowth}>
                <XAxis dataKey="date" tick={{ fill: '#555248', fontSize: 8, fontFamily: 'monospace' }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fill: '#555248', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={customTooltip} />
                <Line type="monotone" dataKey="members" stroke="#a47bc9" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
            <h3 className="text-[11px] uppercase tracking-wider font-mono mb-3" style={{ color: 'var(--text-muted)' }}>Top Contributors</h3>
            <div className="space-y-2">
              {topPosters.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[11px] font-mono w-4 text-right" style={{ color: 'var(--text-faint)' }}>#{i + 1}</span>
                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className="text-[12px] truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
                      <div className="h-full rounded-full" style={{ width: `${(p.count / (topPosters[0]?.count || 1)) * 100}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    </div>
                  </div>
                  <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{p.count}</span>
                </div>
              ))}
            </div>
          </div>
        </>}

        {tab === 'messages' && <>
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
            <h3 className="text-[11px] uppercase tracking-wider font-mono mb-3" style={{ color: 'var(--text-muted)' }}>Top Channels</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topChannels} layout="vertical">
                <XAxis type="number" tick={{ fill: '#555248', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: '#8a8778', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={customTooltip} />
                <Bar dataKey="messages" fill="#c9b47b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
            <h3 className="text-[11px] uppercase tracking-wider font-mono mb-3" style={{ color: 'var(--text-muted)' }}>Message Volume by Day</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={messageVolume}>
                <XAxis dataKey="date" tick={{ fill: '#555248', fontSize: 8, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#555248', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} width={25} />
                <Tooltip content={customTooltip} />
                <Bar dataKey="messages" fill="#7bc9a4" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>}

        {tab === 'engagement' && <>
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
            <h3 className="text-[11px] uppercase tracking-wider font-mono mb-3" style={{ color: 'var(--text-muted)' }}>Popular Emoji</h3>
            {emojiUsage.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {emojiUsage.map((e, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--bg-glass)' }}>
                    <span className="text-xl">{e.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-overlay)' }}>
                        <div className="h-full rounded-full" style={{ width: `${(e.count / (emojiUsage[0]?.count || 1)) * 100}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      </div>
                      <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>{e.count} uses</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-center py-6" style={{ color: 'var(--text-muted)' }}>No emoji data yet. Reactions and emoji in messages will appear here.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
              <h3 className="text-[11px] uppercase tracking-wider font-mono mb-2" style={{ color: 'var(--text-muted)' }}>Avg. Messages/Day</h3>
              <span className="text-xl font-bold font-mono" style={{ color: 'var(--text-cream)' }}>
                {totalMsgs > 0 ? Math.round(totalMsgs / Math.max(1, Math.ceil((Date.now() - new Date(messages[messages.length - 1]?.created_date || Date.now()).getTime()) / 86400000))) : 0}
              </span>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
              <h3 className="text-[11px] uppercase tracking-wider font-mono mb-2" style={{ color: 'var(--text-muted)' }}>Peak Hour</h3>
              <span className="text-xl font-bold font-mono" style={{ color: 'var(--text-cream)' }}>
                {activeHours.reduce((max, h) => h.messages > max.messages ? h : max, { messages: 0, hour: 'N/A' }).hour}
              </span>
            </div>
          </div>

          {topChannels.length > 0 && (
            <div className="p-4 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
              <h3 className="text-[11px] uppercase tracking-wider font-mono mb-3" style={{ color: 'var(--text-muted)' }}>Channel Distribution</h3>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={topChannels.slice(0, 6)} cx="50%" cy="50%" outerRadius={60} innerRadius={30} dataKey="messages" paddingAngle={2}>
                    {topChannels.slice(0, 6).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={customTooltip} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {topChannels.slice(0, 6).map((c, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>#{c.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>}
      </div>
    </ModalWrapper>
  );
}