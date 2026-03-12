import React, { useState } from 'react';
import { createPageUrl } from '@/utils';
import { Hash, Volume2, Megaphone, Radio, MessageSquare, HelpCircle, Users, Pin, AtSign, Image, Phone, Video, Search, LayoutGrid, Star, Heart } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';
import SupportDropdown from '@/components/app/features/SupportDropdown';

const typeIcons = { text: Hash, voice: Volume2, announcement: Megaphone, stage: Radio, forum: MessageSquare, board: LayoutGrid };

function HeaderBtn({ icon: Icon, onClick, href, active, badge, title }) {
  const Tag = href ? 'a' : 'button';
  const props = href ? { href, title } : { onClick, title };
  return (
    <Tag {...props} className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,0.1)] relative transition-colors"
      style={{ color: active ? colors.text.primary : colors.text.muted }}>
      <Icon className="w-5 h-5" />
      {badge > 0 && (
        <div className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
          style={{ background: colors.danger, color: '#fff' }}>{badge}</div>
      )}
    </Tag>
  );
}

export default function ChatHeader({ channel, conversation, currentUserId, showMembers, onToggleMembers, isDM, onPinned, pinnedCount, onMediaGallery, onVoiceCall, onVideoCall, serverName, onSearch, onStarred }) {
  const [showSupport, setShowSupport] = useState(false);
  const label = isDM
    ? (conversation?.name || conversation?.participants?.find(p => p.user_id !== currentUserId)?.user_name || 'DM')
    : (channel?.name || '');
  const Icon = isDM ? AtSign : (typeIcons[channel?.type] || Hash);

  return (
    <div className="h-12 px-4 flex items-center justify-between flex-shrink-0"
      style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.4)', background: colors.bg.elevated }}
      role="banner">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="w-5 h-5 flex-shrink-0" style={{ color: colors.text.muted }} />
        <h1 className="text-[15px] font-semibold truncate" style={{ color: colors.text.primary }}>{label}</h1>
        {channel?.is_nsfw && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0" style={{ background: 'rgba(242,63,67,0.15)', color: colors.danger }}>NSFW</span>
        )}
        {channel?.description && (
          <>
            <div className="w-px h-5 mx-1 flex-shrink-0 hidden md:block" style={{ background: 'rgba(255,255,255,0.1)' }} />
            <span className="text-[13px] truncate hidden md:inline" style={{ color: colors.text.muted }}>{channel.description}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-1 relative">
        {isDM && (
          <>
            <HeaderBtn icon={Phone} onClick={onVoiceCall} title="Start Voice Call" />
            <HeaderBtn icon={Video} onClick={onVideoCall} title="Start Video Call" />
          </>
        )}
        {onPinned && <HeaderBtn icon={Pin} onClick={onPinned} badge={pinnedCount} title="Pinned Messages" />}
        {onSearch && <HeaderBtn icon={Search} onClick={onSearch} title="Search" />}
        {!isDM && <HeaderBtn icon={Users} onClick={onToggleMembers} active={showMembers} title="Member List" />}
        <button onClick={() => setShowSupport(!showSupport)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,0.1)] transition-colors group relative"
          style={{ color: '#3ba55c' }}>
          <Heart className="w-[18px] h-[18px]" />
        </button>
        {showSupport && <SupportDropdown onClose={() => setShowSupport(false)} />}
      </div>
    </div>
  );
}