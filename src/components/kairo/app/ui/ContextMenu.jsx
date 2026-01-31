import React from 'react';
import {
  ContextMenu as ContextMenuRoot,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from '@/lib/utils';

export function ContextMenu({ children, items = [] }) {
  if (!items.length) return children;

  return (
    <ContextMenuRoot>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56 bg-[#111113] border-white/[0.08] p-1">
        {items.map((item, i) => {
          if (item.separator) {
            return <ContextMenuSeparator key={i} className="bg-white/[0.06]" />;
          }

          return (
            <ContextMenuItem
              key={i}
              onClick={item.onClick}
              disabled={item.disabled}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-sm',
                'focus:bg-white/[0.06] focus:text-white',
                item.danger 
                  ? 'text-red-400 focus:text-red-400 focus:bg-red-500/10' 
                  : 'text-zinc-300'
              )}
            >
              {item.icon && (
                <span className={cn('w-4 h-4', item.danger ? 'text-red-400' : 'text-zinc-500')}>
                  {item.icon}
                </span>
              )}
              {item.label}
              {item.shortcut && (
                <span className="ml-auto text-xs text-zinc-600">{item.shortcut}</span>
              )}
            </ContextMenuItem>
          );
        })}
      </ContextMenuContent>
    </ContextMenuRoot>
  );
}