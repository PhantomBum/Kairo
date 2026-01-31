import React from 'react';
import {
  Tooltip as TooltipRoot,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Tooltip({ 
  children, 
  content, 
  side = 'top',
  delayDuration = 200,
}) {
  if (!content) return children;

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipRoot>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          side={side}
          className="bg-[#111113] border-white/[0.08] text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-xl"
        >
          {content}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}