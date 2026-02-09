import React, { useMemo } from 'react';
import { Crown, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../ui/Avatar';

function MemberItem({ member, profile, isOwner }) {
  const name = member.nickname || profile?.display_name || member.user_email?.split('@')[0];
  const avatar = member.avatar_override || profile?.avatar_url;
  const status = profile?.status || 'offline';
  const isOnline = profile?.is_online || status !== 'offline';

  return (
    <button className={cn(
      'w-full flex items-center gap-2.5 px-2 py-1.5 rounded transition-colors',
      'hover:bg-white/[0.04]', !isOnline && 'opacity-40'
    )}>
      <Avatar src={avatar} name={name} size="sm" status={status} />
      <div className="flex items-center gap-1.5 min-w-0">
        <span className={cn('text-sm truncate', isOwner ? 'text-amber-400' : 'text-zinc-300')}>{name}</span>
        {isOwner && <Crown className="w-3 h-3 text-amber-500 flex-shrink-0" />}
      </div>
    </button>
  );
}

export default function MemberSidebar({ members = [], profiles = new Map(), roles = [], ownerId, onMessage }) {
  const { online, offline } = useMemo(() => {
    const on = [], off = [];
    members.forEach(m => {
      const p = profiles.get(m.user_id);
      (p?.is_online || p?.status !== 'offline' ? on : off).push(m);
    });
    return { online: on, offline: off };
  }, [members, profiles]);

  return (
    <div className="w-[240px] h-full bg-[#191919] border-l border-white/[0.04] flex flex-col flex-shrink-0">
      <div className="h-12 px-4 flex items-center border-b border-white/[0.04]">
        <span className="text-sm font-semibold text-zinc-400">Members</span>
        <span className="text-xs text-zinc-600 ml-2">Members {members.length} • Online {online.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
        {online.length > 0 && (
          <div className="mb-3">
            <p className="px-2 mb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">Online — {online.length}</p>
            {online.map(m => <MemberItem key={m.id} member={m} profile={profiles.get(m.user_id)} isOwner={m.user_id === ownerId} />)}
          </div>
        )}
        {offline.length > 0 && (
          <div>
            <p className="px-2 mb-1 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">Offline — {offline.length}</p>
            {offline.map(m => <MemberItem key={m.id} member={m} profile={profiles.get(m.user_id)} isOwner={m.user_id === ownerId} />)}
          </div>
        )}
      </div>
    </div>
  );
}