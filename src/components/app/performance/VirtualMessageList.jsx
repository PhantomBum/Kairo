import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { ArrowDown, Hash, MessageSquare } from 'lucide-react';
import MessageBubble from '@/components/app/chat/MessageBubble';
import ImageLightbox from '@/components/app/chat/ImageLightbox';
import { AnimatePresence } from 'framer-motion';

function dateFmt(d) {
  const date = new Date(d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const msgDay = new Date(date);
  msgDay.setHours(0, 0, 0, 0);
  const diff = today - msgDay;
  if (diff === 0) return 'Today';
  if (diff === 86400000) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

const ESTIMATED_ROW_HEIGHT = 56;
const OVERSCAN = 8;

export default function VirtualMessageList({
  messages, currentUserId, channelName, isLoading, isDM,
  onReply, onEdit, onDelete, onReact, onPin, onProfileClick,
  editingMessage, onEditSave, onEditCancel, optimisticIds
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [atBottom, setAtBottom] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  // Build items array with date dividers
  const items = useMemo(() => {
    const result = [];
    let lastDate = null;
    messages.forEach((msg, i) => {
      const msgDate = new Date(msg.created_date).toDateString();
      if (msgDate !== lastDate) {
        lastDate = msgDate;
        result.push({ type: 'divider', date: msg.created_date, key: `d-${msgDate}` });
      }
      const prev = messages[i - 1];
      const compact = prev && prev.author_id === msg.author_id
        && (new Date(msg.created_date) - new Date(prev.created_date)) < 300000
        && new Date(msg.created_date).toDateString() === new Date(prev.created_date).toDateString();
      // Don't compact after a divider
      const prevItem = result[result.length - 1];
      const isAfterDivider = prevItem?.type === 'divider';
      result.push({ type: 'message', msg, compact: compact && !isAfterDivider, key: msg.id });
    });
    return result;
  }, [messages]);

  // For simplicity with variable heights, we render all items but use memo for performance
  // True windowing with variable heights needs measured row heights which adds complexity
  // Instead we use React.memo on MessageBubble and efficient rendering

  useEffect(() => {
    if (atBottom) bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages.length, atBottom]);

  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (el) setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 60);
  }, []);

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text-muted)' }} />
    </div>
  );

  return (
    <div className="flex-1 relative min-h-0">
      <div ref={containerRef} onScroll={onScroll} className="absolute inset-0 overflow-y-auto pb-2 scrollbar-none" role="log" aria-label={`Messages in ${channelName}`} aria-live="polite">
        {/* Welcome */}
        <div className="px-4 pt-16 pb-8">
          <div className="w-16 h-16 rounded-2xl glass flex items-center justify-center mb-5" style={{ boxShadow: 'var(--shadow-glow)' }}>
            {isDM ? <MessageSquare className="w-7 h-7" style={{ color: 'var(--text-muted)' }} aria-hidden="true" /> : <Hash className="w-7 h-7" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />}
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>
            {isDM ? channelName : `#${channelName}`}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {isDM ? 'This is the beginning of your conversation.' : `This is the start of #${channelName}. Send a message to get things going.`}
          </p>
        </div>

        {items.map(item => {
          if (item.type === 'divider') {
            return (
              <div key={item.key} className="flex items-center gap-4 my-4 mx-4" role="separator">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-[10px] font-semibold select-none" style={{ color: 'var(--text-faint)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{dateFmt(item.date)}</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
            );
          }
          const msg = item.msg;
          const isOptimistic = optimisticIds?.has(msg.id);
          return (
            <div key={item.key} style={{ opacity: isOptimistic ? 0.7 : 1 }}>
              <MessageBubble
                message={msg} compact={item.compact} isOwn={msg.author_id === currentUserId}
                onReply={onReply} onEdit={onEdit} onDelete={onDelete} onReact={onReact} onPin={onPin}
                currentUserId={currentUserId} onProfileClick={onProfileClick}
                isEditing={editingMessage?.id === msg.id} onEditSave={onEditSave} onEditCancel={onEditCancel}
                onImageClick={(src, name) => setLightbox({ src, name })}
              />
              {isOptimistic && (
                <div className="flex items-center gap-1 ml-[68px] -mt-1 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse-soft" style={{ background: 'var(--text-faint)' }} />
                  <span className="text-[9px]" style={{ color: 'var(--text-faint)' }}>Sending...</span>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {!atBottom && (
        <button onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 h-8 px-4 rounded-full flex items-center gap-2 glass-strong"
          style={{ boxShadow: 'var(--shadow-md)' }}
          aria-label="Jump to latest messages">
          <ArrowDown className="w-3 h-3" style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
          <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>New messages</span>
        </button>
      )}

      <AnimatePresence>{lightbox && <ImageLightbox src={lightbox.src} filename={lightbox.name} onClose={() => setLightbox(null)} />}</AnimatePresence>
    </div>
  );
}