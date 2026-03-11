import React, { useState } from 'react';
import { ArrowLeft, Copy, RefreshCw, Trash2, Upload, Bot, Eye, EyeOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BotCommandBuilder from './BotCommandBuilder';
import BotAutoResponders from './BotAutoResponders';
import BotWelcomeLeave from './BotWelcomeLeave';
import BotScheduled from './BotScheduled';
import BotAnalytics from './BotAnalytics';

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'commands', label: 'Commands' },
  { id: 'autoresponders', label: 'Auto Responders' },
  { id: 'welcome', label: 'Welcome/Leave' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'analytics', label: 'Analytics' },
];

export default function BotEditor({ bot, onSave, onBack, onDelete }) {
  const [tab, setTab] = useState('general');
  const [form, setForm] = useState({
    name: bot.name || '', description: bot.description || '', prefix: bot.prefix || '!',
    category: bot.category || 'utility', is_public: bot.is_public || false,
    tags: bot.tags?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const saveGeneral = async () => {
    setSaving(true);
    await onSave(bot.id, { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
    setSaving(false);
  };

  const handleAvatar = async () => {
    const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*';
    input.onchange = async () => { const f = input.files?.[0]; if (!f) return; const { file_url } = await base44.integrations.Core.UploadFile({ file: f }); await onSave(bot.id, { avatar_url: file_url }); };
    input.click();
  };

  const regenerateToken = async () => {
    if (!confirm('Regenerate token? This will invalidate the current token.')) return;
    const token = 'KBot.' + Math.random().toString(36).substring(2, 10) + '.' + Math.random().toString(36).substring(2, 18);
    await onSave(bot.id, { token });
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); };

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft className="w-4 h-4" /> Back to bots
      </button>

      <div className="flex items-center gap-4 mb-6">
        <button onClick={handleAvatar} className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden group relative"
          style={{ background: 'var(--bg-glass-strong)', border: '1px solid var(--border)' }}>
          {bot.avatar_url ? <img src={bot.avatar_url} className="w-full h-full object-cover" /> : <Bot className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Upload className="w-4 h-4 text-white" /></div>
        </button>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>{bot.name}</h2>
          <p className="text-[10px] font-mono" style={{ color: 'var(--text-faint)' }}>ID: {bot.client_id}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-none">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className="px-3 py-2 rounded-xl text-[11px] font-medium whitespace-nowrap transition-colors"
            style={{ background: tab === t.id ? 'var(--bg-glass-active)' : 'transparent', color: tab === t.id ? 'var(--text-cream)' : 'var(--text-muted)' }}>{t.label}</button>
        ))}
      </div>

      {tab === 'general' && (
        <div className="space-y-4 rounded-2xl p-6" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Bot Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                {['moderation', 'fun', 'utility', 'music', 'economy', 'leveling', 'welcoming', 'productivity'].map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Prefix</label>
              <input value={form.prefix} onChange={e => setForm(p => ({ ...p, prefix: e.target.value }))} className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Tags (comma separated)</label>
            <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="moderation, fun, games" className="w-full px-3 py-2 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div><span className="text-sm" style={{ color: 'var(--text-primary)' }}>Public (list on marketplace)</span></div>
            <button onClick={() => setForm(p => ({ ...p, is_public: !p.is_public }))} className="w-10 h-5 rounded-full transition-colors relative" style={{ background: form.is_public ? 'var(--accent-green)' : 'var(--bg-overlay)' }}>
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: form.is_public ? 22 : 2 }} />
            </button>
          </div>

          {/* Token */}
          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-glass-strong)', border: '1px solid var(--border)' }}>
            <label className="text-[10px] font-semibold uppercase tracking-[0.08em] block mb-2" style={{ color: 'var(--accent-red)', fontFamily: 'monospace' }}>Bot Token (keep secret!)</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[11px] font-mono p-2 rounded-lg overflow-x-auto" style={{ background: 'var(--bg-deep)', color: 'var(--text-muted)' }}>
                {showToken ? bot.token : '••••••••••••••••••••••'}
              </code>
              <button onClick={() => setShowToken(!showToken)} className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.05)]">
                {showToken ? <EyeOff className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /> : <Eye className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
              </button>
              <button onClick={() => copyToClipboard(bot.token)} className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.05)]">
                <Copy className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              </button>
              <button onClick={regenerateToken} className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.05)]">
                <RefreshCw className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={saveGeneral} disabled={saving} className="px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-30" style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={onDelete} className="px-5 py-2 rounded-xl text-sm font-medium" style={{ color: 'var(--accent-red)', border: '1px solid rgba(201,123,123,0.2)' }}>Delete Bot</button>
          </div>
        </div>
      )}

      {tab === 'commands' && <BotCommandBuilder bot={bot} onSave={onSave} />}
      {tab === 'autoresponders' && <BotAutoResponders bot={bot} onSave={onSave} />}
      {tab === 'welcome' && <BotWelcomeLeave bot={bot} onSave={onSave} />}
      {tab === 'scheduled' && <BotScheduled bot={bot} onSave={onSave} />}
      {tab === 'analytics' && <BotAnalytics bot={bot} />}
    </div>
  );
}