import React, { useState, useRef, useEffect } from 'react';
import { Crown, MessageCircle, Ban, UserPlus, Copy, Flag, MoreHorizontal, UserCheck, X } from 'lucide-react';
import UserBadges from './UserBadges';
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator,
  ContextMenuTrigger, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger,
} from "@/components/ui/context-menu";

const P = {
  base: '#111820', surface: '#161f2c', elevated: '#1b2535',
  floating: '#263446', border: '#ffffff18',
  textPrimary: '#e8edf5', textSecondary: '#9aaabb', muted: '#5d7a8a',
  accent: '#2dd4bf', danger: '#f87171', success: '#34d399',
  warning: '#fbbf24',
};

const statusDot = {
  online: P.success, idle: P.warning, dnd: P.danger,
  invisible: '#747f8d', offline: '#747f8d',
};

function ProfileHoverCard({ member, anchorRect, onClose, onMessage }) {
  const ref = useRef(null);
  const roleColor = member.highestRole?.color || P.textSecondary;

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const top = anchorRect ? Math.min(anchorRect.top, window.innerHeight - 420) : 100;

  return (
    <div ref={ref} className="fixed z-[60] w-[300px]"
      style={{
        right: 252, top,
        animation: 'profileCardIn 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
      <div className="rounded-2xl overflow-hidden" style={{ background: P.floating, border: `1px solid ${P.border}`, boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}>
        {/* Banner */}
        <div className="h-16" style={{
          background: member.banner_url
            ? `url(${member.banner_url}) center/cover`
            : `linear-gradient(135deg, ${roleColor}50, ${P.accent}30)`,
        }} />

        {/* Avatar */}
        <div className="px-4 -mt-8">
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-full overflow-hidden border-[3px] shadow-lg"
              style={{ borderColor: P.floating, background: P.surface }}>
              {member.avatar_override || member.user_avatar ? (
                <img src={member.avatar_override || member.user_avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-semibold"
                  style={{ background: `${roleColor}30`, color: roleColor }}>
                  {(member.nickname || member.user_name)?.charAt(0)}
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-[3px]"
              style={{ borderColor: P.floating, background: statusDot[member.status] || statusDot.offline }} />
          </div>
        </div>

        {/* Info */}
        <div className="p-4 pt-2 space-y-3">
          <div>
            <h3 className="text-[16px] font-bold" style={{ color: P.textPrimary }}>
              {member.nickname || member.user_name}
              {member.user_id === member._ownerId && <Crown className="w-3.5 h-3.5 text-amber-400 inline ml-1.5" />}
            </h3>
            <p className="text-[13px]" style={{ color: P.muted }}>{member.user_name}</p>
            {member.pronouns && <p className="text-[12px]" style={{ color: P.muted }}>{member.pronouns}</p>}
          </div>

          {member.custom_status && (
            <p className="text-[13px]" style={{ color: P.textSecondary }}>{member.custom_status}</p>
          )}

          {member.bio && (
            <div className="pt-2" style={{ borderTop: `1px solid ${P.border}` }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: P.textPrimary }}>About Me</p>
              <p className="text-[13px] leading-relaxed" style={{ color: P.textSecondary }}>{member.bio}</p>
            </div>
          )}

          {member.joined_date && (
            <div className="pt-2" style={{ borderTop: `1px solid ${P.border}` }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: P.textPrimary }}>Member Since</p>
              <p className="text-[12px]" style={{ color: P.muted }}>{new Date(member.joined_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          )}

          {/* Roles */}
          {member.roles?.length > 0 && (
            <div className="pt-2" style={{ borderTop: `1px solid ${P.border}` }}>
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: P.textPrimary }}>Roles</p>
              <div className="flex flex-wrap gap-1">
                {member.roles.map((role) => (
                  <span key={role.id} className="px-2 py-0.5 rounded text-[11px] font-medium"
                    style={{ backgroundColor: `${role.color}20`, color: role.color }}>
                    {role.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Private Note */}
          <div className="pt-2" style={{ borderTop: `1px solid ${P.border}` }}>
            <input type="text" placeholder="Click to add a note"
              className="w-full bg-transparent text-[12px] outline-none placeholder:text-[12px]"
              style={{ color: P.textSecondary, caretColor: P.accent, '::placeholder': { color: P.muted } }} />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button onClick={() => onMessage?.(member)}
              className="flex-1 h-8 rounded-lg text-[13px] font-medium transition-colors"
              style={{ background: P.accent, color: '#fff' }}>
              Message
            </button>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[rgba(255,255,255,0.06)]"
              style={{ background: P.elevated }}>
              <MoreHorizontal className="w-4 h-4" style={{ color: P.muted }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MemberItem({ member, isOwner, highestRole, onMessage, onProfile, ownerId }) {
  const roleColor = highestRole?.color || P.textSecondary;
  const [hoverCard, setHoverCard] = useState(null);
  const hoverTimer = useRef(null);
  const rowRef = useRef(null);

  const startHover = () => {
    hoverTimer.current = setTimeout(() => {
      const rect = rowRef.current?.getBoundingClientRect();
      setHoverCard(rect);
    }, 500);
  };
  const endHover = () => { clearTimeout(hoverTimer.current); };
  const closeCard = () => setHoverCard(null);

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <button ref={rowRef}
            onMouseEnter={startHover} onMouseLeave={endHover}
            onClick={() => onProfile?.(member)}
            className="w-full flex items-center gap-2.5 px-2 h-10 rounded-md cursor-pointer transition-colors group text-left"
            style={{ ':hover': { background: P.elevated } }}
            onMouseOver={e => e.currentTarget.style.background = P.elevated}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
            {/* Avatar with status ring */}
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden" style={{ background: P.surface }}>
                {member.avatar_override || member.user_avatar ? (
                  <img src={member.avatar_override || member.user_avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-semibold"
                    style={{ background: `${roleColor}25`, color: roleColor }}>
                    {(member.nickname || member.user_name)?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                style={{ borderColor: P.surface, background: statusDot[member.status] || statusDot.offline }} />
            </div>

            {/* Name + role badge */}
            <div className="flex-1 min-w-0 flex items-center gap-1.5">
              <span className="text-[13px] font-medium truncate" style={{ color: roleColor }}>
                {member.nickname || member.user_name}
              </span>
              {isOwner && <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />}
              {highestRole && highestRole.name !== 'Online' && highestRole.name !== 'Offline' && (
                <span className="px-1.5 py-[1px] rounded text-[11px] font-medium flex-shrink-0"
                  style={{ background: `${highestRole.color}20`, color: highestRole.color }}>
                  {highestRole.name}
                </span>
              )}
            </div>
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52 p-1.5 rounded-xl"
          style={{ background: P.floating, border: `1px solid ${P.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
          <ContextMenuItem onClick={() => onProfile?.(member)} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2"
            style={{ color: P.textSecondary }}>View Profile</ContextMenuItem>
          <ContextMenuItem onClick={() => onMessage?.(member)} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2"
            style={{ color: P.textSecondary }}>
            <MessageCircle className="w-4 h-4 opacity-50" /> Message
          </ContextMenuItem>
          <ContextMenuItem onClick={() => navigator.clipboard.writeText(member.user_id || '')} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2"
            style={{ color: P.textSecondary }}>
            <Copy className="w-4 h-4 opacity-50" /> Copy User ID
          </ContextMenuItem>
          <ContextMenuSeparator style={{ background: P.border, margin: '4px 0' }} />
          <ContextMenuSub>
            <ContextMenuSubTrigger className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.textSecondary }}>Roles</ContextMenuSubTrigger>
            <ContextMenuSubContent className="p-1.5 rounded-xl" style={{ background: P.floating, border: `1px solid ${P.border}` }}>
              <ContextMenuItem className="text-[13px] rounded-lg px-2.5 py-2" style={{ color: P.textSecondary }}>Add Role...</ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
          <ContextMenuSeparator style={{ background: P.border, margin: '4px 0' }} />
          <ContextMenuItem className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.danger }}>
            <Ban className="w-4 h-4 opacity-60" /> Ban
          </ContextMenuItem>
          <ContextMenuItem className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.danger }}>
            <Flag className="w-4 h-4 opacity-60" /> Report
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {hoverCard && (
        <ProfileHoverCard
          member={{ ...member, _ownerId: ownerId }}
          anchorRect={hoverCard}
          onClose={closeCard}
          onMessage={onMessage}
        />
      )}
    </>
  );
}

export default function MemberList({ members = [], roles = [], ownerId, onMemberMessage, onMemberProfile }) {
  const [offlineExpanded, setOfflineExpanded] = useState(false);

  const onlineCount = members.filter(m => m.status && m.status !== 'offline' && m.status !== 'invisible').length;

  const groupedMembers = React.useMemo(() => {
    const groups = {};
    const sortedRoles = [...roles].sort((a, b) => (b.position || 0) - (a.position || 0));

    sortedRoles.filter(r => r.is_hoisted).forEach(role => { groups[role.id] = { role, members: [] }; });
    groups['online'] = { role: { id: 'online', name: 'Online', color: P.success }, members: [] };
    groups['offline'] = { role: { id: 'offline', name: 'Offline', color: '#747f8d' }, members: [] };

    members.forEach(member => {
      const memberRoleIds = member.role_ids || [];
      let placed = false;
      for (const role of sortedRoles.filter(r => r.is_hoisted)) {
        if (memberRoleIds.includes(role.id)) {
          groups[role.id].members.push({ ...member, highestRole: role });
          placed = true;
          break;
        }
      }
      if (!placed) {
        const isOnline = member.status && member.status !== 'offline' && member.status !== 'invisible';
        groups[isOnline ? 'online' : 'offline'].members.push({
          ...member, highestRole: sortedRoles.find(r => memberRoleIds.includes(r.id)) || null,
        });
      }
    });

    const result = [];
    sortedRoles.filter(r => r.is_hoisted).forEach(role => {
      if (groups[role.id]?.members.length > 0) result.push(groups[role.id]);
    });
    if (groups['online'].members.length > 0) result.push(groups['online']);
    if (groups['offline'].members.length > 0) result.push({ ...groups['offline'], collapsed: true });
    return result;
  }, [members, roles]);

  return (
    <div className="w-60 h-full overflow-y-auto scrollbar-none" style={{ background: P.surface }}>
      {/* Header with counts */}
      <div className="sticky top-0 z-10 px-4 py-3" style={{ background: P.surface }}>
        <span className="text-[11px] font-medium" style={{ color: P.muted }}>
          {onlineCount} Online · {members.length} Members
        </span>
      </div>

      <div className="px-2 pb-4 space-y-3">
        {groupedMembers.map((group) => {
          const isOffline = group.role.id === 'offline';
          const showMembers = isOffline ? offlineExpanded : true;

          return (
            <div key={group.role.id}>
              <button
                onClick={isOffline ? () => setOfflineExpanded(e => !e) : undefined}
                className="flex items-center gap-2 px-2 mb-1 w-full text-left"
                style={{ cursor: isOffline ? 'pointer' : 'default' }}>
                <div className="w-0.5 h-3 rounded-full flex-shrink-0" style={{ background: group.role.color }} />
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em]"
                  style={{ color: P.muted }}>
                  {group.role.name} — {group.members.length}
                </span>
                {isOffline && (
                  <span className="ml-auto text-[10px]" style={{ color: P.muted }}>
                    {offlineExpanded ? '▾' : '▸'}
                  </span>
                )}
              </button>
              {showMembers && group.members.map((member, idx) => (
                <MemberItem key={member.user_id || member.id || `m-${idx}`}
                  member={member} isOwner={member.user_id === ownerId}
                  highestRole={member.highestRole}
                  onMessage={onMemberMessage} onProfile={onMemberProfile}
                  ownerId={ownerId} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
