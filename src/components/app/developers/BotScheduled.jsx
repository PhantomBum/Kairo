import React, { useState } from 'react';
import { Plus, Trash2, Clock } from 'lucide-react';

export default function BotScheduled({ bot, onSave }) {
  const [scheduled, setScheduled] = useState(bot.scheduled_messages || []);
  const [saving, setSaving] = useState(false);

  const add = () => setScheduled(prev => [...prev, { id: Date.now().toString(), channel_id: '', content: '', schedule: 'daily', cron: '', enabled: true }]);
  const update = (id, data) => setScheduled(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  const remove = (id) => setScheduled(prev => prev.filter(s => s.id !== id));

  const save = async () => { setSaving(true); await onSave(bot.id, { scheduled_messages: scheduled }); setSaving(false); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Scheduled Messages ({scheduled.length})</h3>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium" style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {scheduled.map(s => (
        <div key={s.id} className="p-4 rounded-2xl space-y-3" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <button onClick={() => update(s.id, { enabled: !s.enabled })} className="w-8 h-4 rounded-full relative" style={{ background: s.enabled ? 'var(--accent-green)' : 'var(--bg-overlay)' }}>
                <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform" style={{ left: s.enabled ? 17 : 2 }} />
              </button>
            </div>
            <button onClick={() => remove(s.id)} className="p-1 rounded-lg hover:bg-[rgba(201,123,123,0.1)]"><Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} /></button>
          </div>
          <div>
            <label className="text-[9px] font-semibold uppercase tracking-[0.08em] block mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Message</label>
            <textarea value={s.content} onChange={e => update(s.id, { content: e.target.value })} rows={2} placeholder="Good morning everyone! ☀️"
              className="w-full px-2.5 py-1.5 rounded-lg text-[12px] outline-none resize-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-semibold uppercase tracking-[0.08em] block mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Schedule</label>
              <select value={s.schedule} onChange={e => update(s.id, { schedule: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg text-[12px] outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                <option value="hourly">Hourly</option><option value="daily">Daily</option><option value="weekly">Weekly</option><option value="custom">Custom Cron</option>
              </select>
            </div>
            {s.schedule === 'custom' && (
              <div>
                <label className="text-[9px] font-semibold uppercase tracking-[0.08em] block mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Cron Expression</label>
                <input value={s.cron} onChange={e => update(s.id, { cron: e.target.value })} placeholder="0 9 * * *"
                  className="w-full px-2.5 py-1.5 rounded-lg text-[12px] outline-none font-mono" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
              </div>
            )}
          </div>
        </div>
      ))}

      {scheduled.length === 0 && (
        <div className="text-center py-8 rounded-2xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No scheduled messages. Schedule automated posts for your bot.</p>
        </div>
      )}

      <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-30" style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}