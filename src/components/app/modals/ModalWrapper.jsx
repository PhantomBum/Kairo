import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function ModalWrapper({ title, onClose, width = 440, children }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        className="rounded-2xl overflow-hidden"
        style={{ width: `min(${width}px, 95vw)`, maxHeight: '85vh', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg), 0 0 80px rgba(0,0,0,0.5)', backdropFilter: 'blur(24px)' }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-[var(--bg-glass-hover)] transition-colors">
            <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 60px)' }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}