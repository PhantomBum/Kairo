import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import Avatar from '../primitives/Avatar';
import { BadgeGroup } from '../primitives/Badge';
import { Panel, PanelHeader, PanelContent } from '../layout/AppShell';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

function MemberItem({ member, profile, isOwner, onMessage, onViewProfile, onKick, onBan, onTimeout }) {
  const displayName = profile?.display_name || member.nickname || member.user_name || 'Unknown';
  const avatarUrl = member.avatar_override || profile?.avatar_url;
  const status = profile?.status || 'offline';
  const badges = profile?.badges || [];
  
  if (isOwner) badges.unshift('owner');

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/[0.04] transition-colors group">
          <Avatar
            src={avatarUrl}
            name={displayName}
            status={status}
            size="sm"
          />
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-1.5">
              <span className={cn(
                'text-sm truncate',
                status === 'online' ? 'text-white' : 'text-zinc-400'
              )}>
                {displayName}
              </span>
              {badges.length > 0 && <BadgeGroup badges={badges} size="xs" max={2} />}
            </div>
            {profile?.custom_status?.text && (
              <p className="text-[11px] text-zinc-600 truncate">
                {profile.custom_status.emoji} {profile.custom_status.text}
              </p>
            )}
          </div>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-[#111113] border-white/[0.08]">
        <ContextMenuItem 
          onClick={() => onViewProfile?.(member)}
          className="text-zinc-300 focus:text-white focus:bg-white/[0.06]"
        >
          View Profile
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onMessage?.(member)}
          className="text-zinc-300 focus:text-white focus:bg-white/[0.06]"
        >
          Message
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/[0.06]" />
        <ContextMenuItem 
          onClick={() => onTimeout?.(member)}
          className="text-amber-400 focus:text-amber-300 focus:bg-amber-500/10"
        >
          Timeout
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onKick?.(member)}
          className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
        >
          Kick
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onBan?.(member)}
          className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
        >
          Ban
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function MemberGroup({ title, members, profiles, ownerId, onMessage, onViewProfile, onKick, onBan, onTimeout }) {
  if (members.length === 0) return null;
  
  return (
    <div className="mb-4">
      <p className="px-2 mb-1 text-[11px] font-semibold text-zinc-600 uppercase tracking-wider">
        {title} — {members.length}
      </p>
      <div className="space-y-0.5">
        {members.map((member) => (
          <MemberItem
            key={member.id || member.user_id}
            member={member}
            profile={profiles?.get(member.user_id)}
            isOwner={member.user_id === ownerId}
            onMessage={onMessage}
            onViewProfile={onViewProfile}
            onKick={onKick}
            onBan={onBan}
            onTimeout={onTimeout}
          />
        ))}
      </div>
    </div>
  );
}

export default function MemberPanel({
  members = [],
  profiles,
  roles = [],
  ownerId,
  onMessage,
  onViewProfile,
  onKick,
  onBan,
  onTimeout,
}) {
  // Group members by role and status
  const groupedMembers = useMemo(() => {
    const profileMap = profiles instanceof Map ? profiles : new Map();
    
    // Get hoisted roles (displayed separately)
    const hoistedRoles = roles.filter(r => r.hoist).sort((a, b) => (b.position || 0) - (a.position || 0));
    
    const groups = [];
    const assignedMemberIds = new Set();
    
    // Group by hoisted roles
    for (const role of hoistedRoles) {
      const roleMembers = members.filter(m => 
        m.role_ids?.includes(role.id) && !assignedMemberIds.has(m.user_id)
      );
      if (roleMembers.length > 0) {
        groups.push({ title: role.name, members: roleMembers, color: role.color });
        roleMembers.forEach(m => assignedMemberIds.add(m.user_id));
      }
    }
    
    // Online members without hoisted roles
    const onlineMembers = members.filter(m => {
      const profile = profileMap.get(m.user_id);
      return !assignedMemberIds.has(m.user_id) && profile?.status === 'online';
    });
    
    // Offline members
    const offlineMembers = members.filter(m => {
      const profile = profileMap.get(m.user_id);
      return !assignedMemberIds.has(m.user_id) && profile?.status !== 'online';
    });
    
    if (onlineMembers.length > 0) {
      groups.push({ title: 'Online', members: onlineMembers });
    }
    if (offlineMembers.length > 0) {
      groups.push({ title: 'Offline', members: offlineMembers });
    }
    
    return groups;
  }, [members, profiles, roles]);

  return (
    <Panel width={240} className="border-l border-white/[0.04]">
      <PanelContent className="px-2 py-4">
        {groupedMembers.map((group, i) => (
          <MemberGroup
            key={i}
            title={group.title}
            members={group.members}
            profiles={profiles}
            ownerId={ownerId}
            onMessage={onMessage}
            onViewProfile={onViewProfile}
            onKick={onKick}
            onBan={onBan}
            onTimeout={onTimeout}
          />
        ))}
      </PanelContent>
    </Panel>
  );
}