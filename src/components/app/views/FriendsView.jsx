import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Check, X, MessageSquare, Clock, Search, Ban, Activity, Sparkles, UserX, Heart } from 'lucide-react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { colors, shadows } from '@/components/app/design/tokens';

const TABS = [
  { id: 'online', label: 'Online' },
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'blocked', label: 'Blocked' },
  { id: 'activity', label: 'Activity' },
];

function StatusDot({ status }) {
  const c = colors.status[status] || colors.status.offline;
  return <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-[3px]" style={{ background: c, borderColor: colors.bg.elevated }} />;
}

function FriendCard({ f, onMessage, onRemove, onBlock, onProfileClick, profile }) {
  const status = profile?.status || 'offline';
  const customStatus = profile?.custom_status;
  const activity = profile?.rich_presence;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl group transition-all hover:bg-[rgba(255,255,255,0.03)] cursor-pointer"
          onClick={() => onProfileClick?.(f.friend_id)}>
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden"
              style={{ background: colors.bg.overlay, color: colors.text.muted }}>
              {f.friend_avatar ? <img src={f.friend_avatar} className="w-full h-full object-cover" alt="" /> : (f.friend_name || '?').charAt(0).toUpperCase()}
            </div>
            <StatusDot status={status} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[14px] font-semibold truncate" style={{ color: colors.text.primary }}>{f.friend_name}</p>
              {profile?.badges?.includes('premium') && <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#c9b47b' }} />}
            </div>
            <p className="text-[12px] truncate" style={{ color: colors.text.muted }}>
              {customStatus?.text ? `${customStatus.emoji || ''} ${customStatus.text}`.trim()
                : activity?.name ? `${activity.type || 'Playing'} ${activity.name}`
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </p>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); onMessage(f); }}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <MessageSquare className="w-[18px] h-[18px]" style={{ color: colors.text.secondary }} />
            </button>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52 p-1.5 rounded-lg" style={{ background: colors.bg.float, border: `1px solid ${colors.border.strong}`, boxShadow: shadows.strong }}>
        <ContextMenuItem onClick={() => onMessage(f)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}>
          <MessageSquare className="w-4 h-4 opacity-50" /> Message
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onProfileClick?.(f.friend_id)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}>
          <Users className="w-4 h-4 opacity-50" /> View Profile
        </ContextMenuItem>
        <ContextMenuSeparator style={{ background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
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

function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="text-center py-20 k-fade-in">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <Icon className="w-7 h-7" style={{ color: colors.text.disabled, opacity: 0.5 }} />
      </div>
      <p className="text-[15px] font-semibold mb-1" style={{ color: colors.text.secondary }}>{title}</p>
      <p className="text-[13px] leading-relaxed mb-5 max-w-xs mx-auto" style={{ color: colors.text.muted }}>{subtitle}</p>
      {action}
    </div>
  );
}

function RequestCard({ r, type, onAccept, onDecline }) {
  const name = r.friend_name || r.created_by || 'User';
  const avatar = r.friend_avatar;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.border.default}` }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden flex-shrink-0"
        style={{ background: colors.bg.overlay, color: colors.text.muted }}>
        {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold truncate" style={{ color: colors.text.primary }}>{name}</p>
        <p className="text-[12px]" style={{ color: colors.text.muted }}>{type === 'incoming' ? 'Wants to be your friend' : 'Request sent'}</p>
      </div>
      {type === 'incoming' ? (
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => onAccept(r)} className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:brightness-110"
            style={{ background: 'rgba(59,165,93,0.15)' }}>
            <Check className="w-5 h-5" style={{ color: colors.success }} />
          </button>
          <button onClick={() => onDecline(r)} className="w-9 h-9 flex items-center justify-center rounded-full transition-colors hover:brightness-110"
            style={{ background: 'rgba(237,66,69,0.15)' }}>
            <X className="w-5 h-5" style={{ color: colors.danger }} />
          </button>
        </div>
      ) : (
        <Clock className="w-4 h-4 flex-shrink-0" style={{ color: colors.text.disabled }} />
      )}
    </div>
  );
}

export default function FriendsView({ friends, incomingRequests, outgoingRequests, onAddFriend, onMessage, onAccept, onDecline, onRemove, onBlock, onProfileClick, blocked = [] }) {
  const [tab, setTab] = useState('online');
  const [search, setSearch] = useState('');
  const { getProfile } = useProfiles();

  const blockedIds = useMemo(() => new Set((blocked || []).map(b => b.blocked_user_id)), [blocked]);

  const online = useMemo(() => (friends || []).filter(f => {
    if (blockedIds.has(f.friend_id)) return false;
    const p = getProfile(f.friend_id);
    return p?.is_online || p?.status === 'online' || p?.status === 'idle' || p?.status === 'dnd';
  }), [friends, getProfile, blockedIds]);

  const filtered = useMemo(() => {
    let list = tab === 'online' ? online : (friends || []);
    list = list.filter(f => !blockedIds.has(f.friend_id));
    if (search) list = list.filter(f => f.friend_name?.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [friends, online, tab, search, blockedIds]);

  const pendingCount = incomingRequests.length + outgoingRequests.length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header bar */}
      <div className="h-[52px] px-5 flex items-center gap-4 flex-shrink-0" style={{ borderBottom: `1px solid ${colors.border.default}` }}>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" style={{ color: colors.text.muted }} />
          <span className="text-[15px] font-bold" style={{ color: colors.text.primary }}>Friends</span>
        </div>
        <div className="w-px h-5" style={{ background: colors.border.default }} />
        <div className="flex gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors relative"
              style={{
                background: tab === t.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: tab === t.id ? colors.text.primary : colors.text.muted,
              }}>
              {t.label}
              {t.id === 'pending' && pendingCount > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                  style={{ background: colors.danger, color: '#fff' }}>{pendingCount}</span>
              )}
              {t.id === 'online' && <span className="ml-1 text-[11px] font-normal" style={{ color: colors.text.disabled }}>{online.length}</span>}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button onClick={onAddFriend}
          className="px-4 py-1.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-colors hover:opacity-90"
          style={{ background: '#fff', color: '#000' }}>
          <UserPlus className="w-4 h-4" /> Add Friend
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        <div className="max-w-2xl mx-auto w-full p-5 space-y-4">
          {/* Search */}
          {(tab === 'all' || tab === 'online') && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg" style={{ background: colors.bg.base, border: `1px solid ${colors.border.default}` }}>
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: colors.text.disabled }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search friends..."
                className="flex-1 bg-transparent text-[14px] outline-none" style={{ color: colors.text.primary }} />
              {search && (
                <button onClick={() => setSearch('')} className="p-0.5 rounded hover:bg-[rgba(255,255,255,0.06)]">
                  <X className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
                </button>
              )}
            </div>
          )}

          {/* All / Online tabs */}
          {(tab === 'all' || tab === 'online') && (
            <>
              <p className="text-[11px] font-bold uppercase tracking-widest px-1" style={{ color: colors.text.disabled }}>
                {tab === 'online' ? `Online — ${online.length}` : `All Friends — ${filtered.length}`}
              </p>
              {filtered.length === 0 ? (
                <EmptyState
                  icon={tab === 'online' ? Heart : Users}
                  title={tab === 'online' ? 'No friends online' : 'No friends yet'}
                  subtitle={tab === 'online' ? 'When your friends come online, they\'ll appear here.' : 'Add friends to start chatting and hanging out together.'}
                  action={tab === 'all' ? (
                    <button onClick={onAddFriend}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-colors hover:opacity-90"
                      style={{ background: '#fff', color: '#000' }}>
                      <UserPlus className="w-4 h-4" /> Add Your First Friend
                    </button>
                  ) : null}
                />
              ) : (
                <div className="space-y-0.5">
                  {filtered.map(f => (
                    <FriendCard key={f.id} f={f} onMessage={onMessage} onRemove={onRemove} onBlock={onBlock}
                      onProfileClick={onProfileClick} profile={getProfile(f.friend_id)} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Pending tab */}
          {tab === 'pending' && (
            <div className="space-y-3">
              {incomingRequests.length > 0 && (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-widest px-1" style={{ color: colors.text.disabled }}>
                    Incoming — {incomingRequests.length}
                  </p>
                  <div className="space-y-2">
                    {incomingRequests.map(r => <RequestCard key={r.id} r={r} type="incoming" onAccept={onAccept} onDecline={onDecline} />)}
                  </div>
                </>
              )}
              {outgoingRequests.length > 0 && (
                <>
                  <p className="text-[11px] font-bold uppercase tracking-widest px-1 mt-4" style={{ color: colors.text.disabled }}>
                    Outgoing — {outgoingRequests.length}
                  </p>
                  <div className="space-y-2">
                    {outgoingRequests.map(r => <RequestCard key={r.id} r={r} type="outgoing" onAccept={onAccept} onDecline={onDecline} />)}
                  </div>
                </>
              )}
              {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
                <EmptyState icon={Clock} title="No pending requests" subtitle="Friend requests you send or receive will show up here." />
              )}
            </div>
          )}

          {/* Blocked tab */}
          {tab === 'blocked' && (
            (blocked || []).length === 0 ? (
              <EmptyState icon={Ban} title="No blocked users" subtitle="Users you block won't be able to message you or see your status." />
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-widest px-1" style={{ color: colors.text.disabled }}>
                  Blocked — {blocked.length}
                </p>
                {(blocked || []).map(b => (
                  <div key={b.id} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.border.default}` }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(237,66,69,0.1)' }}>
                      <Ban className="w-4 h-4" style={{ color: colors.danger }} />
                    </div>
                    <span className="text-[14px] flex-1 truncate font-medium" style={{ color: colors.text.primary }}>{b.blocked_name || b.blocked_email || 'Blocked User'}</span>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Activity tab */}
          {tab === 'activity' && (
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest px-1" style={{ color: colors.text.disabled }}>Friend Activity</p>
              {(() => {
                const active = (friends || []).filter(f => {
                  const p = getProfile(f.friend_id);
                  return p?.rich_presence?.name || p?.is_online;
                }).slice(0, 15);
                if (active.length === 0) {
                  return <EmptyState icon={Activity} title="No active friends" subtitle="When friends are online or playing something, they'll appear here." />;
                }
                return (
                  <div className="space-y-1">
                    {active.map(f => {
                      const p = getProfile(f.friend_id);
                      return (
                        <div key={f.id} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-[rgba(255,255,255,0.03)] cursor-pointer"
                          onClick={() => onProfileClick?.(f.friend_id)}>
                          <div className="relative flex-shrink-0">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden"
                              style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                              {f.friend_avatar ? <img src={f.friend_avatar} className="w-full h-full object-cover" alt="" /> : (f.friend_name || '?').charAt(0).toUpperCase()}
                            </div>
                            <StatusDot status={p?.status || 'online'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-semibold truncate" style={{ color: colors.text.primary }}>{f.friend_name}</p>
                            <p className="text-[12px] truncate" style={{ color: colors.text.muted }}>
                              {p?.rich_presence?.name ? `${p.rich_presence.type || 'Playing'} ${p.rich_presence.name}` : 'Online'}
                            </p>
                          </div>
                          {p?.rich_presence?.name && (
                            <div className="px-2.5 py-1 rounded-full text-[10px] font-semibold" style={{ background: 'rgba(88,101,242,0.1)', color: colors.accent.primary }}>
                              {p.rich_presence.type || 'Playing'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}