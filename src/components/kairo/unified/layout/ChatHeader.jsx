import React from 'react';
import { Hash, Users, Pin, Search, Phone, Video } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function HBtn({ label, onClick, active, children }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={onClick} className="w-8 h-8 flex items-center justify-center rounded transition-colors"
            style={{ color: active ? '#fff' : '#555' }}>{children}</button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-black text-white text-xs border-0 px-2 py-1">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ChatHeader({ channel, conversation, currentUserId, memberCount, showMembers, onToggleMembers, pinnedCount }) {
  if (conversation) {
    const other = conversation.participants?.find(p => p.user_id !== currentUserId) || conversation.participants?.[0];
    const name = conversation.type === 'group' ? conversation.name : (other?.user_name || 'User');
    return (
      <div className="h-12 px-4 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium overflow-hidden" style={{ background: '#222' }}>
            {other?.avatar ? <img src={other.avatar} className="w-full h-full rounded-full object-cover" /> : (name).charAt(0)}
          </div>
          <span className="text-sm font-medium text-white">{name}</span>
          {conversation.type === 'group' && (
            <span className="text-xs text-zinc-500">{conversation.participants?.length} members</span>
          )}
        </div>
        <div className="flex items-center">
          <HBtn label="Voice Call"><Phone className="w-4 h-4" /></HBtn>
          <HBtn label="Video Call"><Video className="w-4 h-4" /></HBtn>
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
        <HBtn label="Search"><Search className="w-4 h-4" /></HBtn>
        <HBtn label={`Pinned Messages${pinnedCount ? ` (${pinnedCount})` : ''}`}><Pin className="w-4 h-4" /></HBtn>
        <HBtn label="Members" active={showMembers} onClick={onToggleMembers}><Users className="w-4 h-4" /></HBtn>
      </div>
    </div>
  );
}