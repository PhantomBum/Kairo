import React, { useMemo } from 'react';
import { UserPlus, Server, Crown, MessageSquare, Shield } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';
import moment from 'moment';

const ICON_MAP = {
  signup: { icon: UserPlus, color: colors.status.online, bg: 'rgba(59,165,93,0.12)' },
  server: { icon: Server, color: colors.warning, bg: 'rgba(250,166,26,0.12)' },
  elite: { icon: Crown, color: '#f0b232', bg: 'rgba(240,178,50,0.12)' },
  message: { icon: MessageSquare, color: colors.accent.primary, bg: 'rgba(123,108,246,0.12)' },
};

export default function AdminActivity({ enrichedUsers, allServers, allMessages }) {
  const feed = useMemo(() => {
    const events = [];
    const users = Array.isArray(enrichedUsers) ? enrichedUsers : [];
    const servers = Array.isArray(allServers) ? allServers : [];
    const messages = Array.isArray(allMessages) ? allMessages : [];

    users.forEach(u => {
      if (u.created_date) {
        events.push({ type: 'signup', text: `${u.displayName || u.email} signed up`, time: u.created_date });
      }
      if (u.badges?.includes('premium') || u.badges?.includes('kairo_elite')) {
        events.push({ type: 'elite', text: `${u.displayName || u.email} has Elite`, time: u.profile?.updated_date || u.created_date });
      }
    });

    servers.forEach(s => {
      if (s.created_date) {
        events.push({ type: 'server', text: `${s.name} server created`, time: s.created_date });
      }
    });

    messages.slice(0, 20).forEach(m => {
      events.push({ type: 'message', text: `${m.author_name || 'Unknown'} sent a message`, time: m.created_date });
    });

    events.sort((a, b) => new Date(b.time) - new Date(a.time));
    return events.slice(0, 50);
  }, [enrichedUsers, allServers, allMessages]);

  if (feed.length === 0) {
    return <p className="text-center py-8 text-[13px]" style={{ color: colors.text.muted }}>No recent activity</p>;
  }

  return (
    <div className="space-y-1 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: colors.text.disabled }}>
        Real-time Activity Feed
      </p>
      {feed.map((event, i) => {
        const cfg = ICON_MAP[event.type] || ICON_MAP.message;
        const Icon = cfg.icon;
        return (
          <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.02)] transition-colors">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
              <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
            </div>
            <p className="flex-1 text-[12px]" style={{ color: colors.text.secondary }}>{event.text}</p>
            <span className="text-[11px] flex-shrink-0" style={{ color: colors.text.disabled }}>{moment(event.time).fromNow()}</span>
          </div>
        );
      })}
    </div>
  );
}
