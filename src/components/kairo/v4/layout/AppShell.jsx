import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Main app layout shell - provides consistent structure with next-gen styling
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
    <div className={cn('h-screen flex overflow-hidden relative', className)}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-[#09090b]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[150px]" />
      </div>
      
      {/* Content layer */}
      <div className="relative flex w-full h-full">
        {/* Primary sidebar (server list) */}
        {sidebar}
        
        {/* Secondary sidebar (channels/DMs) */}
        {secondarySidebar && (
          <div className="flex flex-col relative">
            <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-white/[0.08] via-white/[0.04] to-white/[0.08]" />
            {secondarySidebar}
          </div>
        )}
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          {header}
          
          {/* Content + right panel */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <main className="flex-1 flex flex-col min-w-0 relative">
              {/* Subtle inner glow */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/[0.02] to-transparent" />
              </div>
              {children}
            </main>
            
            {/* Right panel (members list, etc) */}
            {rightPanel}
          </div>
          
          {/* Footer */}
          {footer}
        </div>
      </div>
    </div>
  );
}

// Panel component with glass morphism styling
export function Panel({ children, className, width = 240 }) {
  return (
    <div 
      className={cn(
        'flex flex-col h-full relative',
        'bg-gradient-to-b from-[#0c0c0e]/95 to-[#0a0a0c]/95',
        'backdrop-blur-xl',
        className
      )}
      style={{ width }}
    >
      {/* Glass reflection effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/[0.03] to-transparent rotate-12" />
      </div>
      <div className="relative flex flex-col h-full">
        {children}
      </div>
    </div>
  );
}

// Panel header with improved styling
export function PanelHeader({ children, className }) {
  return (
    <div className={cn(
      'px-4 py-3 flex items-center',
      'border-b border-white/[0.06]',
      'bg-gradient-to-r from-white/[0.02] to-transparent',
      'flex-shrink-0',
      className
    )}>
      {children}
    </div>
  );
}

// Panel content with scroll and fade effects
export function PanelContent({ children, className }) {
  return (
    <div className={cn(
      'flex-1 overflow-y-auto',
      'scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent',
      className
    )}>
      {children}
    </div>
  );
}

// Panel footer
export function PanelFooter({ children, className }) {
  return (
    <div className={cn(
      'flex-shrink-0',
      'border-t border-white/[0.06]',
      'bg-gradient-to-r from-white/[0.02] to-transparent',
      className
    )}>
      {children}
    </div>
  );
}