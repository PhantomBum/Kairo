import React, { useRef, useEffect, useState, useCallback, useMemo, memo } from 'react';
import { ArrowDown, Hash, MessageSquare } from 'lucide-react';
import MessageBubble from '@/components/app/chat/MessageBubble';
import ImageLightbox from '@/components/app/chat/ImageLightbox';
import ExternalLinkWarning from '@/components/app/shared/ExternalLinkWarning';
import { AnimatePresence } from 'framer-motion';
import { colors } from '@/components/app/design/tokens';
import { SkeletonMessage } from '@/components/ui/skeleton';

const P = {
  elevated: colors.bg.elevated,
  border: colors.border.subtle,
  textPrimary: colors.text.primary,
  textSecondary: colors.text.secondary,
  muted: colors.text.muted,
  accent: colors.accent.primary,
};

const EST_COMPACT = 28;
const EST_FULL = 68;
const EST_DIVIDER = 48;
const OVERSCAN = 8;

const scrollPositionCache = new Map();

function dateFmt(d) {
  const date = new Date(d);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const msgDay = new Date(date); msgDay.setHours(0, 0, 0, 0);
  const diff = today - msgDay;
  if (diff === 0) return 'Today';
  if (diff === 86400000) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

const DateDivider = memo(function DateDivider({ date }) {
  return (
    <div className="w-full flex justify-center my-5 px-4" role="separator">
      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full select-none"
        style={{ color: P.muted, background: 'var(--bg-float)', border: '1px solid var(--border-subtle)' }}>
        {dateFmt(date)}
      </span>
    </div>
  );
});

export default function VirtualMessageList({
  messages, currentUserId, channelName, isLoading, isDM,
  onReply, onEdit, onDelete, onDeleteBatch, onReact, onPin, onStar, onForward, onProfileClick,
  editingMessage, onEditSave, onEditCancel, optimisticIds, failedIds, onRetryFailed, onDismissFailed,
  members, getProfile, onLongPress, onHighlight, onMarkMoment, onOpenThread,
  isAdmin, highlightTargetId,
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [atBottom, setAtBottom] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [linkWarning, setLinkWarning] = useState(null);
  const skipLinkWarning = useRef(false);
  const [readReceipt, setReadReceipt] = useState(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
  const [highlightedMsgId, setHighlightedMsgId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const lastClickIndexRef = useRef(null);
  const heightsRef = useRef(new Map());
  const channelKeyRef = useRef(null);
  const highlightTimeoutRef = useRef(null);

  useEffect(() => {
    try { skipLinkWarning.current = localStorage.getItem('kairo-skip-link-warn') === 'true'; } catch {}
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => { if (e.key === 'Escape') setSelectedIds(new Set()); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (!isDM || !messages.length) { setReadReceipt(null); return; }
    const otherMsgs = messages.filter(m => m.author_id !== currentUserId);
    const myMsgs = messages.filter(m => m.author_id === currentUserId);
    if (!myMsgs.length || !otherMsgs.length) { setReadReceipt(null); return; }
    const lastOtherMsg = otherMsgs[otherMsgs.length - 1];
    const lastOtherTime = new Date(lastOtherMsg.created_date).getTime();
    const readUpTo = myMsgs.filter(m => new Date(m.created_date).getTime() < lastOtherTime);
    if (readUpTo.length > 0) {
      const lastRead = readUpTo[readUpTo.length - 1];
      setReadReceipt({ msgId: lastRead.id, avatar: lastOtherMsg.author_avatar, name: lastOtherMsg.author_name });
    } else {
      const lastMyMsg = myMsgs[myMsgs.length - 1];
      if (lastOtherTime > new Date(lastMyMsg.created_date).getTime()) {
        setReadReceipt({ msgId: lastMyMsg.id, avatar: lastOtherMsg.author_avatar, name: lastOtherMsg.author_name });
      } else {
        setReadReceipt(null);
      }
    }
  }, [messages, currentUserId, isDM]);

  const handleLinkClick = useCallback((url) => {
    if (skipLinkWarning.current) { window.open(url, '_blank', 'noopener,noreferrer'); return; }
    setLinkWarning(url);
  }, []);

  const handleMessageClick = useCallback((e, msg, idx) => {
    if (e.shiftKey) {
      const prev = lastClickIndexRef.current;
      lastClickIndexRef.current = idx;
      const start = prev != null ? Math.min(prev, idx) : idx;
      const end = prev != null ? Math.max(prev, idx) : idx;
      const ids = new Set();
      for (let i = start; i <= end; i++) {
        const it = items[i];
        if (it?.type === 'message' && it.msg) ids.add(it.msg.id);
      }
      setSelectedIds(ids);
    } else {
      setSelectedIds(new Set());
    }
  }, [items]);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const copySelectedText = useCallback(() => {
    const texts = Array.from(selectedIds)
      .map(id => messages.find(m => m.id === id))
      .filter(Boolean)
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
      .map(m => `${m.author_name}: ${m.content || ''}`);
    const text = texts.join('\n\n');
    navigator.clipboard.writeText(text).catch(() => {});
    setSelectedIds(new Set());
  }, [selectedIds, messages]);

  const scrollToAndHighlight = useCallback((msgId) => {
    if (!msgId || !messages.find(m => m.id === msgId)) return;
    const idx = items.findIndex(it => it.type === 'message' && it.msg.id === msgId);
    if (idx < 0) return;
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    setHighlightedMsgId(msgId);
    const start = Math.max(0, idx - 5);
    const end = Math.min(items.length, idx + 6);
    setVisibleRange({ start, end });
    requestAnimationFrame(() => {
      const el = containerRef.current?.querySelector(`[data-msg-id="${msgId}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      highlightTimeoutRef.current = setTimeout(() => setHighlightedMsgId(null), 2000);
    });
  }, [messages, items]);

  useEffect(() => {
    if (highlightTargetId) {
      scrollToAndHighlight(highlightTargetId);
    }
  }, [highlightTargetId, scrollToAndHighlight]);

  const messagesById = useMemo(() => {
    const m = new Map();
    messages.forEach(msg => m.set(msg.id, msg));
    return m;
  }, [messages]);

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
        && (new Date(msg.created_date) - new Date(prev.created_date)) < 420000
        && new Date(msg.created_date).toDateString() === new Date(prev.created_date).toDateString();
      const prevItem = result[result.length - 1];
      const isAfterDivider = prevItem?.type === 'divider';
      let resolvedMsg = msg;
      if (msg.reply_to_id) {
        const repliedTo = messagesById.get(msg.reply_to_id);
        if (repliedTo) {
          resolvedMsg = { ...msg, reply_preview: { author_name: repliedTo.author_name || 'User', content: repliedTo.content?.slice(0, 80) } };
        }
      }
      result.push({ type: 'message', msg: resolvedMsg, compact: compact && !isAfterDivider, key: msg.id });
    });
    return result;
  }, [messages, messagesById]);

  const getItemHeight = useCallback((item) => {
    const measured = heightsRef.current.get(item.key);
    if (measured) return measured;
    if (item.type === 'divider') return EST_DIVIDER;
    return item.compact ? EST_COMPACT : EST_FULL;
  }, []);

  const totalHeight = useMemo(() => {
    let h = 200; // welcome header
    for (const item of items) h += getItemHeight(item);
    return h;
  }, [items, getItemHeight]);

  const updateVisibleRange = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const scrollTop = el.scrollTop;
    const viewH = el.clientHeight;
    const isAtBottom = el.scrollHeight - scrollTop - viewH < 60;
    setAtBottom(isAtBottom);

    let cumH = 200; // welcome header height
    let startIdx = 0, endIdx = items.length;

    for (let i = 0; i < items.length; i++) {
      if (cumH + getItemHeight(items[i]) >= scrollTop - viewH) { startIdx = i; break; }
      cumH += getItemHeight(items[i]);
    }
    cumH = 200;
    for (let i = 0; i < items.length; i++) {
      cumH += getItemHeight(items[i]);
      if (cumH > scrollTop + viewH * 2) { endIdx = i + 1; break; }
    }

    const start = Math.max(0, startIdx - OVERSCAN);
    const end = Math.min(items.length, endIdx + OVERSCAN);

    setVisibleRange(prev => {
      if (prev.start === start && prev.end === end) return prev;
      return { start, end };
    });
  }, [items, getItemHeight]);

  const onScroll = useCallback(() => {
    updateVisibleRange();
    const el = containerRef.current;
    if (el && channelKeyRef.current) {
      scrollPositionCache.set(channelKeyRef.current, el.scrollTop);
    }
  }, [updateVisibleRange]);

  // Restore scroll position when switching channels
  const channelKey = useMemo(() => {
    return channelName + '-' + (messages[0]?.id || '');
  }, [channelName, messages[0]?.id]);

  useEffect(() => {
    channelKeyRef.current = channelKey;
    const el = containerRef.current;
    if (!el) return;
    const cached = scrollPositionCache.get(channelKey);
    if (cached !== undefined) {
      requestAnimationFrame(() => { el.scrollTop = cached; });
    }
  }, [channelKey]);

  // Auto-scroll for new messages when at bottom
  const lastMsgCountRef = useRef(0);
  const prevAtBottomRef = useRef(true);
  useEffect(() => {
    const count = messages.length;
    if (count > lastMsgCountRef.current && prevAtBottomRef.current) {
      requestAnimationFrame(() => { bottomRef.current?.scrollIntoView({ behavior: 'auto' }); });
    }
    lastMsgCountRef.current = count;
    prevAtBottomRef.current = atBottom;
  }, [messages.length, atBottom]);

  // Initialize visible range
  useEffect(() => { updateVisibleRange(); }, [items.length, updateVisibleRange]);

  // Measure rendered items
  const measureRef = useCallback((node) => {
    if (!node) return;
    const key = node.dataset.itemKey;
    if (!key) return;
    const h = node.getBoundingClientRect().height;
    if (h > 0 && heightsRef.current.get(key) !== h) {
      heightsRef.current.set(key, h);
    }
  }, []);

  const unreadCount = useMemo(() => {
    if (atBottom) return 0;
    const el = containerRef.current;
    if (!el) return 0;
    return Math.max(0, messages.length - visibleRange.end);
  }, [atBottom, messages.length, visibleRange.end]);

  // Calculate spacers
  const { topPad, bottomPad, renderedItems } = useMemo(() => {
    let topH = 0, bottomH = 0;
    for (let i = 0; i < visibleRange.start; i++) topH += getItemHeight(items[i]);
    for (let i = visibleRange.end; i < items.length; i++) bottomH += getItemHeight(items[i]);
    return {
      topPad: topH,
      bottomPad: bottomH,
      renderedItems: items.slice(visibleRange.start, visibleRange.end),
    };
  }, [items, visibleRange, getItemHeight]);

  if (isLoading) return (
    <div className="flex-1 overflow-hidden" style={{ background: P.elevated }}>
      <div className="pt-6">
        {[false, true, true, false, true, false, true, true].map((compact, i) => (
          <SkeletonMessage key={i} compact={compact} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex-1 relative min-h-0">
      <div ref={containerRef} onScroll={onScroll} className="absolute inset-0 overflow-y-auto pb-2 scrollbar-none"
        style={{ background: P.elevated, willChange: 'transform' }} role="log" aria-label={`Messages in ${channelName}`}>

        {/* Channel welcome — 72px left, 20px right padding */}
        <div className="pl-[72px] pr-5 pt-20 pb-8 k-message-max">
          <div className="w-[76px] h-[76px] rounded-full flex items-center justify-center mb-5 mx-auto md:mx-0"
            style={{ background: colors.bg.overlay }}>
            {isDM ? <MessageSquare className="w-9 h-9" style={{ color: colors.text.primary }} /> : <Hash className="w-9 h-9" style={{ color: colors.text.primary }} />}
          </div>
          <h2 className="text-[32px] font-bold mb-2" style={{ color: colors.text.primary }}>
            {isDM ? channelName : `Welcome to #${channelName}`}
          </h2>
          <p className="text-[14px]" style={{ color: colors.text.muted }}>
            {isDM ? 'This is the beginning of your direct message history.' : `This is the start of the #${channelName} channel.`}
          </p>
        </div>

        {/* Top spacer for virtualized items above viewport */}
        {topPad > 0 && <div style={{ height: topPad }} aria-hidden />}

        {renderedItems.map((item, ri) => {
          const globalIdx = visibleRange.start + ri;
          if (item.type === 'divider') {
            return <div key={item.key} data-item-key={item.key} ref={measureRef}><DateDivider date={item.date} /></div>;
          }
          const msg = item.msg;
          const isSending = optimisticIds?.has(msg.id);
          const isFailed = failedIds?.has(msg.id);
          const isSelected = selectedIds.has(msg.id);
          return (
            <div key={item.key} data-item-key={item.key} ref={measureRef} className="k-message-max pl-[72px] pr-5"
              onClick={(e) => handleMessageClick(e, msg, globalIdx)}
              style={{
                opacity: isSending ? 1 : 1,
                contentVisibility: 'auto',
                containIntrinsicSize: `auto ${item.compact ? EST_COMPACT : EST_FULL}px`,
                background: isSelected ? 'var(--accent-dim)' : 'transparent',
                borderRadius: isSelected ? 8 : 0,
                marginLeft: isSelected ? -4 : 0,
                marginRight: isSelected ? -4 : 0,
                paddingLeft: isSelected ? 4 : 0,
                paddingRight: isSelected ? 4 : 0,
              }}>
              <MessageBubble
                message={msg} compact={item.compact} isOwn={msg.author_id === currentUserId}
                isSending={isSending} isFailed={isFailed} onRetry={() => onRetryFailed?.(msg.id)} onDismiss={() => onDismissFailed?.(msg.id)}
                onReply={onReply} onEdit={onEdit} onDelete={onDelete} onReact={onReact} onPin={onPin} onStar={onStar}
                onForward={onForward}
                currentUserId={currentUserId} onProfileClick={onProfileClick}
                isEditing={editingMessage?.id === msg.id} onEditSave={onEditSave} onEditCancel={onEditCancel}
                onImageClick={(src, name) => setLightbox({ src, name })}
                onLinkClick={handleLinkClick}
                onJumpToReply={scrollToAndHighlight}
                isHighlighted={highlightedMsgId === msg.id}
                isSelected={isSelected}
                members={members}
                getProfile={getProfile}
                onLongPress={onLongPress}
                onMarkMoment={onMarkMoment}
                onOpenThread={onOpenThread}
              />
              {readReceipt && readReceipt.msgId === msg.id && (
                <div className="flex justify-end pr-4 -mt-0.5 mb-1" title={`Read by ${readReceipt.name}`}>
                  <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center" style={{ background: colors.bg.overlay }}>
                    {readReceipt.avatar ? <img src={readReceipt.avatar} className="w-full h-full object-cover" alt="" loading="lazy" /> : <span className="text-[8px]" style={{ color: colors.text.muted }}>{(readReceipt.name || 'U').charAt(0)}</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Bottom spacer */}
        {bottomPad > 0 && <div style={{ height: bottomPad }} aria-hidden />}
        <div style={{ height: 8 }} aria-hidden />
        <div ref={bottomRef} />
      </div>

      {selectedIds.size > 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-xl z-10 k-jump-fade-in"
          style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
          <span className="text-[13px] font-medium" style={{ color: P.textPrimary }}>{selectedIds.size} message{selectedIds.size !== 1 ? 's' : ''} selected</span>
          <button onClick={copySelectedText} className="px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-[rgba(255,255,255,0.06)]" style={{ color: P.textSecondary }}>Copy Text</button>
          {onForward && (
            <button onClick={() => { const first = messages.find(m => selectedIds.has(m.id)); if (first) onForward(first); clearSelection(); }} className="px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-[rgba(255,255,255,0.06)]" style={{ color: P.textSecondary }}>Forward</button>
          )}
          {isAdmin && (
            <button onClick={() => {
              const toDelete = Array.from(selectedIds).map(id => messages.find(x => x.id === id)).filter(Boolean);
              if (toDelete.length > 0 && onDeleteBatch) {
                onDeleteBatch(toDelete, clearSelection);
              } else if (toDelete.length > 0 && onDelete) {
                toDelete.forEach(m => onDelete(m));
                clearSelection();
              }
            }} className="px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-[rgba(237,66,69,0.15)]" style={{ color: colors.danger }}>Delete</button>
          )}
          <button onClick={clearSelection} className="px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-[rgba(255,255,255,0.06)]" style={{ color: P.muted }}>Cancel</button>
        </div>
      )}

      {!atBottom && (
        <button onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-4 right-4 h-8 px-4 rounded-full flex items-center gap-2 text-[13px] font-medium z-10 k-jump-fade-in"
          style={{ background: 'var(--bg-float)', color: 'var(--text-primary)', boxShadow: '0 4px 16px rgba(0,0,0,0.5)', border: '1px solid var(--border-subtle)' }}
          aria-label="Jump to latest messages">
          <ArrowDown className="w-4 h-4" />
          {unreadCount > 0 ? `${unreadCount} new` : 'Jump to bottom'}
        </button>
      )}

      <AnimatePresence>
        {lightbox && <ImageLightbox src={lightbox.src} filename={lightbox.name} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {linkWarning && (
          <ExternalLinkWarning url={linkWarning}
            onCancel={() => setLinkWarning(null)}
            onConfirm={(dontShowAgain) => {
              if (dontShowAgain) { try { localStorage.setItem('kairo-skip-link-warn', 'true'); } catch {} skipLinkWarning.current = true; }
              window.open(linkWarning, '_blank', 'noopener,noreferrer');
              setLinkWarning(null);
            }} />
        )}
      </AnimatePresence>
    </div>
  );
}
