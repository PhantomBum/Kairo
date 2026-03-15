import React, { useState, useEffect } from 'react';
import { Plus, Bot, Search, Star, Users, Trash2, ChevronRight, Shield, Check, X, ToggleLeft, ToggleRight, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', success: '#34d399', danger: '#f87171', warning: '#fbbf24',
};

const PERMISSIONS = [
  { key: 'read_messages', label: 'Read Messages', desc: 'View messages in channels' },
  { key: 'send_messages', label: 'Send Messages', desc: 'Send messages and respond to commands' },
  { key: 'manage_messages', label: 'Manage Messages', desc: 'Delete or pin messages from other users' },
  { key: 'manage_members', label: 'Manage Members', desc: 'Kick, ban, or timeout members' },
  { key: 'manage_channels', label: 'Manage Channels', desc: 'Create or edit channels' },
  { key: 'manage_roles', label: 'Manage Roles', desc: 'Assign and modify roles' },
];

const NATIVE_BOTS = [
  { id: 'kairo-mod', name: 'Kairo Mod', desc: 'Complete moderation — warn, kick, ban, timeout, purge, slowmode, lock/unlock channels', icon: '🛡️', category: 'Moderation', users: 12400, rating: 4.8,
    permissions: ['read_messages', 'send_messages', 'manage_messages', 'manage_members'],
    commands: ['/warn', '/warnings', '/clearwarnings', '/kick', '/ban', '/unban', '/timeout', '/untimeout', '/modlog', '/slowmode', '/lock', '/unlock', '/purge', '/nick'] },
  { id: 'kairo-fun', name: 'Kairo Fun', desc: 'Entertainment — roll, flip, 8ball, choose, rps, trivia, roast, compliment, would-you-rather, rate', icon: '🎮', category: 'Fun', users: 18200, rating: 4.9,
    permissions: ['read_messages', 'send_messages'],
    commands: ['/roll', '/flip', '/8ball', '/choose', '/rps', '/trivia', '/roast', '/compliment', '/would-you-rather', '/rate'] },
  { id: 'kairo-util', name: 'Kairo Utility', desc: 'Utilities — poll, remind, serverinfo, userinfo, avatar, banner, timestamp, calc, weather, define', icon: '⚡', category: 'Utility', users: 15600, rating: 4.7,
    permissions: ['read_messages', 'send_messages'],
    commands: ['/poll', '/remind', '/serverinfo', '/userinfo', '/avatar', '/banner', '/timestamp', '/calc', '/weather', '/define'] },
];

export default function BotsTab({ serverId }) {
  const [installations, setInstallations] = useState([]);
  const [view, setView] = useState('installed');
  const [searchQ, setSearchQ] = useState('');
  const [selectedBot, setSelectedBot] = useState(null);
  const [installing, setInstalling] = useState(null);
  const [showPerms, setShowPerms] = useState(null);
  const [allowedPerms, setAllowedPerms] = useState({});

  useEffect(() => {
    if (serverId) base44.entities.BotInstallation.filter({ server_id: serverId }).then(setInstallations).catch(() => {});
  }, [serverId]);

  const installedIds = new Set(installations.map(i => i.bot_id));

  const startInstall = (bot) => {
    const perms = {};
    (bot.permissions || ['read_messages', 'send_messages']).forEach(p => { perms[p] = true; });
    setAllowedPerms(perms);
    setShowPerms(bot);
  };

  const confirmInstall = async () => {
    const bot = showPerms;
    if (!bot) return;
    setInstalling(bot.id);
    setShowPerms(null);
    await base44.entities.BotInstallation.create({
      server_id: serverId, bot_id: bot.id, bot_name: bot.name, bot_icon: bot.icon,
      permissions: Object.keys(allowedPerms).filter(k => allowedPerms[k]),
      installed_at: new Date().toISOString(),
      enabled_commands: bot.commands || [],
    });
    const updated = await base44.entities.BotInstallation.filter({ server_id: serverId });
    setInstallations(updated);
    setInstalling(null);
  };

  const removeBot = async (inst) => {
    if (!confirm(`Remove ${inst.bot_name}? You can always add it back later.`)) return;
    await base44.entities.BotInstallation.delete(inst.id);
    setInstallations(p => p.filter(i => i.id !== inst.id));
    setSelectedBot(null);
  };

  const toggleCommand = async (inst, cmd) => {
    const cmds = inst.enabled_commands || [];
    const updated = cmds.includes(cmd) ? cmds.filter(c => c !== cmd) : [...cmds, cmd];
    await base44.entities.BotInstallation.update(inst.id, { enabled_commands: updated });
    setInstallations(p => p.map(i => i.id === inst.id ? { ...i, enabled_commands: updated } : i));
    setSelectedBot(prev => prev ? { ...prev, enabled_commands: updated } : prev);
  };

  const marketBots = NATIVE_BOTS.filter(b => !searchQ || b.name.toLowerCase().includes(searchQ.toLowerCase()) || b.desc.toLowerCase().includes(searchQ.toLowerCase()));

  // Permissions review screen
  if (showPerms) {
    return (
      <div className="space-y-4">
        <button onClick={() => setShowPerms(null)} className="text-[12px] flex items-center gap-1" style={{ color: P.muted }}>← Back</button>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: P.elevated }}>{showPerms.icon}</div>
          <div>
            <h3 className="text-[16px] font-bold" style={{ color: P.textPrimary }}>Review Permissions</h3>
            <p className="text-[12px]" style={{ color: P.muted }}>{showPerms.name} wants access to:</p>
          </div>
        </div>
        <div className="space-y-2">
          {PERMISSIONS.map(p => {
            const requested = (showPerms.permissions || []).includes(p.key);
            const allowed = !!allowedPerms[p.key];
            return (
              <div key={p.key} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: P.elevated, border: `1px solid ${P.border}`, opacity: requested ? 1 : 0.4 }}>
                <Shield className="w-4 h-4 flex-shrink-0" style={{ color: allowed ? P.success : P.muted }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium" style={{ color: P.textPrimary }}>{p.label}</p>
                  <p className="text-[11px]" style={{ color: P.muted }}>{p.desc}</p>
                </div>
                {requested && (
                  <button onClick={() => setAllowedPerms(prev => ({ ...prev, [p.key]: !prev[p.key] }))}>
                    {allowed ? <ToggleRight className="w-6 h-6" style={{ color: P.success }} /> : <ToggleLeft className="w-6 h-6" style={{ color: P.muted }} />}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <button onClick={confirmInstall} className="w-full py-2.5 rounded-xl text-[14px] font-semibold transition-all hover:brightness-110"
          style={{ background: P.accent, color: '#0d1117' }}>
          Add {showPerms.name}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: P.elevated }}>
        {[{ id: 'installed', label: 'Installed Bots' }, { id: 'marketplace', label: 'Bot Marketplace' }].map(t => (
          <button key={t.id} onClick={() => { setView(t.id); setSelectedBot(null); }}
            className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-all"
            style={{ background: view === t.id ? `${P.accent}18` : 'transparent', color: view === t.id ? P.textPrimary : P.muted }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Installed list */}
      {view === 'installed' && !selectedBot && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px]" style={{ color: P.muted }}>{installations.length} bot{installations.length !== 1 ? 's' : ''} installed</span>
            <button onClick={() => setView('marketplace')} className="text-[12px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all hover:brightness-110"
              style={{ background: P.accent, color: '#0d1117' }}>
              <Plus className="w-3.5 h-3.5" /> Add Bot
            </button>
          </div>
          {installations.length === 0 && (
            <div className="text-center py-12">
              <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: P.muted }} />
              <p className="text-[14px] font-medium mb-1" style={{ color: P.textSecondary }}>No bots installed</p>
              <p className="text-[12px] mb-4" style={{ color: P.muted }}>Add bots from the marketplace to enhance your server</p>
              <button onClick={() => setView('marketplace')} className="text-[13px] px-4 py-2 rounded-xl transition-all hover:brightness-110"
                style={{ background: P.accent, color: '#0d1117' }}>Browse Marketplace</button>
            </div>
          )}
          {installations.map(inst => (
            <button key={inst.id} onClick={() => setSelectedBot(inst)}
              className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all hover:bg-[rgba(255,255,255,0.02)]"
              style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: P.base }}>{inst.bot_icon || '🤖'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold" style={{ color: P.textPrimary }}>{inst.bot_name}</span>
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${P.accent}20`, color: P.accent }}>BOT</span>
                </div>
                <span className="text-[11px]" style={{ color: P.muted }}>
                  {inst.enabled_commands?.length || 0} commands · Installed {inst.installed_at ? new Date(inst.installed_at).toLocaleDateString() : ''}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: P.muted }} />
            </button>
          ))}
        </div>
      )}

      {/* Bot manage panel */}
      {view === 'installed' && selectedBot && (
        <div className="space-y-4">
          <button onClick={() => setSelectedBot(null)} className="text-[12px] flex items-center gap-1" style={{ color: P.muted }}>← Back</button>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl" style={{ background: P.base }}>{selectedBot.bot_icon || '🤖'}</div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[18px] font-bold" style={{ color: P.textPrimary }}>{selectedBot.bot_name}</h3>
                <span className="text-[11px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: `${P.accent}20`, color: P.accent }}>BOT</span>
              </div>
              <span className="text-[12px]" style={{ color: P.muted }}>Installed {selectedBot.installed_at ? new Date(selectedBot.installed_at).toLocaleDateString() : ''}</span>
            </div>
          </div>

          {/* Permissions */}
          <div className="p-3 rounded-xl space-y-2" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: P.muted }}>Permissions</p>
            {(selectedBot.permissions || ['read_messages', 'send_messages']).map(p => (
              <div key={p} className="flex items-center gap-2 text-[12px]" style={{ color: P.textSecondary }}>
                <Check className="w-3.5 h-3.5" style={{ color: P.success }} />
                {p.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
            ))}
          </div>

          {/* Commands with enable/disable */}
          <div className="p-3 rounded-xl space-y-2" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: P.muted }}>Commands</p>
            <div className="space-y-1">
              {(selectedBot.enabled_commands || []).map(cmd => (
                <div key={cmd} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.02)]">
                  <span className="text-[12px] font-mono flex-1" style={{ color: P.textSecondary }}>{cmd}</span>
                  <button onClick={() => toggleCommand(selectedBot, cmd)}>
                    <ToggleRight className="w-5 h-5" style={{ color: P.success }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent actions */}
          <div className="p-3 rounded-xl" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: P.muted }}>Recent Actions</p>
            <div className="text-center py-4">
              <Clock className="w-6 h-6 mx-auto mb-1" style={{ color: P.muted, opacity: 0.3 }} />
              <p className="text-[11px]" style={{ color: P.muted }}>No recent actions logged</p>
            </div>
          </div>

          <button onClick={() => removeBot(selectedBot)}
            className="flex items-center gap-2 text-[13px] px-4 py-2.5 rounded-xl transition-colors hover:bg-[rgba(237,66,69,0.1)]"
            style={{ color: P.danger, border: `1px solid ${P.danger}25` }}>
            <Trash2 className="w-4 h-4" /> Remove Bot
          </button>
        </div>
      )}

      {/* Marketplace */}
      {view === 'marketplace' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
            <Search className="w-4 h-4" style={{ color: P.muted }} />
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search bots..."
              className="flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#68677a]"
              style={{ color: P.textPrimary }} autoFocus />
          </div>
          <p className="text-[11px]" style={{ color: P.muted }}>Or paste a Bot ID to add any bot directly</p>
          {marketBots.map(bot => (
            <div key={bot.id} className="p-4 rounded-xl" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: P.base }}>{bot.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[15px] font-bold" style={{ color: P.textPrimary }}>{bot.name}</span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{ background: `${P.accent}15`, color: P.accent }}>{bot.category}</span>
                  </div>
                  <p className="text-[12px] mb-2 leading-relaxed" style={{ color: P.muted }}>{bot.desc}</p>
                  <div className="flex items-center gap-3 text-[11px]" style={{ color: P.muted }}>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{(bot.users / 1000).toFixed(1)}k servers</span>
                    <span className="flex items-center gap-1"><Star className="w-3 h-3" style={{ color: P.warning }} />{bot.rating}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {bot.commands.slice(0, 6).map(c => (
                      <span key={c} className="text-[11px] px-1.5 py-0.5 rounded font-mono" style={{ background: P.base, color: P.muted }}>{c}</span>
                    ))}
                    {bot.commands.length > 6 && <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ color: P.muted }}>+{bot.commands.length - 6}</span>}
                  </div>
                </div>
                <button onClick={() => !installedIds.has(bot.id) && startInstall(bot)}
                  disabled={installedIds.has(bot.id) || installing === bot.id}
                  className="px-4 py-2 rounded-xl text-[12px] font-semibold flex-shrink-0 disabled:opacity-50 transition-all hover:brightness-110"
                  style={{ background: installedIds.has(bot.id) ? P.base : P.accent, color: installedIds.has(bot.id) ? P.muted : '#0d1117' }}>
                  {installedIds.has(bot.id) ? '✓ Installed' : installing === bot.id ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
