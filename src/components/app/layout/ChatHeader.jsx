import React, { useState, useEffect, useRef } from 'react';

import { Hash, Volume2, Megaphone, Radio, MessageSquare, Users, Pin, AtSign, Phone, Video, Search, LayoutGrid, MoreHorizontal, Star, Image, HelpCircle, Heart } from 'lucide-react';
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
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    if (!showMore) return;
    const handler = (e) => { if (moreRef.current && !moreRef.current.contains(e.target)) setShowMore(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showMore]);
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
        {/* More dropdown */}
        <div className="relative" ref={moreRef}>
          <HeaderBtn icon={MoreHorizontal} onClick={() => setShowMore(!showMore)} active={showMore} title="More" />
          {showMore && (
            <div className="absolute right-0 top-full mt-1 w-48 py-1.5 rounded-lg z-50 k-fade-in"
              style={{ background: colors.bg.float, border: `1px solid ${colors.border.strong}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
              {onStarred && (
                <button onClick={() => { onStarred(); setShowMore(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-md mx-auto transition-colors hover:bg-[rgba(88,101,242,0.15)]"
                  style={{ color: colors.text.secondary }}>
                  <Star className="w-4 h-4 opacity-60" /> Starred Messages
                </button>
              )}
              {onMediaGallery && (
                <button onClick={() => { onMediaGallery(); setShowMore(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-md mx-auto transition-colors hover:bg-[rgba(88,101,242,0.15)]"
                  style={{ color: colors.text.secondary }}>
                  <Image className="w-4 h-4 opacity-60" /> Media Gallery
                </button>
              )}
              <div className="h-px mx-2 my-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <button onClick={() => { setShowMore(false); setShowSupport(!showSupport); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-md mx-auto transition-colors hover:bg-[rgba(88,101,242,0.15)]"
                style={{ color: colors.text.secondary }}>
                <HelpCircle className="w-4 h-4 opacity-60" /> FAQ & Support
              </button>
            </div>
          )}
        </div>
        {showSupport && <SupportDropdown onClose={() => setShowSupport(false)} />}
      </div>
    </div>
  );
}