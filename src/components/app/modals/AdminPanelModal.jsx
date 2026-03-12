import React, { useState, useEffect, useMemo } from 'react';
import { Search, Users, Server, Globe, Shield, Crown, RefreshCw, Ban, CheckCircle, AlertTriangle, Mail, Calendar, UserPlus, LogIn, Eye, Trash2, Settings, MessageSquare, Database, Activity, Code, FlaskConical } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';
import moment from 'moment';

function StatusDot({ status }) {
  const c = { online: colors.status.online, idle: colors.status.idle, dnd: colors.status.dnd }[status] || colors.status.offline;
  return <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-[rgba(0,0,0,0.3)]" style={{ background: c }} />;
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="flex-1 p-3 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: colors.text.disabled }}>{label}</span>
      </div>
      <p className="text-[22px] font-bold" style={{ color: colors.text.primary }}>{value}</p>
    </div>
  );
}

function ConfirmDialog({ title, subtitle, icon: Icon, iconBg, iconColor, buttonLabel, buttonColor, user, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onCancel}>
      <div className="rounded-2xl p-5 w-[380px] space-y-4" style={{ background: colors.bg.modal, border: `1px solid ${colors.border.light}` }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: iconBg }}>
            <Icon className="w-5 h-5" style={{ color: iconColor }} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold" style={{ color: colors.text.primary }}>{title}</h3>
            <p className="text-[12px]" style={{ color: colors.text.muted }}>{subtitle}</p>
          </div>
        </div>
        {user && (
          <div className="p-3 rounded-lg" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
            <p className="text-[13px] font-medium" style={{ color: colors.text.primary }}>{user.full_name || user.displayName || user.email}</p>
            <p className="text-[11px]" style={{ color: colors.text.disabled }}>{user.email}</p>
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.04)]"
            style={{ color: colors.text.secondary }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-colors"
            style={{ background: buttonColor, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Processing...' : buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function InviteUserForm({ onInvite, loading }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
      <Mail className="w-4 h-4 flex-shrink-0" style={{ color: colors.text.disabled }} />
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="user@email.com"
        className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: colors.text.primary }} />
      <select value={role} onChange={e => setRole(e.target.value)}
        className="text-[11px] px-2 py-1 rounded-md outline-none" style={{ background: colors.bg.overlay, color: colors.text.secondary, border: `1px solid ${colors.border.default}` }}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <button onClick={() => { if (email.trim()) { onInvite(email.trim(), role); setEmail(''); } }} disabled={loading || !email.trim()}
        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-40"
        style={{ background: colors.accent.primary, color: '#fff' }}>
        {loading ? '...' : 'Invite'}
      </button>
    </div>
  );
}

function JoinServerForm({ servers, onJoin, loading }) {
  const [serverId, setServerId] = useState('');
  return (
    <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
      <LogIn className="w-4 h-4 flex-shrink-0" style={{ color: colors.text.disabled }} />
      <select value={serverId} onChange={e => setServerId(e.target.value)}
        className="flex-1 text-[13px] bg-transparent outline-none" style={{ color: colors.text.primary }}>
        <option value="">Select a server to join...</option>
        {servers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.member_count || 0} members)</option>)}
      </select>
      <button onClick={() => { if (serverId) onJoin(serverId); }} disabled={loading || !serverId}
        className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-40"
        style={{ background: colors.success, color: '#fff' }}>
        {loading ? '...' : 'Join'}
      </button>
    </div>
  );
}

export default function AdminPanelModal({ onClose }) {
  const [realUsers, setRealUsers] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [allServers, setAllServers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [allMessages, setAllMessages] = useState([]);
  const [allConversations, setAllConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('users');
  const [refreshing, setRefreshing] = useState(false);
  const [dialog, setDialog] = useState(null); // { type, data }
  const [processing, setProcessing] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  const showFeedback = (msg) => { setActionFeedback(msg); setTimeout(() => setActionFeedback(null), 3000); };

  const load = async () => {
    setLoading(true);
    const [users, profiles, servers, members, messages, convos] = await Promise.all([
      base44.entities.User.list(),
      base44.entities.UserProfile.list(),
      base44.entities.Server.list(),
      base44.entities.ServerMember.list(),
      base44.entities.Message.list('-created_date', 50),
      base44.entities.Conversation.list(),
    ]);
    setRealUsers(users);
    setAllProfiles(profiles);
    setAllServers(servers);
    setAllMembers(members);
    setAllMessages(messages);
    setAllConversations(convos);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const profileMap = useMemo(() => {
    const m = {};
    allProfiles.forEach(p => { if (p.user_email) m[p.user_email.toLowerCase()] = p; if (p.user_id) m[p.user_id] = p; });
    return m;
  }, [allProfiles]);

  const enrichedUsers = useMemo(() => {
    return realUsers.map(u => {
      const profile = profileMap[u.email?.toLowerCase()] || profileMap[u.id] || null;
      const memberships = allMembers.filter(m => m.user_id === u.id || m.user_email === u.email);
      const serverIds = memberships.map(m => m.server_id);
      const userServers = allServers.filter(s => serverIds.includes(s.id));
      return {
        ...u, profile, serverCount: userServers.length, servers: userServers,
        isOnline: profile?.is_online || false, displayName: profile?.display_name || u.full_name || u.email,
        avatar: profile?.avatar_url || null, status: profile?.status || 'offline',
        badges: profile?.badges || [], isBanned: profile?.is_banned === true,
      };
    });
  }, [realUsers, profileMap, allMembers, allServers]);

  const onlineCount = enrichedUsers.filter(u => u.isOnline).length;

  const filteredUsers = enrichedUsers.filter(u =>
    (u.displayName || u.email || u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredServers = allServers.filter(s => (s.name || '').toLowerCase().includes(search.toLowerCase()));

  // Actions
  const handleBan = async () => {
    if (!dialog?.data) return;
    setProcessing(true);
    const u = dialog.data;
    const profile = profileMap[u.email?.toLowerCase()] || profileMap[u.id];
    if (profile) await base44.entities.UserProfile.update(profile.id, { is_banned: true, status: 'offline', is_online: false });
    const memberships = allMembers.filter(m => m.user_id === u.id || m.user_email === u.email);
    for (const m of memberships) await base44.entities.ServerMember.delete(m.id);
    setProcessing(false); setDialog(null); showFeedback(`Banned ${u.displayName || u.email}`); refresh();
  };

  const handleUnban = async () => {
    if (!dialog?.data) return;
    setProcessing(true);
    const u = dialog.data;
    const profile = profileMap[u.email?.toLowerCase()] || profileMap[u.id];
    if (profile) await base44.entities.UserProfile.update(profile.id, { is_banned: false });
    setProcessing(false); setDialog(null); showFeedback(`Unbanned ${u.displayName || u.email}`); refresh();
  };

  const handleGrantElite = async (u) => {
    const profile = profileMap[u.email?.toLowerCase()] || profileMap[u.id];
    if (!profile) return;
    const badges = [...new Set([...(profile.badges || []), 'premium'])];
    await base44.entities.UserProfile.update(profile.id, { badges });
    const credits = await base44.entities.UserCredits.filter({ user_id: u.id });
    if (credits.length > 0) await base44.entities.UserCredits.update(credits[0].id, { has_nitro: true });
    else await base44.entities.UserCredits.create({ user_id: u.id, user_email: u.email, balance: 500, has_nitro: true });
    showFeedback(`Granted Elite to ${u.displayName}`); refresh();
  };

  const handleRevokeElite = async (u) => {
    const profile = profileMap[u.email?.toLowerCase()] || profileMap[u.id];
    if (!profile) return;
    const badges = (profile.badges || []).filter(b => b !== 'premium');
    await base44.entities.UserProfile.update(profile.id, { badges });
    showFeedback(`Revoked Elite from ${u.displayName}`); refresh();
  };

  const handleToggleBadge = async (u, badge) => {
    const profile = profileMap[u.email?.toLowerCase()] || profileMap[u.id];
    if (!profile) return;
    const current = profile.badges || [];
    const has = current.includes(badge);
    const badges = has ? current.filter(b => b !== badge) : [...new Set([...current, badge])];
    await base44.entities.UserProfile.update(profile.id, { badges });
    showFeedback(`${has ? 'Removed' : 'Granted'} ${badge} badge ${has ? 'from' : 'to'} ${u.displayName}`); refresh();
  };

  const handleDeleteServer = async (s) => {
    setProcessing(true);
    const serverMembers = allMembers.filter(m => m.server_id === s.id);
    for (const m of serverMembers) await base44.entities.ServerMember.delete(m.id);
    const channels = await base44.entities.Channel.filter({ server_id: s.id });
    for (const c of channels) await base44.entities.Channel.delete(c.id);
    const cats = await base44.entities.Category.filter({ server_id: s.id });
    for (const c of cats) await base44.entities.Category.delete(c.id);
    await base44.entities.Server.delete(s.id);
    setProcessing(false); setDialog(null); showFeedback(`Deleted server ${s.name}`); refresh();
  };

  const handleInviteUser = async (email, role) => {
    setInviting(true);
    await base44.users.inviteUser(email, role);
    setInviting(false); showFeedback(`Invited ${email} as ${role}`); refresh();
  };

  const handleAdminJoinServer = async (serverId) => {
    setJoining(true);
    const me = await base44.auth.me();
    const existing = allMembers.filter(m => m.server_id === serverId && (m.user_id === me.id || m.user_email === me.email));
    if (existing.length === 0) {
      await base44.entities.ServerMember.create({ server_id: serverId, user_id: me.id, user_email: me.email, joined_at: new Date().toISOString(), role_ids: [] });
      const server = allServers.find(s => s.id === serverId);
      if (server) await base44.entities.Server.update(serverId, { member_count: (server.member_count || 1) + 1 });
    }
    setJoining(false); showFeedback('Joined server as admin'); refresh();
  };

  const handleForceAddToServer = async (user, serverId) => {
    const existing = allMembers.filter(m => m.server_id === serverId && (m.user_id === user.id || m.user_email === user.email));
    if (existing.length > 0) { showFeedback('User already in server'); return; }
    await base44.entities.ServerMember.create({ server_id: serverId, user_id: user.id, user_email: user.email, joined_at: new Date().toISOString(), role_ids: [] });
    const server = allServers.find(s => s.id === serverId);
    if (server) await base44.entities.Server.update(serverId, { member_count: (server.member_count || 1) + 1 });
    showFeedback(`Added ${user.displayName} to ${server?.name}`); refresh();
  };

  const handleResetProfile = async (u) => {
    const profile = profileMap[u.email?.toLowerCase()] || profileMap[u.id];
    if (!profile) return;
    await base44.entities.UserProfile.update(profile.id, { bio: '', custom_status: null, banner_url: '', accent_color: '' });
    showFeedback(`Reset profile for ${u.displayName}`); refresh();
  };

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'servers', label: 'Servers', icon: Server },
    { id: 'tools', label: 'Tools', icon: Settings },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  return (
    <ModalWrapper title="Admin Panel" onClose={onClose} width={780}>
      <div className="space-y-4">
        {/* Feedback toast */}
        {actionFeedback && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium k-fade-in"
            style={{ background: 'rgba(59,165,93,0.12)', color: colors.success, border: `1px solid rgba(59,165,93,0.2)` }}>
            <CheckCircle className="w-3.5 h-3.5" /> {actionFeedback}
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-3">
          <StatCard label="Users" value={loading ? '—' : realUsers.length} icon={Users} color={colors.accent.primary} />
          <StatCard label="Online" value={loading ? '—' : onlineCount} icon={Globe} color={colors.status.online} />
          <StatCard label="Servers" value={loading ? '—' : allServers.length} icon={Server} color={colors.warning} />
          <StatCard label="Messages" value={loading ? '—' : allMessages.length + '+'} icon={MessageSquare} color={colors.text.link} />
        </div>

        {/* Tabs + Search */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: colors.bg.elevated }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold capitalize transition-colors"
                style={{ background: tab === t.id ? colors.accent.subtle : 'transparent', color: tab === t.id ? colors.accent.primary : colors.text.muted }}>
                <t.icon className="w-3 h-3" /> {t.label}
              </button>
            ))}
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search...`}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-[13px] outline-none"
              style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
          </div>
          <button onClick={refresh} className="p-2 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.04)]" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} style={{ color: colors.text.muted }} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[420px] overflow-y-auto scrollbar-none space-y-1">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: colors.accent.primary }} />
            </div>
          ) : tab === 'users' ? (
            filteredUsers.length === 0 ? (
              <p className="text-center py-8 text-[13px]" style={{ color: colors.text.muted }}>No users found</p>
            ) : filteredUsers.sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0)).map(u => (
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
                    {u.badges?.includes('developer') && <Code className="w-3 h-3 flex-shrink-0" style={{ color: '#a78bfa' }} />}
                    {u.badges?.includes('tester') && <FlaskConical className="w-3 h-3 flex-shrink-0" style={{ color: '#3ba55c' }} />}
                    {u.isBanned && <Ban className="w-3 h-3 flex-shrink-0" style={{ color: colors.danger }} />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] truncate" style={{ color: colors.text.disabled }}>{u.email}</span>
                    <span className="text-[10px]" style={{ color: colors.text.disabled }}>·</span>
                    <span className="text-[10px]" style={{ color: colors.text.disabled }}>{moment(u.created_date).format('MMM D, YYYY')}</span>
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

                {/* Action buttons - visible on hover */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  {/* Grant/Revoke Elite */}
                  {u.role !== 'admin' && (
                    u.badges?.includes('premium') ? (
                      <button onClick={() => handleRevokeElite(u)} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(255,255,255,0.04)]" title="Revoke Elite">
                        <Crown className="w-3.5 h-3.5" style={{ color: colors.warning }} />
                      </button>
                    ) : (
                      <button onClick={() => handleGrantElite(u)} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(255,255,255,0.04)]" title="Grant Elite">
                        <Crown className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
                      </button>
                    )
                  )}
                  {/* Toggle Developer badge */}
                  <button onClick={() => handleToggleBadge(u, 'developer')} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                    title={u.badges?.includes('developer') ? 'Remove Developer' : 'Grant Developer'}>
                    <Code className="w-3.5 h-3.5" style={{ color: u.badges?.includes('developer') ? '#a78bfa' : colors.text.disabled }} />
                  </button>
                  {/* Toggle Tester badge */}
                  <button onClick={() => handleToggleBadge(u, 'tester')} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(255,255,255,0.04)]"
                    title={u.badges?.includes('tester') ? 'Remove Tester' : 'Grant Tester'}>
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
                            style={{ color: colors.text.secondary }}>
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Reset profile */}
                  <button onClick={() => handleResetProfile(u)} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(255,255,255,0.04)]" title="Reset profile">
                    <RefreshCw className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
                  </button>
                  {/* Ban/Unban */}
                  {u.role !== 'admin' && (
                    u.isBanned ? (
                      <button onClick={() => setDialog({ type: 'unban', data: u })} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(59,165,93,0.12)]" title="Unban">
                        <CheckCircle className="w-3.5 h-3.5" style={{ color: colors.success }} />
                      </button>
                    ) : (
                      <button onClick={() => setDialog({ type: 'ban', data: u })} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(237,66,69,0.12)]" title="Ban">
                        <Ban className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
                      </button>
                    )
                  )}
                </div>
              </div>
            ))
          ) : tab === 'servers' ? (
            filteredServers.length === 0 ? (
              <p className="text-center py-8 text-[13px]" style={{ color: colors.text.muted }}>No servers found</p>
            ) : filteredServers.map(s => {
              const serverMembers = allMembers.filter(m => m.server_id === s.id);
              const onlineInServer = serverMembers.filter(m => { const prof = allProfiles.find(p => p.user_id === m.user_id); return prof?.is_online; });
              const owner = enrichedUsers.find(u => u.id === s.owner_id);
              const amMember = serverMembers.some(m => m.user_email === realUsers.find(u => u.role === 'admin')?.email);
              return (
                <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.02)] group">
                  <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center text-[12px] font-semibold flex-shrink-0"
                    style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                    {s.icon_url ? <img src={s.icon_url} className="w-full h-full object-cover" alt="" /> : (s.name || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-semibold truncate block" style={{ color: colors.text.primary }}>{s.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px]" style={{ color: colors.text.disabled }}>{serverMembers.length} members · {onlineInServer.length} online</span>
                      {owner && <span className="text-[10px]" style={{ color: colors.text.disabled }}>· Owner: {owner.displayName}</span>}
                    </div>
                  </div>
                  {s.is_public && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,165,93,0.12)', color: colors.status.online }}>Public</span>}
                  <span className="text-[11px] font-mono" style={{ color: colors.text.disabled }}>{s.invite_code}</span>
                  {/* Server actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {!amMember && (
                      <button onClick={() => handleAdminJoinServer(s.id)} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(59,165,93,0.12)]" title="Join as admin">
                        <LogIn className="w-3.5 h-3.5" style={{ color: colors.success }} />
                      </button>
                    )}
                    <button onClick={() => navigator.clipboard.writeText(s.invite_code || '').then(() => showFeedback('Copied invite code'))}
                      className="p-1.5 rounded-md transition-colors hover:bg-[rgba(255,255,255,0.04)]" title="Copy invite">
                      <Eye className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
                    </button>
                    <button onClick={() => setDialog({ type: 'delete-server', data: s })}
                      className="p-1.5 rounded-md transition-colors hover:bg-[rgba(237,66,69,0.12)]" title="Delete server">
                      <Trash2 className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : tab === 'tools' ? (
            <div className="space-y-4 py-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: colors.text.disabled }}>Invite User to Kairo</p>
                <InviteUserForm onInvite={handleInviteUser} loading={inviting} />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: colors.text.disabled }}>Join Any Server (Admin)</p>
                <JoinServerForm servers={allServers} onJoin={handleAdminJoinServer} loading={joining} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
                  <Database className="w-4 h-4 mb-2" style={{ color: colors.accent.primary }} />
                  <p className="text-[12px] font-semibold" style={{ color: colors.text.primary }}>Total Profiles</p>
                  <p className="text-[20px] font-bold" style={{ color: colors.text.primary }}>{allProfiles.length}</p>
                </div>
                <div className="p-3 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
                  <MessageSquare className="w-4 h-4 mb-2" style={{ color: colors.warning }} />
                  <p className="text-[12px] font-semibold" style={{ color: colors.text.primary }}>DM Conversations</p>
                  <p className="text-[20px] font-bold" style={{ color: colors.text.primary }}>{allConversations.length}</p>
                </div>
              </div>
            </div>
          ) : tab === 'activity' ? (
            <div className="space-y-1 py-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: colors.text.disabled }}>Recent Messages</p>
              {allMessages.length === 0 ? (
                <p className="text-center py-8 text-[13px]" style={{ color: colors.text.muted }}>No recent messages</p>
              ) : allMessages.slice(0, 30).map(m => (
                <div key={m.id} className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.02)]">
                  <div className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5"
                    style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                    {m.author_avatar ? <img src={m.author_avatar} className="w-full h-full object-cover" alt="" /> : (m.author_name || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold" style={{ color: colors.text.primary }}>{m.author_name || 'Unknown'}</span>
                      <span className="text-[10px]" style={{ color: colors.text.disabled }}>{moment(m.created_date).fromNow()}</span>
                    </div>
                    <p className="text-[12px] truncate" style={{ color: colors.text.secondary }}>{m.content || '[attachment]'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Dialogs */}
      {dialog?.type === 'ban' && (
        <ConfirmDialog title="Ban User from Kairo" subtitle="Remove from all servers" icon={Ban}
          iconBg="rgba(237,66,69,0.12)" iconColor={colors.danger} buttonLabel="Ban User" buttonColor={colors.danger}
          user={dialog.data} onConfirm={handleBan} onCancel={() => setDialog(null)} loading={processing} />
      )}
      {dialog?.type === 'unban' && (
        <ConfirmDialog title="Unban User" subtitle="Restore platform access" icon={CheckCircle}
          iconBg="rgba(59,165,93,0.12)" iconColor={colors.success} buttonLabel="Unban" buttonColor={colors.success}
          user={dialog.data} onConfirm={handleUnban} onCancel={() => setDialog(null)} loading={processing} />
      )}
      {dialog?.type === 'delete-server' && (
        <ConfirmDialog title="Delete Server" subtitle="This will permanently delete the server and all data" icon={Trash2}
          iconBg="rgba(237,66,69,0.12)" iconColor={colors.danger} buttonLabel="Delete Server" buttonColor={colors.danger}
          user={{ displayName: dialog.data.name, email: `${allMembers.filter(m => m.server_id === dialog.data.id).length} members` }}
          onConfirm={() => handleDeleteServer(dialog.data)} onCancel={() => setDialog(null)} loading={processing} />
      )}
    </ModalWrapper>
  );
}