import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Headphones, HeadphoneOff, Settings, 
  Circle, Moon, MinusCircle, Eye, Pencil
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
  { id: 'online', label: 'Online', color: 'bg-emerald-500', icon: Circle },
  { id: 'idle', label: 'Idle', color: 'bg-amber-500', icon: Moon },
  { id: 'dnd', label: 'Do Not Disturb', color: 'bg-red-500', icon: MinusCircle },
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
    <div className="h-[52px] bg-[#0f0f11] px-2 flex items-center gap-2">
      {/* User info */}
      <Popover open={showStatusPicker} onOpenChange={setShowStatusPicker}>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-2 flex-1 p-1 rounded hover:bg-zinc-800/50 transition-colors min-w-0">
            <div className="relative flex-shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-700">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-medium">
                    {profile?.display_name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-[3px] border-[#0f0f11]",
                currentStatus.color
              )} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate">
                {profile?.display_name || 'User'}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                {profile?.custom_status?.text || currentStatus.label}
              </p>
            </div>
          </button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-72 p-0 bg-zinc-900 border-zinc-800" 
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
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                  profile?.status === status.id 
                    ? "bg-indigo-500/20 text-white" 
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                )}
              >
                <div className={cn("w-3 h-3 rounded-full", status.color)} />
                <span className="text-sm">{status.label}</span>
              </button>
            ))}
          </div>

          <div className="h-px bg-zinc-800" />

          {/* Custom status */}
          <div className="p-3">
            <label className="text-xs font-semibold uppercase text-zinc-500 mb-2 block">
              Custom Status
            </label>
            <div className="flex gap-2">
              <Input
                value={customStatus}
                onChange={(e) => setCustomStatus(e.target.value)}
                placeholder="What's on your mind?"
                className="flex-1 h-8 text-sm bg-zinc-800 border-zinc-700 text-white"
              />
              <Button
                size="sm"
                onClick={() => {
                  onCustomStatusChange?.({ text: customStatus });
                  setShowStatusPicker(false);
                }}
                className="h-8 bg-indigo-500 hover:bg-indigo-600"
              >
                Save
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Controls */}
      <div className="flex items-center">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleMute}
                className={cn(
                  "p-2 rounded transition-colors",
                  isMuted 
                    ? "bg-red-500/20 text-red-400" 
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                )}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-900 border-zinc-800 text-white">
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
                  "p-2 rounded transition-colors",
                  isDeafened 
                    ? "bg-red-500/20 text-red-400" 
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                )}
              >
                {isDeafened ? <HeadphoneOff className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-900 border-zinc-800 text-white">
              {isDeafened ? 'Undeafen' : 'Deafen'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onOpenSettings}
                className="p-2 rounded text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-zinc-900 border-zinc-800 text-white">
              User Settings
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}