import React from 'react';
import { Crown } from 'lucide-react';

const statusColors = { online: '#22c55e', idle: '#eab308', dnd: '#ef4444', invisible: '#555', offline: '#555' };

function MemberRow({ member, profile, isOwner, onClick }) {
  const name = profile?.display_name || member.nickname || member.user_email?.split('@')[0] || 'User';
  const avatar = profile?.avatar_url;
  const status = profile?.status || 'offline';

  return (
    <div onClick={() => onClick?.(member.user_id)}
      className="flex items-center gap-2.5 px-2 py-1 rounded cursor-pointer transition-colors hover:bg-white/[0.04]">
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden" style={{ background: '#1a1a1a' }}>
          {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : name.charAt(0).toUpperCase()}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: statusColors[status], border: '2px solid #151515' }} />
      </div>
      <span className="text-sm truncate" style={{ color: isOwner ? '#f59e0b' : '#999' }}>{name}</span>
      {isOwner && <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />}
      {profile?.badges?.includes('premium') && <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1 rounded">PRO</span>}
    </div>
  );
}

export default function MemberPanel({ members, profilesMap, roles, ownerId, onProfileClick }) {
  const online = members.filter(m => {
    const p = profilesMap.get(m.user_id) || profilesMap.get(m.user_email);
    return p?.status === 'online' || p?.status === 'idle' || p?.status === 'dnd';
  });
  const offline = members.filter(m => {
    const p = profilesMap.get(m.user_id) || profilesMap.get(m.user_email);
    return !p?.status || p?.status === 'offline' || p?.status === 'invisible';
  });

  return (
    <div className="w-60 h-full flex-shrink-0 overflow-y-auto p-2 scrollbar-thin" style={{ background: '#131313', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
      {online.length > 0 && (
        <>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 px-2 py-1.5">Online — {online.length}</div>
          {online.map(m => <MemberRow key={m.id} member={m} profile={profilesMap.get(m.user_id) || profilesMap.get(m.user_email)} isOwner={m.user_id === ownerId} onClick={onProfileClick} />)}
        </>
      )}
      {offline.length > 0 && (
        <>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 px-2 py-1.5 mt-2">Offline — {offline.length}</div>
          {offline.map(m => <MemberRow key={m.id} member={m} profile={profilesMap.get(m.user_id) || profilesMap.get(m.user_email)} isOwner={m.user_id === ownerId} onClick={onProfileClick} />)}
        </>
      )}
    </div>
  );
}