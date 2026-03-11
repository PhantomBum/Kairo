import React from 'react';
import { createPageUrl } from '@/utils';
import { Hash, Volume2, Megaphone, Radio, MessageSquare, HelpCircle, Users, Pin, AtSign, Image, Phone, Video, Search, LayoutGrid } from 'lucide-react';
import { colors, shadows } from '@/components/app/design/tokens';

const typeIcons = { text: Hash, voice: Volume2, announcement: Megaphone, stage: Radio, forum: MessageSquare, board: LayoutGrid };

function HeaderButton({ icon: Icon, onClick, href, active, badge, title }) {
  const Wrapper = href ? 'a' : 'button';
  const props = href ? { href, title } : { onClick, title };
  return (
    <Wrapper {...props} className="w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:bg-[rgba(255,255,255,0.06)] relative"
      style={{ color: active ? colors.text.primary : colors.text.muted }}>
      <Icon className="w-[18px] h-[18px]" />
      {badge > 0 && (
        <div className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
          style={{ background: colors.danger, color: '#fff' }}>{badge}</div>
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
      style={{ borderBottom: `1px solid ${colors.border.default}`, background: colors.bg.surface, boxShadow: '0 1px 0 rgba(0,0,0,0.15)' }}>
      <div className="flex items-center gap-2 min-w-0">
        {!isDM && serverName && (
          <>
            <span className="text-[13px] truncate max-w-[120px] hidden lg:inline" style={{ color: colors.text.muted }} title={serverName}>{serverName}</span>
            <span className="text-[13px] hidden lg:inline" style={{ color: colors.text.disabled }}>›</span>
          </>
        )}
        <Icon className="w-5 h-5 flex-shrink-0" style={{ color: colors.text.disabled }} />
        <h1 className="text-[15px] font-semibold truncate" style={{ color: colors.text.primary }} title={label}>{label}</h1>
        {channel?.description && (
          <>
            <div className="w-px h-5 mx-1 flex-shrink-0 hidden md:block" style={{ background: colors.border.light }} />
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