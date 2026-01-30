import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { 
  Reply, MoreHorizontal, Smile, Pin, Pencil, Trash2, 
  Copy, Forward, Bookmark, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import UserBadges from './UserBadges';
import CrossAppIndicator from './crossapp/CrossAppIndicator';

const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👀'];

function formatMessageDate(date) {
  const d = new Date(date);
  if (isToday(d)) return `Today at ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, yyyy h:mm a');
}

function DateDivider({ date }) {
  const d = new Date(date);
  let label;
  if (isToday(d)) label = 'Today';
  else if (isYesterday(d)) label = 'Yesterday';
  else label = format(d, 'MMMM d, yyyy');

  return (
    <div className="flex items-center gap-2 py-4">
      <div className="flex-1 h-px bg-zinc-800" />
      <span className="text-xs text-zinc-500 font-medium">{label}</span>
      <div className="flex-1 h-px bg-zinc-800" />
    </div>
  );
}

function MessageActions({ message, onReply, onEdit, onDelete, onReact, isOwn }) {
  return (
    <div className="absolute -top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <div className="flex items-center gap-0.5 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg p-0.5">
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors">
              <Smile className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 bg-zinc-900 border-zinc-800" align="end">
            <div className="flex gap-1">
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReact?.(message.id, emoji)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-zinc-800 rounded text-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                onClick={() => onReply?.(message)}
                className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
              >
                <Reply className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-900 border-zinc-800 text-white">
              Reply
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isOwn && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => onEdit?.(message)}
                  className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-900 border-zinc-800 text-white">
                Edit
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-900 border-zinc-800 text-white">
              More
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

function MessageItem({ message, showHeader, onReply, onEdit, onDelete, onReact, currentUserId }) {
  const isOwn = message.author_id === currentUserId;
  
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "group relative px-4 py-0.5 hover:bg-zinc-800/30 transition-colors",
            showHeader && "mt-4"
          )}
        >
          {/* Reply reference */}
          {message.reply_preview && (
            <div className="flex items-center gap-2 ml-[52px] mb-1 text-sm">
              <div className="w-5 h-5 border-l-2 border-t-2 border-zinc-600 rounded-tl ml-1" />
              <span className="text-zinc-500 truncate">
                <span className="text-zinc-400 font-medium hover:underline cursor-pointer">
                  @{message.reply_preview.author_name}
                </span>
                {' '}{message.reply_preview.content?.slice(0, 50)}
                {message.reply_preview.content?.length > 50 ? '...' : ''}
              </span>
            </div>
          )}

          <div className="flex gap-4">
            {/* Avatar */}
            {showHeader ? (
              <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                {message.author_avatar ? (
                  <img src={message.author_avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-medium">
                    {message.author_name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-10 flex-shrink-0 flex items-center justify-center">
                <span className="text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  {format(new Date(message.created_date), 'h:mm')}
                </span>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              {showHeader && (
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="font-medium text-white hover:underline cursor-pointer">
                    {message.author_name || 'Unknown User'}
                  </span>
                  <UserBadges 
                    badges={message.author_badges} 
                    size="xs"
                    showYoutube={message.author_youtube_show_icon}
                    youtubeUrl={message.author_youtube_url}
                  />
                  {message.metadata?.platform && (
                    <CrossAppIndicator platform={message.metadata.platform} size="xs" />
                  )}
                  <span className="text-xs text-zinc-500">
                    {formatMessageDate(message.created_date)}
                  </span>
                  {message.is_edited && (
                    <span className="text-xs text-zinc-600">(edited)</span>
                  )}
                </div>
              )}
              
              <div className="text-zinc-300 break-words whitespace-pre-wrap">
                {message.content}
              </div>

              {/* Attachments */}
              {message.attachments?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.attachments.map((attachment, i) => (
                    <div key={i} className="rounded-lg overflow-hidden max-w-md">
                      {attachment.content_type?.startsWith('image/') ? (
                        <img 
                          src={attachment.url} 
                          alt={attachment.filename}
                          className="max-h-80 rounded-lg"
                        />
                      ) : (
                        <a 
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-3 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
                        >
                          <div className="w-10 h-10 bg-zinc-700 rounded flex items-center justify-center">
                            📄
                          </div>
                          <div>
                            <div className="text-sm text-white">{attachment.filename}</div>
                            <div className="text-xs text-zinc-500">
                              {(attachment.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Reactions */}
              {message.reactions?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {message.reactions.map((reaction, i) => (
                    <button
                      key={i}
                      onClick={() => onReact?.(message.id, reaction.emoji)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-sm transition-colors",
                        reaction.users?.includes(currentUserId)
                          ? "bg-indigo-500/20 border border-indigo-500/50"
                          : "bg-zinc-800 hover:bg-zinc-700"
                      )}
                    >
                      <span>{reaction.emoji}</span>
                      <span className="text-zinc-400">{reaction.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <MessageActions
            message={message}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onReact={onReact}
            isOwn={isOwn}
          />
        </motion.div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-zinc-900 border-zinc-800">
        <ContextMenuItem 
          onClick={() => onReply?.(message)}
          className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white"
        >
          <Reply className="w-4 h-4 mr-2" />
          Reply
        </ContextMenuItem>
        <ContextMenuItem className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white">
          <MessageSquare className="w-4 h-4 mr-2" />
          Create Thread
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => navigator.clipboard.writeText(message.content)}
          className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy Text
        </ContextMenuItem>
        <ContextMenuItem className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white">
          <Pin className="w-4 h-4 mr-2" />
          Pin Message
        </ContextMenuItem>
        {isOwn && (
          <>
            <ContextMenuSeparator className="bg-zinc-800" />
            <ContextMenuItem 
              onClick={() => onEdit?.(message)}
              className="text-zinc-300 focus:bg-indigo-500/20 focus:text-white"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Message
            </ContextMenuItem>
            <ContextMenuItem 
              onClick={() => onDelete?.(message.id)}
              className="text-red-400 focus:bg-red-500/20 focus:text-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Message
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

export default function MessageList({ 
  messages = [], 
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReact,
  isLoading
}) {
  const listRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, autoScroll]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setAutoScroll(isNearBottom);
  };

  // Group messages by date and check if header should show
  const shouldShowHeader = (message, index) => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    if (prevMessage.author_id !== message.author_id) return true;
    const timeDiff = new Date(message.created_date) - new Date(prevMessage.created_date);
    if (timeDiff > 5 * 60 * 1000) return true; // 5 minutes
    return false;
  };

  const shouldShowDateDivider = (message, index) => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    return !isSameDay(new Date(message.created_date), new Date(prevMessage.created_date));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-500 text-sm">Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={listRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
    >
      <div className="py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-zinc-500">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium text-zinc-400">No messages yet</p>
            <p className="text-sm">Start the conversation!</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
              <React.Fragment key={message.id}>
                {shouldShowDateDivider(message, index) && (
                  <DateDivider date={message.created_date} />
                )}
                <MessageItem
                  message={message}
                  showHeader={shouldShowHeader(message, index)}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReact={onReact}
                />
              </React.Fragment>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}