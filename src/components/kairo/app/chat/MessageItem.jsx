import React, { useState } from 'react';
import { Reply, Pencil, Trash2, Pin, Smile, MoreHorizontal, FileText, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../ui/Avatar';
import { ContextMenu as CtxMenu } from '../ui/ContextMenu';

function formatTime(d) { return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function formatDate(d) {
  const dt = new Date(d), today = new Date(), yest = new Date(today);
  yest.setDate(yest.getDate() - 1);
  if (dt.toDateString() === today.toDateString()) return `Today at ${formatTime(d)}`;
  if (dt.toDateString() === yest.toDateString()) return `Yesterday at ${formatTime(d)}`;
  return dt.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ' at ' + formatTime(d);
}

function Reaction({ emoji, count, hasReacted, onClick }) {
  return (
    <button onClick={onClick} className={cn(
      'flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors',
      hasReacted ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] border border-transparent'
    )}>
      <span>{emoji}</span><span>{count}</span>
    </button>
  );
}

export default function MessageItem({ message, showHeader, isOwn, onReply, onEdit, onDelete, onReact, onPin }) {
  const [hover, setHover] = useState(false);

  const ctxItems = [
    { label: 'Reply', icon: <Reply className="w-4 h-4" />, onClick: onReply },
    { label: 'Copy Text', icon: <Copy className="w-4 h-4" />, onClick: () => navigator.clipboard.writeText(message.content) },
    ...(isOwn ? [{ separator: true }, { label: 'Edit', icon: <Pencil className="w-4 h-4" />, onClick: onEdit }] : []),
    { label: message.is_pinned ? 'Unpin' : 'Pin', icon: <Pin className="w-4 h-4" />, onClick: onPin },
    ...(isOwn ? [{ separator: true }, { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: onDelete, danger: true }] : []),
  ];

  return (
    <CtxMenu items={ctxItems}>
      <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        className={cn('group relative px-4 py-0.5 transition-colors', hover && 'bg-white/[0.015]',
          message.is_pinned && 'bg-amber-500/[0.03] border-l-2 border-amber-500/50 pl-[14px]')}
      >
        <div className="flex gap-4">
          {showHeader ? (
            <Avatar src={message.author_avatar} name={message.author_name} size="md" className="mt-0.5 flex-shrink-0" />
          ) : (
            <div className="w-10 flex-shrink-0 flex items-center justify-center">
              <span className="text-[10px] text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity">{formatTime(message.created_date)}</span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            {showHeader && (
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="font-medium text-white text-[14px] hover:underline cursor-pointer">{message.author_name}</span>
                <span className="text-[11px] text-zinc-700">{formatDate(message.created_date)}</span>
                {message.is_edited && <span className="text-[11px] text-zinc-700">(edited)</span>}
              </div>
            )}

            {message.reply_preview && (
              <div className="flex items-center gap-2 text-xs text-zinc-600 mb-1 pl-3 border-l-2 border-zinc-700/50">
                <span className="font-medium text-zinc-400">{message.reply_preview.author_name}</span>
                <span className="truncate">{message.reply_preview.content}</span>
              </div>
            )}

            <p className="text-[14px] text-zinc-300 break-words whitespace-pre-wrap leading-relaxed">{message.content}</p>

            {message.attachments?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {message.attachments.map((a, i) => (
                  <div key={i}>
                    {a.content_type?.startsWith('image/') ? (
                      <img src={a.url} alt={a.filename} className="max-w-sm max-h-72 rounded-lg" />
                    ) : (
                      <a href={a.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 p-3 bg-white/[0.03] rounded-lg hover:bg-white/[0.06] transition-colors">
                        <FileText className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm text-indigo-400">{a.filename}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {message.reactions?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {message.reactions.map((r, i) => (
                  <Reaction key={i} emoji={r.emoji} count={r.count} hasReacted={r.users?.includes(message.current_user_id)} onClick={() => onReact(r.emoji)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {hover && (
          <div className="absolute -top-3 right-4 flex items-center p-0.5 bg-[#1a1a1a] border border-white/[0.06] rounded shadow-lg z-10">
            <button onClick={() => onReact('👍')} className="w-7 h-7 rounded flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors">
              <Smile className="w-4 h-4" />
            </button>
            <button onClick={onReply} className="w-7 h-7 rounded flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors">
              <Reply className="w-4 h-4" />
            </button>
            {isOwn && <button onClick={onEdit} className="w-7 h-7 rounded flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors"><Pencil className="w-4 h-4" /></button>}
            {isOwn && <button onClick={onDelete} className="w-7 h-7 rounded flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>}
            <button className="w-7 h-7 rounded flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
          </div>
        )}
      </div>
    </CtxMenu>
  );
}