import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Shield, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../ui/Avatar';
import UserProfilePopup from '../chat/UserProfilePopup';

function MemberItem({ member, profile, isOwner, isAdmin, onMessage }) {
  const [showProfile, setShowProfile] = useState(false);
  
  const displayName = member.nickname || profile?.display_name || member.user_email?.split('@')[0];
  const avatar = member.avatar_override || profile?.avatar_url;
  const status = profile?.status || 'offline';
  const isOnline = profile?.is_online || status !== 'offline';

  return (
    <div className="relative">
      <motion.button
        whileHover={{ x: 2 }}
        onClick={() => setShowProfile(true)}
        className={cn(
          'w-full flex items-center gap-3 px-2 py-1.5 rounded-lg transition-colors',
          'hover:bg-white/[0.04]',
          !isOnline && 'opacity-50'
        )}
      >
        <Avatar 
          src={avatar} 
          name={displayName} 
          size="sm" 
          status={status}
        />
        
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1.5">
            <span 
              className="text-sm font-medium truncate"
              style={{ color: member.role_color || (isOwner ? '#f59e0b' : isAdmin ? '#ef4444' : '#fff') }}
            >
              {displayName}
            </span>
            {isOwner && (
              <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            )}
            {isAdmin && !isOwner && (
              <Shield className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            )}
          </div>
          {profile?.custom_status?.text && (
            <p className="text-[11px] text-zinc-500 truncate">
              {profile.custom_status.emoji} {profile.custom_status.text}
            </p>
          )}
        </div>
      </motion.button>

      <AnimatePresence>
        {showProfile && (
          <UserProfilePopup
            user={{
              name: displayName,
              username: profile?.username,
              avatar: avatar,
              status: status,
              badges: profile?.badges || [],
              bio: profile?.bio,
              banner_color: profile?.accent_color,
              id: member.user_id,
            }}
            onClose={() => setShowProfile(false)}
            onMessage={() => {
              onMessage?.(member);
              setShowProfile(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function RoleSection({ title, color, members, profiles, ownerId, onMessage }) {
  return (
    <div className="mb-4">
      <h3 
        className="px-2 mb-1 text-[11px] font-semibold uppercase tracking-wider"
        style={{ color: color || '#71717a' }}
      >
        {title} — {members.length}
      </h3>
      <div className="space-y-0.5">
        {members.map((member) => (
          <MemberItem
            key={member.id}
            member={member}
            profile={profiles.get(member.user_id)}
            isOwner={member.user_id === ownerId}
            isAdmin={member.role_ids?.includes('admin')}
            onMessage={onMessage}
          />
        ))}
      </div>
    </div>
  );
}

export default function MemberSidebar({
  members = [],
  profiles = new Map(),
  roles = [],
  ownerId,
  onMessage,
}) {
  const { online, offline, roleGroups } = useMemo(() => {
    const online = [];
    const offline = [];
    const roleGroups = {};

    // Sort members into groups
    members.forEach((member) => {
      const profile = profiles.get(member.user_id);
      const isOnline = profile?.is_online || profile?.status !== 'offline';

      if (isOnline) {
        online.push(member);
      } else {
        offline.push(member);
      }

      // Group by highest role
      const highestRole = member.role_ids?.[0];
      if (highestRole) {
        if (!roleGroups[highestRole]) {
          const roleData = roles.find(r => r.id === highestRole);
          roleGroups[highestRole] = {
            name: roleData?.name || 'Members',
            color: roleData?.color,
            position: roleData?.position || 0,
            members: [],
          };
        }
        roleGroups[highestRole].members.push(member);
      }
    });

    return { online, offline, roleGroups };
  }, [members, profiles, roles]);

  // Check if we should show role-based grouping
  const hasRoles = Object.keys(roleGroups).length > 0;

  return (
    <div className="w-60 h-full bg-[#111113] border-l border-white/[0.04] flex flex-col">
      {/* Header */}
      <div className="h-12 px-4 flex items-center border-b border-white/[0.04]">
        <h2 className="text-sm font-semibold text-zinc-400">
          Members — {members.length}
        </h2>
      </div>

      {/* Members list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        {hasRoles ? (
          // Role-based grouping
          Object.entries(roleGroups)
            .sort((a, b) => (b[1].position || 0) - (a[1].position || 0))
            .map(([roleId, group]) => (
              <RoleSection
                key={roleId}
                title={group.name}
                color={group.color}
                members={group.members}
                profiles={profiles}
                ownerId={ownerId}
                onMessage={onMessage}
              />
            ))
        ) : (
          // Simple online/offline grouping
          <>
            {online.length > 0 && (
              <RoleSection
                title="Online"
                color="#22c55e"
                members={online}
                profiles={profiles}
                ownerId={ownerId}
                onMessage={onMessage}
              />
            )}
            {offline.length > 0 && (
              <RoleSection
                title="Offline"
                members={offline}
                profiles={profiles}
                ownerId={ownerId}
                onMessage={onMessage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}