import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Crown, Shield, Youtube, Sparkles, Bug, Code, 
  Star, Award, CheckCircle, Zap 
} from 'lucide-react';

const badgeConfig = {
  owner: {
    icon: Crown,
    label: 'Owner',
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    iconColor: 'text-amber-400',
  },
  admin: {
    icon: Shield,
    label: 'Admin',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
    iconColor: 'text-red-400',
  },
  moderator: {
    icon: Shield,
    label: 'Moderator',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    iconColor: 'text-blue-400',
  },
  premium: {
    icon: Sparkles,
    label: 'Premium',
    className: 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border-pink-500/30',
    iconColor: 'text-pink-400',
  },
  verified: {
    icon: CheckCircle,
    label: 'Verified',
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    iconColor: 'text-emerald-400',
  },
  youtube: {
    icon: Youtube,
    label: 'YouTube',
    className: 'bg-red-500/20 text-red-400 border-red-500/30',
    iconColor: 'text-red-500',
  },
  early_supporter: {
    icon: Star,
    label: 'Early Supporter',
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    iconColor: 'text-amber-400',
  },
  bug_hunter: {
    icon: Bug,
    label: 'Bug Hunter',
    className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    iconColor: 'text-emerald-400',
  },
  developer: {
    icon: Code,
    label: 'Developer',
    className: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    iconColor: 'text-indigo-400',
  },
  partner: {
    icon: Zap,
    label: 'Partner',
    className: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    iconColor: 'text-violet-400',
  },
};

export function Badge({ type, size = 'sm', showLabel = false, className }) {
  const config = badgeConfig[type];
  if (!config) return null;
  
  const Icon = config.icon;
  const iconSizes = { xs: 'w-3 h-3', sm: 'w-3.5 h-3.5', md: 'w-4 h-4' };
  
  if (!showLabel) {
    return (
      <div 
        className={cn(
          'inline-flex items-center justify-center rounded-full',
          size === 'xs' && 'w-4 h-4',
          size === 'sm' && 'w-5 h-5',
          size === 'md' && 'w-6 h-6',
          config.className,
          'border',
          className
        )}
        title={config.label}
      >
        <Icon className={cn(iconSizes[size], config.iconColor)} />
      </div>
    );
  }
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        config.className,
        className
      )}
    >
      <Icon className={cn('w-3 h-3', config.iconColor)} />
      {config.label}
    </span>
  );
}

export function BadgeGroup({ badges = [], size = 'sm', max = 4, className }) {
  if (!badges?.length) return null;
  
  const visibleBadges = badges.slice(0, max);
  const remaining = badges.length - max;
  
  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {visibleBadges.map((badge, i) => (
        <Badge key={i} type={badge} size={size} />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-zinc-500 ml-1">+{remaining}</span>
      )}
    </div>
  );
}

export default Badge;