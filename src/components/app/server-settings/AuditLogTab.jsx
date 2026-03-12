import React, { useState, useEffect, useMemo } from 'react';
import { Search, UserPlus, UserMinus, Hash, Shield, Trash2, Pin, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';

const ACTION_COLORS = {
  member_join: colors.success, member_leave: colors.text.muted, member_kick: colors.danger, member_ban: colors.danger,
  channel_create: colors.success, channel_update: colors.warning, channel_delete: colors.danger,
  role_create: colors.success, role_update: colors.warning, role_delete: colors.danger,
  message_delete: colors.danger, message_pin: colors.info, server_update: colors.warning,
};

const ACTION_ICONS = {
  member_join: UserPlus, member_leave: UserMinus, member_kick: UserMinus, member_ban: UserMinus,
  channel_create: Hash, channel_update: Hash, channel_delete: Hash,
  role_create: Shield, role_update: Shield, role_delete: Shield,
  message_delete: Trash2, message_pin: Pin, server_update: Settings,
};

export default function AuditLogTab({ serverId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (serverId) {
      base44.entities.AuditLog.filter({ server_id: serverId }, '-created_date', 100).then(data => { setLogs(data); setLoading(false); });
    }
  }, [serverId]);

  const filtered = useMemo(() => {
    let list = [...logs];
    if (search) list = list.filter(l => l.actor_name?.toLowerCase().includes(search.toLowerCase()) || l.target_name?.toLowerCase().includes(search.toLowerCase()));
    if (filterType !== 'all') list = list.filter(l => l.action_type?.startsWith(filterType));
    return list;
  }, [logs, search, filterType]);

  if (loading) return <div className="text-center py-12"><div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: colors.border.light, borderTopColor: colors.accent.primary }} /></div>;

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
          <Search className="w-4 h-4" style={{ color: colors.text.disabled }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search audit log..."
            className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: colors.text.primary }} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-lg text-[12px] outline-none"
          style={{ background: colors.bg.elevated, color: colors.text.secondary, border: `1px solid ${colors.border.default}` }}>
          <option value="all">All Actions</option>
          <option value="member">Members</option>
          <option value="channel">Channels</option>
          <option value="role">Roles</option>
          <option value="message">Messages</option>
          <option value="server">Server</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[14px]" style={{ color: colors.text.muted }}>No audit log entries found</p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map(log => {
            const Icon = ACTION_ICONS[log.action_type] || Settings;
            const color = ACTION_COLORS[log.action_type] || colors.text.muted;
            const expanded = expandedId === log.id;
            return (
              <div key={log.id} className="rounded-xl overflow-hidden" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
                <button onClick={() => setExpandedId(expanded ? null : log.id)} className="w-full flex items-center gap-3 px-3 py-2.5 text-left">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px]" style={{ color: colors.text.primary }}>
                      <span className="font-medium">{log.actor_name || 'System'}</span>
                      <span style={{ color: colors.text.muted }}> {log.action_type?.replace(/_/g, ' ')} </span>
                      {log.target_name && <span className="font-medium">{log.target_name}</span>}
                    </span>
                  </div>
                  <span className="text-[10px] flex-shrink-0" style={{ color: colors.text.disabled }}>
                    {log.created_date ? new Date(log.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                  {log.changes?.length > 0 && (expanded ? <ChevronDown className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} /> : <ChevronRight className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />)}
                </button>
                {expanded && log.changes?.length > 0 && (
                  <div className="px-3 pb-3 space-y-1" style={{ borderTop: `1px solid ${colors.border.default}` }}>
                    {log.changes.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] py-1">
                        <span style={{ color: colors.text.muted }}>{c.key}:</span>
                        {c.old_value && <span className="line-through" style={{ color: colors.danger }}>{c.old_value}</span>}
                        {c.old_value && <span style={{ color: colors.text.disabled }}>→</span>}
                        <span style={{ color: colors.success }}>{c.new_value}</span>
                      </div>
                    ))}
                    {log.reason && <p className="text-[11px] italic" style={{ color: colors.text.muted }}>Reason: {log.reason}</p>}
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