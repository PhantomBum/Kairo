import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { ArrowDown, Hash, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MessageBubble from '@/components/app/chat/MessageBubble';
import ImageLightbox from '@/components/app/chat/ImageLightbox';
import ExternalLinkWarning from '@/components/app/shared/ExternalLinkWarning';
import { AnimatePresence } from 'framer-motion';
import { colors } from '@/components/app/design/tokens';

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
  onReply, onEdit, onDelete, onReact, onPin, onStar, onForward, onProfileClick,
  editingMessage, onEditSave, onEditCancel, optimisticIds
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const [atBottom, setAtBottom] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [linkWarning, setLinkWarning] = useState(null);
  const skipLinkWarning = useRef(false);
  const [readReceipt, setReadReceipt] = useState(null);

  useEffect(() => {
    try { skipLinkWarning.current = localStorage.getItem('kairo-skip-link-warn') === 'true'; } catch {}
  }, []);

  // DM Read receipts — show avatar of the other person under the last message they've read
  useEffect(() => {
    if (!isDM || !messages.length) { setReadReceipt(null); return; }
    const otherMsgs = messages.filter(m => m.author_id !== currentUserId);
    const myMsgs = messages.filter(m => m.author_id === currentUserId);
    if (!myMsgs.length || !otherMsgs.length) { setReadReceipt(null); return; }
    // The other person has "read" up to the last message before their latest message
    const lastOtherMsg = otherMsgs[otherMsgs.length - 1];
    const lastOtherTime = new Date(lastOtherMsg.created_date).getTime();
    const readUpTo = myMsgs.filter(m => new Date(m.created_date).getTime() < lastOtherTime);
    if (readUpTo.length > 0) {
      const lastRead = readUpTo[readUpTo.length - 1];
      setReadReceipt({ msgId: lastRead.id, avatar: lastOtherMsg.author_avatar, name: lastOtherMsg.author_name });
    } else {
      // If the other person's last message is after all my messages, they've read everything
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

  const lastMsgCountRef = useRef(0);
  const prevAtBottomRef = useRef(true);
  useEffect(() => {
    const msgCount = messages.length;
    const isNewMessage = msgCount > lastMsgCountRef.current;
    if (isNewMessage && prevAtBottomRef.current) {
      requestAnimationFrame(() => { bottomRef.current?.scrollIntoView({ behavior: 'auto' }); });
    }
    lastMsgCountRef.current = msgCount;
    prevAtBottomRef.current = atBottom;
  }, [messages.length, atBottom]);

  const onScroll = useCallback(() => {
    const el = containerRef.current;
    if (el) setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 60);
  }, []);

  if (isLoading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.06)', borderTopColor: colors.accent.primary }} />
    </div>
  );

  return (
    <div className="flex-1 relative min-h-0">
      <div ref={containerRef} onScroll={onScroll} className="absolute inset-0 overflow-y-auto pb-2 scrollbar-none" role="log" aria-label={`Messages in ${channelName}`}>
        {/* Channel welcome */}
        <div className="px-4 md:px-8 pt-20 pb-10">
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

        {items.map(item => {
          if (item.type === 'divider') {
            return (
              <div key={item.key} className="flex items-center gap-4 my-4 mx-4" role="separator">
                <div className="flex-1 h-px" style={{ background: colors.border.strong }} />
                <span className="text-[12px] font-semibold px-1 select-none" style={{ color: colors.text.muted }}>{dateFmt(item.date)}</span>
                <div className="flex-1 h-px" style={{ background: colors.border.strong }} />
              </div>
            );
          }
          const msg = item.msg;
          const isOptimistic = optimisticIds?.has(msg.id);
          return (
            <div key={item.key} className="k-msg-in" style={{ opacity: isOptimistic ? 0.5 : 1 }}>
              <MessageBubble
                message={msg} compact={item.compact} isOwn={msg.author_id === currentUserId}
                onReply={onReply} onEdit={onEdit} onDelete={onDelete} onReact={onReact} onPin={onPin} onStar={onStar}
                onForward={onForward}
                currentUserId={currentUserId} onProfileClick={onProfileClick}
                isEditing={editingMessage?.id === msg.id} onEditSave={onEditSave} onEditCancel={onEditCancel}
                onImageClick={(src, name) => setLightbox({ src, name })}
                onLinkClick={handleLinkClick}
              />
              {isOptimistic && (
                <div className="flex items-center gap-1.5 ml-[72px] -mt-0.5 mb-1">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: colors.text.disabled }} />
                  <span className="text-[11px]" style={{ color: colors.text.disabled }}>Sending...</span>
                </div>
              )}
              {readReceipt && readReceipt.msgId === msg.id && (
                <div className="flex justify-end pr-4 -mt-0.5 mb-1" title={`Read by ${readReceipt.name}`}>
                  <div className="w-4 h-4 rounded-full overflow-hidden flex items-center justify-center" style={{ background: colors.bg.overlay }}>
                    {readReceipt.avatar ? <img src={readReceipt.avatar} className="w-full h-full object-cover" alt="" /> : <span className="text-[8px]" style={{ color: colors.text.muted }}>{(readReceipt.name || 'U').charAt(0)}</span>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {!atBottom && (
        <button onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 h-8 px-4 rounded-full flex items-center gap-2 text-[13px] font-medium"
          style={{ background: colors.bg.float, color: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.32)' }}
          aria-label="Jump to latest messages">
          <ArrowDown className="w-4 h-4" /> New messages
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