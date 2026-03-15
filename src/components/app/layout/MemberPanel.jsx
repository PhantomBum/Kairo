import React, { useMemo, useState, memo, useRef, useEffect } from 'react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import { Crown, ChevronDown, ChevronRight, Shield } from 'lucide-react';
import { colors, radius, shadows } from '@/components/app/design/tokens';

const ADMIN_EMAILS = ['ilikebagels1612@gmail.com', 'rdw1612@gmail.com'];
const NOTE_KEY = 'kairo-user-notes';

function MemberHoverCard({ member, profile, anchor, onClose }) {
  const [note, setNote] = useState(() => {
    try {
      const map = JSON.parse(localStorage.getItem(NOTE_KEY) || '{}');
      return map[member.user_id] || '';
    } catch { return ''; }
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const map = JSON.parse(localStorage.getItem(NOTE_KEY) || '{}');
        map[member.user_id] = note;
        localStorage.setItem(NOTE_KEY, JSON.stringify(map));
      } catch {}
    }, 250);
    return () => clearTimeout(timer);
  }, [note, member.user_id]);

  if (!anchor) return null;
  const top = Math.max(8, Math.min(anchor.top, window.innerHeight - 280));
  const right = 250;
  const activity = profile?.rich_presence?.name
    ? `${profile.rich_presence.type || 'playing'} ${profile.rich_presence.name}`
    : profile?.custom_status?.text || '';

  return (
    <div className="fixed z-[80] w-[280px] p-4"
      style={{ top, right, background: colors.bg.float, border: `1px solid ${colors.border.default}`, borderRadius: radius.md, boxShadow: shadows.elevated }}
      onMouseLeave={onClose}>
      <p className="text-[13px] font-semibold truncate" style={{ color: colors.text.primary }}>
        {profile?.display_name || member.nickname || member.user_email?.split('@')[0] || 'User'}
      </p>
      {activity && (
        <p className="text-[11px] mt-1" style={{ color: colors.text.muted }}>
          Activity: {activity}
        </p>
      )}
      <div className="mt-2 pt-2" style={{ borderTop: `1px solid ${colors.border.default}` }}>
        <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: colors.text.muted }}>Note (private)</p>
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note..."
          className="w-full px-2 py-1.5 rounded-md text-[12px] outline-none"
          style={{ background: colors.bg.overlay, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}
        />
      </div>
    </div>
  );
}

const MemberRow = memo(function MemberRow({ member, profile, isOwner, roleColor, onClick }) {
  const name = profile?.display_name || member.nickname || member.user_email?.split('@')[0] || 'User';
  const avatar = profile?.avatar_url || member.avatar_override;
  const status = profile?.status || 'offline';
  const statusColor = colors.status[status] || colors.status.offline;
  const isOnline = profile?.is_online;
  const isStaff = ADMIN_EMAILS.includes(member.user_email?.toLowerCase()) || ADMIN_EMAILS.includes(profile?.user_email?.toLowerCase());
  const rowRef = useRef(null);
  const hoverTimer = useRef(null);
  const [anchor, setAnchor] = useState(null);

  const openHover = () => {
    hoverTimer.current = setTimeout(() => setAnchor(rowRef.current?.getBoundingClientRect()), 400);
  };
  const closeHover = () => {
    clearTimeout(hoverTimer.current);
    setAnchor(null);
  };

  return (
    <>
      <button ref={rowRef} onClick={() => onClick?.(member.user_id)}
        onMouseEnter={openHover}
        onMouseLeave={closeHover}
        className="w-full flex items-center gap-3 px-2 rounded-md transition-all duration-[120ms] ease-out hover:bg-[var(--bg-overlay)] group active:scale-[0.99]"
        style={{ opacity: isOnline ? 1 : 0.45, height: 44 }}>
        <div className="relative flex-shrink-0">
          <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-xs font-semibold overflow-hidden"
            style={{ background: colors.bg.overlay, color: colors.text.primary }}>
            {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} /> : name.charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-px -right-px w-[10px] h-[10px] rounded-full border-2"
            style={{ background: statusColor, borderColor: colors.bg.surface }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[14px] truncate text-left" style={{ color: roleColor || colors.text.secondary, fontWeight: 500 }}>{name}</span>
            {isStaff && (
              <span className="flex items-center gap-0.5 px-1 py-px rounded text-[11px] font-bold uppercase flex-shrink-0"
                style={{ background: 'var(--accent-dim)', color: 'var(--accent-primary)' }}>
                <Shield className="w-2.5 h-2.5" /> Admin
              </span>
            )}
          </div>
          {profile?.rich_presence?.name && (
            <p className="text-[11px] truncate text-left" style={{ color: colors.text.disabled }}>
              {profile.rich_presence.type === 'listening' ? '🎵' : profile.rich_presence.type === 'playing' ? '🎮' : profile.rich_presence.type === 'watching' ? '👁' : '🏆'}{' '}
              {profile.rich_presence.name}
            </p>
          )}
          {!profile?.rich_presence?.name && profile?.custom_status?.text && (
            <p className="text-[11px] truncate text-left" style={{ color: colors.text.disabled }}>
              {profile.custom_status.emoji || ''} {profile.custom_status.text}
            </p>
          )}
        </div>
        {isOwner && <Crown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#f0b232' }} />}
      </button>
      {anchor && <MemberHoverCard member={member} profile={profile} anchor={anchor} onClose={() => setAnchor(null)} />}
    </>
  );
});

const MemberGroup = memo(function MemberGroup({ group, ownerId, onProfileClick }) {
  const [collapsed, setCollapsed] = useState(false);
  const Icon = collapsed ? ChevronRight : ChevronDown;

  return (
    <div className="mb-1">
      <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center gap-1.5 px-2 pt-4 pb-1 hover:opacity-80">
        {group.color && <div className="w-[2px] h-3.5 rounded-full flex-shrink-0" style={{ background: group.color }} />}
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] flex-1 text-left truncate min-w-0" style={{ color: group.color || colors.text.muted }}>
          {group.label} — {group.count}
        </span>
        <Icon className="w-3 h-3" style={{ color: colors.text.disabled }} />
      </button>
      {!collapsed && group.members.map(m => (
        <MemberRow key={m.id} member={m} profile={m.profile} isOwner={m.user_id === ownerId}
          roleColor={group.color} onClick={onProfileClick} />
      ))}
    </div>
  );
});

export default memo(function MemberPanel({ members, roles, ownerId, onProfileClick }) {
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
    // Sort: online first, then offline
    const sorted = remaining.sort((a, b) => (b.profile?.is_online ? 1 : 0) - (a.profile?.is_online ? 1 : 0));
    if (sorted.length > 0) groups.push({ label: 'Members', color: null, members: sorted, count: sorted.length });
    return groups;
  }, [enriched, hoistedRoles]);

  if (!members || members.length === 0) {
    return (
      <div className="app-member-panel w-[240px] flex-shrink-0 overflow-y-auto scrollbar-none p-3 hidden md:block" style={{ background: colors.bg.surface }}>
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
    <div className="app-member-panel w-[240px] flex-shrink-0 overflow-y-auto scrollbar-none px-2 pt-6 hidden md:block" style={{ background: colors.bg.surface }} role="complementary" aria-label="Member list">
      {grouped.map((group, gi) => (
        <MemberGroup key={gi} group={group} ownerId={ownerId} onProfileClick={onProfileClick} />
      ))}
    </div>
  );
});