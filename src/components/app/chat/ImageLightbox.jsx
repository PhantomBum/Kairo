import React from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, Download } from 'lucide-react';

export default function ImageLightbox({ src, filename, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10" onClick={e => e.stopPropagation()}>
        <a href={src} target="_blank" rel="noopener noreferrer" className="p-2 rounded-xl glass hover:bg-[var(--bg-glass-hover)]"><ExternalLink className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /></a>
        <a href={src} download={filename} className="p-2 rounded-xl glass hover:bg-[var(--bg-glass-hover)]"><Download className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /></a>
        <button onClick={onClose} className="p-2 rounded-xl glass hover:bg-[var(--bg-glass-hover)]"><X className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} /></button>
      </div>
      <motion.img initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        src={src} className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain" style={{ boxShadow: 'var(--shadow-lg)' }}
        onClick={e => e.stopPropagation()} />
    </motion.div>
  );
}