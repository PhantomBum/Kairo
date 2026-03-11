import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Zap, ArrowRight, Filter } from 'lucide-react';

const TRIGGER_TYPES = [
  { id: 'message', label: 'Message Sent' },
  { id: 'member_join', label: 'Member Joins' },
  { id: 'member_leave', label: 'Member Leaves' },
  { id: 'reaction_add', label: 'Reaction Added' },
  { id: 'command', label: 'Command Used' },
  { id: 'keyword', label: 'Keyword Detected' },
  { id: 'role_change', label: 'Role Changed' },
  { id: 'scheduled', label: 'Scheduled Time' },
];

const ACTION_TYPES = [
  { id: 'send_message', label: 'Send Message', color: '#7bc9a4' },
  { id: 'send_dm', label: 'Send DM', color: '#7ba4c9' },
  { id: 'assign_role', label: 'Assign Role', color: '#c9b47b' },
  { id: 'remove_role', label: 'Remove Role', color: '#c97b7b' },
  { id: 'create_thread', label: 'Create Thread', color: '#a47bc9' },
  { id: 'add_reaction', label: 'Add Reaction', color: '#c9a47b' },
  { id: 'timeout_user', label: 'Timeout User', color: '#c97b7b' },
  { id: 'log_event', label: 'Log to Channel', color: '#7bc9c9' },
  { id: 'send_embed', label: 'Send Embed', color: '#a4c97b' },
  { id: 'wait', label: 'Wait / Delay', color: '#80848e' },
];

const CONDITION_TYPES = [
  { id: 'has_role', label: 'User has role' },
  { id: 'in_channel', label: 'In specific channel' },
  { id: 'message_contains', label: 'Message contains' },
  { id: 'user_is', label: 'User is' },
  { id: 'time_between', label: 'Time between' },
];

export default function BotFlowActions({ bot, onSave }) {
  const [flows, setFlows] = useState(bot.flow_actions || []);
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState(false);

  const addFlow = () => {
    const flow = { id: Date.now().toString(), trigger_type: 'message', trigger_value: '', actions: [{ type: 'send_message', config: {} }], conditions: [], enabled: true };
    setFlows(p => [...p, flow]);
    setExpanded(flow.id);
  };

  const updateFlow = (id, data) => setFlows(p => p.map(f => f.id === id ? { ...f, ...data } : f));
  const removeFlow = (id) => setFlows(p => p.filter(f => f.id !== id));

  const addAction = (flowId) => {
    setFlows(p => p.map(f => f.id === flowId ? { ...f, actions: [...f.actions, { type: 'send_message', config: {} }] } : f));
  };
  const updateAction = (flowId, idx, data) => {
    setFlows(p => p.map(f => f.id === flowId ? { ...f, actions: f.actions.map((a, i) => i === idx ? { ...a, ...data } : a) } : f));
  };
  const removeAction = (flowId, idx) => {
    setFlows(p => p.map(f => f.id === flowId ? { ...f, actions: f.actions.filter((_, i) => i !== idx) } : f));
  };

  const addCondition = (flowId) => {
    setFlows(p => p.map(f => f.id === flowId ? { ...f, conditions: [...(f.conditions || []), { type: 'has_role', value: '' }] } : f));
  };
  const removeCondition = (flowId, idx) => {
    setFlows(p => p.map(f => f.id === flowId ? { ...f, conditions: f.conditions.filter((_, i) => i !== idx) } : f));
  };

  const save = async () => { setSaving(true); await onSave(bot.id, { flow_actions: flows }); setSaving(false); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Flow Actions ({flows.length})</h3>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Automate complex workflows with triggers, conditions, and actions</p>
        </div>
        <button onClick={addFlow} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium" style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>
          <Plus className="w-3.5 h-3.5" /> New Flow
        </button>
      </div>

      {flows.length === 0 && (
        <div className="text-center py-12 rounded-2xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
          <Zap className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: 'var(--text-muted)' }} />
          <p className="text-[13px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>No flow actions yet</p>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Create automated workflows triggered by events</p>
        </div>
      )}

      {flows.map(flow => (
        <div key={flow.id} className="rounded-2xl overflow-hidden" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpanded(expanded === flow.id ? null : flow.id)}>
            <Zap className="w-4 h-4 flex-shrink-0" style={{ color: flow.enabled ? 'var(--accent-green)' : 'var(--text-faint)' }} />
            <div className="flex-1 min-w-0">
              <span className="text-[13px] font-medium" style={{ color: 'var(--text-cream)' }}>
                {TRIGGER_TYPES.find(t => t.id === flow.trigger_type)?.label || 'Unknown'}
              </span>
              <span className="text-[11px] ml-2" style={{ color: 'var(--text-muted)' }}>→ {flow.actions.length} action{flow.actions.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={e => { e.stopPropagation(); updateFlow(flow.id, { enabled: !flow.enabled }); }}
                className="w-8 h-4 rounded-full relative" style={{ background: flow.enabled ? 'var(--accent-green)' : 'var(--bg-overlay)' }}>
                <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform" style={{ left: flow.enabled ? 17 : 2 }} />
              </button>
              <button onClick={e => { e.stopPropagation(); removeFlow(flow.id); }} className="p-1 rounded-lg hover:bg-[rgba(201,123,123,0.1)]">
                <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} />
              </button>
              {expanded === flow.id ? <ChevronUp className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
            </div>
          </div>

          {expanded === flow.id && (
            <div className="px-4 pb-4 space-y-4" style={{ borderTop: '1px solid var(--border)' }}>
              {/* Trigger */}
              <div className="pt-3">
                <label className="text-[9px] font-semibold uppercase tracking-[0.08em] block mb-1.5" style={{ color: 'var(--accent-green)', fontFamily: 'monospace' }}>Trigger</label>
                <div className="grid grid-cols-2 gap-2">
                  <select value={flow.trigger_type} onChange={e => updateFlow(flow.id, { trigger_type: e.target.value })}
                    className="px-2.5 py-1.5 rounded-lg text-[12px] outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                    {TRIGGER_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                  </select>
                  <input value={flow.trigger_value || ''} onChange={e => updateFlow(flow.id, { trigger_value: e.target.value })}
                    placeholder="Filter value..." className="px-2.5 py-1.5 rounded-lg text-[12px] outline-none"
                    style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
                </div>
              </div>

              {/* Conditions */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[9px] font-semibold uppercase tracking-[0.08em] flex items-center gap-1" style={{ color: 'var(--accent-amber)', fontFamily: 'monospace' }}>
                    <Filter className="w-3 h-3" /> Conditions
                  </label>
                  <button onClick={() => addCondition(flow.id)} className="text-[10px] flex items-center gap-1" style={{ color: 'var(--accent-blue)' }}><Plus className="w-3 h-3" />Add</button>
                </div>
                {(flow.conditions || []).map((cond, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-1.5">
                    <select value={cond.type} onChange={e => {
                      const c = [...flow.conditions]; c[idx] = { ...c[idx], type: e.target.value };
                      updateFlow(flow.id, { conditions: c });
                    }} className="px-2 py-1 rounded-lg text-[11px] outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                      {CONDITION_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                    <input value={cond.value || ''} onChange={e => {
                      const c = [...flow.conditions]; c[idx] = { ...c[idx], value: e.target.value };
                      updateFlow(flow.id, { conditions: c });
                    }} placeholder="Value..." className="flex-1 px-2 py-1 rounded-lg text-[11px] outline-none"
                      style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
                    <button onClick={() => removeCondition(flow.id, idx)} className="p-0.5"><Trash2 className="w-3 h-3" style={{ color: 'var(--accent-red)' }} /></button>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[9px] font-semibold uppercase tracking-[0.08em] flex items-center gap-1" style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>
                    <ArrowRight className="w-3 h-3" /> Actions
                  </label>
                  <button onClick={() => addAction(flow.id)} className="text-[10px] flex items-center gap-1" style={{ color: 'var(--accent-blue)' }}><Plus className="w-3 h-3" />Add</button>
                </div>
                {flow.actions.map((action, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2 p-2 rounded-lg" style={{ background: 'var(--bg-glass-strong)', border: '1px solid var(--border)' }}>
                    <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ background: ACTION_TYPES.find(a => a.id === action.type)?.color || '#80848e' }} />
                    <select value={action.type} onChange={e => updateAction(flow.id, idx, { type: e.target.value })}
                      className="px-2 py-1 rounded-lg text-[11px] outline-none flex-shrink-0" style={{ background: 'var(--bg-deep)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                      {ACTION_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                    </select>
                    <input value={action.config?.value || ''} onChange={e => updateAction(flow.id, idx, { config: { ...action.config, value: e.target.value } })}
                      placeholder="Configure..." className="flex-1 px-2 py-1 rounded-lg text-[11px] outline-none"
                      style={{ background: 'var(--bg-deep)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
                    <button onClick={() => removeAction(flow.id, idx)} className="p-0.5 flex-shrink-0"><Trash2 className="w-3 h-3" style={{ color: 'var(--accent-red)' }} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {flows.length > 0 && (
        <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-30" style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>
          {saving ? 'Saving...' : 'Save Flows'}
        </button>
      )}
    </div>
  );
}