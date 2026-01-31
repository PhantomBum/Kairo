import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Headphones, Settings, Circle, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../ui/Avatar';
import Tooltip from '../ui/Tooltip';
import { statusConfig } from '../theme';

function StatusMenu({ currentStatus, onStatusChange, onClose }) {
  const statuses = ['online', 'idle', 'dnd', 'invisible'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className="absolute bottom-full left-0 mb-2 w-48 p-1.5 bg-[#111113] border border-white/[0.08] rounded-lg shadow-xl"
    >
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => {
            onStatusChange(status);
            onClose();
          }}
          className={cn(
            'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors',
            currentStatus === status 
              ? 'bg-white/[0.08] text-white' 
              : 'text-zinc-300 hover:bg-white/[0.06]'
          )}
        >
          <Circle 
            className="w-3 h-3" 
            fill={statusConfig[status].color} 
            stroke={statusConfig[status].color}
          />
          {statusConfig[status].label}
        </button>
      ))}
    </motion.div>
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
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  return (
    <div className="h-14 px-2 bg-[#0a0a0b] border-t border-white/[0.06] flex items-center gap-2">
      {/* User info */}
      <div className="relative">
        <button
          onClick={() => setShowStatusMenu(!showStatusMenu)}
          className="flex items-center gap-2 p-1 rounded-md hover:bg-white/[0.06] transition-colors"
        >
          <Avatar
            src={profile?.avatar_url}
            name={profile?.display_name}
            status={profile?.status || 'online'}
            size="sm"
          />
          <div className="text-left">
            <p className="text-sm font-medium text-white truncate max-w-[80px]">
              {profile?.display_name || 'User'}
            </p>
            <p className="text-[10px] text-zinc-500">
              {statusConfig[profile?.status || 'online']?.label}
            </p>
          </div>
        </button>
        
        <AnimatePresence>
          {showStatusMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowStatusMenu(false)} />
              <StatusMenu
                currentStatus={profile?.status || 'online'}
                onStatusChange={onStatusChange}
                onClose={() => setShowStatusMenu(false)}
              />
            </>
          )}
        </AnimatePresence>
      </div>
      
      {/* Controls */}
      <div className="flex-1 flex items-center justify-end gap-1">
        <Tooltip content={isMuted ? 'Unmute' : 'Mute'}>
          <button
            onClick={onToggleMute}
            className={cn(
              'w-8 h-8 rounded-md flex items-center justify-center transition-colors',
              isMuted 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
            )}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </Tooltip>
        
        <Tooltip content={isDeafened ? 'Undeafen' : 'Deafen'}>
          <button
            onClick={onToggleDeafen}
            className={cn(
              'w-8 h-8 rounded-md flex items-center justify-center transition-colors',
              isDeafened 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'
            )}
          >
            {isDeafened ? <VolumeX className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
          </button>
        </Tooltip>
        
        <Tooltip content="Settings">
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-md flex items-center justify-center text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
}