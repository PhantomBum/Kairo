import React from 'react';
import { cn } from '@/lib/utils';

// Main app layout shell - provides consistent structure
export default function AppShell({ 
  sidebar, 
  secondarySidebar, 
  header, 
  children, 
  rightPanel,
  footer,
  className 
}) {
  return (
    <div className={cn('h-screen flex bg-[#09090b] overflow-hidden', className)}>
      {/* Primary sidebar (server list) */}
      {sidebar}
      
      {/* Secondary sidebar (channels/DMs) */}
      {secondarySidebar && (
        <div className="flex flex-col border-r border-white/[0.04]">
          {secondarySidebar}
        </div>
      )}
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        {header}
        
        {/* Content + right panel */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          <main className="flex-1 flex flex-col min-w-0">
            {children}
          </main>
          
          {/* Right panel (members list, etc) */}
          {rightPanel}
        </div>
        
        {/* Footer */}
        {footer}
      </div>
    </div>
  );
}

// Panel component for consistent sidebar styling
export function Panel({ children, className, width = 240 }) {
  return (
    <div 
      className={cn('flex flex-col h-full bg-[#0a0a0b]', className)}
      style={{ width }}
    >
      {children}
    </div>
  );
}

// Panel header
export function PanelHeader({ children, className }) {
  return (
    <div className={cn(
      'h-12 px-4 flex items-center border-b border-white/[0.04]',
      'flex-shrink-0',
      className
    )}>
      {children}
    </div>
  );
}

// Panel content with scroll
export function PanelContent({ children, className }) {
  return (
    <div className={cn(
      'flex-1 overflow-y-auto scrollbar-thin',
      className
    )}>
      {children}
    </div>
  );
}

// Panel footer (user bar, etc)
export function PanelFooter({ children, className }) {
  return (
    <div className={cn(
      'flex-shrink-0 border-t border-white/[0.04]',
      className
    )}>
      {children}
    </div>
  );
}