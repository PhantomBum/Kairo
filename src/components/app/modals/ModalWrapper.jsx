import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { colors, shadows } from '@/components/app/design/tokens';

export default function ModalWrapper({ title, subtitle, onClose, width = 460, children, danger, hideTitle }) {
  React.useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}>
      <motion.div
        initial={{ scale: 0.97, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.98, opacity: 0, y: 4 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl overflow-hidden w-full relative"
        style={{
          maxWidth: `min(${width}px, calc(100vw - 32px))`,
          maxHeight: 'min(85vh, calc(100vh - 32px))',
          background: colors.bg.surface,
          border: `1px solid ${colors.border.light}`,
          boxShadow: shadows.strong,
        }}
        onClick={e => e.stopPropagation()}>

        {!hideTitle && (
          <div className="flex items-start justify-between px-6 pt-5 pb-0">
            <div className="min-w-0 flex-1">
              {title && <h2 className="text-[17px] font-semibold" style={{ color: danger ? colors.danger : colors.text.primary }}>{title}</h2>}
              {subtitle && <p className="text-[13px] mt-0.5" style={{ color: colors.text.disabled }}>{subtitle}</p>}
            </div>
            <button onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg flex-shrink-0 ml-3 hover:bg-[rgba(255,255,255,0.06)] -mt-0.5"
              aria-label="Close dialog">
              <X className="w-4 h-4" style={{ color: colors.text.disabled }} />
            </button>
          </div>
        )}

        {hideTitle && (
          <button onClick={onClose}
            className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.08)]"
            aria-label="Close dialog">
            <X className="w-4 h-4" style={{ color: colors.text.muted }} />
          </button>
        )}

        <div className={`${hideTitle ? 'px-6 py-6' : 'px-6 pb-6 pt-4'} overflow-y-auto scrollbar-none`}
          style={{ maxHeight: hideTitle ? 'calc(min(85vh, calc(100vh - 32px)))' : 'calc(min(85vh, calc(100vh - 32px)) - 52px)' }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}