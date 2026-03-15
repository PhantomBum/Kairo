import React, { useState } from 'react';

export default function BotWelcomeLeave({ bot, onSave }) {
  const [welcome, setWelcome] = useState(bot.welcome_config || { enabled: false, message: '', dm_message: '', channel_id: '', assign_roles: [] });
  const [leave, setLeave] = useState(bot.leave_config || { enabled: false, message: '', channel_id: '' });
  const [saving, setSaving] = useState(false);

  const save = async () => { setSaving(true); await onSave(bot.id, { welcome_config: welcome, leave_config: leave }); setSaving(false); };

  const Toggle = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</span>
      <button onClick={() => onChange(!value)} className="w-10 h-5 rounded-full transition-colors relative" style={{ background: value ? 'var(--accent-green)' : 'var(--bg-overlay)' }}>
        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: value ? 22 : 2 }} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Welcome Messages</h3>
        <Toggle label="Enabled" value={welcome.enabled} onChange={v => setWelcome(p => ({ ...p, enabled: v }))} />
        {welcome.enabled && (
          <>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] block mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Channel Message</label>
              <textarea value={welcome.message} onChange={e => setWelcome(p => ({ ...p, message: e.target.value }))} rows={3}
                placeholder="Welcome {user} to {server}! 🎉" className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
              <p className="text-[11px] mt-1" style={{ color: 'var(--text-faint)' }}>Use {'{user}'} for username, {'{server}'} for server name</p>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-[0.08em] block mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>DM Message (optional)</label>
              <textarea value={welcome.dm_message} onChange={e => setWelcome(p => ({ ...p, dm_message: e.target.value }))} rows={2}
                placeholder="Welcome to the server! Check out #rules" className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
            </div>
          </>
        )}
      </div>

      <div className="rounded-2xl p-5 space-y-3" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Leave Messages</h3>
        <Toggle label="Enabled" value={leave.enabled} onChange={v => setLeave(p => ({ ...p, enabled: v }))} />
        {leave.enabled && (
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] block mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Leave Message</label>
            <textarea value={leave.message} onChange={e => setLeave(p => ({ ...p, message: e.target.value }))} rows={2}
              placeholder="{user} has left the server. Goodbye! 👋" className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
        )}
      </div>

      <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-30" style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}