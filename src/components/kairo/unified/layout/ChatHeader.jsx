import React from 'react';
import { Hash, Users, Pin, Search, Phone, Video, Bell, BellOff, AtSign } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function HBtn({ label, onClick, active, children }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={onClick}
            className="w-8 h-8 flex items-center justify-center rounded transition-colors"
            style={{ color: active ? '#fff' : '#555' }}>
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-black text-white text-xs border-0 px-2 py-1">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ChatHeader({ channel, conversation, currentUserId, memberCount, showMembers, onToggleMembers, pinnedCount, onToggleSearch, showSearch, onTogglePinned, showPinned, typingUsers }) {
  if (conversation) {
    const isGroup = conversation.type === 'group';
    const other = conversation.participants?.find(p => p.user_id !== currentUserId) || conversation.participants?.[0];
    return (
      <div className="h-12 px-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-medium overflow-hidden" style={{ background: '#222' }}>
            {isGroup ? <Users className="w-3.5 h-3.5 text-zinc-400" /> :
              other?.avatar ? <img src={other.avatar} className="w-full h-full rounded-full object-cover" /> : (other?.user_name || 'U').charAt(0)}
          </div>
          <div>
            <span className="text-sm font-medium text-white">{isGroup ? conversation.name : (other?.user_name || 'User')}</span>
            {isGroup && <span className="text-[11px] text-zinc-500 ml-2">{conversation.participants?.length} members</span>}
          </div>
        </div>
        <div className="flex items-center">
          <HBtn label="Voice Call"><Phone className="w-4 h-4" /></HBtn>
          <HBtn label="Video Call"><Video className="w-4 h-4" /></HBtn>
          <HBtn label="Search" active={showSearch} onClick={onToggleSearch}><Search className="w-4 h-4" /></HBtn>
        </div>
      </div>
    );
  }

  return (
    <div className="h-12 px-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center gap-2">
        <Hash className="w-4 h-4 text-zinc-500" />
        <span className="text-sm font-medium text-white">{channel?.name}</span>
        {channel?.description && (
          <>
            <div className="w-px h-4 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-xs text-zinc-500 truncate max-w-[300px]">{channel.description}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        <HBtn label="Search" active={showSearch} onClick={onToggleSearch}><Search className="w-4 h-4" /></HBtn>
        <HBtn label={`Pinned (${pinnedCount || 0})`} active={showPinned} onClick={onTogglePinned}>
          <div className="relative">
            <Pin className="w-4 h-4" />
            {pinnedCount > 0 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[7px] text-white flex items-center justify-center">{pinnedCount}</div>}
          </div>
        </HBtn>
        <HBtn label="Members" active={showMembers} onClick={onToggleMembers}><Users className="w-4 h-4" /></HBtn>
      </div>
    </div>
  );
}