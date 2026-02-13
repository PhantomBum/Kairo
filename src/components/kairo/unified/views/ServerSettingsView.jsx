import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Settings, Hash, Palette, Shield, Trash2, Plus, Copy, Users } from 'lucide-react';

export default function ServerSettingsView({ server, categories, channels, roles, members, profilesMap, currentUser, onBack }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [name, setName] = useState(server.name || '');
  const [description, setDescription] = useState(server.description || '');
  const [saving, setSaving] = useState(false);

  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#99AAB5');

  const saveServer = async () => {
    setSaving(true);
    await base44.entities.Server.update(server.id, { name, description });
    qc.invalidateQueries({ queryKey: ['myServers'] });
    setSaving(false);
  };

  const deleteChannel = async (ch) => {
    if (!confirm(`Delete #${ch.name}?`)) return;
    await base44.entities.Channel.delete(ch.id);
    qc.invalidateQueries({ queryKey: ['channels', server.id] });
  };

  const createRole = async () => {
    if (!newRoleName.trim()) return;
    await base44.entities.Role.create({ server_id: server.id, name: newRoleName, color: newRoleColor, position: roles.length });
    setNewRoleName('');
    qc.invalidateQueries({ queryKey: ['roles', server.id] });
  };

  const deleteRole = async (role) => {
    if (role.is_default) return alert("Can't delete @everyone role");
    if (!confirm(`Delete role "${role.name}"?`)) return;
    await base44.entities.Role.delete(role.id);
    qc.invalidateQueries({ queryKey: ['roles', server.id] });
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Settings },
    { id: 'channels', label: 'Channels', icon: Hash },
    { id: 'roles', label: 'Roles', icon: Shield },
    { id: 'members', label: 'Members', icon: Users },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ background: '#0e0e0e' }}>
      <div className="h-12 px-4 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={onBack} className="p-1 text-zinc-400 hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></button>
        <Settings className="w-4 h-4 text-zinc-400" />
        <span className="text-sm font-semibold text-white">Server Settings — {server.name}</span>
      </div>

      <div className="flex items-center gap-1 px-4 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors"
            style={{ background: tab === t.id ? 'rgba(255,255,255,0.08)' : 'transparent', color: tab === t.id ? '#fff' : '#666' }}>
            <t.icon className="w-3.5 h-3.5" /> {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin max-w-2xl">
        {tab === 'overview' && (
          <div className="space-y-5">
            <div>
              <label className="text-[11px] font-semibold uppercase text-zinc-500 mb-2 block">Server Name</label>
              <input value={name} onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none" style={{ background: '#1a1a1a' }} />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase text-zinc-500 mb-2 block">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
                className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none resize-none" style={{ background: '#1a1a1a' }} />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase text-zinc-500 mb-2 block">Invite Code</label>
              <div className="flex items-center gap-2">
                <code className="px-3 py-2 rounded-lg text-sm text-white flex-1" style={{ background: '#1a1a1a' }}>{server.invite_code}</code>
                <button onClick={() => navigator.clipboard.writeText(server.invite_code)}
                  className="px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 transition-colors" style={{ background: '#1a1a1a' }}>
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button onClick={saveServer} disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium text-black disabled:opacity-50" style={{ background: '#fff' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {tab === 'channels' && (
          <div className="space-y-2">
            <div className="text-[11px] font-semibold uppercase text-zinc-500 mb-3">Channels — {channels.length}</div>
            {channels.sort((a, b) => (a.position || 0) - (b.position || 0)).map(ch => (
              <div key={ch.id} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/[0.04] group">
                <Hash className="w-4 h-4 text-zinc-500" />
                <div className="flex-1">
                  <span className="text-sm text-white">{ch.name}</span>
                  <span className="text-[11px] text-zinc-600 ml-2">{ch.type}</span>
                </div>
                <button onClick={() => deleteChannel(ch)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {tab === 'roles' && (
          <div className="space-y-4">
            <div className="text-[11px] font-semibold uppercase text-zinc-500 mb-2">Roles — {roles.length}</div>
            {roles.sort((a, b) => (b.position || 0) - (a.position || 0)).map(role => (
              <div key={role.id} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/[0.04] group">
                <div className="w-3 h-3 rounded-full" style={{ background: role.color || '#99AAB5' }} />
                <span className="text-sm text-white flex-1">{role.name}</span>
                {role.is_default && <span className="text-[10px] text-zinc-500">default</span>}
                {!role.is_default && (
                  <button onClick={() => deleteRole(role)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            <div className="flex items-center gap-2 pt-2">
              <input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="New role name..."
                onKeyDown={e => e.key === 'Enter' && createRole()}
                className="flex-1 px-3 py-2 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none" style={{ background: '#1a1a1a' }} />
              <input type="color" value={newRoleColor} onChange={e => setNewRoleColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
              <button onClick={createRole} className="px-3 py-2 rounded-lg text-sm text-black font-medium" style={{ background: '#fff' }}>
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {tab === 'members' && (
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase text-zinc-500 mb-3">Members — {members.length}</div>
            {members.map(m => {
              const p = profilesMap.get(m.user_id) || profilesMap.get(m.user_email);
              return (
                <div key={m.id} className="flex items-center gap-3 px-3 py-2 rounded hover:bg-white/[0.04]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs overflow-hidden" style={{ background: '#1a1a1a' }}>
                    {p?.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" /> : (p?.display_name || 'U').charAt(0)}
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-white">{p?.display_name || m.user_email?.split('@')[0]}</span>
                    {m.user_id === server.owner_id && <span className="text-[10px] text-amber-400 ml-2">OWNER</span>}
                  </div>
                  <span className="text-[11px] text-zinc-600">{new Date(m.joined_at || m.created_date).toLocaleDateString()}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}