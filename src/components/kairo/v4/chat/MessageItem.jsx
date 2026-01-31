import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Reply, MoreHorizontal, Smile, Pin, Copy, Trash2, Edit2, Forward, MessageSquare } from 'lucide-react';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
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
        <span
          key={i}
          className="text-indigo-400 hover:underline cursor-pointer bg-indigo-500/10 px-0.5 rounded"
          onClick={() => onMentionClick?.(username)}
        >
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

// Message hover actions
const MessageActions = memo(({ onReply, onReact, onEdit, onDelete, onPin, onForward, canEdit, canModerate, isPinned }) => (
  <motion.div
    initial={{ opacity: 0, y: 2 }}
    animate={{ opacity: 1, y: 0 }}
    className="absolute -top-4 right-4 flex items-center gap-0.5 p-0.5 bg-[#111113] border border-white/[0.08] rounded-lg shadow-lg"
  >
    <IconButton icon={Smile} size="xs" variant="ghost" tooltip="Add Reaction" onClick={onReact} />
    <IconButton icon={Reply} size="xs" variant="ghost" tooltip="Reply" onClick={onReply} />
    <IconButton icon={MessageSquare} size="xs" variant="ghost" tooltip="Thread" onClick={() => {}} />
    
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="w-6 h-6 flex items-center justify-center rounded text-zinc-400 hover:text-white hover:bg-white/[0.06]">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 bg-[#111113] border-white/[0.08]">
        {canEdit && (
          <DropdownMenuItem onClick={onEdit} className="text-zinc-300 focus:text-white focus:bg-white/[0.06]">
            <Edit2 className="w-4 h-4 mr-2" /> Edit
          </DropdownMenuItem>
        )}
        {canModerate && (
          <DropdownMenuItem onClick={onPin} className="text-zinc-300 focus:text-white focus:bg-white/[0.06]">
            <Pin className="w-4 h-4 mr-2" /> {isPinned ? 'Unpin' : 'Pin'}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={onForward} className="text-zinc-300 focus:text-white focus:bg-white/[0.06]">
          <Forward className="w-4 h-4 mr-2" /> Forward
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText('')} className="text-zinc-300 focus:text-white focus:bg-white/[0.06]">
          <Copy className="w-4 h-4 mr-2" /> Copy
        </DropdownMenuItem>
        {(canEdit || canModerate) && (
          <>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-300 focus:bg-red-500/10">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  </motion.div>
));

// Attachment preview
const Attachments = memo(({ attachments, onImageClick }) => {
  if (!attachments?.length) return null;
  
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {attachments.map((att, i) => {
        const isImage = att.content_type?.startsWith('image/');
        
        if (isImage) {
          return (
            <img
              key={i}
              src={att.url}
              alt={att.filename}
              className="max-w-sm max-h-64 rounded-lg object-cover cursor-pointer hover:opacity-90"
              onClick={() => onImageClick?.([att], 0)}
              loading="lazy"
            />
          );
        }
        
        return (
          <a
            key={i}
            href={att.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] hover:bg-white/[0.06] rounded-lg"
          >
            <div className="w-8 h-8 rounded bg-indigo-500/20 flex items-center justify-center">
              <span className="text-xs text-indigo-400 font-medium">
                {att.filename?.split('.').pop()?.toUpperCase() || 'FILE'}
              </span>
            </div>
            <span className="text-sm text-zinc-300">{att.filename}</span>
          </a>
        );
      })}
    </div>
  );
});

// Reactions display
const Reactions = memo(({ reactions, currentUserId, onToggle }) => {
  if (!reactions?.length) return null;
  
  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {reactions.map((r, i) => {
        const hasReacted = r.users?.includes(currentUserId);
        return (
          <button
            key={i}
            onClick={() => onToggle(r.emoji)}
            className={cn(
              'flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-colors',
              hasReacted
                ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                : 'bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:bg-white/[0.06]'
            )}
          >
            <span>{r.emoji}</span>
            <span>{r.count}</span>
          </button>
        );
      })}
    </div>
  );
});

// Reply preview
const ReplyPreview = memo(({ reply }) => {
  if (!reply) return null;
  
  return (
    <div className="flex items-center gap-2 mb-1 pl-3 border-l-2 border-indigo-500/40">
      <span className="text-xs text-indigo-400 font-medium">{reply.author_name}</span>
      <span className="text-xs text-zinc-500 truncate max-w-[200px]">{reply.content}</span>
    </div>
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
    <div
      className={cn(
        'group relative px-4 py-1 hover:bg-white/[0.02] transition-colors',
        message.is_pinned && 'bg-amber-500/5 border-l-2 border-amber-500/50'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Reply preview */}
      {message.reply_preview && <ReplyPreview reply={message.reply_preview} />}
      
      <div className="flex gap-3">
        {/* Avatar or timestamp placeholder */}
        {showHeader ? (
          <div 
            className="flex-shrink-0 cursor-pointer"
            onClick={() => onAvatarClick?.(message)}
          >
            <Avatar
              src={message.author_avatar}
              name={message.author_name}
              size="md"
            />
          </div>
        ) : (
          <div className="w-10 flex-shrink-0 flex items-center justify-center">
            <span className="text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100">
              {format(new Date(message.created_date), 'h:mm')}
            </span>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          {showHeader && (
            <div className="flex items-center gap-2 mb-0.5">
              <span 
                className="font-medium text-white hover:underline cursor-pointer"
                onClick={() => onAvatarClick?.(message)}
              >
                {message.author_name || 'Unknown'}
              </span>
              
              {message.author_badges?.length > 0 && (
                <BadgeGroup badges={message.author_badges} size="xs" />
              )}
              
              <span className="text-xs text-zinc-600">
                {formatTime(message.created_date)}
              </span>
              
              {message.is_edited && (
                <span className="text-xs text-zinc-600">(edited)</span>
              )}
            </div>
          )}
          
          {/* Message content */}
          <div className="text-sm text-zinc-300 leading-relaxed break-words">
            {renderContent(message.content, onMentionClick)}
          </div>
          
          {/* Attachments */}
          <Attachments attachments={message.attachments} onImageClick={onImageClick} />
          
          {/* Reactions */}
          <Reactions
            reactions={message.reactions}
            currentUserId={currentUserId}
            onToggle={onToggleReaction}
          />
        </div>
      </div>
      
      {/* Hover actions */}
      {showActions && (
        <MessageActions
          onReply={() => onReply?.(message)}
          onReact={() => onReact?.(message)}
          onEdit={() => onEdit?.(message)}
          onDelete={() => onDelete?.(message)}
          onPin={() => onPin?.(message)}
          onForward={() => onForward?.(message)}
          canEdit={isOwn}
          canModerate={true} // Would use usePermissions hook in production
          isPinned={message.is_pinned}
        />
      )}
    </div>
  );
}

export default memo(MessageItem);