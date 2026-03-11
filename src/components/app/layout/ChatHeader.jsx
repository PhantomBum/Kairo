import React from 'react';
import { createPageUrl } from '@/utils';
import { Hash, Volume2, Megaphone, Radio, MessageSquare, HelpCircle, Users, Pin, AtSign, Image, Phone, Video, Search, LayoutGrid, ShieldAlert } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

const typeIcons = { text: Hash, voice: Volume2, announcement: Megaphone, stage: Radio, forum: MessageSquare, board: LayoutGrid };

function HeaderButton({ icon: Icon, onClick, href, active, badge, title }) {
  const Wrapper = href ? 'a' : 'button';
  const props = href ? { href, title, 'aria-label': title } : { onClick, title, 'aria-label': title };
  return (
    <Wrapper {...props} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)] relative"
      style={{ color: active ? colors.text.primary : colors.text.muted }}>
      <Icon className="w-[18px] h-[18px]" />
      {badge > 0 && (
        <div className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
          style={{ background: colors.danger, color: '#fff' }} aria-label={`${badge} pinned`}>{badge}</div>
      )}
    </Wrapper>
  );
}

export default function ChatHeader({ channel, conversation, currentUserId, showMembers, onToggleMembers, isDM, onPinned, pinnedCount, onMediaGallery, onVoiceCall, onVideoCall, serverName, onSearch }) {
  const label = isDM
    ? (conversation?.name || conversation?.participants?.find(p => p.user_id !== currentUserId)?.user_name || 'DM')
    : (channel?.name || '');

  const Icon = isDM ? AtSign : (typeIcons[channel?.type] || Hash);

  return (
    <div className="h-12 px-4 flex items-center justify-between flex-shrink-0"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(14,14,20,0.6)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
      role="banner" aria-label={isDM ? `Conversation with ${label}` : `Channel ${label}`}>
      <div className="flex items-center gap-2.5 min-w-0">
        {!isDM && serverName && (
          <>
            <span className="text-[13px] truncate max-w-[120px] hidden lg:inline font-medium" style={{ color: colors.text.disabled }} title={serverName}>{serverName}</span>
            <span className="text-[12px] hidden lg:inline" style={{ color: colors.text.disabled }}>›</span>
          </>
        )}
        <Icon className="w-5 h-5 flex-shrink-0" style={{ color: colors.text.disabled }} />
        <h1 className="text-[15px] font-semibold truncate" style={{ color: colors.text.primary }} title={label}>{label}</h1>
        {channel?.is_nsfw && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: 'rgba(239,68,68,0.12)', color: colors.danger }}>NSFW</span>
        )}
        {channel?.description && (
          <>
            <div className="w-px h-5 mx-1.5 flex-shrink-0 hidden md:block" style={{ background: colors.border.light }} />
            <span className="text-[13px] truncate hidden md:inline" style={{ color: colors.text.muted }}>{channel.description}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        {isDM && (
          <>
            <HeaderButton icon={Phone} onClick={onVoiceCall} title="Start Voice Call" />
            <HeaderButton icon={Video} onClick={onVideoCall} title="Start Video Call" />
          </>
        )}
        {onPinned && <HeaderButton icon={Pin} onClick={onPinned} badge={pinnedCount} title="Pinned Messages" />}
        {onMediaGallery && <HeaderButton icon={Image} onClick={onMediaGallery} title="Media Gallery" />}
        {onSearch && <HeaderButton icon={Search} onClick={onSearch} title="Search" />}
        {!isDM && <HeaderButton icon={Users} onClick={onToggleMembers} active={showMembers} title="Member List" />}
        <HeaderButton icon={HelpCircle} href={createPageUrl('FAQ')} title="Help & FAQ" />
      </div>
    </div>
  );
}