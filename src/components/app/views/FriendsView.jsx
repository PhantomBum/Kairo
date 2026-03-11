import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Check, X, MessageSquare, Trash2, Clock, Search, Ban, FolderPlus, Tag, Activity, Sparkles, UserX } from 'lucide-react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';

const statusColors = { online: '#7bc9a4', idle: '#c9b47b', dnd: '#c97b7b', invisible: '#555248', offline: '#555248' };
const TABS = ['all', 'online', 'pending', 'blocked', 'activity'];
const DEFAULT_CATEGORIES = ['Close Friends', 'Gaming', 'Work', 'School'];

function FriendRow({ f, onMessage, onRemove, onBlock, onProfileClick, profile }) {
  const status = profile?.status || 'offline';
  const customStatus = profile?.custom_status;
  const activity = profile?.rich_presence;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl group transition-colors hover:bg-[var(--bg-glass)]">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>
              {f.friend_avatar ? <img src={f.friend_avatar} className="w-full h-full object-cover" /> : (f.friend_name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2" style={{ background: statusColors[status], borderColor: 'var(--bg-base)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text-cream)' }}>{f.friend_name}</p>
              {profile?.badges?.includes('premium') && <Sparkles className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent-amber)' }} />}
            </div>
            <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
              {customStatus?.text ? `${customStatus.emoji || ''} ${customStatus.text}` : activity?.name ? `${activity.type || 'Playing'} ${activity.name}` : status === 'offline' && profile?.last_seen ? `Last seen ${new Date(profile.last_seen).toLocaleDateString()}` : status}
            </p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onMessage(f)} className="p-2 rounded-lg hover:bg-[var(--bg-glass-hover)]"><MessageSquare className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /></button>
            <button onClick={() => onProfileClick?.(f.friend_id)} className="p-2 rounded-lg hover:bg-[var(--bg-glass-hover)]"><Users className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /></button>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 p-1 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }}>
        <ContextMenuItem onClick={() => onMessage(f)} className="text-[12px] gap-2 rounded-lg px-2.5 py-1.5" style={{ color: 'var(--text-secondary)' }}>
          <MessageSquare className="w-3.5 h-3.5 opacity-50" /> Message
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onProfileClick?.(f.friend_id)} className="text-[12px] gap-2 rounded-lg px-2.5 py-1.5" style={{ color: 'var(--text-secondary)' }}>
          <Users className="w-3.5 h-3.5 opacity-50" /> View Profile
        </ContextMenuItem>
        <ContextMenuSeparator style={{ background: 'var(--border)' }} />
        <ContextMenuItem onClick={() => onRemove(f)} className="text-[12px] gap-2 rounded-lg px-2.5 py-1.5" style={{ color: 'var(--accent-red)' }}>
          <UserX className="w-3.5 h-3.5 opacity-50" /> Remove Friend
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onBlock?.(f)} className="text-[12px] gap-2 rounded-lg px-2.5 py-1.5" style={{ color: 'var(--accent-red)' }}>
          <Ban className="w-3.5 h-3.5 opacity-50" /> Block
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
      <div className="h-12 px-4 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <Users className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <span className="text-[14px] font-semibold" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Friends</span>
        <div className="flex gap-0.5 ml-3">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className="px-2.5 py-1 rounded-lg text-[11px] transition-colors capitalize relative"
              style={{ background: tab === t ? 'var(--bg-glass-active)' : 'transparent', color: tab === t ? 'var(--text-cream)' : 'var(--text-muted)' }}>
              {t}
              {t === 'pending' && pendingBadge > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 rounded-full text-[8px] font-bold flex items-center justify-center" style={{ background: 'var(--accent-red)', color: '#fff' }}>{pendingBadge}</span>
              )}
              {t === 'online' && <span className="ml-1 text-[9px]" style={{ color: 'var(--text-faint)' }}>{online.length}</span>}
            </button>
          ))}
        </div>
        <button onClick={onAddFriend} className="ml-auto px-3 py-1.5 rounded-xl text-[11px] font-medium flex items-center gap-1.5"
          style={{ background: 'var(--accent-green)', color: '#000' }}>
          <UserPlus className="w-3 h-3" /> Add Friend
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-none">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
          <Search className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search friends..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-faint)]" style={{ color: 'var(--text-primary)' }} />
        </div>

        {tab === 'pending' && (
          <div className="space-y-2">
            {incomingRequests.length > 0 && <p className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1 pb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Incoming — {incomingRequests.length}</p>}
            {incomingRequests.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: 'var(--bg-glass)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>
                  {r.friend_avatar ? <img src={r.friend_avatar} className="w-full h-full object-cover" /> : (r.friend_name || r.created_by || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-cream)' }}>{r.friend_name || r.created_by}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Incoming friend request</p>
                </div>
                <button onClick={() => onAccept(r)} className="p-2 rounded-lg hover:bg-[var(--bg-glass-hover)]"><Check className="w-4 h-4" style={{ color: 'var(--accent-green)' }} /></button>
                <button onClick={() => onDecline(r)} className="p-2 rounded-lg hover:bg-[var(--bg-glass-hover)]"><X className="w-4 h-4" style={{ color: 'var(--accent-red)' }} /></button>
              </div>
            ))}
            {outgoingRequests.length > 0 && <p className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1 py-1 mt-3" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Outgoing — {outgoingRequests.length}</p>}
            {outgoingRequests.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: 'var(--bg-glass)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>
                  {r.friend_avatar ? <img src={r.friend_avatar} className="w-full h-full object-cover" /> : (r.friend_name || '?').charAt(0).toUpperCase()}
                </div>
                <div className="flex-1"><p className="text-[13px]" style={{ color: 'var(--text-primary)' }}>{r.friend_name}</p><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Request sent</p></div>
                <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
              </div>
            ))}
            {incomingRequests.length === 0 && outgoingRequests.length === 0 && <p className="text-center py-8 text-[12px]" style={{ color: 'var(--text-muted)' }}>No pending requests</p>}
          </div>
        )}

        {tab === 'blocked' && (
          <div className="space-y-2">
            {(blocked || []).length === 0 ? (
              <p className="text-center py-8 text-[12px]" style={{ color: 'var(--text-muted)' }}>No blocked users</p>
            ) : (blocked || []).map(b => (
              <div key={b.id} className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: 'var(--bg-glass)' }}>
                <Ban className="w-4 h-4" style={{ color: 'var(--accent-red)' }} />
                <span className="text-[13px] flex-1" style={{ color: 'var(--text-primary)' }}>{b.friend_name || b.friend_email}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'activity' && (
          <div className="space-y-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Friend Activity</p>
            {(friends || []).slice(0, 10).map(f => {
              const p = getProfile(f.friend_id);
              if (!p?.rich_presence?.name && !p?.is_online) return null;
              return (
                <div key={f.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'var(--bg-glass)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>
                    {f.friend_avatar ? <img src={f.friend_avatar} className="w-full h-full object-cover" /> : (f.friend_name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate" style={{ color: 'var(--text-cream)' }}>{f.friend_name}</p>
                    <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                      {p?.rich_presence?.name ? `${p.rich_presence.type || 'Playing'} ${p.rich_presence.name}` : 'Online'}
                    </p>
                  </div>
                  <Activity className="w-3 h-3" style={{ color: 'var(--accent-green)' }} />
                </div>
              );
            }).filter(Boolean)}
            {(friends || []).filter(f => { const p = getProfile(f.friend_id); return p?.rich_presence?.name || p?.is_online; }).length === 0 && (
              <p className="text-center py-8 text-[12px]" style={{ color: 'var(--text-muted)' }}>No active friends right now</p>
            )}

            {/* Suggested Friends */}
            {suggestedFriends.length > 0 && <>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1 mt-4" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Suggested</p>
              {suggestedFriends.map(s => (
                <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'var(--bg-glass)' }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>
                    {s.avatar_url ? <img src={s.avatar_url} className="w-full h-full object-cover" /> : (s.display_name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium truncate" style={{ color: 'var(--text-cream)' }}>{s.display_name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>From mutual servers</p>
                  </div>
                  <UserPlus className="w-3.5 h-3.5" style={{ color: 'var(--accent-blue)' }} />
                </div>
              ))}
            </>}
          </div>
        )}

        {(tab === 'all' || tab === 'online') && (
          <div className="space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1 pb-2" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {tab === 'online' ? `Online — ${online.length}` : `All Friends — ${filtered.length}`}
            </p>
            {filtered.length === 0 && <p className="text-center py-8 text-[12px]" style={{ color: 'var(--text-muted)' }}>{tab === 'online' ? 'No friends online' : 'No friends yet. Add some!'}</p>}
            {filtered.map(f => (
              <FriendRow key={f.id} f={f} onMessage={onMessage} onRemove={onRemove} onBlock={onBlock} onProfileClick={onProfileClick} profile={getProfile(f.friend_id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}