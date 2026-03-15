import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Crown, MessageSquare, Mic, Server, Smile, Clock, Users, Award, Trophy, Sparkles, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageShell from '@/components/app/shared/PageShell';

const CARD_COLORS = [
  'linear-gradient(135deg, #2dd4bf 0%, #5eead4 100%)',
  'linear-gradient(135deg, #3ba55c 0%, #2ecc71 100%)',
  'linear-gradient(135deg, #f0b232 0%, #ff9800 100%)',
  'linear-gradient(135deg, #ed4245 0%, #eb459e 100%)',
  'linear-gradient(135deg, #5eead4 0%, #2dd4bf 100%)',
  'linear-gradient(135deg, #00bcd4 0%, #3ba55c 100%)',
  'linear-gradient(135deg, #ff6b6b 0%, #f0b232 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
];

const C = { bg: '#0d1117', surface: '#161f2c', border: '#ffffff18', text: '#e8edf5', textSec: '#9aaabb', muted: '#5d7a8a', accent: '#2dd4bf' };

export default function Wrapped() {
  const { username, year } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const profiles = await base44.entities.UserProfile.list();
        const profile = profiles.find(p => p.username?.toLowerCase() === username?.toLowerCase());
        if (!profile) { setLoading(false); return; }

        const [messages, members, friends] = await Promise.all([
          base44.entities.Message.list(),
          base44.entities.ServerMember.filter({ user_id: profile.user_id }),
          base44.entities.Friend.filter({ user_id: profile.user_id }).catch(() => []),
        ]);

        const y = parseInt(year) || new Date().getFullYear();
        const thisYear = messages.filter(m => m.author_id === profile.user_id && new Date(m.created_date).getFullYear() === y);

        setStats({
          username: profile.display_name || profile.username,
          avatar: profile.avatar_url,
          year: y,
          messages: thisYear.length,
          servers: members.length,
          friends: friends.length,
          badges: (profile.badges || []).length,
        });
      } catch {}
      setLoading(false);
    })();
  }, [username, year]);

  if (loading) {
    return (
      <PageShell title="Wrapped">
        <div className="flex items-center justify-center py-24">
          <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(45,212,191,0.15)', borderTopColor: '#2dd4bf' }} />
        </div>
      </PageShell>
    );
  }

  if (!stats) {
    return (
      <PageShell title="Wrapped">
        <div className="max-w-md mx-auto text-center py-24">
          <Sparkles className="w-12 h-12 mx-auto mb-4" style={{ color: C.muted }} />
          <h2 className="text-[20px] font-bold mb-2" style={{ color: C.text }}>User Not Found</h2>
          <p className="text-[14px]" style={{ color: C.textSec }}>This Wrapped doesn't exist or hasn't been generated yet.</p>
        </div>
      </PageShell>
    );
  }

  const items = [
    { icon: MessageSquare, label: 'Messages Sent', value: stats.messages.toLocaleString() },
    { icon: Server, label: 'Servers', value: stats.servers },
    { icon: Users, label: 'Friends', value: stats.friends },
    { icon: Award, label: 'Badges', value: stats.badges },
  ];

  return (
    <PageShell title={`${stats.username}'s Wrapped`}>
      <div className="max-w-lg mx-auto text-center py-8">
        <div className="w-20 h-20 rounded-3xl mx-auto mb-4 overflow-hidden flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #2dd4bf, #fbbf24)' }}>
          {stats.avatar ? <img src={stats.avatar} className="w-full h-full object-cover" alt="" /> :
            <Sparkles className="w-8 h-8 text-white" />}
        </div>
        <h1 className="text-[28px] font-black mb-1" style={{ color: C.text }}>{stats.username}'s {stats.year}</h1>
        <p className="text-[14px] mb-8" style={{ color: C.textSec }}>A year on Kairo</p>

        <div className="grid grid-cols-2 gap-4">
          {items.map((item, i) => (
            <div key={item.label} className="p-6 rounded-2xl text-center" style={{ background: CARD_COLORS[i] }}>
              <item.icon className="w-8 h-8 mx-auto mb-2 text-white/80" />
              <p className="text-[36px] font-black text-white leading-none mb-1">{item.value}</p>
              <p className="text-[12px] text-white/60 font-semibold uppercase tracking-wider">{item.label}</p>
            </div>
          ))}
        </div>

        <a href="/" className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl text-[14px] font-semibold text-white"
          style={{ background: C.accent }}>
          <ArrowLeft className="w-4 h-4" /> Open Kairo
        </a>
      </div>
    </PageShell>
  );
}
