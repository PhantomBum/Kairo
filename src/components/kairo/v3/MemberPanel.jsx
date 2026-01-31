// Kairo Member Panel v3.0 - Clean member list

import React from 'react';
import { Crown, MessageCircle, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Text, Avatar, StatusDot, Section } from '../ui/DesignSystem';
import UserBadges from '../UserBadges';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

function MemberItem({ member, isOwner, highestRole, onMessage, onProfile }) {
  const roleColor = highestRole?.color || '#a1a1aa';

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <HoverCard openDelay={400}>
          <HoverCardTrigger asChild>
            <button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg cursor-pointer hover:bg-white/[0.03] transition-colors group text-left">
              <Avatar 
                src={member.avatar_override || member.user_avatar}
                name={member.nickname || member.user_name}
                size="sm"
                status={member.status}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <Text 
                    variant="small" 
                    weight="medium"
                    className="truncate"
                    style={{ color: roleColor }}
                  >
                    {member.nickname || member.user_name}
                  </Text>
                  {isOwner && (
                    <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  )}
                </div>
              </div>
            </button>
          </HoverCardTrigger>
          <HoverCardContent 
            side="left" 
            className="w-72 p-0 bg-[#111114] border-white/[0.06] shadow-2xl rounded-2xl overflow-hidden"
          >
            {/* Banner */}
            <div 
              className="h-20"
              style={{ 
                background: member.banner_url 
                  ? `url(${member.banner_url}) center/cover`
                  : `linear-gradient(135deg, ${roleColor}30, ${roleColor}10)`
              }}
            />
            
            {/* Avatar */}
            <div className="px-4 -mt-10">
              <div className="relative inline-block">
                <Avatar 
                  src={member.avatar_override || member.user_avatar}
                  name={member.nickname || member.user_name}
                  size="xl"
                  status={member.status}
                  className="border-4 border-[#111114]"
                />
              </div>
            </div>

            {/* Info */}
            <div className="p-4 pt-2">
              <div className="flex items-center gap-2 mb-1">
                <Text variant="h3" color="primary" weight="semibold">
                  {member.nickname || member.user_name}
                </Text>
                <UserBadges badges={member.badges} size="xs" />
              </div>
              <Text variant="small" color="tertiary">{member.user_name}</Text>
              
              {member.bio && (
                <div className="mt-3 pt-3 border-t border-white/[0.04]">
                  <Text variant="small" color="secondary" className="leading-relaxed">{member.bio}</Text>
                </div>
              )}

              {/* Roles */}
              {member.roles?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/[0.04]">
                  <div className="flex flex-wrap gap-1.5">
                    {member.roles.map((role) => (
                      <span
                        key={role.id}
                        className="px-2 py-0.5 rounded-md text-xs font-medium"
                        style={{ 
                          backgroundColor: `${role.color}15`,
                          color: role.color
                        }}
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </HoverCardContent>
        </HoverCard>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-[#111114] border-white/[0.06] rounded-xl p-1.5">
        <ContextMenuItem 
          onClick={() => onProfile?.(member)}
          className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2 text-sm"
        >
          View Profile
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onMessage?.(member)}
          className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2 text-sm"
        >
          <MessageCircle className="w-4 h-4 mr-2.5 text-zinc-500" />
          Message
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/[0.04] my-1" />
        <ContextMenuSub>
          <ContextMenuSubTrigger className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2 text-sm">
            Roles
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-[#111114] border-white/[0.06] rounded-xl p-1.5">
            <ContextMenuItem className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2 text-sm">
              Add Role...
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator className="bg-white/[0.04] my-1" />
        <ContextMenuItem className="text-amber-400 focus:bg-amber-500/10 rounded-lg px-3 py-2 text-sm">
          Timeout
        </ContextMenuItem>
        <ContextMenuItem className="text-red-400 focus:bg-red-500/10 rounded-lg px-3 py-2 text-sm">
          <Ban className="w-4 h-4 mr-2.5" />
          Ban
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default function MemberPanelV3({ 
  members = [], 
  roles = [], 
  ownerId,
  onMemberMessage,
  onMemberProfile 
}) {
  const groupedMembers = React.useMemo(() => {
    const groups = {};
    const sortedRoles = [...roles].sort((a, b) => (b.position || 0) - (a.position || 0));
    
    // Create groups for hoisted roles
    sortedRoles.filter(r => r.is_hoisted).forEach(role => {
      groups[role.id] = { role, members: [] };
    });
    
    // Always create Online and Offline groups
    groups['online'] = { role: { id: 'online', name: 'Online', color: '#10b981' }, members: [] };
    groups['offline'] = { role: { id: 'offline', name: 'Offline', color: '#52525b' }, members: [] };
    
    members.forEach(member => {
      const memberRoleIds = member.role_ids || [];
      let placed = false;
      
      // Try to place in hoisted role group
      for (const role of sortedRoles.filter(r => r.is_hoisted)) {
        if (memberRoleIds.includes(role.id)) {
          groups[role.id].members.push({ ...member, highestRole: role });
          placed = true;
          break;
        }
      }
      
      // If not in hoisted role, place by online status
      if (!placed) {
        const isOnline = member.status && member.status !== 'offline' && member.status !== 'invisible';
        const groupKey = isOnline ? 'online' : 'offline';
        groups[groupKey].members.push({
          ...member,
          highestRole: sortedRoles.find(r => memberRoleIds.includes(r.id)) || null
        });
      }
    });
    
    // Return groups that have members, with Online first then Offline last
    const result = [];
    
    // Add hoisted role groups first
    sortedRoles.filter(r => r.is_hoisted).forEach(role => {
      if (groups[role.id]?.members.length > 0) {
        result.push(groups[role.id]);
      }
    });
    
    // Add Online group
    if (groups['online'].members.length > 0) {
      result.push(groups['online']);
    }
    
    // Add Offline group last
    if (groups['offline'].members.length > 0) {
      result.push(groups['offline']);
    }
    
    return result;
  }, [members, roles]);

  return (
    <div className="w-60 h-full bg-[#0c0c0e] border-l border-white/[0.04] overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-4 bg-[#0c0c0e] border-b border-white/[0.04]">
        <Text variant="tiny" color="muted" weight="semibold" className="uppercase tracking-wider">
          Members — {members.length}
        </Text>
      </div>
      
      <div className="p-2 space-y-4">
        {groupedMembers.map((group) => (
          <Section key={group.role.id} title={`${group.role.name} — ${group.members.length}`}>
            {group.members.map((member, idx) => (
              <MemberItem
                key={member.user_id || member.id || `member-${idx}`}
                member={member}
                isOwner={member.user_id === ownerId}
                highestRole={member.highestRole}
                onMessage={onMemberMessage}
                onProfile={onMemberProfile}
              />
            ))}
          </Section>
        ))}
      </div>
    </div>
  );
}