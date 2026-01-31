import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-4xl',
};

export default function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  showClose = true,
  className,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div 
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
        
        {/* Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', duration: 0.3 }}
          className={cn(
            'relative w-full bg-[#0f0f10] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden',
            sizes[size],
            className
          )}
        >
          {/* Header */}
          {(title || description) && (
            <div className="p-6 pb-0">
              {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
              {description && <p className="text-sm text-zinc-500 mt-1">{description}</p>}
            </div>
          )}
          
          {/* Body */}
          <div className="p-6">
            {children}
          </div>
          
          {/* Close button */}
          {showClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}