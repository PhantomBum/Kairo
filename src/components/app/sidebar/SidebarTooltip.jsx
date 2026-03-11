import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, shadows } from '@/components/app/design/tokens';

export default function SidebarTooltip({ text, visible }) {
  return (
    <AnimatePresence>
      {visible && text && (
        <motion.div
          initial={{ opacity: 0, x: -6, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -6, scale: 0.95 }}
          transition={{ duration: 0.12, ease: [0, 0, 0.2, 1] }}
          className="absolute left-[66px] z-[60] px-3 py-1.5 rounded-lg text-[13px] font-semibold whitespace-nowrap pointer-events-none"
          style={{ background: colors.bg.modal, color: colors.text.primary, boxShadow: shadows.medium, border: `1px solid ${colors.border.light}` }}
        >
          {text}
          <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45"
            style={{ background: colors.bg.modal, borderLeft: `1px solid ${colors.border.light}`, borderBottom: `1px solid ${colors.border.light}` }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}