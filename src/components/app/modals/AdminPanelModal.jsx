import React, { useState, useEffect, useMemo } from 'react';
import { Search, Users, Server, Globe, Shield, RefreshCw, MessageSquare, Settings, Activity, Inbox } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';
import moment from 'moment';
import AdminUsers from './admin/AdminUsers';
import AdminServers from './admin/AdminServers';
import AdminEditUser from './admin/AdminEditUser';
import AdminDMs from './admin/AdminDMs';
import AdminTools from './admin/AdminTools';

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
  const [actionFeedback, setActionFeedback] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const showFeedback = (msg) => { setActionFeedback(msg); setTimeout(() => setActionFeedback(null), 3000); };

  const load = async () => {
    setLoading(true);
    const [me, users, profiles, servers, members, messages, convos] = await Promise.all([
      base44.auth.me(),
      base44.entities.User.list(),
      base44.entities.UserProfile.list(),
      base44.entities.Server.list(),
      base44.entities.ServerMember.list(),
      base44.entities.Message.list('-created_date', 50),
      base44.entities.Conversation.list(),
    ]);
    setCurrentUser(me);
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

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'servers', label: 'Servers', icon: Server },
    { id: 'dms', label: 'DMs', icon: Inbox },
    { id: 'tools', label: 'Tools', icon: Settings },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  return (
    <ModalWrapper title="Admin Panel" onClose={onClose} width={820}>
      <div className="space-y-4">
        {actionFeedback && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium k-fade-in"
            style={{ background: 'rgba(59,165,93,0.12)', color: colors.success, border: `1px solid rgba(59,165,93,0.2)` }}>
            <Shield className="w-3.5 h-3.5" /> {actionFeedback}
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
          <div className="flex gap-0.5 p-0.5 rounded-lg overflow-x-auto scrollbar-none" style={{ background: colors.bg.elevated }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => { setTab(t.id); setEditingUser(null); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold capitalize transition-colors whitespace-nowrap"
                style={{ background: tab === t.id ? colors.accent.subtle : 'transparent', color: tab === t.id ? colors.accent.primary : colors.text.muted }}>
                <t.icon className="w-3 h-3" /> {t.label}
              </button>
            ))}
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-[13px] outline-none"
              style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
          </div>
          <button onClick={refresh} className="p-2 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.04)]" title="Refresh">
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} style={{ color: colors.text.muted }} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[450px] overflow-y-auto scrollbar-none">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-5 h-5 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: colors.accent.primary }} />
            </div>
          ) : editingUser ? (
            <AdminEditUser user={editingUser} profileMap={profileMap} onBack={() => setEditingUser(null)} onRefresh={refresh} showFeedback={showFeedback} />
          ) : tab === 'users' ? (
            <AdminUsers enrichedUsers={enrichedUsers} allServers={allServers} allMembers={allMembers} profileMap={profileMap}
              search={search} onRefresh={refresh} showFeedback={showFeedback} onEditUser={(u) => setEditingUser(u)} />
          ) : tab === 'servers' ? (
            <AdminServers allServers={allServers} allMembers={allMembers} allProfiles={allProfiles} enrichedUsers={enrichedUsers}
              search={search} onRefresh={refresh} showFeedback={showFeedback} currentUser={currentUser} />
          ) : tab === 'dms' ? (
            <AdminDMs search={search} showFeedback={showFeedback} onRefresh={refresh} />
          ) : tab === 'tools' ? (
            <AdminTools allServers={allServers} allProfiles={allProfiles} allConversations={allConversations}
              showFeedback={showFeedback} onRefresh={refresh} currentUser={currentUser} />
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
    </ModalWrapper>
  );
}