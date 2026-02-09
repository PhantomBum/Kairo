import React from 'react';
import { Mic, MicOff, Headphones, HeadphoneOff, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../ui/Avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

function IconBtn({ icon: Icon, activeIcon: ActiveIcon, label, active, onClick }) {
  const I = active && ActiveIcon ? ActiveIcon : Icon;
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button onClick={onClick} className={cn(
            'w-8 h-8 rounded flex items-center justify-center transition-colors',
            active ? 'text-red-400 bg-red-500/10' : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06]'
          )}>
            <I className="w-4 h-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-[#1a1a1a] border-white/[0.08] text-white text-xs">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function UserBar({ profile, isMuted, isDeafened, onToggleMute, onToggleDeafen, onOpenSettings }) {
  return (
    <div className="h-[52px] px-2 flex items-center gap-2 bg-[#161616] border-t border-white/[0.04]">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Avatar src={profile?.avatar_url} name={profile?.display_name} size="sm" status={profile?.status || 'online'} />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-white truncate">{profile?.display_name || 'User'}</p>
          <p className="text-[11px] text-zinc-600 truncate capitalize">{profile?.status || 'Online'}</p>
        </div>
      </div>
      <div className="flex items-center gap-0.5">
        <IconBtn icon={Mic} activeIcon={MicOff} label={isMuted ? 'Unmute' : 'Mute'} active={isMuted} onClick={onToggleMute} />
        <IconBtn icon={Headphones} activeIcon={HeadphoneOff} label={isDeafened ? 'Undeafen' : 'Deafen'} active={isDeafened} onClick={onToggleDeafen} />
        <IconBtn icon={Settings} label="Settings" onClick={onOpenSettings} />
      </div>
    </div>
  );
}