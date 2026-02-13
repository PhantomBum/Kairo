import React, { useRef, useEffect, useState } from 'react';
import { ArrowDown, Hash, MessageSquare } from 'lucide-react';
import ChatBubble from './ChatBubble.jsx';

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
      <div className="flex-1 flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
      </div>
    );
  }

  let lastDate = null;

  return (
    <div className="flex-1 relative min-h-0">
      <div ref={containerRef} onScroll={handleScroll} className="absolute inset-0 overflow-y-auto px-4 pb-4 scrollbar-thin">
        {/* Welcome */}
        <div className="pt-8 pb-4 mb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ background: '#1a1a1a' }}>
            {isDM ? <MessageSquare className="w-7 h-7 text-zinc-500" /> : <Hash className="w-7 h-7 text-zinc-500" />}
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{isDM ? channelName : `Welcome to #${channelName}`}</h2>
          <p className="text-sm text-zinc-500">{isDM ? 'This is the beginning of your conversation.' : `This is the start of #${channelName}.`}</p>
        </div>

        {messages.map((msg, i) => {
          const msgDate = new Date(msg.created_date).toDateString();
          let divider = null;
          if (msgDate !== lastDate) {
            lastDate = msgDate;
            divider = (
              <div key={`d-${msgDate}`} className="flex items-center gap-3 py-2 my-2">
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <span className="text-[11px] font-semibold text-zinc-500">{formatDivider(msg.created_date)}</span>
                <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
            );
          }

          const prev = messages[i - 1];
          const compact = prev && prev.author_id === msg.author_id &&
            (new Date(msg.created_date) - new Date(prev.created_date)) < 300000 &&
            new Date(msg.created_date).toDateString() === new Date(prev.created_date).toDateString();

          const isEditing = editingMessage?.id === msg.id;

          return (
            <React.Fragment key={msg.id}>
              {divider}
              <ChatBubble
                message={msg}
                compact={!divider && compact}
                isOwn={msg.author_id === currentUserId}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onReact={onReact}
                onPin={onPin}
                onThread={onThread}
                currentUserId={currentUserId}
                onProfileClick={onProfileClick}
                isEditing={isEditing}
                onEditSave={onEditSave}
                onEditCancel={onEditCancel}
                isDM={isDM}
              />
            </React.Fragment>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {!atBottom && (
        <button onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}>
          <ArrowDown className="w-4 h-4 text-zinc-400" />
        </button>
      )}
    </div>
  );
}