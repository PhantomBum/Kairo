import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Hash } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { colors, shadows } from '@/components/app/design/tokens';
import SettingsNav from '@/components/app/server-settings/SettingsNav';
import OverviewTab from '@/components/app/server-settings/OverviewTab';
import RolesTab from '@/components/app/server-settings/RolesTab';
import MembersTab from '@/components/app/server-settings/MembersTab';
import BotsTab from '@/components/app/server-settings/BotsTab';
import AuditLogTab from '@/components/app/server-settings/AuditLogTab';
import EmojiTab from '@/components/app/server-settings/EmojiTab';
import DangerTab from '@/components/app/server-settings/DangerTab';

export default function ServerSettingsModal({ onClose, server, currentUserId }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [name, setName] = useState(server?.name || '');
  const [desc, setDesc] = useState(server?.description || '');
  const [roles, setRoles] = useState([]);
  const [members, setMembers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [channels, setChannels] = useState([]);
  const [serverCategories, setServerCategories] = useState([]);
  const [features, setFeatures] = useState(server?.features || []);
  const [serverSettings, setServerSettings] = useState(server?.settings || {});
  const [bannerColor, setBannerColor] = useState(server?.banner_color || '#5865F2');
  const [isPublic, setIsPublic] = useState(server?.is_public || false);

  useEffect(() => {
    if (!server?.id) return;
    base44.entities.Role.filter({ server_id: server.id }).then(setRoles);
    base44.entities.ServerMember.filter({ server_id: server.id }).then(setMembers);
    base44.entities.Channel.filter({ server_id: server.id }).then(setChannels);
    base44.entities.Category.filter({ server_id: server.id }).then(setServerCategories);
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

  const addRole = async (roleName, roleColor) => {
    await base44.entities.Role.create({ server_id: server.id, name: roleName, color: roleColor, position: roles.length });
    setRoles(await base44.entities.Role.filter({ server_id: server.id }));
    qc.invalidateQueries({ queryKey: ['roles'] });
  };

  const updateRole = async (id, data) => {
    await base44.entities.Role.update(id, data);
    setRoles(r => r.map(x => x.id === id ? { ...x, ...data } : x));
    qc.invalidateQueries({ queryKey: ['roles'] });
  };

  const deleteRole = async (id) => {
    await base44.entities.Role.delete(id);
    setRoles(r => r.filter(x => x.id !== id));
    qc.invalidateQueries({ queryKey: ['roles'] });
  };

  const kickMember = async (m) => {
    if (!confirm(`Kick ${m.user_email}?`)) return;
    await base44.entities.ServerMember.delete(m.id);
    setMembers(ms => ms.filter(x => x.id !== m.id));
    await base44.entities.Server.update(server.id, { member_count: Math.max(1, (server.member_count || 1) - 1) });
    qc.invalidateQueries({ queryKey: ['members'] });
  };

  const deleteServer = async () => {
    const [chs, cats, msgs, mems, rls] = await Promise.all([
      base44.entities.Channel.filter({ server_id: server.id }),
      base44.entities.Category.filter({ server_id: server.id }),
      base44.entities.Message.filter({ server_id: server.id }),
      base44.entities.ServerMember.filter({ server_id: server.id }),
      base44.entities.Role.filter({ server_id: server.id }),
    ]);
    await Promise.all([...msgs.map(m => base44.entities.Message.delete(m.id)), ...chs.map(c => base44.entities.Channel.delete(c.id)), ...cats.map(c => base44.entities.Category.delete(c.id)), ...mems.map(m => base44.entities.ServerMember.delete(m.id)), ...rls.map(r => base44.entities.Role.delete(r.id))]);
    await base44.entities.Server.delete(server.id);
    qc.invalidateQueries({ queryKey: ['servers'] });
    onClose('deleted');
  };

  const renderContent = () => {
    switch (tab) {
      case 'overview': return <OverviewTab server={server} name={name} setName={setName} desc={desc} setDesc={setDesc} isPublic={isPublic} setIsPublic={setIsPublic} serverSettings={serverSettings} setServerSettings={setServerSettings} onSave={saveOverview} onUploadImg={uploadImg} saving={saving} />;
      case 'appearance': return (
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1.5" style={{ color: colors.text.muted }}>Banner Color</label>
            <div className="flex gap-3 items-center">
              <input type="color" value={bannerColor} onChange={e => setBannerColor(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }} />
              <span className="text-[13px] font-mono" style={{ color: colors.text.secondary }}>{bannerColor}</span>
            </div>
          </div>
          <div className="h-24 rounded-xl" style={{ background: bannerColor }} />
          <button onClick={() => uploadImg('icon_url')} className="w-full py-3 rounded-xl text-[13px]" style={{ background: colors.bg.elevated, color: colors.text.secondary, border: `1px solid ${colors.border.default}` }}>Change Server Icon</button>
          <button onClick={() => uploadImg('banner_url')} className="w-full py-3 rounded-xl text-[13px]" style={{ background: colors.bg.elevated, color: colors.text.secondary, border: `1px solid ${colors.border.default}` }}>Change Server Banner</button>
          <button onClick={() => { setBannerColor(bannerColor); saveOverview(); }} disabled={saving} className="px-6 py-2.5 rounded-xl text-[13px] font-semibold disabled:opacity-30" style={{ background: colors.accent.primary, color: '#fff' }}>
            {saving ? 'Saving...' : 'Save Appearance'}
          </button>
        </div>
      );
      case 'invites': return (
        <div className="space-y-3">
          <div className="p-4 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: colors.text.disabled }}>Current Invite</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 text-[13px] font-mono px-3 py-2.5 rounded-lg truncate" style={{ background: colors.bg.base, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}>
                {window.location.origin}/invite/{server?.invite_code}
              </div>
              <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/invite/${server?.invite_code}`)}
                className="px-4 py-2.5 rounded-lg text-[12px] font-medium" style={{ background: colors.accent.primary, color: '#fff' }}>Copy</button>
            </div>
            <p className="text-[11px] mt-2" style={{ color: colors.text.disabled }}>Code: <span className="font-mono font-bold" style={{ color: colors.text.primary }}>{server?.invite_code}</span> · Never expires</p>
          </div>
        </div>
      );
      case 'roles': return <RolesTab roles={roles} members={members} onAddRole={addRole} onUpdateRole={updateRole} onDeleteRole={deleteRole} />;
      case 'members': return <MembersTab members={members} roles={roles} serverId={server?.id} ownerId={server?.owner_id} onKick={kickMember} />;
      case 'bots': return <BotsTab serverId={server?.id} />;
      case 'audit-log': return <AuditLogTab serverId={server?.id} />;
      case 'emoji': return <EmojiTab serverId={server?.id} type="emoji" />;
      case 'stickers': return <EmojiTab serverId={server?.id} type="sticker" />;
      case 'danger': return <DangerTab server={server} onDelete={deleteServer} />;
      case 'channels': return (
        <div className="space-y-3">
          <p className="text-[13px] mb-3" style={{ color: colors.text.muted }}>Manage channels from the sidebar. Right-click any channel to edit or delete it.</p>
          {(channels || []).sort((a, b) => (a.position || 0) - (b.position || 0)).map(ch => (
            <div key={ch.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
              <Hash className="w-4 h-4" style={{ color: colors.text.disabled }} />
              <span className="text-[13px] flex-1" style={{ color: colors.text.primary }}>{ch.name}</span>
              <span className="text-[11px] px-2 py-0.5 rounded" style={{ background: colors.bg.overlay, color: colors.text.disabled }}>{ch.type}</span>
            </div>
          ))}
        </div>
      );
      case 'categories': return (
        <div className="space-y-3">
          <p className="text-[13px] mb-3" style={{ color: colors.text.muted }}>Categories organize your channels into groups. Drag categories in the sidebar to reorder.</p>
          {(serverCategories || []).sort((a, b) => (a.position || 0) - (b.position || 0)).map(cat => {
            const catChannels = (channels || []).filter(ch => ch.category_id === cat.id);
            return (
              <div key={cat.id} className="px-3 py-3 rounded-lg" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-semibold uppercase tracking-wider" style={{ color: colors.text.primary }}>{cat.name}</span>
                  <span className="text-[11px]" style={{ color: colors.text.disabled }}>{catChannels.length} channels</span>
                </div>
                {catChannels.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {catChannels.map(ch => (
                      <div key={ch.id} className="flex items-center gap-2 text-[12px] pl-2" style={{ color: colors.text.muted }}>
                        <Hash className="w-3 h-3" /> {ch.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      );
      default: return (
        <div className="text-center py-16">
          <p className="text-[32px] mb-3">🚧</p>
          <p className="text-[15px] font-semibold mb-1" style={{ color: colors.text.primary }}>Under Construction</p>
          <p className="text-[13px]" style={{ color: colors.text.muted }}>This section is being built and will be available soon.</p>
        </div>
      );
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full h-[85vh] max-w-[900px] rounded-2xl overflow-hidden flex"
        style={{ background: colors.bg.surface, border: `1px solid ${colors.border.light}`, boxShadow: shadows.strong }}
        onClick={e => e.stopPropagation()}>
        <SettingsNav active={tab} onSelect={setTab} serverName={server?.name || 'Server'} />
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: `1px solid ${colors.border.default}` }}>
            <h2 className="text-[18px] font-bold capitalize" style={{ color: colors.text.primary }}>{tab.replace(/-/g, ' ')}</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)]">
              <X className="w-5 h-5" style={{ color: colors.text.muted }} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-none p-6">
            {renderContent()}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}