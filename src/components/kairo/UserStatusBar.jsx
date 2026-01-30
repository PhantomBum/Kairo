import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Mic, MicOff, Headphones, HeadphoneOff, Settings, 
  Circle, Moon, MinusCircle, Eye
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
    <div className="h-14 bg-zinc-950 px-3 flex items-center gap-2 border-t border-zinc-800/30">
      {/* User info */}
      <Popover open={showStatusPicker} onOpenChange={setShowStatusPicker}>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-3 flex-1 p-2 rounded-xl hover:bg-zinc-800/50 transition-colors min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-xl overflow-hidden bg-zinc-700">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-sm font-medium">
                    {profile?.display_name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-zinc-950",
                currentStatus.color
              )} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate">
                {profile?.display_name || 'User'}
              </p>
              {profile?.custom_status?.text && (
                <p className="text-[11px] text-zinc-500 truncate">
                  {profile.custom_status.text}
                </p>
              )}
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-72 p-0 bg-zinc-900/95 backdrop-blur-xl border-zinc-800/80 rounded-2xl shadow-2xl" 
          align="start"
          side="top"
        >
          {/* Status options */}
          <div className="p-2 space-y-0.5">
            {statusOptions.map((status) => (
              <button
                key={status.id}
                onClick={() => {
                  onStatusChange?.(status.id);
                  setShowStatusPicker(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                  profile?.status === status.id 
                    ? "bg-violet-500/15 text-white" 
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                )}
              >
                <div className={cn("w-2.5 h-2.5 rounded-full", status.color)} />
                <span className="text-sm font-medium">{status.label}</span>
              </button>
            ))}
          </div>

          <div className="h-px bg-zinc-800/50 mx-2" />

          {/* Custom status */}
          <div className="p-3">
            <label className="text-[11px] font-semibold uppercase text-zinc-500 mb-2 block tracking-wider">
              Custom Status
            </label>
            <div className="flex gap-2">
              <Input
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                placeholder="What's happening?"
                className="flex-1 h-9 text-sm bg-zinc-800/70 border-zinc-700/50 text-white rounded-xl"
              />
              <Button
                size="sm"
                onClick={() => {
                  onCustomStatusChange?.({ text: customStatus });
                  setShowStatusPicker(false);
                }}
                className="h-9 bg-violet-500 hover:bg-violet-600 rounded-xl"
              >
                Save
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleMute}
                className={cn(
                  "p-2 rounded-xl transition-colors",
                  isMuted 
                    ? "bg-rose-500/20 text-rose-400" 
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                )}
              >
                {isMuted ? <MicOff className="w-[18px] h-[18px]" /> : <Mic className="w-[18px] h-[18px]" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-900 border-zinc-800 text-white text-xs rounded-lg">
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
                  "p-2 rounded-xl transition-colors",
                  isDeafened 
                    ? "bg-rose-500/20 text-rose-400" 
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                )}
              >
                {isDeafened ? <HeadphoneOff className="w-[18px] h-[18px]" /> : <Headphones className="w-[18px] h-[18px]" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-900 border-zinc-800 text-white text-xs rounded-lg">
              {isDeafened ? 'Undeafen' : 'Deafen'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-xl text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
              >
                <Settings className="w-[18px] h-[18px]" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-900 border-zinc-800 text-white text-xs rounded-lg">
              Settings
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}