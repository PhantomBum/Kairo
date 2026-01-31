import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Reply, Pencil, Trash2, Pin, Smile, MoreHorizontal,
  Image as ImageIcon, FileText, Check, Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../ui/Avatar';
import Tooltip from '../ui/Tooltip';
import { ContextMenu } from '../ui/ContextMenu';

function formatTime(date) {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return `Today at ${formatTime(date)}`;
  } else if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${formatTime(date)}`;
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + formatTime(date);
}

function Reaction({ emoji, count, hasReacted, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors',
        hasReacted 
          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' 
          : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] border border-transparent'
      )}
    >
      <span>{emoji}</span>
      <span>{count}</span>
    </button>
  );
}

function ActionButton({ icon: Icon, label, onClick, danger }) {
  return (
    <Tooltip content={label}>
      <button
        onClick={onClick}
        className={cn(
          'w-7 h-7 rounded flex items-center justify-center transition-colors',
          danger 
            ? 'hover:bg-red-500/20 text-zinc-400 hover:text-red-400' 
            : 'hover:bg-white/[0.08] text-zinc-400 hover:text-white'
        )}
      >
        <Icon className="w-4 h-4" />
      </button>
    </Tooltip>
  );
}

export default function MessageItem({
  message,
  showHeader,
  isOwn,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onPin,
}) {
  const [showActions, setShowActions] = useState(false);

  const contextItems = [
    { label: 'Reply', icon: <Reply className="w-4 h-4" />, onClick: onReply },
    { label: 'Add Reaction', icon: <Smile className="w-4 h-4" />, onClick: () => onReact('👍') },
    ...(isOwn ? [
      { separator: true },
      { label: 'Edit Message', icon: <Pencil className="w-4 h-4" />, onClick: onEdit },
    ] : []),
    { label: message.is_pinned ? 'Unpin' : 'Pin Message', icon: <Pin className="w-4 h-4" />, onClick: onPin },
    ...(isOwn ? [
      { separator: true },
      { label: 'Delete Message', icon: <Trash2 className="w-4 h-4" />, onClick: onDelete, danger: true },
    ] : []),
  ];

  return (
    <ContextMenu items={contextItems}>
      <div
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        className={cn(
          'group relative px-4 py-1 -mx-4 rounded-md hover:bg-white/[0.02] transition-colors',
          message.is_pinned && 'bg-amber-500/5 border-l-2 border-amber-500/50'
        )}
      >
        {/* Pinned indicator */}
        {message.is_pinned && (
          <div className="flex items-center gap-1 text-xs text-amber-500/70 mb-1 pl-12">
            <Pin className="w-3 h-3" />
            Pinned
          </div>
        )}

        <div className="flex gap-4">
          {/* Avatar or spacer */}
          {showHeader ? (
            <Avatar
              src={message.author_avatar}
              name={message.author_name}
              size="md"
              className="mt-0.5 flex-shrink-0"
            />
          ) : (
            <div className="w-10 flex-shrink-0 flex items-center justify-center">
              <span className="text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                {formatTime(message.created_date)}
              </span>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            {showHeader && (
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="font-medium text-white hover:underline cursor-pointer">
                  {message.author_name}
                </span>
                <span className="text-xs text-zinc-600">
                  {formatDate(message.created_date)}
                </span>
                {message.is_edited && (
                  <span className="text-xs text-zinc-600">(edited)</span>
                )}
              </div>
            )}

            {/* Reply preview */}
            {message.reply_preview && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1 pl-4 border-l-2 border-zinc-700">
                <span className="font-medium">{message.reply_preview.author_name}</span>
                <span className="truncate">{message.reply_preview.content}</span>
              </div>
            )}

            {/* Message content */}
            <p className="text-zinc-200 break-words whitespace-pre-wrap">
              {message.content}
            </p>

            {/* Attachments */}
            {message.attachments?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.attachments.map((attachment, i) => (
                  <div key={i} className="relative">
                    {attachment.content_type?.startsWith('image/') ? (
                      <img
                        src={attachment.url}
                        alt={attachment.filename}
                        className="max-w-sm max-h-80 rounded-lg"
                      />
                    ) : (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-white/[0.04] rounded-lg hover:bg-white/[0.08] transition-colors"
                      >
                        <FileText className="w-5 h-5 text-zinc-400" />
                        <span className="text-sm text-indigo-400">{attachment.filename}</span>
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
                  <Reaction
                    key={i}
                    emoji={reaction.emoji}
                    count={reaction.count}
                    hasReacted={reaction.users?.includes(message.current_user_id)}
                    onClick={() => onReact(reaction.emoji)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hover actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute -top-3 right-4 flex items-center p-0.5 bg-[#111113] border border-white/[0.08] rounded-lg shadow-lg"
            >
              <ActionButton icon={Smile} label="Add Reaction" onClick={() => onReact('👍')} />
              <ActionButton icon={Reply} label="Reply" onClick={onReply} />
              {isOwn && <ActionButton icon={Pencil} label="Edit" onClick={onEdit} />}
              {isOwn && <ActionButton icon={Trash2} label="Delete" onClick={onDelete} danger />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ContextMenu>
  );
}