import React, { useRef, useEffect, useState } from 'react';
import { Loader2, Hash, Sparkles, ChevronDown } from 'lucide-react';
import MessageItem from './MessageItem';

export default function MessageList({ messages = [], currentUserId, channelName, isLoading, onReply, onEdit, onDelete, onReact, onPin }) {
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const [showScroll, setShowScroll] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const lastCount = useRef(messages.length);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const dist = scrollHeight - scrollTop - clientHeight;
    setIsAtBottom(dist < 100);
    setShowScroll(dist > 400);
  };

  useEffect(() => {
    if (messages.length > lastCount.current && isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    lastCount.current = messages.length;
  }, [messages.length, isAtBottom]);

  useEffect(() => {
    if (messages.length > 0 && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [channelName]);

  // Group messages by date
  const items = messages.reduce((acc, msg, i) => {
    const date = new Date(msg.created_date).toDateString();
    const prevDate = i > 0 ? new Date(messages[i - 1].created_date).toDateString() : null;
    if (date !== prevDate) acc.push({ type: 'divider', date, id: `d-${date}` });
    acc.push({ type: 'message', data: msg, id: msg.id });
    return acc;
  }, []);

  if (isLoading && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Welcome */}
        <div className="px-4 pt-16 pb-4">
          <div className="w-16 h-16 rounded-full bg-white/[0.04] flex items-center justify-center mb-4">
            <Hash className="w-8 h-8 text-zinc-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Welcome to #{channelName}!</h2>
          <p className="text-sm text-zinc-600">This is the start of the <span className="font-medium text-zinc-400">#{channelName}</span> channel.</p>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-zinc-500">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Be the first to send a message!</span>
          </div>
        </div>

        {/* Messages */}
        <div className="pb-4">
          {items.map((item, i) => {
            if (item.type === 'divider') {
              return (
                <div key={item.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="flex-1 h-px bg-white/[0.04]" />
                  <span className="text-[11px] font-medium text-zinc-600">{formatDivider(item.date)}</span>
                  <div className="flex-1 h-px bg-white/[0.04]" />
                </div>
              );
            }
            const msg = item.data;
            const prev = items[i - 1];
            const prevMsg = prev?.type === 'message' ? prev.data : null;
            const showHeader = !prevMsg || prevMsg.author_id !== msg.author_id ||
              new Date(msg.created_date) - new Date(prevMsg.created_date) > 5 * 60 * 1000;

            return (
              <MessageItem key={msg.id}
                message={{ ...msg, current_user_id: currentUserId }}
                showHeader={showHeader} isOwn={msg.author_id === currentUserId}
                onReply={() => onReply(msg)} onEdit={() => onEdit(msg)}
                onDelete={() => onDelete(msg)} onReact={(emoji) => onReact(msg, emoji)}
                onPin={() => onPin(msg)} />
            );
          })}
          <div ref={bottomRef} className="h-1" />
        </div>
      </div>

      {showScroll && (
        <button onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
          className="absolute bottom-4 right-4 w-9 h-9 bg-[#2a2a2a] border border-white/[0.08] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#333] transition-colors">
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

function formatDivider(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}