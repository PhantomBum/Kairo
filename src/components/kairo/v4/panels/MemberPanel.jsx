import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import Avatar from '../primitives/Avatar';
import { BadgeGroup } from '../primitives/Badge';
import { Panel, PanelHeader, PanelContent } from '../layout/AppShell';
import { Search, Crown, Shield, Users } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

function MemberItem({ member, profile, isOwner, roleColor, onMessage, onViewProfile, onKick, onBan, onTimeout }) {
  const displayName = profile?.display_name || member.nickname || member.user_name || 'Unknown';
  const avatarUrl = member.avatar_override || profile?.avatar_url;
  const status = profile?.status || 'offline';
  const badges = [...(profile?.badges || [])];
  const [isHovered, setIsHovered] = useState(false);
  
  if (isOwner && !badges.includes('owner')) badges.unshift('owner');

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <HoverCard openDelay={300} closeDelay={100}>
          <HoverCardTrigger asChild>
            <motion.button 
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group relative"
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Hover background */}
              <motion.div
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/[0.06] to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
              />
              
              <div className="relative">
                <Avatar
                  src={avatarUrl}
                  name={displayName}
                  status={status}
                  size="sm"
                />
                {isOwner && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <Crown className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>
              
              <div className="relative flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <span 
                    className={cn(
                      'text-sm font-medium truncate transition-colors',
                      status === 'online' || status === 'idle' || status === 'dnd' 
                        ? 'text-white' 
                        : 'text-zinc-500'
                    )}
                    style={roleColor ? { color: roleColor } : undefined}
                  >
                    {displayName}
                  </span>
                  {badges.length > 0 && <BadgeGroup badges={badges} size="xs" max={2} />}
                </div>
                {profile?.custom_status?.text && (
                  <p className="text-[11px] text-zinc-600 truncate mt-0.5">
                    {profile.custom_status.emoji} {profile.custom_status.text}
                  </p>
                )}
              </div>
            </motion.button>
          </HoverCardTrigger>
          <HoverCardContent side="left" align="start" className="w-72 p-0 bg-[#18181b]/95 backdrop-blur-xl border-white/[0.1] shadow-2xl">
            {/* Banner */}
            <div 
              className="h-16 rounded-t-lg"
              style={{ 
                background: profile?.banner_url 
                  ? `url(${profile.banner_url}) center/cover` 
                  : `linear-gradient(135deg, ${profile?.accent_color || '#5865F2'}40, ${profile?.accent_color || '#5865F2'}20)`
              }}
            />
            
            {/* Profile info */}
            <div className="px-4 pb-4">
              <div className="flex items-end gap-3 -mt-6 mb-3">
                <div className="ring-4 ring-[#18181b] rounded-2xl">
                  <Avatar src={avatarUrl} name={displayName} status={status} size="lg" />
                </div>
                {badges.length > 0 && (
                  <div className="flex gap-1 mb-1">
                    <BadgeGroup badges={badges} size="sm" />
                  </div>
                )}
              </div>
              
              <h3 className="font-bold text-white text-lg">{displayName}</h3>
              {profile?.username && (
                <p className="text-sm text-zinc-500">@{profile.username}</p>
              )}
              
              {profile?.bio && (
                <p className="text-sm text-zinc-400 mt-2 line-clamp-2">{profile.bio}</p>
              )}
              
              <div className="flex gap-2 mt-3">
                <motion.button
                  onClick={() => onMessage?.(member)}
                  className="flex-1 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Message
                </motion.button>
                <motion.button
                  onClick={() => onViewProfile?.(member)}
                  className="px-4 py-2 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Profile
                </motion.button>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-[#18181b]/95 backdrop-blur-xl border-white/[0.1]">
        <ContextMenuItem onClick={() => onViewProfile?.(member)} className="text-zinc-300 focus:text-white focus:bg-white/[0.08]">
          View Profile
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onMessage?.(member)} className="text-zinc-300 focus:text-white focus:bg-white/[0.08]">
          Message
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/[0.08]" />
        <ContextMenuItem onClick={() => onTimeout?.(member)} className="text-amber-400 focus:text-amber-300 focus:bg-amber-500/10">
          Timeout
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onKick?.(member)} className="text-red-400 focus:text-red-300 focus:bg-red-500/10">
          Kick
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onBan?.(member)} className="text-red-400 focus:text-red-300 focus:bg-red-500/10">
          Ban
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function MemberGroup({ title, members, profiles, ownerId, roleColor, onMessage, onViewProfile, onKick, onBan, onTimeout }) {
  if (members.length === 0) return null;
  
  return (
    <motion.div 
      className="mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2 px-3 mb-2">
        <p 
          className="text-[11px] font-semibold uppercase tracking-wider"
          style={{ color: roleColor || '#71717a' }}
        >
          {title}
        </p>
        <span className="text-[10px] text-zinc-600 font-medium px-1.5 py-0.5 bg-white/[0.04] rounded">
          {members.length}
        </span>
      </div>
      <div className="space-y-0.5">
        <AnimatePresence>
          {members.map((member, i) => (
            <motion.div
              key={member.id || member.user_id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <MemberItem
                member={member}
                profile={profiles?.get(member.user_id)}
                isOwner={member.user_id === ownerId}
                roleColor={roleColor}
                onMessage={onMessage}
                onViewProfile={onViewProfile}
                onKick={onKick}
                onBan={onBan}
                onTimeout={onTimeout}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
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
  const [search, setSearch] = useState('');
  
  // Group members by role and status
  const groupedMembers = useMemo(() => {
    const profileMap = profiles instanceof Map ? profiles : new Map();
    
    // Filter by search
    const filteredMembers = search 
      ? members.filter(m => {
          const profile = profileMap.get(m.user_id);
          const name = profile?.display_name || m.nickname || m.user_name || '';
          return name.toLowerCase().includes(search.toLowerCase());
        })
      : members;
    
    // Get hoisted roles (displayed separately)
    const hoistedRoles = roles.filter(r => r.hoist).sort((a, b) => (b.position || 0) - (a.position || 0));
    
    const groups = [];
    const assignedMemberIds = new Set();
    
    // Group by hoisted roles
    for (const role of hoistedRoles) {
      const roleMembers = filteredMembers.filter(m => 
        m.role_ids?.includes(role.id) && !assignedMemberIds.has(m.user_id)
      );
      if (roleMembers.length > 0) {
        groups.push({ title: role.name, members: roleMembers, color: role.color });
        roleMembers.forEach(m => assignedMemberIds.add(m.user_id));
      }
    }
    
    // Online members without hoisted roles
    const onlineMembers = filteredMembers.filter(m => {
      const profile = profileMap.get(m.user_id);
      const status = profile?.status;
      return !assignedMemberIds.has(m.user_id) && (status === 'online' || status === 'idle' || status === 'dnd');
    });
    
    // Offline members
    const offlineMembers = filteredMembers.filter(m => {
      const profile = profileMap.get(m.user_id);
      return !assignedMemberIds.has(m.user_id) && profile?.status !== 'online' && profile?.status !== 'idle' && profile?.status !== 'dnd';
    });
    
    if (onlineMembers.length > 0) {
      groups.push({ title: 'Online', members: onlineMembers });
    }
    if (offlineMembers.length > 0) {
      groups.push({ title: 'Offline', members: offlineMembers });
    }
    
    return groups;
  }, [members, profiles, roles, search]);

  return (
    <Panel width={260} className="border-l border-white/[0.06]">
      <PanelHeader className="flex-col gap-3 py-3">
        <div className="flex items-center justify-between w-full px-1">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-500" />
            <span className="text-sm font-semibold text-white">Members</span>
          </div>
          <span className="text-xs text-zinc-600 font-medium px-2 py-0.5 bg-white/[0.04] rounded-full">
            {members.length}
          </span>
        </div>
        
        {/* Search */}
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            className="w-full h-9 pl-9 pr-3 bg-white/[0.04] border border-white/[0.06] rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-white/[0.12] transition-colors"
          />
        </div>
      </PanelHeader>
      
      <PanelContent className="px-2 py-3">
        {groupedMembers.map((group, i) => (
          <MemberGroup
            key={i}
            title={group.title}
            members={group.members}
            profiles={profiles}
            ownerId={ownerId}
            roleColor={group.color}
            onMessage={onMessage}
            onViewProfile={onViewProfile}
            onKick={onKick}
            onBan={onBan}
            onTimeout={onTimeout}
          />
        ))}
        
        {groupedMembers.length === 0 && search && (
          <div className="text-center py-8">
            <p className="text-sm text-zinc-600">No members found</p>
          </div>
        )}
      </PanelContent>
    </Panel>
  );
}