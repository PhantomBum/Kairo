import React, { useState, memo } from 'react';
import { motion } from 'framer-motion';
import { 
  Reply, MoreHorizontal, Smile, Pin, Copy, Trash2, Edit2,
  Check, CheckCheck, Clock, AlertCircle, Youtube
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UserBadges from '../UserBadges';

const MessageStatus = memo(({ status }) => {
  const icons = {
    sending: <Clock className="w-3 h-3 text-zinc-500" />,
    sent: <Check className="w-3 h-3 text-zinc-500" />,
    delivered: <CheckCheck className="w-3 h-3 text-zinc-500" />,
    read: <CheckCheck className="w-3 h-3 text-emerald-500" />,
    failed: <AlertCircle className="w-3 h-3 text-red-500" />
  };
  return icons[status] || null;
});

const MessageActions = memo(({ onReply, onReact, onEdit, onDelete, onCopy, onPin, canEdit, canDelete, isPinned }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="absolute -top-3 right-2 flex items-center gap-0.5 bg-[#1a1a1c] border border-white/[0.08] rounded-lg p-0.5 shadow-lg"
    >
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onReact}
              className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <Smile className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Add Reaction</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onReply}
              className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              <Reply className="w-4 h-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">Reply</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-7 h-7 rounded-md hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44 bg-[#1a1a1c] border-white/[0.08]">
          {canEdit && (
            <DropdownMenuItem onClick={onEdit} className="text-zinc-300 focus:text-white focus:bg-white/5">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Message
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onPin} className="text-zinc-300 focus:text-white focus:bg-white/5">
            <Pin className="w-4 h-4 mr-2" />
            {isPinned ? 'Unpin' : 'Pin'} Message
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onCopy} className="text-zinc-300 focus:text-white focus:bg-white/5">
            <Copy className="w-4 h-4 mr-2" />
            Copy Text
          </DropdownMenuItem>
          {canDelete && (
            <>
              <DropdownMenuSeparator className="bg-white/[0.06]" />
              <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-300 focus:bg-red-500/10">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Message
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
});

const ReplyPreview = memo(({ reply }) => {
  if (!reply) return null;
  
  return (
    <div className="flex items-center gap-2 mb-1 pl-3 border-l-2 border-indigo-500/50">
      <span className="text-xs text-indigo-400 font-medium">{reply.author_name}</span>
      <span className="text-xs text-zinc-500 truncate max-w-[200px]">{reply.content}</span>
    </div>
  );
});

const AttachmentPreview = memo(({ attachments }) => {
  if (!attachments?.length) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {attachments.map((attachment, index) => {
        const isImage = attachment.content_type?.startsWith('image/');
        
        if (isImage) {
          return (
            <div key={index} className="relative group">
              <img
                src={attachment.url}
                alt={attachment.filename}
                className="max-w-sm max-h-72 rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity"
                loading="lazy"
              />
            </div>
          );
        }
        
        return (
          <a
            key={index}
            href={attachment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded bg-indigo-500/20 flex items-center justify-center">
              <span className="text-xs text-indigo-400 font-medium">
                {attachment.filename?.split('.').pop()?.toUpperCase() || 'FILE'}
              </span>
            </div>
            <div>
              <p className="text-sm text-zinc-300">{attachment.filename}</p>
              {attachment.size && (
                <p className="text-xs text-zinc-500">{(attachment.size / 1024).toFixed(1)} KB</p>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
});

const Reactions = memo(({ reactions, currentUserId, onToggleReaction }) => {
  if (!reactions?.length) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-2">
      {reactions.map((reaction, index) => {
        const hasReacted = reaction.users?.includes(currentUserId);
        return (
          <button
            key={index}
            onClick={() => onToggleReaction(reaction.emoji)}
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors",
              hasReacted 
                ? "bg-indigo-500/20 border border-indigo-500/50 text-indigo-300"
                : "bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10"
            )}
          >
            <span>{reaction.emoji}</span>
            <span>{reaction.count}</span>
          </button>
        );
      })}
    </div>
  );
});

function ImprovedMessageBubble({
  message,
  isOwn,
  showHeader,
  currentUserId,
  onReply,
  onReact,
  onEdit,
  onDelete,
  onPin,
  onToggleReaction,
  onUserClick
}) {
  const [showActions, setShowActions] = useState(false);

  const formatTime = (date) => {
    const d = new Date(date);
    if (isToday(d)) return format(d, 'h:mm a');
    if (isYesterday(d)) return `Yesterday ${format(d, 'h:mm a')}`;
    return format(d, 'MMM d, h:mm a');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
  };

  // Parse mentions in content
  const renderContent = (content) => {
    const mentionRegex = /@(\w+)/g;
    const parts = content.split(mentionRegex);
    
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return (
          <span
            key={i}
            className="text-indigo-400 hover:text-indigo-300 cursor-pointer bg-indigo-500/10 px-1 rounded"
            onClick={() => onUserClick?.(part)}
          >
            @{part}
          </span>
        );
      }
      return <ReactMarkdown key={i} className="inline">{part}</ReactMarkdown>;
    });
  };

  return (
    <div
      className={cn(
        "group relative px-4 py-1 hover:bg-white/[0.02] transition-colors",
        message.is_pinned && "bg-amber-500/5 border-l-2 border-amber-500/50"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Reply preview */}
      {message.reply_preview && <ReplyPreview reply={message.reply_preview} />}

      <div className="flex gap-3">
        {/* Avatar - only show on header messages */}
        {showHeader ? (
          <button
            onClick={() => onUserClick?.(message.author_id)}
            className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden hover:opacity-80 transition-opacity"
          >
            {message.author_avatar ? (
              <img src={message.author_avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {message.author_name?.charAt(0) || '?'}
                </span>
              </div>
            )}
          </button>
        ) : (
          <div className="w-10 flex-shrink-0">
            {/* Timestamp on hover for non-header messages */}
            <span className="opacity-0 group-hover:opacity-100 text-[10px] text-zinc-600 transition-opacity">
              {format(new Date(message.created_date), 'h:mm')}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Header */}
          {showHeader && (
            <div className="flex items-center gap-2 mb-0.5">
              <button
                onClick={() => onUserClick?.(message.author_id)}
                className="font-medium text-white hover:underline text-sm"
              >
                {message.author_name || 'Unknown'}
              </button>
              
              {/* Badges */}
              {message.author_badges?.length > 0 && (
                <UserBadges badges={message.author_badges} size="sm" />
              )}
              
              {/* YouTube icon */}
              {message.author_youtube_url && message.author_youtube_show_icon && (
                <a
                  href={message.author_youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-red-500 hover:text-red-400"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              
              <span className="text-xs text-zinc-600">
                {formatTime(message.created_date)}
              </span>
              
              {message.is_edited && (
                <span className="text-xs text-zinc-600">(edited)</span>
              )}
            </div>
          )}

          {/* Content */}
          <div className="text-zinc-300 text-sm leading-relaxed break-words prose prose-invert prose-sm max-w-none">
            {renderContent(message.content)}
          </div>

          {/* Attachments */}
          <AttachmentPreview attachments={message.attachments} />

          {/* Reactions */}
          <Reactions
            reactions={message.reactions}
            currentUserId={currentUserId}
            onToggleReaction={onToggleReaction}
          />
        </div>

        {/* Message status for own messages */}
        {isOwn && message.status && (
          <div className="flex-shrink-0 self-end mb-1">
            <MessageStatus status={message.status} />
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <MessageActions
          onReply={() => onReply?.(message)}
          onReact={() => onReact?.(message)}
          onEdit={() => onEdit?.(message)}
          onDelete={() => onDelete?.(message)}
          onCopy={handleCopy}
          onPin={() => onPin?.(message)}
          canEdit={isOwn}
          canDelete={isOwn}
          isPinned={message.is_pinned}
        />
      )}
    </div>
  );
}

export default memo(ImprovedMessageBubble);