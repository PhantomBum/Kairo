import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Headphones, HeadphoneOff, Settings, 
  ChevronUp, Sparkles, Volume2, Moon, Sun, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../primitives/Avatar';
import IconButton from '../primitives/IconButton';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const statusOptions = [
  { id: 'online', label: 'Online', color: 'from-emerald-400 to-emerald-600', glow: 'shadow-emerald-500/50' },
  { id: 'idle', label: 'Away', color: 'from-amber-400 to-amber-600', glow: 'shadow-amber-500/50' },
  { id: 'dnd', label: 'Do Not Disturb', color: 'from-red-400 to-red-600', glow: 'shadow-red-500/50' },
  { id: 'invisible', label: 'Invisible', color: 'from-zinc-400 to-zinc-600', glow: 'shadow-zinc-500/50' },
];

function StatusDot({ status, size = 'sm', showGlow = true }) {
  const config = statusOptions.find(s => s.id === status) || statusOptions[0];
  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
  };
  
  return (
    <motion.div
      className={cn(
        'rounded-full bg-gradient-to-br',
        config.color,
        sizeClasses[size],
        showGlow && `shadow-sm ${config.glow}`
      )}
      animate={status === 'online' ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 2, repeat: Infinity }}
    />
  );
}

function ControlButton({ icon: Icon, isActive, variant, onClick, tooltip }) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
        variant === 'danger' 
          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
          : isActive 
            ? 'bg-white/[0.1] text-white' 
            : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]'
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={tooltip}
    >
      <Icon className="w-4 h-4" />
    </motion.button>
  );
}

export default function UserPanel({
  profile,
  isMuted,
  isDeafened,
  onToggleMute,
  onToggleDeafen,
  onOpenSettings,
  onOpenProfile,
  onStatusChange,
  onLogout,
  isPremium,
}) {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <motion.div 
      className="relative bg-gradient-to-r from-[#0f0f11] to-[#0a0a0c] border-t border-white/[0.04]"
      layout
    >
      {/* Premium shimmer effect */}
      {isPremium && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      )}
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-white/[0.04]"
          >
            <div className="p-3 space-y-2">
              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider px-1">Set Status</p>
              {statusOptions.map((status) => (
                <motion.button
                  key={status.id}
                  onClick={() => {
                    onStatusChange?.(status.id);
                    setExpanded(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                    profile?.status === status.id 
                      ? 'bg-white/[0.08] text-white' 
                      : 'text-zinc-400 hover:bg-white/[0.04] hover:text-white'
                  )}
                  whileHover={{ x: 2 }}
                >
                  <StatusDot status={status.id} />
                  <span className="font-medium">{status.label}</span>
                  {profile?.status === status.id && (
                    <motion.div 
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500"
                      layoutId="activeStatus"
                    />
                  )}
                </motion.button>
              ))}
              
              <div className="h-px bg-white/[0.06] my-2" />
              
              <motion.button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                whileHover={{ x: 2 }}
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Log Out</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="h-[52px] px-2 flex items-center gap-2">
        {/* User info */}
        <motion.button 
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2.5 flex-1 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors min-w-0 group"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="relative">
            <Avatar
              src={profile?.avatar_url}
              name={profile?.display_name}
              size="sm"
            />
            <div className="absolute -bottom-0.5 -right-0.5 p-[2px] bg-[#0a0a0c] rounded-full">
              <StatusDot status={profile?.status || 'online'} size="xs" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-white truncate">
                {profile?.display_name || 'User'}
              </p>
              {isPremium && (
                <Sparkles className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-zinc-500 truncate">
              @{profile?.username || 'user'}
            </p>
          </div>
          
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            className="text-zinc-500 group-hover:text-zinc-300"
          >
            <ChevronUp className="w-4 h-4" />
          </motion.div>
        </motion.button>
        
        {/* Controls */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.02]">
          <ControlButton
            icon={isMuted ? MicOff : Mic}
            isActive={!isMuted}
            variant={isMuted ? 'danger' : 'default'}
            onClick={onToggleMute}
            tooltip={isMuted ? 'Unmute' : 'Mute'}
          />
          <ControlButton
            icon={isDeafened ? HeadphoneOff : Headphones}
            isActive={!isDeafened}
            variant={isDeafened ? 'danger' : 'default'}
            onClick={onToggleDeafen}
            tooltip={isDeafened ? 'Undeafen' : 'Deafen'}
          />
          <div className="w-px h-4 bg-white/[0.08]" />
          <ControlButton
            icon={Settings}
            onClick={onOpenSettings}
            tooltip="Settings"
          />
        </div>
      </div>
    </motion.div>
  );
}