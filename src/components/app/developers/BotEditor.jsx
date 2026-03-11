import React, { useState } from 'react';
import { ArrowLeft, Copy, RefreshCw, Trash2, Upload, Bot, Eye, EyeOff, Settings, Code, MessageSquare, Zap, Shield, Image, BarChart3, UserCheck, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import BotCommandBuilder from './BotCommandBuilder';
import BotAutoResponders from './BotAutoResponders';
import BotWelcomeLeave from './BotWelcomeLeave';
import BotScheduled from './BotScheduled';
import BotAnalytics from './BotAnalytics';
import BotFlowActions from './BotFlowActions';
import BotEmbedBuilder from './BotEmbedBuilder';
import BotPermissions from './BotPermissions';

const TABS = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'commands', label: 'Commands', icon: Code },
  { id: 'autoresponders', label: 'Auto Respond', icon: MessageSquare },
  { id: 'flows', label: 'Flow Actions', icon: Zap },
  { id: 'embeds', label: 'Embeds', icon: Image },
  { id: 'welcome', label: 'Welcome', icon: UserCheck },
  { id: 'scheduled', label: 'Scheduled', icon: Clock },
  { id: 'permissions', label: 'Permissions', icon: Shield },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
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
    <div className="max-w-5xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 mb-6 text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
        <ArrowLeft className="w-4 h-4" /> Back to bots
      </button>

      {/* Bot header with gradient */}
      <div className="rounded-2xl overflow-hidden mb-6" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
        <div className="h-20 relative" style={{ background: `linear-gradient(135deg, ${bot.category === 'moderation' ? '#c97b7b' : bot.category === 'fun' ? '#c9b47b' : bot.category === 'music' ? '#a47bc9' : '#7ba4c9'}30, transparent)` }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent, var(--bg-glass))' }} />
        </div>
        <div className="px-6 pb-5 -mt-10 relative flex items-end gap-4">
          <button onClick={handleAvatar} className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center overflow-hidden group relative flex-shrink-0"
            style={{ background: 'var(--bg-elevated)', border: '3px solid var(--bg-surface)', boxShadow: 'var(--shadow-md)' }}>
            {bot.avatar_url ? <img src={bot.avatar_url} className="w-full h-full object-cover" alt={bot.name} /> : <Bot className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl"><Upload className="w-4 h-4 text-white" /></div>
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate" style={{ color: 'var(--text-cream)' }}>{bot.name}</h2>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[11px] font-mono" style={{ color: 'var(--text-faint)' }}>{bot.client_id}</span>
              <span className="w-2 h-2 rounded-full" style={{ background: bot.status === 'online' ? 'var(--accent-green)' : 'var(--text-faint)' }} />
              <span className="text-[11px] capitalize px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>{bot.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs with icons */}
      <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-none">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-3 py-2 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1.5"
              style={{
                background: tab === t.id ? 'rgba(124,92,191,0.15)' : 'transparent',
                color: tab === t.id ? 'var(--k-accent-hover)' : 'var(--text-muted)',
                border: tab === t.id ? '1px solid rgba(124,92,191,0.2)' : '1px solid transparent',
              }}>
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'general' && (
        <div className="space-y-4 rounded-2xl p-6" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.06em] block mb-1.5" style={{ color: 'var(--text-muted)' }}>Bot Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.06em] block mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.06em] block mb-1.5" style={{ color: 'var(--text-muted)' }}>Category</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                {['moderation', 'fun', 'utility', 'music', 'economy', 'leveling', 'welcoming', 'productivity'].map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-[0.06em] block mb-1.5" style={{ color: 'var(--text-muted)' }}>Prefix</label>
              <input value={form.prefix} onChange={e => setForm(p => ({ ...p, prefix: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-[0.06em] block mb-1.5" style={{ color: 'var(--text-muted)' }}>Tags (comma separated)</label>
            <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="moderation, fun, games" className="w-full px-3 py-2.5 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div><span className="text-sm" style={{ color: 'var(--text-primary)' }}>Public (list on marketplace)</span></div>
            <button onClick={() => setForm(p => ({ ...p, is_public: !p.is_public }))} className="w-10 h-5 rounded-full transition-colors relative" style={{ background: form.is_public ? 'var(--accent-green)' : 'var(--bg-overlay)' }}>
              <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform" style={{ left: form.is_public ? 22 : 2 }} />
            </button>
          </div>

          {/* Token */}
          <div className="p-4 rounded-xl" style={{ background: 'rgba(201,123,123,0.04)', border: '1px solid rgba(201,123,123,0.15)' }}>
            <label className="text-[10px] font-semibold uppercase tracking-[0.06em] block mb-2" style={{ color: 'var(--accent-red)' }}>Bot Token (keep secret!)</label>
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

          <div className="flex gap-3 pt-2">
            <button onClick={saveGeneral} disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-30 transition-all"
              style={{ background: 'linear-gradient(135deg, var(--k-accent), var(--k-accent-hover))', color: '#fff' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={onDelete} className="px-5 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-[rgba(201,123,123,0.08)]" style={{ color: 'var(--accent-red)', border: '1px solid rgba(201,123,123,0.2)' }}>Delete Bot</button>
          </div>
        </div>
      )}

      {tab === 'commands' && <BotCommandBuilder bot={bot} onSave={onSave} />}
      {tab === 'autoresponders' && <BotAutoResponders bot={bot} onSave={onSave} />}
      {tab === 'flows' && <BotFlowActions bot={bot} onSave={onSave} />}
      {tab === 'embeds' && <BotEmbedBuilder bot={bot} onSave={onSave} />}
      {tab === 'welcome' && <BotWelcomeLeave bot={bot} onSave={onSave} />}
      {tab === 'scheduled' && <BotScheduled bot={bot} onSave={onSave} />}
      {tab === 'permissions' && <BotPermissions bot={bot} onSave={onSave} />}
      {tab === 'analytics' && <BotAnalytics bot={bot} />}
    </div>
  );
}