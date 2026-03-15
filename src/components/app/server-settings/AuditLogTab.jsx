import React, { useState, useEffect, useMemo } from 'react';
import { Search, UserPlus, UserMinus, Hash, Shield, Trash2, Pin, Settings, ChevronDown, ChevronRight, Download, Calendar, User, MessageSquare, Link, Bot, Smile, ShieldAlert, Clock, Ban } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', danger: '#f87171', success: '#34d399', warning: '#fbbf24', info: '#60a5fa',
};

const ACTION_CONFIG = {
  member_join: { icon: UserPlus, color: P.success, label: 'Member Joined' },
  member_leave: { icon: UserMinus, color: P.muted, label: 'Member Left' },
  member_kick: { icon: UserMinus, color: P.danger, label: 'Member Kicked' },
  member_ban: { icon: Ban, color: P.danger, label: 'Member Banned' },
  member_unban: { icon: UserPlus, color: P.success, label: 'Member Unbanned' },
  member_timeout: { icon: Clock, color: P.warning, label: 'Member Timed Out' },
  channel_create: { icon: Hash, color: P.success, label: 'Channel Created' },
  channel_update: { icon: Hash, color: P.warning, label: 'Channel Updated' },
  channel_delete: { icon: Hash, color: P.danger, label: 'Channel Deleted' },
  role_create: { icon: Shield, color: P.success, label: 'Role Created' },
  role_update: { icon: Shield, color: P.warning, label: 'Role Updated' },
  role_delete: { icon: Shield, color: P.danger, label: 'Role Deleted' },
  message_delete: { icon: Trash2, color: P.danger, label: 'Message Deleted' },
  message_pin: { icon: Pin, color: P.info, label: 'Message Pinned' },
  server_update: { icon: Settings, color: P.warning, label: 'Server Updated' },
  invite_create: { icon: Link, color: P.success, label: 'Invite Created' },
  invite_delete: { icon: Link, color: P.danger, label: 'Invite Revoked' },
  bot_add: { icon: Bot, color: P.success, label: 'Bot Added' },
  bot_remove: { icon: Bot, color: P.danger, label: 'Bot Removed' },
  emoji_create: { icon: Smile, color: P.success, label: 'Emoji Added' },
  emoji_delete: { icon: Smile, color: P.danger, label: 'Emoji Removed' },
  backup_create: { icon: Download, color: P.info, label: 'Backup Created' },
  backup_restore: { icon: Download, color: P.warning, label: 'Backup Restored' },
  automod_delete: { icon: ShieldAlert, color: P.danger, label: 'AutoMod: Deleted' },
  automod_warn: { icon: ShieldAlert, color: P.warning, label: 'AutoMod: Warned' },
  automod_timeout: { icon: ShieldAlert, color: P.warning, label: 'AutoMod: Timeout' },
};

const FILTER_GROUPS = [
  { value: 'all', label: 'All Actions' },
  { value: 'member', label: 'Members' },
  { value: 'channel', label: 'Channels' },
  { value: 'role', label: 'Roles' },
  { value: 'message', label: 'Messages' },
  { value: 'server', label: 'Server' },
  { value: 'invite', label: 'Invites' },
  { value: 'automod', label: 'AutoMod' },
  { value: 'bot', label: 'Bots' },
  { value: 'emoji', label: 'Emoji' },
  { value: 'backup', label: 'Backups' },
];

export default function AuditLogTab({ serverId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterUser, setFilterUser] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (serverId) {
      base44.entities.AuditLog.filter({ server_id: serverId }, '-created_date', 200).then(data => {
        setLogs(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [serverId]);

  const filtered = useMemo(() => {
    let list = [...logs];
    if (search) list = list.filter(l =>
      l.actor_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.target_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.action_type?.toLowerCase().includes(search.toLowerCase())
    );
    if (filterType !== 'all') list = list.filter(l => l.action_type?.startsWith(filterType));
    if (filterUser) list = list.filter(l => l.actor_name?.toLowerCase().includes(filterUser.toLowerCase()));
    return list;
  }, [logs, search, filterType, filterUser]);

  const exportCSV = () => {
    const header = 'Action,Actor,Target,Date,Details\n';
    const rows = filtered.map(l => {
      const date = l.created_date ? new Date(l.created_date).toISOString() : '';
      const details = l.changes ? JSON.stringify(l.changes).replace(/"/g, '""') : '';
      return `"${l.action_type || ''}","${l.actor_name || ''}","${l.target_name || ''}","${date}","${details}"`;
    }).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: P.border, borderTopColor: P.accent }} />
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
          <Search className="w-4 h-4" style={{ color: P.muted }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search audit log..."
            className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: P.textPrimary }} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-lg text-[12px] outline-none appearance-none"
          style={{ background: P.elevated, color: P.textSecondary, border: `1px solid ${P.border}` }}>
          {FILTER_GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
        <button onClick={exportCSV}
          className="px-3 py-2 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-all hover:brightness-110"
          style={{ background: P.accent, color: '#fff' }}>
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </div>

      {/* User filter */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
        <User className="w-3.5 h-3.5" style={{ color: P.muted }} />
        <input value={filterUser} onChange={e => setFilterUser(e.target.value)} placeholder="Filter by user..."
          className="flex-1 bg-transparent text-[12px] outline-none" style={{ color: P.textPrimary }} />
        {filterUser && (
          <button onClick={() => setFilterUser('')} className="text-[11px]" style={{ color: P.muted }}>Clear</button>
        )}
      </div>

      <p className="text-[11px]" style={{ color: P.muted }}>{filtered.length} entries</p>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[14px]" style={{ color: P.muted }}>No audit log entries found</p>
          <p className="text-[12px] mt-1" style={{ color: P.muted }}>Actions will appear here automatically</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map(log => {
            const cfg = ACTION_CONFIG[log.action_type] || { icon: Settings, color: P.muted, label: log.action_type };
            const Icon = cfg.icon;
            const expanded = expandedId === log.id;
            const hasDetails = log.changes && (Array.isArray(log.changes) ? log.changes.length > 0 : Object.keys(log.changes).length > 0);

            return (
              <div key={log.id} className="rounded-xl overflow-hidden" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
                <button onClick={() => setExpandedId(expanded ? null : log.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-[rgba(255,255,255,0.02)]">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}15` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px]" style={{ color: P.textPrimary }}>
                      <span className="font-medium">{log.actor_name || 'System'}</span>
                      <span style={{ color: P.muted }}> {cfg.label} </span>
                      {log.target_name && <span className="font-medium">{log.target_name}</span>}
                    </span>
                  </div>
                  <span className="text-[11px] flex-shrink-0" style={{ color: P.muted }}>
                    {log.created_date ? new Date(log.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                  {hasDetails && (expanded
                    ? <ChevronDown className="w-3.5 h-3.5" style={{ color: P.muted }} />
                    : <ChevronRight className="w-3.5 h-3.5" style={{ color: P.muted }} />
                  )}
                </button>
                {expanded && hasDetails && (
                  <div className="px-3 pb-3 space-y-1" style={{ borderTop: `1px solid ${P.border}` }}>
                    {Array.isArray(log.changes) ? log.changes.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] py-1">
                        <span style={{ color: P.muted }}>{c.key}:</span>
                        {c.old_value && <span className="line-through" style={{ color: P.danger }}>{String(c.old_value)}</span>}
                        {c.old_value && <span style={{ color: P.muted }}>→</span>}
                        <span style={{ color: P.success }}>{String(c.new_value)}</span>
                      </div>
                    )) : (
                      <div className="text-[11px] py-1">
                        {Object.entries(log.changes).map(([k, v]) => (
                          <div key={k} className="flex items-center gap-2 py-0.5">
                            <span style={{ color: P.muted }}>{k}:</span>
                            <span style={{ color: P.textSecondary }}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {log.reason && <p className="text-[11px] italic" style={{ color: P.muted }}>Reason: {log.reason}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
