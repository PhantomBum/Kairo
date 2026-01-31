import React from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const variants = {
  ghost: 'hover:bg-white/[0.06] text-zinc-400 hover:text-white',
  subtle: 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white',
  solid: 'bg-indigo-600 hover:bg-indigo-500 text-white',
  danger: 'hover:bg-red-500/10 text-zinc-400 hover:text-red-400',
  success: 'hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-400',
};

const sizes = {
  xs: 'w-6 h-6',
  sm: 'w-7 h-7',
  md: 'w-8 h-8',
  lg: 'w-9 h-9',
  xl: 'w-10 h-10',
};

const iconSizes = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-5 h-5',
};

export default function IconButton({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  tooltip,
  className,
  disabled,
  active,
  badge,
  ...props
}) {
  const button = (
    <button
      className={cn(
        'relative inline-flex items-center justify-center rounded-lg',
        'transition-all duration-150',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500/40',
        'disabled:opacity-50 disabled:pointer-events-none',
        active && 'bg-white/[0.08] text-white',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {Icon && <Icon className={iconSizes[size]} />}
      
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-[10px] font-medium text-white flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );

  if (tooltip) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="bg-[#1a1a1c] border-white/[0.08] text-zinc-200 text-xs px-2 py-1"
          >
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}