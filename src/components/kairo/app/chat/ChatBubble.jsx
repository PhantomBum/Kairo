import React, { useState } from 'react';
import { Reply, Smile, Pin, Pencil, Trash2, Copy, MoreHorizontal } from 'lucide-react';
import {
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger
} from '@/components/ui/context-menu';

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function Reaction({ emoji, count, reacted, onClick }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs transition-colors"
      style={{
        background: reacted ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
        color: reacted ? '#fff' : '#888',
      }}>
      <span>{emoji}</span>
      <span>{count}</span>
    </button>
  );
}

function renderContent(text) {
  if (!text) return null;
  const parts = text.split(/(@everyone|@here)/g);
  return parts.map((part, i) => {
    if (part === '@everyone' || part === '@here') {
      return <span key={i} className="px-1 rounded font-medium" style={{ background: 'rgba(250,176,5,0.2)', color: '#fbbf24' }}>{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ChatBubble({ message, compact, isOwn, onReply, onEdit, onDelete, onReact, onPin, currentUserId }) {
  const [hovered, setHovered] = useState(false);

  const quickEmojis = ['👍', '❤️', '😂', '🔥'];

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="relative group"
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          style={{ padding: compact ? '2px 8px' : '6px 8px' }}>
          
          {/* Reply preview */}
          {message.reply_preview && (
            <div className="flex items-center gap-1.5 ml-14 mb-0.5">
              <div className="w-0.5 h-3 rounded-full" style={{ background: '#333' }} />
              <span className="text-[11px] text-zinc-500 truncate">
                <span className="font-medium text-zinc-400">{message.reply_preview.author_name}</span>
                {' '}{message.reply_preview.content?.slice(0, 60)}
              </span>
            </div>
          )}

          <div className="flex items-start gap-3">
            {compact ? (
              <div className="w-10 flex-shrink-0 flex items-center justify-center">
                <span className="text-[10px] text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity select-none">
                  {formatTime(message.created_date)}
                </span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-semibold overflow-hidden"
                style={{ background: '#1a1a1a', color: '#888' }}>
                {message.author_avatar ? (
                  <img src={message.author_avatar} className="w-full h-full object-cover" />
                ) : (
                  (message.author_name || 'U').charAt(0).toUpperCase()
                )}
              </div>
            )}

            <div className="flex-1 min-w-0">
              {!compact && (
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-white">{message.author_name || 'User'}</span>
                  <span className="text-[11px] text-zinc-600">{formatTime(message.created_date)}</span>
                  {message.is_edited && <span className="text-[10px] text-zinc-600">(edited)</span>}
                </div>
              )}
              <div className={`text-[14px] leading-[1.5] break-words whitespace-pre-wrap ${message.content?.includes('@everyone') ? 'bg-amber-500/10 -mx-1 px-1 py-0.5 rounded border-l-2 border-amber-500/40' : ''}`}
                style={{ color: '#dbdee1' }}>
                {renderContent(message.content)}
              </div>

              {/* Attachments */}
              {message.attachments?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {message.attachments.map((att, i) => (
                    att.content_type?.startsWith('image/') ? (
                      <img key={i} src={att.url} className="max-w-[300px] max-h-[200px] rounded object-cover" />
                    ) : (
                      <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded text-xs text-zinc-400 hover:text-white transition-colors"
                        style={{ background: '#1a1a1a' }}>
                        📎 {att.filename}
                      </a>
                    )
                  ))}
                </div>
              )}

              {/* Reactions */}
              {message.reactions?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {message.reactions.map((r, i) => (
                    <Reaction key={i} emoji={r.emoji} count={r.count}
                      reacted={r.users?.includes(currentUserId)}
                      onClick={() => onReact(message, r.emoji)} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hover toolbar */}
          {hovered && (
            <div className="absolute -top-3 right-2 flex items-center gap-0.5 p-0.5 rounded"
              style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.08)' }}>
              {quickEmojis.map(e => (
                <button key={e} onClick={() => onReact(message, e)}
                  className="w-7 h-7 flex items-center justify-center rounded text-sm hover:bg-white/10 transition-colors">
                  {e}
                </button>
              ))}
              <button onClick={() => onReply(message)}
                className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors">
                <Reply className="w-3.5 h-3.5 text-zinc-400" />
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors">
                <MoreHorizontal className="w-3.5 h-3.5 text-zinc-400" />
              </button>
            </div>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)' }}>
        <ContextMenuItem onClick={() => onReply(message)} className="text-zinc-300 focus:text-white focus:bg-white/[0.06]">
          <Reply className="w-4 h-4 mr-2" /> Reply
        </ContextMenuItem>
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(message.content)} className="text-zinc-300 focus:text-white focus:bg-white/[0.06]">
          <Copy className="w-4 h-4 mr-2" /> Copy Text
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onPin(message)} className="text-zinc-300 focus:text-white focus:bg-white/[0.06]">
          <Pin className="w-4 h-4 mr-2" /> {message.is_pinned ? 'Unpin' : 'Pin'}
        </ContextMenuItem>
        {isOwn && (
          <>
            <ContextMenuSeparator className="bg-white/[0.06]" />
            <ContextMenuItem onClick={() => onEdit(message)} className="text-zinc-300 focus:text-white focus:bg-white/[0.06]">
              <Pencil className="w-4 h-4 mr-2" /> Edit
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onDelete(message)} className="text-red-400 focus:text-red-300 focus:bg-red-500/10">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}