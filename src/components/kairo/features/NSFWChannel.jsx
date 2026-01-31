import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Eye, EyeOff, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/kairo/v4/primitives/Button';

// NSFW gate for channels
export function NSFWGate({ channel, onConfirm, children }) {
  const [confirmed, setConfirmed] = useState(false);
  const [dontAskAgain, setDontAskAgain] = useState(false);

  // Check if user has previously confirmed for this channel
  React.useEffect(() => {
    const confirmedChannels = JSON.parse(localStorage.getItem('kairo_nsfw_confirmed') || '[]');
    if (confirmedChannels.includes(channel?.id)) {
      setConfirmed(true);
    }
  }, [channel?.id]);

  if (!channel?.is_nsfw || confirmed) {
    return children;
  }

  const handleConfirm = () => {
    if (dontAskAgain) {
      const confirmedChannels = JSON.parse(localStorage.getItem('kairo_nsfw_confirmed') || '[]');
      confirmedChannels.push(channel.id);
      localStorage.setItem('kairo_nsfw_confirmed', JSON.stringify(confirmedChannels));
    }
    setConfirmed(true);
    onConfirm?.();
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-[#09090b]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md text-center p-8"
      >
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        
        <h2 className="text-xl font-semibold text-white mb-3">
          Age-Restricted Channel
        </h2>
        
        <p className="text-sm text-zinc-400 mb-6">
          #{channel.name} is marked as NSFW (Not Safe For Work). 
          You must be 18 or older to view the content in this channel.
        </p>
        
        <div className="flex items-center justify-center gap-2 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={dontAskAgain}
              onChange={(e) => setDontAskAgain(e.target.checked)}
              className="w-4 h-4 rounded bg-white/[0.04] border-white/[0.1]"
            />
            <span className="text-sm text-zinc-400">Don't ask again for this channel</span>
          </label>
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button variant="ghost">
            Go Back
          </Button>
          <Button onClick={handleConfirm}>
            I am 18 or older
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

// NSFW badge for channel list
export function NSFWBadge({ className }) {
  return (
    <span className={cn(
      'px-1.5 py-0.5 text-[10px] font-medium rounded',
      'bg-red-500/20 text-red-400 border border-red-500/30',
      className
    )}>
      NSFW
    </span>
  );
}

// NSFW toggle in channel settings
export function NSFWToggle({ value, onChange, disabled }) {
  return (
    <div className={cn(
      'flex items-center justify-between p-4 rounded-lg',
      'bg-white/[0.02] border border-white/[0.06]',
      disabled && 'opacity-50'
    )}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">Age-Restricted Channel</p>
          <p className="text-xs text-zinc-500">
            Users must verify they are 18+ to view content
          </p>
        </div>
      </div>
      
      <button
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        className={cn(
          'relative w-11 h-6 rounded-full transition-colors',
          value ? 'bg-red-500' : 'bg-white/[0.1]'
        )}
      >
        <div className={cn(
          'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform',
          value ? 'translate-x-6' : 'translate-x-1'
        )} />
      </button>
    </div>
  );
}

// Server content filter settings
export const CONTENT_FILTER_OPTIONS = [
  { 
    value: 'disabled', 
    label: 'Don\'t scan any media content', 
    description: 'No explicit image filtering'
  },
  { 
    value: 'members_without_roles', 
    label: 'Scan media from members without a role',
    description: 'Recommended for most servers'
  },
  { 
    value: 'all_members', 
    label: 'Scan media from all members',
    description: 'Maximum protection'
  },
];