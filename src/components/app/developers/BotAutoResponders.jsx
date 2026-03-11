import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const MATCH_TYPES = ['exact', 'contains', 'starts_with', 'ends_with', 'regex'];

export default function BotAutoResponders({ bot, onSave }) {
  const [responders, setResponders] = useState(bot.auto_responders || []);
  const [saving, setSaving] = useState(false);

  const add = () => setResponders(prev => [...prev, { id: Date.now().toString(), trigger: '', match_type: 'contains', response: '', channels: [], enabled: true }]);
  const update = (id, data) => setResponders(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
  const remove = (id) => setResponders(prev => prev.filter(r => r.id !== id));

  const save = async () => { setSaving(true); await onSave(bot.id, { auto_responders: responders }); setSaving(false); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Auto Responders ({responders.length})</h3>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium" style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {responders.map(r => (
        <div key={r.id} className="p-4 rounded-2xl space-y-3" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <button onClick={() => update(r.id, { enabled: !r.enabled })} className="w-8 h-4 rounded-full relative" style={{ background: r.enabled ? 'var(--accent-green)' : 'var(--bg-overlay)' }}>
              <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform" style={{ left: r.enabled ? 17 : 2 }} />
            </button>
            <button onClick={() => remove(r.id)} className="p-1 rounded-lg hover:bg-[rgba(201,123,123,0.1)]"><Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-semibold uppercase tracking-[0.08em] block mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Trigger</label>
              <input value={r.trigger} onChange={e => update(r.id, { trigger: e.target.value })} placeholder="hello"
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label className="text-[9px] font-semibold uppercase tracking-[0.08em] block mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Match Type</label>
              <select value={r.match_type} onChange={e => update(r.id, { match_type: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                {MATCH_TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[9px] font-semibold uppercase tracking-[0.08em] block mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Response</label>
            <textarea value={r.response} onChange={e => update(r.id, { response: e.target.value })} rows={2} placeholder="Hey there! 👋"
              className="w-full px-2.5 py-1.5 rounded-lg text-[12px] outline-none resize-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
        </div>
      ))}

      {responders.length === 0 && (
        <div className="text-center py-8 rounded-2xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No auto responders. Add triggers for automatic responses.</p>
        </div>
      )}

      <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-30" style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}