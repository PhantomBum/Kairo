// Kairo Chat View v3.0 - Clean, focused messaging experience

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { 
  Hash, Bell, Pin, Search, Users, Reply, MoreHorizontal, 
  Smile, Pencil, Trash2, Copy, Forward, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Text, Avatar, IconButton, Divider } from '../ui/DesignSystem';
import UserBadges from '../UserBadges';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

const quickEmojis = ['👍', '❤️', '😂', '🎉', '🔥', '👀'];

function formatTime(date) {
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
    <div className="flex items-center gap-4 py-4 px-4">
      <div className="flex-1 h-px bg-white/[0.04]" />
      <Text variant="tiny" color="muted" weight="medium" className="uppercase tracking-wider">
        {label}
      </Text>
      <div className="flex-1 h-px bg-white/[0.04]" />
    </div>
  );
}

// Message actions toolbar
function MessageToolbar({ message, onReply, onEdit, onDelete, onReact, onPin, isOwn }) {
  return (
    <div className="absolute -top-3 right-4 opacity-0 group-hover:opacity-100 transition-all z-10">
      <div className="flex items-center bg-[#111114] border border-white/[0.06] rounded-lg shadow-xl p-0.5 gap-0.5">
        {/* Quick reactions */}
        <Popover>
          <PopoverTrigger asChild>
            <IconButton size="sm" variant="ghost">
              <Smile className="w-3.5 h-3.5" />
            </IconButton>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1.5 bg-[#111114] border-white/[0.06] rounded-lg" align="end">
            <div className="flex gap-0.5">
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReact?.(message.id, emoji)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/[0.06] rounded-md transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        <IconButton size="sm" variant="ghost" onClick={() => onReply?.(message)}>
          <Reply className="w-3.5 h-3.5" />
        </IconButton>

        {isOwn && (
          <IconButton size="sm" variant="ghost" onClick={() => onEdit?.(message)}>
            <Pencil className="w-3.5 h-3.5" />
          </IconButton>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <IconButton size="sm" variant="ghost">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </IconButton>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-1.5 bg-[#111114] border-white/[0.06] rounded-xl" align="end">
            <button 
              onClick={() => navigator.clipboard.writeText(message.content)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.04] rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4 text-zinc-500" />
              Copy Text
            </button>
            <button 
              onClick={() => onPin?.(message)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.04] rounded-lg transition-colors"
            >
              <Pin className="w-4 h-4 text-zinc-500" />
              {message.is_pinned ? 'Unpin' : 'Pin'}
            </button>
            {isOwn && (
              <button 
                onClick={() => onDelete?.(message.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
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

// Single message component
function Message({ 
  message, 
  showHeader, 
  currentUserId, 
  onReply, 
  onEdit, 
  onDelete, 
  onReact, 
  onPin,
  onAvatarClick 
}) {
  const isOwn = message.author_id === currentUserId;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={cn(
            "group relative px-4 py-1 hover:bg-white/[0.015] transition-colors",
            showHeader && "mt-4 pt-1",
            message.is_pinned && "bg-amber-500/[0.03] border-l-2 border-amber-500/40"
          )}
        >
          {/* Reply reference */}
          {message.reply_preview && (
            <div className="flex items-center gap-2 mb-2 pl-12">
              <div className="w-5 h-5 border-l-2 border-t-2 border-zinc-700/50 rounded-tl-lg" />
              <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white/[0.02] rounded-lg text-xs">
                <span className="text-violet-400 font-medium">@{message.reply_preview.author_name}</span>
                <span className="text-zinc-500 truncate max-w-[200px]">{message.reply_preview.content?.slice(0, 50)}</span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {/* Avatar */}
            {showHeader ? (
              <div 
                onClick={() => onAvatarClick?.(message)}
                className="cursor-pointer"
              >
                <Avatar 
                  src={message.author_avatar} 
                  name={message.author_name}
                  size="md"
                />
              </div>
            ) : (
              <div className="w-9 flex-shrink-0 flex items-center justify-center">
                <Text variant="tiny" color="muted" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  {format(new Date(message.created_date), 'h:mm')}
                </Text>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
              {showHeader && (
                <div className="flex items-center gap-2 mb-0.5">
                  <span 
                    onClick={() => onAvatarClick?.(message)}
                    className="font-medium text-white hover:underline cursor-pointer text-[13px]"
                  >
                    {message.author_name || 'Unknown'}
                  </span>
                  <UserBadges 
                    badges={message.author_badges} 
                    size="xs"
                    showYoutube={message.author_youtube_show_icon}
                    youtubeUrl={message.author_youtube_url}
                  />
                  <Text variant="tiny" color="muted">
                    {formatTime(message.created_date)}
                  </Text>
                  {message.is_edited && (
                    <Text variant="tiny" color="muted">(edited)</Text>
                  )}
                  {message.is_pinned && (
                    <Pin className="w-3 h-3 text-amber-400" />
                  )}
                </div>
              )}
              
              <div className="text-[14px] text-zinc-300 break-words whitespace-pre-wrap leading-relaxed">
                {message.content}
              </div>

              {/* Attachments */}
              {message.attachments?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {message.attachments.map((attachment, i) => (
                    <div key={i} className="rounded-xl overflow-hidden max-w-md">
                      {attachment.content_type?.startsWith('image/') ? (
                        <img 
                          src={attachment.url} 
                          alt={attachment.filename}
                          className="max-h-80 rounded-xl border border-white/[0.04]"
                        />
                      ) : (
                        <a 
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl hover:bg-white/[0.05] transition-colors border border-white/[0.04]"
                        >
                          <div className="w-10 h-10 bg-violet-500/20 rounded-lg flex items-center justify-center">
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
                    </div>
                  ))}
                </div>
              )}

              {/* Reactions */}
              {message.reactions?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {message.reactions.map((reaction, i) => (
                    <button
                      key={`${reaction.emoji}-${i}`}
                      onClick={() => onReact?.(message.id, reaction.emoji)}
                      className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-md text-xs transition-all",
                        reaction.users?.includes(currentUserId)
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-white/[0.04] text-zinc-400 hover:bg-white/[0.06] border border-transparent"
                      )}
                    >
                      <span>{reaction.emoji}</span>
                      <span className="font-medium">{reaction.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <MessageToolbar
            message={message}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onReact={onReact}
            onPin={onPin}
            isOwn={isOwn}
          />
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-[#111114] border-white/[0.06] rounded-xl p-1.5">
        <ContextMenuItem 
          onClick={() => onReply?.(message)}
          className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2 text-sm"
        >
          <Reply className="w-4 h-4 mr-2.5 text-zinc-500" />
          Reply
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => navigator.clipboard.writeText(message.content)}
          className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2 text-sm"
        >
          <Copy className="w-4 h-4 mr-2.5 text-zinc-500" />
          Copy Text
        </ContextMenuItem>
        <ContextMenuItem 
          onClick={() => onPin?.(message)}
          className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2 text-sm"
        >
          <Pin className="w-4 h-4 mr-2.5 text-zinc-500" />
          {message.is_pinned ? 'Unpin' : 'Pin'}
        </ContextMenuItem>
        {isOwn && (
          <>
            <ContextMenuSeparator className="bg-white/[0.04] my-1" />
            <ContextMenuItem 
              onClick={() => onEdit?.(message)}
              className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2 text-sm"
            >
              <Pencil className="w-4 h-4 mr-2.5 text-zinc-500" />
              Edit
            </ContextMenuItem>
            <ContextMenuItem 
              onClick={() => onDelete?.(message.id)}
              className="text-red-400 focus:bg-red-500/10 rounded-lg px-3 py-2 text-sm"
            >
              <Trash2 className="w-4 h-4 mr-2.5" />
              Delete
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}

// Channel header
export function ChannelHeader({ channel, memberCount, showMembers, onToggleMembers, onShowPinned, showPinned, onMenuToggle }) {
  return (
    <div className="h-14 px-4 flex items-center justify-between border-b border-white/[0.04] bg-[#09090b]">
      <div className="flex items-center gap-2.5">
        <button onClick={onMenuToggle} className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.04]">
          <Hash className="w-5 h-5" />
        </button>
        <Hash className="hidden md:block w-5 h-5 text-zinc-500" />
        <Text variant="body" color="primary" weight="semibold">{channel?.name || 'general'}</Text>
        {channel?.topic && (
          <>
            <div className="hidden md:block w-px h-5 bg-white/[0.06]" />
            <Text variant="small" color="tertiary" className="hidden md:inline truncate max-w-[300px]">
              {channel.topic}
            </Text>
          </>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        <IconButton onClick={() => {}} variant="ghost">
          <Bell className="w-4.5 h-4.5" />
        </IconButton>
        <IconButton onClick={onShowPinned} variant="ghost" active={showPinned}>
          <Pin className="w-4.5 h-4.5" />
        </IconButton>
        <IconButton onClick={() => window.dispatchEvent(new CustomEvent('kairo:open-search'))} variant="ghost">
          <Search className="w-4.5 h-4.5" />
        </IconButton>
        <IconButton onClick={onToggleMembers} variant="ghost" active={showMembers}>
          <Users className="w-4.5 h-4.5" />
        </IconButton>
      </div>
    </div>
  );
}

// Message list
export function MessageListV3({ 
  messages = [], 
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onPin,
  onAvatarClick,
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
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 100);
  };

  const shouldShowHeader = (message, index) => {
    if (index === 0) return true;
    const prev = messages[index - 1];
    if (prev.author_id !== message.author_id) return true;
    return new Date(message.created_date) - new Date(prev.created_date) > 5 * 60 * 1000;
  };

  const shouldShowDateDivider = (message, index) => {
    if (index === 0) return true;
    return !isSameDay(new Date(message.created_date), new Date(messages[index - 1].created_date));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <Text variant="small" color="tertiary">Loading messages...</Text>
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
            <div className="w-16 h-16 bg-white/[0.03] rounded-2xl flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-zinc-600" />
            </div>
            <Text variant="body" color="secondary" weight="medium" className="mb-1">No messages yet</Text>
            <Text variant="small" color="muted">Start the conversation</Text>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message, index) => (
              <React.Fragment key={message.id || `msg-${index}`}>
                {shouldShowDateDivider(message, index) && (
                  <DateDivider date={message.created_date} />
                )}
                <Message
                  message={message}
                  showHeader={shouldShowHeader(message, index)}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReact={onReact}
                  onPin={onPin}
                  onAvatarClick={onAvatarClick}
                />
              </React.Fragment>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}