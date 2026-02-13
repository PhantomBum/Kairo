import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Shield, UserX, Clock, AlertTriangle, Ban, Eye, Trash2, Search } from 'lucide-react';

export default function ModPanel({ server, members, roles, profilesMap, currentUserId, onBack }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState('members');
  const [search, setSearch] = useState('');

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['auditLogs', server.id],
    queryFn: () => base44.entities.AuditLog.filter({ server_id: server.id }, '-created_date', 50),
    enabled: !!server.id,
  });

  const kickMember = useMutation({
    mutationFn: async (member) => {
      if (!confirm(`Kick ${profilesMap.get(member.user_id)?.display_name || 'this user'}?`)) return;
      await base44.entities.ServerMember.delete(member.id);
      await base44.entities.AuditLog.create({
        server_id: server.id, action_type: 'member_kick', actor_id: currentUserId,
        target_id: member.user_id, target_type: 'user', target_name: profilesMap.get(member.user_id)?.display_name,
      });
      await base44.entities.Server.update(server.id, { member_count: Math.max((server.member_count || 1) - 1, 0) });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['members'] }); qc.invalidateQueries({ queryKey: ['auditLogs'] }); },
  });

  const banMember = useMutation({
    mutationFn: async (member) => {
      const reason = prompt('Ban reason (optional):');
      if (reason === null) return;
      await base44.entities.ServerMember.update(member.id, { is_banned: true, ban_reason: reason || 'No reason provided' });
      await base44.entities.AuditLog.create({
        server_id: server.id, action_type: 'member_ban', actor_id: currentUserId,
        target_id: member.user_id, target_type: 'user', target_name: profilesMap.get(member.user_id)?.display_name,
        reason,
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['members'] }); qc.invalidateQueries({ queryKey: ['auditLogs'] }); },
  });

  const timeoutMember = useMutation({
    mutationFn: async (member) => {
      const mins = prompt('Timeout duration in minutes:', '10');
      if (!mins) return;
      const until = new Date(Date.now() + parseInt(mins) * 60000).toISOString();
      await base44.entities.ServerMember.update(member.id, { timeout_until: until });
      await base44.entities.AuditLog.create({
        server_id: server.id, action_type: 'member_timeout', actor_id: currentUserId,
        target_id: member.user_id, target_type: 'user',
        target_name: profilesMap.get(member.user_id)?.display_name,
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['members'] }); qc.invalidateQueries({ queryKey: ['auditLogs'] }); },
  });

  const tabs = [
    { id: 'members', label: 'Members', icon: Eye },
    { id: 'bans', label: 'Bans', icon: Ban },
    { id: 'audit', label: 'Audit Log', icon: Shield },
  ];

  const filteredMembers = members.filter(m => {
    if (m.is_banned && tab !== 'bans') return false;
    if (!m.is_banned && tab === 'bans') return false;
    if (!search) return true;
    const p = profilesMap.get(m.user_id);
    return p?.display_name?.toLowerCase().includes(search.toLowerCase()) || m.user_email?.toLowerCase().includes(search.toLowerCase());
  });

  const actionTypeLabels = {
    member_kick: 'Kicked', member_ban: 'Banned', member_unban: 'Unbanned',
    member_timeout: 'Timed out', channel_create: 'Created channel', channel_delete: 'Deleted channel',
    role_create: 'Created role', role_update: 'Updated role', message_delete: 'Deleted message',
    server_update: 'Updated server', member_join: 'Joined', member_leave: 'Left',
  };

  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ background: '#0e0e0e' }}>
      {/* Header */}
      <div className="h-12 px-4 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onBack} className="p-1 text-zinc-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <Shield className="w-4 h-4 text-red-400" />
        <span className="text-sm font-semibold text-white">Moderation — {server.name}</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-4 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors"
            style={{ background: tab === t.id ? 'rgba(255,255,255,0.08)' : 'transparent', color: tab === t.id ? '#fff' : '#666' }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      {(tab === 'members' || tab === 'bans') && (
        <div className="px-4 pt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members..."
              className="w-full h-9 pl-9 pr-3 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none" style={{ background: '#1a1a1a' }} />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
        {(tab === 'members' || tab === 'bans') && (
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase text-zinc-500 px-2 mb-2">
              {tab === 'bans' ? 'Banned Members' : 'Server Members'} — {filteredMembers.length}
            </div>
            {filteredMembers.map(m => {
              const p = profilesMap.get(m.user_id) || profilesMap.get(m.user_email);
              const name = p?.display_name || m.user_email?.split('@')[0] || 'User';
              const isOwner = m.user_id === server.owner_id;
              const isSelf = m.user_id === currentUserId || m.user_email === currentUserId;
              return (
                <div key={m.id} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/[0.04] group">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden" style={{ background: '#1a1a1a' }}>
                    {p?.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white">{name} {isOwner && <span className="text-[10px] text-amber-400">OWNER</span>}</div>
                    <div className="text-[11px] text-zinc-500">{m.user_email}</div>
                    {m.is_banned && m.ban_reason && <div className="text-[11px] text-red-400">Reason: {m.ban_reason}</div>}
                  </div>
                  {!isOwner && !isSelf && !m.is_banned && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => timeoutMember.mutate(m)} title="Timeout" className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10">
                        <Clock className="w-3.5 h-3.5 text-yellow-400" />
                      </button>
                      <button onClick={() => kickMember.mutate(m)} title="Kick" className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10">
                        <UserX className="w-3.5 h-3.5 text-orange-400" />
                      </button>
                      <button onClick={() => banMember.mutate(m)} title="Ban" className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/10">
                        <Ban className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  )}
                  {m.is_banned && (
                    <button onClick={async () => {
                      await base44.entities.ServerMember.update(m.id, { is_banned: false, ban_reason: null });
                      qc.invalidateQueries({ queryKey: ['members'] });
                    }} className="text-xs text-green-400 hover:underline">Unban</button>
                  )}
                </div>
              );
            })}
            {filteredMembers.length === 0 && <div className="text-center py-8 text-zinc-600 text-sm">{tab === 'bans' ? 'No banned members' : 'No members found'}</div>}
          </div>
        )}

        {tab === 'audit' && (
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase text-zinc-500 px-2 mb-2">Recent Actions</div>
            {auditLogs.map(log => (
              <div key={log.id} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/[0.04]">
                <AlertTriangle className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">
                    <span className="font-medium">{log.actor_name || 'Unknown'}</span>
                    {' '}<span className="text-zinc-500">{actionTypeLabels[log.action_type] || log.action_type}</span>
                    {log.target_name && <> <span className="text-zinc-400">{log.target_name}</span></>}
                  </div>
                  {log.reason && <div className="text-[11px] text-zinc-500">Reason: {log.reason}</div>}
                  <div className="text-[10px] text-zinc-600">{new Date(log.created_date).toLocaleString()}</div>
                </div>
              </div>
            ))}
            {auditLogs.length === 0 && <div className="text-center py-8 text-zinc-600 text-sm">No audit log entries</div>}
          </div>
        )}
      </div>
    </div>
  );
}