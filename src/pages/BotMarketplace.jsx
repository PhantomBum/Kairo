import React, { useState, useEffect, useMemo } from 'react';
import { Search, Bot, Star, Shield, Users, Plus, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import PageShell from '@/components/app/shared/PageShell';

const CATEGORIES = ['all', 'moderation', 'fun', 'utility', 'music', 'economy', 'leveling', 'welcoming', 'productivity'];
const CAT_ICONS = { moderation: Shield, fun: Sparkles, utility: Bot, music: '🎵', economy: '💰', leveling: '📈', welcoming: '👋', productivity: '⚡' };

function BotCard({ bot, onAdd }) {
  return (
    <div className="rounded-2xl p-4 transition-all hover:border-[rgba(255,255,255,0.08)]" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
          style={{ background: 'var(--bg-glass-strong)', border: '1px solid var(--border)' }}>
          {bot.avatar_url ? <img src={bot.avatar_url} className="w-full h-full object-cover" /> : <Bot className="w-6 h-6" style={{ color: 'var(--text-muted)' }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--text-cream)' }}>{bot.name}</h3>
            {bot.is_verified && <Shield className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--accent-blue)' }} />}
          </div>
          <p className="text-[10px] line-clamp-2 mt-0.5" style={{ color: 'var(--text-muted)' }}>{bot.description || 'No description'}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px]" style={{ color: 'var(--text-faint)' }}>
          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{bot.server_count || 0} servers</span>
          {bot.avg_rating > 0 && <span className="flex items-center gap-1"><Star className="w-3 h-3" style={{ color: 'var(--accent-amber)' }} />{bot.avg_rating.toFixed(1)}</span>}
        </div>
        <button onClick={() => onAdd(bot)} className="px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors hover:brightness-110"
          style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>Add to Server</button>
      </div>
      {bot.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {bot.tags.slice(0, 3).map(t => (
            <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BotMarketplace() {
  const [bots, setBots] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [servers, setServers] = useState([]);
  const [addModal, setAddModal] = useState(null);

  useEffect(() => {
    const init = async () => {
      const allBots = await base44.entities.Bot.filter({ is_public: true });
      setBots(allBots);
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const me = await base44.auth.me();
        const myServers = await base44.entities.Server.filter({ owner_id: me.id });
        setServers(myServers);
      }
      setLoading(false);
    };
    init();
  }, []);

  const filtered = useMemo(() => {
    return bots.filter(b => {
      const matchSearch = !search.trim() || b.name?.toLowerCase().includes(search.toLowerCase()) || b.description?.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'all' || b.category === category;
      return matchSearch && matchCat;
    });
  }, [bots, search, category]);

  const featured = useMemo(() => bots.filter(b => b.is_verified).slice(0, 3), [bots]);
  const trending = useMemo(() => [...bots].sort((a, b) => (b.server_count || 0) - (a.server_count || 0)).slice(0, 6), [bots]);

  const handleAddBot = async (bot, serverId) => {
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) { base44.auth.redirectToLogin(window.location.href); return; }
    const me = await base44.auth.me();
    await base44.entities.BotInstallation.create({ bot_id: bot.id, server_id: serverId, installed_by: me.id, installed_at: new Date().toISOString() });
    await base44.entities.Bot.update(bot.id, { server_count: (bot.server_count || 0) + 1 });
    setAddModal(null);
    setBots(prev => prev.map(b => b.id === bot.id ? { ...b, server_count: (b.server_count || 0) + 1 } : b));
  };

  return (
    <PageShell title="Bot Marketplace">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Bot Marketplace</h1>
          <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Discover community-built bots to enhance your server</p>
          <a href={createPageUrl('Developers')} className="inline-flex items-center gap-1.5 text-[11px] font-medium px-4 py-2 rounded-xl transition-colors hover:brightness-110"
            style={{ background: 'var(--bg-glass)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
            <Plus className="w-3.5 h-3.5" /> Create Your Own Bot
          </a>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bots..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className="px-3 py-1.5 rounded-full text-[11px] font-medium capitalize transition-colors"
              style={{ background: category === c ? 'var(--text-cream)' : 'var(--bg-glass)', color: category === c ? 'var(--bg-deep)' : 'var(--text-secondary)', border: '1px solid var(--border)' }}>{c}</button>
          ))}
        </div>

        {/* Featured */}
        {featured.length > 0 && category === 'all' && !search && (
          <div className="mb-10">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-4 flex items-center gap-2" style={{ color: 'var(--accent-amber)', fontFamily: 'monospace' }}>
              <Sparkles className="w-3.5 h-3.5" /> Featured Bots
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {featured.map(b => <BotCard key={b.id} bot={b} onAdd={b => setAddModal(b)} />)}
            </div>
          </div>
        )}

        {/* Trending */}
        {trending.length > 0 && category === 'all' && !search && (
          <div className="mb-10">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-4 flex items-center gap-2" style={{ color: 'var(--accent-green)', fontFamily: 'monospace' }}>
              <TrendingUp className="w-3.5 h-3.5" /> Trending
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trending.map(b => <BotCard key={b.id} bot={b} onAdd={b => setAddModal(b)} />)}
            </div>
          </div>
        )}

        {/* All Results */}
        {(search || category !== 'all') && (
          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-4" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {filtered.length} bot{filtered.length !== 1 ? 's' : ''} found
            </h2>
            {filtered.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(b => <BotCard key={b.id} bot={b} onAdd={b => setAddModal(b)} />)}
              </div>
            ) : (
              <div className="text-center py-16">
                <Bot className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-faint)' }} />
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No bots found. Be the first to create one!</p>
              </div>
            )}
          </div>
        )}

        {/* Add to Server Modal */}
        {addModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }} onClick={() => setAddModal(null)}>
            <div className="rounded-2xl p-6 w-full max-w-sm" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }} onClick={e => e.stopPropagation()}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Add {addModal.name} to Server</h3>
              {servers.length > 0 ? (
                <div className="space-y-2">
                  {servers.map(s => (
                    <button key={s.id} onClick={() => handleAddBot(addModal, s.id)} className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-[rgba(255,255,255,0.05)]" style={{ border: '1px solid var(--border)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-glass-strong)' }}>
                        {s.icon_url ? <img src={s.icon_url} className="w-full h-full rounded-lg object-cover" /> : <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>{s.name?.[0]}</span>}
                      </div>
                      <span className="text-[12px] font-medium flex-1 text-left" style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                      <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-center py-4" style={{ color: 'var(--text-muted)' }}>You don't own any servers yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}