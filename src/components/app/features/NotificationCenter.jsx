import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, AtSign, MessageSquare, UserPlus, Server, Hash, ChevronDown, ChevronRight, Reply, ArrowRight, Filter, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', success: '#34d399', danger: '#f87171', warning: '#fbbf24',
};

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'mentions', label: 'Mentions' },
  { id: 'dms', label: 'DMs' },
  { id: 'friends', label: 'Requests' },
];

const typeIcons = {
  mention: AtSign,
  reply: Reply,
  dm: MessageSquare,
  friend_request: UserPlus,
  server_activity: Server,
  channel: Hash,
  voice: Volume2,
};

const typeColors = {
  mention: P.accent,
  reply: P.accent,
  dm: '#3ba55c',
  friend_request: '#faa61a',
  server_activity: '#a78bfa',
};

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function groupNotifications(notifications) {
  const groups = [];
  const used = new Set();

  for (let i = 0; i < notifications.length; i++) {
    if (used.has(i)) continue;
    const n = notifications[i];
    const similar = [n];
    used.add(i);

    for (let j = i + 1; j < notifications.length; j++) {
      if (used.has(j)) continue;
      const m = notifications[j];
      const timeDiff = Math.abs(new Date(n.timestamp) - new Date(m.timestamp));
      const fiveMin = 5 * 60 * 1000;

      if (n.type === 'mention' && m.type === 'mention' && n.channel_id === m.channel_id && timeDiff < fiveMin) {
        similar.push(m); used.add(j);
      } else if (n.type === 'dm' && m.type === 'dm' && n.sender_id === m.sender_id && timeDiff < fiveMin) {
        similar.push(m); used.add(j);
      } else if (n.type === 'friend_request' && m.type === 'friend_request') {
        similar.push(m); used.add(j);
      }
    }

    groups.push({ key: n.id, items: similar, type: n.type, primary: n });
  }
  return groups;
}

function NotificationItem({ group, onJump, onMarkRead, onReplyDM, expanded, onToggle }) {
  const n = group.primary;
  const Icon = typeIcons[n.type] || Bell;
  const color = typeColors[n.type] || P.muted;
  const isGrouped = group.items.length > 1;
  const [replyText, setReplyText] = useState('');

  return (
    <div className="rounded-xl overflow-hidden transition-all" style={{ background: n.read ? 'transparent' : `${color}06`, border: `1px solid ${n.read ? P.border : `${color}20`}` }}>
      <div className="flex items-start gap-3 px-3.5 py-3 cursor-pointer hover:bg-[rgba(255,255,255,0.02)]"
        onClick={() => isGrouped ? onToggle() : (n.type === 'dm' || n.type === 'mention' || n.type === 'reply') ? onJump?.(n) : null}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: `${color}15` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[13px] font-semibold truncate" style={{ color: P.textPrimary }}>{n.title}</span>
            {isGrouped && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${color}15`, color }}>
                {group.items.length}
              </span>
            )}
          </div>
          <p className="text-[12px] truncate" style={{ color: P.textSecondary }}>{n.content}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px]" style={{ color: P.muted }}>{formatTime(n.timestamp)}</span>
            {n.server_name && <span className="text-[11px]" style={{ color: P.muted }}>in {n.server_name}</span>}
            {n.channel_name && <span className="text-[11px]" style={{ color: P.muted }}>#{n.channel_name}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {(n.type === 'mention' || n.type === 'reply' || n.type === 'dm') && onJump && (
            <button onClick={(e) => { e.stopPropagation(); onJump(n); }}
              className="px-2 py-1 rounded-md text-[11px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.08)]"
              style={{ color: P.accent }}>
              Jump <ArrowRight className="w-2.5 h-2.5 inline" />
            </button>
          )}
          {!n.read && (
            <button onClick={(e) => { e.stopPropagation(); onMarkRead(n.id); }}
              className="w-6 h-6 flex items-center justify-center rounded-md transition-colors hover:bg-[rgba(255,255,255,0.08)]"
              title="Mark as read">
              <Check className="w-3 h-3" style={{ color: P.muted }} />
            </button>
          )}
          {isGrouped && (expanded ? <ChevronDown className="w-3 h-3" style={{ color: P.muted }} /> : <ChevronRight className="w-3 h-3" style={{ color: P.muted }} />)}
        </div>
      </div>

      {/* Expanded grouped items */}
      {isGrouped && expanded && (
        <div className="px-3.5 pb-2 space-y-1">
          {group.items.slice(1).map(item => (
            <div key={item.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] hover:bg-[rgba(255,255,255,0.02)] cursor-pointer"
              onClick={() => onJump?.(item)}>
              <span className="font-medium truncate" style={{ color: P.textSecondary }}>{item.content}</span>
              <span className="flex-shrink-0" style={{ color: P.muted }}>{formatTime(item.timestamp)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Inline DM reply */}
      {n.type === 'dm' && onReplyDM && !isGrouped && (
        <div className="px-3.5 pb-3">
          <div className="flex gap-2">
            <input value={replyText} onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && replyText.trim()) { onReplyDM(n, replyText); setReplyText(''); } }}
              placeholder="Reply..." className="flex-1 px-2.5 py-1.5 rounded-lg text-[12px] outline-none"
              style={{ background: P.base, color: P.textPrimary, border: `1px solid ${P.border}` }} />
            {replyText.trim() && (
              <button onClick={() => { onReplyDM(n, replyText); setReplyText(''); }}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold"
                style={{ background: P.accent, color: '#0d1117' }}>Send</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function NotificationCenter({ notifications = [], onClose, onJump, onMarkRead, onMarkAllRead, onReplyDM }) {
  const [tab, setTab] = useState('all');
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  const filtered = useMemo(() => {
    let list = notifications;
    if (tab === 'mentions') list = list.filter(n => n.type === 'mention' || n.type === 'reply');
    else if (tab === 'dms') list = list.filter(n => n.type === 'dm');
    else if (tab === 'friends') list = list.filter(n => n.type === 'friend_request');
    return list.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [notifications, tab]);

  const groups = useMemo(() => groupNotifications(filtered), [filtered]);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 kairo-modal-backdrop" style={{ background: 'rgba(0,0,0,0.4)', zIndex: 1000 }} onClick={onClose}>
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 350 }}
          className="absolute right-0 top-0 bottom-0 w-full max-w-[420px] flex flex-col"
          style={{ background: P.surface, borderLeft: `1px solid ${P.border}`, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }}
          onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="h-14 px-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: `1px solid ${P.border}` }}>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" style={{ color: P.textPrimary }} />
              <h2 className="text-[16px] font-bold" style={{ color: P.textPrimary }}>Notifications</h2>
              {unreadCount > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center"
                  style={{ background: P.danger, color: '#fff' }}>{unreadCount}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={onMarkAllRead}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.06)]"
                  style={{ color: P.accent }}>
                  <CheckCheck className="w-3.5 h-3.5 inline mr-1" /> Mark All Read
                </button>
              )}
              <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)]">
                <X className="w-5 h-5" style={{ color: P.muted }} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${P.border}` }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
                style={{ background: tab === t.id ? `${P.accent}14` : 'transparent', color: tab === t.id ? P.textPrimary : P.muted }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Notifications list */}
          <div className="flex-1 overflow-y-auto scrollbar-none p-3 space-y-2">
            {groups.length === 0 && (
              <div className="text-center py-16 k-fade-in flex flex-col items-center" style={{ gap: 24 }}>
                <Bell className="w-12 h-12" style={{ color: P.muted }} />
                <p className="text-[16px] font-semibold" style={{ color: P.textPrimary }}>You're all caught up</p>
                <p className="text-[14px]" style={{ color: P.muted }}>Enjoy the quiet</p>
              </div>
            )}
            {groups.map(g => (
              <NotificationItem key={g.key} group={g} onJump={onJump} onMarkRead={onMarkRead} onReplyDM={onReplyDM}
                expanded={expandedGroups.has(g.key)}
                onToggle={() => setExpandedGroups(prev => { const n = new Set(prev); n.has(g.key) ? n.delete(g.key) : n.add(g.key); return n; })} />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function NotificationBell({ count, onClick }) {
  return (
    <button onClick={onClick} className="w-8 h-8 flex items-center justify-center rounded-md relative transition-colors hover:bg-[rgba(255,255,255,0.08)]"
      style={{ color: count > 0 ? P.textPrimary : P.muted }} title="Notifications">
      <Bell className="w-[18px] h-[18px]" />
      {count > 0 && (
        <div className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[11px] font-bold flex items-center justify-center"
          style={{ background: P.danger, color: '#fff' }}>{count > 99 ? '99+' : count}</div>
      )}
    </button>
  );
}

export function useNotifications(currentUserId, conversations, friends, incomingReqs, messages) {
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`kairo-notifs-${currentUserId}`) || '[]'); } catch { return []; }
  });

  const addNotification = useCallback((notif) => {
    const n = { id: Date.now().toString() + Math.random().toString(36).slice(2), read: false, timestamp: new Date().toISOString(), ...notif };
    setNotifications(prev => {
      const next = [n, ...prev].slice(0, 200);
      try { localStorage.setItem(`kairo-notifs-${currentUserId}`, JSON.stringify(next)); } catch {}
      return next;
    });
    return n;
  }, [currentUserId]);

  const markRead = useCallback((id) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      try { localStorage.setItem(`kairo-notifs-${currentUserId}`, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [currentUserId]);

  const markAllRead = useCallback(() => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      try { localStorage.setItem(`kairo-notifs-${currentUserId}`, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [currentUserId]);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  // Clean up old notifications (30 day history)
  useEffect(() => {
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - thirtyDays;
    setNotifications(prev => {
      const cleaned = prev.filter(n => new Date(n.timestamp).getTime() > cutoff);
      if (cleaned.length === prev.length) return prev;
      try { localStorage.setItem(`kairo-notifs-${currentUserId}`, JSON.stringify(cleaned)); } catch {}
      return cleaned;
    });
  }, [currentUserId]);

  return { notifications, addNotification, markRead, markAllRead, unreadCount };
}
