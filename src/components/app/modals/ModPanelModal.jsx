import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Shield, AlertTriangle, UserX, Clock, MessageSquare, Trash2, Eye, Ban, History, Filter } from 'lucide-react';
import ModalWrapper from './ModalWrapper';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Shield },
  { id: 'members', label: 'Members', icon: UserX },
  { id: 'audit', label: 'Audit Log', icon: History },
  { id: 'automod', label: 'AutoMod', icon: Filter },
];

export default function ModPanelModal({ onClose, server }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [members, setMembers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!server?.id) return;
    setLoading(true);
    Promise.all([
      base44.entities.ServerMember.filter({ server_id: server.id }),
      base44.entities.AuditLog.filter({ server_id: server.id }),
      base44.entities.Message.filter({ server_id: server.id }, '-created_date', 50),
    ]).then(([m, a, msg]) => {
      setMembers(m); setAuditLogs(a); setMessages(msg);
      setLoading(false);
    });
  }, [server?.id]);

  const banMember = async (m) => {
    if (!confirm(`Ban ${m.user_email}? They won't be able to rejoin unless you lift the ban.`)) return;
    await base44.entities.ServerMember.update(m.id, { is_banned: true, ban_reason: 'Banned by moderator' });
    await base44.entities.AuditLog.create({ server_id: server.id, action_type: 'member_ban', actor_id: 'mod', actor_name: 'Moderator', target_id: m.user_id, target_type: 'user', target_name: m.user_email });
    setMembers(ms => ms.map(x => x.id === m.id ? { ...x, is_banned: true } : x));
    qc.invalidateQueries({ queryKey: ['members'] });
  };

  const unbanMember = async (m) => {
    await base44.entities.ServerMember.update(m.id, { is_banned: false, ban_reason: '' });
    setMembers(ms => ms.map(x => x.id === m.id ? { ...x, is_banned: false } : x));
    qc.invalidateQueries({ queryKey: ['members'] });
  };

  const timeoutMember = async (m) => {
    const until = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await base44.entities.ServerMember.update(m.id, { timeout_until: until });
    await base44.entities.AuditLog.create({ server_id: server.id, action_type: 'member_timeout', actor_id: 'mod', actor_name: 'Moderator', target_id: m.user_id, target_type: 'user', target_name: m.user_email });
    setMembers(ms => ms.map(x => x.id === m.id ? { ...x, timeout_until: until } : x));
  };

  const deleteMessage = async (msg) => {
    await base44.entities.Message.update(msg.id, { is_deleted: true });
    await base44.entities.AuditLog.create({ server_id: server.id, action_type: 'message_delete', actor_id: 'mod', actor_name: 'Moderator', target_id: msg.id, target_type: 'message', target_name: msg.content?.slice(0, 40) });
    setMessages(ms => ms.filter(x => x.id !== msg.id));
    qc.invalidateQueries({ queryKey: ['messages'] });
  };

  const banned = members.filter(m => m.is_banned);
  const timedOut = members.filter(m => m.timeout_until && new Date(m.timeout_until) > new Date());
  const actionIcons = { member_ban: Ban, member_kick: UserX, member_timeout: Clock, message_delete: Trash2, channel_create: MessageSquare, role_create: Shield };

  return (
    <ModalWrapper title="Moderation Panel" onClose={onClose} width={640}>
      <div className="flex gap-4 min-h-[450px]">
        <div className="w-[120px] flex-shrink-0 space-y-0.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[12px] transition-colors"
              style={{ background: tab === t.id ? 'var(--bg-glass-active)' : 'transparent', color: tab === t.id ? 'var(--text-cream)' : 'var(--text-muted)' }}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto max-h-[500px] space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text-muted)' }} />
            </div>
          ) : <>
            {tab === 'overview' && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Members', value: members.length, color: 'var(--accent-blue)' },
                    { label: 'Banned', value: banned.length, color: 'var(--accent-red)' },
                    { label: 'Timed Out', value: timedOut.length, color: 'var(--accent-amber)' },
                  ].map(s => (
                    <div key={s.label} className="p-3 rounded-xl text-center" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                      <div className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                      <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em] mb-2" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Recent Actions</h4>
                  <div className="space-y-1">
                    {auditLogs.slice(0, 10).map(log => {
                      const Icon = actionIcons[log.action_type] || Shield;
                      return (
                        <div key={log.id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-glass)' }}>
                          <Icon className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                          <span className="text-[11px] flex-1" style={{ color: 'var(--text-primary)' }}>
                            <span style={{ color: 'var(--text-cream)' }}>{log.actor_name}</span> {log.action_type.replace(/_/g, ' ')} {log.target_name && <span style={{ color: 'var(--text-secondary)' }}>→ {log.target_name}</span>}
                          </span>
                          <span className="text-[11px] font-mono" style={{ color: 'var(--text-faint)' }}>{new Date(log.created_date).toLocaleDateString()}</span>
                        </div>
                      );
                    })}
                    {auditLogs.length === 0 && <p className="text-center py-4 text-[11px]" style={{ color: 'var(--text-muted)' }}>No actions recorded</p>}
                  </div>
                </div>
              </div>
            )}
            {tab === 'members' && (
              <div className="space-y-3">
                {banned.length > 0 && <>
                  <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--accent-red)', fontFamily: 'monospace' }}>Banned — {banned.length}</h4>
                  {banned.map(m => (
                    <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(201,123,123,0.05)', border: '1px solid rgba(201,123,123,0.1)' }}>
                      <Ban className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} />
                      <span className="text-sm flex-1" style={{ color: 'var(--text-primary)' }}>{m.user_email}</span>
                      <button onClick={() => unbanMember(m)} className="text-[11px] px-2 py-1 rounded-lg" style={{ background: 'var(--bg-glass)', color: 'var(--accent-green)' }}>Unban</button>
                    </div>
                  ))}
                </>}
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>All Members — {members.filter(m => !m.is_banned).length}</h4>
                {members.filter(m => !m.is_banned).map(m => (
                  <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'var(--bg-glass)' }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px]" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>
                      {(m.user_email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{m.user_email}</span>
                    {m.user_id !== server.owner_id && (
                      <div className="flex gap-1">
                        <button onClick={() => timeoutMember(m)} className="p-1.5 rounded-lg hover:bg-[var(--bg-glass-hover)]" title="Timeout 1h"><Clock className="w-3 h-3" style={{ color: 'var(--accent-amber)' }} /></button>
                        <button onClick={() => banMember(m)} className="p-1.5 rounded-lg hover:bg-[var(--bg-glass-hover)]" title="Ban"><Ban className="w-3 h-3" style={{ color: 'var(--accent-red)' }} /></button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {tab === 'audit' && (
              <div className="space-y-1">
                {auditLogs.length === 0 && <p className="text-center py-8 text-[11px]" style={{ color: 'var(--text-muted)' }}>No audit logs</p>}
                {auditLogs.map(log => {
                  const Icon = actionIcons[log.action_type] || Shield;
                  return (
                    <div key={log.id} className="flex items-start gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'var(--bg-glass)' }}>
                      <Icon className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
                      <div className="flex-1">
                        <p className="text-[12px]" style={{ color: 'var(--text-primary)' }}>
                          <span className="font-medium" style={{ color: 'var(--text-cream)' }}>{log.actor_name}</span>{' '}
                          {log.action_type.replace(/_/g, ' ')}{' '}
                          {log.target_name && <span style={{ color: 'var(--text-secondary)' }}>{log.target_name}</span>}
                        </p>
                        {log.reason && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Reason: {log.reason}</p>}
                        <p className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--text-faint)' }}>{new Date(log.created_date).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {tab === 'automod' && (
              <div className="space-y-4">
                <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Configure automated moderation rules for this server.</p>
                {[
                  { label: 'Block Invite Links', desc: 'Prevent posting invite links from other servers' },
                  { label: 'Anti-Spam', desc: 'Block rapid message sending from a single user' },
                  { label: 'Mention Spam', desc: 'Limit mass mentions (@everyone, @here)' },
                  { label: 'Caps Lock Filter', desc: 'Flag messages with excessive capitalization' },
                  { label: 'Link Filter', desc: 'Block external links from non-trusted members' },
                  { label: 'New Account Gate', desc: 'Restrict new accounts (< 7 days) from messaging' },
                ].map((rule, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-3 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                    <div>
                      <p className="text-[12px] font-medium" style={{ color: 'var(--text-cream)' }}>{rule.label}</p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{rule.desc}</p>
                    </div>
                    <button className="w-10 h-5 rounded-full relative transition-colors" style={{ background: 'var(--bg-overlay)' }}>
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>}
        </div>
      </div>
    </ModalWrapper>
  );
}