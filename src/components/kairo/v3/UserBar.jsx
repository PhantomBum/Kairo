// Kairo User Bar v3.0 - Minimal user status bar

import React from 'react';
import { Mic, MicOff, Headphones, HeadphoneOff, Settings, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Text, Avatar, IconButton, StatusDot } from '../ui/DesignSystem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusOptions = [
  { value: 'online', label: 'Online', color: 'bg-emerald-500' },
  { value: 'idle', label: 'Idle', color: 'bg-amber-500' },
  { value: 'dnd', label: 'Do Not Disturb', color: 'bg-red-500' },
  { value: 'invisible', label: 'Invisible', color: 'bg-zinc-500' },
];

export default function UserBarV3({
  profile,
  isMuted,
  isDeafened,
  onToggleMute,
  onToggleDeafen,
  onOpenSettings,
  onStatusChange
}) {
  if (!profile) return null;

  return (
    <div className="h-14 px-2 flex items-center gap-2 bg-[#09090b] border-t border-white/[0.04]">
      {/* User info with status dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 flex-1 min-w-0 px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors">
            <Avatar 
              src={profile.avatar_url}
              name={profile.display_name || profile.full_name}
              size="sm"
              status={profile.status || 'online'}
            />
            <div className="flex-1 min-w-0 text-left">
              <Text variant="small" color="primary" weight="medium" className="truncate block">
                {profile.display_name || profile.full_name || 'User'}
              </Text>
              <Text variant="tiny" color="muted" className="capitalize">
                {profile.status || 'Online'}
              </Text>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48 bg-[#111114] border-white/[0.06] rounded-xl p-1.5" align="start">
          {statusOptions.map((status) => (
            <DropdownMenuItem 
              key={status.value}
              onClick={() => onStatusChange?.(status.value)}
              className={cn(
                "text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2.5",
                profile.status === status.value && "bg-white/[0.04]"
              )}
            >
              <div className={cn("w-2.5 h-2.5 rounded-full mr-2.5", status.color)} />
              {status.label}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator className="bg-white/[0.04] my-1" />
          <DropdownMenuItem className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2.5">
            Set Custom Status
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Voice controls */}
      <div className="flex items-center gap-0.5">
        <IconButton 
          size="sm" 
          variant={isMuted ? 'solid' : 'ghost'}
          onClick={onToggleMute}
          className={isMuted ? 'bg-red-500/20 text-red-400' : ''}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </IconButton>
        
        <IconButton 
          size="sm" 
          variant={isDeafened ? 'solid' : 'ghost'}
          onClick={onToggleDeafen}
          className={isDeafened ? 'bg-red-500/20 text-red-400' : ''}
        >
          {isDeafened ? <HeadphoneOff className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
        </IconButton>
        
        <IconButton 
          size="sm" 
          variant="ghost" 
          onClick={() => window.dispatchEvent(new CustomEvent('kairo:open-advanced-profile'))}
          className="hover:text-emerald-400"
        >
          <Sparkles className="w-4 h-4" />
        </IconButton>
        
        <IconButton size="sm" variant="ghost" onClick={onOpenSettings}>
          <Settings className="w-4 h-4" />
        </IconButton>
      </div>
    </div>
  );
}