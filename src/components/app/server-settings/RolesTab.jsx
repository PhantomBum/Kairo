import React, { useState, useMemo } from 'react';
import { Plus, Trash2, ChevronRight, Users, Check, Shield, Search, X } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';
import { useProfiles } from '@/components/app/providers/ProfileProvider';

const ALL_PERMISSIONS = [
  { key: 'manage_server', label: 'Manage Server', desc: 'Edit server name, icon, settings' },
  { key: 'manage_channels', label: 'Manage Channels', desc: 'Create, edit, delete channels' },
  { key: 'manage_roles', label: 'Manage Roles', desc: 'Create and edit roles below this one' },
  { key: 'manage_messages', label: 'Manage Messages', desc: 'Delete or pin any message' },
  { key: 'kick_members', label: 'Kick Members', desc: 'Remove members from the server' },
  { key: 'ban_members', label: 'Ban Members', desc: 'Permanently ban members' },
  { key: 'timeout_members', label: 'Timeout Members', desc: 'Temporarily mute members' },
  { key: 'send_messages', label: 'Send Messages', desc: 'Send messages in text channels' },
  { key: 'embed_links', label: 'Embed Links', desc: 'Links will show previews' },
  { key: 'attach_files', label: 'Attach Files', desc: 'Upload images and files' },
  { key: 'add_reactions', label: 'Add Reactions', desc: 'React to messages' },
  { key: 'use_emojis', label: 'Use External Emoji', desc: 'Use emoji from other servers' },
  { key: 'connect_voice', label: 'Connect to Voice', desc: 'Join voice channels' },
  { key: 'speak', label: 'Speak', desc: 'Talk in voice channels' },
  { key: 'stream', label: 'Stream / Share Screen', desc: 'Go live in voice channels' },
  { key: 'mute_members', label: 'Mute Members', desc: 'Mute others in voice' },
  { key: 'deafen_members', label: 'Deafen Members', desc: 'Deafen others in voice' },
  { key: 'move_members', label: 'Move Members', desc: 'Move members between voice channels' },
  { key: 'mention_everyone', label: 'Mention @everyone', desc: 'Ping all members' },
  { key: 'manage_emojis', label: 'Manage Emojis & Stickers', desc: 'Upload and delete emoji' },
  { key: 'view_audit_log', label: 'View Audit Log', desc: 'See server activity log' },
  { key: 'manage_webhooks', label: 'Manage Webhooks', desc: 'Create and manage webhooks' },
  { key: 'create_invites', label: 'Create Invites', desc: 'Invite new members' },
  { key: 'change_nickname', label: 'Change Nickname', desc: 'Change own nickname' },
  { key: 'manage_nicknames', label: 'Manage Nicknames', desc: 'Change other members\' nicknames' },
];

const ROLE_TEMPLATES = [
  { name: 'Admin', color: '#ef4444', gradient: '', perms: ['manage_server', 'manage_channels', 'manage_roles', 'ban_members', 'kick_members', 'manage_messages', 'view_audit_log'] },
  { name: 'Moderator', color: '#eab308', gradient: '', perms: ['kick_members', 'timeout_members', 'manage_messages', 'mute_members'] },
  { name: 'VIP', color: '#8b5cf6', gradient: '', perms: [] },
  { name: 'Member', color: '#22c55e', gradient: '', perms: ['send_messages', 'add_reactions', 'connect_voice', 'speak', 'create_invites'] },
];

const PRESET_GRADIENTS = [
  'linear-gradient(135deg, #ef4444, #f97316)',
  'linear-gradient(135deg, #8b5cf6, #ec4899)',
  'linear-gradient(135deg, #06b6d4, #3b82f6)',
  'linear-gradient(135deg, #22c55e, #06b6d4)',
  'linear-gradient(135deg, #eab308, #ef4444)',
  'linear-gradient(135deg, #f43f5e, #a855f7)',
  'linear-gradient(135deg, #6366f1, #8b5cf6)',
  'linear-gradient(135deg, #14b8a6, #22c55e)',
];

export default function RolesTab({ roles, members, onAddRole, onUpdateRole, onDeleteRole }) {
  const [editId, setEditId] = useState(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#8b5cf6');
  const [subTab, setSubTab] = useState('display'); // display | permissions | members
  const [memberSearch, setMemberSearch] = useState('');
  const { getProfile } = useProfiles();
  const sorted = [...roles].sort((a, b) => (b.position || 0) - (a.position || 0));
  const editing = sorted.find(r => r.id === editId);

  const memberCount = (roleId) => members.filter(m => m.role_ids?.includes(roleId)).length;

  const rolePermissions = useMemo(() => {
    if (!editing) return [];
    // permissions stored as comma-separated string or array in permissions_bitfield (we'll use a JSON array in icon_url as workaround, or check for array)
    // For simplicity, store permissions as a JSON array string in the icon_url field
    if (editing.icon_url) {
      try { return JSON.parse(editing.icon_url); } catch { return []; }
    }
    return [];
  }, [editing]);

  const togglePermission = (key) => {
    const current = [...rolePermissions];
    const idx = current.indexOf(key);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(key);
    onUpdateRole(editing.id, { icon_url: JSON.stringify(current) });
  };

  const roleMembers = useMemo(() => {
    if (!editing) return [];
    return members.filter(m => m.role_ids?.includes(editing.id));
  }, [editing, members]);

  const nonRoleMembers = useMemo(() => {
    if (!editing) return [];
    return members.filter(m => !m.role_ids?.includes(editing.id))
      .filter(m => {
        if (!memberSearch) return true;
        const p = getProfile(m.user_id);
        const name = p?.display_name || m.user_email || '';
        return name.toLowerCase().includes(memberSearch.toLowerCase());
      });
  }, [editing, members, memberSearch]);

  const addMemberToRole = async (member) => {
    const newRoleIds = [...(member.role_ids || []), editing.id];
    onUpdateRole(editing.id, {}); // trigger refresh
    // We need to update the member directly
    const { base44 } = await import('@/api/base44Client');
    await base44.entities.ServerMember.update(member.id, { role_ids: newRoleIds });
  };

  const removeMemberFromRole = async (member) => {
    const newRoleIds = (member.role_ids || []).filter(id => id !== editing.id);
    const { base44 } = await import('@/api/base44Client');
    await base44.entities.ServerMember.update(member.id, { role_ids: newRoleIds });
  };

  const getGradient = (role) => {
    // Check if the role has a gradient stored (we'll repurpose a field or check color format)
    if (role.color?.startsWith('linear-gradient')) return role.color;
    return null;
  };

  const roleStyle = (role) => {
    const grad = getGradient(role);
    if (grad) return { backgroundImage: grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' };
    return { color: role.color };
  };

  return (
    <div className="flex gap-4 min-h-[400px]">
      {/* Role list */}
      <div className="w-[220px] flex-shrink-0 space-y-2">
        <div className="flex gap-2 mb-3">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New role name..."
            className="flex-1 px-3 py-2 rounded-lg text-[13px] outline-none"
            style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}
            onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) { onAddRole(newName.trim(), newColor); setNewName(''); } }} />
          <button onClick={() => { if (newName.trim()) { onAddRole(newName.trim(), newColor); setNewName(''); } }}
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105 active:scale-95"
            style={{ background: colors.accent.primary, color: '#fff' }}><Plus className="w-4 h-4" /></button>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-wider px-1 mb-1" style={{ color: colors.text.disabled }}>Templates</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {ROLE_TEMPLATES.map(t => (
            <button key={t.name} onClick={() => onAddRole(t.name, t.color)}
              className="text-[11px] px-2.5 py-1 rounded-full transition-all hover:scale-105 active:scale-95"
              style={{ background: `${t.color}15`, color: t.color, border: `1px solid ${t.color}30` }}>
              + {t.name}
            </button>
          ))}
        </div>

        {sorted.map(r => (
          <button key={r.id} onClick={() => { setEditId(r.id); setSubTab('display'); }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all hover:brightness-110"
            style={{
              background: editId === r.id ? 'rgba(139,92,246,0.1)' : colors.bg.elevated,
              border: `1px solid ${editId === r.id ? 'rgba(139,92,246,0.2)' : colors.border.default}`,
            }}>
            <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: getGradient(r) || r.color }} />
            <span className="flex-1 text-[13px] font-medium truncate" style={roleStyle(r)}>{r.name}</span>
            <span className="text-[11px] flex items-center gap-1" style={{ color: colors.text.disabled }}>
              <Users className="w-3 h-3" />{memberCount(r.id)}
            </span>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.text.disabled }} />
          </button>
        ))}
      </div>

      {/* Role editor */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full" style={{ background: getGradient(editing) || editing.color }} />
              <h3 className="text-[16px] font-bold" style={roleStyle(editing)}>{editing.name}</h3>
              {editing.is_default && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: colors.bg.overlay, color: colors.text.muted }}>Default</span>}
            </div>

            {!editing.is_default && (
              <>
                {/* Sub-tabs */}
                <div className="flex gap-1 p-1 rounded-xl" style={{ background: colors.bg.elevated }}>
                  {[{ id: 'display', label: 'Display' }, { id: 'permissions', label: 'Permissions' }, { id: 'members', label: `Members (${memberCount(editing.id)})` }].map(t => (
                    <button key={t.id} onClick={() => setSubTab(t.id)}
                      className="flex-1 py-2 rounded-lg text-[12px] font-medium transition-colors"
                      style={{ background: subTab === t.id ? colors.accent.muted : 'transparent', color: subTab === t.id ? colors.text.primary : colors.text.muted }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {subTab === 'display' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: colors.text.muted }}>Name</label>
                      <input value={editing.name} onChange={e => onUpdateRole(editing.id, { name: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-lg text-[13px] outline-none"
                        style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: colors.text.muted }}>Solid Color</label>
                      <div className="flex gap-2 items-center">
                        <input type="color" value={editing.color?.startsWith('#') ? editing.color : '#8b5cf6'} onChange={e => onUpdateRole(editing.id, { color: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer" style={{ background: colors.bg.elevated }} />
                        <input value={editing.color?.startsWith('#') ? editing.color : ''} onChange={e => onUpdateRole(editing.id, { color: e.target.value })}
                          className="flex-1 px-3 py-2.5 rounded-lg text-[13px] outline-none font-mono"
                          style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}
                          placeholder="#8b5cf6" />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: colors.text.muted }}>Gradient Colors</label>
                      <div className="grid grid-cols-4 gap-2">
                        {PRESET_GRADIENTS.map((g, i) => (
                          <button key={i} onClick={() => onUpdateRole(editing.id, { color: g })}
                            className="h-8 rounded-lg transition-all hover:scale-105 active:scale-95"
                            style={{ background: g, border: editing.color === g ? '2px solid white' : '2px solid transparent' }} />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      {[{ key: 'hoist', label: 'Display separately in member list' }, { key: 'mentionable', label: 'Allow anyone to mention this role' }].map(opt => (
                        <div key={opt.key} className="flex items-center justify-between p-3 rounded-lg" style={{ background: colors.bg.elevated }}>
                          <span className="text-[13px]" style={{ color: colors.text.primary }}>{opt.label}</span>
                          <button onClick={() => onUpdateRole(editing.id, { [opt.key]: !editing[opt.key] })}
                            className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
                            style={{ background: editing[opt.key] ? colors.success : colors.bg.overlay }}>
                            <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: editing[opt.key] ? 22 : 2 }} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button onClick={() => { onDeleteRole(editing.id); setEditId(null); }}
                      className="flex items-center gap-2 text-[13px] px-4 py-2 rounded-lg transition-colors hover:bg-[rgba(239,68,68,0.1)]"
                      style={{ color: colors.danger }}>
                      <Trash2 className="w-4 h-4" /> Delete Role
                    </button>
                  </div>
                )}

                {subTab === 'permissions' && (
                  <div className="space-y-1.5 max-h-[400px] overflow-y-auto scrollbar-none">
                    {ALL_PERMISSIONS.map(perm => {
                      const enabled = rolePermissions.includes(perm.key);
                      return (
                        <div key={perm.key} className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.02)]" style={{ background: colors.bg.elevated }}>
                          <div>
                            <p className="text-[13px] font-medium" style={{ color: colors.text.primary }}>{perm.label}</p>
                            <p className="text-[11px]" style={{ color: colors.text.disabled }}>{perm.desc}</p>
                          </div>
                          <button onClick={() => togglePermission(perm.key)}
                            className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
                            style={{ background: enabled ? colors.success : colors.bg.overlay }}>
                            <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: enabled ? 22 : 2 }} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {subTab === 'members' && (
                  <div className="space-y-3">
                    {/* Current members with this role */}
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: colors.text.disabled }}>Members with this role</p>
                      {roleMembers.length === 0 ? (
                        <p className="text-[12px] py-4 text-center" style={{ color: colors.text.muted }}>No members have this role</p>
                      ) : (
                        <div className="space-y-1">
                          {roleMembers.map(m => {
                            const p = getProfile(m.user_id);
                            const name = p?.display_name || m.user_email?.split('@')[0] || 'User';
                            return (
                              <div key={m.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg group" style={{ background: colors.bg.elevated }}>
                                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold overflow-hidden" style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                                  {p?.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" alt="" /> : name.charAt(0).toUpperCase()}
                                </div>
                                <span className="flex-1 text-[13px]" style={{ color: colors.text.primary }}>{name}</span>
                                <button onClick={() => removeMemberFromRole(m)}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all hover:bg-[rgba(239,68,68,0.1)]">
                                  <X className="w-3.5 h-3.5" style={{ color: colors.danger }} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Add members */}
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: colors.text.disabled }}>Add Members</p>
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-2" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
                        <Search className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
                        <input value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder="Search members..."
                          className="flex-1 bg-transparent text-[12px] outline-none" style={{ color: colors.text.primary }} />
                      </div>
                      <div className="space-y-1 max-h-[200px] overflow-y-auto scrollbar-none">
                        {nonRoleMembers.slice(0, 20).map(m => {
                          const p = getProfile(m.user_id);
                          const name = p?.display_name || m.user_email?.split('@')[0] || 'User';
                          return (
                            <button key={m.id} onClick={() => addMemberToRole(m)}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors hover:bg-[rgba(255,255,255,0.04)]" style={{ background: colors.bg.elevated }}>
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold overflow-hidden" style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                                {p?.avatar_url ? <img src={p.avatar_url} className="w-full h-full object-cover" alt="" /> : name.charAt(0).toUpperCase()}
                              </div>
                              <span className="flex-1 text-[13px]" style={{ color: colors.text.primary }}>{name}</span>
                              <Plus className="w-3.5 h-3.5" style={{ color: colors.accent.primary }} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Shield className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: colors.text.muted }} />
              <p className="text-[14px]" style={{ color: colors.text.muted }}>Select a role to edit</p>
              <p className="text-[12px]" style={{ color: colors.text.disabled }}>Or create a new one above</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}