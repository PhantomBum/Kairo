import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Mic, MicOff, Headphones, HeadphoneOff, Settings, 
  Circle, Moon, MinusCircle, Eye, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const statusOptions = [
  { id: 'online', label: 'Online', color: 'bg-emerald-400', icon: Circle },
  { id: 'idle', label: 'Away', color: 'bg-amber-400', icon: Moon },
  { id: 'dnd', label: 'Do Not Disturb', color: 'bg-rose-400', icon: MinusCircle },
  { id: 'invisible', label: 'Invisible', color: 'bg-zinc-500', icon: Eye },
];

export default function UserStatusBar({ 
  profile,
  isMuted,
  isDeafened,
  onToggleMute,
  onToggleDeafen,
  onOpenSettings,
  onStatusChange,
  onCustomStatusChange
}) {
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [customStatus, setCustomStatus] = useState(profile?.custom_status?.text || '');

  const currentStatus = statusOptions.find(s => s.id === profile?.status) || statusOptions[0];

  return (
    <div className="h-12 bg-[#0a0a0b] px-3 flex items-center gap-2 border-t border-white/5">
      {/* User info */}
      <Popover open={showStatusPicker} onOpenChange={setShowStatusPicker}>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2.5 flex-1 p-1.5 rounded hover:bg-white/5 transition-colors min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/10">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs font-medium">
                    {profile?.display_name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a0a0b]",
                currentStatus.color
              )} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-medium text-white truncate">
                {profile?.display_name || 'User'}
              </p>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-56 p-0 bg-[#0a0a0b] border-white/10 rounded-lg" 
          align="start"
          side="top"
        >
          {/* Status options */}
          <div className="p-1">
            {statusOptions.map((status) => (
              <button
                key={status.id}
                onClick={() => {
                  onStatusChange?.(status.id);
                  setShowStatusPicker(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded transition-colors",
                  profile?.status === status.id 
                    ? "bg-white/10 text-white" 
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className={cn("w-2 h-2 rounded-full", status.color)} />
                <span className="text-xs font-medium">{status.label}</span>
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Controls */}
      <div className="flex items-center gap-0.5">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleMute}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  isMuted 
                    ? "bg-red-500/20 text-red-400" 
                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                )}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#111113] border-white/10 text-white text-xs">
              {isMuted ? 'Unmute' : 'Mute'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleDeafen}
                className={cn(
                  "p-1.5 rounded transition-colors",
                  isDeafened 
                    ? "bg-red-500/20 text-red-400" 
                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                )}
              >
                {isDeafened ? <HeadphoneOff className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#111113] border-white/10 text-white text-xs">
              {isDeafened ? 'Undeafen' : 'Deafen'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('kairo:open-advanced-profile'))}
                className="p-1.5 rounded text-zinc-500 hover:bg-white/5 hover:text-emerald-400 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#111113] border-white/10 text-white text-xs">
              Customize Profile
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onOpenSettings}
                className="p-1.5 rounded text-zinc-500 hover:bg-white/5 hover:text-zinc-300 transition-colors"
              >
                <Settings className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#111113] border-white/10 text-white text-xs">
              Settings
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}