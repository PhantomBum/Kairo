import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';

const PARAM_TYPES = ['text', 'number', 'user', 'channel', 'role', 'boolean'];
const ACTION_TYPES = ['send_message', 'send_embed', 'assign_role', 'remove_role', 'kick_member', 'timeout_member', 'create_channel', 'delete_message', 'send_dm', 'add_reaction', 'create_poll'];

export default function BotCommandBuilder({ bot, onSave }) {
  const [commands, setCommands] = useState(bot.commands || []);
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState(false);

  const addCommand = () => {
    const cmd = { id: Date.now().toString(), name: '', description: '', parameters: [], enabled: true };
    setCommands(prev => [...prev, cmd]);
    setExpanded(cmd.id);
  };

  const updateCommand = (id, data) => setCommands(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  const removeCommand = (id) => setCommands(prev => prev.filter(c => c.id !== id));

  const addParam = (cmdId) => {
    setCommands(prev => prev.map(c => c.id === cmdId ? { ...c, parameters: [...(c.parameters || []), { name: '', type: 'text', description: '', required: false }] } : c));
  };
  const updateParam = (cmdId, idx, data) => {
    setCommands(prev => prev.map(c => c.id === cmdId ? { ...c, parameters: c.parameters.map((p, i) => i === idx ? { ...p, ...data } : p) } : c));
  };
  const removeParam = (cmdId, idx) => {
    setCommands(prev => prev.map(c => c.id === cmdId ? { ...c, parameters: c.parameters.filter((_, i) => i !== idx) } : c));
  };

  const save = async () => {
    setSaving(true);
    await onSave(bot.id, { commands });
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Slash Commands ({commands.length})</h3>
        <button onClick={addCommand} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium" style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>
          <Plus className="w-3.5 h-3.5" /> Add Command
        </button>
      </div>

      {commands.length === 0 ? (
        <div className="text-center py-12 rounded-2xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No commands yet. Add your first slash command!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {commands.map(cmd => (
            <div key={cmd.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(expanded === cmd.id ? null : cmd.id)}>
                <GripVertical className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-mono" style={{ color: cmd.name ? 'var(--text-cream)' : 'var(--text-faint)' }}>/{cmd.name || 'unnamed'}</span>
                  {cmd.description && <span className="text-[10px] ml-2" style={{ color: 'var(--text-muted)' }}>{cmd.description}</span>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={e => { e.stopPropagation(); updateCommand(cmd.id, { enabled: !cmd.enabled }); }}
                    className="w-8 h-4 rounded-full relative" style={{ background: cmd.enabled ? 'var(--accent-green)' : 'var(--bg-overlay)' }}>
                    <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform" style={{ left: cmd.enabled ? 17 : 2 }} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); removeCommand(cmd.id); }} className="p-1 rounded-lg hover:bg-[rgba(201,123,123,0.1)]">
                    <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} />
                  </button>
                  {expanded === cmd.id ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
                </div>
              </div>
              {expanded === cmd.id && (
                <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="grid grid-cols-2 gap-3 pt-3">
                    <div>
                      <label className="text-[9px] font-semibold uppercase tracking-[0.08em] block mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Command Name</label>
                      <input value={cmd.name} onChange={e => updateCommand(cmd.id, { name: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                        placeholder="greet" className="w-full px-2.5 py-1.5 rounded-lg text-[12px] outline-none font-mono" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
                    </div>
                    <div>
                      <label className="text-[9px] font-semibold uppercase tracking-[0.08em] block mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Description</label>
                      <input value={cmd.description} onChange={e => updateCommand(cmd.id, { description: e.target.value })}
                        placeholder="Greet a user" className="w-full px-2.5 py-1.5 rounded-lg text-[12px] outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
                    </div>
                  </div>
                  {/* Parameters */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Parameters</span>
                      <button onClick={() => addParam(cmd.id)} className="text-[10px] flex items-center gap-1" style={{ color: 'var(--accent-blue)' }}><Plus className="w-3 h-3" />Add</button>
                    </div>
                    {(cmd.parameters || []).map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-1.5">
                        <input value={p.name} onChange={e => updateParam(cmd.id, idx, { name: e.target.value })} placeholder="name"
                          className="flex-1 px-2 py-1 rounded-lg text-[11px] outline-none font-mono" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
                        <select value={p.type} onChange={e => updateParam(cmd.id, idx, { type: e.target.value })}
                          className="px-2 py-1 rounded-lg text-[11px] outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                          {PARAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <button onClick={() => updateParam(cmd.id, idx, { required: !p.required })}
                          className="text-[9px] px-2 py-1 rounded-lg" style={{ background: p.required ? 'rgba(201,123,123,0.1)' : 'var(--bg-glass-strong)', color: p.required ? 'var(--accent-red)' : 'var(--text-muted)', border: '1px solid var(--border)' }}>
                          {p.required ? 'Required' : 'Optional'}
                        </button>
                        <button onClick={() => removeParam(cmd.id, idx)} className="p-0.5"><Trash2 className="w-3 h-3" style={{ color: 'var(--accent-red)' }} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-30" style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>
        {saving ? 'Saving...' : 'Save Commands'}
      </button>
    </div>
  );
}