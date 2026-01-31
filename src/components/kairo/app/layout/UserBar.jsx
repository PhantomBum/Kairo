import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Headphones, HeadphoneOff, Settings, Circle, Moon, MinusCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../ui/Avatar';
import Tooltip from '../ui/Tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

const statusOptions = [
  { id: 'online', label: 'Online', color: '#22c55e', icon: Circle },
  { id: 'idle', label: 'Idle', color: '#f59e0b', icon: Moon },
  { id: 'dnd', label: 'Do Not Disturb', color: '#ef4444', icon: MinusCircle },
  { id: 'invisible', label: 'Invisible', color: '#6b7280', icon: Eye },
];

function StatusDot({ status }) {
  const config = statusOptions.find(s => s.id === status) || statusOptions[0];
  return (
    <div 
      className="w-3 h-3 rounded-full border-2 border-[#111113]"
      style={{ backgroundColor: config.color }}
    />
  );
}

function ControlButton({ icon: Icon, activeIcon: ActiveIcon, label, active, danger, onClick }) {
  const DisplayIcon = active && ActiveIcon ? ActiveIcon : Icon;
  
  return (
    <Tooltip content={label}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
          active 
            ? danger 
              ? 'bg-red-500/20 text-red-400' 
              : 'bg-white/[0.1] text-white'
            : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
        )}
      >
        <DisplayIcon className="w-4 h-4" />
      </motion.button>
    </Tooltip>
  );
}

export default function UserBar({
  profile,
  isMuted,
  isDeafened,
  onToggleMute,
  onToggleDeafen,
  onOpenSettings,
  onStatusChange,
}) {
  const [isEditing, setIsEditing] = useState(false);

  const currentStatus = profile?.status || 'online';
  const statusConfig = statusOptions.find(s => s.id === currentStatus) || statusOptions[0];

  return (
    <div className="h-[52px] px-2 bg-[#0e0e10] flex items-center gap-2 border-t border-white/[0.04]">
      {/* User info */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 flex-1 min-w-0 p-1.5 -m-1.5 rounded-md hover:bg-white/[0.04] transition-colors">
            <div className="relative flex-shrink-0">
              <Avatar 
                src={profile?.avatar_url} 
                name={profile?.display_name} 
                size="sm"
              />
              <div className="absolute -bottom-0.5 -right-0.5">
                <StatusDot status={currentStatus} />
              </div>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate">
                {profile?.display_name || 'User'}
              </p>
              <p className="text-[11px] text-zinc-500 truncate">
                {profile?.custom_status?.text || statusConfig.label}
              </p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" side="top" className="w-64 bg-[#111113] border-white/[0.08]">
          {/* Profile header */}
          <div className="p-3">
            <div className="flex items-center gap-3">
              <Avatar 
                src={profile?.avatar_url} 
                name={profile?.display_name} 
                size="lg"
                status={currentStatus}
              />
              <div>
                <p className="font-semibold text-white">{profile?.display_name}</p>
                <p className="text-xs text-zinc-500">@{profile?.username}</p>
              </div>
            </div>
          </div>
          
          <DropdownMenuSeparator />
          
          {/* Status options */}
          <div className="p-1">
            <p className="px-2 py-1 text-[11px] font-semibold text-zinc-500 uppercase">Status</p>
            {statusOptions.map((option) => (
              <DropdownMenuItem
                key={option.id}
                onClick={() => onStatusChange?.(option.id)}
                className={cn(
                  'gap-2 cursor-pointer',
                  currentStatus === option.id && 'bg-white/[0.04]'
                )}
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: option.color }} 
                />
                <span>{option.label}</span>
                {currentStatus === option.id && (
                  <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
          
          <DropdownMenuSeparator />
          
          {/* Custom status */}
          <DropdownMenuItem 
            onClick={() => setIsEditing(true)}
            className="gap-2 cursor-pointer"
          >
            <span className="text-lg">😊</span>
            <span>Set Custom Status</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Controls */}
      <div className="flex items-center gap-0.5">
        <ControlButton
          icon={Mic}
          activeIcon={MicOff}
          label={isMuted ? 'Unmute' : 'Mute'}
          active={isMuted}
          danger={isMuted}
          onClick={onToggleMute}
        />
        <ControlButton
          icon={Headphones}
          activeIcon={HeadphoneOff}
          label={isDeafened ? 'Undeafen' : 'Deafen'}
          active={isDeafened}
          danger={isDeafened}
          onClick={onToggleDeafen}
        />
        <ControlButton
          icon={Settings}
          label="User Settings"
          onClick={onOpenSettings}
        />
      </div>
    </div>
  );
}