import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, Settings, Hash, Shield, Trash2, Plus, Copy, Users, GripVertical } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function ServerSettingsView({ server, categories, channels, roles, members, profilesMap, currentUser, onBack }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState('overview');
  const [name, setName] = useState(server.name || '');
  const [description, setDescription] = useState(server.description || '');
  const [saving, setSaving] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#99AAB5');

  const saveServer = async () => { setSaving(true); await base44.entities.Server.update(server.id, { name, description }); qc.invalidateQueries({ queryKey: ['myServers'] }); setSaving(false); };
  const deleteChannel = async (ch) => { if (!confirm(`Delete #${ch.name}?`)) return; await base44.entities.Channel.delete(ch.id); qc.invalidateQueries({ queryKey: ['channels', server.id] }); };
  const createRole = async () => { if (!newRoleName.trim()) return; await base44.entities.Role.create({ server_id: server.id, name: newRoleName, color: newRoleColor, position: roles.length }); setNewRoleName(''); qc.invalidateQueries({ queryKey: ['roles', server.id] }); };
  const deleteRole = async (role) => { if (role.is_default) return alert("Can't delete @everyone"); if (!confirm(`Delete "${role.name}"?`)) return; await base44.entities.Role.delete(role.id); qc.invalidateQueries({ queryKey: ['roles', server.id] }); };

  const sortedChannels = [...channels].sort((a, b) => (a.position || 0) - (b.position || 0));
  const sortedRoles = [...roles].sort((a, b) => (b.position || 0) - (a.position || 0));

  const handleChannelDragEnd = async (result) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const reordered = [...sortedChannels];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const updates = reordered.map((ch, i) => base44.entities.Channel.update(ch.id, { position: i }));
    await Promise.all(updates);
    qc.invalidateQueries({ queryKey: ['channels', server.id] });
  };

  const handleRoleDragEnd = async (result) => {
    if (!result.destination || result.source.index === result.destination.index) return;
    const reordered = [...sortedRoles];
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    const updates = reordered.map((r, i) => base44.entities.Role.update(r.id, { position: reordered.length - 1 - i }));
    await Promise.all(updates);
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
              <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none" style={{ background: '#1a1a1a' }} />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase text-zinc-500 mb-2 block">Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-lg text-sm text-white focus:outline-none resize-none" style={{ background: '#1a1a1a' }} />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase text-zinc-500 mb-2 block">Invite Code</label>
              <div className="flex items-center gap-2">
                <code className="px-3 py-2 rounded-lg text-sm text-white flex-1" style={{ background: '#1a1a1a' }}>{server.invite_code}</code>
                <button onClick={() => navigator.clipboard.writeText(server.invite_code)} className="px-3 py-2 rounded-lg text-sm text-white hover:bg-white/10 transition-colors" style={{ background: '#1a1a1a' }}><Copy className="w-4 h-4" /></button>
              </div>
            </div>
            <button onClick={saveServer} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium text-black disabled:opacity-50" style={{ background: '#fff' }}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        )}

        {tab === 'channels' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-semibold uppercase text-zinc-500">Channels — {channels.length}</div>
              <div className="text-[10px] text-zinc-600">Drag to reorder</div>
            </div>
            <DragDropContext onDragEnd={handleChannelDragEnd}>
              <Droppable droppableId="settings-channels">
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}
                    className="space-y-1 rounded-lg p-1 transition-colors"
                    style={{ background: snapshot.isDraggingOver ? 'rgba(99,102,241,0.04)' : 'transparent' }}>
                    {sortedChannels.map((ch, i) => (
                      <Draggable key={ch.id} draggableId={`sch-${ch.id}`} index={i}>
                        {(p, s) => (
                          <div ref={p.innerRef} {...p.draggableProps}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg group transition-all"
                            style={{
                              ...p.draggableProps.style,
                              background: s.isDragging ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
                              border: s.isDragging ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                              boxShadow: s.isDragging ? '0 4px 20px rgba(0,0,0,0.4)' : 'none',
                            }}>
                            <div {...p.dragHandleProps} className="text-zinc-600 hover:text-zinc-300 cursor-grab active:cursor-grabbing">
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <Hash className="w-4 h-4 text-zinc-500" />
                            <div className="flex-1">
                              <span className="text-sm text-white">{ch.name}</span>
                              <span className="text-[11px] text-zinc-600 ml-2">{ch.type}</span>
                            </div>
                            <button onClick={() => deleteChannel(ch)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}

        {tab === 'roles' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-semibold uppercase text-zinc-500">Roles — {roles.length}</div>
              <div className="text-[10px] text-zinc-600">Drag to set hierarchy</div>
            </div>
            <DragDropContext onDragEnd={handleRoleDragEnd}>
              <Droppable droppableId="settings-roles">
                {(provided, snapshot) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}
                    className="space-y-1 rounded-lg p-1 transition-colors mb-4"
                    style={{ background: snapshot.isDraggingOver ? 'rgba(99,102,241,0.04)' : 'transparent' }}>
                    {sortedRoles.map((role, i) => (
                      <Draggable key={role.id} draggableId={`sr-${role.id}`} index={i} isDragDisabled={role.is_default}>
                        {(p, s) => (
                          <div ref={p.innerRef} {...p.draggableProps}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg group transition-all"
                            style={{
                              ...p.draggableProps.style,
                              background: s.isDragging ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
                              border: s.isDragging ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                              boxShadow: s.isDragging ? '0 4px 20px rgba(0,0,0,0.4)' : 'none',
                            }}>
                            <div {...p.dragHandleProps} className={`${role.is_default ? 'opacity-10' : 'text-zinc-600 hover:text-zinc-300 cursor-grab active:cursor-grabbing'}`}>
                              <GripVertical className="w-4 h-4" />
                            </div>
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: role.color || '#99AAB5' }} />
                            <span className="text-sm text-white flex-1">{role.name}</span>
                            <span className="text-[9px] text-zinc-600 font-mono">pos {role.position || 0}</span>
                            {role.is_default && <span className="text-[10px] text-zinc-500">default</span>}
                            {!role.is_default && (
                              <button onClick={() => deleteRole(role)} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <div className="flex items-center gap-2 pt-2">
              <input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="New role name..."
                onKeyDown={e => e.key === 'Enter' && createRole()}
                className="flex-1 px-3 py-2 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none" style={{ background: '#1a1a1a' }} />
              <input type="color" value={newRoleColor} onChange={e => setNewRoleColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" />
              <button onClick={createRole} className="px-3 py-2 rounded-lg text-sm text-black font-medium" style={{ background: '#fff' }}><Plus className="w-4 h-4" /></button>
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