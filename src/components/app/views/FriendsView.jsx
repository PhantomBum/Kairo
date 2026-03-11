import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Check, X, MessageSquare, Clock, Search, Ban, Activity, Sparkles, UserX } from 'lucide-react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { colors, shadows } from '@/components/app/design/tokens';

const TABS = ['all', 'online', 'pending', 'blocked', 'activity'];

function FriendRow({ f, onMessage, onRemove, onBlock, onProfileClick, profile }) {
  const status = profile?.status || 'offline';
  const statusColor = colors.status[status] || colors.status.offline;
  const customStatus = profile?.custom_status;
  const activity = profile?.rich_presence;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-colors hover:bg-[rgba(255,255,255,0.03)]"
          style={{ borderTop: `1px solid ${colors.border.default}` }}>
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-semibold overflow-hidden" style={{ background: colors.bg.overlay, color: colors.text.muted }}>
              {f.friend_avatar ? <img src={f.friend_avatar} className="w-full h-full object-cover" alt="" /> : (f.friend_name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-[14px] h-[14px] rounded-full border-[3px]" style={{ background: statusColor, borderColor: colors.bg.base }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[14px] font-semibold truncate" style={{ color: colors.text.primary }}>{f.friend_name}</p>
              {profile?.badges?.includes('premium') && <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.warning }} />}
            </div>
            <p className="text-[12px] truncate" style={{ color: colors.text.muted }}>
              {profile?.pronouns && <span className="mr-1" style={{ color: colors.text.disabled }}>{profile.pronouns} ·</span>}
              {customStatus?.text ? `${customStatus.emoji || ''} ${customStatus.text}` : activity?.name ? `${activity.type || 'Playing'} ${activity.name}` : status}
            </p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onMessage(f)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.06)]" style={{ background: colors.bg.elevated }}>
              <MessageSquare className="w-4 h-4" style={{ color: colors.text.muted }} />
            </button>
            <button onClick={() => onProfileClick?.(f.friend_id)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.06)]" style={{ background: colors.bg.elevated }}>
              <Users className="w-4 h-4" style={{ color: colors.text.muted }} />
            </button>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52 p-1.5 rounded-lg" style={{ background: colors.bg.modal, border: `1px solid ${colors.border.light}`, boxShadow: shadows.strong }}>
        <ContextMenuItem onClick={() => onMessage(f)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}>
          <MessageSquare className="w-4 h-4 opacity-50" /> Message
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onProfileClick?.(f.friend_id)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}>
          <Users className="w-4 h-4 opacity-50" /> View Profile
        </ContextMenuItem>
        <ContextMenuSeparator style={{ background: colors.border.light, margin: '4px 0' }} />
        <ContextMenuItem onClick={() => onRemove(f)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.danger }}>
          <UserX className="w-4 h-4 opacity-50" /> Remove Friend
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onBlock?.(f)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.danger }}>
          <Ban className="w-4 h-4 opacity-50" /> Block
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default function FriendsView({ friends, incomingRequests, outgoingRequests, onAddFriend, onMessage, onAccept, onDecline, onRemove, onBlock, onProfileClick, blocked = [], suggestedFriends = [] }) {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const { getProfile } = useProfiles();

  const online = useMemo(() => (friends || []).filter(f => {
    const p = getProfile(f.friend_id);
    return p?.is_online || p?.status === 'online' || p?.status === 'idle' || p?.status === 'dnd';
  }), [friends, getProfile]);

  const filtered = useMemo(() => {
    let list = tab === 'online' ? online : (friends || []);
    if (search) list = list.filter(f => f.friend_name?.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [friends, online, tab, search]);

  const pendingBadge = incomingRequests.length + outgoingRequests.length;

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="h-12 px-4 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: `1px solid ${colors.border.default}`, background: colors.bg.surface, boxShadow: '0 1px 0 rgba(0,0,0,0.15)' }}>
        <Users className="w-5 h-5" style={{ color: colors.text.disabled }} />
        <span className="text-[15px] font-semibold" style={{ color: colors.text.primary }}>Friends</span>
        <div className="flex gap-0.5 ml-3">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className="px-3 py-1 rounded-md text-[13px] font-medium transition-colors capitalize relative"
              style={{ background: tab === t ? 'rgba(255,255,255,0.06)' : 'transparent', color: tab === t ? colors.text.primary : colors.text.muted }}>
              {t}
              {t === 'pending' && pendingBadge > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ background: colors.danger, color: '#fff' }}>{pendingBadge}</span>
              )}
              {t === 'online' && <span className="ml-1 text-[11px]" style={{ color: colors.text.disabled }}>{online.length}</span>}
            </button>
          ))}
        </div>
        <button onClick={onAddFriend} className="ml-auto px-4 py-1.5 rounded-md text-[13px] font-semibold flex items-center gap-2"
          style={{ background: colors.success, color: '#fff' }}>
          <UserPlus className="w-4 h-4" /> Add Friend
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-none max-w-3xl mx-auto w-full">
        {/* Search */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-md mb-5" style={{ background: colors.bg.base }}>
          <Search className="w-4 h-4" style={{ color: colors.text.disabled }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search friends..." className="flex-1 bg-transparent text-[14px] outline-none" style={{ color: colors.text.primary }} />
        </div>

        {/* Pending tab */}
        {tab === 'pending' && (
          <div className="space-y-2">
            {incomingRequests.length > 0 && <p className="text-[11px] font-semibold uppercase tracking-[0.06em] px-1 pb-2" style={{ color: colors.text.muted }}>Incoming — {incomingRequests.length}</p>}
            {incomingRequests.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: colors.bg.elevated }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold overflow-hidden" style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                  {r.friend_avatar ? <img src={r.friend_avatar} className="w-full h-full object-cover" alt="" /> : (r.friend_name || r.created_by || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold" style={{ color: colors.text.primary }}>{r.friend_name || r.created_by}</p>
                  <p className="text-[12px]" style={{ color: colors.text.muted }}>Incoming friend request</p>
                </div>
                <button onClick={() => onAccept(r)} className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: `${colors.success}20` }}><Check className="w-5 h-5" style={{ color: colors.success }} /></button>
                <button onClick={() => onDecline(r)} className="w-9 h-9 flex items-center justify-center rounded-full" style={{ background: `${colors.danger}20` }}><X className="w-5 h-5" style={{ color: colors.danger }} /></button>
              </div>
            ))}
            {outgoingRequests.length > 0 && <p className="text-[11px] font-semibold uppercase tracking-[0.06em] px-1 py-2 mt-4" style={{ color: colors.text.muted }}>Outgoing — {outgoingRequests.length}</p>}
            {outgoingRequests.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: colors.bg.elevated }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold overflow-hidden" style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                  {r.friend_avatar ? <img src={r.friend_avatar} className="w-full h-full object-cover" alt="" /> : (r.friend_name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1"><p className="text-[14px]" style={{ color: colors.text.primary }}>{r.friend_name}</p><p className="text-[12px]" style={{ color: colors.text.muted }}>Request sent</p></div>
                <Clock className="w-4 h-4" style={{ color: colors.text.disabled }} />
              </div>
            ))}
            {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
              <div className="text-center py-16 k-fade-in">
                <Clock className="w-10 h-10 mx-auto mb-3" style={{ color: colors.text.disabled, opacity: 0.3 }} />
                <p className="text-[14px] font-medium mb-1" style={{ color: colors.text.secondary }}>No pending requests</p>
                <p className="text-[12px] leading-relaxed" style={{ color: colors.text.muted }}>Friend requests you send or receive will show up here</p>
              </div>
            )}
          </div>
        )}

        {tab === 'blocked' && (
          <div className="space-y-2">
            {(blocked || []).length === 0 ? (
              <div className="text-center py-16 k-fade-in">
                <Ban className="w-10 h-10 mx-auto mb-3" style={{ color: colors.text.disabled, opacity: 0.3 }} />
                <p className="text-[14px] font-medium mb-1" style={{ color: colors.text.secondary }}>No blocked users</p>
                <p className="text-[12px] leading-relaxed" style={{ color: colors.text.muted }}>Users you block won't be able to message you or see your status</p>
              </div>
            )
            : (blocked || []).map(b => (
              <div key={b.id} className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ background: colors.bg.elevated }}>
                <Ban className="w-5 h-5" style={{ color: colors.danger }} />
                <span className="text-[14px] flex-1" style={{ color: colors.text.primary }}>{b.friend_name || b.friend_email}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'activity' && (
          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] px-1" style={{ color: colors.text.muted }}>Friend Activity</p>
            {(friends || []).slice(0, 10).map(f => {
              const p = getProfile(f.friend_id);
              if (!p?.rich_presence?.name && !p?.is_online) return null;
              return (
                <div key={f.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: colors.bg.elevated }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold overflow-hidden" style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                    {f.friend_avatar ? <img src={f.friend_avatar} className="w-full h-full object-cover" alt="" /> : (f.friend_name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: colors.text.primary }}>{f.friend_name}</p>
                    <p className="text-[12px] truncate" style={{ color: colors.text.muted }}>{p?.rich_presence?.name ? `${p.rich_presence.type || 'Playing'} ${p.rich_presence.name}` : 'Online'}</p>
                  </div>
                  <Activity className="w-4 h-4" style={{ color: colors.success }} />
                </div>
              );
            }).filter(Boolean)}
            {(friends || []).filter(f => { const p = getProfile(f.friend_id); return p?.rich_presence?.name || p?.is_online; }).length === 0 && (
              <div className="text-center py-16 k-fade-in">
                <Activity className="w-10 h-10 mx-auto mb-3" style={{ color: colors.text.disabled, opacity: 0.3 }} />
                <p className="text-[14px] font-medium mb-1" style={{ color: colors.text.secondary }}>No active friends right now</p>
                <p className="text-[12px] leading-relaxed" style={{ color: colors.text.muted }}>When friends are online or playing something, they'll appear here</p>
              </div>
            )}
          </div>
        )}

        {(tab === 'all' || tab === 'online') && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] px-1 pb-2" style={{ color: colors.text.muted }}>
              {tab === 'online' ? `Online — ${online.length}` : `All Friends — ${filtered.length}`}
            </p>
            {filtered.length === 0 && (
              <div className="text-center py-16 k-fade-in">
                <Users className="w-10 h-10 mx-auto mb-3" style={{ color: colors.text.disabled, opacity: 0.3 }} />
                <p className="text-[14px] font-medium mb-1" style={{ color: colors.text.secondary }}>
                  {tab === 'online' ? 'No friends online' : 'No friends yet'}
                </p>
                <p className="text-[12px] leading-relaxed mb-4" style={{ color: colors.text.muted }}>
                  {tab === 'online' ? 'Your online friends will appear here' : 'Add friends to start chatting and hanging out'}
                </p>
                {tab === 'all' && (
                  <button onClick={onAddFriend} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold"
                    style={{ background: colors.success, color: '#fff' }}>
                    <UserPlus className="w-4 h-4" /> Add Your First Friend
                  </button>
                )}
              </div>
            )}
            {filtered.map(f => (
              <FriendRow key={f.id} f={f} onMessage={onMessage} onRemove={onRemove} onBlock={onBlock} onProfileClick={onProfileClick} profile={getProfile(f.friend_id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}