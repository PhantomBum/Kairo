import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { colors, shadows } from '@/components/app/design/tokens';

export default function ModalWrapper({ title, subtitle, onClose, width = 460, children, danger }) {
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
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}>
      <motion.div
        initial={{ scale: 0.96, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 4 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350, duration: 0.25 }}
        className="rounded-xl overflow-hidden w-full"
        style={{
          maxWidth: `min(${width}px, calc(100vw - 32px))`,
          maxHeight: 'min(85vh, calc(100vh - 32px))',
          background: colors.bg.modal,
          border: `1px solid ${colors.border.light}`,
          boxShadow: shadows.strong,
        }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${colors.border.default}` }}>
          <div className="min-w-0 flex-1">
            {title && <h2 className="text-[16px] font-semibold truncate" style={{ color: danger ? colors.danger : colors.text.primary }}>{title}</h2>}
            {subtitle && <p className="text-[13px] mt-0.5 truncate" style={{ color: colors.text.muted }}>{subtitle}</p>}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md flex-shrink-0 ml-3 hover:bg-[rgba(255,255,255,0.06)]"
            aria-label="Close dialog">
            <X className="w-[18px] h-[18px]" style={{ color: colors.text.muted }} />
          </button>
        </div>
        {/* Body */}
        <div className="px-5 py-5 overflow-y-auto scrollbar-none" style={{ maxHeight: 'calc(min(85vh, calc(100vh - 32px)) - 64px)' }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}