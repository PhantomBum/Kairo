import React, { useState, memo, useMemo } from 'react';
import { Reply, Pencil, Trash2, Copy, Pin, PinOff, Link, Smile, ChevronDown, ChevronUp, Bookmark, ArrowRight, Zap, UserPlus, LogOut } from 'lucide-react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import ImageWithFallback from '@/components/app/shared/ImageWithFallback';
import ReactionTooltip from '@/components/app/shared/ReactionTooltip';
import VideoPlayer from '@/components/app/chat/VideoPlayer';
import { colors, shadows, glass } from '@/components/app/design/tokens';

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
  return text.split(/(```[\s\S]*?```|`[^`]+`)/g).map((segment, si) => {
    if (segment.startsWith('```') && segment.endsWith('```')) {
      const inner = segment.slice(3, -3);
      const firstLine = inner.indexOf('\n');
      const code = firstLine > -1 ? inner.slice(firstLine + 1) : inner;
      return <pre key={si} className="px-3 py-2 rounded text-[13px] my-1 overflow-x-auto border" style={{ background: colors.bg.overlay, color: colors.text.secondary, borderColor: colors.border.default }}><code>{code}</code></pre>;
    }
    if (segment.match(/^`[^`]+`$/)) return <code key={si} className="px-1.5 py-0.5 rounded text-[13px]" style={{ background: colors.bg.overlay, color: colors.text.secondary }}>{segment.slice(1, -1)}</code>;
    return segment.split(/(https?:\/\/[^\s]+|@everyone|@here|\*\*[^*]+\*\*|\*[^*]+\*)/g).map((p, i) => {
      const key = `${si}-${i}`;
      if (p.match(/^https?:\/\//)) {
        const mediaType = isMediaUrl(p);
        if (mediaType === 'gif' || mediaType === 'image') return <img key={key} src={p} alt="embedded" className="max-w-[400px] max-h-[280px] rounded mt-1" style={{ border: `1px solid ${colors.border.default}` }} loading="lazy" />;
        return <a key={key} href={p} onClick={e => { if (onLinkClick) { e.preventDefault(); onLinkClick(p); } }} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: colors.text.link, wordBreak: 'break-all' }}>{p}</a>;
      }
      if (p === '@everyone' || p === '@here') return <span key={key} className="px-0.5 rounded" style={{ background: `${colors.info}20`, color: colors.info }}>{p}</span>;
      if (p.match(/^\*\*.*\*\*$/)) return <strong key={key}>{p.slice(2, -2)}</strong>;
      if (p.match(/^\*.*\*$/)) return <em key={key}>{p.slice(1, -1)}</em>;
      return p;
    });
  });
}

const MAX_LINES = 20;

function CopyMenuItem({ text, label, icon: IconComp }) {
  const handleClick = () => { navigator.clipboard.writeText(text); };
  const DisplayIcon = IconComp || Copy;
  return (
    <ContextMenuItem onClick={handleClick} className="text-[13px] gap-2 rounded px-2 py-1.5" style={{ color: colors.text.secondary }}>
      <DisplayIcon className="w-4 h-4 opacity-50" /> {label}
    </ContextMenuItem>
  );
}

// Kloak-style role badge pill
function RoleBadgePill({ badges }) {
  if (!badges?.length) return null;
  const isOwner = badges.includes('owner');
  const isAdmin = badges.includes('admin');
  if (!isOwner && !isAdmin) return null;
  const label = isOwner ? 'Owner' : 'Admin';
  const color = isOwner ? colors.warning : colors.info;
  return (
    <span className="text-[10px] font-semibold px-1.5 py-[1px] rounded flex-shrink-0 leading-tight"
      style={{ background: `${color}15`, color }}>
      {label}
    </span>
  );
}

const SYSTEM_ICONS = { boost: Zap, join: UserPlus, leave: LogOut };

const SystemMessage = memo(function SystemMessage({ message }) {
  const content = message.content || '';
  const isBoost = content.toLowerCase().includes('boost');
  const isJoin = content.toLowerCase().includes('joined') || content.toLowerCase().includes('welcome');
  const isLeave = content.toLowerCase().includes('left') || content.toLowerCase().includes('leave');
  const Icon = isBoost ? Zap : isJoin ? UserPlus : isLeave ? LogOut : ArrowRight;
  const accentColor = isBoost ? '#a855f7' : isJoin ? colors.success : isLeave ? colors.text.muted : colors.text.disabled;
  
  return (
    <div className="flex items-center gap-3 py-1.5 px-5 k-msg-in" style={{ marginTop: '4px' }}>
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${accentColor}12` }}>
        <Icon className="w-3.5 h-3.5" style={{ color: accentColor }} />
      </div>
      <span className="text-[13px]" style={{ color: colors.text.muted }}>
        {content}
      </span>
      <span className="text-[10px] tabular-nums ml-auto" style={{ color: colors.text.disabled }}>
        {ts(message.created_date)}
      </span>
    </div>
  );
});

const MessageBubble = memo(function MessageBubble({ message, compact, isOwn, onReply, onEdit, onDelete, onReact, onPin, currentUserId, onProfileClick, isEditing, onEditSave, onEditCancel, onImageClick, onLinkClick, onHighlight }) {
  if (message.type === 'system') return <SystemMessage message={message} />;

  const [hovered, setHovered] = useState(false);
  const [editText, setEditText] = useState(message.content || '');
  const [expanded, setExpanded] = useState(false);
  const [showFullTs, setShowFullTs] = useState(false);
  const quickEmojis = ['👍', '❤️', '😂', '🔥', '👀'];
  const saveFn = () => { if (editText.trim() && editText !== message.content) onEditSave(message.id, editText.trim()); else onEditCancel(); };
  const isLong = (message.content || '').split('\n').length > MAX_LINES || (message.content || '').length > 1500;
  const isDeleted = message.is_deleted;
  const authorName = isDeleted ? 'Deleted User' : (message.author_name || 'User');

  // Role color — vivid, confident, Kloak-style
  const roleColor = message.author_badges?.includes('owner') ? colors.warning
    : message.author_badges?.includes('admin') ? colors.info
    : colors.text.primary;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className="relative group flex items-start gap-4 py-[3px] px-5 hover:bg-[rgba(255,255,255,0.02)]"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ marginTop: compact ? 0 : '1.125rem' }}
        >
          {/* Avatar column */}
          {compact ? (
            <div className="w-10 flex-shrink-0 flex items-center justify-end pt-0.5">
              <span className="text-[10px] opacity-0 group-hover:opacity-100 tabular-nums select-none" style={{ color: colors.text.disabled }}>
                {ts(message.created_date)}
              </span>
            </div>
          ) : (
            <button
              onClick={() => !isDeleted && onProfileClick?.(message.author_id)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 overflow-hidden hover:opacity-80 mt-0.5"
              style={{ background: colors.bg.overlay, color: colors.text.muted }}
            >
              {isDeleted ? '👻' : message.author_avatar
                ? <img src={message.author_avatar} className="w-full h-full object-cover" alt="" />
                : authorName.charAt(0).toUpperCase()
              }
            </button>
          )}

          {/* Message body */}
          <div className="flex-1 min-w-0 overflow-hidden">
            {/* Header line */}
            {!compact && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => !isDeleted && onProfileClick?.(message.author_id)}
                  className="text-[15px] font-semibold hover:underline truncate max-w-[200px]"
                  style={{ color: roleColor }}
                >
                  {authorName}
                </button>
                {!isDeleted && <RoleBadgePill badges={message.author_badges} />}
                <button
                  onClick={() => setShowFullTs(!showFullTs)}
                  className="text-[11px] tabular-nums select-none flex-shrink-0 hover:underline"
                  style={{ color: colors.text.disabled }}
                  title={fullTs(message.created_date)}
                >
                  {showFullTs ? fullTs(message.created_date) : ts(message.created_date)}
                </button>
                {message.is_edited && <span className="text-[11px] flex-shrink-0" style={{ color: colors.text.disabled }}>(edited)</span>}
              </div>
            )}

            {/* Pinned indicator */}
            {message.is_pinned && !compact && (
              <div className="flex items-center gap-1 mb-0.5">
                <Pin className="w-3 h-3" style={{ color: colors.warning }} />
                <span className="text-[10px] font-medium" style={{ color: colors.warning, opacity: 0.7 }}>Pinned</span>
              </div>
            )}

            {/* Reply preview — Kloak style: colored left bar */}
            {message.reply_preview && (
              <div className="flex items-center gap-2 mb-1 cursor-pointer hover:opacity-80">
                <div className="w-[2px] h-4 rounded-full flex-shrink-0" style={{ background: colors.accent.primary }} />
                <span className="text-[12px] truncate" style={{ color: colors.text.muted }}>
                  <span className="font-semibold" style={{ color: colors.accent.primary }}>{message.reply_preview.author_name}</span>
                  {' '}{message.reply_preview.content?.slice(0, 80)}
                </span>
              </div>
            )}

            {/* Content */}
            {isDeleted ? (
              <div className="text-[14px] italic" style={{ color: colors.text.disabled }}>This message was deleted.</div>
            ) : isEditing ? (
              <div>
                <textarea value={editText} onChange={e => setEditText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveFn(); } if (e.key === 'Escape') onEditCancel(); }}
                  className="w-full text-[14px] rounded-lg px-3 py-2 outline-none resize-none" style={{ background: colors.bg.overlay, color: colors.text.primary, border: `1px solid ${colors.accent.primary}` }}
                  rows={2} autoFocus />
                <div className="text-[11px] mt-1" style={{ color: colors.text.disabled }}>
                  Escape to <button onClick={onEditCancel} className="underline" style={{ color: colors.text.link }}>cancel</button> · Enter to <button onClick={saveFn} className="underline" style={{ color: colors.text.link }}>save</button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="text-[14px] leading-[1.4] whitespace-pre-wrap break-words" style={{ color: colors.text.secondary, maxHeight: isLong && !expanded ? '300px' : 'none' }}>
                  {renderText(message.content, onLinkClick)}
                </div>
                {isLong && !expanded && (
                  <div className="pt-0.5">
                    <button onClick={() => setExpanded(true)} className="flex items-center gap-1 text-[13px] font-medium hover:underline" style={{ color: colors.text.link }}>
                      <ChevronDown className="w-3.5 h-3.5" /> Read more
                    </button>
                  </div>
                )}
                {isLong && expanded && (
                  <div className="pt-0.5">
                    <button onClick={() => setExpanded(false)} className="flex items-center gap-1 text-[13px] font-medium hover:underline" style={{ color: colors.text.link }}>
                      <ChevronUp className="w-3.5 h-3.5" /> Show less
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Attachments */}
            {!isDeleted && message.attachments?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1.5">
                {message.attachments.map((a, i) => {
                  const isGif = a.content_type === 'image/gif' || a.filename?.toLowerCase().endsWith('.gif') || a.url?.toLowerCase().includes('.gif');
                  if (a.content_type?.startsWith('image/') || isGif) return <ImageWithFallback key={i} src={a.url} alt={a.filename || 'image'} className="max-w-[400px] max-h-[300px] rounded cursor-pointer hover:brightness-110" style={{ border: `1px solid ${colors.border.default}` }} onClick={() => onImageClick?.(a.url, a.filename)} />;
                  if (a.content_type?.startsWith('video/') || a.url?.match(/\.(mp4|webm|mov|avi|mkv)(\?|$)/i)) return <VideoPlayer key={i} src={a.url} filename={a.filename} />;
                  if (a.content_type?.startsWith('audio/') || a.url?.match(/\.(mp3|wav|ogg|flac|aac)(\?|$)/i)) return <audio key={i} src={a.url} controls className="max-w-[300px]" />;
                  return <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[13px] px-3 py-2 rounded hover:brightness-110" style={{ color: colors.text.secondary, background: colors.bg.overlay }}>📎 {a.filename || 'File'}</a>;
                })}
              </div>
            )}

            {/* Reactions — Kloak-style pills */}
            {!isDeleted && message.reactions?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {message.reactions.map((r, i) => {
                  const mine = r.users?.includes(currentUserId);
                  return (
                    <ReactionTooltip key={i} reaction={r}>
                      <button onClick={() => onReact(message, r.emoji)}
                        className="flex items-center gap-1 px-2 py-[3px] rounded-md text-[12px] transition-colors"
                        style={{
                          background: mine ? colors.accent.subtle : 'rgba(255,255,255,0.04)',
                          color: mine ? colors.accent.primary : colors.text.muted,
                          border: `1px solid ${mine ? colors.accent.muted : 'rgba(255,255,255,0.06)'}`,
                        }}>
                        {r.emoji} <span className="font-medium tabular-nums">{r.count}</span>
                      </button>
                    </ReactionTooltip>
                  );
                })}
              </div>
            )}
          </div>

          {/* Hover action bar — Kloak: clean, above message, right side */}
          {hovered && !isEditing && !isDeleted && (
            <div className="absolute -top-3.5 right-5 flex items-center p-[2px] rounded-lg gap-[1px] z-10 k-fade-in"
              style={{ background: colors.bg.overlay, border: `1px solid ${colors.border.default}`, boxShadow: shadows.medium }}
              role="toolbar" aria-label="Message actions">
              {quickEmojis.map(e => <button key={e} onClick={() => onReact(message, e)} className="w-7 h-7 flex items-center justify-center rounded text-sm hover:bg-[rgba(255,255,255,0.06)]">{e}</button>)}
              <div className="w-px h-5 mx-0.5" style={{ background: colors.border.default }} />
              <button onClick={() => onReply(message)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,0.06)]" title="Reply"><Reply className="w-4 h-4" style={{ color: colors.text.muted }} /></button>
              {onPin && <button onClick={() => onPin(message)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,0.06)]" title={message.is_pinned ? 'Unpin' : 'Pin'}>{message.is_pinned ? <PinOff className="w-3.5 h-3.5" style={{ color: colors.warning }} /> : <Pin className="w-3.5 h-3.5" style={{ color: colors.text.muted }} />}</button>}
              {isOwn && <>
                <button onClick={() => onEdit(message)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,0.06)]" title="Edit"><Pencil className="w-3.5 h-3.5" style={{ color: colors.text.muted }} /></button>
                <button onClick={() => onDelete(message)} className="w-7 h-7 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,0.06)]" title="Delete"><Trash2 className="w-3.5 h-3.5" style={{ color: colors.danger }} /></button>
              </>}
            </div>
          )}
        </div>
      </ContextMenuTrigger>

      {/* Context menu */}
      <ContextMenuContent className="w-52 p-1 rounded-lg" style={{ background: colors.bg.overlay, border: `1px solid ${colors.border.default}`, boxShadow: shadows.strong }}>
        {!isDeleted && <>
          <div className="flex items-center gap-0.5 px-1 py-1 mb-1">
            {['👍', '❤️', '😂', '🔥', '👀', '✨'].map(e => (
              <button key={e} onClick={() => onReact(message, e)} className="w-7 h-7 flex items-center justify-center rounded text-base hover:bg-[rgba(255,255,255,0.06)]">{e}</button>
            ))}
          </div>
          <ContextMenuSeparator style={{ background: colors.border.default, margin: '4px 0' }} />
          <ContextMenuItem onClick={() => onReply(message)} className="text-[13px] gap-2 rounded px-2 py-1.5" style={{ color: colors.text.secondary }}><Reply className="w-4 h-4 opacity-50" /> Reply</ContextMenuItem>
          <CopyMenuItem text={message.content || ''} label="Copy Text" />
        </>}
        <CopyMenuItem text={message.id} label="Copy Message ID" icon={Link} />
        {!isDeleted && onPin && <ContextMenuItem onClick={() => onPin(message)} className="text-[13px] gap-2 rounded px-2 py-1.5" style={{ color: colors.text.secondary }}><Pin className="w-4 h-4 opacity-50" /> {message.is_pinned ? 'Unpin' : 'Pin'}</ContextMenuItem>}
        {!isDeleted && <ContextMenuItem onClick={() => onHighlight?.(message)} className="text-[13px] gap-2 rounded px-2 py-1.5" style={{ color: colors.text.secondary }}><Bookmark className="w-4 h-4 opacity-50" /> Save as Highlight</ContextMenuItem>}
        {isOwn && !isDeleted && <>
          <ContextMenuSeparator style={{ background: colors.border.default, margin: '4px 0' }} />
          <ContextMenuItem onClick={() => onEdit(message)} className="text-[13px] gap-2 rounded px-2 py-1.5" style={{ color: colors.text.secondary }}><Pencil className="w-4 h-4 opacity-50" /> Edit</ContextMenuItem>
          <ContextMenuItem onClick={() => onDelete(message)} className="text-[13px] gap-2 rounded px-2 py-1.5" style={{ color: colors.danger }}><Trash2 className="w-4 h-4 opacity-50" /> Delete</ContextMenuItem>
        </>}
      </ContextMenuContent>
    </ContextMenu>
  );
});

export default MessageBubble;