import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Copy, Pin, Bookmark, Forward, Trash2, Pencil, Reply, Smile } from 'lucide-react';

const P = {
  bg: '#2e2e37', surface: '#26262d', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', danger: '#f87171',
};

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

function ActionRow({ icon: Icon, label, onClick, danger }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-3 w-full px-4 active:bg-[rgba(255,255,255,0.04)]"
      style={{ height: 48, minHeight: 48, color: danger ? P.danger : P.textPrimary, WebkitTapHighlightColor: 'transparent' }}>
      <Icon className="w-5 h-5 flex-shrink-0" style={{ color: danger ? P.danger : P.muted }} />
      <span className="text-[15px]">{label}</span>
    </button>
  );
}

export default function MobileActionSheet({ message, isOwn, onClose, onReact, onReply, onEdit, onPin, onStar, onCopy, onForward, onDelete }) {
  const sheetRef = useRef(null);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);
  const dragging = useRef(false);

  const handleDragStart = useCallback((e) => {
    startY.current = e.touches[0].clientY;
    dragging.current = true;
  }, []);

  const handleDragMove = useCallback((e) => {
    if (!dragging.current) return;
    const dy = e.touches[0].clientY - startY.current;
    setDragY(Math.max(0, dy));
  }, []);

  const handleDragEnd = useCallback(() => {
    dragging.current = false;
    if (dragY > 80) { onClose(); }
    setDragY(0);
  }, [dragY, onClose]);

  useEffect(() => {
    const esc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [onClose]);

  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60]"
        style={{ background: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}>

        <motion.div ref={sheetRef}
          initial={{ y: '100%' }} animate={{ y: dragY }} exit={{ y: '100%' }}
          transition={dragging.current ? { duration: 0 } : { type: 'spring', damping: 30, stiffness: 400 }}
          className="absolute bottom-0 left-0 right-0 rounded-t-2xl overflow-hidden"
          style={{
            background: P.bg,
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
            maxHeight: '70vh',
          }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleDragStart} onTouchMove={handleDragMove} onTouchEnd={handleDragEnd}>

          {/* Drag handle */}
          <div className="flex justify-center py-3">
            <div className="w-9 h-1 rounded-full" style={{ background: P.muted }} />
          </div>

          {/* Quick reactions */}
          <div className="flex items-center justify-center gap-2 px-4 pb-3">
            {QUICK_EMOJIS.map(emoji => (
              <button key={emoji} onClick={() => { onReact?.(message, emoji); onClose(); }}
                className="w-11 h-11 rounded-xl flex items-center justify-center text-[20px] active:scale-90 transition-transform"
                style={{ background: P.surface, minWidth: 44, minHeight: 44 }}>
                {emoji}
              </button>
            ))}
          </div>

          <div className="h-px mx-3" style={{ background: P.border }} />

          {/* Action rows */}
          <div className="py-1 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 120px)' }}>
            <ActionRow icon={Smile} label="React" onClick={() => { onReact?.(message); onClose(); }} />
            <ActionRow icon={Reply} label="Reply" onClick={() => { onReply?.(message); onClose(); }} />
            {isOwn && <ActionRow icon={Pencil} label="Edit" onClick={() => { onEdit?.(message); onClose(); }} />}
            <ActionRow icon={Pin} label={message.is_pinned ? 'Unpin' : 'Pin'} onClick={() => { onPin?.(message); onClose(); }} />
            <ActionRow icon={Bookmark} label="Bookmark" onClick={() => { onStar?.(message); onClose(); }} />
            <ActionRow icon={Copy} label="Copy Text" onClick={() => { navigator.clipboard.writeText(message.content || ''); onClose(); }} />
            <ActionRow icon={Forward} label="Forward" onClick={() => { onForward?.(message); onClose(); }} />
            {isOwn && (
              <ActionRow icon={Trash2} label="Delete" danger onClick={() => { onDelete?.(message); onClose(); }} />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
