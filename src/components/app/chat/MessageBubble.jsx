import React, { useState } from 'react';
import { Reply, Smile, Pencil, Trash2, Copy, MoreHorizontal } from 'lucide-react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';

function formatTime(d) { return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }

export default function MessageBubble({ message, compact, isOwn, onReply, onEdit, onDelete, onReact, currentUserId, onProfileClick, isEditing, onEditSave, onEditCancel }) {
  const [hovered, setHovered] = useState(false);
  const [editContent, setEditContent] = useState(message.content || '');
  const quickEmojis = ['👍', '❤️', '😂', '🔥', '👀'];

  const handleSave = () => {
    if (editContent.trim() && editContent !== message.content) onEditSave(message.id, editContent.trim());
    else onEditCancel();
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="relative group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          style={{ padding: compact ? '1px 16px' : '6px 16px', background: hovered ? 'rgba(255,255,255,0.015)' : 'transparent' }}>

          {/* Reply line */}
          {message.reply_preview && (
            <div className="flex items-center gap-1.5 ml-[52px] mb-0.5">
              <div className="w-0.5 h-3 rounded-full" style={{ background: 'var(--border-hover)' }} />
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{message.reply_preview.author_name}</span>
                {' '}{message.reply_preview.content?.slice(0, 60)}
              </span>
            </div>
          )}

          <div className="flex items-start gap-3">
            {compact ? (
              <div className="w-10 flex-shrink-0 flex items-center justify-center">
                <span className="text-[10px] opacity-0 group-hover:opacity-100 tabular-nums" style={{ color: 'var(--text-muted)' }}>
                  {formatTime(message.created_date)}
                </span>
              </div>
            ) : (
              <div onClick={() => onProfileClick?.(message.author_id)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-medium flex-shrink-0 overflow-hidden cursor-pointer hover:brightness-110"
                style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
                {message.author_avatar ? <img src={message.author_avatar} className="w-full h-full object-cover" /> : (message.author_name || 'U').charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1 min-w-0">
              {!compact && (
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-[13px] font-semibold cursor-pointer hover:underline" style={{ color: 'var(--text-primary)', textDecorationColor: 'var(--text-muted)' }}
                    onClick={() => onProfileClick?.(message.author_id)}>
                    {message.author_name || 'User'}
                  </span>
                  <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-muted)' }}>{formatTime(message.created_date)}</span>
                  {message.is_edited && <span className="text-[9px] italic" style={{ color: 'var(--text-muted)' }}>(edited)</span>}
                </div>
              )}

              {isEditing ? (
                <div>
                  <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSave(); } if (e.key === 'Escape') onEditCancel(); }}
                    className="w-full text-[13px] rounded-lg px-3 py-2 focus:outline-none resize-none"
                    style={{ background: 'var(--bg)', color: 'var(--text-primary)', border: '1px solid var(--border-hover)' }}
                    rows={2} autoFocus />
                  <div className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    esc to <button onClick={onEditCancel} className="text-blue-400 hover:underline">cancel</button> · enter to <button onClick={handleSave} className="text-blue-400 hover:underline">save</button>
                  </div>
                </div>
              ) : (
                <div className="text-[13px] leading-relaxed break-words whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                  {message.content}
                </div>
              )}

              {/* Attachments */}
              {message.attachments?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {message.attachments.map((a, i) =>
                    a.content_type?.startsWith('image/') ? (
                      <img key={i} src={a.url} className="max-w-[400px] max-h-[280px] rounded-lg object-cover" />
                    ) : (
                      <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs px-3 py-2 rounded-lg" style={{ background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        📎 {a.filename}
                      </a>
                    )
                  )}
                </div>
              )}

              {/* Reactions */}
              {message.reactions?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {message.reactions.map((r, i) => (
                    <button key={i} onClick={() => onReact(message, r.emoji)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px]"
                      style={{
                        background: r.users?.includes(currentUserId) ? 'rgba(99,102,241,0.15)' : 'var(--bg)',
                        color: r.users?.includes(currentUserId) ? '#818cf8' : 'var(--text-muted)',
                        border: `1px solid ${r.users?.includes(currentUserId) ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                      }}>
                      <span className="text-[12px]">{r.emoji}</span>{r.count}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Hover toolbar */}
          {hovered && !isEditing && (
            <div className="absolute -top-3 right-4 flex items-center p-[3px] rounded-lg gap-[2px] z-10"
              style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
              {quickEmojis.map(e => (
                <button key={e} onClick={() => onReact(message, e)}
                  className="w-7 h-7 flex items-center justify-center rounded text-sm hover:bg-[var(--bg-hover)]">{e}</button>
              ))}
              <div className="w-px h-5 mx-0.5" style={{ background: 'var(--border)' }} />
              <button onClick={() => onReply(message)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--bg-hover)]">
                <Reply className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              </button>
              {isOwn && (
                <button onClick={() => onEdit(message)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-[var(--bg-hover)]">
                  <Pencil className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                </button>
              )}
            </div>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-48 p-1" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        <ContextMenuItem onClick={() => onReply(message)} className="text-[12px] gap-2.5 rounded px-2.5 py-1.5" style={{ color: 'var(--text-secondary)' }}>
          <Reply className="w-3.5 h-3.5 opacity-60" /> Reply
        </ContextMenuItem>
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(message.content)} className="text-[12px] gap-2.5 rounded px-2.5 py-1.5" style={{ color: 'var(--text-secondary)' }}>
          <Copy className="w-3.5 h-3.5 opacity-60" /> Copy
        </ContextMenuItem>
        {isOwn && (
          <>
            <ContextMenuSeparator style={{ background: 'var(--border)' }} />
            <ContextMenuItem onClick={() => onEdit(message)} className="text-[12px] gap-2.5 rounded px-2.5 py-1.5" style={{ color: 'var(--text-secondary)' }}>
              <Pencil className="w-3.5 h-3.5 opacity-60" /> Edit
            </ContextMenuItem>
            <ContextMenuItem onClick={() => onDelete(message)} className="text-[12px] gap-2.5 rounded px-2.5 py-1.5 text-red-400">
              <Trash2 className="w-3.5 h-3.5 opacity-60" /> Delete
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}