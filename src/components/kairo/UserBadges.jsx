import React from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Badge configurations with colors and icons
const badgeConfigs = {
  owner: {
    label: 'Owner of Kairo',
    color: 'bg-gradient-to-r from-amber-500 to-orange-500',
    textColor: 'text-amber-500',
    icon: '👑'
  },
  admin: {
    label: 'Kairo Admin',
    color: 'bg-gradient-to-r from-red-500 to-rose-500',
    textColor: 'text-red-500',
    icon: '🛡️'
  },
  developer: {
    label: 'Kairo Developer',
    color: 'bg-gradient-to-r from-purple-500 to-violet-500',
    textColor: 'text-purple-500',
    icon: '⚡'
  },
  moderator: {
    label: 'Moderator',
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    textColor: 'text-blue-500',
    icon: '🔧'
  },
  premium: {
    label: 'Kairo Premium',
    color: 'bg-gradient-to-r from-emerald-500 to-teal-500',
    textColor: 'text-emerald-500',
    icon: '✨'
  },
  verified: {
    label: 'Verified',
    color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    textColor: 'text-blue-500',
    icon: '✓'
  },
  partner: {
    label: 'Kairo Partner',
    color: 'bg-gradient-to-r from-indigo-500 to-purple-500',
    textColor: 'text-indigo-500',
    icon: '🤝'
  },
  early_supporter: {
    label: 'Early Supporter',
    color: 'bg-gradient-to-r from-pink-500 to-rose-500',
    textColor: 'text-pink-500',
    icon: '❤️'
  },
  bug_hunter: {
    label: 'Bug Hunter',
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    textColor: 'text-green-500',
    icon: '🐛'
  },
  youtube: {
    label: 'YouTube Creator',
    color: 'bg-gradient-to-r from-red-600 to-red-500',
    textColor: 'text-red-500',
    icon: '▶'
  }
};

function Badge({ badge, size = 'sm' }) {
  const config = badgeConfigs[badge];
  if (!config) return null;

  const sizeClasses = {
    xs: 'w-3.5 h-3.5 text-[8px]',
    sm: 'w-4 h-4 text-[9px]',
    md: 'w-5 h-5 text-[10px]',
    lg: 'w-6 h-6 text-xs'
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "rounded-full flex items-center justify-center font-bold cursor-default",
              config.color,
              sizeClasses[size]
            )}
          >
            <span className="filter drop-shadow-sm">{config.icon}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="bg-[#111113] border-white/10 text-white text-xs px-2 py-1"
        >
          {config.label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function UserBadges({ badges = [], size = 'sm', maxBadges = 5 }) {
  if (!badges || badges.length === 0) return null;

  const displayBadges = badges.slice(0, maxBadges);
  const remainingCount = badges.length - maxBadges;

  return (
    <div className="flex items-center gap-0.5">
      {displayBadges.map((badge, idx) => (
        <Badge key={`${badge}-${idx}`} badge={badge} size={size} />
      ))}
      {remainingCount > 0 && (
        <span className="text-[10px] text-zinc-500 ml-0.5">+{remainingCount}</span>
      )}
    </div>
  );
}