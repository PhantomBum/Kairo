import React, { useRef, useEffect, useState } from 'react';
import { ArrowDown, Hash, MessageSquare } from 'lucide-react';
import MessageBubble from '@/components/app/chat/MessageBubble';

function dateDivider(d) {
  const date = new Date(d);
  const now = new Date();
  const diff = new Date(now).setHours(0,0,0,0) - new Date(date).setHours(0,0,0,0);
  if (diff === 0) return 'Today';
  if (diff === 86400000) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function MessageList({ messages, currentUserId, channelName, isLoading, isDM, onReply, onEdit, onDelete, onReact, onProfileClick, editingMessage, onEditSave, onEditCancel }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    if (atBottom) bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages, atBottom]);

  const onScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 60);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text-muted)' }} />
      </div>
    );
  }

  let lastDate = null;

  return (
    <div className="flex-1 relative min-h-0">
      <div ref={containerRef} onScroll={onScroll} className="absolute inset-0 overflow-y-auto pb-2 scrollbar-none">
        {/* Welcome */}
        <div className="px-4 pt-12 pb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'var(--accent-dim)' }}>
            {isDM ? <MessageSquare className="w-7 h-7" style={{ color: 'var(--text-muted)' }} /> : <Hash className="w-7 h-7" style={{ color: 'var(--text-muted)' }} />}
          </div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {isDM ? channelName : `Welcome to #${channelName}`}
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {isDM ? 'This is the beginning of your direct message history.' : `This is the start of #${channelName}.`}
          </p>
        </div>

        {messages.map((msg, i) => {
          const msgDate = new Date(msg.created_date).toDateString();
          let divider = null;
          if (msgDate !== lastDate) {
            lastDate = msgDate;
            divider = (
              <div key={`d-${msgDate}`} className="flex items-center gap-4 my-3 mx-4">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-[10px] font-semibold select-none" style={{ color: 'var(--text-muted)' }}>{dateDivider(msg.created_date)}</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>
            );
          }
          const prev = messages[i - 1];
          const compact = prev && prev.author_id === msg.author_id &&
            (new Date(msg.created_date) - new Date(prev.created_date)) < 300000 &&
            new Date(msg.created_date).toDateString() === new Date(prev.created_date).toDateString();

          return (
            <React.Fragment key={msg.id}>
              {divider}
              <MessageBubble
                message={msg} compact={!divider && compact} isOwn={msg.author_id === currentUserId}
                onReply={onReply} onEdit={onEdit} onDelete={onDelete} onReact={onReact}
                currentUserId={currentUserId} onProfileClick={onProfileClick}
                isEditing={editingMessage?.id === msg.id} onEditSave={onEditSave} onEditCancel={onEditCancel}
              />
            </React.Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {!atBottom && (
        <button onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 h-8 px-4 rounded-full flex items-center gap-2"
          style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>
          <ArrowDown className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>New messages</span>
        </button>
      )}
    </div>
  );
}