import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronRight, Users } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

const ROLE_TEMPLATES = [
  { name: 'Admin', color: '#ef4444', perms: ['Manage Server', 'Manage Channels', 'Manage Roles', 'Ban Members'] },
  { name: 'Moderator', color: '#eab308', perms: ['Kick Members', 'Timeout Members', 'Manage Messages'] },
  { name: 'VIP', color: '#8b5cf6', perms: [] },
  { name: 'Member', color: '#22c55e', perms: [] },
];

export default function RolesTab({ roles, members, onAddRole, onUpdateRole, onDeleteRole }) {
  const [editId, setEditId] = useState(null);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#8b5cf6');
  const sorted = [...roles].sort((a, b) => (b.position || 0) - (a.position || 0));
  const editing = sorted.find(r => r.id === editId);

  const memberCount = (roleId) => members.filter(m => m.role_ids?.includes(roleId)).length;

  return (
    <div className="flex gap-4 min-h-[400px]">
      {/* Role list */}
      <div className="w-[220px] flex-shrink-0 space-y-2">
        <div className="flex gap-2 mb-3">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New role name..."
            className="flex-1 px-3 py-2 rounded-lg text-[13px] outline-none"
            style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
          <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="w-9 h-9 rounded-lg cursor-pointer flex-shrink-0" style={{ background: colors.bg.elevated }} />
          <button onClick={() => { if (newName.trim()) { onAddRole(newName.trim(), newColor); setNewName(''); } }}
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: colors.accent.primary, color: '#fff' }}><Plus className="w-4 h-4" /></button>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-wider px-1 mb-1" style={{ color: colors.text.disabled }}>Templates</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {ROLE_TEMPLATES.map(t => (
            <button key={t.name} onClick={() => onAddRole(t.name, t.color)}
              className="text-[11px] px-2.5 py-1 rounded-full"
              style={{ background: `${t.color}15`, color: t.color, border: `1px solid ${t.color}30` }}>
              + {t.name}
            </button>
          ))}
        </div>

        {sorted.map(r => (
          <button key={r.id} onClick={() => setEditId(r.id)}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors"
            style={{
              background: editId === r.id ? 'rgba(139,92,246,0.1)' : colors.bg.elevated,
              border: `1px solid ${editId === r.id ? 'rgba(139,92,246,0.2)' : colors.border.default}`,
            }}>
            <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ background: r.color }} />
            <span className="flex-1 text-[13px] font-medium truncate" style={{ color: r.color }}>{r.name}</span>
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
              <div className="w-6 h-6 rounded-full" style={{ background: editing.color }} />
              <h3 className="text-[16px] font-bold" style={{ color: editing.color }}>{editing.name}</h3>
              {editing.is_default && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: colors.bg.overlay, color: colors.text.muted }}>Default</span>}
            </div>

            {!editing.is_default && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1" style={{ color: colors.text.muted }}>Name</label>
                    <input value={editing.name} onChange={e => onUpdateRole(editing.id, { name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
                      style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider block mb-1" style={{ color: colors.text.muted }}>Color</label>
                    <div className="flex gap-2">
                      <input type="color" value={editing.color} onChange={e => onUpdateRole(editing.id, { color: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer" style={{ background: colors.bg.elevated }} />
                      <input value={editing.color} onChange={e => onUpdateRole(editing.id, { color: e.target.value })}
                        className="flex-1 px-3 py-2 rounded-lg text-[13px] outline-none font-mono"
                        style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
                    </div>
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
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-[14px]" style={{ color: colors.text.muted }}>Select a role to edit</p>
          </div>
        )}
      </div>
    </div>
  );
}