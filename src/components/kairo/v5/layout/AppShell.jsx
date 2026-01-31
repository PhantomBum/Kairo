import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// V5 App Shell - Immersive, fluid, premium
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
      {/* Multi-layered ambient background */}
      <div className="absolute inset-0 bg-[#050506]">
        {/* Primary gradient orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[100px]" />
        <div className="absolute top-[30%] right-[20%] w-[400px] h-[400px] bg-cyan-600/5 rounded-full blur-[80px]" />
        
        {/* Subtle noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Top edge highlight */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>
      
      {/* Content layer */}
      <div className="relative flex w-full h-full">
        {/* Primary sidebar */}
        {sidebar}
        
        {/* Secondary sidebar with separator */}
        {secondarySidebar && (
          <div className="flex flex-col relative">
            {secondarySidebar}
            <div className="absolute right-0 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />
          </div>
        )}
        
        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {header && (
            <div className="relative z-10">
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
              {header}
            </div>
          )}
          
          <div className="flex-1 flex min-h-0 overflow-hidden">
            <main className="flex-1 flex flex-col min-w-0 relative">
              {children}
            </main>
            
            {rightPanel && (
              <div className="relative">
                <div className="absolute left-0 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />
                {rightPanel}
              </div>
            )}
          </div>
          
          {footer}
        </div>
      </div>
    </div>
  );
}

// Glass panel component
export function Panel({ children, className, width = 240, variant = 'default' }) {
  const variants = {
    default: 'bg-[#0a0a0c]/80',
    elevated: 'bg-[#0c0c0e]/90',
    transparent: 'bg-transparent',
  };
  
  return (
    <div 
      className={cn(
        'flex flex-col h-full relative',
        'backdrop-blur-2xl',
        variants[variant],
        className
      )}
      style={{ width }}
    >
      {/* Subtle inner glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/[0.02] to-transparent" />
      </div>
      <div className="relative flex flex-col h-full">
        {children}
      </div>
    </div>
  );
}

// Panel header
export function PanelHeader({ children, className, title, actions }) {
  return (
    <div className={cn(
      'h-12 px-4 flex items-center justify-between flex-shrink-0',
      'bg-gradient-to-r from-white/[0.02] via-transparent to-white/[0.02]',
      className
    )}>
      {title ? (
        <>
          <h2 className="text-sm font-semibold text-white/90 tracking-wide">{title}</h2>
          {actions && <div className="flex items-center gap-1">{actions}</div>}
        </>
      ) : (
        children
      )}
    </div>
  );
}

// Panel content with optimized scrolling
export function PanelContent({ children, className, padding = true }) {
  return (
    <div className={cn(
      'flex-1 overflow-y-auto overflow-x-hidden',
      'scrollbar-thin scrollbar-thumb-white/5 hover:scrollbar-thumb-white/10 scrollbar-track-transparent',
      padding && 'p-2',
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
      'bg-[#0a0a0c]/60 backdrop-blur-xl',
      'border-t border-white/[0.04]',
      className
    )}>
      {children}
    </div>
  );
}

// Section header for lists
export function SectionHeader({ children, className, count }) {
  return (
    <div className={cn(
      'flex items-center justify-between px-3 py-2',
      className
    )}>
      <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
        {children}
      </span>
      {count !== undefined && (
        <span className="text-[10px] font-medium text-white/20">{count}</span>
      )}
    </div>
  );
}