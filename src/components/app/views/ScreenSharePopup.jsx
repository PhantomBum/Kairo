import React from 'react';
import { motion } from 'framer-motion';
import { Monitor, AlertTriangle, X } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

export default function ScreenSharePopup({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.15 }}
        className="w-[380px] rounded-xl overflow-hidden"
        style={{ background: colors.bg.modal, border: `1px solid ${colors.border.strong}`, boxShadow: '0 16px 64px rgba(0,0,0,0.7)' }}>

        {/* Header accent bar */}
        <div className="h-1" style={{ background: `linear-gradient(90deg, ${colors.accent.primary}, ${colors.danger})` }} />

        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(88,101,242,0.1)', border: `1px solid rgba(88,101,242,0.2)` }}>
              <Monitor className="w-7 h-7" style={{ color: colors.accent.primary }} />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-[16px] font-semibold text-center mb-2" style={{ color: colors.text.primary }}>
            Start Screen Sharing?
          </h3>

          {/* Description */}
          <p className="text-[13px] text-center leading-relaxed mb-5" style={{ color: colors.text.secondary }}>
            Everyone in this voice channel will be able to see your screen in real time.
          </p>

          {/* Warning */}
          <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg mb-5"
            style={{ background: 'rgba(250,166,26,0.08)', border: '1px solid rgba(250,166,26,0.15)' }}>
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: colors.warning }} />
            <span className="text-[12px] leading-relaxed" style={{ color: colors.text.secondary }}>
              Make sure you're not showing any personal info, passwords, or private content. Close anything you don't want others to see.
            </span>
          </div>

          {/* Buttons */}
          <div className="flex gap-2.5">
            <button onClick={onCancel}
              className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-colors hover:brightness-110"
              style={{ background: colors.bg.overlay, color: colors.text.secondary, border: `1px solid ${colors.border.default}` }}>
              Cancel
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-2 rounded-lg text-[13px] font-medium text-white transition-colors hover:brightness-110 flex items-center justify-center gap-2"
              style={{ background: colors.accent.primary }}>
              <Monitor className="w-3.5 h-3.5" />
              Go Live
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}