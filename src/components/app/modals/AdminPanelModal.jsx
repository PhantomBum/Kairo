import React, { useState, useEffect } from 'react';
import { Search, Users, Server, Globe, Shield, Crown, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';

function StatusDot({ status }) {
  const c = { online: colors.status.online, idle: colors.status.idle, dnd: colors.status.dnd }[status] || colors.status.offline;
  return <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c }} />;
}

export default function AdminPanelModal({ onClose }) {
  const { getProfile } = useProfiles();
  const [allServers, setAllServers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('users');
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setLoading(true);
    const [servers, members, profiles] = await Promise.all([
      base44.entities.Server.list(),
      base44.entities.ServerMember.list(),
      base44.entities.UserProfile.list(),
    ]);
    setAllServers(servers);
    setAllMembers(members);
    setAllProfiles(profiles);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const onlineUsers = allProfiles.filter(p => p.is_online);
  const offlineUsers = allProfiles.filter(p => !p.is_online);

  const filteredProfiles = allProfiles.filter(p =>
    (p.display_name || p.username || p.user_email || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredServers = allServers.filter(s =>
    (s.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const getUserServers = (userId) => {
    const memberOf = allMembers.filter(m => m.user_id === userId).map(m => m.server_id);
    return allServers.filter(s => memberOf.includes(s.id));
  };

  return (
    <ModalWrapper title="Admin Panel" onClose={onClose} width={700}>
      <div className="space-y-4">
        {/* Stats bar */}
        <div className="flex gap-3">
          {[
            { label: 'Total Users', value: allProfiles.length, icon: Users, color: colors.accent.primary },
            { label: 'Online Now', value: onlineUsers.length, icon: Globe, color: colors.status.online },
            { label: 'Servers', value: allServers.length, icon: Server, color: colors.warning },
          ].map(s => (
            <div key={s.label} className="flex-1 p-3 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
              <div className="flex items-center gap-2 mb-1">
                <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: colors.text.disabled }}>{s.label}</span>
              </div>
              <p className="text-[22px] font-bold" style={{ color: colors.text.primary }}>{s.value}</p>
            </div>
          ))}
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
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${tab}...`}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-[13px] outline-none"
              style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
          </div>
          <button onClick={refresh} className="p-2 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.04)]" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} style={{ color: colors.text.muted }} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[400px] overflow-y-auto scrollbar-none space-y-1">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: colors.accent.primary }} />
            </div>
          ) : tab === 'users' ? (
            filteredProfiles.length === 0 ? (
              <p className="text-center py-8 text-[13px]" style={{ color: colors.text.muted }}>No users found</p>
            ) : filteredProfiles.sort((a, b) => (b.is_online ? 1 : 0) - (a.is_online ? 1 : 0)).map(p => {
              const userServers = getUserServers(p.user_id);
              return (
                <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                  style={{ border: `1px solid transparent` }}>
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-[13px] font-semibold"
                      style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                      {p.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : (p.display_name || '?')[0].toUpperCase()}
                    </div>
                    <StatusDot status={p.is_online ? (p.status || 'online') : 'offline'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[13px] font-semibold truncate" style={{ color: colors.text.primary }}>{p.display_name || p.username}</span>
                      {p.badges?.includes('owner') && <Crown className="w-3 h-3" style={{ color: '#faa81a' }} />}
                      {p.badges?.includes('admin') && <Shield className="w-3 h-3" style={{ color: colors.accent.primary }} />}
                    </div>
                    <p className="text-[11px] truncate" style={{ color: colors.text.disabled }}>{p.user_email}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Server className="w-3 h-3" style={{ color: colors.text.disabled }} />
                    <span className="text-[11px]" style={{ color: colors.text.disabled }}>{userServers.length}</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: p.is_online ? 'rgba(59,165,93,0.12)' : 'rgba(255,255,255,0.04)', color: p.is_online ? colors.status.online : colors.text.disabled }}>
                    {p.is_online ? 'Online' : 'Offline'}
                  </span>
                </div>
              );
            })
          ) : (
            filteredServers.length === 0 ? (
              <p className="text-center py-8 text-[13px]" style={{ color: colors.text.muted }}>No servers found</p>
            ) : filteredServers.map(s => {
              const serverMembers = allMembers.filter(m => m.server_id === s.id);
              const onlineInServer = serverMembers.filter(m => {
                const prof = allProfiles.find(p => p.user_id === m.user_id);
                return prof?.is_online;
              });
              return (
                <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.02)]">
                  <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center text-[12px] font-semibold flex-shrink-0"
                    style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                    {s.icon_url ? <img src={s.icon_url} className="w-full h-full object-cover" /> : (s.name || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-semibold truncate block" style={{ color: colors.text.primary }}>{s.name}</span>
                    <p className="text-[11px]" style={{ color: colors.text.disabled }}>
                      {serverMembers.length} members · {onlineInServer.length} online
                    </p>
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
    </ModalWrapper>
  );
}