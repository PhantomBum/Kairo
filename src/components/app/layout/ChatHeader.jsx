import React from 'react';
import { Hash, Volume2, Megaphone, Radio, MessageSquare, HelpCircle, Lock, ListChecks, BookOpen, Ticket, Calendar, Bell, Users, Pin, AtSign, Search } from 'lucide-react';

const typeIcons = { text: Hash, voice: Volume2, announcement: Megaphone, stage: Radio, forum: MessageSquare, rules: BookOpen, tickets: Ticket, events: Calendar, polls: ListChecks, faq: HelpCircle, alerts: Bell, private: Lock };

export default function ChatHeader({ channel, conversation, currentUserId, showMembers, onToggleMembers, isDM, onPinned, pinnedCount, onSearch }) {
  const label = isDM
    ? (conversation?.name || conversation?.participants?.find(p => p.user_id !== currentUserId)?.user_name || 'DM')
    : (channel?.name || '');

  const Icon = isDM ? AtSign : (typeIcons[channel?.type] || Hash);

  return (
    <div className="h-12 px-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-glass)', backdropFilter: 'blur(12px)' }}>
      <div className="flex items-center gap-2.5 min-w-0">
        <Icon className="w-4 h-4 flex-shrink-0 opacity-40" style={{ color: 'var(--text-muted)' }} />
        <span className="text-[14px] font-semibold truncate" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>{label}</span>
        {channel?.type && channel.type !== 'text' && channel.type !== 'voice' && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>{channel.type}</span>
        )}
        {channel?.description && (
          <>
            <div className="w-px h-4" style={{ background: 'var(--border-light)' }} />
            <span className="text-[11px] truncate opacity-50" style={{ color: 'var(--text-secondary)' }}>{channel.description}</span>
          </>
        )}
        {channel?.slow_mode_seconds > 0 && (
          <span className="text-[8px] px-1.5 rounded-full" style={{ background: 'rgba(201,180,123,0.1)', color: 'var(--accent-amber)' }}>Slow {channel.slow_mode_seconds}s</span>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        {!isDM && onPinned && (
          <button onClick={onPinned} className="relative p-1.5 rounded-md transition-colors hover:bg-[var(--bg-glass-hover)]">
            <Pin className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            {pinnedCount > 0 && (
              <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center"
                style={{ background: 'var(--accent-amber)', color: '#000' }}>{pinnedCount}</div>
            )}
          </button>
        )}
        {!isDM && (
          <button onClick={onToggleMembers} className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-glass-hover)]">
            <Users className="w-4 h-4" style={{ color: showMembers ? 'var(--text-cream)' : 'var(--text-muted)' }} />
          </button>
        )}
      </div>
    </div>
  );
}