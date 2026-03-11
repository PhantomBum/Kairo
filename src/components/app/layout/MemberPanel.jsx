import React, { useMemo } from 'react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import { Crown, Shield } from 'lucide-react';

const statusColors = { online: '#7bc9a4', idle: '#c9b47b', dnd: '#c97b7b', invisible: '#555248', offline: '#555248' };

function MemberSkeleton() {
  return (
    <div className="flex items-center gap-2.5 px-2.5 py-1.5 animate-pulse">
      <div className="w-7 h-7 rounded-full" style={{ background: 'var(--bg-glass-strong)' }} />
      <div className="flex-1 h-3 rounded" style={{ background: 'var(--bg-glass-strong)', width: '60%' }} />
    </div>
  );
}

function MemberRow({ member, profile, isOwner, roleColor, onClick }) {
  const name = profile?.display_name || member.nickname || member.user_email?.split('@')[0] || 'User';
  const avatar = profile?.avatar_url || member.avatar_override;
  const status = profile?.status || 'offline';
  const hasElite = profile?.badges?.includes('premium');

  return (
    <button onClick={() => onClick?.(member.user_id)} className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors hover:bg-[var(--bg-glass-hover)] group">
      <div className="relative flex-shrink-0">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium overflow-hidden"
          style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>
          {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : name.charAt(0).toUpperCase()}
        </div>
        <div className="absolute -bottom-px -right-px w-2.5 h-2.5 rounded-full border-2" style={{ background: statusColors[status], borderColor: 'var(--bg-surface)' }} />
      </div>
      <span className="text-[12px] truncate flex-1 text-left" style={{ color: roleColor || (profile?.is_online ? 'var(--text-primary)' : 'var(--text-muted)') }}>
        {name}
      </span>
      <div className="flex gap-0.5 items-center">
        {hasElite && <Crown className="w-2.5 h-2.5" style={{ color: 'var(--accent-amber)' }} />}
        {isOwner && <span className="text-[7px] px-1 rounded font-mono" style={{ background: 'var(--accent-amber)', color: '#000', opacity: 0.7 }}>OWNER</span>}
      </div>
    </button>
  );
}

export default function MemberPanel({ members, roles, ownerId, onProfileClick }) {
  const { getProfile } = useProfiles();

  const enriched = useMemo(() => (members || []).map(m => ({
    ...m,
    profile: getProfile(m.user_id) || getProfile(m.user_email),
  })), [members, getProfile]);

  // Group by hoisted roles
  const hoistedRoles = useMemo(() => (roles || []).filter(r => r.hoist && !r.is_default).sort((a,b) => (b.position||0) - (a.position||0)), [roles]);

  const grouped = useMemo(() => {
    const groups = [];
    const assigned = new Set();

    // Hoisted role groups
    hoistedRoles.forEach(role => {
      const roleMembers = enriched.filter(m => m.role_ids?.includes(role.id) && !assigned.has(m.id));
      if (roleMembers.length > 0) {
        roleMembers.forEach(m => assigned.add(m.id));
        groups.push({ label: role.name, color: role.color, members: roleMembers });
      }
    });

    // Online/Offline for remaining
    const remaining = enriched.filter(m => !assigned.has(m.id));
    const online = remaining.filter(m => m.profile?.is_online);
    const offline = remaining.filter(m => !m.profile?.is_online);

    if (online.length > 0) groups.push({ label: `Online — ${online.length}`, color: null, members: online });
    if (offline.length > 0) groups.push({ label: `Offline — ${offline.length}`, color: null, members: offline, dim: true });

    return groups;
  }, [enriched, hoistedRoles]);

  if (!members || members.length === 0) {
    return (
      <div className="w-[220px] flex-shrink-0 overflow-y-auto scrollbar-none p-3" style={{ borderLeft: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        {Array.from({ length: 8 }).map((_, i) => <MemberSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="w-[220px] flex-shrink-0 overflow-y-auto scrollbar-none p-3" style={{ borderLeft: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
      {grouped.map((group, gi) => (
        <div key={gi}>
          <div className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1 py-2" style={{ color: group.color || (group.dim ? 'var(--text-faint)' : 'var(--text-muted)') }}>
            {group.label}
          </div>
          {group.members.map(m => (
            <MemberRow key={m.id} member={m} profile={m.profile} isOwner={m.user_id === ownerId}
              roleColor={group.color} onClick={onProfileClick} />
          ))}
        </div>
      ))}
    </div>
  );
}