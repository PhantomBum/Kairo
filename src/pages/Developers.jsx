import React, { useState, useEffect, useCallback } from 'react';
import { Bot, Plus, Trash2, Shield, Code, ChevronRight, Star, Zap, Globe } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import PageShell from '@/components/app/shared/PageShell';
import BotEditor from '@/components/app/developers/BotEditor.jsx';

const categoryGradients = {
  moderation: 'linear-gradient(135deg, rgba(201,123,123,0.15), transparent)',
  fun: 'linear-gradient(135deg, rgba(201,180,123,0.15), transparent)',
  utility: 'linear-gradient(135deg, rgba(123,164,201,0.15), transparent)',
  music: 'linear-gradient(135deg, rgba(164,123,201,0.15), transparent)',
  economy: 'linear-gradient(135deg, rgba(123,201,164,0.15), transparent)',
  leveling: 'linear-gradient(135deg, rgba(201,164,123,0.15), transparent)',
  welcoming: 'linear-gradient(135deg, rgba(123,201,201,0.15), transparent)',
  productivity: 'linear-gradient(135deg, rgba(124,92,191,0.15), transparent)',
};

export default function Developers() {
  const [user, setUser] = useState(null);
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBot, setEditingBot] = useState(null);
  const [creating, setCreating] = useState(false);

  const fetchBots = useCallback(async (me) => {
    const myBots = await base44.entities.Bot.filter({ owner_id: me.id });
    setBots(myBots);
  }, []);

  useEffect(() => {
    const init = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) { base44.auth.redirectToLogin(window.location.href); return; }
      const me = await base44.auth.me();
      setUser(me);
      await fetchBots(me);
      setLoading(false);
    };
    init();
  }, []);

  const createBot = async () => {
    setCreating(true);
    const token = 'KBot.' + Math.random().toString(36).substring(2, 10) + '.' + Math.random().toString(36).substring(2, 18);
    const clientId = 'kairo_' + Math.random().toString(36).substring(2, 14);
    const bot = await base44.entities.Bot.create({
      name: 'New Bot', owner_id: user.id, owner_email: user.email, owner_name: user.full_name,
      token, client_id: clientId, status: 'offline', category: 'utility',
    });
    await fetchBots(user);
    setEditingBot(bot);
    setCreating(false);
  };

  const deleteBot = async (bot) => {
    if (!confirm(`Delete "${bot.name}"? This can't be undone.`)) return;
    await base44.entities.Bot.delete(bot.id);
    await fetchBots(user);
    if (editingBot?.id === bot.id) setEditingBot(null);
  };

  const saveBot = async (id, data) => {
    await base44.entities.Bot.update(id, data);
    await fetchBots(user);
    const updated = await base44.entities.Bot.filter({ id });
    if (updated[0]) setEditingBot(updated[0]);
  };

  if (loading) {
    return (
      <PageShell title="Developer Portal">
        <div className="flex items-center justify-center py-20">
          <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text-cream)' }} />
        </div>
      </PageShell>
    );
  }

  if (editingBot) {
    return (
      <PageShell title="Developer Portal">
        <BotEditor bot={editingBot} onSave={saveBot} onBack={() => setEditingBot(null)} onDelete={() => deleteBot(editingBot)} />
      </PageShell>
    );
  }

  return (
    <PageShell title="Developer Portal">
      <div className="max-w-4xl mx-auto">
        {/* Hero header with gradient */}
        <div className="rounded-2xl overflow-hidden mb-8 p-8 relative" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(124,92,191,0.08), rgba(123,164,201,0.05), transparent)' }} />
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-cream)' }}>Developer Portal</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Create and manage your Kairo bots with advanced automation</p>
            </div>
            <button onClick={createBot} disabled={creating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, var(--k-accent), var(--k-accent-hover))', color: '#fff' }}>
              <Plus className="w-4 h-4" /> {creating ? 'Creating...' : 'New Bot'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Your Bots', value: bots.length, icon: Bot, gradient: 'linear-gradient(135deg, rgba(124,92,191,0.1), transparent)' },
            { label: 'Total Servers', value: bots.reduce((a, b) => a + (b.server_count || 0), 0), icon: Globe, gradient: 'linear-gradient(135deg, rgba(123,164,201,0.1), transparent)' },
            { label: 'Commands', value: bots.reduce((a, b) => a + (b.commands?.length || 0), 0), icon: Code, gradient: 'linear-gradient(135deg, rgba(123,201,164,0.1), transparent)' },
            { label: 'Flow Actions', value: bots.reduce((a, b) => a + (b.flow_actions?.length || 0), 0), icon: Zap, gradient: 'linear-gradient(135deg, rgba(201,180,123,0.1), transparent)' },
          ].map((s, i) => (
            <div key={i} className="p-4 rounded-2xl relative overflow-hidden" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
              <div className="absolute inset-0" style={{ background: s.gradient }} />
              <div className="relative">
                <s.icon className="w-4 h-4 mb-2" style={{ color: 'var(--text-muted)' }} />
                <p className="text-2xl font-bold" style={{ color: 'var(--text-cream)' }}>{s.value}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bot List */}
        {bots.length === 0 ? (
          <div className="text-center py-16 rounded-2xl relative overflow-hidden" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(124,92,191,0.04), transparent)' }} />
            <div className="relative">
              <Bot className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: 'var(--text-muted)' }} />
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-cream)' }}>No bots yet</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Create your first bot to get started with automation</p>
              <button onClick={createBot} className="px-5 py-2.5 rounded-xl text-sm font-medium inline-flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, var(--k-accent), var(--k-accent-hover))', color: '#fff' }}>
                <Plus className="w-4 h-4" /> Create Bot
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {bots.map(bot => (
              <div key={bot.id} className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer group relative overflow-hidden transition-all"
                style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}
                onClick={() => setEditingBot(bot)}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: categoryGradients[bot.category] || categoryGradients.utility }} />
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden relative"
                  style={{ background: 'var(--bg-glass-strong)', border: '1px solid var(--border)' }}>
                  {bot.avatar_url ? <img src={bot.avatar_url} className="w-full h-full object-cover" alt={bot.name} /> : <Bot className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />}
                </div>
                <div className="flex-1 min-w-0 relative">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-cream)' }}>{bot.name}</h3>
                    {bot.is_verified && <Shield className="w-3.5 h-3.5" style={{ color: 'var(--accent-blue)' }} />}
                    <span className="w-2 h-2 rounded-full" style={{ background: bot.status === 'online' ? 'var(--accent-green)' : 'var(--text-faint)' }} />
                  </div>
                  <p className="text-[11px] flex items-center gap-2 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    <span>{bot.commands?.length || 0} commands</span>
                    <span>·</span>
                    <span>{bot.flow_actions?.length || 0} flows</span>
                    <span>·</span>
                    <span className="capitalize">{bot.category || 'utility'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 relative">
                  <button onClick={e => { e.stopPropagation(); deleteBot(bot); }} className="p-2 rounded-lg transition-colors hover:bg-[rgba(201,123,123,0.1)]">
                    <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} />
                  </button>
                  <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}