import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Settings, Shield, Users, Trash2, Image, Hash, Plus, X, ChevronRight, Crown, Ban, Clock } from 'lucide-react';
import ModalWrapper from './ModalWrapper';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Settings },
  { id: 'roles', label: 'Roles', icon: Shield },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'danger', label: 'Danger Zone', icon: Trash2 },
];

function RoleEditor({ role, onSave, onDelete, isNew }) {
  const [name, setName] = useState(role?.name || '');
  const [color, setColor] = useState(role?.color || '#99AAB5');
  const [hoist, setHoist] = useState(role?.hoist || false);
  const [mentionable, setMentionable] = useState(role?.mentionable || false);
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899', '#99AAB5', '#e8e6e1'];

  return (
    <div className="space-y-3 p-3 rounded-lg" style={{ background: 'var(--bg)' }}>
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Role Name</label>
        <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
      </div>
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Color</label>
        <div className="flex gap-1.5 flex-wrap">
          {colors.map(c => (
            <button key={c} onClick={() => setColor(c)} className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
              style={{ background: c, borderColor: color === c ? 'var(--text-primary)' : 'transparent' }} />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={hoist} onChange={e => setHoist(e.target.checked)} className="rounded" />
          Display separately
        </label>
        <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--text-secondary)' }}>
          <input type="checkbox" checked={mentionable} onChange={e => setMentionable(e.target.checked)} className="rounded" />
          Mentionable
        </label>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave({ name, color, hoist, mentionable })} disabled={!name.trim()}
          className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
          style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>Save</button>
        {!role?.is_default && onDelete && (
          <button onClick={onDelete} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-400/10">Delete</button>
        )}
      </div>
    </div>
  );
}

export default function ServerSettingsModal({ onClose, server, currentUserId }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [name, setName] = useState(server?.name || '');
  const [desc, setDesc] = useState(server?.description || '');
  const [saving, setSaving] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [showNewRole, setShowNewRole] = useState(false);

  const { data: roles = [] } = useQuery({ queryKey: ['roles', server?.id], queryFn: () => base44.entities.Role.filter({ server_id: server?.id }), enabled: !!server?.id });
  const { data: members = [] } = useQuery({ queryKey: ['members', server?.id], queryFn: () => base44.entities.ServerMember.filter({ server_id: server?.id }), enabled: !!server?.id });
  const { data: profiles = [] } = useQuery({ queryKey: ['profiles'], queryFn: () => base44.entities.UserProfile.list() });

  const profileMap = {};
  profiles.forEach(p => { profileMap[p.user_id] = p; profileMap[p.user_email] = p; });

  const saveOverview = async () => {
    setSaving(true);
    await base44.entities.Server.update(server.id, { name, description: desc });
    qc.invalidateQueries({ queryKey: ['servers'] });
    setSaving(false);
  };

  const uploadIcon = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
    await base44.entities.Server.update(server.id, { icon_url: file_url });
    qc.invalidateQueries({ queryKey: ['servers'] });
  };

  const uploadBanner = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
    await base44.entities.Server.update(server.id, { banner_url: file_url });
    qc.invalidateQueries({ queryKey: ['servers'] });
  };

  const saveRole = async (data) => {
    if (editingRole) {
      await base44.entities.Role.update(editingRole.id, data);
    } else {
      await base44.entities.Role.create({ ...data, server_id: server.id, position: roles.length });
    }
    qc.invalidateQueries({ queryKey: ['roles', server.id] });
    setEditingRole(null);
    setShowNewRole(false);
  };

  const deleteRole = async (roleId) => {
    if (!confirm('Delete this role?')) return;
    await base44.entities.Role.delete(roleId);
    qc.invalidateQueries({ queryKey: ['roles', server.id] });
    setEditingRole(null);
  };

  const kickMember = async (member) => {
    if (!confirm(`Kick ${profileMap[member.user_id]?.display_name || member.user_email}?`)) return;
    await base44.entities.ServerMember.delete(member.id);
    await base44.entities.Server.update(server.id, { member_count: Math.max(1, (server.member_count || 1) - 1) });
    qc.invalidateQueries({ queryKey: ['members', server.id] });
  };

  const banMember = async (member) => {
    if (!confirm(`Ban ${profileMap[member.user_id]?.display_name || member.user_email}?`)) return;
    await base44.entities.ServerMember.update(member.id, { is_banned: true, ban_reason: 'Banned by server owner' });
    qc.invalidateQueries({ queryKey: ['members', server.id] });
  };

  const assignRole = async (member, roleId) => {
    const current = member.role_ids || [];
    const updated = current.includes(roleId) ? current.filter(r => r !== roleId) : [...current, roleId];
    await base44.entities.ServerMember.update(member.id, { role_ids: updated });
    qc.invalidateQueries({ queryKey: ['members', server.id] });
  };

  const deleteServer = async () => {
    if (!confirm(`Delete "${server.name}"? This cannot be undone.`)) return;
    if (!confirm('Are you REALLY sure? All data will be lost.')) return;
    const channels = await base44.entities.Channel.filter({ server_id: server.id });
    for (const ch of channels) await base44.entities.Channel.delete(ch.id);
    const cats = await base44.entities.Category.filter({ server_id: server.id });
    for (const c of cats) await base44.entities.Category.delete(c.id);
    for (const m of members) await base44.entities.ServerMember.delete(m.id);
    for (const r of roles) await base44.entities.Role.delete(r.id);
    await base44.entities.Server.delete(server.id);
    qc.invalidateQueries({ queryKey: ['servers'] });
    onClose('deleted');
  };

  return (
    <ModalWrapper title={`${server?.name} — Settings`} onClose={onClose} width={640}>
      <div className="flex gap-4 min-h-[400px]">
        {/* Sidebar */}
        <div className="w-[140px] flex-shrink-0 space-y-0.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs transition-colors"
              style={{ background: tab === t.id ? 'var(--accent-dim)' : 'transparent', color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 overflow-y-auto max-h-[500px]">
          {tab === 'overview' && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold overflow-hidden cursor-pointer hover:brightness-110"
                    style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}
                    onClick={() => document.getElementById('icon-upload').click()}>
                    {server?.icon_url ? <img src={server.icon_url} className="w-full h-full object-cover" /> : server?.name?.charAt(0)}
                  </div>
                  <input id="icon-upload" type="file" accept="image/*" onChange={uploadIcon} className="hidden" />
                  <div className="text-[10px] text-center mt-1" style={{ color: 'var(--text-muted)' }}>Icon</div>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Server Name</label>
                    <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                      style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Description</label>
                    <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                      style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
                  </div>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Server Banner</label>
                <div className="h-24 rounded-lg overflow-hidden cursor-pointer relative"
                  style={{ background: server?.banner_url ? 'transparent' : 'var(--bg)', border: '1px dashed var(--border)' }}
                  onClick={() => document.getElementById('banner-upload').click()}>
                  {server?.banner_url ? <img src={server.banner_url} className="w-full h-full object-cover" /> : (
                    <div className="flex items-center justify-center h-full"><Image className="w-5 h-5" style={{ color: 'var(--text-muted)' }} /><span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>Upload banner</span></div>
                  )}
                </div>
                <input id="banner-upload" type="file" accept="image/*" onChange={uploadBanner} className="hidden" />
              </div>
              <button onClick={saveOverview} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40"
                style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          )}

          {tab === 'roles' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Roles ({roles.length})</span>
                <button onClick={() => { setShowNewRole(true); setEditingRole(null); }} className="px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>
                  <Plus className="w-3 h-3 inline mr-1" />New Role
                </button>
              </div>
              {showNewRole && <RoleEditor onSave={saveRole} isNew />}
              {roles.sort((a, b) => (b.position || 0) - (a.position || 0)).map(r => (
                <div key={r.id}>
                  {editingRole?.id === r.id ? (
                    <RoleEditor role={r} onSave={saveRole} onDelete={() => deleteRole(r.id)} />
                  ) : (
                    <button onClick={() => { setEditingRole(r); setShowNewRole(false); }}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-lg transition-colors hover:bg-[var(--bg-hover)]">
                      <div className="w-3 h-3 rounded-full" style={{ background: r.color || '#99AAB5' }} />
                      <span className="text-sm flex-1 text-left" style={{ color: 'var(--text-primary)' }}>{r.name}</span>
                      {r.is_default && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg)', color: 'var(--text-muted)' }}>Default</span>}
                      <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {tab === 'members' && (
            <div className="space-y-1">
              <span className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-secondary)' }}>Members ({members.length})</span>
              {members.map(m => {
                const p = profileMap[m.user_id] || profileMap[m.user_email];
                const isOwner = m.user_id === server?.owner_id || m.user_email === server?.created_by;
                const memberRoles = (m.role_ids || []).map(rid => roles.find(r => r.id === rid)).filter(Boolean);
                return (
                  <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: 'var(--bg)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs overflow-hidden"
                      style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                      {p?.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : (p?.display_name || 'U').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>{m.nickname || p?.display_name || m.user_email?.split('@')[0]}</span>
                        {isOwner && <Crown className="w-3 h-3 text-amber-500" />}
                        {m.is_banned && <Ban className="w-3 h-3 text-red-400" />}
                      </div>
                      <div className="flex gap-1 mt-0.5">
                        {memberRoles.map(r => (
                          <span key={r.id} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: r.color + '20', color: r.color }}>{r.name}</span>
                        ))}
                      </div>
                    </div>
                    {!isOwner && (
                      <div className="flex items-center gap-1">
                        {/* Role assignment dropdown */}
                        <select onChange={e => { if (e.target.value) assignRole(m, e.target.value); e.target.value = ''; }}
                          className="text-[10px] rounded px-1.5 py-1 outline-none"
                          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                          defaultValue="">
                          <option value="" disabled>+ Role</option>
                          {roles.filter(r => !r.is_default).map(r => (
                            <option key={r.id} value={r.id}>{(m.role_ids || []).includes(r.id) ? '✓ ' : ''}{r.name}</option>
                          ))}
                        </select>
                        <button onClick={() => kickMember(m)} className="p-1 rounded hover:bg-red-400/10" title="Kick"><X className="w-3 h-3 text-red-400" /></button>
                        <button onClick={() => banMember(m)} className="p-1 rounded hover:bg-red-400/10" title="Ban"><Ban className="w-3 h-3 text-red-400" /></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'danger' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <h4 className="text-sm font-semibold text-red-400 mb-1">Delete Server</h4>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                  This will permanently delete <strong>{server?.name}</strong>, including all channels, messages, roles, and members. This action cannot be undone.
                </p>
                <button onClick={deleteServer} className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600">Delete Server</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}