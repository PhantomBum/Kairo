import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ContextMenu({ children, items }) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);

  const handleContextMenu = (e) => {
    e.preventDefault();
    const x = e.clientX;
    const y = e.clientY;
    
    // Adjust position to keep menu in viewport
    const menuWidth = 200;
    const menuHeight = items.length * 36;
    
    setPosition({
      x: x + menuWidth > window.innerWidth ? x - menuWidth : x,
      y: y + menuHeight > window.innerHeight ? y - menuHeight : y,
    });
    setIsOpen(true);
  };

  useEffect(() => {
    const handleClick = () => setIsOpen(false);
    const handleEscape = (e) => e.key === 'Escape' && setIsOpen(false);
    
    if (isOpen) {
      document.addEventListener('click', handleClick);
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      <div onContextMenu={handleContextMenu}>
        {children}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="fixed z-50 min-w-[180px] p-1.5 bg-[#111113] border border-white/[0.08] rounded-lg shadow-xl"
            style={{ left: position.x, top: position.y }}
          >
            {items.map((item, i) => (
              item.separator ? (
                <div key={i} className="h-px bg-white/[0.06] my-1.5" />
              ) : (
                <button
                  key={i}
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  disabled={item.disabled}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors',
                    'disabled:opacity-50 disabled:pointer-events-none',
                    item.danger 
                      ? 'text-red-400 hover:bg-red-500/10' 
                      : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                  )}
                >
                  {item.icon && <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>}
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.shortcut && (
                    <span className="text-xs text-zinc-600">{item.shortcut}</span>
                  )}
                </button>
              )
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}