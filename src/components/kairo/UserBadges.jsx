import React from 'react';
import { Crown, Shield, CheckCircle, Sparkles, Bug, Youtube } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const badgeConfig = {
  premium: {
    icon: Crown,
    color: 'text-amber-400',
    label: 'Premium User',
    bg: 'bg-amber-500/10'
  },
  youtube: {
    icon: Youtube,
    color: 'text-red-500',
    label: 'YouTube Creator',
    bg: 'bg-red-500/10'
  },
  verified: {
    icon: CheckCircle,
    color: 'text-blue-500',
    label: 'Verified',
    bg: 'bg-blue-500/10'
  },
  partner: {
    icon: Sparkles,
    color: 'text-purple-500',
    label: 'Partner',
    bg: 'bg-purple-500/10'
  },
  early_supporter: {
    icon: Shield,
    color: 'text-emerald-500',
    label: 'Early Supporter',
    bg: 'bg-emerald-500/10'
  },
  bug_hunter: {
    icon: Bug,
    color: 'text-lime-500',
    label: 'Bug Hunter',
    bg: 'bg-lime-500/10'
  }
};

export default function UserBadges({ badges = [], size = 'sm', showYoutube = false, youtubeUrl = null, className }) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (!badges || badges.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {badges.map((badge) => {
        const config = badgeConfig[badge];
        if (!config) return null;

        const Icon = config.icon;

        return (
          <TooltipProvider key={badge} delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={cn(
                  "flex items-center justify-center rounded-full p-0.5",
                  config.bg
                )}>
                  <Icon className={cn(sizeClasses[size], config.color)} />
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-900 border-zinc-800">
                <p className="text-white">{config.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}

      {showYoutube && youtubeUrl && badges.includes('youtube') && (
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-full p-0.5 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Youtube className={cn(sizeClasses[size], 'text-red-500')} />
              </a>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-900 border-zinc-800">
              <p className="text-white">Visit YouTube Channel</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}