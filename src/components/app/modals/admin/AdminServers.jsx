import React, { useState } from 'react';
import { Server, Globe, LogIn, Eye, Trash2, Edit3, Plus, Hash, Volume2, Star, StarOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';
import moment from 'moment';

export default function AdminServers({ allServers, allMembers, allProfiles, enrichedUsers, search, onRefresh, showFeedback, currentUser }) {
  const [editingServer, setEditingServer] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addingChannel, setAddingChannel] = useState(null);
  const [channelForm, setChannelForm] = useState({ name: '', type: 'text' });

  const filteredServers = allServers.filter(s => (s.name || '').toLowerCase().includes(search.toLowerCase()));

  const handleAdminJoinServer = async (serverId) => {
    const existing = allMembers.filter(m => m.server_id === serverId && (m.user_id === currentUser.id || m.user_email === currentUser.email));
    if (existing.length === 0) {
      await base44.entities.ServerMember.create({ server_id: serverId, user_id: currentUser.id, user_email: currentUser.email, joined_at: new Date().toISOString(), role_ids: [] });
      const server = allServers.find(s => s.id === serverId);
      if (server) await base44.entities.Server.update(serverId, { member_count: (server.member_count || 1) + 1 });
    }
    showFeedback('Joined server as admin');
    onRefresh();
  };

  const handleDeleteServer = async (s) => {
    if (!confirm(`Permanently delete "${s.name}"? This deletes all its data and can't be undone.`)) return;
    const serverMembers = allMembers.filter(m => m.server_id === s.id);
    for (const m of serverMembers) await base44.entities.ServerMember.delete(m.id);
    const channels = await base44.entities.Channel.filter({ server_id: s.id });
    for (const c of channels) await base44.entities.Channel.delete(c.id);
    const cats = await base44.entities.Category.filter({ server_id: s.id });
    for (const c of cats) await base44.entities.Category.delete(c.id);
    await base44.entities.Server.delete(s.id);
    showFeedback(`Deleted server ${s.name}`);
    onRefresh();
  };

  const handleEditServer = async () => {
    if (!editingServer) return;
    const updates = {};
    if (editForm.name?.trim()) updates.name = editForm.name.trim();
    if (editForm.description !== undefined) updates.description = editForm.description;
    if (editForm.is_public !== undefined) updates.is_public = editForm.is_public;
    await base44.entities.Server.update(editingServer.id, updates);
    showFeedback(`Updated ${editForm.name || editingServer.name}`);
    setEditingServer(null);
    onRefresh();
  };

  const handleFeatureOnDiscovery = async (s) => {
    await base44.entities.Server.update(s.id, { is_featured: true, is_public: true });
    showFeedback(`Featured ${s.name} on Discovery`);
    onRefresh();
  };

  const handleRemoveFromDiscovery = async (s) => {
    await base44.entities.Server.update(s.id, { is_featured: false });
    showFeedback(`Removed ${s.name} from Discovery`);
    onRefresh();
  };

  const handleAddChannel = async () => {
    if (!addingChannel || !channelForm.name.trim()) return;
    await base44.entities.Channel.create({ server_id: addingChannel, name: channelForm.name.trim(), type: channelForm.type, position: 0 });
    showFeedback(`Created #${channelForm.name.trim()}`);
    setAddingChannel(null);
    setChannelForm({ name: '', type: 'text' });
    onRefresh();
  };

  const startEdit = (s) => {
    setEditingServer(s);
    setEditForm({ name: s.name, description: s.description || '', is_public: s.is_public || false });
  };

  if (filteredServers.length === 0) return <p className="text-center py-8 text-[13px]" style={{ color: colors.text.muted }}>No servers found</p>;

  return (
    <div className="space-y-1">
      {editingServer && (
        <div className="p-4 rounded-xl mb-3 space-y-3 k-fade-in" style={{ background: colors.bg.elevated, border: `1px solid ${colors.accent.subtle}` }}>
          <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: colors.accent.primary }}>Edit Server</p>
          <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} placeholder="Server name"
            className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ background: colors.bg.overlay, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
          <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} placeholder="Description"
            className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none h-16" style={{ background: colors.bg.overlay, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={editForm.is_public} onChange={e => setEditForm({ ...editForm, is_public: e.target.checked })} className="w-4 h-4 rounded" />
            <span className="text-[12px]" style={{ color: colors.text.secondary }}>Public server</span>
          </label>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditingServer(null)} className="px-3 py-1.5 rounded-lg text-[12px]" style={{ color: colors.text.muted }}>Cancel</button>
            <button onClick={handleEditServer} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white" style={{ background: colors.accent.primary }}>Save</button>
          </div>
        </div>
      )}

      {addingChannel && (
        <div className="p-4 rounded-xl mb-3 space-y-3 k-fade-in" style={{ background: colors.bg.elevated, border: `1px solid ${colors.accent.subtle}` }}>
          <p className="text-[12px] font-semibold uppercase tracking-wider" style={{ color: colors.success }}>Add Channel to {allServers.find(s => s.id === addingChannel)?.name}</p>
          <div className="flex gap-2">
            <input value={channelForm.name} onChange={e => setChannelForm({ ...channelForm, name: e.target.value })} placeholder="Channel name"
              className="flex-1 px-3 py-2 rounded-lg text-[13px] outline-none" style={{ background: colors.bg.overlay, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
            <select value={channelForm.type} onChange={e => setChannelForm({ ...channelForm, type: e.target.value })}
              className="px-2 py-2 rounded-lg text-[12px] outline-none" style={{ background: colors.bg.overlay, color: colors.text.secondary, border: `1px solid ${colors.border.default}` }}>
              <option value="text">Text</option>
              <option value="voice">Voice</option>
              <option value="announcement">Announcement</option>
              <option value="forum">Forum</option>
              <option value="board">Board</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setAddingChannel(null)} className="px-3 py-1.5 rounded-lg text-[12px]" style={{ color: colors.text.muted }}>Cancel</button>
            <button onClick={handleAddChannel} disabled={!channelForm.name.trim()} className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white disabled:opacity-40" style={{ background: colors.success }}>Create</button>
          </div>
        </div>
      )}

      {filteredServers.map(s => {
        const serverMembers = allMembers.filter(m => m.server_id === s.id);
        const onlineInServer = serverMembers.filter(m => { const prof = allProfiles.find(p => p.user_id === m.user_id); return prof?.is_online; });
        const owner = enrichedUsers.find(u => u.id === s.owner_id);
        const amMember = serverMembers.some(m => m.user_email === currentUser.email);
        const isFeatured = s.is_featured;
        return (
          <div key={s.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.02)] group">
            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center text-[12px] font-semibold flex-shrink-0"
              style={{ background: colors.bg.overlay, color: colors.text.muted }}>
              {s.icon_url ? <img src={s.icon_url} className="w-full h-full object-cover" alt="" /> : (s.name || '?').slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-semibold truncate" style={{ color: colors.text.primary }}>{s.name}</span>
                {isFeatured && <Star className="w-3 h-3 flex-shrink-0" style={{ color: '#f0b232' }} />}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px]" style={{ color: colors.text.disabled }}>{serverMembers.length} members · {onlineInServer.length} online</span>
                {owner && <span className="text-[11px]" style={{ color: colors.text.disabled }}>· Owner: {owner.displayName}</span>}
                {s.created_date && <span className="text-[11px]" style={{ color: colors.text.disabled }}>· {moment(s.created_date).format('MMM D, YYYY')}</span>}
              </div>
            </div>
            {s.is_public && <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,165,93,0.12)', color: colors.status.online }}>Public</span>}
            {s.boost_level > 0 && <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(240,178,50,0.12)', color: '#f0b232' }}>Lvl {s.boost_level}</span>}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button onClick={() => startEdit(s)} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(123,108,246,0.15)]" title="Edit server">
                <Edit3 className="w-3.5 h-3.5" style={{ color: colors.accent.primary }} />
              </button>
              <button onClick={() => setAddingChannel(s.id)} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(59,165,93,0.12)]" title="Add channel">
                <Plus className="w-3.5 h-3.5" style={{ color: colors.success }} />
              </button>
              {isFeatured ? (
                <button onClick={() => handleRemoveFromDiscovery(s)} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(237,66,69,0.12)]" title="Remove from Discovery">
                  <StarOff className="w-3.5 h-3.5" style={{ color: colors.danger }} />
                </button>
              ) : (
                <button onClick={() => handleFeatureOnDiscovery(s)} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(240,178,50,0.12)]" title="Feature on Discovery">
                  <Star className="w-3.5 h-3.5" style={{ color: '#f0b232' }} />
                </button>
              )}
              {!amMember && (
                <button onClick={() => handleAdminJoinServer(s.id)} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(59,165,93,0.12)]" title="Join as admin">
                  <LogIn className="w-3.5 h-3.5" style={{ color: colors.success }} />
                </button>
              )}
              <button onClick={() => navigator.clipboard.writeText(s.invite_code || '').then(() => showFeedback('Copied invite code'))}
                className="p-1.5 rounded-md transition-colors hover:bg-[rgba(255,255,255,0.04)]" title="Copy invite">
                <Eye className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
              </button>
              <button onClick={() => handleDeleteServer(s)} className="p-1.5 rounded-md transition-colors hover:bg-[rgba(237,66,69,0.12)]" title="Delete server">
                <Trash2 className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
