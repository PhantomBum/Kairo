import React from 'react';
import { Hash, Volume2, Megaphone, Radio, MessageSquare, Users, Pin, AtSign, Phone, Video, Search, LayoutGrid, Inbox, MessageCircle, Lock, Image, Shield } from 'lucide-react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import ReactMarkdown from 'react-markdown';

import { colors } from '@/components/app/design/tokens';

const P = {
  base: colors.bg.base, surface: colors.bg.surface, elevated: colors.bg.elevated,
  floating: colors.bg.float, border: colors.border.subtle,
  textPrimary: colors.text.primary, textSecondary: colors.text.secondary, muted: colors.text.muted,
  accent: colors.accent.primary, danger: colors.danger, success: colors.success,
};

const statusColors = { online: colors.status.online, idle: colors.status.idle, dnd: colors.status.dnd, invisible: colors.text.muted, offline: colors.text.muted };
const typeIcons = { text: Hash, voice: Volume2, announcement: Megaphone, stage: Radio, forum: MessageSquare, board: LayoutGrid };

function HeaderBtn({ icon: Icon, onClick, active, badge, title, accent }) {
  return (
    <button onClick={onClick} title={title} aria-label={title}
      className="w-8 h-8 flex items-center justify-center rounded-[10px] relative transition-colors hover:bg-[var(--surface-glass)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-primary)]"
      style={{ color: accent || (active ? P.textPrimary : P.muted) }}>
      <Icon className="w-[18px] h-[18px]" />
      {badge > 0 && (
        <div className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[11px] font-bold flex items-center justify-center"
          style={{ background: P.danger, color: '#fff' }}>{badge}</div>
      )}
    </button>
  );
}

export default function ChatHeader({
  channel, conversation, currentUserId, showMembers, onToggleMembers, isDM,
  onPinned, pinnedCount, onMediaGallery, onVoiceCall, onVideoCall, serverName,
  onSearch, onStarred, secretChat, onToggleSecret, onThreads, onInbox, slowModeSeconds = 0,
}) {
  const { getProfile } = useProfiles?.() || { getProfile: () => null };

  const isGroup = isDM && conversation?.type === 'group' && conversation?.participants?.length > 2;
  const isNoteToSelf = isDM && (conversation?.name === 'Note to Self' ||
    (conversation?.participants?.length === 1 && conversation?.participants[0]?.user_id === currentUserId));

  const otherParticipant = isDM && !isGroup && !isNoteToSelf
    ? conversation?.participants?.find(p => p.user_id !== currentUserId)
    : null;
  const otherProfile = otherParticipant ? getProfile(otherParticipant.user_id) : null;
  const otherStatus = otherProfile?.status || 'offline';
  const customStatus = otherProfile?.custom_status;

  const label = isDM
    ? (isNoteToSelf ? 'Note to Self' : conversation?.name || otherParticipant?.user_name || 'DM')
    : (channel?.name || '');
  const Icon = isDM ? (isNoteToSelf ? Shield : AtSign) : (typeIcons[channel?.type] || Hash);
  const topic = channel?.description || '';
  const memberCount = isGroup ? conversation?.participants?.length : null;

  return (
    <div className="k-chat-header h-[52px] min-h-[52px] max-h-[52px] px-5 flex items-center justify-between flex-shrink-0"
      style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-faint)' }}
      role="banner">

      {/* Left: DM avatar + name OR channel icon + name */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {isDM && !isNoteToSelf && !isGroup && otherParticipant && (
          <div className="relative flex-shrink-0">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold overflow-hidden"
              style={{ background: P.base, color: P.muted }}>
              {otherParticipant.avatar
                ? <img src={otherParticipant.avatar} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} />
                : (otherParticipant.user_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-[10px] h-[10px] rounded-full"
              style={{ background: statusColors[otherStatus], border: `2px solid ${P.elevated}` }} />
          </div>
        )}
        {isDM && isGroup && (
          <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: P.base }}>
            <Users className="w-3.5 h-3.5" style={{ color: P.muted }} />
          </div>
        )}
        {!isDM && <Icon className="w-5 h-5 flex-shrink-0" style={{ color: P.muted }} />}
        {isDM && isNoteToSelf && <Icon className="w-5 h-5 flex-shrink-0" style={{ color: P.accent }} />}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-[16px] font-semibold truncate" style={{ color: P.textPrimary }}>{label}</h1>
            {isGroup && memberCount && (
              <span className="text-[11px] flex-shrink-0" style={{ color: P.muted }}>{memberCount} members</span>
            )}
            {secretChat && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0"
                style={{ background: `${P.success}15`, color: P.success }}>
                <Lock className="w-2.5 h-2.5" /> Secret
              </span>
            )}
          </div>
          {isDM && !isGroup && !isNoteToSelf && customStatus?.text && (
            <p className="text-[11px] truncate -mt-0.5" style={{ color: P.muted }}>
              {customStatus.emoji || ''} {customStatus.text}
            </p>
          )}
        </div>

        {channel?.is_nsfw && (
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ml-1"
            style={{ background: 'rgba(237,66,69,0.12)', color: P.danger }}>NSFW</span>
        )}
        {topic && (
          <Popover>
            <div className="w-px h-4 mx-1 flex-shrink-0 hidden md:block" style={{ background: P.border }} />
            <PopoverTrigger asChild>
              <button className="text-[13px] truncate hidden md:inline text-left hover:underline" style={{ color: P.muted }}>
                {topic}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[360px] p-3" style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', color: P.textSecondary }}>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: P.muted }}>Channel topic</p>
              <div className="text-[12px] leading-relaxed">
                <ReactMarkdown>{topic}</ReactMarkdown>
              </div>
            </PopoverContent>
          </Popover>
        )}
        {!isDM && slowModeSeconds > 0 && (
          <span className="text-[11px] ml-1 hidden md:inline" style={{ color: P.muted }}>
            Slow mode: {slowModeSeconds}s
          </span>
        )}
      </div>

      {/* Right: action buttons — 32px, 4px gap */}
      <div className="flex items-center gap-1">
        {isDM && !isNoteToSelf && !secretChat && (
          <>
            <HeaderBtn icon={Phone} onClick={onVoiceCall} title="Voice Call" />
            <HeaderBtn icon={Video} onClick={onVideoCall} title="Video Call" />
          </>
        )}
        {isDM && !isNoteToSelf && onToggleSecret && (
          <HeaderBtn icon={Lock} onClick={onToggleSecret} title={secretChat ? 'Exit Secret Chat' : 'Secret Chat'}
            accent={secretChat ? P.success : undefined} active={secretChat} />
        )}
        {onSearch && <HeaderBtn icon={Search} onClick={onSearch} title="Search" />}
        <div className="hide-under-1100">
          {!isDM && <HeaderBtn icon={MessageCircle} onClick={onThreads} title="Threads" />}
        </div>
        {onPinned && <HeaderBtn icon={Pin} onClick={onPinned} badge={pinnedCount} title="Pinned Messages" />}
        {isDM && onMediaGallery && <HeaderBtn icon={Image} onClick={onMediaGallery} title="Shared Media" />}
        {(isGroup || !isDM) && <HeaderBtn icon={Users} onClick={onToggleMembers} active={showMembers} title="Member List" />}
        <div className="hide-under-1400">
          <HeaderBtn icon={Inbox} onClick={onInbox} title="Inbox" />
        </div>
      </div>
    </div>
  );
}
