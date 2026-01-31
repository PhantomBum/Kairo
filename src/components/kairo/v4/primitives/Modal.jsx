import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[90vw]',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  icon,
  children,
  size = 'md',
  showClose = true,
  closeOnOverlay = true,
  closeOnEscape = true,
  footer,
  className,
}) {
  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape' && closeOnEscape) {
      onClose?.();
    }
  }, [closeOnEscape, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={closeOnOverlay ? onClose : undefined}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 400 }}
          className={cn(
            'relative w-full bg-[#0f0f11] rounded-xl shadow-2xl',
            'border border-white/[0.08] overflow-hidden',
            sizes[size],
            className
          )}
        >
          {/* Header */}
          {(title || showClose) && (
            <div className="flex items-start justify-between p-5 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    {icon}
                  </div>
                )}
                <div>
                  {title && (
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                  )}
                  {description && (
                    <p className="text-sm text-zinc-500 mt-0.5">{description}</p>
                  )}
                </div>
              </div>
              {showClose && (
                <button
                  onClick={onClose}
                  className="p-2 -m-2 text-zinc-500 hover:text-white hover:bg-white/[0.04] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-5 max-h-[70vh] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/[0.06] bg-white/[0.02]">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}