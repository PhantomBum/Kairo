import React from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';
import { Reply, MoreHorizontal, Smile, Pin, Pencil, Trash2, Copy, Forward, MessageSquare, Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import UserBadges from '../UserBadges';

const commonEmojis = ['👍', '❤️', '😂', '🎉', '🔥', '👀', '✅', '💯'];

function formatMessageDate(date) {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, h:mm a');
}

function MessageActions({ message, onReply, onEditClick, onDelete, onReact, onPin, isOwn }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 5, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 5, scale: 0.95 }}
      className="absolute -top-3 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200"
    >
      <div className="flex items-center bg-[#1a1a1d]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 p-1 gap-0.5">
        <Popover>
          <PopoverTrigger asChild>
            <button className="p-2 hover:bg-white/[0.08] rounded-lg text-zinc-500 hover:text-amber-400 transition-all">
              <Smile className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2 bg-[#1a1a1d]/95 backdrop-blur-xl border-white/[0.08] rounded-xl shadow-2xl" align="end">
            <div className="flex gap-1">
              {commonEmojis.map((emoji) => (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onReact?.(message.id, emoji)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-white/[0.1] rounded-lg text-lg transition-all"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        <button 
          onClick={() => onReply?.(message)}
          className="p-2 hover:bg-white/[0.08] rounded-lg text-zinc-500 hover:text-blue-400 transition-all"
        >
          <Reply className="w-4 h-4" />
        </button>

        {isOwn && (
          <button 
            onClick={() => onEditClick?.(message)}
            className="p-2 hover:bg-white/[0.08] rounded-lg text-zinc-500 hover:text-emerald-400 transition-all"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <button className="p-2 hover:bg-white/[0.08] rounded-lg text-zinc-500 hover:text-white transition-all">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-44 p-2 bg-[#1a1a1d]/95 backdrop-blur-xl border-white/[0.08] rounded-xl shadow-2xl" align="end">
            <button 
              onClick={() => navigator.clipboard.writeText(message.content)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.06] rounded-lg transition-all"
            >
              <Copy className="w-4 h-4 text-zinc-500" />
              Copy Text
            </button>
            <button 
              onClick={() => onPin?.(message)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.06] rounded-lg transition-all"
            >
              <Pin className="w-4 h-4 text-zinc-500" />
              {message.is_pinned ? 'Unpin' : 'Pin'}
            </button>
            {isOwn && (
              <button 
                onClick={() => onDelete?.(message.id)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </motion.div>
  );
}

export default function EnhancedMessageBubble({ 
  message, 
  showHeader, 
  currentUserId,
  onReply,
  onEditClick,
  onDelete,
  onReact,
  onPin,
  onAvatarClick
}) {
  const isOwn = message.author_id === currentUserId;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative px-4 py-1.5 hover:bg-white/[0.02] transition-all duration-200",
        showHeader && "mt-4 pt-2",
        message.is_pinned && "bg-gradient-to-r from-amber-500/[0.05] to-transparent border-l-2 border-amber-500/50"
      )}
    >
      {/* Reply reference */}
      {message.reply_preview && (
        <div className="flex items-center gap-2 mb-2 pl-14">
          <div className="w-6 h-6 border-l-2 border-t-2 border-zinc-700/50 rounded-tl-xl" />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] rounded-lg text-xs border border-white/[0.05]">
            <span className="text-violet-400 font-semibold">@{message.reply_preview.author_name}</span>
            <span className="text-zinc-600 truncate max-w-[200px]">{message.reply_preview.content?.slice(0, 50)}</span>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        {showHeader ? (
          <motion.div 
            whileHover={{ scale: 1.05 }}
            onClick={() => onAvatarClick?.(message)}
            className="relative w-10 h-10 rounded-2xl overflow-hidden flex-shrink-0 cursor-pointer ring-2 ring-transparent hover:ring-white/20 transition-all"
          >
            {message.author_avatar ? (
              <img src={message.author_avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                {message.author_name?.charAt(0) || '?'}
              </div>
            )}
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#121214]" />
          </motion.div>
        ) : (
          <div className="w-10 flex-shrink-0 flex items-center justify-center">
            <span className="text-[10px] text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
              {format(new Date(message.created_date), 'h:mm')}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {showHeader && (
            <div className="flex items-center gap-2 mb-1">
              <span 
                onClick={() => onAvatarClick?.(message)}
                className="font-semibold text-white hover:underline cursor-pointer text-sm"
              >
                {message.author_name || 'Unknown'}
              </span>
              <UserBadges 
                badges={message.author_badges} 
                size="xs"
                showYoutube={message.author_youtube_show_icon}
                youtubeUrl={message.author_youtube_url}
              />
              <span className="text-[10px] text-zinc-600 font-medium">
                {formatMessageDate(message.created_date)}
              </span>
              {message.is_edited && (
                <span className="text-[10px] text-zinc-700 italic">(edited)</span>
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
                      className="max-h-80 rounded-2xl border border-white/[0.05] shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    />
                  ) : (
                    <a 
                      href={attachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3.5 bg-white/[0.03] rounded-2xl hover:bg-white/[0.05] transition-all border border-white/[0.05] group/attachment"
                    >
                      <div className="w-11 h-11 bg-gradient-to-br from-violet-500/20 to-purple-500/10 rounded-xl flex items-center justify-center group-hover/attachment:from-violet-500/30 transition-colors">
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
            <div className="flex flex-wrap gap-1.5 mt-2">
              {message.reactions.map((reaction, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onReact?.(message.id, reaction.emoji)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                    reaction.users?.includes(currentUserId)
                      ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-white/[0.05] text-zinc-400 hover:bg-white/[0.08] border border-white/[0.05]"
                  )}
                >
                  <span className="text-sm">{reaction.emoji}</span>
                  <span>{reaction.count}</span>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      <MessageActions
        message={message}
        onReply={onReply}
        onEditClick={onEditClick}
        onDelete={onDelete}
        onReact={onReact}
        onPin={onPin}
        isOwn={isOwn}
      />
    </motion.div>
  );
}