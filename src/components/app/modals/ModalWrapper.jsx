import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { colors, shadows, radius, animation } from '@/components/app/design/tokens';

export default function ModalWrapper({ title, subtitle, onClose, width = 460, children, danger }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={animation.easing.spring}
        className="rounded-xl overflow-hidden"
        style={{
          width: `min(${width}px, 95vw)`,
          maxHeight: '85vh',
          background: colors.bg.modal,
          border: `1px solid ${colors.border.light}`,
          boxShadow: shadows.strong,
        }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${colors.border.default}` }}>
          <div>
            <h2 className="text-[16px] font-semibold" style={{ color: danger ? colors.danger : colors.text.primary }}>{title}</h2>
            {subtitle && <p className="text-[13px] mt-0.5" style={{ color: colors.text.muted }}>{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-md transition-colors hover:bg-[rgba(255,255,255,0.06)]">
            <X className="w-[18px] h-[18px]" style={{ color: colors.text.muted }} />
          </button>
        </div>
        {/* Body */}
        <div className="px-5 py-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 64px)' }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}