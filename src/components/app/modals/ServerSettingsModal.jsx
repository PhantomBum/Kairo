import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Settings, Shield, Users, AlertTriangle, Trash2, Plus } from 'lucide-react';
import ModalWrapper from './ModalWrapper';

const TABS = [{ id: 'overview', label: 'Overview', icon: Settings }, { id: 'roles', label: 'Roles', icon: Shield }, { id: 'members', label: 'Members', icon: Users }, { id: 'danger', label: 'Danger', icon: AlertTriangle }];

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

  useEffect(() => {
    if (!server?.id) return;
    base44.entities.Role.filter({ server_id: server.id }).then(setRoles);
    base44.entities.ServerMember.filter({ server_id: server.id }).then(setMembers);
  }, [server?.id]);

  const saveOverview = async () => { setSaving(true); await base44.entities.Server.update(server.id, { name, description: desc }); qc.invalidateQueries({ queryKey: ['servers'] }); setSaving(false); };

  const uploadImg = async (field) => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
    input.onchange = async () => { const f = input.files?.[0]; if (!f) return; const { file_url } = await base44.integrations.Core.UploadFile({ file: f }); await base44.entities.Server.update(server.id, { [field]: file_url }); qc.invalidateQueries({ queryKey: ['servers'] }); };
    input.click();
  };

  const addRole = async () => {
    if (!newRole.trim()) return;
    await base44.entities.Role.create({ server_id: server.id, name: newRole.trim(), color: newRoleColor, position: roles.length });
    setNewRole(''); setRoles(await base44.entities.Role.filter({ server_id: server.id }));
    qc.invalidateQueries({ queryKey: ['roles'] });
  };

  const deleteRole = async (id) => { await base44.entities.Role.delete(id); setRoles(r => r.filter(x => x.id !== id)); qc.invalidateQueries({ queryKey: ['roles'] }); };

  const kickMember = async (m) => {
    if (!confirm(`Kick ${m.user_email}?`)) return;
    await base44.entities.ServerMember.delete(m.id); setMembers(ms => ms.filter(x => x.id !== m.id));
    await base44.entities.Server.update(server.id, { member_count: Math.max(1, (server.member_count || 1) - 1) });
    qc.invalidateQueries({ queryKey: ['members'] });
  };

  const deleteServer = async () => {
    if (confirmDelete !== server.name) return;
    const [chs, cats, msgs, mems, rls] = await Promise.all([base44.entities.Channel.filter({ server_id: server.id }), base44.entities.Category.filter({ server_id: server.id }), base44.entities.Message.filter({ server_id: server.id }), base44.entities.ServerMember.filter({ server_id: server.id }), base44.entities.Role.filter({ server_id: server.id })]);
    await Promise.all([...msgs.map(m => base44.entities.Message.delete(m.id)), ...chs.map(c => base44.entities.Channel.delete(c.id)), ...cats.map(c => base44.entities.Category.delete(c.id)), ...mems.map(m => base44.entities.ServerMember.delete(m.id)), ...rls.map(r => base44.entities.Role.delete(r.id))]);
    await base44.entities.Server.delete(server.id);
    qc.invalidateQueries({ queryKey: ['servers'] });
    onClose('deleted');
  };

  return (
    <ModalWrapper title="Server Settings" onClose={onClose} width={600}>
      <div className="flex gap-4 min-h-[400px]">
        <div className="w-[120px] flex-shrink-0 space-y-0.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-[12px] transition-colors"
              style={{ background: tab === t.id ? 'var(--bg-glass-active)' : 'transparent', color: tab === t.id ? (t.id === 'danger' ? 'var(--accent-red)' : 'var(--text-cream)') : 'var(--text-muted)' }}>
              <t.icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto max-h-[500px] space-y-4">
          {tab === 'overview' && <>
            <div className="flex gap-3">
              <button onClick={() => uploadImg('icon_url')} className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: 'var(--bg-glass)', border: '1px dashed var(--border-light)' }}>
                {server?.icon_url ? <img src={server.icon_url} className="w-full h-full object-cover" /> : <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{server?.name?.slice(0,2)}</span>}
              </button>
              <div className="flex-1 space-y-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm outline-none font-mono" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
                </div>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Description</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
            </div>
            <button onClick={() => uploadImg('banner_url')} className="w-full h-20 rounded-xl overflow-hidden" style={{ background: 'var(--bg-glass)', border: '1px dashed var(--border-light)' }}>
              {server?.banner_url ? <img src={server.banner_url} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-[11px]" style={{ color: 'var(--text-muted)' }}>Upload Banner</div>}
            </button>
            <button onClick={saveOverview} disabled={saving} className="px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-30" style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>{saving ? 'Saving...' : 'Save'}</button>
          </>}
          {tab === 'roles' && <>
            <div className="flex gap-2">
              <input value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="Role name" className="flex-1 px-3 py-2 rounded-xl text-sm outline-none font-mono" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
              <input type="color" value={newRoleColor} onChange={e => setNewRoleColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }} />
              <button onClick={addRole} className="px-4 rounded-xl" style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}><Plus className="w-4 h-4" /></button>
            </div>
            <div className="space-y-1">
              {roles.sort((a,b) => (b.position||0) - (a.position||0)).map(r => (
                <div key={r.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: 'var(--bg-glass)' }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: r.color }} />
                  <span className="text-sm flex-1 font-mono" style={{ color: r.color }}>{r.name}</span>
                  {!r.is_default && <button onClick={() => deleteRole(r.id)} className="p-1 rounded hover:bg-[var(--bg-glass-hover)]"><Trash2 className="w-3 h-3" style={{ color: 'var(--accent-red)' }} /></button>}
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
                {m.user_id === server.owner_id ? <span className="text-[8px] px-1.5 rounded font-mono" style={{ background: 'rgba(201,180,123,0.15)', color: 'var(--accent-amber)' }}>OWNER</span>
                : <button onClick={() => kickMember(m)} className="text-[10px] px-2 py-0.5 rounded-lg hover:bg-[rgba(201,123,123,0.1)]" style={{ color: 'var(--accent-red)' }}>Kick</button>}
              </div>
            ))}
          </div>}
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