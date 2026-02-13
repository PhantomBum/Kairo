import React, { useState } from 'react';
import { Reply, Smile, Pin, Pencil, Trash2, Copy, MessageSquareText, Forward, Bookmark, MoreHorizontal } from 'lucide-react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function Reaction({ emoji, count, reacted, onClick }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1 px-2 py-[3px] rounded-md text-xs transition-all duration-100 hover:scale-105"
      style={{
        background: reacted ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
        color: reacted ? '#818cf8' : '#888',
        border: reacted ? '1px solid rgba(99,102,241,0.25)' : '1px solid rgba(255,255,255,0.04)',
      }}>
      <span className="text-[13px]">{emoji}</span><span className="text-[11px] font-medium">{count}</span>
    </button>
  );
}

function renderContent(text) {
  if (!text) return null;
  const parts = text.split(/(@everyone|@here)/g);
  return parts.map((part, i) => {
    if (part === '@everyone' || part === '@here') {
      return <span key={i} className="px-0.5 rounded font-medium" style={{ background: 'rgba(250,176,5,0.15)', color: '#fbbf24' }}>{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ChatBubble({ message, compact, isOwn, onReply, onEdit, onDelete, onReact, onPin, onThread, currentUserId, onProfileClick, isEditing, onEditSave, onEditCancel, isDM }) {
  const [hovered, setHovered] = useState(false);
  const [editContent, setEditContent] = useState(message.content || '');
  const quickEmojis = ['👍', '❤️', '😂', '🔥', '💀', '👀'];

  const handleEditSave = () => {
    if (editContent.trim() && editContent !== message.content) onEditSave(message.id, editContent.trim());
    else onEditCancel();
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="relative group"
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          style={{
            padding: compact ? '1px 16px 1px 16px' : '4px 16px 4px 16px',
            background: hovered ? 'rgba(255,255,255,0.015)' : 'transparent',
            transition: 'background 80ms ease',
          }}>
          
          {/* Reply preview */}
          {message.reply_preview && (
            <div className="flex items-center gap-1.5 ml-[52px] mb-0.5">
              <div className="w-[2px] h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.12)' }} />
              <span className="text-[11px] text-zinc-500 truncate max-w-[400px]">
                <span className="font-medium text-zinc-400 hover:underline cursor-pointer">{message.reply_preview.author_name}</span>
                {' '}{message.reply_preview.content?.slice(0, 70)}
              </span>
            </div>
          )}

          <div className="flex items-start gap-3">
            {compact ? (
              <div className="w-10 flex-shrink-0 flex items-center justify-center pt-0.5">
                <span className="text-[10px] text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity select-none tabular-nums">
                  {formatTime(message.created_date)}
                </span>
              </div>
            ) : (
              <div onClick={() => onProfileClick?.(message.author_id)}
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-[13px] font-semibold overflow-hidden cursor-pointer hover:shadow-lg hover:brightness-110 transition-all"
                style={{ background: 'rgba(255,255,255,0.06)', color: '#888' }}>
                {message.author_avatar ? <img src={message.author_avatar} className="w-full h-full object-cover" /> : (message.author_name || 'U').charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              {!compact && (
                <div className="flex items-center gap-1.5 mb-[2px]">
                  <span className="text-[14px] font-medium text-white cursor-pointer hover:underline decoration-white/30" onClick={() => onProfileClick?.(message.author_id)}>
                    {message.author_name || 'User'}
                  </span>
                  {message.author_badges?.map((b, i) => (
                    <span key={i} className="text-[8px] px-1.5 py-[1px] rounded-full font-bold uppercase tracking-wider" style={{
                      background: b === 'owner' ? 'rgba(245,158,11,0.15)' : b === 'premium' ? 'rgba(168,85,247,0.15)' : b === 'developer' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                      color: b === 'owner' ? '#f59e0b' : b === 'premium' ? '#a855f7' : b === 'developer' ? '#10b981' : '#666',
                    }}>{b}</span>
                  ))}
                  <span className="text-[11px] text-zinc-600 tabular-nums">{formatTime(message.created_date)}</span>
                  {message.is_edited && <span className="text-[10px] text-zinc-700 italic">(edited)</span>}
                  {message.is_pinned && <Pin className="w-3 h-3 text-yellow-500/60" />}
                </div>
              )}

              {isEditing ? (
                <div>
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditSave(); } if (e.key === 'Escape') onEditCancel(); }}
                    className="w-full text-[14px] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500/40 resize-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.3)' }}
                    rows={2} autoFocus />
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-zinc-600">
                      escape to <button onClick={onEditCancel} className="text-blue-400 hover:underline">cancel</button> • enter to <button onClick={handleEditSave} className="text-blue-400 hover:underline">save</button>
                    </span>
                  </div>
                </div>
              ) : (
                <div className={`text-[14px] leading-[1.5] break-words whitespace-pre-wrap ${message.content?.includes('@everyone') ? 'bg-amber-500/5 -mx-1 px-1 py-0.5 rounded border-l-2 border-amber-500/30' : ''}`}
                  style={{ color: '#dbdee1' }}>
                  {renderContent(message.content)}
                </div>
              )}

              {/* Attachments */}
              {message.attachments?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {message.attachments.map((att, i) => (
                    att.content_type?.startsWith('image/') ? (
                      <img key={i} src={att.url} className="max-w-[420px] max-h-[300px] rounded-xl object-cover cursor-pointer hover:brightness-110 transition-all shadow-lg" />
                    ) : (
                      <a key={i} href={att.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-white transition-colors"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        📎 {att.filename} {att.size && <span className="text-zinc-600">{(att.size / 1024).toFixed(1)}KB</span>}
                      </a>
                    )
                  ))}
                </div>
              )}

              {/* Reactions */}
              {message.reactions?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {message.reactions.map((r, i) => (
                    <Reaction key={i} emoji={r.emoji} count={r.count} reacted={r.users?.includes(currentUserId)} onClick={() => onReact(message, r.emoji)} />
                  ))}
                  <button onClick={() => onReact(message, '👍')} className="w-7 h-7 rounded-md flex items-center justify-center text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.04] transition-all"
                    style={{ border: '1px dashed rgba(255,255,255,0.06)' }}>
                    <Smile className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Hover toolbar */}
          {hovered && !isEditing && (
            <div className="absolute -top-3.5 right-4 flex items-center p-[3px] rounded-lg z-10 gap-[2px]"
              style={{ background: '#151515', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
              {quickEmojis.map(e => (
                <button key={e} onClick={() => onReact(message, e)}
                  className="w-[30px] h-[30px] flex items-center justify-center rounded-md text-[15px] hover:bg-white/[0.08] transition-all hover:scale-110">{e}</button>
              ))}
              <div className="w-px h-5 mx-0.5" style={{ background: 'rgba(255,255,255,0.06)' }} />
              <button onClick={() => onReply(message)} className="w-[30px] h-[30px] flex items-center justify-center rounded-md hover:bg-white/[0.08] transition-all" title="Reply">
                <Reply className="w-4 h-4 text-zinc-400" />
              </button>
              {!isDM && onThread && (
                <button onClick={() => onThread(message)} className="w-[30px] h-[30px] flex items-center justify-center rounded-md hover:bg-white/[0.08] transition-all" title="Thread">
                  <MessageSquareText className="w-4 h-4 text-zinc-400" />
                </button>
              )}
              {isOwn && (
                <button onClick={() => onEdit(message)} className="w-[30px] h-[30px] flex items-center justify-center rounded-md hover:bg-white/[0.08] transition-all" title="Edit">
                  <Pencil className="w-3.5 h-3.5 text-zinc-400" />
                </button>
              )}
            </div>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-52 p-1" style={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        <ContextMenuItem onClick={() => onReply(message)} className="text-[13px] text-zinc-300 focus:text-white focus:bg-white/[0.06] rounded-md px-2.5 py-[6px] gap-2.5">
          <Reply className="w-4 h-4 opacity-60" /> Reply
        </ContextMenuItem>
        {!isDM && onThread && (
          <ContextMenuItem onClick={() => onThread(message)} className="text-[13px] text-zinc-300 focus:text-white focus:bg-white/[0.06] rounded-md px-2.5 py-[6px] gap-2.5">
            <MessageSquareText className="w-4 h-4 opacity-60" /> Create Thread
          </ContextMenuItem>
        )}
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(message.content)} className="text-[13px] text-zinc-300 focus:text-white focus:bg-white/[0.06] rounded-md px-2.5 py-[6px] gap-2.5">
          <Copy className="w-4 h-4 opacity-60" /> Copy Text
        </ContextMenuItem>
        {!isDM && onPin && (
          <ContextMenuItem onClick={() => onPin(message)} className="text-[13px] text-zinc-300 focus:text-white focus:bg-white/[0.06] rounded-md px-2.5 py-[6px] gap-2.5">
            <Pin className="w-4 h-4 opacity-60" /> {message.is_pinned ? 'Unpin' : 'Pin'} Message
          </ContextMenuItem>
        )}
        <ContextMenuItem className="text-[13px] text-zinc-300 focus:text-white focus:bg-white/[0.06] rounded-md px-2.5 py-[6px] gap-2.5">
          <Bookmark className="w-4 h-4 opacity-60" /> Save Message
        </ContextMenuItem>
        {isOwn && (
          <>
            <ContextMenuSeparator className="my-1" style={{ background: 'rgba(255,255,255,0.04)' }} />
            <ContextMenuItem onClick={() => onEdit(message)} className="text-[13px] text-zinc-300 focus:text-white focus:bg-white/[0.06] rounded-md px-2.5 py-[6px] gap-2.5">
              <Pencil className="w-4 h-4 opacity-60" /> Edit Message
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onDelete(message)} className="text-[13px] text-red-400 focus:text-red-300 focus:bg-red-500/10 rounded-md px-2.5 py-[6px] gap-2.5">
              <Trash2 className="w-4 h-4 opacity-60" /> Delete Message
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}