import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { ArrowDown, Hash, MessageSquare } from 'lucide-react';
import MessageBubble from '@/components/app/chat/MessageBubble';
import ImageLightbox from '@/components/app/chat/ImageLightbox';
import { AnimatePresence } from 'framer-motion';
import { colors, shadows } from '@/components/app/design/tokens';

function dateFmt(d) {
  const date = new Date(d);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const msgDay = new Date(date); msgDay.setHours(0, 0, 0, 0);
  const diff = today - msgDay;
  if (diff === 0) return 'Today';
  if (diff === 86400000) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function VirtualMessageList({
  messages, currentUserId, channelName, isLoading, isDM,
  onReply, onEdit, onDelete, onReact, onPin, onProfileClick,
  editingMessage, onEditSave, onEditCancel, optimisticIds
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [atBottom, setAtBottom] = useState(true);
  const [lightbox, setLightbox] = useState(null);

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
      const prevItem = result[result.length - 1];
      const isAfterDivider = prevItem?.type === 'divider';
      result.push({ type: 'message', msg, compact: compact && !isAfterDivider, key: msg.id });
    });
    return result;
  }, [messages]);

  useEffect(() => {
    if (atBottom) bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages.length, atBottom]);

  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (el) setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 60);
  }, []);

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: colors.border.light, borderTopColor: colors.accent.primary }} />
    </div>
  );

  return (
    <div className="flex-1 relative min-h-0">
      <div ref={containerRef} onScroll={onScroll} className="absolute inset-0 overflow-y-auto pb-2 scrollbar-none" role="log" aria-label={`Messages in ${channelName}`}>
        {/* Channel welcome */}
        <div className="px-4 pt-16 pb-6">
          <div className="w-[68px] h-[68px] rounded-2xl flex items-center justify-center mb-4"
            style={{ background: colors.accent.subtle }}>
            {isDM ? <MessageSquare className="w-8 h-8" style={{ color: colors.accent.primary }} /> : <Hash className="w-8 h-8" style={{ color: colors.accent.primary }} />}
          </div>
          <h2 className="text-[32px] font-bold mb-2 tracking-tight" style={{ color: colors.text.primary }}>
            {isDM ? channelName : `Welcome to #${channelName}`}
          </h2>
          <p className="text-[15px]" style={{ color: colors.text.muted }}>
            {isDM ? 'This is the beginning of your conversation.' : `This is the start of the #${channelName} channel.`}
          </p>
        </div>

        {items.map(item => {
          if (item.type === 'divider') {
            return (
              <div key={item.key} className="flex items-center gap-4 my-4 mx-4" role="separator">
                <div className="flex-1 h-px" style={{ background: colors.border.default }} />
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full select-none"
                  style={{ color: colors.text.muted, background: colors.bg.surface }}>{dateFmt(item.date)}</span>
                <div className="flex-1 h-px" style={{ background: colors.border.default }} />
              </div>
            );
          }
          const msg = item.msg;
          const isOptimistic = optimisticIds?.has(msg.id);
          return (
            <div key={item.key} style={{ opacity: isOptimistic ? 0.6 : 1 }}>
              <MessageBubble
                message={msg} compact={item.compact} isOwn={msg.author_id === currentUserId}
                onReply={onReply} onEdit={onEdit} onDelete={onDelete} onReact={onReact} onPin={onPin}
                currentUserId={currentUserId} onProfileClick={onProfileClick}
                isEditing={editingMessage?.id === msg.id} onEditSave={onEditSave} onEditCancel={onEditCancel}
                onImageClick={(src, name) => setLightbox({ src, name })}
              />
              {isOptimistic && (
                <div className="flex items-center gap-1.5 ml-[68px] -mt-0.5 mb-1">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: colors.text.disabled }} />
                  <span className="text-[11px]" style={{ color: colors.text.disabled }}>Sending...</span>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Jump to bottom */}
      {!atBottom && (
        <button onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 h-9 px-4 rounded-full flex items-center gap-2"
          style={{ background: colors.accent.primary, color: '#fff', boxShadow: shadows.medium }}
          aria-label="Jump to latest messages">
          <ArrowDown className="w-4 h-4" />
          <span className="text-[13px] font-medium">New messages</span>
        </button>
      )}

      <AnimatePresence>{lightbox && <ImageLightbox src={lightbox.src} filename={lightbox.name} onClose={() => setLightbox(null)} />}</AnimatePresence>
    </div>
  );
}