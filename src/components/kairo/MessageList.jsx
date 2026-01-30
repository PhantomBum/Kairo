import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { 
  Reply, MoreHorizontal, Smile, Pin, Pencil, Trash2, 
  Copy, Forward, MessageSquare
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

const commonEmojis = ['👍', '❤️', '😂', '🎉', '🔥', '👀', '✅', '💯'];

function formatMessageDate(date) {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, h:mm a');
}

function DateDivider({ date }) {
  const d = new Date(date);
  let label;
  if (isToday(d)) label = 'Today';
  else if (isYesterday(d)) label = 'Yesterday';
  else label = format(d, 'EEEE, MMMM d');

  return (
    <div className="flex items-center gap-4 py-6 px-4">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
      <span className="text-xs font-medium text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full">{label}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
    </div>
  );
}

function MessageActions({ message, onReply, onEdit, onDelete, onReact, onPin, isOwn }) {
  return (
    <div className="absolute -top-3 right-4 opacity-0 group-hover:opacity-100 transition-all">
      <div className="flex items-center bg-zinc-900/95 backdrop-blur-xl border border-zinc-800/80 rounded-xl shadow-xl p-1 gap-0.5">
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
              <Smile className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 bg-zinc-900/95 backdrop-blur-xl border-zinc-800/80 rounded-xl" align="end">
            <div className="flex gap-1">
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReact?.(message.id, emoji)}
                  className="w-9 h-9 flex items-center justify-center hover:bg-zinc-800 rounded-lg text-lg transition-colors"
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
                className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                <Reply className="w-4 h-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-900 border-zinc-800 text-white text-xs">
              Reply
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isOwn && (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => {
                    const newContent = prompt('Edit message:', message.content);
                    if (newContent && newContent !== message.content) {
                      onEdit?.(message, newContent);
                    }
                  }}
                  className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-zinc-900 border-zinc-800 text-white text-xs">
                Edit
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1 bg-zinc-900/95 backdrop-blur-xl border-zinc-800/80 rounded-xl" align="end">
            <button 
              onClick={() => onReact?.(message.id, '👍')}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Smile className="w-4 h-4 text-zinc-500" />
              Add Reaction
            </button>
            <button 
              onClick={() => navigator.clipboard.writeText(message.content)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4 text-zinc-500" />
              Copy Text
            </button>
            <button 
              onClick={() => onPin?.(message)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Pin className="w-4 h-4 text-zinc-500" />
              {message.is_pinned ? 'Unpin' : 'Pin Message'}
            </button>
            {isOwn && (
              <button 
                onClick={() => onDelete?.(message.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

function MessageItem({ message, showHeader, onReply, onEdit, onDelete, onReact, onPin, onThread, onForward, currentUserId }) {
  const isOwn = message.author_id === currentUserId;
  
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "group relative px-4 py-1.5 hover:bg-zinc-800/30 transition-all rounded-2xl mx-2",
            showHeader && "mt-5 pt-3",
            message.is_pinned && "bg-amber-500/5 border-l-2 border-amber-500/50"
          )}
        >
          {/* Reply reference */}
          {message.reply_preview && (
            <div className="flex items-center gap-2 mb-2.5 pl-14">
              <div className="w-5 h-5 border-l-2 border-t-2 border-zinc-700/50 rounded-tl-xl" />
              <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/40 rounded-xl text-sm border border-zinc-800/30">
                <span className="text-violet-400 font-semibold">@{message.reply_preview.author_name}</span>
                <span className="text-zinc-500 truncate max-w-[200px]">{message.reply_preview.content?.slice(0, 50)}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3.5">
            {/* Avatar */}
            {showHeader ? (
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 overflow-hidden flex-shrink-0 cursor-pointer shadow-lg ring-2 ring-transparent hover:ring-violet-500/30 transition-all"
              >
                {message.author_avatar ? (
                  <img src={message.author_avatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">
                    {message.author_name?.charAt(0) || '?'}
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="w-11 flex-shrink-0 flex items-center justify-center">
                <span className="text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                  {format(new Date(message.created_date), 'h:mm')}
                </span>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              {showHeader && (
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-semibold text-white hover:underline cursor-pointer text-[15px]">
                    {message.author_name || 'Unknown'}
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
                  <span className="text-[11px] text-zinc-500 font-medium">
                    {formatMessageDate(message.created_date)}
                  </span>
                  {message.is_edited && (
                    <span className="text-[10px] text-zinc-600 bg-zinc-800/50 px-1.5 py-0.5 rounded">(edited)</span>
                  )}
                  {message.is_pinned && (
                    <Pin className="w-3 h-3 text-amber-400" />
                  )}
                </div>
              )}
              
              <div className="text-zinc-300 break-words whitespace-pre-wrap text-[15px] leading-relaxed">
                {message.content}
              </div>

              {/* Attachments */}
              {message.attachments?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.attachments.map((attachment, i) => (
                    <motion.div 
                      key={i} 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-2xl overflow-hidden max-w-md"
                    >
                      {attachment.content_type?.startsWith('image/') ? (
                        <img 
                          src={attachment.url} 
                          alt={attachment.filename}
                          className="max-h-80 rounded-2xl border border-zinc-800/50 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                        />
                      ) : (
                        <a 
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3.5 bg-zinc-800/40 rounded-2xl hover:bg-zinc-800/60 transition-all border border-zinc-800/30 group/attachment"
                        >
                          <div className="w-11 h-11 bg-violet-500/20 rounded-xl flex items-center justify-center group-hover/attachment:bg-violet-500/30 transition-colors">
                            📄
                          </div>
                          <div>
                            <div className="text-sm text-white font-medium">{attachment.filename}</div>
                            <div className="text-xs text-zinc-500">
                              {(attachment.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        </a>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Reactions */}
              {message.reactions?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {message.reactions.map((reaction, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onReact?.(message.id, reaction.emoji)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all",
                        reaction.users?.includes(currentUserId)
                          ? "bg-violet-500/20 border border-violet-500/40 text-violet-300 shadow-lg shadow-violet-500/10"
                          : "bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 border border-zinc-700/30"
                      )}
                    >
                      <span className="text-base">{reaction.emoji}</span>
                      <span className="text-xs font-semibold">{reaction.count}</span>
                    </motion.button>
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
            onPin={onPin}
            isOwn={isOwn}
          />
        </motion.div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-zinc-900/95 backdrop-blur-xl border-zinc-800/80 rounded-xl p-1">
        <ContextMenuItem 
          onClick={() => onReply?.(message)}
          className="text-zinc-300 focus:bg-zinc-800 rounded-lg"
        >
          <Reply className="w-4 h-4 mr-2 text-zinc-500" />
          Reply
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onThread?.(message)}
          className="text-zinc-300 focus:bg-zinc-800 rounded-lg"
        >
          <MessageSquare className="w-4 h-4 mr-2 text-zinc-500" />
          Create Thread
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => navigator.clipboard.writeText(message.content)}
          className="text-zinc-300 focus:bg-zinc-800 rounded-lg"
        >
          <Copy className="w-4 h-4 mr-2 text-zinc-500" />
          Copy Text
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onPin?.(message)}
          className="text-zinc-300 focus:bg-zinc-800 rounded-lg"
        >
          <Pin className="w-4 h-4 mr-2 text-zinc-500" />
          {message.is_pinned ? 'Unpin Message' : 'Pin Message'}
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onForward?.(message)}
          className="text-zinc-300 focus:bg-zinc-800 rounded-lg"
        >
          <Forward className="w-4 h-4 mr-2 text-zinc-500" />
          Forward
        </ContextMenuItem>
        {isOwn && (
          <>
            <ContextMenuSeparator className="bg-zinc-800/50 my-1" />
            <ContextMenuItem 
              onClick={() => onEdit?.(message)}
              className="text-zinc-300 focus:bg-zinc-800 rounded-lg"
            >
              <Pencil className="w-4 h-4 mr-2 text-zinc-500" />
              Edit
            </ContextMenuItem>
            <ContextMenuItem 
              onClick={() => onDelete?.(message.id)}
              className="text-rose-400 focus:bg-rose-500/10 rounded-lg"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
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
  onPin,
  onThread,
  onForward,
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

  const shouldShowHeader = (message, index) => {
    if (index === 0) return true;
    const prevMessage = messages[index - 1];
    if (prevMessage.author_id !== message.author_id) return true;
    const timeDiff = new Date(message.created_date) - new Date(prevMessage.created_date);
    if (timeDiff > 5 * 60 * 1000) return true;
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
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-zinc-500 text-sm">Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={listRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto scrollbar-thin"
    >
      <div className="py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <div className="w-20 h-20 bg-zinc-800/50 rounded-3xl flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-zinc-600" />
            </div>
            <p className="text-lg font-medium text-zinc-400 mb-1">No messages yet</p>
            <p className="text-sm text-zinc-600">Be the first to start the conversation</p>
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
                  onPin={onPin}
                  onThread={onThread}
                  onForward={onForward}
                />
              </React.Fragment>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}