import React from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, Download } from 'lucide-react';
import { colors, shadows } from '@/components/app/design/tokens';

export default function ImageLightbox({ src, filename, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
      onKeyDown={e => { if (e.key === 'Escape') onClose(); }}>
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10" onClick={e => e.stopPropagation()}>
        <a href={src} target="_blank" rel="noopener noreferrer"
          className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.1)]"
          style={{ background: colors.bg.overlay, border: `1px solid ${colors.border.light}` }} title="Open in new tab">
          <ExternalLink className="w-4 h-4" style={{ color: colors.text.secondary }} />
        </a>
        <a href={src} download={filename}
          className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.1)]"
          style={{ background: colors.bg.overlay, border: `1px solid ${colors.border.light}` }} title="Download">
          <Download className="w-4 h-4" style={{ color: colors.text.secondary }} />
        </a>
        <button onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.1)]"
          style={{ background: colors.bg.overlay, border: `1px solid ${colors.border.light}` }} title="Close">
          <X className="w-4 h-4" style={{ color: colors.text.secondary }} />
        </button>
      </div>
      {filename && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg z-10" style={{ background: colors.bg.overlay, border: `1px solid ${colors.border.light}` }}>
          <span className="text-[13px] font-medium" style={{ color: colors.text.secondary }}>{filename}</span>
        </div>
      )}
      <motion.img initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        src={src} alt={filename || 'Image'} className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain" style={{ boxShadow: shadows.strong }}
        onClick={e => e.stopPropagation()} />
    </motion.div>
  );
}