import React, { useMemo } from 'react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import { Crown } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

function MemberSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <div className="w-8 h-8 rounded-full k-shimmer" />
      <div className="flex-1 h-3 rounded k-shimmer" style={{ width: '60%' }} />
    </div>
  );
}

function RoleBadge({ name, color }) {
  return (
    <span className="text-[10px] font-semibold px-1.5 py-[1px] rounded flex-shrink-0 leading-tight"
      style={{ background: `${color}18`, color: color, letterSpacing: '0.01em' }}>
      {name}
    </span>
  );
}

function MemberRow({ member, profile, isOwner, roleColor, highestRole, onClick }) {
  const name = profile?.display_name || member.nickname || member.user_email?.split('@')[0] || 'User';
  const avatar = profile?.avatar_url || member.avatar_override;
  const status = profile?.status || 'offline';
  const statusColor = colors.status[status] || colors.status.offline;
  const isOnline = profile?.is_online;

  return (
    <button onClick={() => onClick?.(member.user_id)}
      className="w-full flex items-center gap-3 px-3 py-[7px] rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.04)] group"
      style={{ opacity: isOnline ? 1 : 0.4 }}>
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold overflow-hidden"
          style={{ background: colors.bg.overlay, color: colors.text.muted }}>
          {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : name.charAt(0).toUpperCase()}
        </div>
        <div className="absolute -bottom-px -right-px w-[11px] h-[11px] rounded-full border-[2px]"
          style={{ background: statusColor, borderColor: colors.bg.surface }} />
      </div>
      <span className="text-[13px] truncate flex-1 text-left" style={{ color: roleColor || colors.text.secondary, fontWeight: 500 }} title={name}>
        {name}
      </span>
      {highestRole && (
        <RoleBadge name={highestRole.name} color={highestRole.color} />
      )}
      {isOwner && !highestRole && (
        <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold" style={{ background: 'rgba(240,178,50,0.12)', color: colors.warning }}>OWNER</span>
      )}
    </button>
  );
}

export default function MemberPanel({ members, roles, ownerId, onProfileClick }) {
  const { getProfile } = useProfiles();

  const enriched = useMemo(() => (members || []).map(m => {
    const p = getProfile(m.user_id) || getProfile(m.user_email);
    return { ...m, profile: p || { status: 'offline', is_online: false } };
  }), [members, getProfile]);

  const sortedRoles = useMemo(() => (roles || []).filter(r => !r.is_default).sort((a,b) => (b.position||0) - (a.position||0)), [roles]);
  const hoistedRoles = useMemo(() => sortedRoles.filter(r => r.hoist), [sortedRoles]);

  // For each member, find their highest display role
  const getHighestRole = useMemo(() => {
    return (member) => {
      if (!member.role_ids?.length) return null;
      return sortedRoles.find(r => member.role_ids.includes(r.id)) || null;
    };
  }, [sortedRoles]);

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

  const totalOnline = enriched.filter(m => m.profile?.is_online).length;

  if (!members || members.length === 0) {
    return (
      <div className="w-[240px] flex-shrink-0 overflow-y-auto scrollbar-none p-3 hidden md:block" style={{ borderLeft: `1px solid ${colors.border.default}`, background: colors.bg.surface }}>
        {Array.from({ length: 8 }).map((_, i) => <MemberSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="w-[240px] flex-shrink-0 overflow-y-auto scrollbar-none px-2 pt-4 hidden md:block" style={{ borderLeft: `1px solid ${colors.border.default}`, background: colors.bg.surface }} role="complementary" aria-label="Member list">
      {/* Member count header */}
      <div className="px-3 pb-3 text-[11px]" style={{ color: colors.text.disabled }}>
        {totalOnline} online · {enriched.length} members
      </div>

      {grouped.map((group, gi) => (
        <div key={gi} className="mb-3">
          <div className="flex items-center gap-2 px-3 pt-3 pb-1.5"
            style={{ borderLeft: group.color ? `2px solid ${group.color}` : 'none', marginLeft: group.color ? 0 : 2 }}>
            <span className="text-[10px] font-bold uppercase tracking-[0.06em]" style={{ color: group.color || colors.text.disabled }}>
              {group.label}
            </span>
            <span className="text-[10px]" style={{ color: colors.text.disabled }}>{group.count}</span>
          </div>
          {group.members.map(m => (
            <MemberRow key={m.id} member={m} profile={m.profile} isOwner={m.user_id === ownerId}
              roleColor={group.color} highestRole={getHighestRole(m)} onClick={onProfileClick} />
          ))}
        </div>
      ))}
    </div>
  );
}