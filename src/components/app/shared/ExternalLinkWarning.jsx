import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, X, AlertTriangle } from 'lucide-react';
import { colors, shadows, animation } from '@/components/app/design/tokens';

export default function ExternalLinkWarning({ url, onConfirm, onCancel }) {
  const [dontShow, setDontShow] = useState(false);
  const domain = (() => { try { return new URL(url).hostname; } catch { return url; } })();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        transition={animation.easing.spring}
        className="rounded-xl overflow-hidden w-full max-w-[420px]"
        style={{ background: colors.bg.modal, border: `1px solid ${colors.border.light}`, boxShadow: shadows.strong }}
        onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${colors.border.default}` }}>
          <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: colors.warning }} />
          <h2 className="text-[16px] font-semibold" style={{ color: colors.text.primary }}>Leaving Kairo</h2>
          <button onClick={onCancel} className="ml-auto w-8 h-8 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)]">
            <X className="w-[18px] h-[18px]" style={{ color: colors.text.muted }} />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <p className="text-[14px]" style={{ color: colors.text.secondary }}>You are about to visit an external website. Make sure you trust this link before continuing.</p>
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg overflow-hidden" style={{ background: colors.bg.base }}>
            <ExternalLink className="w-4 h-4 flex-shrink-0" style={{ color: colors.text.disabled }} />
            <span className="text-[13px] truncate" style={{ color: colors.text.link }}>{url}</span>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={dontShow} onChange={e => setDontShow(e.target.checked)}
              className="w-4 h-4 rounded accent-current" style={{ accentColor: colors.accent.primary }} />
            <span className="text-[13px]" style={{ color: colors.text.muted }}>Don't warn me again</span>
          </label>
          <div className="flex gap-3 pt-1">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-lg text-[14px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.06)]"
              style={{ color: colors.text.secondary, background: colors.bg.elevated }}>Cancel</button>
            <button onClick={() => onConfirm(dontShow)} className="flex-1 py-2.5 rounded-lg text-[14px] font-semibold transition-all hover:brightness-110"
              style={{ background: colors.accent.primary, color: '#fff' }}>Continue</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}