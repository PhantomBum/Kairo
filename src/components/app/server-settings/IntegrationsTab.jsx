import React, { useState, useEffect } from 'react';
import { Webhook, Plus, Trash2, Copy, Check, Link } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';

export default function IntegrationsTab({ serverId }) {
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newChannel, setNewChannel] = useState('');
  const [channels, setChannels] = useState([]);
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    if (serverId) {
      base44.entities.ServerWebhook.filter({ server_id: serverId }).then(d => { setWebhooks(d); setLoading(false); });
      base44.entities.Channel.filter({ server_id: serverId }).then(setChannels);
    }
  }, [serverId]);

  const create = async () => {
    if (!newName.trim()) return;
    const webhookUrl = `https://kairo.app/webhooks/${Math.random().toString(36).slice(2, 10)}`;
    const wh = await base44.entities.ServerWebhook.create({
      server_id: serverId, name: newName.trim(), channel_id: newChannel || channels[0]?.id,
      webhook_url: webhookUrl, is_active: true,
    });
    setWebhooks(p => [...p, wh]);
    setNewName('');
  };

  const remove = async (wh) => {
    if (!confirm(`Delete the "${wh.name}" webhook? Integrations using it will stop working.`)) return;
    await base44.entities.ServerWebhook.delete(wh.id);
    setWebhooks(p => p.filter(x => x.id !== wh.id));
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) return <div className="text-center py-12"><div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: colors.border.light, borderTopColor: colors.accent.primary }} /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <Webhook className="w-5 h-5" style={{ color: colors.accent.primary }} />
        <div>
          <p className="text-[14px] font-semibold" style={{ color: colors.text.primary }}>Webhooks</p>
          <p className="text-[12px]" style={{ color: colors.text.muted }}>Send automated messages to channels from external services</p>
        </div>
      </div>

      {/* Create new */}
      <div className="flex gap-2">
        <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Webhook name..."
          className="flex-1 px-3 py-2.5 rounded-lg text-[13px] outline-none"
          style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}
          onKeyDown={e => e.key === 'Enter' && create()} />
        <select value={newChannel} onChange={e => setNewChannel(e.target.value)}
          className="px-3 py-2.5 rounded-lg text-[12px] outline-none"
          style={{ background: colors.bg.elevated, color: colors.text.secondary, border: `1px solid ${colors.border.default}` }}>
          {channels.filter(c => c.type === 'text').map(c => <option key={c.id} value={c.id}>#{c.name}</option>)}
        </select>
        <button onClick={create} className="px-4 py-2.5 rounded-lg text-[12px] font-medium flex items-center gap-1.5 transition-all hover:brightness-110 active:scale-95"
          style={{ background: colors.accent.primary, color: '#fff' }}>
          <Plus className="w-3.5 h-3.5" /> Create
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {webhooks.length === 0 ? (
          <div className="text-center py-8">
            <Link className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: colors.text.muted }} />
            <p className="text-[13px]" style={{ color: colors.text.muted }}>No webhooks created yet</p>
          </div>
        ) : webhooks.map(wh => (
          <div key={wh.id} className="p-3.5 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-semibold" style={{ color: colors.text.primary }}>{wh.name}</span>
              <button onClick={() => remove(wh)} className="p-1.5 rounded-lg transition-colors hover:bg-[rgba(239,68,68,0.1)]">
                <Trash2 className="w-3.5 h-3.5" style={{ color: colors.danger }} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex-1 text-[11px] font-mono truncate px-2 py-1.5 rounded-lg" style={{ background: colors.bg.base, color: colors.text.muted }}>{wh.webhook_url}</span>
              <button onClick={() => handleCopy(wh.webhook_url, wh.id)}
                className="px-2.5 py-1.5 rounded-lg text-[11px] flex items-center gap-1 transition-all active:scale-95"
                style={{ background: copied === wh.id ? colors.success : colors.bg.overlay, color: copied === wh.id ? '#fff' : colors.text.secondary }}>
                {copied === wh.id ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}