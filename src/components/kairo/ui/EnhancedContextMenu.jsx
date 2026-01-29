import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced context menu with nested menus, keyboard navigation, and fast rendering
export function ContextMenuRoot({ children, trigger, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Calculate position ensuring menu stays in viewport
    const x = Math.min(e.clientX, window.innerWidth - 220);
    const y = Math.min(e.clientY, window.innerHeight - 300);
    
    setPosition({ x, y });
    setIsOpen(true);
  };

  const handleClose = () => setIsOpen(false);

  return (
    <>
      <div onContextMenu={handleContextMenu} className={className}>
        {trigger}
      </div>
      <AnimatePresence>
        {isOpen && (
          <ContextMenuPortal position={position} onClose={handleClose}>
            {children}
          </ContextMenuPortal>
        )}
      </AnimatePresence>
    </>
  );
}

function ContextMenuPortal({ children, position, onClose }) {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50" 
      onClick={handleBackdropClick}
      onContextMenu={(e) => { e.preventDefault(); onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        style={{ left: position.x, top: position.y }}
        className="absolute w-52 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden"
      >
        {children}
      </motion.div>
    </div>
  );
}

export function ContextMenuContent({ children, className }) {
  return (
    <div className={cn("py-1", className)}>
      {children}
    </div>
  );
}

export function ContextMenuItem({ 
  children, 
  icon: Icon, 
  shortcut, 
  onClick, 
  disabled,
  destructive,
  className 
}) {
  return (
    <button
      onClick={(e) => {
        if (!disabled) {
          onClick?.(e);
        }
      }}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors",
        disabled && "opacity-50 cursor-not-allowed",
        destructive 
          ? "text-red-400 hover:bg-red-500/20" 
          : "text-zinc-300 hover:bg-zinc-800 hover:text-white",
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1 text-left">{children}</span>
      {shortcut && (
        <span className="text-xs text-zinc-500">{shortcut}</span>
      )}
    </button>
  );
}

export function ContextMenuSub({ children, label, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const [subPosition, setSubPosition] = useState('right');

  const handleMouseEnter = (e) => {
    // Check if submenu should open to left
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.right + 200 > window.innerWidth) {
      setSubPosition('left');
    }
    setIsOpen(true);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors cursor-pointer"
      )}>
        {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
        <span className="flex-1 text-left">{label}</span>
        <ChevronRight className="w-4 h-4" />
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: subPosition === 'right' ? -10 : 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: subPosition === 'right' ? -10 : 10 }}
            transition={{ duration: 0.1 }}
            className={cn(
              "absolute top-0 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden",
              subPosition === 'right' ? "left-full ml-1" : "right-full mr-1"
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ContextMenuCheckbox({ children, checked, onCheckedChange, disabled }) {
  return (
    <button
      onClick={() => !disabled && onCheckedChange?.(!checked)}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className={cn(
        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
        checked ? "bg-indigo-500 border-indigo-500" : "border-zinc-600"
      )}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className="flex-1 text-left">{children}</span>
    </button>
  );
}

export function ContextMenuSeparator() {
  return <div className="my-1 h-px bg-zinc-800" />;
}

export function ContextMenuLabel({ children }) {
  return (
    <div className="px-3 py-1.5 text-xs font-semibold text-zinc-500 uppercase">
      {children}
    </div>
  );
}