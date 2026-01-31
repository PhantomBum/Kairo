import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Reply, Pencil, Trash2, Pin, Smile, MoreHorizontal,
  Image as ImageIcon, FileText, Check, Clock, Copy,
  Forward, Bookmark, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../ui/Avatar';
import Tooltip from '../ui/Tooltip';
import { ContextMenu } from '../ui/ContextMenu';
import UserProfilePopup from './UserProfilePopup';

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

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🔥', '👀', '💯'];

function Reaction({ emoji, count, hasReacted, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium transition-all',
        hasReacted 
          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm shadow-indigo-500/10' 
          : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] border border-white/[0.06]'
      )}
    >
      <span className="text-base">{emoji}</span>
      <span>{count}</span>
    </motion.button>
  );
}

function ActionButton({ icon: Icon, label, onClick, danger, active }) {
  return (
    <Tooltip content={label}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
          danger 
            ? 'hover:bg-red-500/20 text-zinc-400 hover:text-red-400' 
            : active
              ? 'bg-indigo-500/20 text-indigo-400'
              : 'hover:bg-white/[0.08] text-zinc-500 hover:text-white'
        )}
      >
        <Icon className="w-4 h-4" />
      </motion.button>
    </Tooltip>
  );
}

function QuickReactionPicker({ onSelect, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 5 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 5 }}
      className="flex items-center gap-0.5 p-1 bg-[#18181b] border border-white/[0.08] rounded-full shadow-xl"
    >
      {QUICK_REACTIONS.map((emoji) => (
        <motion.button
          key={emoji}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => { onSelect(emoji); onClose(); }}
          className="w-8 h-8 rounded-full hover:bg-white/[0.1] flex items-center justify-center text-lg"
        >
          {emoji}
        </motion.button>
      ))}
      <div className="w-px h-5 bg-white/[0.08] mx-1" />
      <motion.button
        whileHover={{ scale: 1.1 }}
        onClick={onClose}
        className="w-8 h-8 rounded-full hover:bg-white/[0.1] flex items-center justify-center text-zinc-400"
      >
        <MoreHorizontal className="w-4 h-4" />
      </motion.button>
    </motion.div>
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
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const contextItems = [
    { label: 'Reply', icon: <Reply className="w-4 h-4" />, onClick: onReply },
    { label: 'Add Reaction', icon: <Smile className="w-4 h-4" />, onClick: () => setShowReactionPicker(true) },
    { label: copied ? 'Copied!' : 'Copy Text', icon: <Copy className="w-4 h-4" />, onClick: handleCopy },
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

  // Badge display
  const badges = message.author_badges || [];
  const hasBadge = badges.length > 0;

  return (
    <ContextMenu items={contextItems}>
      <div
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => { setShowActions(false); setShowReactionPicker(false); }}
        className={cn(
          'group relative px-4 py-0.5 -mx-4 transition-colors',
          showActions && 'bg-white/[0.02]',
          message.is_pinned && 'bg-amber-500/[0.03] border-l-2 border-amber-500/50 ml-0 pl-[14px]'
        )}
      >
        {/* Pinned indicator */}
        {message.is_pinned && (
          <div className="flex items-center gap-1.5 text-[11px] text-amber-500/80 mb-1 pl-14">
            <Pin className="w-3 h-3" />
            <span className="font-medium">Pinned Message</span>
          </div>
        )}

        <div className="flex gap-4">
          {/* Avatar or timestamp spacer */}
          {showHeader ? (
            <div className="relative">
              <Avatar
                src={message.author_avatar}
                name={message.author_name}
                size="md"
                className="mt-0.5 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowProfilePopup(true)}
              />
              <AnimatePresence>
                {showProfilePopup && (
                  <UserProfilePopup
                    user={{
                      name: message.author_name,
                      avatar: message.author_avatar,
                      badges: message.author_badges,
                      id: message.author_id,
                    }}
                    onClose={() => setShowProfilePopup(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="w-10 flex-shrink-0 flex items-center justify-center">
              <span className="text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity select-none">
                {formatTime(message.created_date)}
              </span>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            {showHeader && (
              <div className="flex items-center gap-2 mb-0.5">
                <span 
                  className="font-semibold text-white hover:underline cursor-pointer"
                  onClick={() => setShowProfilePopup(true)}
                >
                  {message.author_name}
                </span>
                {/* Badges */}
                {hasBadge && (
                  <div className="flex items-center gap-1">
                    {badges.includes('owner') && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-400 rounded">OWNER</span>
                    )}
                    {badges.includes('admin') && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-500/20 text-red-400 rounded">ADMIN</span>
                    )}
                    {badges.includes('moderator') && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-500/20 text-indigo-400 rounded">MOD</span>
                    )}
                    {badges.includes('verified') && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                )}
                <span className="text-[11px] text-zinc-600">
                  {formatDate(message.created_date)}
                </span>
                {message.is_edited && (
                  <span className="text-[11px] text-zinc-600 italic">(edited)</span>
                )}
              </div>
            )}

            {/* Reply preview */}
            {message.reply_preview && (
              <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1.5 py-1 px-2 -ml-2 bg-white/[0.02] rounded border-l-2 border-indigo-500/50">
                <Reply className="w-3 h-3 rotate-180" />
                <span className="font-medium text-indigo-400">{message.reply_preview.author_name}</span>
                <span className="truncate opacity-70">{message.reply_preview.content}</span>
              </div>
            )}

            {/* Message content */}
            <p className="text-[15px] text-zinc-200 break-words whitespace-pre-wrap leading-relaxed">
              {message.content}
            </p>

            {/* Attachments */}
            {message.attachments?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.attachments.map((attachment, i) => (
                  <motion.div 
                    key={i} 
                    className="relative group/att"
                    whileHover={{ scale: 1.02 }}
                  >
                    {attachment.content_type?.startsWith('image/') ? (
                      <img
                        src={attachment.url}
                        alt={attachment.filename}
                        className="max-w-md max-h-80 rounded-xl border border-white/[0.06] cursor-pointer"
                      />
                    ) : (
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-3 bg-white/[0.04] rounded-xl hover:bg-white/[0.08] transition-colors border border-white/[0.06]"
                      >
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                          <FileText className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-indigo-400">{attachment.filename}</p>
                          <p className="text-xs text-zinc-500">{Math.round((attachment.size || 0) / 1024)} KB</p>
                        </div>
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Reactions */}
            {message.reactions?.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {message.reactions.map((reaction, i) => (
                  <Reaction
                    key={i}
                    emoji={reaction.emoji}
                    count={reaction.count}
                    hasReacted={reaction.users?.includes(message.current_user_id)}
                    onClick={() => onReact(reaction.emoji)}
                  />
                ))}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  onClick={() => setShowReactionPicker(true)}
                  className="w-7 h-7 rounded-full bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                >
                  <Smile className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Hover actions */}
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              className="absolute -top-4 right-2 flex items-center gap-0.5 p-1 bg-[#18181b] border border-white/[0.08] rounded-lg shadow-xl z-10"
            >
              {showReactionPicker ? (
                <QuickReactionPicker onSelect={onReact} onClose={() => setShowReactionPicker(false)} />
              ) : (
                <>
                  <ActionButton icon={Smile} label="Add Reaction" onClick={() => setShowReactionPicker(true)} />
                  <ActionButton icon={Reply} label="Reply" onClick={onReply} />
                  <ActionButton icon={Pin} label={message.is_pinned ? 'Unpin' : 'Pin'} onClick={onPin} active={message.is_pinned} />
                  {isOwn && <ActionButton icon={Pencil} label="Edit" onClick={onEdit} />}
                  {isOwn && <ActionButton icon={Trash2} label="Delete" onClick={onDelete} danger />}
                  <ActionButton icon={MoreHorizontal} label="More" onClick={() => {}} />
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ContextMenu>
  );
}