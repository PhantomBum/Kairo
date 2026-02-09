import React from 'react';
import { Crown } from 'lucide-react';

const statusColors = { online: '#22c55e', idle: '#eab308', dnd: '#ef4444', invisible: '#555', offline: '#555' };

function MemberRow({ member, profile, isOwner }) {
  const name = profile?.display_name || member.nickname || member.user_email?.split('@')[0] || 'User';
  const avatar = profile?.avatar_url;
  const status = profile?.status || 'offline';

  return (
    <div className="flex items-center gap-2.5 px-2 py-1 rounded cursor-pointer transition-colors hover:bg-white/[0.04]">
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden" style={{ background: '#1a1a1a' }}>
          {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : name.charAt(0).toUpperCase()}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: statusColors[status], border: '2px solid #151515' }} />
      </div>
      <span className="text-sm truncate" style={{ color: isOwner ? '#f59e0b' : '#999' }}>
        {name}
      </span>
      {isOwner && <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />}
    </div>
  );
}

export default function MemberPanel({ members, profiles, roles, ownerId }) {
  const online = members.filter(m => {
    const p = profiles.get(m.user_id);
    return p?.status === 'online' || p?.status === 'idle' || p?.status === 'dnd';
  });
  const offline = members.filter(m => {
    const p = profiles.get(m.user_id);
    return !p?.status || p?.status === 'offline' || p?.status === 'invisible';
  });

  return (
    <div className="w-60 h-full flex-shrink-0 overflow-y-auto p-2 scrollbar-thin" style={{ background: '#151515', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
      {online.length > 0 && (
        <>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 px-2 py-1.5">
            Online — {online.length}
          </div>
          {online.map(m => (
            <MemberRow key={m.id} member={m} profile={profiles.get(m.user_id)} isOwner={m.user_id === ownerId} />
          ))}
        </>
      )}
      {offline.length > 0 && (
        <>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 px-2 py-1.5 mt-2">
            Offline — {offline.length}
          </div>
          {offline.map(m => (
            <MemberRow key={m.id} member={m} profile={profiles.get(m.user_id)} isOwner={m.user_id === ownerId} />
          ))}
        </>
      )}
    </div>
  );
}