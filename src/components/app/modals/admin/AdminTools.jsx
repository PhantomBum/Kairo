import React, { useState } from 'react';
import { Mail, LogIn, Database, MessageSquare, Megaphone, Trash2, Send, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';

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

export default function AdminTools({ allServers, allProfiles, allConversations, showFeedback, onRefresh, currentUser }) {
  const [inviting, setInviting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinServerId, setJoinServerId] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  const [purgeChannelId, setPurgeChannelId] = useState('');
  const [purging, setPurging] = useState(false);

  const handleInviteUser = async (email, role) => {
    setInviting(true);
    await base44.users.inviteUser(email, role);
    setInviting(false);
    showFeedback(`Invited ${email} as ${role}`);
    onRefresh();
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

  const handleSendAnnouncement = async () => {
    if (!announcement.trim()) return;
    setSendingAnnouncement(true);
    // Post system message to all server announcement channels (or first text channel)
    for (const server of allServers) {
      const channels = await base44.entities.Channel.filter({ server_id: server.id });
      const target = channels.find(c => c.type === 'announcement') || channels.find(c => c.type === 'text');
      if (target) {
        await base44.entities.Message.create({
          channel_id: target.id, server_id: server.id, author_id: currentUser.id,
          author_name: '🔔 System', content: announcement.trim(), type: 'system',
        });
      }
    }
    setSendingAnnouncement(false);
    setAnnouncement('');
    showFeedback('Announcement sent to all servers');
  };

  const handlePurgeChannel = async () => {
    if (!purgeChannelId) return;
    if (!confirm('Delete ALL messages in this channel? This cannot be undone.')) return;
    setPurging(true);
    const msgs = await base44.entities.Message.filter({ channel_id: purgeChannelId });
    for (const m of msgs) await base44.entities.Message.delete(m.id);
    setPurging(false);
    setPurgeChannelId('');
    showFeedback(`Purged ${msgs.length} messages`);
    onRefresh();
  };

  return (
    <div className="space-y-5 py-2">
      {/* Invite User */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: colors.text.disabled }}>Invite User to Kairo</p>
        <InviteUserForm onInvite={handleInviteUser} loading={inviting} />
      </div>

      {/* Join Any Server */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: colors.text.disabled }}>Join Any Server (Admin)</p>
        <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
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
      </div>

      {/* System Announcement */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: colors.text.disabled }}>System Announcement (All Servers)</p>
        <div className="p-3 rounded-xl space-y-2" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 flex-shrink-0" style={{ color: colors.warning }} />
            <input value={announcement} onChange={e => setAnnouncement(e.target.value)} placeholder="Type your announcement..."
              className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: colors.text.primary }} />
          </div>
          <div className="flex justify-end">
            <button onClick={handleSendAnnouncement} disabled={sendingAnnouncement || !announcement.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-40"
              style={{ background: colors.warning, color: '#000' }}>
              <Send className="w-3 h-3" />
              {sendingAnnouncement ? 'Sending...' : 'Broadcast'}
            </button>
          </div>
        </div>
      </div>

      {/* Purge Channel */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: colors.text.disabled }}>Purge Channel Messages</p>
        <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
          <Trash2 className="w-4 h-4 flex-shrink-0" style={{ color: colors.danger }} />
          <input value={purgeChannelId} onChange={e => setPurgeChannelId(e.target.value)} placeholder="Paste channel ID..."
            className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: colors.text.primary }} />
          <button onClick={handlePurgeChannel} disabled={purging || !purgeChannelId.trim()}
            className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors disabled:opacity-40"
            style={{ background: colors.danger, color: '#fff' }}>
            {purging ? 'Purging...' : 'Purge'}
          </button>
        </div>
      </div>

      {/* Stats */}
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