import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Shield, ShieldCheck, MoreHorizontal, UserPlus, MessageCircle, Ban } from 'lucide-react';
import { cn } from '@/lib/utils';
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
  dnd: 'bg-red-500',
  invisible: 'bg-zinc-500',
  offline: 'bg-zinc-600'
};

function MemberItem({ member, isOwner, highestRole, onMessage, onProfile }) {
  const roleColor = highestRole?.color || '#9ca3af';

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <HoverCard openDelay={500}>
          <HoverCardTrigger asChild>
            <motion.div
              whileHover={{ x: 2 }}
              className="flex items-center gap-3 px-2 py-1.5 mx-2 rounded cursor-pointer hover:bg-zinc-800/50 transition-colors group"
            >
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
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-medium">
                      {(member.nickname || member.user_name)?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#121214]",
                  statusColors[member.status] || statusColors.offline
                )} />
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0 flex items-center gap-1.5">
                <span 
                  className="text-sm font-medium truncate"
                  style={{ color: roleColor }}
                >
                  {member.nickname || member.user_name}
                </span>
                {isOwner && (
                  <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                )}
                {highestRole?.name === 'Admin' && !isOwner && (
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                )}
                {highestRole?.name === 'Moderator' && (
                  <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                )}
              </div>
            </motion.div>
          </HoverCardTrigger>
          <HoverCardContent 
            side="left" 
            className="w-80 p-0 bg-zinc-900 border-zinc-800 shadow-xl"
          >
            {/* Banner */}
            <div 
              className="h-16 rounded-t-lg"
              style={{ 
                background: member.banner_url 
                  ? `url(${member.banner_url}) center/cover`
                  : `linear-gradient(135deg, ${roleColor}40, ${roleColor}20)`
              }}
            />
            
            {/* Avatar */}
            <div className="px-4 -mt-8">
              <div className="relative inline-block">
                <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-zinc-900 bg-zinc-800">
                  {member.avatar_override || member.user_avatar ? (
                    <img 
                      src={member.avatar_override || member.user_avatar} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-medium">
                      {(member.nickname || member.user_name)?.charAt(0)}
                    </div>
                  )}
                </div>
                <div className={cn(
                  "absolute bottom-0 right-0 w-5 h-5 rounded-full border-4 border-zinc-900",
                  statusColors[member.status] || statusColors.offline
                )} />
              </div>
            </div>

            {/* Info */}
            <div className="p-4 pt-2">
              <h3 className="font-semibold text-white text-lg">
                {member.nickname || member.user_name}
              </h3>
              <p className="text-sm text-zinc-400">{member.user_name}</p>
              
              {member.custom_status?.text && (
                <p className="text-sm text-zinc-300 mt-2 flex items-center gap-2">
                  {member.custom_status.emoji && <span>{member.custom_status.emoji}</span>}
                  {member.custom_status.text}
                </p>
              )}

              {member.bio && (
                <div className="mt-3 pt-3 border-t border-zinc-800">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase mb-1">About Me</h4>
                  <p className="text-sm text-zinc-300">{member.bio}</p>
                </div>
              )}

              {/* Roles */}
              {member.roles?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-800">
                  <h4 className="text-xs font-semibold text-zinc-400 uppercase mb-2">Roles</h4>
                  <div className="flex flex-wrap gap-1">
                    {member.roles.map((role) => (
                      <span
                        key={role.id}
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{ 
                          backgroundColor: `${role.color}20`,
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
      <ContextMenuContent className="w-48 bg-zinc-900 border-zinc-800">
        <ContextMenuItem 
          onClick={() => onProfile?.(member)}
          className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white"
        >
          View Profile
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onMessage?.(member)}
          className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Message
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-zinc-800" />
        <ContextMenuSub>
          <ContextMenuSubTrigger className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white">
            Roles
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="bg-zinc-900 border-zinc-800">
            <ContextMenuItem className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white">
              Add Role...
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator className="bg-zinc-800" />
        <ContextMenuItem className="text-amber-400 focus:bg-amber-500/20 focus:text-amber-400">
          Timeout
        </ContextMenuItem>
        <ContextMenuItem className="text-red-400 focus:bg-red-500/20 focus:text-red-400">
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
  // Group members by their highest role
  const groupedMembers = React.useMemo(() => {
    const groups = {};
    const sortedRoles = [...roles].sort((a, b) => (b.position || 0) - (a.position || 0));
    
    // Create groups for hoisted roles
    sortedRoles
      .filter(r => r.is_hoisted)
      .forEach(role => {
        groups[role.id] = { role, members: [] };
      });
    
    // Add "Online" and "Offline" groups
    groups['online'] = { role: { id: 'online', name: 'Online', color: null }, members: [] };
    groups['offline'] = { role: { id: 'offline', name: 'Offline', color: null }, members: [] };
    
    // Sort members into groups
    members.forEach(member => {
      const memberRoleIds = member.role_ids || [];
      let placed = false;
      
      // Check hoisted roles first
      for (const role of sortedRoles.filter(r => r.is_hoisted)) {
        if (memberRoleIds.includes(role.id)) {
          groups[role.id].members.push({
            ...member,
            highestRole: role
          });
          placed = true;
          break;
        }
      }
      
      // If not placed in a hoisted role, put in online/offline
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
    <div className="w-60 h-full bg-[#121214] border-l border-zinc-800/50 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
      <div className="py-4">
        {groupedMembers.map((group) => (
          <div key={group.role.id} className="mb-4">
            <h3 className="px-4 mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {group.role.name} — {group.members.length}
            </h3>
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
        ))}
      </div>
    </div>
  );
}