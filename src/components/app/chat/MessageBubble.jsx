import React, { useState, memo } from 'react';
import { Reply, Pencil, Trash2, Copy, Pin, PinOff, Link, Smile, ChevronDown, ChevronUp, Bookmark } from 'lucide-react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import ImageWithFallback from '@/components/app/shared/ImageWithFallback';
import ReactionTooltip from '@/components/app/shared/ReactionTooltip';
import VideoPlayer from '@/components/app/chat/VideoPlayer';
import { colors, shadows } from '@/components/app/design/tokens';

function ts(d) { return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
function fullTs(d) { return new Date(d).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', second: '2-digit' }); }

function isMediaUrl(url) {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (lower.match(/\.(gif)(\?|$)/)) return 'gif';
  if (lower.match(/\.(mp4|webm|mov)(\?|$)/)) return 'video';
  if (lower.match(/\.(png|jpg|jpeg|webp|avif|bmp)(\?|$)/)) return 'image';
  if (lower.includes('tenor.com/') || lower.includes('giphy.com/')) return 'gif';
  return null;
}

function renderText(text, onLinkClick) {
  if (!text) return null;
  return text.split(/(https?:\/\/[^\s]+|@everyone|@here|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((p, i) => {
    if (p.match(/^https?:\/\//)) {
      const mediaType = isMediaUrl(p);
      if (mediaType === 'gif' || mediaType === 'image') return <img key={i} src={p} alt="embedded" className="max-w-[400px] max-h-[280px] rounded-xl mt-1" style={{ border: `1px solid ${colors.border.default}` }} loading="lazy" />;
      return <a key={i} href={p} onClick={e => { if (onLinkClick) { e.preventDefault(); onLinkClick(p); } }} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:no-underline" style={{ color: colors.text.link, wordBreak: 'break-all' }}>{p}</a>;
    }
    if (p === '@everyone' || p === '@here') return <span key={i} className="px-1 rounded" style={{ background: `${colors.info}20`, color: colors.info }}>{p}</span>;
    if (p.match(/^\*\*.*\*\*$/)) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.match(/^\*.*\*$/)) return <em key={i}>{p.slice(1, -1)}</em>;
    if (p.match(/^`.*`$/)) return <code key={i} className="px-1.5 py-0.5 rounded text-[12px]" style={{ background: colors.bg.overlay, color: colors.accent.primary }}>{p.slice(1, -1)}</code>;
    return p;
  });
}

const MAX_LINES = 20;

const MessageBubble = memo(function MessageBubble({ message, compact, isOwn, onReply, onEdit, onDelete, onReact, onPin, currentUserId, onProfileClick, isEditing, onEditSave, onEditCancel, onImageClick, onLinkClick, onHighlight }) {
  const [hovered, setHovered] = useState(false);
  const [editText, setEditText] = useState(message.content || '');
  const [expanded, setExpanded] = useState(false);
  const [showFullTs, setShowFullTs] = useState(false);
  const quickEmojis = ['👍', '❤️', '😂', '🔥', '👀'];
  const saveFn = () => { if (editText.trim() && editText !== message.content) onEditSave(message.id, editText.trim()); else onEditCancel(); };
  const isLong = (message.content || '').split('\n').length > MAX_LINES || (message.content || '').length > 1500;
  const isDeleted = message.is_deleted;
  const authorName = isDeleted ? 'Deleted User' : (message.author_name || 'User');

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="relative group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          style={{
            padding: compact ? '2px 16px 2px 16px' : '4px 16px 4px 16px',
            background: hovered ? 'rgba(255,255,255,0.02)' : message.is_pinned ? `${colors.warning}06` : 'transparent',
            transition: 'background 0.15s ease-out',
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
              <button onClick={() => !isDeleted && onProfileClick?.(message.author_id)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-semibold flex-shrink-0 overflow-hidden hover:opacity-80 transition-opacity mt-0.5"
                style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                {isDeleted ? '👻' : message.author_avatar ? <img src={message.author_avatar} className="w-full h-full object-cover" alt="" /> : authorName.charAt(0).toUpperCase()}
              </button>
            )}

            <div className="flex-1 min-w-0 overflow-hidden">
              {!compact && (
                <div className="flex items-baseline gap-2 mb-0.5">
                  <button onClick={() => !isDeleted && onProfileClick?.(message.author_id)} className="text-[14px] font-semibold hover:underline truncate max-w-[180px] inline-block align-bottom" style={{ color: isDeleted ? colors.text.disabled : colors.text.primary, textDecorationColor: colors.text.disabled }} title={authorName}>
                    {authorName}
                  </button>
                  {!isDeleted && message.author_badges?.includes('owner') && <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold flex-shrink-0" style={{ background: `${colors.warning}20`, color: colors.warning }}>OWNER</span>}
                  {!isDeleted && message.author_badges?.includes('admin') && <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold flex-shrink-0" style={{ background: `${colors.info}20`, color: colors.info }}>ADMIN</span>}
                  <button onClick={() => setShowFullTs(!showFullTs)} className="text-[11px] tabular-nums select-none flex-shrink-0 hover:underline" style={{ color: colors.text.disabled }} title={fullTs(message.created_date)}>
                    {showFullTs ? fullTs(message.created_date) : ts(message.created_date)}
                  </button>
                  {message.is_edited && <span className="text-[11px] flex-shrink-0" style={{ color: colors.text.disabled }}>(edited)</span>}
                </div>
              )}

              {/* Content */}
              {isDeleted ? (
                <div className="text-[14px] italic" style={{ color: colors.text.disabled }}>This message was deleted.</div>
              ) : isEditing ? (
                <div>
                  <textarea value={editText} onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveFn(); } if (e.key === 'Escape') onEditCancel(); }}
                    className="w-full text-[14px] rounded-lg px-3 py-2 outline-none resize-none" style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.accent.primary}` }}
                    rows={2} autoFocus />
                  <div className="text-[11px] mt-1" style={{ color: colors.text.disabled }}>
                    Escape to <button onClick={onEditCancel} className="underline" style={{ color: colors.text.link }}>cancel</button> · Enter to <button onClick={saveFn} className="underline" style={{ color: colors.text.link }}>save</button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="text-[15px] leading-[1.375] whitespace-pre-wrap overflow-hidden" style={{ color: colors.text.secondary, maxHeight: isLong && !expanded ? '300px' : 'none', wordBreak: 'break-word', overflowWrap: 'anywhere', maxWidth: '100%' }}>
                    {renderText(message.content, onLinkClick)}
                  </div>
                  {isLong && !expanded && (
                    <div className="pt-1">
                      <button onClick={() => setExpanded(true)} className="flex items-center gap-1 text-[13px] font-medium hover:underline" style={{ color: colors.text.link }}>
                        <ChevronDown className="w-3.5 h-3.5" /> Read more
                      </button>
                    </div>
                  )}
                  {isLong && expanded && (
                    <div className="pt-1">
                      <button onClick={() => setExpanded(false)} className="flex items-center gap-1 text-[13px] font-medium hover:underline" style={{ color: colors.text.link }}>
                        <ChevronUp className="w-3.5 h-3.5" /> Show less
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Attachments */}
              {!isDeleted && message.attachments?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {message.attachments.map((a, i) => {
                    const isGif = a.content_type === 'image/gif' || a.filename?.toLowerCase().endsWith('.gif') || a.url?.toLowerCase().includes('.gif');
                    if (a.content_type?.startsWith('image/') || isGif) return <ImageWithFallback key={i} src={a.url} alt={a.filename || 'Uploaded image'} className="max-w-[400px] max-h-[280px] rounded-xl cursor-pointer hover:brightness-110 transition-all" style={{ border: `1px solid ${colors.border.default}` }} onClick={() => onImageClick?.(a.url, a.filename)} />;
                    if (a.content_type?.startsWith('video/') || a.url?.match(/\.(mp4|webm|mov|avi|mkv)(\?|$)/i)) return <VideoPlayer key={i} src={a.url} filename={a.filename} />;
                    if (a.content_type?.startsWith('audio/') || a.url?.match(/\.(mp3|wav|ogg|flac|aac)(\?|$)/i)) return <audio key={i} src={a.url} controls className="max-w-[300px]" />;
                    return <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[13px] px-3 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.04)]" style={{ color: colors.text.secondary, background: colors.bg.elevated }}>📎 {a.filename || 'File'}</a>;
                  })}
                </div>
              )}

              {/* Reactions */}
              {!isDeleted && message.reactions?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {message.reactions.map((r, i) => {
                    const mine = r.users?.includes(currentUserId);
                    return (
                      <ReactionTooltip key={i} reaction={r}>
                        <button onClick={() => onReact(message, r.emoji)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] transition-all k-reaction-pop"
                          style={{
                            background: mine ? colors.accent.subtle : colors.bg.elevated,
                            color: mine ? colors.accent.primary : colors.text.muted,
                            border: `1px solid ${mine ? colors.accent.muted : colors.border.default}`,
                          }}>
                          {r.emoji} <span className="font-medium">{r.count}</span>
                        </button>
                      </ReactionTooltip>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Hover action bar */}
          {hovered && !isEditing && !isDeleted && (
            <div className="absolute -top-4 right-4 flex items-center p-[3px] rounded-lg gap-[2px] z-10 k-scale-in"
              style={{ background: colors.bg.modal, boxShadow: shadows.medium, border: `1px solid ${colors.border.light}` }}
              role="toolbar" aria-label="Message actions">
              {quickEmojis.map(e => <button key={e} onClick={() => onReact(message, e)} className="w-7 h-7 flex items-center justify-center rounded-md text-sm hover:bg-[rgba(255,255,255,0.06)] transition-colors">{e}</button>)}
              <div className="w-px h-5 mx-0.5" style={{ background: colors.border.default }} />
              <button onClick={() => onReply(message)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)]" title="Reply"><Reply className="w-4 h-4" style={{ color: colors.text.muted }} /></button>
              {onPin && <button onClick={() => onPin(message)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)]" title={message.is_pinned ? 'Unpin' : 'Pin'}>{message.is_pinned ? <PinOff className="w-3.5 h-3.5" style={{ color: colors.warning }} /> : <Pin className="w-3.5 h-3.5" style={{ color: colors.text.muted }} />}</button>}
              {isOwn && <>
                <button onClick={() => onEdit(message)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)]" title="Edit" aria-label="Edit message"><Pencil className="w-3.5 h-3.5" style={{ color: colors.text.muted }} /></button>
                <button onClick={() => onDelete(message)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)]" title="Delete" aria-label="Delete message"><Trash2 className="w-3.5 h-3.5" style={{ color: colors.danger }} /></button>
              </>}
            </div>
          )}
        </div>
      </ContextMenuTrigger>

      {/* Context menu - only show full actions for non-deleted messages */}
      <ContextMenuContent className="w-56 p-1.5 rounded-lg" style={{ background: colors.bg.modal, border: `1px solid ${colors.border.light}`, boxShadow: shadows.strong }}>
        {!isDeleted && <>
          <div className="flex items-center gap-0.5 px-1 py-1 mb-1">
            {['👍', '❤️', '😂', '🔥', '👀', '✨'].map(e => (
              <button key={e} onClick={() => onReact(message, e)} className="w-8 h-8 flex items-center justify-center rounded-md text-base hover:bg-[rgba(255,255,255,0.06)] transition-colors">{e}</button>
            ))}
          </div>
          <ContextMenuSeparator style={{ background: colors.border.default, margin: '4px 0' }} />
          <ContextMenuItem onClick={() => onReply(message)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}><Reply className="w-4 h-4 opacity-50" /> Reply</ContextMenuItem>
          <ContextMenuItem onClick={() => navigator.clipboard.writeText(message.content || '')} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}><Copy className="w-4 h-4 opacity-50" /> Copy Text</ContextMenuItem>
        </>}
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(message.id)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}><Link className="w-4 h-4 opacity-50" /> Copy Message ID</ContextMenuItem>
        {!isDeleted && onPin && <ContextMenuItem onClick={() => onPin(message)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}><Pin className="w-4 h-4 opacity-50" /> {message.is_pinned ? 'Unpin' : 'Pin'}</ContextMenuItem>}
        {!isDeleted && <ContextMenuItem onClick={() => onHighlight?.(message)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}><Bookmark className="w-4 h-4 opacity-50" /> Save as Highlight</ContextMenuItem>}
        {isOwn && !isDeleted && <>
          <ContextMenuSeparator style={{ background: colors.border.default, margin: '4px 0' }} />
          <ContextMenuItem onClick={() => onEdit(message)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}><Pencil className="w-4 h-4 opacity-50" /> Edit</ContextMenuItem>
          <ContextMenuItem onClick={() => onDelete(message)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.danger }}><Trash2 className="w-4 h-4 opacity-50" /> Delete</ContextMenuItem>
        </>}
      </ContextMenuContent>
    </ContextMenu>
  );
});

export default MessageBubble;