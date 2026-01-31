import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Reply, MoreHorizontal, Smile, Pin, Copy, Trash2, Edit2, Forward, MessageSquare, Check, CheckCheck } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import Avatar from '../primitives/Avatar';
import { BadgeGroup } from '../primitives/Badge';
import IconButton from '../primitives/IconButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Format timestamp
const formatTime = (date) => {
  const d = new Date(date);
  if (isToday(d)) return format(d, 'h:mm a');
  if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`;
  return format(d, 'MMM d, h:mm a');
};

// Parse and render @mentions
const renderContent = (content, onMentionClick) => {
  if (!content) return null;
  
  const parts = content.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      const username = part.slice(1);
      return (
        <motion.span
          key={i}
          className="text-indigo-400 hover:text-indigo-300 cursor-pointer bg-indigo-500/15 hover:bg-indigo-500/25 px-1 rounded transition-colors"
          onClick={() => onMentionClick?.(username)}
          whileHover={{ scale: 1.02 }}
        >
          {part}
        </motion.span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

// Message hover actions with glass morphism
const MessageActions = memo(({ onReply, onReact, onEdit, onDelete, onPin, onForward, canEdit, canModerate, isPinned }) => (
  <motion.div
    initial={{ opacity: 0, y: 4, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 4, scale: 0.95 }}
    className="absolute -top-5 right-4 flex items-center gap-0.5 p-1 bg-[#18181b]/90 backdrop-blur-xl border border-white/[0.1] rounded-xl shadow-xl shadow-black/20"
  >
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onReact}
      className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
    >
      <Smile className="w-4 h-4" />
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onReply}
      className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
    >
      <Reply className="w-4 h-4" />
    </motion.button>
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
    >
      <MessageSquare className="w-4 h-4" />
    </motion.button>
    
    <div className="w-px h-4 bg-white/[0.1] mx-0.5" />
    
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
        >
          <MoreHorizontal className="w-4 h-4" />
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 bg-[#18181b]/95 backdrop-blur-xl border-white/[0.1] shadow-xl">
        {canEdit && (
          <DropdownMenuItem onClick={onEdit} className="text-zinc-300 focus:text-white focus:bg-white/[0.08]">
            <Edit2 className="w-4 h-4 mr-2" /> Edit Message
          </DropdownMenuItem>
        )}
        {canModerate && (
          <DropdownMenuItem onClick={onPin} className="text-zinc-300 focus:text-white focus:bg-white/[0.08]">
            <Pin className="w-4 h-4 mr-2" /> {isPinned ? 'Unpin' : 'Pin Message'}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onForward} className="text-zinc-300 focus:text-white focus:bg-white/[0.08]">
          <Forward className="w-4 h-4 mr-2" /> Forward
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText('')} className="text-zinc-300 focus:text-white focus:bg-white/[0.08]">
          <Copy className="w-4 h-4 mr-2" /> Copy Text
        </DropdownMenuItem>
        {(canEdit || canModerate) && (
          <>
            <DropdownMenuSeparator className="bg-white/[0.08]" />
            <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-300 focus:bg-red-500/10">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  </motion.div>
));

// Attachment preview with hover effects
const Attachments = memo(({ attachments, onImageClick }) => {
  if (!attachments?.length) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {attachments.map((att, i) => {
        const isImage = att.content_type?.startsWith('image/');
        
        if (isImage) {
          return (
            <motion.img
              key={i}
              src={att.url}
              alt={att.filename}
              className="max-w-sm max-h-72 rounded-xl object-cover cursor-pointer ring-1 ring-white/[0.08]"
              onClick={() => onImageClick?.([att], 0)}
              loading="lazy"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            />
          );
        }
        
        return (
          <motion.a
            key={i}
            href={att.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-white/[0.04] to-white/[0.02] hover:from-white/[0.08] hover:to-white/[0.04] rounded-xl border border-white/[0.08] transition-all"
            whileHover={{ scale: 1.01, x: 2 }}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center">
              <span className="text-[10px] text-indigo-300 font-bold">
                {att.filename?.split('.').pop()?.toUpperCase() || 'FILE'}
              </span>
            </div>
            <div>
              <span className="text-sm text-white block">{att.filename}</span>
              {att.size && (
                <span className="text-xs text-zinc-500">{(att.size / 1024).toFixed(1)} KB</span>
              )}
            </div>
          </motion.a>
        );
      })}
    </div>
  );
});

// Reactions with animations
const Reactions = memo(({ reactions, currentUserId, onToggle }) => {
  if (!reactions?.length) return null;
  
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {reactions.map((r, i) => {
        const hasReacted = r.users?.includes(currentUserId);
        return (
          <motion.button
            key={i}
            onClick={() => onToggle(r.emoji)}
            className={cn(
              'flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs transition-all',
              hasReacted
                ? 'bg-gradient-to-r from-indigo-500/25 to-purple-500/25 border border-indigo-500/40 text-indigo-300'
                : 'bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:bg-white/[0.08] hover:border-white/[0.12]'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="text-sm">{r.emoji}</span>
            <span className="font-medium">{r.count}</span>
          </motion.button>
        );
      })}
      <motion.button
        className="w-7 h-7 rounded-lg bg-white/[0.02] border border-white/[0.06] text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] flex items-center justify-center transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Smile className="w-3.5 h-3.5" />
      </motion.button>
    </div>
  );
});

// Reply preview with styling
const ReplyPreview = memo(({ reply }) => {
  if (!reply) return null;
  
  return (
    <motion.div 
      className="flex items-center gap-2 mb-2 pl-3 border-l-2 border-indigo-500/50 bg-indigo-500/5 rounded-r-lg py-1.5 pr-3"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Reply className="w-3 h-3 text-indigo-400" />
      <span className="text-xs text-indigo-400 font-medium">{reply.author_name}</span>
      <span className="text-xs text-zinc-500 truncate max-w-[200px]">{reply.content}</span>
    </motion.div>
  );
});

function MessageItem({
  message,
  showHeader,
  isOwn,
  currentUserId,
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
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      className={cn(
        'group relative px-4 py-1.5 transition-colors',
        message.is_pinned && 'bg-gradient-to-r from-amber-500/[0.08] to-transparent border-l-2 border-amber-500/50'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
    >
      {/* Reply preview */}
      {message.reply_preview && <ReplyPreview reply={message.reply_preview} />}
      
      <div className="flex gap-4">
        {/* Avatar or timestamp placeholder */}
        {showHeader ? (
          <motion.div 
            className="flex-shrink-0 cursor-pointer"
            onClick={() => onAvatarClick?.(message)}
            whileHover={{ scale: 1.05 }}
          >
            <Avatar
              src={message.author_avatar}
              name={message.author_name}
              size="md"
            />
          </motion.div>
        ) : (
          <div className="w-10 flex-shrink-0 flex items-center justify-center">
            <span className="text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
              {format(new Date(message.created_date), 'h:mm')}
            </span>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          {showHeader && (
            <div className="flex items-center gap-2 mb-1">
              <motion.span 
                className="font-semibold text-white hover:text-indigo-300 cursor-pointer transition-colors"
                onClick={() => onAvatarClick?.(message)}
                whileHover={{ x: 1 }}
              >
                {message.author_name || 'Unknown'}
              </motion.span>
              
              {message.author_badges?.length > 0 && (
                <BadgeGroup badges={message.author_badges} size="xs" />
              )}
              
              <span className="text-[11px] text-zinc-600">
                {formatTime(message.created_date)}
              </span>
              
              {message.is_edited && (
                <span className="text-[10px] text-zinc-600 italic">(edited)</span>
              )}
            </div>
          )}
          
          {/* Message content */}
          <div className="text-[15px] text-zinc-200 leading-relaxed break-words">
            {renderContent(message.content, onMentionClick)}
          </div>
          
          {/* Attachments */}
          <Attachments attachments={message.attachments} onImageClick={onImageClick} />
          
          {/* Reactions */}
          <Reactions
            reactions={message.reactions}
            currentUserId={currentUserId}
            onToggle={(emoji) => onToggleReaction?.(message, emoji)}
          />
        </div>
      </div>
      
      {/* Hover actions */}
      <AnimatePresence>
        {showActions && (
          <MessageActions
            onReply={() => onReply?.(message)}
            onReact={() => onReact?.(message)}
            onEdit={() => onEdit?.(message)}
            onDelete={() => onDelete?.(message)}
            onPin={() => onPin?.(message)}
            onForward={() => onForward?.(message)}
            canEdit={isOwn}
            canModerate={true}
            isPinned={message.is_pinned}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default memo(MessageItem);