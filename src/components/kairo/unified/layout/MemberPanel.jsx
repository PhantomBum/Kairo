import React from 'react';
import { Crown } from 'lucide-react';

const statusColors = { online: '#22c55e', idle: '#eab308', dnd: '#ef4444', invisible: '#555', offline: '#555' };

function MemberRow({ member, profile, isOwner, onClick }) {
  const name = profile?.display_name || member.nickname || member.user_email?.split('@')[0] || 'User';
  const avatar = profile?.avatar_url || member.avatar_override;
  const status = profile?.status || 'offline';
  const customStatus = profile?.custom_status;
  const badges = profile?.badges || [];

  return (
    <div onClick={() => onClick?.(member.user_id)}
      className="flex items-center gap-2.5 px-2 py-1.5 rounded cursor-pointer hover:bg-white/[0.04] transition-colors group">
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-medium overflow-hidden" style={{ background: '#1a1a1a' }}>
          {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <span style={{ color: '#888' }}>{name.charAt(0).toUpperCase()}</span>}
        </div>
        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: statusColors[status], border: '2px solid #131313' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-[13px] text-zinc-300 truncate">{name}</span>
          {isOwner && <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />}
          {badges.includes('premium') && <span className="text-[8px] px-1 rounded bg-purple-500/20 text-purple-400">PRO</span>}
        </div>
        {customStatus?.text && (
          <div className="text-[10px] text-zinc-600 truncate">{customStatus.emoji} {customStatus.text}</div>
        )}
        {!customStatus?.text && profile?.rich_presence?.name && (
          <div className="text-[10px] text-zinc-600 truncate">
            {profile.rich_presence.type === 'playing' ? '🎮' : profile.rich_presence.type === 'listening' ? '🎵' : '📺'} {profile.rich_presence.name}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MemberPanel({ members, profilesMap, roles, ownerId, onProfileClick }) {
  const getMemberProfile = (m) => profilesMap?.get(m.user_id) || profilesMap?.get(m.user_email);

  // Group by roles (hoisted roles first)
  const hoisted = roles?.filter(r => r.hoist && !r.is_default).sort((a, b) => (b.position || 0) - (a.position || 0)) || [];
  const grouped = {};
  const unroled = [];

  members.forEach(m => {
    const p = getMemberProfile(m);
    const memberRoles = m.role_ids?.map(id => roles?.find(r => r.id === id)).filter(Boolean) || [];
    const topHoist = memberRoles.find(r => r.hoist);
    if (topHoist) {
      if (!grouped[topHoist.id]) grouped[topHoist.id] = [];
      grouped[topHoist.id].push(m);
    } else {
      unroled.push(m);
    }
  });

  // Sort: online first
  const sortMembers = (list) => list.sort((a, b) => {
    const pa = getMemberProfile(a);
    const pb = getMemberProfile(b);
    const sa = pa?.status === 'offline' ? 1 : 0;
    const sb = pb?.status === 'offline' ? 1 : 0;
    return sa - sb;
  });

  const online = members.filter(m => {
    const p = getMemberProfile(m);
    return p?.status && p.status !== 'offline' && p.status !== 'invisible';
  });
  const offline = members.filter(m => {
    const p = getMemberProfile(m);
    return !p?.status || p.status === 'offline' || p.status === 'invisible';
  });

  return (
    <div className="w-60 flex-shrink-0 flex flex-col" style={{ background: '#131313', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {hoisted.length > 0 ? (
          <>
            {hoisted.map(role => {
              const group = grouped[role.id] || [];
              if (group.length === 0) return null;
              return (
                <div key={role.id} className="mb-2">
                  <div className="text-[11px] font-semibold uppercase px-2 py-1.5" style={{ color: role.color || '#666' }}>
                    {role.name} — {group.length}
                  </div>
                  {sortMembers(group).map(m => (
                    <MemberRow key={m.id} member={m} profile={getMemberProfile(m)} isOwner={m.user_id === ownerId} onClick={onProfileClick} />
                  ))}
                </div>
              );
            })}
            {unroled.length > 0 && (
              <div className="mb-2">
                <div className="text-[11px] font-semibold uppercase text-zinc-600 px-2 py-1.5">Members — {unroled.length}</div>
                {sortMembers(unroled).map(m => (
                  <MemberRow key={m.id} member={m} profile={getMemberProfile(m)} isOwner={m.user_id === ownerId} onClick={onProfileClick} />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="text-[11px] font-semibold uppercase text-zinc-600 px-2 py-1.5">Online — {online.length}</div>
            {online.map(m => (
              <MemberRow key={m.id} member={m} profile={getMemberProfile(m)} isOwner={m.user_id === ownerId} onClick={onProfileClick} />
            ))}
            <div className="text-[11px] font-semibold uppercase text-zinc-600 px-2 py-1.5 mt-2">Offline — {offline.length}</div>
            {offline.map(m => (
              <MemberRow key={m.id} member={m} profile={getMemberProfile(m)} isOwner={m.user_id === ownerId} onClick={onProfileClick} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}