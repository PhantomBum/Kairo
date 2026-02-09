import React from 'react';
import { Hash, Volume2, Pin, Users, Search, Bell, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../ui/Avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function HBtn({ icon: Icon, label, onClick, active }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={onClick} className={cn(
            'w-8 h-8 rounded flex items-center justify-center transition-colors',
            active ? 'text-white bg-white/[0.08]' : 'text-zinc-500 hover:text-zinc-200'
          )}>
            <Icon className="w-[18px] h-[18px]" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="bg-[#1a1a1a] border-white/[0.08] text-white text-xs">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function ChatHeader({ channel, conversation, memberCount, showMembers, onToggleMembers, onShowSearch, onShowPinned, onStartCall, onStartVideo }) {
  if (conversation) {
    const other = conversation.participant_1_id === conversation.current_user_id
      ? { name: conversation.participant_2_name, avatar: conversation.participant_2_avatar }
      : { name: conversation.participant_1_name, avatar: conversation.participant_1_avatar };
    return (
      <div className="h-12 px-4 flex items-center justify-between border-b border-white/[0.06] bg-[#0c0c0c]">
        <div className="flex items-center gap-2">
          <Avatar src={other.avatar} name={other.name} size="xs" />
          <span className="font-semibold text-white text-[15px]">{other.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <HBtn icon={Search} label="Search" onClick={onShowSearch} />
          <HBtn icon={Settings} label="Settings" />
        </div>
      </div>
    );
  }

  const Icon = channel?.type === 'voice' ? Volume2 : Hash;
  return (
    <div className="h-12 px-4 flex items-center justify-between border-b border-white/[0.06] bg-[#111111]">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="w-5 h-5 text-zinc-500 flex-shrink-0" />
        <span className="font-semibold text-white text-[15px] truncate">{channel?.name}</span>
        {channel?.description && (
          <>
            <div className="w-px h-4 bg-white/[0.08] mx-2" />
            <span className="text-sm text-zinc-600 truncate">{channel.description}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-1">
        <HBtn icon={Pin} label="Pinned" onClick={onShowPinned} />
        <HBtn icon={Search} label="Search" onClick={onShowSearch} />
        <HBtn icon={Users} label="Members" onClick={onToggleMembers} active={showMembers} />
        <HBtn icon={Settings} label="Settings" />
      </div>
    </div>
  );
}