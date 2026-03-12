import React, { useState } from 'react';
import { Search, Users, Plus, MessageSquare, BellOff, Copy, Bookmark, Pin, X } from 'lucide-react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { colors } from '@/components/app/design/tokens';
import { useProfiles } from '@/components/app/providers/ProfileProvider';

export default function DMSidebar({ conversations, activeId, onSelect, onFriends, onCreateGroup, onNoteToSelf, currentUserId, incomingRequestCount = 0, blockedUserIds = [] }) {
  const [search, setSearch] = useState('');
  const { getProfile } = useProfiles();
  const blockedSet = React.useMemo(() => new Set(blockedUserIds), [blockedUserIds]);

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
  const getStatus = (c) => {
    const other = c.participants?.find(p => p.user_id !== currentUserId);
    if (!other) return 'offline';
    const profile = getProfile(other.user_id);
    return profile?.status || 'offline';
  };
  const isGroup = (c) => c.type === 'group' && c.participants?.length > 2;

  const filtered = (conversations || []).filter(c => {
    if (c.type !== 'group' && blockedSet.size > 0) {
      const other = c.participants?.find(p => p.user_id !== currentUserId);
      if (other && blockedSet.has(other.user_id)) return false;
    }
    if (search && !getLabel(c).toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Search */}
      <div className="h-12 px-2.5 flex items-center flex-shrink-0" style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.2), 0 1.5px 0 rgba(0,0,0,0.06)' }}>
        <div className="flex-1 flex items-center gap-2 px-2 py-1 rounded" style={{ background: colors.bg.base }}>
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: colors.text.disabled }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find or start a conversation"
            className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: colors.text.primary }} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-2 pt-2 pb-1 space-y-px">
        <button onClick={onFriends} className="w-full flex items-center gap-3 px-2 py-[7px] rounded text-[15px] transition-colors hover:bg-[rgba(255,255,255,0.04)] relative"
          style={{ color: colors.text.secondary, fontWeight: 500 }}>
          <Users className="w-5 h-5" style={{ color: colors.text.disabled }} /> Friends
          {incomingRequestCount > 0 && (
            <span className="absolute right-2 min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold flex items-center justify-center" style={{ background: colors.danger, color: '#fff' }}>{incomingRequestCount}</span>
          )}
        </button>
        <button onClick={onCreateGroup} className="w-full flex items-center gap-3 px-2 py-[7px] rounded text-[15px] transition-colors hover:bg-[rgba(255,255,255,0.04)]"
          style={{ color: colors.text.secondary, fontWeight: 500 }}>
          <Plus className="w-5 h-5" style={{ color: colors.text.disabled }} /> New Group
        </button>
        <button onClick={onNoteToSelf} className="w-full flex items-center gap-3 px-2 py-[7px] rounded text-[15px] transition-colors hover:bg-[rgba(255,255,255,0.04)]"
          style={{ color: colors.text.secondary, fontWeight: 500 }}>
          <Bookmark className="w-5 h-5" style={{ color: colors.text.disabled }} /> Note to Self
        </button>
      </div>

      {/* Label */}
      <div className="px-4 pt-4 pb-1">
        <span className="text-[12px] font-bold uppercase tracking-[0.02em]" style={{ color: colors.text.muted }}>Direct Messages</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-2 space-y-px">
        {filtered.map(c => {
          const label = getLabel(c);
          const avatar = getAvatar(c);
          const active = activeId === c.id;
          const group = isGroup(c);
          const status = getStatus(c);
          const statusColor = colors.status[status] || colors.status.offline;
          return (
            <ContextMenu key={c.id}>
              <ContextMenuTrigger>
                <button onClick={() => onSelect(c)}
                  className="w-full flex items-center gap-2.5 px-2 py-[6px] rounded transition-colors group"
                  style={{ background: active ? 'rgba(255,255,255,0.08)' : 'transparent' }}>
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold overflow-hidden"
                      style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                      {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : group ? <Users className="w-4 h-4" /> : label.charAt(0).toUpperCase()}
                    </div>
                    {!group && <div className="absolute -bottom-0.5 -right-0.5 w-[12px] h-[12px] rounded-full border-[2.5px]" style={{ background: statusColor, borderColor: colors.bg.surface }} />}
                    {group && <span className="absolute -bottom-1 -right-1 text-[8px] font-bold px-1 rounded-full" style={{ background: colors.bg.surface, color: colors.text.muted }}>{c.participants?.length}</span>}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-[15px] truncate" style={{ color: active ? colors.text.primary : colors.text.secondary, fontWeight: active ? 500 : 400 }}>{label}</div>
                    {c.last_message_preview && (
                      <div className="text-[12px] truncate" style={{ color: colors.text.muted }}>{c.last_message_preview}</div>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <X className="w-4 h-4" style={{ color: colors.text.disabled }} />
                  </div>
                </button>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-52 p-1.5 rounded-lg" style={{ background: colors.bg.float, border: `1px solid ${colors.border.strong}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
                <ContextMenuItem onClick={() => onSelect(c)} className="text-[13px] gap-2 rounded-sm px-2 py-1.5" style={{ color: colors.text.secondary }}>
                  <MessageSquare className="w-4 h-4 opacity-50" /> Open
                </ContextMenuItem>
                <ContextMenuItem className="text-[13px] gap-2 rounded-sm px-2 py-1.5" style={{ color: colors.text.secondary }}>
                  <Pin className="w-4 h-4 opacity-50" /> Pin
                </ContextMenuItem>
                <ContextMenuItem onClick={() => navigator.clipboard.writeText(c.id)} className="text-[13px] gap-2 rounded-sm px-2 py-1.5" style={{ color: colors.text.secondary }}>
                  <Copy className="w-4 h-4 opacity-50" /> Copy ID
                </ContextMenuItem>
                <ContextMenuSeparator style={{ background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                <ContextMenuItem className="text-[13px] gap-2 rounded-sm px-2 py-1.5" style={{ color: colors.text.secondary }}>
                  <BellOff className="w-4 h-4 opacity-50" /> Mute
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 px-4 k-fade-in">
            <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: colors.text.disabled, opacity: 0.3 }} />
            <p className="text-[14px] font-medium mb-1" style={{ color: colors.text.secondary }}>
              {search ? 'No results found' : 'No conversations yet'}
            </p>
            <p className="text-[12px]" style={{ color: colors.text.muted }}>
              {search ? 'Try a different search term' : 'Start a conversation with friends or create a group'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}