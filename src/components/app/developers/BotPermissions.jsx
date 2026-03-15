import React, { useState } from 'react';
import { Shield, Clock, AlertTriangle, Hash } from 'lucide-react';

const PERMISSIONS = [
  { id: 'send_messages', label: 'Send Messages', desc: 'Send text messages in channels' },
  { id: 'manage_messages', label: 'Manage Messages', desc: 'Delete/pin messages from others' },
  { id: 'manage_channels', label: 'Manage Channels', desc: 'Create/edit/delete channels' },
  { id: 'manage_roles', label: 'Manage Roles', desc: 'Assign and remove member roles' },
  { id: 'kick_members', label: 'Kick Members', desc: 'Remove members from the server' },
  { id: 'ban_members', label: 'Ban Members', desc: 'Permanently ban members' },
  { id: 'manage_server', label: 'Manage Server', desc: 'Change server name and settings' },
  { id: 'read_messages', label: 'Read Messages', desc: 'View messages in all channels' },
  { id: 'embed_links', label: 'Embed Links', desc: 'Send rich embed messages' },
  { id: 'attach_files', label: 'Attach Files', desc: 'Upload files and images' },
  { id: 'add_reactions', label: 'Add Reactions', desc: 'React to messages with emoji' },
  { id: 'mention_everyone', label: 'Mention Everyone', desc: 'Use @everyone and @here' },
  { id: 'manage_threads', label: 'Manage Threads', desc: 'Create and moderate threads' },
  { id: 'create_polls', label: 'Create Polls', desc: 'Create poll messages' },
];

export default function BotPermissions({ bot, onSave }) {
  const [permissions, setPermissions] = useState(bot.permissions || PERMISSIONS.filter(p => ['send_messages', 'read_messages', 'add_reactions'].includes(p.id)).map(p => p.id));
  const [rateLimit, setRateLimit] = useState(bot.rate_limit || { messages_per_minute: 30, commands_per_minute: 10 });
  const [restrictedChannels, setRestrictedChannels] = useState(bot.restricted_channels || []);
  const [saving, setSaving] = useState(false);

  const togglePerm = (id) => {
    setPermissions(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  };

  const save = async () => {
    setSaving(true);
    await onSave(bot.id, { permissions, rate_limit: rateLimit, restricted_channels: restrictedChannels });
    setSaving(false);
  };

  const dangerPerms = ['kick_members', 'ban_members', 'manage_server', 'manage_roles', 'mention_everyone'];

  return (
    <div className="space-y-6">
      {/* Permissions */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4" style={{ color: 'var(--accent-blue)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Permissions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PERMISSIONS.map(p => (
            <button key={p.id} onClick={() => togglePerm(p.id)}
              className="flex items-start gap-3 p-3 rounded-xl text-left transition-colors"
              style={{
                background: permissions.includes(p.id) ? 'var(--bg-glass-active)' : 'transparent',
                border: `1px solid ${permissions.includes(p.id) ? (dangerPerms.includes(p.id) ? 'rgba(201,123,123,0.3)' : 'rgba(123,201,164,0.3)') : 'var(--border)'}`,
              }}>
              <div className="w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: permissions.includes(p.id) ? (dangerPerms.includes(p.id) ? 'var(--accent-red)' : 'var(--accent-green)') : 'var(--bg-overlay)', border: '1px solid var(--border)' }}>
                {permissions.includes(p.id) && <span className="text-white text-[11px]">✓</span>}
              </div>
              <div>
                <p className="text-[12px] font-medium flex items-center gap-1" style={{ color: 'var(--text-primary)' }}>
                  {p.label}
                  {dangerPerms.includes(p.id) && <AlertTriangle className="w-3 h-3" style={{ color: 'var(--accent-amber)' }} />}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{p.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Rate Limiting */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4" style={{ color: 'var(--accent-amber)' }} />
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Rate Limiting</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] block mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Messages / Minute</label>
            <input type="number" value={rateLimit.messages_per_minute} onChange={e => setRateLimit(p => ({ ...p, messages_per_minute: parseInt(e.target.value) || 0 }))}
              className="w-full px-2.5 py-1.5 rounded-lg text-[12px] outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-[0.08em] block mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Commands / Minute</label>
            <input type="number" value={rateLimit.commands_per_minute} onChange={e => setRateLimit(p => ({ ...p, commands_per_minute: parseInt(e.target.value) || 0 }))}
              className="w-full px-2.5 py-1.5 rounded-lg text-[12px] outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
        </div>
        <p className="text-[11px] mt-2" style={{ color: 'var(--text-faint)' }}>Set to 0 for unlimited. Recommended: 30 messages, 10 commands per minute.</p>
      </div>

      <button onClick={save} disabled={saving} className="px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-30" style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>
        {saving ? 'Saving...' : 'Save Permissions'}
      </button>
    </div>
  );
}