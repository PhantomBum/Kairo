import React from 'react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const variants = {
  ghost: 'text-zinc-400 hover:text-white hover:bg-white/[0.08]',
  subtle: 'bg-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.08]',
  solid: 'bg-indigo-600 hover:bg-indigo-500 text-white',
  danger: 'text-red-400 hover:text-red-300 hover:bg-red-500/10',
  success: 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10',
};

const sizes = {
  xs: 'w-6 h-6',
  sm: 'w-7 h-7',
  md: 'w-8 h-8',
  lg: 'w-9 h-9',
};

const iconSizes = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-[18px] h-[18px]',
  lg: 'w-5 h-5',
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
        'relative inline-flex items-center justify-center rounded-md',
        'transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50',
        'disabled:opacity-40 disabled:pointer-events-none',
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
        <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );

  if (tooltip) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent 
            side="top" 
            className="bg-[#1a1a1d] border-white/10 text-white text-xs px-2 py-1 shadow-xl"
          >
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}