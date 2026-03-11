import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Settings, Shield, Users, AlertTriangle, Trash2, Plus, Palette, Bell, Lock, Globe, Eye, Sparkles, Heart, Zap, MessageSquare, Volume2, Calendar, ChevronDown, ChevronRight, BarChart3, Webhook, Link, Copy, Check } from 'lucide-react';
import ModalWrapper from './ModalWrapper';
import { ServerLabel, ServerInput, ServerToggle } from './SettingsFormParts';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Settings },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'roles', label: 'Roles', icon: Shield },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'invites', label: 'Invites', icon: Link },
  { id: 'features', label: 'Features', icon: Sparkles },
  { id: 'integrations', label: 'Integrations', icon: Webhook },
  { id: 'permissions', label: 'Permissions', icon: Lock },
  { id: 'danger', label: 'Danger', icon: AlertTriangle },
];

const SERVER_FEATURES = [
  { id: 'welcome_screen', label: 'Welcome Screen', desc: 'Show a welcome message to new members', icon: Heart },
  { id: 'vanity_url', label: 'Vanity URL', desc: 'Custom invite link for your server', icon: Globe },
  { id: 'server_insights', label: 'Server Insights', desc: 'View server analytics and growth', icon: Eye },
  { id: 'community', label: 'Community Mode', desc: 'Enable community features', icon: Users },
  { id: 'announcements', label: 'Announcement Channels', desc: 'Cross-server announcement publishing', icon: Bell },
  { id: 'discovery', label: 'Server Discovery', desc: 'Allow server to be found publicly', icon: Globe },
  { id: 'member_screening', label: 'Member Screening', desc: 'New member verification questions', icon: Shield },
  { id: 'role_icons', label: 'Role Icons', desc: 'Custom icons for server roles', icon: Sparkles },
  { id: 'threads', label: 'Thread Channels', desc: 'Enable threaded conversations', icon: MessageSquare },
  { id: 'stage_events', label: 'Stage Events', desc: 'Host live speaker events', icon: Volume2 },
  { id: 'scheduled_events', label: 'Scheduled Events', desc: 'Plan and promote server events', icon: Calendar },
  { id: 'auto_moderation', label: 'Auto Moderation', desc: 'Automated content moderation', icon: Shield },
  { id: 'boost_progress', label: 'Boost Progress Bar', desc: 'Show server boost progress', icon: Zap },
  { id: 'member_profiles', label: 'Server Profiles', desc: 'Per-server member profiles', icon: Users },
  { id: 'custom_stickers', label: 'Custom Stickers', desc: 'Upload server sticker packs', icon: Sparkles },
  { id: 'soundboard', label: 'Soundboard', desc: 'Voice channel sound effects', icon: Volume2 },
  { id: 'linked_roles', label: 'Linked Roles', desc: 'Roles based on external connections', icon: Lock },
  { id: 'server_banner', label: 'Animated Banner', desc: 'Upload animated GIF banner', icon: Palette },
  { id: 'custom_splash', label: 'Custom Invite Splash', desc: 'Invite background image', icon: Palette },
  { id: 'monetization', label: 'Server Monetization', desc: 'Paid roles and premium features', icon: Zap },
];

const PERMISSIONS_LIST = [
  'Manage Server', 'Manage Channels', 'Manage Roles', 'Manage Members',
  'Kick Members', 'Ban Members', 'Timeout Members', 'View Audit Log',
  'Send Messages', 'Embed Links', 'Attach Files', 'Add Reactions',
  'Use External Emojis', 'Mention Everyone', 'Manage Messages', 'Pin Messages',
  'Read Message History', 'Connect (Voice)', 'Speak (Voice)', 'Mute Members',
  'Deafen Members', 'Move Members', 'Use Voice Activity', 'Priority Speaker',
  'Stream (Go Live)', 'Use Soundboard', 'Create Invite', 'Change Nickname',
  'Manage Nicknames', 'Manage Webhooks', 'Create Threads', 'Manage Threads',
  'Send Thread Messages', 'Use Slash Commands', 'Manage Events', 'Use External Stickers',
  'View Server Insights', 'Manage Expressions', 'Create Expressions', 'Use Application Commands',
];

export default function ServerSettingsModal({ onClose, server, currentUserId }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [name, setName] = useState(server?.name || '');
  const [desc, setDesc] = useState(server?.description || '');
  const [roles, setRoles] = useState([]);
  const [members, setMembers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#7bc9a4');
  const [confirmDelete, setConfirmDelete] = useState('');
  const [features, setFeatures] = useState(server?.features || []);
  const [editingRole, setEditingRole] = useState(null);
  const [serverSettings, setServerSettings] = useState(server?.settings || {});
  const [bannerColor, setBannerColor] = useState(server?.banner_color || '#5865F2');
  const [isPublic, setIsPublic] = useState(server?.is_public || false);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    if (!server?.id) return;
    base44.entities.Role.filter({ server_id: server.id }).then(setRoles);
    base44.entities.ServerMember.filter({ server_id: server.id }).then(setMembers);
  }, [server?.id]);

  const saveOverview = async () => {
    setSaving(true);
    await base44.entities.Server.update(server.id, { name, description: desc, settings: serverSettings, features, is_public: isPublic, banner_color: bannerColor });
    qc.invalidateQueries({ queryKey: ['servers'] });
    setSaving(false);
  };

  const uploadImg = async (field) => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
    input.onchange = async () => { const f = input.files?.[0]; if (!f) return; const { file_url } = await base44.integrations.Core.UploadFile({ file: f }); await base44.entities.Server.update(server.id, { [field]: file_url }); qc.invalidateQueries({ queryKey: ['servers'] }); };
    input.click();
  };

  const addRole = async () => {
    if (!newRole.trim()) return;
    await base44.entities.Role.create({ server_id: server.id, name: newRole.trim(), color: newRoleColor, position: roles.length, hoist: false, mentionable: false });
    setNewRole('');
    setRoles(await base44.entities.Role.filter({ server_id: server.id }));
    qc.invalidateQueries({ queryKey: ['roles'] });
  };

  const updateRole = async (id, data) => {
    await base44.entities.Role.update(id, data);
    setRoles(r => r.map(x => x.id === id ? { ...x, ...data } : x));
    qc.invalidateQueries({ queryKey: ['roles'] });
  };

  const deleteRole = async (id) => { await base44.entities.Role.delete(id); setRoles(r => r.filter(x => x.id !== id)); qc.invalidateQueries({ queryKey: ['roles'] }); };

  const kickMember = async (m) => {
    if (!confirm(`Kick ${m.user_email}?`)) return;
    await base44.entities.ServerMember.delete(m.id); setMembers(ms => ms.filter(x => x.id !== m.id));
    await base44.entities.Server.update(server.id, { member_count: Math.max(1, (server.member_count || 1) - 1) });
    qc.invalidateQueries({ queryKey: ['members'] });
  };

  const toggleFeature = (id) => setFeatures(f => f.includes(id) ? f.filter(x => x !== id) : [...f, id]);

  const deleteServer = async () => {
    if (confirmDelete !== server.name) return;
    const [chs, cats, msgs, mems, rls] = await Promise.all([base44.entities.Channel.filter({ server_id: server.id }), base44.entities.Category.filter({ server_id: server.id }), base44.entities.Message.filter({ server_id: server.id }), base44.entities.ServerMember.filter({ server_id: server.id }), base44.entities.Role.filter({ server_id: server.id })]);
    await Promise.all([...msgs.map(m => base44.entities.Message.delete(m.id)), ...chs.map(c => base44.entities.Channel.delete(c.id)), ...cats.map(c => base44.entities.Category.delete(c.id)), ...mems.map(m => base44.entities.ServerMember.delete(m.id)), ...rls.map(r => base44.entities.Role.delete(r.id))]);
    await base44.entities.Server.delete(server.id);
    qc.invalidateQueries({ queryKey: ['servers'] });
    onClose('deleted');
  };

  return (
    <ModalWrapper title="Server Settings" onClose={onClose} width={680}>
      <div className="flex gap-4 min-h-[480px]">
        <div className="w-[130px] flex-shrink-0 space-y-0.5 overflow-y-auto max-h-[540px] scrollbar-none">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[11px] transition-colors"
              style={{ background: tab === t.id ? 'var(--bg-glass-active)' : 'transparent', color: tab === t.id ? (t.id === 'danger' ? 'var(--accent-red)' : 'var(--text-cream)') : 'var(--text-muted)' }}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto max-h-[540px] space-y-4 scrollbar-none pr-1">
          {tab === 'overview' && <>
            <div className="flex gap-3">
              <button onClick={() => uploadImg('icon_url')} className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 group relative" style={{ background: 'var(--bg-glass)', border: '1px dashed var(--border-light)' }}>
                {server?.icon_url ? <img src={server.icon_url} className="w-full h-full object-cover" /> : <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{server?.name?.slice(0,2)}</span>}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><span className="text-[8px] text-white">Edit</span></div>
              </button>
              <div className="flex-1 space-y-3">
                <div><ServerLabel>Name</ServerLabel><ServerInput value={name} onChange={e => setName(e.target.value)} /></div>
              </div>
            </div>
            <div><ServerLabel>Description</ServerLabel><textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} /></div>
            <button onClick={() => uploadImg('banner_url')} className="w-full h-20 rounded-xl overflow-hidden" style={{ background: 'var(--bg-glass)', border: '1px dashed var(--border-light)' }}>
              {server?.banner_url ? <img src={server.banner_url} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-[11px]" style={{ color: 'var(--text-muted)' }}>Upload Banner</div>}
            </button>
            <ServerToggle on={isPublic} onToggle={() => setIsPublic(!isPublic)} label="Public Server (discoverable)" />
            <div><ServerLabel>Default Notifications</ServerLabel>
              <select value={serverSettings.default_notifications || 'all'} onChange={e => setServerSettings(s => ({ ...s, default_notifications: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                <option value="all">All Messages</option><option value="mentions">Mentions Only</option><option value="none">Nothing</option>
              </select>
            </div>
            <div><ServerLabel>Verification Level</ServerLabel>
              <select value={serverSettings.verification_level || 'none'} onChange={e => setServerSettings(s => ({ ...s, verification_level: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                <option value="none">None</option><option value="low">Low (verified email)</option><option value="medium">Medium (5 min wait)</option><option value="high">High (10 min + server member)</option>
              </select>
            </div>
            <div><ServerLabel>Content Filter</ServerLabel>
              <select value={serverSettings.content_filter || 'disabled'} onChange={e => setServerSettings(s => ({ ...s, content_filter: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                <option value="disabled">Disabled</option><option value="members_without_roles">Scan unverified members</option><option value="all_members">Scan all</option>
              </select>
            </div>
            <button onClick={saveOverview} disabled={saving} className="px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-30" style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>{saving ? 'Saving...' : 'Save'}</button>
          </>}

          {tab === 'appearance' && <>
            <div><ServerLabel>Banner Color</ServerLabel>
              <div className="flex gap-2 items-center">
                <input type="color" value={bannerColor} onChange={e => setBannerColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }} />
                <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{bannerColor}</span>
              </div>
            </div>
            <div className="h-20 rounded-xl" style={{ background: bannerColor }} />
            <button onClick={() => uploadImg('icon_url')} className="w-full py-3 rounded-xl text-sm glass" style={{ color: 'var(--text-secondary)' }}>Change Server Icon</button>
            <button onClick={() => uploadImg('banner_url')} className="w-full py-3 rounded-xl text-sm glass" style={{ color: 'var(--text-secondary)' }}>Change Server Banner</button>
            <button onClick={() => { setBannerColor(bannerColor); saveOverview(); }} className="px-5 py-2 rounded-xl text-sm font-medium" style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>Save Appearance</button>
          </>}

          {tab === 'roles' && <>
            <div className="flex gap-2">
              <ServerInput value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="Role name" />
              <input type="color" value={newRoleColor} onChange={e => setNewRoleColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer flex-shrink-0" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }} />
              <button onClick={addRole} className="px-4 rounded-xl flex-shrink-0" style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}><Plus className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2">
              {roles.sort((a,b) => (b.position||0) - (a.position||0)).map(r => (
                <div key={r.id} className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                  <button onClick={() => setEditingRole(editingRole === r.id ? null : r.id)} className="w-full flex items-center gap-3 px-3 py-2.5">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: r.color }} />
                    <span className="text-sm flex-1 text-left font-mono" style={{ color: r.color }}>{r.name}</span>
                    {editingRole === r.id ? <ChevronDown className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /> : <ChevronRight className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />}
                  </button>
                  {editingRole === r.id && !r.is_default && (
                    <div className="px-3 pb-3 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
                      <div className="flex gap-2 mt-2">
                        <input type="color" value={r.color} onChange={e => updateRole(r.id, { color: e.target.value })} className="w-8 h-8 rounded-lg cursor-pointer" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }} />
                        <ServerInput value={r.name} onChange={e => updateRole(r.id, { name: e.target.value })} />
                      </div>
                      <ServerToggle on={r.hoist} onToggle={() => updateRole(r.id, { hoist: !r.hoist })} label="Display separately in member list" />
                      <ServerToggle on={r.mentionable} onToggle={() => updateRole(r.id, { mentionable: !r.mentionable })} label="Allow anyone to mention this role" />
                      <button onClick={() => deleteRole(r.id)} className="text-[10px] px-2 py-1 rounded-lg flex items-center gap-1" style={{ color: 'var(--accent-red)' }}>
                        <Trash2 className="w-3 h-3" /> Delete Role
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>}

          {tab === 'members' && <div className="space-y-1">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'var(--bg-glass)' }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>
                  {(m.user_email || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="text-sm flex-1 truncate" style={{ color: 'var(--text-primary)' }}>{m.user_email || m.nickname}</span>
                <div className="flex gap-1">
                  {(m.role_ids || []).map(rid => {
                    const role = roles.find(r => r.id === rid);
                    return role ? <span key={rid} className="text-[8px] px-1.5 rounded font-mono" style={{ color: role.color, background: `${role.color}15` }}>{role.name}</span> : null;
                  })}
                </div>
                {m.user_id === server.owner_id ? <span className="text-[8px] px-1.5 rounded font-mono" style={{ background: 'rgba(201,180,123,0.15)', color: 'var(--accent-amber)' }}>OWNER</span>
                : <button onClick={() => kickMember(m)} className="text-[10px] px-2 py-0.5 rounded-lg hover:bg-[rgba(201,123,123,0.1)]" style={{ color: 'var(--accent-red)' }}>Kick</button>}
              </div>
            ))}
          </div>}

          {tab === 'invites' && (
            <div className="space-y-3">
              <p className="text-[12px] mb-2" style={{ color: 'var(--text-secondary)' }}>Active invite links for this server.</p>
              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Current Invite</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 text-[13px] font-mono px-3 py-2 rounded-lg truncate" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                    {window.location.origin}/invite/{server?.invite_code}
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/invite/${server?.invite_code}`); setCopiedCode('main'); setTimeout(() => setCopiedCode(null), 2000); }}
                    className="px-3 py-2 rounded-lg flex-shrink-0" style={{ background: copiedCode === 'main' ? 'var(--accent-green)' : 'var(--accent)', color: '#fff' }}>
                    {copiedCode === 'main' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-4 mt-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  <span>Code: <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{server?.invite_code}</span></span>
                  <span>Created by server owner</span>
                  <span>Never expires</span>
                </div>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                  To generate a new invite code (revoking the current one), use the Invite People option in the server dropdown menu.
                </p>
              </div>
            </div>
          )}

          {tab === 'features' && (
            <div className="space-y-2">
              <p className="text-[12px] mb-2" style={{ color: 'var(--text-secondary)' }}>Enable or disable server features. Some features require Kairo Elite.</p>
              {SERVER_FEATURES.map(f => (
                <div key={f.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: features.includes(f.id) ? 'var(--bg-glass-active)' : 'var(--bg-glass)', border: `1px solid ${features.includes(f.id) ? 'var(--border-light)' : 'var(--border)'}` }}>
                  <f.icon className="w-4 h-4 flex-shrink-0" style={{ color: features.includes(f.id) ? 'var(--accent-green)' : 'var(--text-muted)' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium" style={{ color: 'var(--text-cream)' }}>{f.label}</p>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                  </div>
                  <button onClick={() => toggleFeature(f.id)} className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0" style={{ background: features.includes(f.id) ? 'var(--accent-green)' : 'var(--bg-overlay)' }}>
                    <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: features.includes(f.id) ? 22 : 2 }} />
                  </button>
                </div>
              ))}
              <button onClick={saveOverview} disabled={saving} className="px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-30 mt-2" style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>Save Features</button>
            </div>
          )}

          {tab === 'integrations' && (
            <div className="space-y-3">
              <p className="text-[12px] mb-2" style={{ color: 'var(--text-secondary)' }}>Manage server integrations and webhooks.</p>
              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <Webhook className="w-5 h-5" style={{ color: 'var(--accent-purple)' }} />
                  <div>
                    <h3 className="text-[13px] font-medium" style={{ color: 'var(--text-cream)' }}>Webhooks</h3>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Create webhooks to post automated messages</p>
                  </div>
                </div>
                <button className="px-4 py-2 rounded-xl text-[12px]" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Create Webhook</button>
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
                  <div>
                    <h3 className="text-[13px] font-medium" style={{ color: 'var(--text-cream)' }}>Server Analytics</h3>
                    <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>View detailed growth and activity metrics</p>
                  </div>
                </div>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Access the full analytics dashboard from the channel sidebar's chart icon.</p>
              </div>
            </div>
          )}

          {tab === 'permissions' && (
            <div className="space-y-3">
              <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Configure default permissions for @everyone role.</p>
              <div className="space-y-1">
                {PERMISSIONS_LIST.map((p, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: i % 2 === 0 ? 'var(--bg-glass)' : 'transparent' }}>
                    <span className="text-[11px]" style={{ color: 'var(--text-primary)' }}>{p}</span>
                    <button className="w-8 h-4 rounded-full relative transition-colors" style={{ background: 'var(--accent-green)' }}>
                      <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white" style={{ left: 17 }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'danger' && <>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(201,123,123,0.05)', border: '1px solid rgba(201,123,123,0.15)' }}>
              <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--accent-red)' }}>Delete Server</h3>
              <p className="text-[11px] mb-3" style={{ color: 'var(--text-secondary)' }}>Type <span className="font-mono font-bold" style={{ color: 'var(--text-cream)' }}>{server?.name}</span> to confirm.</p>
              <input value={confirmDelete} onChange={e => setConfirmDelete(e.target.value)} placeholder={server?.name}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none font-mono mb-3" style={{ background: 'var(--bg-glass)', color: 'var(--accent-red)', border: '1px solid rgba(201,123,123,0.2)' }} />
              <button onClick={deleteServer} disabled={confirmDelete !== server?.name} className="px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-20"
                style={{ background: 'var(--accent-red)', color: '#fff' }}>Delete Forever</button>
            </div>
          </>}
        </div>
      </div>
    </ModalWrapper>
  );
}