import React, { useRef, useEffect, memo } from 'react';
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import MessageItem from './MessageItem';
import { Skeleton } from '../primitives/Spinner';

// Date divider component
const DateDivider = memo(({ date }) => (
  <div className="flex items-center gap-4 px-4 py-2">
    <div className="flex-1 h-px bg-white/[0.06]" />
    <span className="text-xs font-medium text-zinc-500">
      {format(new Date(date), 'MMMM d, yyyy')}
    </span>
    <div className="flex-1 h-px bg-white/[0.06]" />
  </div>
));

// Loading skeleton
const MessageSkeleton = () => (
  <div className="px-4 py-2 flex gap-3">
    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-4 w-3/4 max-w-sm" />
    </div>
  </div>
);

// Empty state
const EmptyState = ({ channelName }) => (
  <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
      <span className="text-3xl">#</span>
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">
      Welcome to #{channelName}
    </h3>
    <p className="text-zinc-500 max-w-md">
      This is the start of the channel. Send a message to begin the conversation!
    </p>
  </div>
);

function MessageList({
  messages = [],
  currentUserId,
  channelName,
  isLoading,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onToggleReaction,
  onPin,
  onForward,
  onMentionClick,
  onAvatarClick,
  onImageClick,
  onLoadMore,
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const prevMessagesLength = useRef(messages.length);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length]);

  // Determine if we should show a message header (new author or time gap)
  const shouldShowHeader = (message, prevMessage) => {
    if (!prevMessage) return true;
    if (message.author_id !== prevMessage.author_id) return true;
    
    const timeDiff = new Date(message.created_date) - new Date(prevMessage.created_date);
    return timeDiff > 5 * 60 * 1000; // 5 minute gap
  };

  // Determine if we should show a date divider
  const shouldShowDateDivider = (message, prevMessage) => {
    if (!prevMessage) return true;
    return !isSameDay(new Date(message.created_date), new Date(prevMessage.created_date));
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto">
        <MessageSkeleton />
        <MessageSkeleton />
        <MessageSkeleton />
        <MessageSkeleton />
      </div>
    );
  }

  if (messages.length === 0) {
    return <EmptyState channelName={channelName} />;
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto scrollbar-thin"
    >
      <div className="py-4">
        {messages.map((message, index) => {
          const prevMessage = messages[index - 1];
          const showDateDivider = shouldShowDateDivider(message, prevMessage);
          const showHeader = shouldShowHeader(message, prevMessage);

          return (
            <React.Fragment key={message.id}>
              {showDateDivider && <DateDivider date={message.created_date} />}
              <MessageItem
                message={message}
                showHeader={showHeader || showDateDivider}
                isOwn={message.author_id === currentUserId}
                currentUserId={currentUserId}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onReact={onReact}
                onToggleReaction={(emoji) => onToggleReaction?.(message.id, emoji)}
                onPin={onPin}
                onForward={onForward}
                onMentionClick={onMentionClick}
                onAvatarClick={onAvatarClick}
                onImageClick={onImageClick}
              />
            </React.Fragment>
          );
        })}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}

export default memo(MessageList);