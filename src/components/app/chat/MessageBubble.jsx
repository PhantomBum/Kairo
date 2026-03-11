import React, { useState, memo } from 'react';
import { Reply, Pencil, Trash2, Copy, Pin, PinOff, Link, Smile } from 'lucide-react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import ProgressiveImage from '@/components/app/performance/ProgressiveImage';
import { colors, shadows } from '@/components/app/design/tokens';

function ts(d) { return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }

function renderText(text) {
  if (!text) return null;
  return text.split(/(https?:\/\/[^\s]+|@everyone|@here|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((p, i) => {
    if (p.match(/^https?:\/\//)) return <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 break-all hover:no-underline" style={{ color: colors.text.link }}>{p}</a>;
    if (p === '@everyone' || p === '@here') return <span key={i} className="px-1 rounded" style={{ background: `${colors.info}20`, color: colors.info }}>{p}</span>;
    if (p.match(/^\*\*.*\*\*$/)) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.match(/^\*.*\*$/)) return <em key={i}>{p.slice(1, -1)}</em>;
    if (p.match(/^`.*`$/)) return <code key={i} className="px-1.5 py-0.5 rounded text-[12px]" style={{ background: colors.bg.overlay, color: colors.accent.primary }}>{p.slice(1, -1)}</code>;
    return p;
  });
}

const MessageBubble = memo(function MessageBubble({ message, compact, isOwn, onReply, onEdit, onDelete, onReact, onPin, currentUserId, onProfileClick, isEditing, onEditSave, onEditCancel, onImageClick }) {
  const [hovered, setHovered] = useState(false);
  const [editText, setEditText] = useState(message.content || '');
  const quickEmojis = ['👍', '❤️', '😂', '🔥', '👀'];
  const saveFn = () => { if (editText.trim() && editText !== message.content) onEditSave(message.id, editText.trim()); else onEditCancel(); };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="relative group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          style={{
            padding: compact ? '2px 16px 2px 16px' : '4px 16px 4px 16px',
            background: hovered ? 'rgba(255,255,255,0.02)' : message.is_pinned ? `${colors.warning}06` : 'transparent',
            transition: 'background 0.1s',
          }}>

          {/* Pinned indicator */}
          {message.is_pinned && !compact && (
            <div className="flex items-center gap-1 ml-[56px] mb-0.5">
              <Pin className="w-3 h-3" style={{ color: colors.warning }} />
              <span className="text-[11px] font-medium" style={{ color: colors.warning, opacity: 0.7 }}>Pinned</span>
            </div>
          )}

          {/* Reply preview */}
          {message.reply_preview && (
            <div className="flex items-center gap-2 ml-[56px] mb-0.5 cursor-pointer hover:opacity-80">
              <div className="w-[3px] h-4 rounded-full flex-shrink-0" style={{ background: colors.accent.primary }} />
              <span className="text-[12px] truncate" style={{ color: colors.text.muted }}>
                <span className="font-semibold" style={{ color: colors.text.secondary }}>{message.reply_preview.author_name}</span>
                {' '}<span>{message.reply_preview.content?.slice(0, 60)}</span>
              </span>
            </div>
          )}

          <div className="flex items-start gap-3">
            {/* Avatar or timestamp */}
            {compact ? (
              <div className="w-10 flex-shrink-0 flex items-center justify-center">
                <span className="text-[11px] opacity-0 group-hover:opacity-100 tabular-nums select-none" style={{ color: colors.text.disabled }}>{ts(message.created_date)}</span>
              </div>
            ) : (
              <button onClick={() => onProfileClick?.(message.author_id)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-semibold flex-shrink-0 overflow-hidden hover:opacity-80 transition-opacity mt-0.5"
                style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                {message.author_avatar ? <img src={message.author_avatar} className="w-full h-full object-cover" alt="" /> : (message.author_name || 'U').charAt(0).toUpperCase()}
              </button>
            )}

            <div className="flex-1 min-w-0">
              {!compact && (
                <div className="flex items-baseline gap-2 mb-0.5">
                  <button onClick={() => onProfileClick?.(message.author_id)} className="text-[14px] font-semibold hover:underline" style={{ color: colors.text.primary, textDecorationColor: colors.text.disabled }}>
                    {message.author_name || 'User'}
                  </button>
                  {message.author_badges?.includes('owner') && <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: `${colors.warning}20`, color: colors.warning }}>OWNER</span>}
                  {message.author_badges?.includes('admin') && <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold" style={{ background: `${colors.info}20`, color: colors.info }}>ADMIN</span>}
                  <span className="text-[11px] tabular-nums select-none" style={{ color: colors.text.disabled }}>{ts(message.created_date)}</span>
                  {message.is_edited && <span className="text-[11px]" style={{ color: colors.text.disabled }}>(edited)</span>}
                </div>
              )}

              {/* Content */}
              {isEditing ? (
                <div>
                  <textarea value={editText} onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveFn(); } if (e.key === 'Escape') onEditCancel(); }}
                    className="w-full text-[14px] rounded-lg px-3 py-2 outline-none resize-none" style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.accent.primary}` }}
                    rows={2} autoFocus />
                  <div className="text-[11px] mt-1" style={{ color: colors.text.disabled }}>
                    escape to <button onClick={onEditCancel} className="underline" style={{ color: colors.text.link }}>cancel</button> · enter to <button onClick={saveFn} className="underline" style={{ color: colors.text.link }}>save</button>
                  </div>
                </div>
              ) : (
                <div className="text-[15px] leading-[1.5] break-words whitespace-pre-wrap" style={{ color: colors.text.secondary }}>{renderText(message.content)}</div>
              )}

              {/* Attachments */}
              {message.attachments?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {message.attachments.map((a, i) => {
                    if (a.content_type?.startsWith('image/')) return <ProgressiveImage key={i} src={a.url} alt={a.filename} className="max-w-[400px] max-h-[280px] rounded-xl cursor-pointer hover:brightness-110 transition-all" style={{ border: `1px solid ${colors.border.default}` }} onClick={() => onImageClick?.(a.url, a.filename)} />;
                    if (a.content_type?.startsWith('video/')) return <video key={i} src={a.url} controls className="max-w-[400px] rounded-xl" style={{ border: `1px solid ${colors.border.default}` }} />;
                    if (a.content_type?.startsWith('audio/')) return <audio key={i} src={a.url} controls className="max-w-[300px]" />;
                    return <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[13px] px-3 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.04)]" style={{ color: colors.text.secondary, background: colors.bg.elevated }}>📎 {a.filename}</a>;
                  })}
                </div>
              )}

              {/* Reactions */}
              {message.reactions?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {message.reactions.map((r, i) => {
                    const mine = r.users?.includes(currentUserId);
                    return (
                      <button key={i} onClick={() => onReact(message, r.emoji)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] transition-all k-reaction-pop"
                        style={{
                          background: mine ? colors.accent.subtle : colors.bg.elevated,
                          color: mine ? colors.accent.primary : colors.text.muted,
                          border: `1px solid ${mine ? colors.accent.muted : colors.border.default}`,
                        }}>
                        {r.emoji} <span className="font-medium">{r.count}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Hover action bar */}
          {hovered && !isEditing && (
            <div className="absolute -top-4 right-4 flex items-center p-[3px] rounded-lg gap-[2px] z-10 k-scale-in"
              style={{ background: colors.bg.modal, boxShadow: shadows.medium, border: `1px solid ${colors.border.light}` }}>
              {quickEmojis.map(e => <button key={e} onClick={() => onReact(message, e)} className="w-7 h-7 flex items-center justify-center rounded-md text-sm hover:bg-[rgba(255,255,255,0.06)] transition-colors">{e}</button>)}
              <div className="w-px h-5 mx-0.5" style={{ background: colors.border.default }} />
              <button onClick={() => onReply(message)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)]" title="Reply"><Reply className="w-4 h-4" style={{ color: colors.text.muted }} /></button>
              {onPin && <button onClick={() => onPin(message)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)]" title={message.is_pinned ? 'Unpin' : 'Pin'}>{message.is_pinned ? <PinOff className="w-3.5 h-3.5" style={{ color: colors.warning }} /> : <Pin className="w-3.5 h-3.5" style={{ color: colors.text.muted }} />}</button>}
              {isOwn && <>
                <button onClick={() => onEdit(message)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)]" title="Edit"><Pencil className="w-3.5 h-3.5" style={{ color: colors.text.muted }} /></button>
                <button onClick={() => onDelete(message)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)]" title="Delete"><Trash2 className="w-3.5 h-3.5" style={{ color: colors.danger }} /></button>
              </>}
            </div>
          )}
        </div>
      </ContextMenuTrigger>

      {/* Context menu */}
      <ContextMenuContent className="w-56 p-1.5 rounded-lg" style={{ background: colors.bg.modal, border: `1px solid ${colors.border.light}`, boxShadow: shadows.strong }}>
        <div className="flex items-center gap-0.5 px-1 py-1 mb-1">
          {['👍', '❤️', '😂', '🔥', '👀', '✨'].map(e => (
            <button key={e} onClick={() => onReact(message, e)} className="w-8 h-8 flex items-center justify-center rounded-md text-base hover:bg-[rgba(255,255,255,0.06)] transition-colors">{e}</button>
          ))}
        </div>
        <ContextMenuSeparator style={{ background: colors.border.default, margin: '4px 0' }} />
        <ContextMenuItem onClick={() => onReply(message)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}><Reply className="w-4 h-4 opacity-50" /> Reply</ContextMenuItem>
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(message.content || '')} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}><Copy className="w-4 h-4 opacity-50" /> Copy Text</ContextMenuItem>
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(message.id)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}><Link className="w-4 h-4 opacity-50" /> Copy Message ID</ContextMenuItem>
        {onPin && <ContextMenuItem onClick={() => onPin(message)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}><Pin className="w-4 h-4 opacity-50" /> {message.is_pinned ? 'Unpin' : 'Pin'}</ContextMenuItem>}
        {isOwn && <>
          <ContextMenuSeparator style={{ background: colors.border.default, margin: '4px 0' }} />
          <ContextMenuItem onClick={() => onEdit(message)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}><Pencil className="w-4 h-4 opacity-50" /> Edit</ContextMenuItem>
          <ContextMenuItem onClick={() => onDelete(message)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.danger }}><Trash2 className="w-4 h-4 opacity-50" /> Delete</ContextMenuItem>
        </>}
      </ContextMenuContent>
    </ContextMenu>
  );
});

export default MessageBubble;