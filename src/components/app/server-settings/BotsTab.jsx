import React, { useState, useEffect } from 'react';
import { Plus, Bot, Search, Star, Users, Trash2, ChevronRight, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';

const NATIVE_BOTS = [
  { id: 'kairo-mod', name: 'Kairo Mod', desc: 'Moderation tools — warn, kick, ban, timeout, modlog, slowmode, lock', icon: '🛡️', category: 'Moderation', users: 12400, rating: 4.8,
    commands: ['/warn', '/kick', '/ban', '/timeout', '/unban', '/modlog', '/slowmode', '/lock', '/unlock'] },
  { id: 'kairo-fun', name: 'Kairo Fun', desc: 'Entertainment — roll, flip, 8ball, meme, trivia, roast, compliment', icon: '🎮', category: 'Fun', users: 18200, rating: 4.9,
    commands: ['/roll', '/flip', '/8ball', '/meme', '/trivia', '/roast', '/compliment', '/would-you-rather'] },
  { id: 'kairo-util', name: 'Kairo Utility', desc: 'Utilities — poll, remind, serverinfo, userinfo, avatar, translate', icon: '⚡', category: 'Utility', users: 15600, rating: 4.7,
    commands: ['/poll', '/remind', '/serverinfo', '/userinfo', '/avatar', '/translate', '/weather', '/timestamp'] },
];

export default function BotsTab({ serverId }) {
  const [installations, setInstallations] = useState([]);
  const [view, setView] = useState('installed'); // installed | marketplace | manage
  const [searchQ, setSearchQ] = useState('');
  const [selectedBot, setSelectedBot] = useState(null);
  const [installing, setInstalling] = useState(null);

  useEffect(() => {
    if (serverId) base44.entities.BotInstallation.filter({ server_id: serverId }).then(setInstallations);
  }, [serverId]);

  const installedIds = new Set(installations.map(i => i.bot_id));

  const installBot = async (bot) => {
    setInstalling(bot.id);
    await base44.entities.BotInstallation.create({
      server_id: serverId, bot_id: bot.id, bot_name: bot.name, bot_icon: bot.icon,
      permissions: ['read_messages', 'send_messages'], installed_at: new Date().toISOString(),
      enabled_commands: bot.commands || [],
    });
    const updated = await base44.entities.BotInstallation.filter({ server_id: serverId });
    setInstallations(updated);
    setInstalling(null);
  };

  const removeBot = async (inst) => {
    if (!confirm(`Remove ${inst.bot_name}?`)) return;
    await base44.entities.BotInstallation.delete(inst.id);
    setInstallations(p => p.filter(i => i.id !== inst.id));
    setSelectedBot(null);
  };

  const marketBots = NATIVE_BOTS.filter(b => {
    if (searchQ && !b.name.toLowerCase().includes(searchQ.toLowerCase()) && !b.desc.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: colors.bg.elevated }}>
        {[{ id: 'installed', label: 'Installed Bots' }, { id: 'marketplace', label: 'Bot Marketplace' }].map(t => (
          <button key={t.id} onClick={() => { setView(t.id); setSelectedBot(null); }}
            className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-colors"
            style={{ background: view === t.id ? colors.accent.muted : 'transparent', color: view === t.id ? colors.text.primary : colors.text.muted }}>
            {t.label}
          </button>
        ))}
      </div>

      {view === 'installed' && !selectedBot && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px]" style={{ color: colors.text.muted }}>{installations.length} bot{installations.length !== 1 ? 's' : ''} installed</span>
            <button onClick={() => setView('marketplace')} className="text-[12px] px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              style={{ background: colors.accent.primary, color: '#fff' }}>
              <Plus className="w-3.5 h-3.5" /> Add Bot
            </button>
          </div>
          {installations.length === 0 && (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: colors.text.muted }} />
              <p className="text-[14px] font-medium mb-1" style={{ color: colors.text.secondary }}>No bots installed</p>
              <p className="text-[12px] mb-4" style={{ color: colors.text.muted }}>Add bots from the marketplace to enhance your server</p>
              <button onClick={() => setView('marketplace')} className="text-[13px] px-4 py-2 rounded-xl"
                style={{ background: colors.accent.primary, color: '#fff' }}>Browse Marketplace</button>
            </div>
          )}
          {installations.map(inst => (
            <button key={inst.id} onClick={() => setSelectedBot(inst)}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-[rgba(255,255,255,0.02)]"
              style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: colors.bg.overlay }}>{inst.bot_icon || '🤖'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold" style={{ color: colors.text.primary }}>{inst.bot_name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${colors.accent.primary}20`, color: colors.accent.primary }}>BOT</span>
                </div>
                <span className="text-[11px]" style={{ color: colors.text.muted }}>
                  {inst.enabled_commands?.length || 0} commands · Installed {inst.installed_at ? new Date(inst.installed_at).toLocaleDateString() : ''}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: colors.text.disabled }} />
            </button>
          ))}
        </div>
      )}

      {view === 'installed' && selectedBot && (
        <div className="space-y-4">
          <button onClick={() => setSelectedBot(null)} className="text-[12px] flex items-center gap-1" style={{ color: colors.text.muted }}>← Back</button>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: colors.bg.overlay }}>{selectedBot.bot_icon || '🤖'}</div>
            <div>
              <h3 className="text-[18px] font-bold" style={{ color: colors.text.primary }}>{selectedBot.bot_name}</h3>
              <span className="text-[12px]" style={{ color: colors.text.muted }}>Installed {selectedBot.installed_at ? new Date(selectedBot.installed_at).toLocaleDateString() : ''}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl space-y-2" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: colors.text.disabled }}>Permissions</p>
            {(selectedBot.permissions || ['read_messages', 'send_messages']).map(p => (
              <div key={p} className="flex items-center gap-2 text-[12px]" style={{ color: colors.text.secondary }}>
                <Shield className="w-3.5 h-3.5" style={{ color: colors.success }} />
                {p.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl space-y-2" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: colors.text.disabled }}>Commands</p>
            <div className="flex flex-wrap gap-1.5">
              {(selectedBot.enabled_commands || []).map(cmd => (
                <span key={cmd} className="text-[11px] px-2 py-1 rounded-lg font-mono" style={{ background: colors.bg.overlay, color: colors.text.secondary }}>{cmd}</span>
              ))}
            </div>
          </div>

          <button onClick={() => removeBot(selectedBot)}
            className="flex items-center gap-2 text-[13px] px-4 py-2.5 rounded-xl transition-colors hover:bg-[rgba(239,68,68,0.1)]"
            style={{ color: colors.danger, border: `1px solid rgba(239,68,68,0.2)` }}>
            <Trash2 className="w-4 h-4" /> Remove Bot
          </button>
        </div>
      )}

      {view === 'marketplace' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
            <Search className="w-4 h-4" style={{ color: colors.text.disabled }} />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search bots..."
              className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: colors.text.primary }} autoFocus />
          </div>
          {marketBots.map(bot => (
            <div key={bot.id} className="p-4 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: colors.bg.overlay }}>{bot.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[15px] font-bold" style={{ color: colors.text.primary }}>{bot.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${colors.accent.primary}15`, color: colors.accent.primary }}>{bot.category}</span>
                  </div>
                  <p className="text-[12px] mb-2" style={{ color: colors.text.muted }}>{bot.desc}</p>
                  <div className="flex items-center gap-3 text-[11px]" style={{ color: colors.text.disabled }}>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{(bot.users / 1000).toFixed(1)}k servers</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" style={{ color: colors.warning }} />{bot.rating}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {bot.commands.slice(0, 5).map(c => (
                      <span key={c} className="text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ background: colors.bg.overlay, color: colors.text.muted }}>{c}</span>
                    ))}
                    {bot.commands.length > 5 && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: colors.text.disabled }}>+{bot.commands.length - 5}</span>}
                  </div>
                </div>
                <button onClick={() => !installedIds.has(bot.id) && installBot(bot)} disabled={installedIds.has(bot.id) || installing === bot.id}
                  className="px-4 py-2 rounded-xl text-[12px] font-semibold flex-shrink-0 disabled:opacity-50"
                  style={{ background: installedIds.has(bot.id) ? colors.bg.overlay : colors.accent.primary, color: installedIds.has(bot.id) ? colors.text.muted : '#fff' }}>
                  {installedIds.has(bot.id) ? 'Installed' : installing === bot.id ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}