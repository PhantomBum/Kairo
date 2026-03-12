import React, { useState, useEffect, useMemo } from 'react';
import { Search, Users, Server, Globe, Shield, Crown, RefreshCw, Ban, CheckCircle, AlertTriangle, Mail, Calendar } from 'lucide-react';
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

function BanConfirmDialog({ user, onConfirm, onCancel, isBanning }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onCancel}>
      <div className="rounded-2xl p-5 w-[380px] space-y-4" style={{ background: colors.bg.modal, border: `1px solid ${colors.border.light}` }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(237,66,69,0.12)' }}>
            <Ban className="w-5 h-5" style={{ color: colors.danger }} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold" style={{ color: colors.text.primary }}>Ban User from Kairo</h3>
            <p className="text-[12px]" style={{ color: colors.text.muted }}>This will ban them platform-wide</p>
          </div>
        </div>
        <div className="p-3 rounded-lg" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
          <p className="text-[13px] font-medium" style={{ color: colors.text.primary }}>{user.full_name || user.email}</p>
          <p className="text-[11px]" style={{ color: colors.text.disabled }}>{user.email}</p>
        </div>
        <p className="text-[12px]" style={{ color: colors.text.muted }}>
          This user will be removed from all servers and blocked from accessing Kairo. This action can be undone later.
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.04)]"
            style={{ color: colors.text.secondary }}>Cancel</button>
          <button onClick={onConfirm} disabled={isBanning}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-colors"
            style={{ background: colors.danger, opacity: isBanning ? 0.6 : 1 }}>
            {isBanning ? 'Banning...' : 'Ban User'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UnbanConfirmDialog({ user, onConfirm, onCancel, isUnbanning }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={onCancel}>
      <div className="rounded-2xl p-5 w-[380px] space-y-4" style={{ background: colors.bg.modal, border: `1px solid ${colors.border.light}` }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(59,165,93,0.12)' }}>
            <CheckCircle className="w-5 h-5" style={{ color: colors.success }} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold" style={{ color: colors.text.primary }}>Unban User</h3>
            <p className="text-[12px]" style={{ color: colors.text.muted }}>Restore platform access</p>
          </div>
        </div>
        <div className="p-3 rounded-lg" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
          <p className="text-[13px] font-medium" style={{ color: colors.text.primary }}>{user.full_name || user.email}</p>
          <p className="text-[11px]" style={{ color: colors.text.disabled }}>{user.email}</p>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.04)]"
            style={{ color: colors.text.secondary }}>Cancel</button>
          <button onClick={onConfirm} disabled={isUnbanning}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-colors"
            style={{ background: colors.success, opacity: isUnbanning ? 0.6 : 1 }}>
            {isUnbanning ? 'Unbanning...' : 'Unban User'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanelModal({ onClose }) {
  const [realUsers, setRealUsers] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [allServers, setAllServers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('users');
  const [refreshing, setRefreshing] = useState(false);
  const [banTarget, setBanTarget] = useState(null);
  const [unbanTarget, setUnbanTarget] = useState(null);
  const [isBanning, setIsBanning] = useState(false);

  const load = async () => {
    setLoading(true);
    const [users, profiles, servers, members] = await Promise.all([
      base44.entities.User.list(),
      base44.entities.UserProfile.list(),
      base44.entities.Server.list(),
      base44.entities.ServerMember.list(),
    ]);
    setRealUsers(users);
    setAllProfiles(profiles);
    setAllServers(servers);
    setAllMembers(members);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  // Build enriched user list from REAL User entity, cross-referenced with profiles
  const profileMap = useMemo(() => {
    const m = {};
    allProfiles.forEach(p => {
      if (p.user_email) m[p.user_email.toLowerCase()] = p;
      if (p.user_id) m[p.user_id] = p;
    });
    return m;
  }, [allProfiles]);

  const enrichedUsers = useMemo(() => {
    return realUsers.map(u => {
      const profile = profileMap[u.email?.toLowerCase()] || profileMap[u.id] || null;
      const memberships = allMembers.filter(m => m.user_id === u.id || m.user_email === u.email);
      const serverIds = memberships.map(m => m.server_id);
      const userServers = allServers.filter(s => serverIds.includes(s.id));
      return {
        ...u,
        profile,
        serverCount: userServers.length,
        servers: userServers,
        isOnline: profile?.is_online || false,
        displayName: profile?.display_name || u.full_name || u.email,
        avatar: profile?.avatar_url || null,
        status: profile?.status || 'offline',
        badges: profile?.badges || [],
        isBanned: profile?.is_banned === true,
      };
    });
  }, [realUsers, profileMap, allMembers, allServers]);

  const onlineCount = enrichedUsers.filter(u => u.isOnline).length;

  const filteredUsers = enrichedUsers.filter(u =>
    (u.displayName || u.email || u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredServers = allServers.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleBan = async () => {
    if (!banTarget) return;
    setIsBanning(true);
    const profile = profileMap[banTarget.email?.toLowerCase()] || profileMap[banTarget.id];
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { is_banned: true, status: 'offline', is_online: false });
    }
    // Remove from all servers
    const memberships = allMembers.filter(m => m.user_id === banTarget.id || m.user_email === banTarget.email);
    for (const m of memberships) {
      await base44.entities.ServerMember.delete(m.id);
    }
    setIsBanning(false);
    setBanTarget(null);
    refresh();
  };

  const handleUnban = async () => {
    if (!unbanTarget) return;
    setIsBanning(true);
    const profile = profileMap[unbanTarget.email?.toLowerCase()] || profileMap[unbanTarget.id];
    if (profile) {
      await base44.entities.UserProfile.update(profile.id, { is_banned: false });
    }
    setIsBanning(false);
    setUnbanTarget(null);
    refresh();
  };

  return (
    <ModalWrapper title="Admin Panel" onClose={onClose} width={720}>
      <div className="space-y-4">
        {/* Stats */}
        <div className="flex gap-3">
          <StatCard label="Real Users" value={loading ? '—' : realUsers.length} icon={Users} color={colors.accent.primary} />
          <StatCard label="Online Now" value={loading ? '—' : onlineCount} icon={Globe} color={colors.status.online} />
          <StatCard label="Servers" value={loading ? '—' : allServers.length} icon={Server} color={colors.warning} />
        </div>

        {/* Tabs + Search */}
        <div className="flex items-center gap-3">
          <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: colors.bg.elevated }}>
            {['users', 'servers'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-3 py-1.5 rounded-md text-[12px] font-semibold capitalize transition-colors"
                style={{ background: tab === t ? colors.accent.subtle : 'transparent', color: tab === t ? colors.accent.primary : colors.text.muted }}>
                {t}
              </button>
            ))}
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${tab}...`}
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
              <div key={u.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                style={{ opacity: u.isBanned ? 0.5 : 1 }}>
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-[13px] font-semibold"
                    style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                    {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt="" /> : (u.displayName || '?')[0].toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <StatusDot status={u.isOnline ? (u.status || 'online') : 'offline'} />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-semibold truncate" style={{ color: colors.text.primary }}>{u.displayName}</span>
                    {u.badges?.includes('owner') && <Crown className="w-3 h-3 flex-shrink-0" style={{ color: '#faa81a' }} />}
                    {u.badges?.includes('admin') && <Shield className="w-3 h-3 flex-shrink-0" style={{ color: colors.accent.primary }} />}
                    {u.isBanned && <Ban className="w-3 h-3 flex-shrink-0" style={{ color: colors.danger }} />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] truncate" style={{ color: colors.text.disabled }}>{u.email}</span>
                    <span className="text-[10px]" style={{ color: colors.text.disabled }}>·</span>
                    <span className="text-[10px]" style={{ color: colors.text.disabled }}>{moment(u.created_date).format('MMM D, YYYY')}</span>
                  </div>
                </div>

                {/* Server count */}
                <div className="flex items-center gap-1 flex-shrink-0" title={`In ${u.serverCount} server(s)`}>
                  <Server className="w-3 h-3" style={{ color: colors.text.disabled }} />
                  <span className="text-[11px]" style={{ color: colors.text.disabled }}>{u.serverCount}</span>
                </div>

                {/* Status badge */}
                <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    background: u.isBanned ? 'rgba(237,66,69,0.12)' : u.isOnline ? 'rgba(59,165,93,0.12)' : 'rgba(255,255,255,0.04)',
                    color: u.isBanned ? colors.danger : u.isOnline ? colors.status.online : colors.text.disabled
                  }}>
                  {u.isBanned ? 'Banned' : u.isOnline ? 'Online' : 'Offline'}
                </span>

                {/* Ban/Unban button */}
                {u.role !== 'admin' && (
                  u.isBanned ? (
                    <button onClick={() => setUnbanTarget(u)} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(59,165,93,0.12)]" title="Unban user">
                      <CheckCircle className="w-3.5 h-3.5" style={{ color: colors.success }} />
                    </button>
                  ) : (
                    <button onClick={() => setBanTarget(u)} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(237,66,69,0.12)]" title="Ban user">
                      <Ban className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
                    </button>
                  )
                )}
              </div>
            ))
          ) : (
            filteredServers.length === 0 ? (
              <p className="text-center py-8 text-[13px]" style={{ color: colors.text.muted }}>No servers found</p>
            ) : filteredServers.map(s => {
              const serverMembers = allMembers.filter(m => m.server_id === s.id);
              const onlineInServer = serverMembers.filter(m => {
                const prof = allProfiles.find(p => p.user_id === m.user_id);
                return prof?.is_online;
              });
              const owner = enrichedUsers.find(u => u.id === s.owner_id);
              return (
                <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.02)]">
                  <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center text-[12px] font-semibold flex-shrink-0"
                    style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                    {s.icon_url ? <img src={s.icon_url} className="w-full h-full object-cover" alt="" /> : (s.name || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-semibold truncate block" style={{ color: colors.text.primary }}>{s.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px]" style={{ color: colors.text.disabled }}>
                        {serverMembers.length} members · {onlineInServer.length} online
                      </span>
                      {owner && <span className="text-[10px]" style={{ color: colors.text.disabled }}>· Owner: {owner.displayName}</span>}
                    </div>
                  </div>
                  {s.is_public && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,165,93,0.12)', color: colors.status.online }}>Public</span>
                  )}
                  <span className="text-[11px] font-mono" style={{ color: colors.text.disabled }}>{s.invite_code}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {banTarget && <BanConfirmDialog user={banTarget} onConfirm={handleBan} onCancel={() => setBanTarget(null)} isBanning={isBanning} />}
      {unbanTarget && <UnbanConfirmDialog user={unbanTarget} onConfirm={handleUnban} onCancel={() => setUnbanTarget(null)} isUnbanning={isBanning} />}
    </ModalWrapper>
  );
}