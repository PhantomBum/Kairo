import React, { useState, useEffect, useMemo, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { colors, shadows } from '@/components/app/design/tokens';

const NATIVE_COMMANDS = [
  { bot: 'Kairo Mod', icon: '🛡️', commands: [
    { name: 'warn', desc: 'Warn a user', params: [{ name: 'user', type: 'mention', required: true }, { name: 'reason', type: 'text' }] },
    { name: 'kick', desc: 'Kick a user from the server', params: [{ name: 'user', type: 'mention', required: true }, { name: 'reason', type: 'text' }] },
    { name: 'ban', desc: 'Ban a user', params: [{ name: 'user', type: 'mention', required: true }, { name: 'reason', type: 'text' }] },
    { name: 'timeout', desc: 'Timeout a user', params: [{ name: 'user', type: 'mention', required: true }, { name: 'duration', type: 'text', required: true }] },
    { name: 'modlog', desc: 'View moderation log' },
    { name: 'slowmode', desc: 'Set slow mode', params: [{ name: 'seconds', type: 'number', required: true }] },
    { name: 'lock', desc: 'Lock the current channel' },
    { name: 'unlock', desc: 'Unlock the current channel' },
  ]},
  { bot: 'Kairo Fun', icon: '🎮', commands: [
    { name: 'roll', desc: 'Roll a dice', params: [{ name: 'sides', type: 'number' }] },
    { name: 'flip', desc: 'Flip a coin' },
    { name: '8ball', desc: 'Ask the magic 8-ball', params: [{ name: 'question', type: 'text', required: true }] },
    { name: 'meme', desc: 'Get a random meme' },
    { name: 'trivia', desc: 'Start a trivia question' },
    { name: 'roast', desc: 'Roast a user', params: [{ name: 'user', type: 'mention' }] },
    { name: 'compliment', desc: 'Compliment a user', params: [{ name: 'user', type: 'mention' }] },
    { name: 'would-you-rather', desc: 'Would you rather question' },
  ]},
  { bot: 'Kairo Utility', icon: '⚡', commands: [
    { name: 'poll', desc: 'Create a poll', params: [{ name: 'question', type: 'text', required: true }, { name: 'options', type: 'text', required: true }] },
    { name: 'remind', desc: 'Set a reminder', params: [{ name: 'time', type: 'text', required: true }, { name: 'message', type: 'text', required: true }] },
    { name: 'serverinfo', desc: 'Show server information' },
    { name: 'userinfo', desc: 'Show user information', params: [{ name: 'user', type: 'mention' }] },
    { name: 'avatar', desc: 'Get user avatar', params: [{ name: 'user', type: 'mention' }] },
    { name: 'translate', desc: 'Translate text', params: [{ name: 'language', type: 'text', required: true }, { name: 'text', type: 'text', required: true }] },
    { name: 'weather', desc: 'Get weather info', params: [{ name: 'location', type: 'text', required: true }] },
    { name: 'timestamp', desc: 'Generate a timestamp', params: [{ name: 'time', type: 'text', required: true }] },
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
      if (!installedBotNames.has(botGroup.bot) && installedBotNames.size > 0) return; // Show all if no bots installed yet
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

  if (filtered.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-1 mx-4 rounded-xl overflow-hidden k-fade-in z-30"
      style={{ background: colors.bg.modal, border: `1px solid ${colors.border.light}`, boxShadow: shadows.strong }}>
      <div className="px-3 pt-2.5 pb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: colors.text.disabled }}>Bot Commands</span>
      </div>
      <div ref={listRef} className="overflow-y-auto scrollbar-none max-h-[240px] pb-1">
        {filtered.map((cmd, i) => (
          <button key={`${cmd.bot}-${cmd.name}`} onClick={() => onSelect(cmd)}
            onMouseEnter={() => setSelectedIdx(i)}
            className="w-full flex items-center gap-3 px-3 py-2 text-left transition-colors"
            style={{ background: i === selectedIdx ? 'rgba(139,92,246,0.1)' : 'transparent' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0" style={{ background: colors.bg.elevated }}>{cmd.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[14px] font-mono font-medium" style={{ color: colors.text.primary }}>/{cmd.name}</span>
                {cmd.params?.filter(p => p.required).map(p => (
                  <span key={p.name} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: colors.accent.subtle, color: colors.accent.hover }}>{p.name}</span>
                ))}
              </div>
              <span className="text-[12px]" style={{ color: colors.text.muted }}>{cmd.desc}</span>
            </div>
            <span className="text-[10px] flex-shrink-0" style={{ color: colors.text.disabled }}>{cmd.bot}</span>
          </button>
        ))}
      </div>
    </div>
  );
}