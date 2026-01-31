import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Shield, MoreVertical, MessageCircle, UserX, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Panel, PanelHeader, PanelContent, SectionHeader } from '../layout/AppShell';
import Avatar from '../primitives/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

function MemberItem({ member, profile, role, isOwner, onMessage, onKick, onBan, onTimeout }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const displayName = member.nickname || profile?.display_name || member.user_email?.split('@')[0] || 'User';
  const username = profile?.username || member.user_email?.split('@')[0];
  const status = profile?.status || 'offline';
  const isOnline = status === 'online' || status === 'idle' || status === 'dnd';
  
  return (
    <HoverCard openDelay={300} closeDelay={100}>
      <HoverCardTrigger asChild>
        <motion.div
          className={cn(
            'group flex items-center gap-2 px-2 py-1 rounded-md cursor-pointer',
            'hover:bg-white/[0.04] transition-colors'
          )}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <Avatar
            src={member.avatar_override || profile?.avatar_url}
            name={displayName}
            status={status}
            size="sm"
          />
          
          <div className="flex-1 min-w-0 flex items-center gap-1">
            <span 
              className={cn(
                'text-[13px] font-medium truncate',
                isOnline ? 'text-zinc-300' : 'text-zinc-500'
              )}
              style={{ color: role?.color && isOnline ? role.color : undefined }}
            >
              {displayName}
            </span>
            
            {isOwner && (
              <Crown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            )}
            {role?.name === 'Admin' && !isOwner && (
              <Shield className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
            )}
          </div>
          
          {/* Actions dropdown */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-5 h-5 rounded flex items-center justify-center hover:bg-white/[0.08] text-zinc-500">
                      <MoreVertical className="w-3 h-3" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 bg-[#111113] border-white/10">
                    <DropdownMenuItem onClick={() => onMessage?.(member)}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Message
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/[0.06]" />
                    <DropdownMenuItem onClick={() => onTimeout?.(member)} className="text-amber-400">
                      <Clock className="w-4 h-4 mr-2" />
                      Timeout
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onKick?.(member)} className="text-orange-400">
                      <UserX className="w-4 h-4 mr-2" />
                      Kick
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onBan?.(member)} className="text-red-400">
                      <UserX className="w-4 h-4 mr-2" />
                      Ban
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </HoverCardTrigger>
      
      <HoverCardContent side="left" align="start" className="w-72 p-0 bg-[#111113] border-white/10">
        {/* Banner */}
        <div 
          className="h-16 rounded-t-lg"
          style={{ 
            background: profile?.banner_url 
              ? `url(${profile.banner_url}) center/cover`
              : profile?.accent_color || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
          }}
        />
        
        {/* Avatar */}
        <div className="relative px-3 -mt-8">
          <Avatar
            src={member.avatar_override || profile?.avatar_url}
            name={displayName}
            status={status}
            size="xl"
            ring
          />
        </div>
        
        {/* Info */}
        <div className="p-3 pt-2">
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="font-bold text-white">{displayName}</h3>
            {isOwner && <Crown className="w-4 h-4 text-amber-400" />}
          </div>
          <p className="text-xs text-zinc-400 mb-2">@{username}</p>
          
          {profile?.bio && (
            <p className="text-xs text-zinc-400 mb-2 line-clamp-2">{profile.bio}</p>
          )}
          
          {/* Roles */}
          {role && (
            <div className="flex flex-wrap gap-1">
              <span 
                className="px-1.5 py-0.5 text-[10px] font-medium rounded"
                style={{ 
                  backgroundColor: `${role.color}20`,
                  color: role.color || '#a1a1aa'
                }}
              >
                {role.name}
              </span>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function MemberPanel({
  members = [],
  profiles = new Map(),
  roles = [],
  ownerId,
  onMessage,
  onKick,
  onBan,
  onTimeout,
}) {
  // Group members by role
  const groupedMembers = useMemo(() => {
    const groups = {};
    const onlineMembers = [];
    const offlineMembers = [];
    
    members.forEach(member => {
      const profile = profiles.get(member.user_id);
      const isOnline = profile?.status === 'online' || profile?.status === 'idle' || profile?.status === 'dnd';
      const memberRole = roles.find(r => member.role_ids?.includes(r.id));
      
      if (memberRole?.hoist) {
        if (!groups[memberRole.id]) {
          groups[memberRole.id] = { role: memberRole, members: [] };
        }
        groups[memberRole.id].members.push({ member, profile, isOnline });
      } else if (isOnline) {
        onlineMembers.push({ member, profile, isOnline: true });
      } else {
        offlineMembers.push({ member, profile, isOnline: false });
      }
    });
    
    return { groups, onlineMembers, offlineMembers };
  }, [members, profiles, roles]);

  return (
    <Panel width={240}>
      <PanelContent padding={false} className="px-2 py-2">
        {/* Hoisted roles */}
        {Object.values(groupedMembers.groups)
          .sort((a, b) => (b.role.position || 0) - (a.role.position || 0))
          .map(({ role, members: roleMembers }) => (
            <div key={role.id} className="mb-3">
              <SectionHeader count={roleMembers.length}>
                {role.name}
              </SectionHeader>
              <div className="space-y-0.5">
                {roleMembers.map(({ member, profile }) => (
                  <MemberItem
                    key={member.id}
                    member={member}
                    profile={profile}
                    role={role}
                    isOwner={member.user_id === ownerId}
                    onMessage={onMessage}
                    onKick={onKick}
                    onBan={onBan}
                    onTimeout={onTimeout}
                  />
                ))}
              </div>
            </div>
          ))}
        
        {/* Online members */}
        {groupedMembers.onlineMembers.length > 0 && (
          <div className="mb-3">
            <SectionHeader count={groupedMembers.onlineMembers.length}>
              Online
            </SectionHeader>
            <div className="space-y-0.5">
              {groupedMembers.onlineMembers.map(({ member, profile }) => (
                <MemberItem
                  key={member.id}
                  member={member}
                  profile={profile}
                  isOwner={member.user_id === ownerId}
                  onMessage={onMessage}
                  onKick={onKick}
                  onBan={onBan}
                  onTimeout={onTimeout}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Offline members */}
        {groupedMembers.offlineMembers.length > 0 && (
          <div>
            <SectionHeader count={groupedMembers.offlineMembers.length}>
              Offline
            </SectionHeader>
            <div className="space-y-0.5">
              {groupedMembers.offlineMembers.map(({ member, profile }) => (
                <MemberItem
                  key={member.id}
                  member={member}
                  profile={profile}
                  isOwner={member.user_id === ownerId}
                  onMessage={onMessage}
                  onKick={onKick}
                  onBan={onBan}
                  onTimeout={onTimeout}
                />
              ))}
            </div>
          </div>
        )}
      </PanelContent>
    </Panel>
  );
}