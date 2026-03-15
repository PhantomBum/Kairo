import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { colors, shadows, radius } from '@/components/app/design/tokens';

const SIZE_MAP = { small: 440, medium: 560, large: 800 };

export default function ModalWrapper({ title, subtitle, onClose, width = 460, children, danger, hideTitle }) {
  const panelRef = React.useRef(null);
  const computedWidth = typeof width === 'string' ? (SIZE_MAP[width] || 460) : width;

  React.useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  React.useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = panel.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    if (focusable[0]) focusable[0].focus();
    const trap = (e) => {
      if (e.key !== 'Tab') return;
      const nodes = panel.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    panel.addEventListener('keydown', trap);
    return () => panel.removeEventListener('keydown', trap);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 flex items-center justify-center p-4 kairo-modal-backdrop"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 1000 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}>
      <motion.div
        initial={{ scale: 0.93, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.25, bounce: 0.2 }}
        ref={panelRef}
        className="overflow-hidden w-full relative mobile-sheet"
        style={{
          maxWidth: `min(${computedWidth}px, calc(100vw - 32px))`,
          maxHeight: 'min(90vh, calc(100vh - 32px))',
          background: colors.bg.float,
          border: `1px solid var(--border-medium)`,
          borderRadius: radius.xl,
          boxShadow: shadows.elevated,
        }}
        onClick={e => e.stopPropagation()}>

        {!hideTitle && (
          <div className="flex items-start justify-between pt-6 pb-0" style={{ paddingLeft: 24, paddingRight: 24 }}>
            <div className="min-w-0 flex-1">
              {title && <h2 className="text-[18px] font-semibold" style={{ color: danger ? colors.danger : colors.text.primary }}>{title}</h2>}
              {subtitle && <p className="text-[13px] mt-1" style={{ color: colors.text.muted }}>{subtitle}</p>}
            </div>
            <button onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-md flex-shrink-0 ml-3 hover:bg-[rgba(255,255,255,0.06)] -mt-0.5 transition-all duration-[120ms] ease-out active:scale-[0.93] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
              aria-label="Close dialog">
              <X className="w-4 h-4" style={{ color: colors.text.disabled }} />
            </button>
          </div>
        )}

        {hideTitle && (
          <button onClick={onClose}
            className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.08)] transition-all duration-[120ms] ease-out active:scale-[0.93] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
            aria-label="Close dialog">
            <X className="w-4 h-4" style={{ color: colors.text.muted }} />
          </button>
        )}

        <div className="overflow-y-auto scrollbar-none"
          style={{
            padding: 24,
            paddingTop: hideTitle ? 24 : 20,
            maxHeight: hideTitle ? 'calc(min(90vh, calc(100vh - 32px)))' : 'calc(min(90vh, calc(100vh - 32px)) - 52px)',
          }}>
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}