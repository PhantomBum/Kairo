import React from 'react';
import { motion } from 'framer-motion';
import { X, Download, ExternalLink } from 'lucide-react';

export default function ImageLightbox({ src, filename, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-8"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={onClose}>
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <a href={src} target="_blank" rel="noopener noreferrer"
          className="p-2 rounded-lg transition-colors hover:bg-white/10"
          onClick={e => e.stopPropagation()}>
          <ExternalLink className="w-5 h-5 text-white/70" />
        </a>
        <a href={src} download={filename}
          className="p-2 rounded-lg transition-colors hover:bg-white/10"
          onClick={e => e.stopPropagation()}>
          <Download className="w-5 h-5 text-white/70" />
        </a>
        <button onClick={onClose} className="p-2 rounded-lg transition-colors hover:bg-white/10">
          <X className="w-5 h-5 text-white/70" />
        </button>
      </div>
      <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }}
        src={src} alt={filename}
        className="max-w-full max-h-full object-contain rounded-lg"
        onClick={e => e.stopPropagation()} />
    </motion.div>
  );
}