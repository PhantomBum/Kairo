import React from 'react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';

const statusColors = { online: '#7bc9a4', idle: '#c9b47b', dnd: '#c97b7b', invisible: '#555248', offline: '#555248' };

function MemberRow({ member, profile, isOwner, onClick }) {
  const name = profile?.display_name || member.nickname || member.user_email?.split('@')[0] || 'User';
  const avatar = profile?.avatar_url || member.avatar_override;
  const status = profile?.status || 'offline';

  return (
    <button onClick={() => onClick?.(member.user_id)} className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors hover:bg-[var(--bg-glass-hover)] group">
      <div className="relative flex-shrink-0">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium overflow-hidden"
          style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>
          {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : name.charAt(0).toUpperCase()}
        </div>
        <div className="absolute -bottom-px -right-px w-2.5 h-2.5 rounded-full border-2" style={{ background: statusColors[status], borderColor: 'var(--bg-surface)' }} />
      </div>
      <span className="text-[12px] truncate" style={{ color: profile?.is_online ? 'var(--text-primary)' : 'var(--text-muted)' }}>
        {name}
      </span>
      {isOwner && <span className="text-[8px] px-1 rounded ml-auto" style={{ background: 'var(--accent-amber)', color: '#000', opacity: 0.7 }}>OWNER</span>}
    </button>
  );
}

export default function MemberPanel({ members, roles, ownerId, onProfileClick }) {
  const { getProfile } = useProfiles();

  const enriched = (members || []).map(m => ({ ...m, profile: getProfile(m.user_id) || getProfile(m.user_email) }));
  const online = enriched.filter(m => m.profile?.is_online);
  const offline = enriched.filter(m => !m.profile?.is_online);

  return (
    <div className="w-[220px] flex-shrink-0 overflow-y-auto scrollbar-none p-3" style={{ borderLeft: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
      {online.length > 0 && (
        <>
          <div className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1 py-2" style={{ color: 'var(--text-muted)' }}>
            Online — {online.length}
          </div>
          {online.map(m => <MemberRow key={m.id} member={m} profile={m.profile} isOwner={m.user_id === ownerId} onClick={onProfileClick} />)}
        </>
      )}
      {offline.length > 0 && (
        <>
          <div className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1 py-2 mt-2" style={{ color: 'var(--text-faint)' }}>
            Offline — {offline.length}
          </div>
          {offline.map(m => <MemberRow key={m.id} member={m} profile={m.profile} isOwner={m.user_id === ownerId} onClick={onProfileClick} />)}
        </>
      )}
    </div>
  );
}