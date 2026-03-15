import React, { useState, useMemo, useCallback } from 'react';
import { Search, Users, Plus, MessageSquare, BellOff, Bell, Copy, Bookmark, Pin, X, MoreHorizontal, Ban, CheckCheck, Lock, Inbox } from 'lucide-react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { useProfiles } from '@/components/app/providers/ProfileProvider';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', success: '#34d399', danger: '#f87171', warning: '#fbbf24',
};

const statusColors = { online: '#3ba55c', idle: '#faa61a', dnd: '#ed4245', invisible: '#747f8d', offline: '#747f8d' };

function StatusRing({ status, size = 32, children }) {
  const color = statusColors[status] || statusColors.offline;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {children}
      <div className="absolute -bottom-0.5 -right-0.5 rounded-full"
        style={{ width: size * 0.34, height: size * 0.34, background: color, border: `2.5px solid ${P.surface}` }} />
    </div>
  );
}

function StackedAvatars({ participants, size = 32 }) {
  const shown = participants.slice(0, 3);
  const avatarSize = size * 0.6;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {shown.map((p, i) => {
        const offset = i * (avatarSize * 0.35);
        return (
          <div key={p.user_id || i} className="absolute rounded-full overflow-hidden flex items-center justify-center"
            style={{
              width: avatarSize, height: avatarSize,
              top: i === 0 ? 0 : i === 1 ? avatarSize * 0.35 : avatarSize * 0.15,
              left: i === 0 ? 0 : i === 1 ? avatarSize * 0.5 : avatarSize * 0.25,
              zIndex: 3 - i, background: P.elevated,
              border: `1.5px solid ${P.surface}`,
              fontSize: avatarSize * 0.45, fontWeight: 600, color: P.muted,
            }}>
            {p.avatar ? <img src={p.avatar} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} /> : (p.user_name || '?').charAt(0).toUpperCase()}
          </div>
        );
      })}
    </div>
  );
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export default function DMSidebar({
  conversations, activeId, onSelect, onFriends, onCreateGroup, onNoteToSelf,
  currentUserId, incomingRequestCount = 0, blockedUserIds = [],
  onBlock, onCloseDM, friendIds = [],
}) {
  const [search, setSearch] = useState('');
  const { getProfile } = useProfiles();
  const blockedSet = useMemo(() => new Set(blockedUserIds), [blockedUserIds]);
  const friendSet = useMemo(() => new Set(friendIds), [friendIds]);

  const [pinnedIds, setPinnedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`kairo-pinned-dms-${currentUserId}`) || '[]'); } catch { return []; }
  });
  const [mutedIds, setMutedIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`kairo-muted-dms-${currentUserId}`) || '[]'); } catch { return []; }
  });
  const [readMap, setReadMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`kairo-dm-read-${currentUserId}`) || '{}'); } catch { return {}; }
  });

  const persistPinned = useCallback((ids) => {
    setPinnedIds(ids);
    try { localStorage.setItem(`kairo-pinned-dms-${currentUserId}`, JSON.stringify(ids)); } catch {}
  }, [currentUserId]);

  const persistMuted = useCallback((ids) => {
    setMutedIds(ids);
    try { localStorage.setItem(`kairo-muted-dms-${currentUserId}`, JSON.stringify(ids)); } catch {}
  }, [currentUserId]);

  const markAsRead = useCallback((convId) => {
    const updated = { ...readMap, [convId]: new Date().toISOString() };
    setReadMap(updated);
    try { localStorage.setItem(`kairo-dm-read-${currentUserId}`, JSON.stringify(updated)); } catch {}
  }, [readMap, currentUserId]);

  const togglePin = useCallback((convId) => {
    persistPinned(pinnedIds.includes(convId) ? pinnedIds.filter(id => id !== convId) : [...pinnedIds, convId]);
  }, [pinnedIds, persistPinned]);

  const toggleMute = useCallback((convId) => {
    persistMuted(mutedIds.includes(convId) ? mutedIds.filter(id => id !== convId) : [...mutedIds, convId]);
  }, [mutedIds, persistMuted]);

  const getLabel = (c) => {
    if (c.name) return c.name;
    const other = c.participants?.find(p => p.user_id !== currentUserId);
    return other?.user_name || other?.user_email?.split('@')[0] || 'DM';
  };
  const getAvatar = (c) => {
    if (c.icon_url) return c.icon_url;
    const other = c.participants?.find(p => p.user_id !== currentUserId);
    return other?.avatar;
  };
  const getOtherUserId = (c) => {
    const other = c.participants?.find(p => p.user_id !== currentUserId);
    return other?.user_id;
  };
  const getStatus = (c) => {
    const other = c.participants?.find(p => p.user_id !== currentUserId);
    if (!other) return 'offline';
    const profile = getProfile(other.user_id);
    return profile?.status || 'offline';
  };
  const isGroup = (c) => c.type === 'group' && c.participants?.length > 2;
  const isNoteToSelf = (c) => c.name === 'Note to Self' || (c.participants?.length === 1 && c.participants[0]?.user_id === currentUserId);
  const isUnread = (c) => {
    if (!c.last_message_at) return false;
    const lastRead = readMap[c.id];
    if (!lastRead) return !!c.last_message_preview;
    return new Date(c.last_message_at) > new Date(lastRead);
  };

  const filtered = useMemo(() => {
    let list = (conversations || []).filter(c => {
      if (c.type !== 'group' && blockedSet.size > 0) {
        const otherId = getOtherUserId(c);
        if (otherId && blockedSet.has(otherId)) return false;
      }
      if (search && !getLabel(c).toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    list.sort((a, b) => new Date(b.last_message_at || 0) - new Date(a.last_message_at || 0));
    return list;
  }, [conversations, blockedSet, search, currentUserId]);

  const requests = useMemo(() => {
    return filtered.filter(c => {
      if (isGroup(c) || isNoteToSelf(c)) return false;
      const otherId = getOtherUserId(c);
      return otherId && !friendSet.has(otherId);
    });
  }, [filtered, friendSet]);

  const requestIds = useMemo(() => new Set(requests.map(r => r.id)), [requests]);

  const pinned = useMemo(() => filtered.filter(c => pinnedIds.includes(c.id) && !requestIds.has(c.id)), [filtered, pinnedIds, requestIds]);
  const regular = useMemo(() => filtered.filter(c => !pinnedIds.includes(c.id) && !requestIds.has(c.id)), [filtered, pinnedIds, requestIds]);

  const handleSelect = (c) => {
    markAsRead(c.id);
    onSelect(c);
  };

  const renderConvRow = (c) => {
    const label = getLabel(c);
    const avatar = getAvatar(c);
    const active = activeId === c.id;
    const group = isGroup(c);
    const noteToSelf = isNoteToSelf(c);
    const status = getStatus(c);
    const unread = isUnread(c) && !active;
    const muted = mutedIds.includes(c.id);
    const isPinned = pinnedIds.includes(c.id);
    const otherParticipants = group ? (c.participants || []).filter(p => p.user_id !== currentUserId) : [];

    return (
      <ContextMenu key={c.id}>
        <ContextMenuTrigger>
          <button onClick={() => handleSelect(c)}
            className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg transition-all group"
            style={{
              background: active ? `${P.accent}14` : unread ? 'rgba(255,255,255,0.03)' : 'transparent',
            }}>
            {/* Avatar */}
            {group ? (
              <StackedAvatars participants={otherParticipants} size={36} />
            ) : noteToSelf ? (
              <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `${P.accent}20` }}>
                <Bookmark className="w-4 h-4" style={{ color: P.accent }} />
              </div>
            ) : (
              <StatusRing status={status} size={36}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-semibold overflow-hidden"
                  style={{ background: P.elevated, color: P.muted }}>
                  {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} /> : label.charAt(0).toUpperCase()}
                </div>
              </StatusRing>
            )}

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] truncate" style={{
                  color: active ? P.textPrimary : unread ? P.textPrimary : muted ? P.muted : P.textSecondary,
                  fontWeight: unread ? 600 : active ? 500 : 400,
                }}>{label}</span>
                {group && <span className="text-[11px] flex-shrink-0" style={{ color: P.muted }}>{c.participants?.length}</span>}
              </div>
              {c.last_message_preview && (
                <p className="text-[11px] truncate mt-0.5" style={{ color: muted ? `${P.muted}88` : P.muted }}>
                  {c.last_message_preview}
                </p>
              )}
            </div>

            {/* Right side: timestamp + indicators */}
            <div className="flex flex-col items-end gap-0.5 flex-shrink-0 min-w-[36px]">
              {c.last_message_at && (
                <span className="text-[11px]" style={{ color: unread ? P.accent : P.muted }}>
                  {formatTime(c.last_message_at)}
                </span>
              )}
              <div className="flex items-center gap-1">
                {unread && !muted && (
                  <div className="w-2 h-2 rounded-full" style={{ background: P.accent }} />
                )}
                {muted && <BellOff className="w-2.5 h-2.5" style={{ color: P.muted, opacity: 0.5 }} />}
              </div>
            </div>
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52 p-1.5 rounded-xl" style={{ background: P.floating, border: `1px solid ${P.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
          <ContextMenuItem onClick={() => markAsRead(c.id)} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.textSecondary }}>
            <CheckCheck className="w-4 h-4 opacity-50" /> Mark as Read
          </ContextMenuItem>
          <ContextMenuItem onClick={() => toggleMute(c.id)} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.textSecondary }}>
            {muted ? <Bell className="w-4 h-4 opacity-50" /> : <BellOff className="w-4 h-4 opacity-50" />}
            {muted ? 'Unmute' : 'Mute'}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => togglePin(c.id)} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.textSecondary }}>
            <Pin className="w-4 h-4 opacity-50" /> {isPinned ? 'Unpin' : 'Pin to Top'}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => navigator.clipboard.writeText(c.id)} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.textSecondary }}>
            <Copy className="w-4 h-4 opacity-50" /> Copy ID
          </ContextMenuItem>
          <ContextMenuSeparator style={{ background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
          {onCloseDM && (
            <ContextMenuItem onClick={() => onCloseDM(c)} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.textSecondary }}>
              <X className="w-4 h-4 opacity-50" /> Close DM
            </ContextMenuItem>
          )}
          {!group && !noteToSelf && onBlock && (
            <ContextMenuItem onClick={() => { const otherId = getOtherUserId(c); if (otherId) onBlock({ friend_id: otherId, friend_name: getLabel(c) }); }}
              className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.danger }}>
              <Ban className="w-4 h-4 opacity-50" /> Block User
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Search */}
      <div className="h-12 px-2.5 flex items-center flex-shrink-0" style={{ borderBottom: `1px solid ${P.border}` }}>
        <div className="flex-1 flex items-center gap-1.5 px-2.5 py-[6px] rounded-lg"
          style={{ background: P.base }}>
          <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: P.muted }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a conversation"
            className="flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#68677a]"
            style={{ color: P.textPrimary }} />
          {search && (
            <button onClick={() => setSearch('')} className="p-0.5 rounded hover:bg-[rgba(255,255,255,0.06)]">
              <X className="w-3 h-3" style={{ color: P.muted }} />
            </button>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-2 pt-2 pb-1 space-y-0.5">
        <button onClick={onFriends}
          className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.04)] relative"
          style={{ color: P.textSecondary }}>
          <Users className="w-4 h-4" style={{ color: P.muted }} /> Friends
          {incomingRequestCount > 0 && (
            <span className="absolute right-2 min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold flex items-center justify-center"
              style={{ background: P.danger, color: '#fff' }}>{incomingRequestCount}</span>
          )}
        </button>
        <button onClick={onCreateGroup}
          className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.04)]"
          style={{ color: P.textSecondary }}>
          <Plus className="w-4 h-4" style={{ color: P.muted }} /> New Group
        </button>
        <button onClick={onNoteToSelf}
          className="w-full flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg text-[13px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.04)]"
          style={{ color: P.textSecondary }}>
          <Bookmark className="w-4 h-4" style={{ color: P.muted }} /> Note to Self
        </button>
      </div>

      {/* DM Requests folder */}
      {requests.length > 0 && (
        <div className="px-2 mb-1">
          <div className="px-2.5 py-2 rounded-lg flex items-center gap-2.5 cursor-pointer hover:bg-[rgba(255,255,255,0.03)]"
            style={{ background: `${P.warning}08`, border: `1px solid ${P.warning}20` }}>
            <Inbox className="w-4 h-4" style={{ color: P.warning }} />
            <span className="text-[13px] font-medium flex-1" style={{ color: P.warning }}>Message Requests</span>
            <span className="min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold flex items-center justify-center"
              style={{ background: P.warning, color: '#fff' }}>{requests.length}</span>
          </div>
          <div className="mt-1 space-y-px">
            {requests.slice(0, 3).map(renderConvRow)}
            {requests.length > 3 && (
              <p className="text-[11px] text-center py-1" style={{ color: P.muted }}>+{requests.length - 3} more</p>
            )}
          </div>
        </div>
      )}

      {/* Pinned DMs */}
      {pinned.length > 0 && (
        <div className="px-2 mb-0.5">
          <div className="px-2.5 py-1">
            <span className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-1 truncate" style={{ color: P.muted }}>
              <Pin className="w-2.5 h-2.5" /> Pinned
            </span>
          </div>
          <div className="space-y-px">
            {pinned.map(renderConvRow)}
          </div>
        </div>
      )}

      {/* Direct Messages label */}
      <div className="px-4 pt-2.5 pb-1">
        <span className="text-[11px] font-bold uppercase tracking-widest truncate" style={{ color: P.muted }}>
          Direct Messages
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-2 space-y-px pb-2">
        {regular.map(renderConvRow)}
        {regular.length === 0 && !search && (
          <div className="text-center py-12 px-4 k-fade-in">
            <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: P.muted, opacity: 0.2 }} />
            <p className="text-[14px] font-medium mb-1" style={{ color: P.textSecondary }}>No conversations yet</p>
            <p className="text-[12px] leading-relaxed" style={{ color: P.muted }}>
              Start a conversation with friends or create a group
            </p>
          </div>
        )}
        {regular.length === 0 && search && (
          <div className="text-center py-12 px-4 k-fade-in">
            <Search className="w-8 h-8 mx-auto mb-2" style={{ color: P.muted, opacity: 0.2 }} />
            <p className="text-[13px] font-medium" style={{ color: P.textSecondary }}>No results found</p>
            <p className="text-[12px]" style={{ color: P.muted }}>Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
