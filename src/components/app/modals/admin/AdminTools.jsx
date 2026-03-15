import React, { useState } from 'react';
import { Mail, LogIn, Database, MessageSquare, Megaphone, Trash2, Send, Zap, Crown, Search, CheckCircle, XCircle, AlertTriangle, Bell } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';

function ToolCard({ children }) {
  return (
    <div className="p-3 rounded-xl space-y-2" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
      {children}
    </div>
  );
}

export default function AdminTools({ allServers, allProfiles, allConversations, showFeedback, onRefresh, currentUser, enrichedUsers, profileMap }) {
  const [eliteQuery, setEliteQuery] = useState('');
  const [eliteLoading, setEliteLoading] = useState(false);
  const [eliteResult, setEliteResult] = useState(null);

  const [revokeQuery, setRevokeQuery] = useState('');
  const [revokeLoading, setRevokeLoading] = useState(false);

  const [announcement, setAnnouncement] = useState('');
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  const [clearingReports, setClearingReports] = useState(false);

  const [joinServerId, setJoinServerId] = useState('');
  const [joining, setJoining] = useState(false);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);

  const findUser = (query) => {
    const q = query.toLowerCase().trim();
    return enrichedUsers?.find(u =>
      u.email?.toLowerCase() === q ||
      u.displayName?.toLowerCase() === q ||
      u.profile?.username?.toLowerCase() === q
    );
  };

  const handleGrantElite = async () => {
    if (!eliteQuery.trim()) return;
    setEliteLoading(true);
    const user = findUser(eliteQuery);
    if (!user) {
      setEliteResult({ success: false, msg: `No user found matching "${eliteQuery}"` });
      setEliteLoading(false);
      return;
    }
    const profile = profileMap?.[user.email?.toLowerCase()] || profileMap?.[user.id];
    if (!profile) {
      setEliteResult({ success: false, msg: 'User has no profile' });
      setEliteLoading(false);
      return;
    }
    const badges = [...new Set([...(profile.badges || []), 'premium', 'kairo_elite'])];
    await base44.entities.UserProfile.update(profile.id, { badges });
    try {
      const credits = await base44.entities.UserCredits.filter({ user_id: user.id });
      if (credits.length > 0) await base44.entities.UserCredits.update(credits[0].id, { has_nitro: true });
      else await base44.entities.UserCredits.create({ user_id: user.id, user_email: user.email, balance: 500, has_nitro: true });
    } catch { /* credits entity may not exist */ }
    setEliteResult({ success: true, msg: `Granted Elite to ${user.displayName || user.email}` });
    showFeedback(`Granted Elite to ${user.displayName}`);
    setEliteQuery('');
    setEliteLoading(false);
    onRefresh();
  };

  const handleRevokeElite = async () => {
    if (!revokeQuery.trim()) return;
    setRevokeLoading(true);
    const user = findUser(revokeQuery);
    if (!user) {
      showFeedback(`No user found matching "${revokeQuery}"`);
      setRevokeLoading(false);
      return;
    }
    const profile = profileMap?.[user.email?.toLowerCase()] || profileMap?.[user.id];
    if (!profile) {
      showFeedback('User has no profile');
      setRevokeLoading(false);
      return;
    }
    const badges = (profile.badges || []).filter(b => b !== 'premium' && b !== 'kairo_elite');
    await base44.entities.UserProfile.update(profile.id, { badges });
    try {
      const credits = await base44.entities.UserCredits.filter({ user_id: user.id });
      if (credits.length > 0) await base44.entities.UserCredits.update(credits[0].id, { has_nitro: false });
    } catch { /* credits entity may not exist */ }
    showFeedback(`Revoked Elite from ${user.displayName || user.email}`);
    setRevokeQuery('');
    setRevokeLoading(false);
    onRefresh();
  };

  const handleSendAnnouncement = async () => {
    if (!announcement.trim()) return;
    setSendingAnnouncement(true);
    let sent = 0;
    for (const server of allServers) {
      try {
        const channels = await base44.entities.Channel.filter({ server_id: server.id });
        const target = channels.find(c => c.type === 'announcement') || channels.find(c => c.type === 'text');
        if (target) {
          await base44.entities.Message.create({
            channel_id: target.id, server_id: server.id, author_id: currentUser.id,
            author_name: '🔔 Kairo', author_avatar: null,
            content: `**Platform Announcement**\n\n${announcement.trim()}`, type: 'system',
          });
          sent++;
        }
      } catch { /* skip failed servers */ }
    }
    setSendingAnnouncement(false);
    setAnnouncement('');
    showFeedback(`Announcement sent to ${sent} server${sent !== 1 ? 's' : ''}`);
  };

  const handleClearReports = async () => {
    if (!confirm('Mark all reports as reviewed? This clears the queue.')) return;
    setClearingReports(true);
    let cleared = 0;
    try {
      const [bugs, features, tickets] = await Promise.all([
        base44.entities.BugReport.list(),
        base44.entities.FeatureRequest.list(),
        base44.entities.SupportTicket.list(),
      ]);
      for (const r of bugs) { await base44.entities.BugReport.update(r.id, { status: 'reviewed' }); cleared++; }
      for (const r of features) { await base44.entities.FeatureRequest.update(r.id, { status: 'reviewed' }); cleared++; }
      for (const r of tickets) { await base44.entities.SupportTicket.update(r.id, { status: 'reviewed' }); cleared++; }
    } catch { /* entities may not exist */ }
    setClearingReports(false);
    showFeedback(`Cleared ${cleared} report${cleared !== 1 ? 's' : ''}`);
  };

  const handleAdminJoinServer = async () => {
    if (!joinServerId) return;
    setJoining(true);
    const existing = await base44.entities.ServerMember.filter({ server_id: joinServerId, user_id: currentUser.id });
    if (existing.length === 0) {
      await base44.entities.ServerMember.create({ server_id: joinServerId, user_id: currentUser.id, user_email: currentUser.email, joined_at: new Date().toISOString(), role_ids: [] });
      const server = allServers.find(s => s.id === joinServerId);
      if (server) await base44.entities.Server.update(joinServerId, { member_count: (server.member_count || 1) + 1 });
    }
    setJoining(false);
    showFeedback('Joined server as admin');
    setJoinServerId('');
    onRefresh();
  };

  const handleInviteUser = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await base44.users.inviteUser(inviteEmail.trim(), inviteRole);
      showFeedback(`Invited ${inviteEmail.trim()} as ${inviteRole}`);
      setInviteEmail('');
    } catch (err) {
      showFeedback(`Couldn't send that invite. ${err.message}`);
    }
    setInviting(false);
    onRefresh();
  };

  return (
    <div className="space-y-4 py-2">
      {/* Grant Elite */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: colors.text.disabled }}>Grant Elite</p>
        <ToolCard>
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 flex-shrink-0" style={{ color: '#f0b232' }} />
            <input value={eliteQuery} onChange={e => { setEliteQuery(e.target.value); setEliteResult(null); }} placeholder="Username or email..."
              className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: colors.text.primary }}
              onKeyDown={e => { if (e.key === 'Enter') handleGrantElite(); }} />
            <button onClick={handleGrantElite} disabled={eliteLoading || !eliteQuery.trim()}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-40"
              style={{ background: '#f0b232', color: '#000' }}>
              {eliteLoading ? '...' : 'Grant'}
            </button>
          </div>
          {eliteResult && (
            <div className="flex items-center gap-2 text-[11px] mt-1" style={{ color: eliteResult.success ? colors.success : colors.danger }}>
              {eliteResult.success ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {eliteResult.msg}
            </div>
          )}
        </ToolCard>
      </div>

      {/* Revoke Elite */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: colors.text.disabled }}>Revoke Elite</p>
        <ToolCard>
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 flex-shrink-0" style={{ color: colors.danger }} />
            <input value={revokeQuery} onChange={e => setRevokeQuery(e.target.value)} placeholder="Username or email..."
              className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: colors.text.primary }}
              onKeyDown={e => { if (e.key === 'Enter') handleRevokeElite(); }} />
            <button onClick={handleRevokeElite} disabled={revokeLoading || !revokeQuery.trim()}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-40"
              style={{ background: colors.danger, color: '#fff' }}>
              {revokeLoading ? '...' : 'Revoke'}
            </button>
          </div>
        </ToolCard>
      </div>

      {/* Platform Announcement */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: colors.text.disabled }}>Platform Announcement</p>
        <ToolCard>
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 flex-shrink-0" style={{ color: colors.warning }} />
            <input value={announcement} onChange={e => setAnnouncement(e.target.value)} placeholder="Type your announcement..."
              className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: colors.text.primary }}
              onKeyDown={e => { if (e.key === 'Enter') handleSendAnnouncement(); }} />
          </div>
          <div className="flex justify-end">
            <button onClick={handleSendAnnouncement} disabled={sendingAnnouncement || !announcement.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-40"
              style={{ background: colors.warning, color: '#000' }}>
              <Send className="w-3 h-3" />
              {sendingAnnouncement ? 'Sending...' : 'Broadcast to All'}
            </button>
          </div>
        </ToolCard>
      </div>

      {/* Clear Reports */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: colors.text.disabled }}>Reports</p>
        <ToolCard>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" style={{ color: colors.warning }} />
              <span className="text-[13px]" style={{ color: colors.text.secondary }}>Mark all reports as reviewed</span>
            </div>
            <button onClick={handleClearReports} disabled={clearingReports}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-40"
              style={{ background: colors.accent.primary, color: '#fff' }}>
              <CheckCircle className="w-3 h-3" />
              {clearingReports ? 'Clearing...' : 'Clear All'}
            </button>
          </div>
        </ToolCard>
      </div>

      {/* Join Any Server */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: colors.text.disabled }}>Join Any Server</p>
        <ToolCard>
          <div className="flex items-center gap-2">
            <LogIn className="w-4 h-4 flex-shrink-0" style={{ color: colors.text.disabled }} />
            <select value={joinServerId} onChange={e => setJoinServerId(e.target.value)}
              className="flex-1 text-[13px] bg-transparent outline-none" style={{ color: colors.text.primary }}>
              <option value="">Select server...</option>
              {allServers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.member_count || 0} members)</option>)}
            </select>
            <button onClick={handleAdminJoinServer} disabled={joining || !joinServerId}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-40"
              style={{ background: colors.success, color: '#fff' }}>
              {joining ? '...' : 'Join'}
            </button>
          </div>
        </ToolCard>
      </div>

      {/* Invite User */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: colors.text.disabled }}>Invite User</p>
        <ToolCard>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 flex-shrink-0" style={{ color: colors.text.disabled }} />
            <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="user@email.com"
              className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: colors.text.primary }} />
            <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
              className="text-[11px] px-2 py-1 rounded-md outline-none" style={{ background: colors.bg.overlay, color: colors.text.secondary, border: `1px solid ${colors.border.default}` }}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={handleInviteUser} disabled={inviting || !inviteEmail.trim()}
              className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-40"
              style={{ background: colors.accent.primary, color: '#fff' }}>
              {inviting ? '...' : 'Invite'}
            </button>
          </div>
        </ToolCard>
      </div>

      {/* Quick Stats */}
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
  );
}
