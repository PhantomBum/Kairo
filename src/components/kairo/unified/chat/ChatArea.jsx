import React, { useRef, useEffect, useState } from 'react';
import { ArrowDown, Hash, MessageSquare, Sparkles } from 'lucide-react';
import ChatBubble from '@/components/kairo/unified/chat/ChatBubble';

function formatDivider(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = new Date(now).setHours(0,0,0,0) - new Date(d).setHours(0,0,0,0);
  if (diff === 0) return 'Today';
  if (diff === 86400000) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function ChatArea({ messages, currentUserId, channelName, isLoading, isDM, onReply, onEdit, onDelete, onReact, onPin, onThread, onProfileClick, editingMessage, onEditSave, onEditCancel }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    if (atBottom) bottomRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages, atBottom]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 60);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-zinc-800 border-t-zinc-500 rounded-full animate-spin" />
        <span className="text-xs text-zinc-600">Loading messages...</span>
      </div>
    );
  }

  let lastDate = null;

  return (
    <div className="flex-1 relative min-h-0">
      <div ref={containerRef} onScroll={handleScroll} className="absolute inset-0 overflow-y-auto pb-2 scrollbar-thin">
        {/* Welcome banner */}
        <div className="px-4 pt-10 pb-6 mb-1">
          <div className="w-[68px] h-[68px] rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(168,85,247,0.15) 100%)', border: '1px solid rgba(99,102,241,0.1)' }}>
            {isDM ? <MessageSquare className="w-8 h-8 text-indigo-400/80" /> : <Hash className="w-8 h-8 text-indigo-400/80" />}
          </div>
          <h2 className="text-[28px] font-bold text-white mb-1 tracking-tight">
            {isDM ? channelName : `Welcome to #${channelName}`}
          </h2>
          <p className="text-sm text-zinc-500 leading-relaxed">
            {isDM ? 'This is the beginning of your direct message history.' : `This is the very beginning of the #${channelName} channel. Start the conversation!`}
          </p>
        </div>

        {messages.map((msg, i) => {
          const msgDate = new Date(msg.created_date).toDateString();
          let divider = null;
          if (msgDate !== lastDate) {
            lastDate = msgDate;
            divider = (
              <div key={`d-${msgDate}`} className="flex items-center gap-4 py-1 my-3 mx-4">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
                <span className="text-[11px] font-semibold text-zinc-600 select-none">{formatDivider(msg.created_date)}</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
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
              <ChatBubble
                message={msg} compact={!divider && compact} isOwn={msg.author_id === currentUserId}
                onReply={onReply} onEdit={onEdit} onDelete={onDelete} onReact={onReact}
                onPin={onPin} onThread={onThread} currentUserId={currentUserId}
                onProfileClick={onProfileClick}
                isEditing={editingMessage?.id === msg.id} onEditSave={onEditSave} onEditCancel={onEditCancel}
                isDM={isDM}
              />
            </React.Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {!atBottom && (
        <button onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 h-8 px-4 rounded-full flex items-center gap-2 transition-all hover:scale-105"
          style={{ background: '#151515', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}>
          <ArrowDown className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs text-zinc-400">New messages</span>
        </button>
      )}
    </div>
  );
}