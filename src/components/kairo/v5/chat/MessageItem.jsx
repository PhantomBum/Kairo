import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Reply, Smile, MoreHorizontal, Pencil, Pin, Copy, Trash2, CornerUpRight, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../primitives/Avatar';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

// Quick reactions
const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

function ReactionBar({ message, onToggleReaction, currentUserId }) {
  if (!message.reactions?.length) return null;
  
  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {message.reactions.map((reaction, i) => {
        const hasReacted = reaction.users?.includes(currentUserId);
        return (
          <motion.button
            key={i}
            onClick={() => onToggleReaction?.(reaction.emoji)}
            className={cn(
              'flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs transition-colors',
              hasReacted 
                ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300' 
                : 'bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:bg-white/[0.08]'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>{reaction.emoji}</span>
            <span className="font-medium">{reaction.count}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

function MessageActions({ onReply, onReact, onMore, isOwn }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.95 }}
      className="absolute -top-4 right-4 flex items-center gap-0.5 px-1 py-0.5 bg-[#111113] border border-white/[0.08] rounded-lg shadow-xl"
    >
      {quickReactions.slice(0, 4).map(emoji => (
        <button
          key={emoji}
          onClick={() => onReact?.(emoji)}
          className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/[0.08] text-sm transition-colors"
        >
          {emoji}
        </button>
      ))}
      
      <div className="w-px h-4 bg-white/[0.08] mx-0.5" />
      
      <button
        onClick={onReply}
        className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
      >
        <Reply className="w-4 h-4" />
      </button>
      
      <button
        onClick={onMore}
        className="w-7 h-7 rounded flex items-center justify-center hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

function Attachment({ attachment }) {
  const isImage = attachment.content_type?.startsWith('image/');
  const isVideo = attachment.content_type?.startsWith('video/');
  
  if (isImage) {
    return (
      <motion.img
        src={attachment.url}
        alt={attachment.filename}
        className="max-w-sm max-h-72 rounded-lg mt-2 cursor-pointer"
        layoutId={`attachment-${attachment.url}`}
        whileHover={{ scale: 1.02 }}
      />
    );
  }
  
  if (isVideo) {
    return (
      <video
        src={attachment.url}
        controls
        className="max-w-md rounded-lg mt-2"
      />
    );
  }
  
  return (
    <div className="flex items-center gap-2 p-2 mt-2 bg-white/[0.04] border border-white/[0.06] rounded-lg max-w-xs">
      <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center flex-shrink-0">
        <Download className="w-4 h-4 text-zinc-400" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-white truncate">{attachment.filename}</p>
        <p className="text-[10px] text-zinc-500">
          {(attachment.size / 1024).toFixed(1)} KB
        </p>
      </div>
    </div>
  );
}

export default function MessageItem({
  message,
  isOwn,
  isGrouped,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onToggleReaction,
  onPin,
  onAvatarClick,
  currentUserId,
}) {
  const [isHovered, setIsHovered] = useState(false);
  
  const timestamp = new Date(message.created_date);
  const timeStr = format(timestamp, 'h:mm a');
  const fullTime = format(timestamp, 'EEEE, MMMM d, yyyy h:mm a');
  
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.div
          className={cn(
            'group relative px-4 py-0.5',
            'hover:bg-white/[0.02] transition-colors',
            isGrouped ? 'pt-0' : 'pt-3'
          )}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <div className="flex gap-3">
            {/* Avatar or timestamp */}
            {isGrouped ? (
              <div className="w-10 flex-shrink-0 flex items-center justify-center">
                <span className="text-[10px] text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  {format(timestamp, 'h:mm')}
                </span>
              </div>
            ) : (
              <button 
                onClick={onAvatarClick}
                className="flex-shrink-0 mt-0.5"
              >
                <Avatar
                  src={message.author_avatar}
                  name={message.author_name}
                  size="md"
                />
              </button>
            )}
            
            <div className="flex-1 min-w-0">
              {/* Header */}
              {!isGrouped && (
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-sm font-medium text-white hover:underline cursor-pointer">
                    {message.author_name}
                  </span>
                  <span 
                    className="text-[11px] text-zinc-600"
                    title={fullTime}
                  >
                    {timeStr}
                  </span>
                  {message.is_edited && (
                    <span className="text-[10px] text-zinc-700">(edited)</span>
                  )}
                  {message.is_pinned && (
                    <Pin className="w-3 h-3 text-amber-500" />
                  )}
                </div>
              )}
              
              {/* Reply preview */}
              {message.reply_preview && (
                <div className="flex items-center gap-1.5 mb-1 text-xs">
                  <CornerUpRight className="w-3 h-3 text-zinc-600" />
                  <span className="text-zinc-500">
                    <span className="text-zinc-400 font-medium hover:underline cursor-pointer">
                      @{message.reply_preview.author_name}
                    </span>
                    {' '}
                    {message.reply_preview.content?.slice(0, 50)}...
                  </span>
                </div>
              )}
              
              {/* Content */}
              <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </div>
              
              {/* Attachments */}
              {message.attachments?.map((att, i) => (
                <Attachment key={i} attachment={att} />
              ))}
              
              {/* Reactions */}
              <ReactionBar 
                message={message} 
                onToggleReaction={onToggleReaction}
                currentUserId={currentUserId}
              />
            </div>
          </div>
          
          {/* Hover actions */}
          <AnimatePresence>
            {isHovered && (
              <MessageActions
                onReply={onReply}
                onReact={onReact}
                onMore={() => {}}
                isOwn={isOwn}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </ContextMenuTrigger>
      
      <ContextMenuContent className="w-52 bg-[#111113] border-white/10">
        <ContextMenuItem onClick={onReply}>
          <Reply className="w-4 h-4 mr-2" />
          Reply
        </ContextMenuItem>
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Text
        </ContextMenuItem>
        <ContextMenuItem onClick={onPin}>
          <Pin className="w-4 h-4 mr-2" />
          {message.is_pinned ? 'Unpin' : 'Pin Message'}
        </ContextMenuItem>
        
        {isOwn && (
          <>
            <ContextMenuSeparator className="bg-white/[0.06]" />
            <ContextMenuItem onClick={onEdit}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Message
            </ContextMenuItem>
            <ContextMenuItem onClick={onDelete} className="text-red-400 focus:text-red-300">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Message
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}