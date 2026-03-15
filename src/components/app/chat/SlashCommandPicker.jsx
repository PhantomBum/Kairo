import React, { useState, useEffect, useMemo, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', success: '#34d399', danger: '#f87171',
};

const NATIVE_COMMANDS = [
  { bot: 'Kairo Mod', icon: '🛡️', commands: [
    { name: 'warn', desc: 'Warn a user', params: [{ name: 'user', type: 'mention', required: true }, { name: 'reason', type: 'text' }] },
    { name: 'warnings', desc: 'Show warning history', params: [{ name: 'user', type: 'mention', required: true }] },
    { name: 'clearwarnings', desc: 'Clear all warnings', params: [{ name: 'user', type: 'mention', required: true }] },
    { name: 'kick', desc: 'Kick a user from the server', params: [{ name: 'user', type: 'mention', required: true }, { name: 'reason', type: 'text' }] },
    { name: 'ban', desc: 'Ban a user', params: [{ name: 'user', type: 'mention', required: true }, { name: 'reason', type: 'text' }, { name: 'duration', type: 'text' }] },
    { name: 'unban', desc: 'Remove a ban', params: [{ name: 'userid', type: 'text', required: true }] },
    { name: 'timeout', desc: 'Timeout a user', params: [{ name: 'user', type: 'mention', required: true }, { name: 'duration', type: 'text', required: true }, { name: 'reason', type: 'text' }] },
    { name: 'untimeout', desc: 'Remove timeout', params: [{ name: 'user', type: 'mention', required: true }] },
    { name: 'modlog', desc: 'View moderation history', params: [{ name: 'user', type: 'mention' }] },
    { name: 'slowmode', desc: 'Set slowmode', params: [{ name: 'seconds', type: 'number', required: true }] },
    { name: 'lock', desc: 'Lock the current channel' },
    { name: 'unlock', desc: 'Unlock the current channel' },
    { name: 'purge', desc: 'Delete recent messages', params: [{ name: 'amount', type: 'number', required: true }] },
    { name: 'nick', desc: 'Change server nickname', params: [{ name: 'user', type: 'mention', required: true }, { name: 'newnick', type: 'text', required: true }] },
  ]},
  { bot: 'Kairo Fun', icon: '🎮', commands: [
    { name: 'roll', desc: 'Roll a dice', params: [{ name: 'sides', type: 'number' }] },
    { name: 'flip', desc: 'Flip a coin' },
    { name: '8ball', desc: 'Ask the magic 8-ball', params: [{ name: 'question', type: 'text', required: true }] },
    { name: 'choose', desc: 'Pick randomly from options', params: [{ name: 'option1', type: 'text', required: true }, { name: 'option2', type: 'text', required: true }, { name: 'option3', type: 'text' }] },
    { name: 'rps', desc: 'Rock paper scissors' },
    { name: 'trivia', desc: 'Random trivia question' },
    { name: 'roast', desc: 'Playful roast', params: [{ name: 'user', type: 'mention' }] },
    { name: 'compliment', desc: 'Genuine compliment', params: [{ name: 'user', type: 'mention' }] },
    { name: 'would-you-rather', desc: 'Two vote buttons' },
    { name: 'rate', desc: 'Rate something out of 10', params: [{ name: 'thing', type: 'text', required: true }] },
  ]},
  { bot: 'Kairo Utility', icon: '⚡', commands: [
    { name: 'poll', desc: 'Create a poll', params: [{ name: 'question', type: 'text', required: true }, { name: 'option1', type: 'text', required: true }, { name: 'option2', type: 'text', required: true }] },
    { name: 'remind', desc: 'Set a reminder', params: [{ name: 'time', type: 'text', required: true }, { name: 'message', type: 'text', required: true }] },
    { name: 'serverinfo', desc: 'Show server stats' },
    { name: 'userinfo', desc: 'Show user info', params: [{ name: 'user', type: 'mention' }] },
    { name: 'avatar', desc: 'Full size avatar', params: [{ name: 'user', type: 'mention' }] },
    { name: 'banner', desc: 'Full size banner', params: [{ name: 'user', type: 'mention' }] },
    { name: 'timestamp', desc: 'Convert to Unix timestamp', params: [{ name: 'time', type: 'text', required: true }] },
    { name: 'calc', desc: 'Basic calculator', params: [{ name: 'expression', type: 'text', required: true }] },
    { name: 'weather', desc: 'Current weather', params: [{ name: 'city', type: 'text', required: true }] },
    { name: 'define', desc: 'Dictionary definition', params: [{ name: 'word', type: 'text', required: true }] },
  ]},
];

export default function SlashCommandPicker({ filter, onSelect, serverId }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [installations, setInstallations] = useState([]);
  const listRef = useRef(null);

  useEffect(() => {
    if (serverId) base44.entities.BotInstallation.filter({ server_id: serverId }).then(setInstallations).catch(() => {});
  }, [serverId]);

  const installedBotNames = new Set(installations.map(i => i.bot_name));

  const allCommands = useMemo(() => {
    const cmds = [];
    NATIVE_COMMANDS.forEach(botGroup => {
      if (installedBotNames.size > 0 && !installedBotNames.has(botGroup.bot)) return;
      botGroup.commands.forEach(cmd => {
        cmds.push({ ...cmd, bot: botGroup.bot, icon: botGroup.icon });
      });
    });
    return cmds;
  }, [installedBotNames]);

  const filtered = useMemo(() => {
    if (!filter) return allCommands.slice(0, 15);
    return allCommands.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()) || c.desc.toLowerCase().includes(filter.toLowerCase())).slice(0, 15);
  }, [filter, allCommands]);

  useEffect(() => { setSelectedIdx(0); }, [filter]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); }
      else if (e.key === 'Enter' && filtered[selectedIdx]) { e.preventDefault(); onSelect(filtered[selectedIdx]); }
      else if (e.key === 'Escape') { e.preventDefault(); onSelect(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filtered, selectedIdx, onSelect]);

  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.children[selectedIdx];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIdx]);

  if (filtered.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 mx-4 rounded-xl overflow-hidden k-fade-in z-30"
      style={{ background: P.floating, border: `1px solid ${P.border}`, boxShadow: '0 -8px 32px rgba(0,0,0,0.4)' }}>
      <div className="px-3.5 pt-2.5 pb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: P.muted }}>Bot Commands</span>
      </div>
      <div ref={listRef} className="overflow-y-auto scrollbar-none max-h-[280px] pb-1">
        {filtered.map((cmd, i) => (
          <button key={`${cmd.bot}-${cmd.name}`} onClick={() => onSelect(cmd)}
            onMouseEnter={() => setSelectedIdx(i)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-colors"
            style={{ background: i === selectedIdx ? `${P.accent}12` : 'transparent' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: P.elevated }}>{cmd.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[14px] font-mono font-medium" style={{ color: P.textPrimary }}>/{cmd.name}</span>
                {cmd.params?.filter(p => p.required).map(p => (
                  <span key={p.name} className="text-[11px] px-1.5 py-0.5 rounded font-medium"
                    style={{ background: `${P.accent}18`, color: P.accent }}>{p.name}</span>
                ))}
                {cmd.params?.filter(p => !p.required).map(p => (
                  <span key={p.name} className="text-[11px] px-1.5 py-0.5 rounded"
                    style={{ background: `${P.muted}15`, color: P.muted }}>{p.name}</span>
                ))}
              </div>
              <span className="text-[12px]" style={{ color: P.muted }}>{cmd.desc}</span>
            </div>
            <span className="text-[11px] flex-shrink-0" style={{ color: P.muted }}>{cmd.bot}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export { NATIVE_COMMANDS };
