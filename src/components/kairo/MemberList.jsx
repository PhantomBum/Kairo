import React from 'react';
import { Crown, Shield, ShieldCheck, MessageCircle, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
import UserBadges from './UserBadges';
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

const statusColors = {
  online: 'bg-emerald-500',
  idle: 'bg-amber-500',
  dnd: 'bg-rose-500',
  invisible: 'bg-zinc-500',
  offline: 'bg-zinc-600'
};

function MemberItem({ member, isOwner, highestRole, onMessage, onProfile }) {
  const roleColor = highestRole?.color || '#a1a1aa';

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <HoverCard openDelay={400}>
          <HoverCardTrigger asChild>
            <button className="w-full flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-white/5 transition-colors group text-left">
              {/* Avatar with status */}
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-700">
                  {member.avatar_override || member.user_avatar ? (
                    <img 
                      src={member.avatar_override || member.user_avatar} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-white text-xs font-medium">
                      {(member.nickname || member.user_name)?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#2b2d31]",
                  statusColors[member.status] || statusColors.offline
                )} />
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span 
                    className="text-sm truncate"
                    style={{ color: roleColor }}
                  >
                    {member.nickname || member.user_name}
                  </span>
                  {isOwner && (
                    <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  )}
                </div>
              </div>
            </button>
          </HoverCardTrigger>
          <HoverCardContent 
            side="left" 
            className="w-72 p-0 bg-zinc-900/95 backdrop-blur-xl border-zinc-800/80 shadow-2xl rounded-2xl overflow-hidden"
          >
            {/* Banner */}
            <div 
              className="h-20"
              style={{ 
                background: member.banner_url 
                  ? `url(${member.banner_url}) center/cover`
                  : `linear-gradient(135deg, ${roleColor}40, ${roleColor}10)`
              }}
            />
            
            {/* Avatar */}
            <div className="px-4 -mt-10">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-zinc-900 bg-zinc-800 shadow-xl">
                  {member.avatar_override || member.user_avatar ? (
                    <img 
                      src={member.avatar_override || member.user_avatar} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-2xl font-medium">
                      {(member.nickname || member.user_name)?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className={cn(
                  "absolute bottom-1 right-1 w-5 h-5 rounded-full border-4 border-zinc-900",
                  statusColors[member.status] || statusColors.offline
                )} />
              </div>
            </div>

            {/* Info */}
            <div className="p-4 pt-3">
              <h3 className="font-semibold text-white text-lg">
                {member.nickname || member.user_name}
              </h3>
              <p className="text-sm text-zinc-500">{member.user_name}</p>
              
              {member.bio && (
                <div className="mt-3 pt-3 border-t border-zinc-800/50">
                  <p className="text-sm text-zinc-400 leading-relaxed">{member.bio}</p>
                </div>
              )}

              {/* Roles */}
              {member.roles?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-800/50">
                  <div className="flex flex-wrap gap-1.5">
                    {member.roles.map((role) => (
                      <span
                        key={role.id}
                        className="px-2 py-0.5 rounded-lg text-xs font-medium"
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
      <ContextMenuContent className="w-48 bg-zinc-900/95 backdrop-blur-xl border-zinc-800/80 rounded-xl p-1">
        <ContextMenuItem 
          onClick={() => onProfile?.(member)}
          className="text-zinc-300 focus:bg-zinc-800 rounded-lg"
        >
          View Profile
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onMessage?.(member)}
          className="text-zinc-300 focus:bg-zinc-800 rounded-lg"
        >
          <MessageCircle className="w-4 h-4 mr-2 text-zinc-500" />
          Message
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-zinc-800/50 my-1" />
        <ContextMenuSub>
          <ContextMenuSubTrigger className="text-zinc-300 focus:bg-zinc-800 rounded-lg">
            Roles
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-zinc-900/95 backdrop-blur-xl border-zinc-800/80 rounded-xl p-1">
            <ContextMenuItem className="text-zinc-300 focus:bg-zinc-800 rounded-lg">
              Add Role...
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator className="bg-zinc-800/50 my-1" />
        <ContextMenuItem className="text-amber-400 focus:bg-amber-500/10 rounded-lg">
          Timeout
        </ContextMenuItem>
        <ContextMenuItem className="text-rose-400 focus:bg-rose-500/10 rounded-lg">
          <Ban className="w-4 h-4 mr-2" />
          Ban
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default function MemberList({ 
  members = [], 
  roles = [], 
  ownerId,
  onMemberMessage,
  onMemberProfile 
}) {
  const groupedMembers = React.useMemo(() => {
    const groups = {};
    const sortedRoles = [...roles].sort((a, b) => (b.position || 0) - (a.position || 0));
    
    sortedRoles.filter(r => r.is_hoisted).forEach(role => {
      groups[role.id] = { role, members: [] };
    });
    
    groups['online'] = { role: { id: 'online', name: 'Online', color: null }, members: [] };
    groups['offline'] = { role: { id: 'offline', name: 'Offline', color: null }, members: [] };
    
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
        const isOnline = member.status && member.status !== 'offline';
        const group = isOnline ? 'online' : 'offline';
        groups[group].members.push({
          ...member,
          highestRole: sortedRoles.find(r => memberRoleIds.includes(r.id)) || null
        });
      }
    });
    
    return Object.values(groups).filter(g => g.members.length > 0);
  }, [members, roles]);

  return (
    <div className="w-60 h-full bg-[#2b2d31] border-l border-zinc-800 overflow-y-auto scrollbar-thin">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 bg-[#2b2d31]">
        <h2 className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Members — {members.length}</h2>
      </div>
      
      <div className="p-2 space-y-4">
        {groupedMembers.map((group) => (
          <div key={group.role.id}>
            <h3 className="px-2 mb-1 text-[9px] font-medium uppercase tracking-wider text-zinc-600">
              {group.role.name} — {group.members.length}
            </h3>
            <div className="space-y-0">
              {group.members.map((member) => (
                <MemberItem
                  key={member.user_id}
                  member={member}
                  isOwner={member.user_id === ownerId}
                  highestRole={member.highestRole}
                  onMessage={onMemberMessage}
                  onProfile={onMemberProfile}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}