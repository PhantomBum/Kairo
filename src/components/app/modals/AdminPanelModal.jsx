import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Users, Server, Globe, Shield, RefreshCw, MessageSquare, Settings, Activity, Inbox, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';
import moment from 'moment';
import AdminUsers from './admin/AdminUsers';
import AdminServers from './admin/AdminServers';
import AdminEditUser from './admin/AdminEditUser';
import AdminDMs from './admin/AdminDMs';
import AdminTools from './admin/AdminTools';
import AdminActivity from './admin/AdminActivity';

const ADMIN_EMAILS = ['ilikebagels1612@gmail.com', 'rdw1612@gmail.com'];

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="flex-1 p-3 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: colors.text.disabled }}>{label}</span>
      </div>
      <p className="text-[22px] font-bold" style={{ color: colors.text.primary }}>{value}</p>
      {sub && <p className="text-[11px] mt-0.5" style={{ color: colors.text.disabled }}>{sub}</p>}
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
  const [totalMessageCount, setTotalMessageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('users');
  const [refreshing, setRefreshing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authorized, setAuthorized] = useState(null);

  const showFeedback = useCallback((msg) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3000);
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      setCurrentUser(me);
      if (!ADMIN_EMAILS.includes(me?.email?.toLowerCase())) {
        setAuthorized(false);
        setLoading(false);
        return;
      }
      setAuthorized(true);

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

      try {
        const allMsgs = await base44.entities.Message.list();
        setTotalMessageCount(allMsgs.length);
      } catch {
        setTotalMessageCount(messages.length);
      }
    } catch (err) {
      console.error('Admin load error:', err);
    }
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
        joinDate: u.created_date, messageCount: 0,
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

  if (authorized === false) {
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)' }}>
        <div className="rounded-2xl p-8 text-center max-w-sm" style={{ background: colors.bg.surface, border: `1px solid ${colors.border.default}` }}>
          <Shield className="w-10 h-10 mx-auto mb-3" style={{ color: colors.danger }} />
          <p className="text-[16px] font-bold mb-2" style={{ color: colors.text.primary }}>Access Denied</p>
          <p className="text-[13px] mb-4" style={{ color: colors.text.muted }}>You don't have permission to access the admin panel.</p>
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-[13px] font-semibold text-white" style={{ background: colors.accent.primary }}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-[880px] max-w-[95vw] max-h-[85vh] rounded-2xl overflow-hidden flex flex-col k-fade-in"
        style={{ background: colors.bg.surface, border: `1px solid ${colors.border.default}`, boxShadow: '0 24px 80px rgba(0,0,0,0.7)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${colors.border.default}` }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(123,108,246,0.15)' }}>
              <Shield className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div>
              <h2 className="text-[16px] font-bold" style={{ color: colors.text.primary }}>Admin Panel</h2>
              <p className="text-[11px]" style={{ color: colors.text.disabled }}>Kairo Platform Administration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.06)]">
            <X className="w-5 h-5" style={{ color: colors.text.muted }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {actionFeedback && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium k-fade-in"
              style={{ background: 'rgba(59,165,93,0.12)', color: colors.success, border: `1px solid rgba(59,165,93,0.2)` }}>
              <Shield className="w-3.5 h-3.5" /> {actionFeedback}
            </div>
          )}

          {/* Stats */}
          <div className="flex gap-3">
            <StatCard label="Users" value={loading ? '—' : realUsers.length} icon={Users} color={colors.accent.primary} />
            <StatCard label="Online" value={loading ? '—' : onlineCount} icon={Globe} color={colors.status.online} sub={loading ? '' : `${Math.round((onlineCount / (realUsers.length || 1)) * 100)}% active`} />
            <StatCard label="Servers" value={loading ? '—' : allServers.length} icon={Server} color={colors.warning} />
            <StatCard label="Messages" value={loading ? '—' : totalMessageCount.toLocaleString()} icon={MessageSquare} color={colors.text.link} />
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
              <AdminDMs search={search} showFeedback={showFeedback} onRefresh={refresh} allConversations={allConversations} />
            ) : tab === 'tools' ? (
              <AdminTools allServers={allServers} allProfiles={allProfiles} allConversations={allConversations}
                showFeedback={showFeedback} onRefresh={refresh} currentUser={currentUser} enrichedUsers={enrichedUsers} profileMap={profileMap} />
            ) : tab === 'activity' ? (
              <AdminActivity enrichedUsers={enrichedUsers} allServers={allServers} allMessages={allMessages} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
