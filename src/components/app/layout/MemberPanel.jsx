import React, { useMemo } from 'react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import { Crown } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

function MemberSkeleton() {
  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5">
      <div className="w-8 h-8 rounded-full k-shimmer" />
      <div className="flex-1 h-3 rounded k-shimmer" style={{ width: '60%' }} />
    </div>
  );
}

function MemberRow({ member, profile, isOwner, roleColor, onClick }) {
  const name = profile?.display_name || member.nickname || member.user_email?.split('@')[0] || 'User';
  const avatar = profile?.avatar_url || member.avatar_override;
  const status = profile?.status || 'offline';
  const statusColor = colors.status[status] || colors.status.offline;
  const hasElite = profile?.badges?.includes('premium');
  const isOnline = profile?.is_online;

  return (
    <button onClick={() => onClick?.(member.user_id)}
      className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.04)] group"
      style={{ opacity: isOnline ? 1 : 0.45 }}>
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold overflow-hidden"
          style={{ background: colors.bg.overlay, color: colors.text.muted }}>
          {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : name.charAt(0).toUpperCase()}
        </div>
        <div className="absolute -bottom-px -right-px w-[12px] h-[12px] rounded-full border-[2.5px]"
          style={{ background: statusColor, borderColor: colors.bg.surface }} />
      </div>
      <span className="text-[13px] truncate flex-1 text-left" style={{ color: roleColor || colors.text.secondary, fontWeight: 500 }} title={name}>
        {name}
      </span>
      <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
        {hasElite && <Crown className="w-3 h-3" style={{ color: colors.warning }} />}
        {isOwner && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(240,178,50,0.15)', color: colors.warning }}>OWNER</span>}
      </div>
    </button>
  );
}

export default function MemberPanel({ members, roles, ownerId, onProfileClick }) {
  const { getProfile } = useProfiles();

  const enriched = useMemo(() => (members || []).map(m => {
    const p = getProfile(m.user_id) || getProfile(m.user_email);
    return { ...m, profile: p || { status: 'offline', is_online: false } };
  }), [members, getProfile]);

  const hoistedRoles = useMemo(() => (roles || []).filter(r => r.hoist && !r.is_default).sort((a,b) => (b.position||0) - (a.position||0)), [roles]);

  const grouped = useMemo(() => {
    const groups = [];
    const assigned = new Set();
    hoistedRoles.forEach(role => {
      const roleMembers = enriched.filter(m => m.role_ids?.includes(role.id) && !assigned.has(m.id));
      if (roleMembers.length > 0) {
        roleMembers.forEach(m => assigned.add(m.id));
        groups.push({ label: role.name, color: role.color, members: roleMembers, count: roleMembers.length });
      }
    });
    const remaining = enriched.filter(m => !assigned.has(m.id));
    const online = remaining.filter(m => m.profile?.is_online);
    const offline = remaining.filter(m => !m.profile?.is_online);
    if (online.length > 0) groups.push({ label: 'Online', color: null, members: online, count: online.length });
    if (offline.length > 0) groups.push({ label: 'Offline', color: null, members: offline, count: offline.length });
    return groups;
  }, [enriched, hoistedRoles]);

  if (!members || members.length === 0) {
    return (
      <div className="w-[240px] flex-shrink-0 overflow-y-auto scrollbar-none p-3 hidden md:block" style={{ borderLeft: '1px solid rgba(255,255,255,0.04)', background: 'rgba(14,14,20,0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        {Array.from({ length: 8 }).map((_, i) => <MemberSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="w-[240px] flex-shrink-0 overflow-y-auto scrollbar-none px-2 pt-4 hidden md:block" style={{ borderLeft: '1px solid rgba(255,255,255,0.04)', background: 'rgba(14,14,20,0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }} role="complementary" aria-label="Member list">
      {grouped.map((group, gi) => (
        <div key={gi} className="mb-2">
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] px-2 py-1.5" style={{ color: group.color || colors.text.disabled }}>
            {group.label} — {group.count}
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