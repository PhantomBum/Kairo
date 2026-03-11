import React from 'react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';

const statusColors = { online: '#22c55e', idle: '#eab308', dnd: '#ef4444', invisible: '#555', offline: '#555' };

function MemberRow({ member, profile, isOwner, onClick }) {
  const name = member.nickname || profile?.display_name || profile?.username || member.user_email?.split('@')[0] || 'User';
  const avatar = member.avatar_override || profile?.avatar_url;
  const status = profile?.is_online ? (profile?.status || 'online') : 'offline';

  return (
    <button onClick={() => onClick?.(member.user_id)}
      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-colors hover:bg-[var(--bg-hover)]">
      <div className="relative">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium overflow-hidden"
          style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
          {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : name.charAt(0).toUpperCase()}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
          style={{ background: statusColors[status], borderColor: 'var(--bg-secondary)' }} />
      </div>
      <span className="text-[12px] truncate" style={{ color: status === 'offline' ? 'var(--text-muted)' : 'var(--text-secondary)' }}>
        {name}
        {isOwner && <span className="ml-1 text-[9px] text-amber-500">★</span>}
      </span>
    </button>
  );
}

export default function MemberPanel({ members, roles, ownerId, onProfileClick }) {
  const { getProfile } = useProfiles();

  const enriched = members.map(m => ({
    ...m,
    profile: getProfile(m.user_id) || getProfile(m.user_email),
  }));

  const online = enriched.filter(m => m.profile?.is_online);
  const offline = enriched.filter(m => !m.profile?.is_online);

  return (
    <div className="w-[220px] flex-shrink-0 overflow-y-auto py-3 px-2 scrollbar-none"
      style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid var(--border)' }}>
      {online.length > 0 && (
        <>
          <div className="text-[10px] font-semibold uppercase tracking-wider px-2 mb-1" style={{ color: 'var(--text-muted)' }}>
            Online — {online.length}
          </div>
          {online.map(m => (
            <MemberRow key={m.id} member={m} profile={m.profile} isOwner={m.user_id === ownerId} onClick={onProfileClick} />
          ))}
        </>
      )}
      {offline.length > 0 && (
        <>
          <div className="text-[10px] font-semibold uppercase tracking-wider px-2 mt-3 mb-1" style={{ color: 'var(--text-muted)' }}>
            Offline — {offline.length}
          </div>
          {offline.map(m => (
            <MemberRow key={m.id} member={m} profile={m.profile} isOwner={m.user_id === ownerId} onClick={onProfileClick} />
          ))}
        </>
      )}
    </div>
  );
}