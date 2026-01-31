import React from 'react';
import { Crown, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../ui/Avatar';
import { ContextMenu } from '../ui/ContextMenu';

function MemberItem({ member, profile, isOwner, onMessage, onKick, onBan }) {
  const name = member.nickname || profile?.display_name || member.user_email?.split('@')[0] || 'Unknown';
  const avatar = member.avatar_override || profile?.avatar_url;
  const status = profile?.status || 'offline';

  const contextItems = [
    { label: 'Send Message', onClick: () => onMessage?.(member) },
    { label: 'View Profile', onClick: () => {} },
    { separator: true },
    { label: 'Kick', onClick: () => onKick?.(member), danger: true },
    { label: 'Ban', onClick: () => onBan?.(member), danger: true },
  ];

  return (
    <ContextMenu items={contextItems}>
      <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/[0.04] transition-colors group">
        <Avatar src={avatar} name={name} status={status} size="sm" />
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1">
            <span className="text-sm text-zinc-300 group-hover:text-white truncate">
              {name}
            </span>
            {isOwner && <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />}
          </div>
        </div>
      </button>
    </ContextMenu>
  );
}

function MemberGroup({ title, members, profiles, ownerId, onMessage, onKick, onBan }) {
  if (members.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="px-2 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
        {title} — {members.length}
      </h3>
      <div className="space-y-0.5">
        {members.map((member) => (
          <MemberItem
            key={member.id}
            member={member}
            profile={profiles?.get(member.user_id)}
            isOwner={member.user_id === ownerId}
            onMessage={onMessage}
            onKick={onKick}
            onBan={onBan}
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
  onKick,
  onBan,
}) {
  // Group members by status
  const onlineMembers = members.filter(m => {
    const profile = profiles.get(m.user_id);
    return profile?.status === 'online' || profile?.is_online;
  });
  
  const offlineMembers = members.filter(m => {
    const profile = profiles.get(m.user_id);
    return !profile?.status || profile?.status === 'offline' || !profile?.is_online;
  });

  return (
    <div className="w-60 h-full bg-[#0f0f10] flex flex-col border-l border-white/[0.06]">
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        <MemberGroup
          title="Online"
          members={onlineMembers}
          profiles={profiles}
          ownerId={ownerId}
          onMessage={onMessage}
          onKick={onKick}
          onBan={onBan}
        />
        <MemberGroup
          title="Offline"
          members={offlineMembers}
          profiles={profiles}
          ownerId={ownerId}
          onMessage={onMessage}
          onKick={onKick}
          onBan={onBan}
        />
      </div>
    </div>
  );
}