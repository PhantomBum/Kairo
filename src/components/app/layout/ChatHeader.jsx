import React from 'react';
import { Hash, Users, Pin, Search, AtSign, Phone, Video, Bell, BellOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function HBtn({ label, onClick, active, children }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={onClick} className="p-1.5 rounded-md transition-colors hover:bg-[var(--bg-hover)]"
            style={{ color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {children}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-[10px] border-0 px-2 py-1"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ChatHeader({ channel, conversation, currentUserId, memberCount, showMembers, onToggleMembers, isDM, onPinned, pinnedCount }) {
  const label = isDM
    ? (conversation?.name || conversation?.participants?.find(p => p.user_id !== currentUserId)?.user_name || 'DM')
    : (channel?.name || '');

  return (
    <div className="h-12 px-4 flex items-center justify-between flex-shrink-0"
      style={{ borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 min-w-0">
        {!isDM && <Hash className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
        {isDM && <AtSign className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
        <span className="text-[14px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{label}</span>
        {channel?.description && (
          <>
            <div className="w-px h-4 mx-1" style={{ background: 'var(--border)' }} />
            <span className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{channel.description}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        {!isDM && onPinned && (
          <HBtn label={`Pinned Messages${pinnedCount ? ` (${pinnedCount})` : ''}`} onClick={onPinned}>
            <div className="relative">
              <Pin className="w-4 h-4" />
              {pinnedCount > 0 && <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full text-[7px] font-bold flex items-center justify-center bg-amber-500 text-black">{pinnedCount}</div>}
            </div>
          </HBtn>
        )}
        {!isDM && (
          <HBtn label={showMembers ? 'Hide Members' : 'Show Members'} onClick={onToggleMembers} active={showMembers}>
            <Users className="w-4 h-4" />
          </HBtn>
        )}
      </div>
    </div>
  );
}