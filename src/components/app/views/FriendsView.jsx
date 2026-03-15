import React, { useState, useMemo, useCallback } from 'react';
import { Users, UserPlus, Check, X, MessageSquare, Clock, Search, Ban, Activity, Sparkles, UserX, Heart, MoreHorizontal, Folder, FolderPlus, ChevronDown, ChevronRight, GripVertical, Mic, Gamepad2 } from 'lucide-react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', success: '#34d399', danger: '#f87171', warning: '#fbbf24',
};

const statusColors = { online: '#3ba55c', idle: '#faa61a', dnd: '#ed4245', invisible: '#747f8d', offline: '#747f8d' };

const TABS = [
  { id: 'online', label: 'Online' },
  { id: 'all', label: 'All' },
  { id: 'received', label: 'Received' },
  { id: 'sent', label: 'Sent' },
  { id: 'blocked', label: 'Blocked' },
  { id: 'activity', label: 'Activity' },
];

function StatusDot({ status, size = 14 }) {
  const c = statusColors[status] || statusColors.offline;
  return <div className="absolute rounded-full" style={{ width: size, height: size, bottom: -1, right: -1, background: c, border: `3px solid ${P.elevated}` }} />;
}

function FriendCard({ f, onMessage, onRemove, onBlock, onProfileClick, profile, category, onSetCategory, categories }) {
  const status = profile?.status || 'offline';
  const customStatus = profile?.custom_status;
  const activity = profile?.rich_presence;
  const [showMore, setShowMore] = useState(false);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl group transition-all hover:bg-[rgba(255,255,255,0.03)] cursor-pointer"
          onClick={() => onProfileClick?.(f.friend_id)}>
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden"
              style={{ background: P.base, color: P.muted }}>
              {f.friend_avatar ? <img src={f.friend_avatar} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} /> : (f.friend_name || '?').charAt(0).toUpperCase()}
            </div>
            <StatusDot status={status} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[14px] font-semibold truncate" style={{ color: P.textPrimary }}>{f.friend_name}</p>
              {profile?.badges?.includes('premium') && <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#f0b232' }} />}
            </div>
            <p className="text-[12px] truncate" style={{ color: P.muted }}>
              {customStatus?.text ? `${customStatus.emoji || ''} ${customStatus.text}`.trim()
                : activity?.name ? `${activity.type || 'Playing'} ${activity.name}`
                : status.charAt(0).toUpperCase() + status.slice(1)}
            </p>
          </div>
          <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); onMessage(f); }}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)' }} title="Message">
              <MessageSquare className="w-[17px] h-[17px]" style={{ color: P.textSecondary }} />
            </button>
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setShowMore(!showMore); }}
                className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)' }} title="More">
                <MoreHorizontal className="w-[17px] h-[17px]" style={{ color: P.textSecondary }} />
              </button>
              {showMore && (
                <>
                  <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setShowMore(false); }} />
                  <div className="absolute right-0 top-full mt-1 w-44 rounded-xl overflow-hidden z-50 k-fade-in"
                    style={{ background: P.floating, border: `1px solid ${P.border}`, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                    <button onClick={(e) => { e.stopPropagation(); onRemove(f); setShowMore(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left hover:bg-[rgba(255,255,255,0.04)]"
                      style={{ color: P.danger }}>
                      <UserX className="w-3.5 h-3.5" /> Remove Friend
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onBlock?.(f); setShowMore(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left hover:bg-[rgba(255,255,255,0.04)]"
                      style={{ color: P.danger }}>
                      <Ban className="w-3.5 h-3.5" /> Block
                    </button>
                    {categories?.length > 0 && (
                      <>
                        <div className="h-px mx-2 my-1" style={{ background: P.border }} />
                        {categories.map(cat => (
                          <button key={cat} onClick={(e) => { e.stopPropagation(); onSetCategory?.(f.friend_id, cat); setShowMore(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left hover:bg-[rgba(255,255,255,0.04)]"
                            style={{ color: P.textSecondary }}>
                            <Folder className="w-3.5 h-3.5 opacity-50" /> {category === cat ? `✓ ${cat}` : cat}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52 p-1.5 rounded-xl" style={{ background: P.floating, border: `1px solid ${P.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
        <ContextMenuItem onClick={() => onMessage(f)} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.textSecondary }}>
          <MessageSquare className="w-4 h-4 opacity-50" /> Message
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onProfileClick?.(f.friend_id)} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.textSecondary }}>
          <Users className="w-4 h-4 opacity-50" /> View Profile
        </ContextMenuItem>
        <ContextMenuSeparator style={{ background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
        <ContextMenuItem onClick={() => onRemove(f)} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.danger }}>
          <UserX className="w-4 h-4 opacity-50" /> Remove Friend
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onBlock?.(f)} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.danger }}>
          <Ban className="w-4 h-4 opacity-50" /> Block
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function RequestCard({ r, type, onAccept, onDecline, onCancel }) {
  const name = r.friend_name || r.created_by || 'User';
  const avatar = r.friend_avatar;
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-[rgba(255,255,255,0.02)]"
      style={{ background: 'rgba(255,255,255,0.015)', border: `1px solid ${P.border}` }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden flex-shrink-0"
        style={{ background: P.base, color: P.muted }}>
        {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} /> : name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold truncate" style={{ color: P.textPrimary }}>{name}</p>
        <p className="text-[12px]" style={{ color: P.muted }}>
          {type === 'incoming' ? 'Wants to be your friend' : 'Request sent'}
        </p>
      </div>
      {type === 'incoming' ? (
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={() => onAccept(r)} className="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:scale-105"
            style={{ background: `${P.success}20` }} title="Accept">
            <Check className="w-5 h-5" style={{ color: P.success }} />
          </button>
          <button onClick={() => onDecline(r)} className="w-9 h-9 flex items-center justify-center rounded-full transition-all hover:scale-105"
            style={{ background: `${P.danger}20` }} title="Decline">
            <X className="w-5 h-5" style={{ color: P.danger }} />
          </button>
        </div>
      ) : (
        <button onClick={() => onCancel?.(r)} className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.06)]"
          style={{ color: P.muted, border: `1px solid ${P.border}` }}>
          Cancel
        </button>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="text-center py-20 k-fade-in">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
        style={{ background: `${P.accent}08` }}>
        <Icon className="w-7 h-7" style={{ color: P.muted, opacity: 0.4 }} />
      </div>
      <p className="text-[15px] font-semibold mb-1" style={{ color: P.textSecondary }}>{title}</p>
      <p className="text-[13px] leading-relaxed mb-5 max-w-xs mx-auto" style={{ color: P.muted }}>{subtitle}</p>
      {action}
    </div>
  );
}

function CategorySection({ name, friends, expanded, onToggle, children }) {
  return (
    <div className="mb-2">
      <button onClick={onToggle} className="flex items-center gap-1.5 px-1 py-1 group w-full">
        {expanded ? <ChevronDown className="w-3 h-3" style={{ color: P.muted }} /> : <ChevronRight className="w-3 h-3" style={{ color: P.muted }} />}
        <span className="text-[11px] font-bold uppercase tracking-widest truncate" style={{ color: P.muted }}>{name}</span>
        <span className="text-[11px] ml-1" style={{ color: P.muted, opacity: 0.6 }}>{friends.length}</span>
      </button>
      {expanded && <div className="space-y-0.5">{children}</div>}
    </div>
  );
}

function SuggestedFriends({ friends, onAddFriend, onProfileClick, getProfile }) {
  const friendIds = useMemo(() => new Set((friends || []).map(f => f.friend_id)), [friends]);
  const [suggestions, setSuggestions] = useState([]);
  const [dismissed, setDismissed] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('kairo-dismissed-suggestions') || '[]')); } catch { return new Set(); }
  });

  React.useEffect(() => {
    const allProfiles = [];
    (friends || []).forEach(f => {
      const p = getProfile(f.friend_id);
      if (p?.mutual_servers) {
        p.mutual_servers.forEach(s => {
          if (!friendIds.has(s.user_id) && !dismissed.has(s.user_id)) {
            allProfiles.push({ user_id: s.user_id, name: s.display_name || s.user_name, avatar: s.avatar_url, mutual: f.friend_name });
          }
        });
      }
    });
    setSuggestions(allProfiles.slice(0, 8));
  }, [friends, friendIds, dismissed, getProfile]);

  const dismiss = (userId) => {
    setDismissed(prev => {
      const next = new Set(prev);
      next.add(userId);
      try { localStorage.setItem('kairo-dismissed-suggestions', JSON.stringify([...next])); } catch {}
      return next;
    });
    setSuggestions(prev => prev.filter(s => s.user_id !== userId));
  };

  if (suggestions.length === 0) return null;
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-bold uppercase tracking-widest px-1 truncate" style={{ color: P.muted }}>Suggested Friends</p>
      <div className="space-y-1">
        {suggestions.map(s => (
          <div key={s.user_id} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-[rgba(255,255,255,0.03)]">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden flex-shrink-0 cursor-pointer"
              onClick={() => onProfileClick?.(s.user_id)}
              style={{ background: P.base, color: P.muted }}>
              {s.avatar ? <img src={s.avatar} className="w-full h-full object-cover" alt="" onError={e => { e.target.style.display = 'none'; }} /> : (s.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold truncate" style={{ color: P.textPrimary }}>{s.name}</p>
              {s.mutual && <p className="text-[12px] truncate" style={{ color: P.muted }}>Mutual friend: {s.mutual}</p>}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button onClick={() => onAddFriend?.()} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all hover:brightness-110"
                style={{ background: P.accent, color: '#fff' }}>
                <UserPlus className="w-3.5 h-3.5 inline mr-1" />Add
              </button>
              <button onClick={() => dismiss(s.user_id)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)]">
                <X className="w-3.5 h-3.5" style={{ color: P.muted }} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function FriendsView({
  friends, incomingRequests, outgoingRequests, onAddFriend, onMessage,
  onAccept, onDecline, onRemove, onBlock, onProfileClick, blocked = [],
  onUnblock, onCancelRequest,
}) {
  const [tab, setTab] = useState('online');
  const [search, setSearch] = useState('');
  const { getProfile } = useProfiles();
  const [categoryMap, setCategoryMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kairo-friend-categories') || '{}'); } catch { return {}; }
  });
  const [categories, setCategories] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kairo-friend-cat-list') || '["Close Friends","Gaming","Work"]'); } catch { return ['Close Friends', 'Gaming', 'Work']; }
  });
  const [expandedCats, setExpandedCats] = useState(() => new Set(categories));
  const [newCatName, setNewCatName] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  const blockedIds = useMemo(() => new Set((blocked || []).map(b => b.blocked_user_id)), [blocked]);

  const persistCategories = useCallback((map, list) => {
    try {
      localStorage.setItem('kairo-friend-categories', JSON.stringify(map));
      localStorage.setItem('kairo-friend-cat-list', JSON.stringify(list));
    } catch {}
  }, []);

  const setFriendCategory = useCallback((friendId, cat) => {
    const updated = { ...categoryMap };
    if (updated[friendId] === cat) delete updated[friendId];
    else updated[friendId] = cat;
    setCategoryMap(updated);
    persistCategories(updated, categories);
  }, [categoryMap, categories, persistCategories]);

  const addCategory = useCallback(() => {
    const name = newCatName.trim();
    if (!name || categories.includes(name)) return;
    const updated = [...categories, name];
    setCategories(updated);
    setExpandedCats(prev => new Set([...prev, name]));
    persistCategories(categoryMap, updated);
    setNewCatName('');
    setShowAddCat(false);
  }, [newCatName, categories, categoryMap, persistCategories]);

  const online = useMemo(() => (friends || []).filter(f => {
    if (blockedIds.has(f.friend_id)) return false;
    const p = getProfile(f.friend_id);
    return p?.is_online || p?.status === 'online' || p?.status === 'idle' || p?.status === 'dnd';
  }), [friends, getProfile, blockedIds]);

  const allFriends = useMemo(() => (friends || []).filter(f => !blockedIds.has(f.friend_id)), [friends, blockedIds]);

  const filtered = useMemo(() => {
    const list = tab === 'online' ? online : allFriends;
    if (!search) return list;
    return list.filter(f => f.friend_name?.toLowerCase().includes(search.toLowerCase()));
  }, [allFriends, online, tab, search]);

  const categorized = useMemo(() => {
    const result = {};
    categories.forEach(cat => { result[cat] = []; });
    result['All Friends'] = [];
    filtered.forEach(f => {
      const cat = categoryMap[f.friend_id];
      if (cat && result[cat]) result[cat].push(f);
      else result['All Friends'].push(f);
    });
    return result;
  }, [filtered, categoryMap, categories]);

  const receivedCount = incomingRequests?.length || 0;
  const sentCount = outgoingRequests?.length || 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-[52px] px-5 flex items-center gap-4 flex-shrink-0" style={{ borderBottom: `1px solid ${P.border}` }}>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5" style={{ color: P.muted }} />
          <span className="text-[15px] font-bold" style={{ color: P.textPrimary }}>Friends</span>
        </div>
        <div className="w-px h-5" style={{ background: P.border }} />
        <div className="flex gap-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all relative"
              style={{
                background: tab === t.id ? `${P.accent}14` : 'transparent',
                color: tab === t.id ? P.textPrimary : P.muted,
              }}>
              {t.label}
              {t.id === 'received' && receivedCount > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[11px] font-bold flex items-center justify-center"
                  style={{ background: P.danger, color: '#fff' }}>{receivedCount}</span>
              )}
              {t.id === 'sent' && sentCount > 0 && (
                <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 rounded-full text-[11px] font-bold flex items-center justify-center"
                  style={{ background: P.accent, color: '#fff' }}>{sentCount}</span>
              )}
              {t.id === 'online' && <span className="ml-1 text-[11px] font-normal" style={{ color: `${P.muted}88` }}>{online.length}</span>}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button onClick={onAddFriend}
          className="px-4 py-1.5 rounded-lg text-[13px] font-semibold flex items-center gap-2 transition-all hover:brightness-110"
          style={{ background: P.accent, color: '#fff' }}>
          <UserPlus className="w-4 h-4" /> Add Friend
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        <div className="max-w-2xl mx-auto w-full p-5 space-y-4">
          {/* Search (for All & Online) */}
          {(tab === 'all' || tab === 'online') && (
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
              style={{ background: P.base, border: `1px solid ${P.border}` }}>
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: P.muted }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search friends..."
                className="flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#68677a]"
                style={{ color: P.textPrimary }} />
              {search && (
                <button onClick={() => setSearch('')} className="p-0.5 rounded hover:bg-[rgba(255,255,255,0.06)]">
                  <X className="w-3.5 h-3.5" style={{ color: P.muted }} />
                </button>
              )}
            </div>
          )}

          {/* Online / All tabs */}
          {(tab === 'all' || tab === 'online') && (
            <>
              {filtered.length === 0 ? (
                <EmptyState
                  icon={tab === 'online' ? Heart : Users}
                  title={tab === 'online' ? 'No friends online' : 'No friends yet'}
                  subtitle={tab === 'online' ? "When your friends come online, they'll appear here." : 'Add friends to start chatting and hanging out together.'}
                  action={tab === 'all' ? (
                    <button onClick={onAddFriend}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold transition-all hover:brightness-110"
                      style={{ background: P.accent, color: '#fff' }}>
                      <UserPlus className="w-4 h-4" /> Add Your First Friend
                    </button>
                  ) : null}
                />
              ) : (
                <>
                  {/* Categories */}
                  {tab === 'all' && categories.map(cat => {
                    const catFriends = categorized[cat] || [];
                    if (catFriends.length === 0) return null;
                    return (
                      <CategorySection key={cat} name={cat} friends={catFriends}
                        expanded={expandedCats.has(cat)} onToggle={() => {
                          setExpandedCats(prev => { const n = new Set(prev); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });
                        }}>
                        {catFriends.map(f => (
                          <FriendCard key={f.id} f={f} onMessage={onMessage} onRemove={onRemove} onBlock={onBlock}
                            onProfileClick={onProfileClick} profile={getProfile(f.friend_id)}
                            category={categoryMap[f.friend_id]} categories={categories}
                            onSetCategory={setFriendCategory} />
                        ))}
                      </CategorySection>
                    );
                  })}

                  {/* Uncategorized / All */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-1 truncate" style={{ color: P.muted }}>
                      {tab === 'online' ? `Online — ${filtered.length}` : `${tab === 'all' && categories.some(c => (categorized[c] || []).length > 0) ? 'Uncategorized' : 'All Friends'} — ${(categorized['All Friends'] || filtered).length}`}
                    </p>
                    <div className="space-y-0.5">
                      {(tab === 'all' ? (categorized['All Friends'] || []) : filtered).map(f => (
                        <FriendCard key={f.id} f={f} onMessage={onMessage} onRemove={onRemove} onBlock={onBlock}
                          onProfileClick={onProfileClick} profile={getProfile(f.friend_id)}
                          category={categoryMap[f.friend_id]} categories={categories}
                          onSetCategory={setFriendCategory} />
                      ))}
                    </div>
                  </div>

                  {/* Add category */}
                  {tab === 'all' && (
                    <div className="pt-2">
                      {showAddCat ? (
                        <div className="flex gap-2">
                          <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Category name..."
                            onKeyDown={e => e.key === 'Enter' && addCategory()}
                            className="flex-1 px-3 py-2 rounded-lg text-[13px] outline-none"
                            style={{ background: P.base, color: P.textPrimary, border: `1px solid ${P.border}` }} autoFocus />
                          <button onClick={addCategory} className="px-3 py-2 rounded-lg text-[12px] font-semibold"
                            style={{ background: P.accent, color: '#fff' }}>Add</button>
                          <button onClick={() => { setShowAddCat(false); setNewCatName(''); }}
                            className="px-3 py-2 rounded-lg text-[12px]" style={{ color: P.muted }}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setShowAddCat(true)}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.03)]"
                          style={{ color: P.muted }}>
                          <FolderPlus className="w-3.5 h-3.5" /> Create Category
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Received tab */}
          {tab === 'received' && (
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest px-1 truncate" style={{ color: P.muted }}>
                Incoming Requests — {receivedCount}
              </p>
              {receivedCount === 0 ? (
                <EmptyState icon={Heart} title="No incoming requests"
                  subtitle="When someone sends you a friend request, it'll show up here." />
              ) : (
                <div className="space-y-2">
                  {incomingRequests.map(r => <RequestCard key={r.id} r={r} type="incoming" onAccept={onAccept} onDecline={onDecline} />)}
                </div>
              )}
            </div>
          )}

          {/* Sent tab */}
          {tab === 'sent' && (
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest px-1" style={{ color: P.muted }}>
                Sent Requests — {sentCount}
              </p>
              {sentCount === 0 ? (
                <EmptyState icon={Clock} title="No pending requests"
                  subtitle="Friend requests you send will show up here until they respond." />
              ) : (
                <div className="space-y-2">
                  {outgoingRequests.map(r => <RequestCard key={r.id} r={r} type="outgoing" onCancel={onCancelRequest} />)}
                </div>
              )}
            </div>
          )}

          {/* Blocked tab */}
          {tab === 'blocked' && (
            (blocked || []).length === 0 ? (
              <EmptyState icon={Ban} title="No blocked users"
                subtitle="Users you block won't be able to message you or see your status." />
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-widest px-1 truncate" style={{ color: P.muted }}>
                  Blocked — {blocked.length}
                </p>
                {(blocked || []).map(b => (
                  <div key={b.id} className="flex items-center gap-3 px-4 py-3 rounded-xl group"
                    style={{ background: 'rgba(255,255,255,0.015)', border: `1px solid ${P.border}` }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: `${P.danger}12` }}>
                      <Ban className="w-4 h-4" style={{ color: P.danger }} />
                    </div>
                    <span className="text-[14px] flex-1 truncate font-medium" style={{ color: P.textPrimary }}>
                      {b.blocked_name || b.blocked_email || 'Blocked User'}
                    </span>
                    <button onClick={() => onUnblock?.(b)}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-medium opacity-0 group-hover:opacity-100 transition-all"
                      style={{ background: `${P.danger}15`, color: P.danger }}>
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Activity tab */}
          {tab === 'activity' && (
            <div className="space-y-6">
              {/* Current activity */}
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-widest px-1 truncate" style={{ color: P.muted }}>Friend Activity</p>
                {(() => {
                  const active = (friends || []).filter(f => {
                    const p = getProfile(f.friend_id);
                    return p?.rich_presence?.name || (p?.is_online && p?.status !== 'invisible');
                  }).slice(0, 20);

                  if (active.length === 0) {
                    return <EmptyState icon={Activity} title="No active friends"
                      subtitle="When friends are online or playing something, they'll appear here." />;
                  }
                  return (
                    <div className="space-y-1">
                      {active.map(f => {
                        const p = getProfile(f.friend_id);
                        const rp = p?.rich_presence;
                        const inVoice = p?.voice_channel_id;
                        return (
                          <div key={f.id} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-[rgba(255,255,255,0.03)] cursor-pointer"
                            onClick={() => onProfileClick?.(f.friend_id)}>
                            <div className="relative flex-shrink-0">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden"
                                style={{ background: P.base, color: P.muted }}>
                                {f.friend_avatar ? <img src={f.friend_avatar} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} /> : (f.friend_name || '?').charAt(0).toUpperCase()}
                              </div>
                              <StatusDot status={p?.status || 'online'} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[14px] font-semibold truncate" style={{ color: P.textPrimary }}>{f.friend_name}</p>
                              <p className="text-[12px] truncate flex items-center gap-1" style={{ color: P.muted }}>
                                {rp?.name ? (
                                  <><Gamepad2 className="w-3 h-3 inline flex-shrink-0" /> {rp.type || 'Playing'} {rp.name}</>
                                ) : inVoice ? (
                                  <><Mic className="w-3 h-3 inline flex-shrink-0" style={{ color: P.success }} /> In voice</>
                                ) : 'Online'}
                              </p>
                            </div>
                            {rp?.name && (
                              <div className="px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0"
                                style={{ background: `${P.accent}12`, color: P.accent }}>
                                {rp.type || 'Playing'}
                              </div>
                            )}
                            {inVoice && (
                              <button onClick={(e) => { e.stopPropagation(); }}
                                className="px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 transition-colors hover:brightness-110"
                                style={{ background: `${P.success}15`, color: P.success }}>
                                Join
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>

              {/* Suggested friends */}
              <SuggestedFriends friends={friends} onAddFriend={onAddFriend} onProfileClick={onProfileClick} getProfile={getProfile} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
