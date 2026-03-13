import React, { useState } from 'react';
import { Users, Server, Crown, Shield, Code, FlaskConical, Ban, CheckCircle, UserPlus, RefreshCw, Eye, Edit3, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';
import moment from 'moment';

function StatusDot({ status }) {
  const c = { online: colors.status.online, idle: colors.status.idle, dnd: colors.status.dnd }[status] || colors.status.offline;
  return <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-[rgba(0,0,0,0.3)]" style={{ background: c }} />;
}

export default function AdminUsers({ enrichedUsers, allServers, allMembers, profileMap, search, onRefresh, showFeedback, onEditUser }) {
  const filteredUsers = enrichedUsers.filter(u =>
    (u.displayName || u.email || u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleBan = async (u) => {
    if (!confirm(`Ban ${u.displayName || u.email}? They will be removed from all servers.`)) return;
    const profile = profileMap[u.email?.toLowerCase()] || profileMap[u.id];
    if (profile) await base44.entities.UserProfile.update(profile.id, { is_banned: true, status: 'offline', is_online: false });
    const memberships = allMembers.filter(m => m.user_id === u.id || m.user_email === u.email);
    for (const m of memberships) await base44.entities.ServerMember.delete(m.id);
    showFeedback(`Banned ${u.displayName || u.email}`);
    onRefresh();
  };

  const handleUnban = async (u) => {
    const profile = profileMap[u.email?.toLowerCase()] || profileMap[u.id];
    if (profile) await base44.entities.UserProfile.update(profile.id, { is_banned: false });
    showFeedback(`Unbanned ${u.displayName || u.email}`);
    onRefresh();
  };

  const handleToggleBadge = async (u, badge) => {
    const profile = profileMap[u.email?.toLowerCase()] || profileMap[u.id];
    if (!profile) return;
    const current = profile.badges || [];
    const has = current.includes(badge);
    const badges = has ? current.filter(b => b !== badge) : [...new Set([...current, badge])];
    await base44.entities.UserProfile.update(profile.id, { badges });
    showFeedback(`${has ? 'Removed' : 'Granted'} ${badge} badge`);
    onRefresh();
  };

  const handleGrantElite = async (u) => {
    const profile = profileMap[u.email?.toLowerCase()] || profileMap[u.id];
    if (!profile) return;
    const badges = [...new Set([...(profile.badges || []), 'premium'])];
    await base44.entities.UserProfile.update(profile.id, { badges });
    const credits = await base44.entities.UserCredits.filter({ user_id: u.id });
    if (credits.length > 0) await base44.entities.UserCredits.update(credits[0].id, { has_nitro: true });
    else await base44.entities.UserCredits.create({ user_id: u.id, user_email: u.email, balance: 500, has_nitro: true });
    showFeedback(`Granted Elite to ${u.displayName}`);
    onRefresh();
  };

  const handleForceAddToServer = async (user, serverId) => {
    const existing = allMembers.filter(m => m.server_id === serverId && (m.user_id === user.id || m.user_email === user.email));
    if (existing.length > 0) { showFeedback('User already in server'); return; }
    await base44.entities.ServerMember.create({ server_id: serverId, user_id: user.id, user_email: user.email, joined_at: new Date().toISOString(), role_ids: [] });
    const server = allServers.find(s => s.id === serverId);
    if (server) await base44.entities.Server.update(serverId, { member_count: (server.member_count || 1) + 1 });
    showFeedback(`Added ${user.displayName} to ${server?.name}`);
    onRefresh();
  };

  if (filteredUsers.length === 0) return <p className="text-center py-8 text-[13px]" style={{ color: colors.text.muted }}>No users found</p>;

  return (
    <div className="space-y-1">
      {filteredUsers.sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0)).map(u => (
        <div key={u.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.02)] group"
          style={{ opacity: u.isBanned ? 0.5 : 1 }}>
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-[13px] font-semibold"
              style={{ background: colors.bg.overlay, color: colors.text.muted }}>
              {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt="" /> : (u.displayName || '?')[0].toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5"><StatusDot status={u.isOnline ? (u.status || 'online') : 'offline'} /></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-semibold truncate" style={{ color: colors.text.primary }}>{u.displayName}</span>
              {u.badges?.includes('owner') && <Crown className="w-3 h-3 flex-shrink-0" style={{ color: '#faa81a' }} />}
              {u.badges?.includes('admin') && <Shield className="w-3 h-3 flex-shrink-0" style={{ color: colors.accent.primary }} />}
              {u.isBanned && <Ban className="w-3 h-3 flex-shrink-0" style={{ color: colors.danger }} />}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] truncate" style={{ color: colors.text.disabled }}>{u.email}</span>
              <span className="text-[10px]" style={{ color: colors.text.disabled }}>· {moment(u.created_date).format('MMM D, YYYY')}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0" title={`In ${u.serverCount} server(s)`}>
            <Server className="w-3 h-3" style={{ color: colors.text.disabled }} />
            <span className="text-[11px]" style={{ color: colors.text.disabled }}>{u.serverCount}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
            style={{
              background: u.isBanned ? 'rgba(237,66,69,0.12)' : u.isOnline ? 'rgba(59,165,93,0.12)' : 'rgba(255,255,255,0.04)',
              color: u.isBanned ? colors.danger : u.isOnline ? colors.status.online : colors.text.disabled
            }}>
            {u.isBanned ? 'Banned' : u.isOnline ? 'Online' : 'Offline'}
          </span>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
            {/* Edit profile */}
            <button onClick={() => onEditUser(u)} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(88,101,242,0.15)]" title="Edit Profile">
              <Edit3 className="w-3.5 h-3.5" style={{ color: colors.accent.primary }} />
            </button>
            {/* Grant Elite */}
            {u.role !== 'admin' && (
              <button onClick={() => u.badges?.includes('premium') ? handleToggleBadge(u, 'premium') : handleGrantElite(u)}
                className="p-1.5 rounded-md transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                title={u.badges?.includes('premium') ? 'Revoke Elite' : 'Grant Elite'}>
                <Crown className="w-3.5 h-3.5" style={{ color: u.badges?.includes('premium') ? colors.warning : colors.text.disabled }} />
              </button>
            )}
            {/* Toggle badges */}
            <button onClick={() => handleToggleBadge(u, 'developer')} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(255,255,255,0.04)]" title="Toggle Developer">
              <Code className="w-3.5 h-3.5" style={{ color: u.badges?.includes('developer') ? '#a78bfa' : colors.text.disabled }} />
            </button>
            <button onClick={() => handleToggleBadge(u, 'tester')} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(255,255,255,0.04)]" title="Toggle Tester">
              <FlaskConical className="w-3.5 h-3.5" style={{ color: u.badges?.includes('tester') ? '#3ba55c' : colors.text.disabled }} />
            </button>
            {/* Add to server */}
            {allServers.length > 0 && (
              <div className="relative group/add">
                <button className="p-1.5 rounded-md transition-colors hover:bg-[rgba(255,255,255,0.04)]" title="Add to server">
                  <UserPlus className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
                </button>
                <div className="hidden group-hover/add:block absolute right-0 top-full z-50 mt-1 py-1 rounded-lg w-48" style={{ background: colors.bg.float, border: `1px solid ${colors.border.strong}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
                  {allServers.slice(0, 10).map(s => (
                    <button key={s.id} onClick={() => handleForceAddToServer(u, s.id)}
                      className="w-full text-left px-3 py-1.5 text-[12px] transition-colors hover:bg-[rgba(88,101,242,0.15)]"
                      style={{ color: colors.text.secondary }}>{s.name}</button>
                  ))}
                </div>
              </div>
            )}
            {/* Ban/Unban */}
            {u.role !== 'admin' && (
              u.isBanned ? (
                <button onClick={() => handleUnban(u)} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(59,165,93,0.12)]" title="Unban">
                  <CheckCircle className="w-3.5 h-3.5" style={{ color: colors.success }} />
                </button>
              ) : (
                <button onClick={() => handleBan(u)} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(237,66,69,0.12)]" title="Ban">
                  <Ban className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
                </button>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}