import React from 'react';
import { Mic, MicOff, Headphones, HeadphoneOff, Settings, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../primitives/Avatar';
import IconButton from '../primitives/IconButton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const statusOptions = [
  { id: 'online', label: 'Online', color: 'bg-emerald-500' },
  { id: 'idle', label: 'Idle', color: 'bg-amber-500' },
  { id: 'dnd', label: 'Do Not Disturb', color: 'bg-red-500' },
  { id: 'invisible', label: 'Invisible', color: 'bg-zinc-500' },
];

export default function UserPanel({
  profile,
  isMuted,
  isDeafened,
  onToggleMute,
  onToggleDeafen,
  onOpenSettings,
  onOpenProfile,
  onStatusChange,
}) {
  return (
    <div className="h-14 px-2 flex items-center gap-1 bg-[#0a0a0b]">
      {/* User info */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 flex-1 px-1.5 py-1 rounded-md hover:bg-white/[0.04] transition-colors min-w-0">
            <Avatar
              src={profile?.avatar_url}
              name={profile?.display_name}
              status={profile?.status || 'online'}
              size="sm"
            />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate">
                {profile?.display_name || 'User'}
              </p>
              <p className="text-[11px] text-zinc-500 truncate capitalize">
                {profile?.status || 'Online'}
              </p>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent 
          side="top" 
          align="start" 
          className="w-48 p-1 bg-[#111113] border-white/[0.08]"
        >
          <div className="px-2 py-1.5 text-xs font-medium text-zinc-500 uppercase">
            Set Status
          </div>
          {statusOptions.map((status) => (
            <button
              key={status.id}
              onClick={() => onStatusChange?.(status.id)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors',
                profile?.status === status.id 
                  ? 'bg-white/[0.06] text-white' 
                  : 'text-zinc-300 hover:bg-white/[0.04] hover:text-white'
              )}
            >
              <div className={cn('w-2.5 h-2.5 rounded-full', status.color)} />
              {status.label}
            </button>
          ))}
        </PopoverContent>
      </Popover>
      
      {/* Controls */}
      <div className="flex items-center gap-0.5">
        <IconButton
          icon={isMuted ? MicOff : Mic}
          size="sm"
          variant={isMuted ? 'danger' : 'ghost'}
          tooltip={isMuted ? 'Unmute' : 'Mute'}
          onClick={onToggleMute}
        />
        <IconButton
          icon={isDeafened ? HeadphoneOff : Headphones}
          size="sm"
          variant={isDeafened ? 'danger' : 'ghost'}
          tooltip={isDeafened ? 'Undeafen' : 'Deafen'}
          onClick={onToggleDeafen}
        />
        <IconButton
          icon={Settings}
          size="sm"
          variant="ghost"
          tooltip="Settings"
          onClick={onOpenSettings}
        />
      </div>
    </div>
  );
}