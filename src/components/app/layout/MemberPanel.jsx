import React, { useMemo } from 'react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import { Crown } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

function MemberRow({ member, profile, isOwner, roleColor, onClick }) {
  const name = profile?.display_name || member.nickname || member.user_email?.split('@')[0] || 'User';
  const avatar = profile?.avatar_url || member.avatar_override;
  const status = profile?.status || 'offline';
  const statusColor = colors.status[status] || colors.status.offline;
  const isOnline = profile?.is_online;

  return (
    <button onClick={() => onClick?.(member.user_id)}
      className="w-full flex items-center gap-3 px-2 py-1 rounded transition-colors hover:bg-[rgba(255,255,255,0.06)] group"
      style={{ opacity: isOnline ? 1 : 0.3 }}>
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold overflow-hidden"
          style={{ background: colors.bg.overlay, color: colors.text.primary }}>
          {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : name.charAt(0).toUpperCase()}
        </div>
        <div className="absolute -bottom-px -right-px w-[10px] h-[10px] rounded-full border-2"
          style={{ background: statusColor, borderColor: colors.bg.surface }} />
      </div>
      <span className="text-[14px] truncate flex-1 text-left" style={{ color: roleColor || colors.text.secondary, fontWeight: 500 }}>{name}</span>
      {isOwner && <Crown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#f0b232' }} />}
    </button>
  );
}

export default function MemberPanel({ members, roles, ownerId, onProfileClick }) {
  const { getProfile } = useProfiles();

  const enriched = useMemo(() => (members || []).map(m => {
    const p = getProfile(m.user_id) || getProfile(m.user_email);
    return { ...m, profile: p || { status: 'offline', is_online: false } };
  }), [members, getProfile]);

  const sortedRoles = useMemo(() => (roles || []).filter(r => !r.is_default).sort((a, b) => (b.position || 0) - (a.position || 0)), [roles]);
  const hoistedRoles = useMemo(() => sortedRoles.filter(r => r.hoist), [sortedRoles]);

  const grouped = useMemo(() => {
    const groups = [];
    const assigned = new Set();
    hoistedRoles.forEach(role => {
      const rm = enriched.filter(m => m.role_ids?.includes(role.id) && !assigned.has(m.id));
      if (rm.length > 0) {
        rm.forEach(m => assigned.add(m.id));
        groups.push({ label: role.name, color: role.color, members: rm, count: rm.length });
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
      <div className="w-[240px] flex-shrink-0 overflow-y-auto scrollbar-none p-3 hidden md:block" style={{ background: colors.bg.surface }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-2 py-1.5 mb-1">
            <div className="w-8 h-8 rounded-full k-shimmer" />
            <div className="flex-1 h-3 rounded k-shimmer" style={{ width: '60%' }} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-[240px] flex-shrink-0 overflow-y-auto scrollbar-none px-2 pt-6 hidden md:block" style={{ background: colors.bg.surface }} role="complementary" aria-label="Member list">
      {grouped.map((group, gi) => (
        <div key={gi} className="mb-1">
          <div className="px-2 pt-4 pb-1">
            <span className="text-[12px] font-bold uppercase tracking-[0.02em]" style={{ color: colors.text.muted }}>
              {group.label} — {group.count}
            </span>
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