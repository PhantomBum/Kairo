import React, { useState, memo, useRef, useCallback } from 'react';
import { Reply, Pencil, Trash2, Copy, Pin, PinOff, Link, ChevronDown, ChevronUp, Bookmark, ArrowRight, Zap, UserPlus, LogOut, Star, Forward, Smile, MoreHorizontal, Flag, BellOff, FileText, Sparkles, MessageSquare, ExternalLink, Clock, AlertCircle, RotateCcw } from 'lucide-react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import ImageWithFallback from '@/components/app/shared/ImageWithFallback';
import ReactionTooltip from '@/components/app/shared/ReactionTooltip';
import VideoPlayer from '@/components/app/chat/VideoPlayer';
import EmojiPicker from '@/components/app/chat/EmojiPicker';
import { colors } from '@/components/app/design/tokens';
import { BADGE_CONFIG } from '@/components/app/badges/badgeConfig';

const P = {
  base: colors.bg.base, surface: colors.bg.surface, elevated: colors.bg.elevated,
  floating: colors.bg.float, border: colors.border.subtle,
  textPrimary: colors.text.primary, textSecondary: colors.text.secondary, muted: colors.text.muted,
  accent: colors.accent.primary, danger: colors.danger, warning: colors.warning,
  link: colors.accent.bright,
};

function ts(d) { return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); }
function fullTs(d) { return new Date(d).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }

function isMediaUrl(url) {
  if (!url) return null;
  const lower = url.toLowerCase();
  if (lower.match(/\.(gif)(\?|$)/)) return 'gif';
  if (lower.match(/\.(mp4|webm|mov)(\?|$)/)) return 'video';
  if (lower.match(/\.(png|jpg|jpeg|webp|avif|bmp)(\?|$)/)) return 'image';
  if (lower.includes('tenor.com/') || lower.includes('giphy.com/')) return 'gif';
  return null;
}

function hasMention(text) {
  if (!text) return false;
  return /@everyone|@here|@\w+/.test(text);
}

function renderText(text, onLinkClick, onMentionClick) {
  if (!text) return null;
  return text.split(/(```[\s\S]*?```|`[^`]+`)/g).map((segment, si) => {
    if (segment.startsWith('```') && segment.endsWith('```')) {
      const inner = segment.slice(3, -3);
      const firstLine = inner.indexOf('\n');
      const lang = firstLine > -1 ? inner.slice(0, firstLine).trim() : '';
      const code = firstLine > -1 ? inner.slice(firstLine + 1) : inner;
      return (
        <pre key={si} className="relative group/code px-3 py-2 rounded-[10px] text-[13px] my-1.5 overflow-x-auto"
          style={{ background: 'var(--bg-void)', color: P.textSecondary, border: '1px solid var(--border-subtle)' }}>
          {lang && <div className="absolute top-2 right-2 text-[10px] font-medium uppercase" style={{ color: 'var(--text-muted)' }}>{lang}</div>}
          <code style={{ whiteSpace: 'pre', wordBreak: 'normal' }}>{code}</code>
          <button onClick={async (e) => {
            e.stopPropagation();
            try {
              await navigator.clipboard.writeText(code);
            } catch {
              const ta = document.createElement('textarea');
              ta.value = code;
              ta.style.position = 'fixed';
              ta.style.opacity = '0';
              document.body.appendChild(ta);
              ta.select();
              document.execCommand('copy');
              document.body.removeChild(ta);
            }
          }}
            className="absolute top-2 right-2 px-2 py-1 rounded text-[11px] font-medium opacity-0 group-hover/code:opacity-100 transition-opacity"
            style={{ background: P.elevated, color: P.muted, border: `1px solid ${P.border}` }}>
            Copy
          </button>
        </pre>
      );
    }
    if (segment.match(/^`[^`]+`$/)) {
      return <code key={si} className="px-1.5 py-0.5 rounded text-[13px]" style={{ background: P.base, color: P.textSecondary }}>{segment.slice(1, -1)}</code>;
    }
    return segment.split(/(https?:\/\/[^\s]+|@everyone|@here|@\w+|\*\*[^*]+\*\*|\*[^*]+\*|__[^_]+__|~~[^~]+~~|\|\|[^|]+\|\||#[\w-]+)/g).map((p, i) => {
      const key = `${si}-${i}`;
      if (p.match(/^https?:\/\//)) {
        const mediaType = isMediaUrl(p);
        if (mediaType === 'gif' || mediaType === 'image') {
          return <img key={key} src={p} alt="embedded" className="max-w-[400px] max-h-[280px] rounded-lg mt-1 block cursor-pointer hover:brightness-110" style={{ border: `1px solid ${P.border}` }} loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />;
        }
        return <a key={key} href={p} onClick={e => { if (onLinkClick) { e.preventDefault(); onLinkClick(p); } }} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--accent-bright)', wordBreak: 'break-all' }}>{p}</a>;
      }
      if (p === '@everyone' || p === '@here') return <span key={key} className="px-1 rounded font-semibold cursor-default" style={{ background: `${P.accent}20`, color: P.accent }}>{p}</span>;
      if (p.match(/^@\w+/)) {
        const username = p.slice(1);
        return <span key={key} className="px-1 rounded font-semibold cursor-pointer hover:underline" style={{ background: `${P.accent}15`, color: P.accent }} onClick={() => onMentionClick?.(username)}>{p}</span>;
      }
      if (p.match(/^#[\w-]+$/)) return <span key={key} className="px-0.5 rounded font-medium cursor-pointer hover:underline" style={{ color: P.accent }}>{p}</span>;
      if (p.match(/^\*\*.*\*\*$/)) return <strong key={key}>{p.slice(2, -2)}</strong>;
      if (p.match(/^\*.*\*$/)) return <em key={key}>{p.slice(1, -1)}</em>;
      if (p.match(/^__.*__$/)) return <u key={key}>{p.slice(2, -2)}</u>;
      if (p.match(/^~~.*~~$/)) return <s key={key} style={{ color: P.muted }}>{p.slice(2, -2)}</s>;
      if (p.match(/^\|\|.*\|\|$/)) {
        const SpoilerTag = () => {
          const [revealed, setRevealed] = React.useState(false);
          return (
            <span onClick={() => setRevealed(true)} className="px-1 rounded cursor-pointer transition-all duration-200 select-none"
              style={{
                background: revealed ? 'rgba(255,255,255,0.06)' : P.base,
                color: revealed ? P.textSecondary : 'transparent',
                filter: revealed ? 'none' : 'blur(6px)',
                userSelect: revealed ? 'text' : 'none',
              }}
              aria-hidden={!revealed}>
              {p.slice(2, -2)}
            </span>
          );
        };
        return <SpoilerTag key={key} />;
      }
      return p;
    });
  });
}

const MAX_LINES = 25;
const EMOJI_ONLY_REGEX = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic}[\uFE0F\u200D]*){1,3}$/u;
function isEmojiOnly(text) {
  if (!text) return false;
  const stripped = text.trim();
  return stripped.length <= 12 && EMOJI_ONLY_REGEX.test(stripped);
}

function InlineBadges({ badges }) {
  if (!badges?.length) return null;
  const shown = badges.slice(0, 3);
  return (
    <span className="inline-flex items-center gap-0.5 ml-1">
      {shown.map(b => {
        const cfg = BADGE_CONFIG[b];
        if (!cfg) return null;
        const Icon = cfg.icon;
        return <Icon key={b} className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />;
      })}
    </span>
  );
}

function MoreDropdown({ message, isOwn, onReply, onPin, onStar, onForward, onDelete, onEdit, onMarkMoment }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.1)]"
        title="More">
        <MoreHorizontal className="w-4 h-4" style={{ color: P.muted }} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 py-1.5 px-1.5 rounded-xl z-50 k-fade-in"
          style={{ background: P.floating, border: `1px solid ${P.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
          <button onClick={() => { navigator.clipboard.writeText(message.content || ''); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.06)]"
            style={{ color: P.textSecondary }}>
            <Copy className="w-4 h-4 opacity-60" /> Copy Text
          </button>
          <button onClick={() => { navigator.clipboard.writeText(message.id); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.06)]"
            style={{ color: P.textSecondary }}>
            <Link className="w-4 h-4 opacity-60" /> Copy Message Link
          </button>
          <button onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.06)]"
            style={{ color: P.textSecondary }}>
            <BellOff className="w-4 h-4 opacity-60" /> Mark Unread
          </button>
          {onForward && (
            <button onClick={() => { onForward(message); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.06)]"
              style={{ color: P.textSecondary }}>
              <Forward className="w-4 h-4 opacity-60" /> Forward
            </button>
          )}
          <button onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[rgba(255,255,255,0.06)]"
            style={{ color: P.textSecondary }}>
            <FileText className="w-4 h-4 opacity-60" /> Save to Note to Self
          </button>
          {onMarkMoment && (
            <button onClick={() => { onMarkMoment(message); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[rgba(123,108,246,0.1)]"
              style={{ color: P.accent }}>
              <Sparkles className="w-4 h-4 opacity-60" /> Mark as Moment
            </button>
          )}
          <div className="h-px mx-1 my-1" style={{ background: P.border }} />
          {isOwn && (
            <button onClick={() => { onDelete(message); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[rgba(237,66,69,0.1)]"
              style={{ color: P.danger }}>
              <Trash2 className="w-4 h-4 opacity-60" /> Delete
            </button>
          )}
          <button onClick={() => setOpen(false)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors hover:bg-[rgba(237,66,69,0.1)]"
            style={{ color: P.danger }}>
            <Flag className="w-4 h-4 opacity-60" /> Report
          </button>
        </div>
      )}
    </div>
  );
}

const SystemMessage = memo(function SystemMessage({ message }) {
  const content = message.content || '';
  const isBoost = content.toLowerCase().includes('boost');
  const isJoin = content.toLowerCase().includes('joined') || content.toLowerCase().includes('welcome');
  const Icon = isBoost ? Zap : isJoin ? UserPlus : ArrowRight;
  const accent = isBoost ? '#a855f7' : isJoin ? '#3ba55c' : P.muted;
  return (
    <div className="flex items-center justify-center gap-2 py-2 px-4">
      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: accent }} />
      <span className="text-[13px]" style={{ color: P.muted }}>{content}</span>
      <span className="text-[11px] tabular-nums" style={{ color: P.muted, opacity: 0.5 }}>{ts(message.created_date)}</span>
    </div>
  );
});

function LinkEmbed({ url }) {
  const [meta, setMeta] = React.useState(null);
  const [dismissed, setDismissed] = React.useState(false);
  const [err, setErr] = React.useState(false);
  React.useEffect(() => {
    if (!url || dismissed || err) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        if (!cancelled && data.status === 'success' && data.data) {
          setMeta({ title: data.data.title, description: data.data.description, image: data.data.image?.url, publisher: data.data.publisher });
        }
      } catch { if (!cancelled) setErr(true); }
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [url, dismissed, err]);

  if (dismissed || err || !meta?.title) return null;
  return (
    <div className="relative mt-2 max-w-[420px] rounded-lg overflow-hidden group/embed" style={{ background: P.surface, border: `1px solid ${P.border}`, borderLeft: `3px solid ${P.accent}` }}>
      {meta.image && <img src={meta.image} alt="" className="w-full max-h-[180px] object-cover" loading="lazy" onError={e => { e.target.style.display = 'none'; }} />}
      <div className="p-3">
        {meta.publisher && <div className="text-[11px] font-semibold mb-1" style={{ color: P.muted }}>{meta.publisher}</div>}
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-[14px] font-semibold hover:underline block mb-1 leading-tight" style={{ color: P.link }}>{meta.title}</a>
        {meta.description && <p className="text-[13px] leading-relaxed line-clamp-2" style={{ color: P.textSecondary }}>{meta.description}</p>}
      </div>
      <button onClick={() => setDismissed(true)} className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover/embed:opacity-100 transition-opacity" style={{ background: P.base }}>
        <svg className="w-3 h-3" style={{ color: P.muted }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
  );
}

function extractNonCodeUrls(text) {
  if (!text) return [];
  const withoutCodeBlocks = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '');
  const matches = withoutCodeBlocks.match(/https?:\/\/[^\s]+/g) || [];
  return matches.filter(u => !isMediaUrl(u));
}

const MessageBubble = memo(function MessageBubble({
  message, compact, isOwn, isSending, isFailed, onRetry, onDismiss,
  onReply, onEdit, onDelete, onReact, onPin, onStar,
  onForward, currentUserId, onProfileClick, isEditing, onEditSave, onEditCancel,
  onImageClick, onLinkClick, onHighlight, onJumpToReply, members, getProfile, roleColor, onLongPress, onMarkMoment,
  onOpenThread, isHighlighted,
}) {
  if (message.type === 'system') return <SystemMessage message={message} />;

  const [hovered, setHovered] = useState(false);
  const [editText, setEditText] = useState(message.content || '');
  const [expanded, setExpanded] = useState(false);
  const editInputRef = useRef(null);

  React.useEffect(() => {
    if (isEditing) {
      setEditText(message.content || '');
      requestAnimationFrame(() => editInputRef.current?.focus());
    }
  }, [isEditing, message.content]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const quickEmojis = ['👍', '❤️', '😂', '🔥', '👀'];

  React.useEffect(() => {
    if (!showEmojiPicker) return;
    const handler = (e) => { if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) setShowEmojiPicker(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showEmojiPicker]);
  const longPressTimer = useRef(null);
  const handleTouchStart = useCallback(() => {
    if (!onLongPress) return;
    longPressTimer.current = setTimeout(() => { onLongPress(message); }, 500);
  }, [onLongPress, message]);
  const handleTouchEnd = useCallback(() => { clearTimeout(longPressTimer.current); }, []);
  const saveFn = useCallback(() => { if (editText.trim() && editText !== message.content) onEditSave(message.id, editText.trim()); else onEditCancel(); }, [editText, message.content, message.id, onEditSave, onEditCancel]);
  const isLong = (message.content || '').split('\n').length > MAX_LINES || (message.content || '').length > 1500;
  const isDeleted = message.is_deleted;
  const authorName = isDeleted ? 'Deleted User' : (message.author_name || 'User');
  const mentioned = hasMention(message.content);

  const handleMentionClick = (username) => {
    if (!members || !onProfileClick) return;
    const found = members.find(m => {
      const p = getProfile?.(m.user_id);
      const dn = p?.display_name || m.user_email?.split('@')[0] || '';
      return dn.toLowerCase() === username.toLowerCase();
    });
    if (found) onProfileClick(found.user_id);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="relative group transition-colors duration-75"
          data-msg-id={message.id}
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchMove={handleTouchEnd}
          style={{
            paddingTop: compact ? 1 : 0,
            paddingBottom: 1,
            marginTop: compact ? 0 : 20,
            background: hovered ? 'var(--surface-glass)' : mentioned ? 'var(--accent-dim)' : 'transparent',
            borderLeft: isHighlighted ? '3px solid #f0b232' : isEditing ? '3px solid var(--warning)' : mentioned ? '2px solid var(--accent-primary)' : '2px solid transparent',
            boxShadow: isHighlighted ? '0 0 20px rgba(240,178,50,0.3)' : 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}>

          <div className="flex items-start gap-[30px]">
            {/* Avatar or compact timestamp — 42px avatars, 54px indent for grouped */}
            {compact ? (
              <div className="w-[54px] flex-shrink-0 flex items-center justify-end pt-0.5">
                <span className="text-[10px] opacity-0 group-hover:opacity-100 tabular-nums select-none transition-opacity"
                  style={{ color: 'var(--text-faint)' }}>{ts(message.created_date)}</span>
              </div>
            ) : (
              <button onClick={() => !isDeleted && onProfileClick?.(message.author_id)}
                className="w-[42px] h-[42px] rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 overflow-hidden hover:opacity-80 mt-0.5"
                style={{ background: P.surface, color: P.muted }}>
                {isDeleted ? '👻' : message.author_avatar
                  ? <img src={message.author_avatar} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} />
                  : authorName.charAt(0).toUpperCase()}
              </button>
            )}

            <div className="flex-1 min-w-0 overflow-hidden">
              {/* Header: name + badges + timestamp */}
              {!compact && (
                <div className="flex items-baseline gap-1.5 mb-[2px] flex-wrap">
                  <button onClick={() => !isDeleted && onProfileClick?.(message.author_id)}
                    className="text-[15px] font-semibold hover:underline truncate max-w-[240px] leading-tight"
                    style={{ color: roleColor || P.textPrimary }}>{authorName}</button>
                  {!isDeleted && <InlineBadges badges={message.author_badges} />}
                  <span className="text-[11px] tabular-nums select-none ml-1"
                    style={{ color: P.muted }}
                    title={fullTs(message.created_date)}>
                    {ts(message.created_date)}
                  </span>
                  {message.is_edited && <span className="text-[11px]" style={{ color: P.muted }}>(edited)</span>}
                </div>
              )}

              {/* Reply preview — click to jump to original */}
              {message.reply_preview && (
                <button type="button" onClick={() => onJumpToReply?.(message.reply_to_id)} className="flex items-center gap-2 mb-1 cursor-pointer hover:opacity-80 min-w-0 w-full text-left text-[12px]"
                  style={{ color: P.muted }}>
                  <div className="w-0.5 h-4 rounded-full flex-shrink-0" style={{ background: P.accent }} />
                  <span className="truncate min-w-0" style={{ color: P.muted }}>
                    <span className="font-semibold" style={{ color: P.accent }}>{message.reply_preview.author_name}</span>
                    {' '}{message.reply_preview.content?.split('\n').slice(0, 2).join(' ').slice(0, 120)}
                  </span>
                </button>
              )}

              {/* Forwarded label */}
              {message.is_forwarded && (
                <div className="flex items-center gap-1 mb-1">
                  <Forward className="w-3 h-3" style={{ color: P.muted }} />
                  <span className="text-[11px] font-medium" style={{ color: P.muted }}>Forwarded</span>
                </div>
              )}

              {/* Content */}
              {isDeleted ? (
                <div className="text-[14px] italic" style={{ color: P.muted }}>This message was deleted.</div>
              ) : isEditing ? (
                <div>
                  <div className="flex items-center gap-2 mb-1.5 px-3 py-1.5 rounded-t-lg" style={{ background: `${P.warning}15`, borderLeft: `3px solid ${P.warning}` }}>
                    <Pencil className="w-3 h-3" style={{ color: P.warning }} />
                    <span className="text-[12px] font-semibold" style={{ color: P.warning }}>Editing Message</span>
                    <button onClick={onEditCancel} className="ml-auto text-[11px] hover:underline" style={{ color: P.muted }}>Cancel</button>
                  </div>
                  <textarea ref={editInputRef} value={editText} onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveFn(); } if (e.key === 'Escape') { e.preventDefault(); onEditCancel(); } }}
                    onBlur={saveFn}
                    className="w-full text-[14px] rounded-lg px-3 py-2 outline-none resize-none"
                    style={{ background: P.base, color: P.textPrimary, border: `1px solid ${P.accent}` }}
                    rows={2} />
                  <div className="text-[11px] mt-1" style={{ color: P.muted }}>
                    Escape to cancel · Enter to save
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className={`whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${isEmojiOnly(message.content) ? 'text-[42px] leading-[1.2]' : 'text-[15px] leading-[1.375]'}`}
                    style={{ color: P.textSecondary, maxHeight: isLong && !expanded ? '300px' : 'none', overflow: isLong && !expanded ? 'hidden' : 'visible' }}>
                    {renderText(message.content, onLinkClick, handleMentionClick)}
                  </div>
                  {isLong && !expanded && (
                    <button onClick={() => setExpanded(true)} className="flex items-center gap-1 text-[13px] font-medium hover:underline mt-0.5" style={{ color: P.link }}>
                      <ChevronDown className="w-3.5 h-3.5" /> Read more
                    </button>
                  )}
                  {isLong && expanded && (
                    <button onClick={() => setExpanded(false)} className="flex items-center gap-1 text-[13px] font-medium hover:underline mt-0.5" style={{ color: P.link }}>
                      <ChevronUp className="w-3.5 h-3.5" /> Show less
                    </button>
                  )}
                  {isFailed && (
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-[6px]" style={{ background: 'rgba(240,71,71,0.12)', color: P.danger }}>
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="text-[12px] font-medium">Failed to send</span>
                      </div>
                      <button onClick={onRetry} className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[12px] font-medium transition-colors hover:bg-[var(--accent-dim)]" style={{ color: P.accent }}>
                        <RotateCcw className="w-3 h-3" /> Retry
                      </button>
                      <button onClick={onDismiss} className="text-[11px] hover:underline" style={{ color: P.muted }}>Dismiss</button>
                    </div>
                  )}
                </div>
              )}

              {/* Attachments */}
              {!isDeleted && message.attachments?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {message.attachments.map((a, i) => {
                    const isGif = a.content_type === 'image/gif' || a.filename?.toLowerCase().endsWith('.gif');
                    if (a.content_type?.startsWith('image/') || isGif) {
                      return <ImageWithFallback key={i} src={a.url} alt={a.filename || 'image'} className="max-w-[400px] max-h-[300px] rounded-lg cursor-pointer hover:brightness-110" style={{ border: `1px solid ${P.border}` }} onClick={() => onImageClick?.(a.url, a.filename)} loading="lazy" />;
                    }
                    if (a.content_type?.startsWith('video/') || a.url?.match(/\.(mp4|webm|mov)(\?|$)/i)) {
                      return <VideoPlayer key={i} src={a.url} filename={a.filename} />;
                    }
                    if (a.content_type?.startsWith('audio/')) {
                      return <audio key={i} src={a.url} controls className="max-w-[300px]" />;
                    }
                    return (
                      <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors hover:brightness-110"
                        style={{ background: P.surface, border: `1px solid ${P.border}`, color: P.textSecondary }}>
                        <FileText className="w-5 h-5 flex-shrink-0" style={{ color: P.muted }} />
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium truncate" style={{ color: P.link }}>{a.filename || 'File'}</div>
                          {a.size && <div className="text-[11px]" style={{ color: P.muted }}>{(a.size / 1024).toFixed(0)} KB</div>}
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Reactions */}
              {!isDeleted && message.reactions?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {message.reactions.map((r, i) => {
                    const mine = r.users?.includes(currentUserId);
                    return (
                      <ReactionTooltip key={i} reaction={r}>
                        <button onClick={() => onReact(message, r.emoji)}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[13px] transition-all hover:brightness-110"
                          style={{
                            background: mine ? `${P.accent}15` : P.surface,
                            color: mine ? P.accent : P.textSecondary,
                            border: `1px solid ${mine ? `${P.accent}40` : P.border}`,
                          }}>
                          <span className="text-[14px]">{r.emoji}</span>
                          <span className="font-semibold tabular-nums text-[12px]">{r.count}</span>
                        </button>
                      </ReactionTooltip>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Rich link embeds for non-media URLs */}
          {!isDeleted && extractNonCodeUrls(message.content).slice(0, 3).map((url, i) => (
            <LinkEmbed key={url + i} url={url} />
          ))}

          {/* Thread reply count */}
          {!isDeleted && message.thread_count > 0 && (
            <button onClick={() => onOpenThread?.(message)}
              className="flex items-center gap-1.5 mt-2 px-2 py-1 rounded-md text-[12px] font-medium hover:bg-[rgba(255,255,255,0.04)] transition-colors"
              style={{ color: P.accent }}>
              <MessageSquare className="w-3.5 h-3.5" />
              {message.thread_count} {message.thread_count === 1 ? 'reply' : 'replies'}
              {message.thread_last_reply_author && (
                <span className="text-[11px] ml-1" style={{ color: P.muted }}>— last by {message.thread_last_reply_author}</span>
              )}
            </button>
          )}

          {/* Pill-shaped hover action bar */}
          {hovered && !isEditing && !isDeleted && (
            <div className="absolute -top-4 right-4 flex items-center p-0.5 rounded-lg gap-0.5 z-10"
              style={{
                background: P.floating, border: `1px solid ${P.border}`,
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                animation: 'slideInRight 150ms ease-out',
              }}
              role="toolbar" aria-label="Message actions">
              <div className="relative" ref={emojiPickerRef}>
                <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.08)]" title="Add Reaction">
                  <Smile className="w-4 h-4" style={{ color: showEmojiPicker ? P.textPrimary : P.muted }} />
                </button>
                {showEmojiPicker && (
                  <div className="absolute right-0 top-full mt-1 z-50" onClick={e => e.stopPropagation()}>
                    <EmojiPicker onSelect={(emoji) => { onReact(message, emoji); setShowEmojiPicker(false); }} onClose={() => setShowEmojiPicker(false)} />
                  </div>
                )}
              </div>
              <button onClick={() => onReply(message)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.08)]" title="Reply">
                <Reply className="w-4 h-4" style={{ color: P.muted }} />
              </button>
              {onOpenThread && (
                <button onClick={() => onOpenThread(message)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.08)]" title="Thread">
                  <MessageSquare className="w-4 h-4" style={{ color: P.muted }} />
                </button>
              )}
              {isOwn && (
                <button onClick={() => onEdit(message)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.08)]" title="Edit">
                  <Pencil className="w-4 h-4" style={{ color: P.muted }} />
                </button>
              )}
              {onPin && (
                <button onClick={() => onPin(message)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.08)]" title={message.is_pinned ? 'Unpin' : 'Pin'}>
                  {message.is_pinned ? <PinOff className="w-4 h-4" style={{ color: P.warning }} /> : <Pin className="w-4 h-4" style={{ color: P.muted }} />}
                </button>
              )}
              {onStar && (
                <button onClick={() => onStar(message)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.08)]" title="Bookmark">
                  <Bookmark className="w-4 h-4" style={{ color: P.muted }} />
                </button>
              )}
              <MoreDropdown message={message} isOwn={isOwn} onReply={onReply} onPin={onPin} onStar={onStar} onForward={onForward} onDelete={onDelete} onEdit={onEdit} onMarkMoment={onMarkMoment} />
            </div>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-52 p-1.5 rounded-xl" style={{ background: P.floating, border: `1px solid ${P.border}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
        {!isDeleted && <>
          <div className="flex items-center gap-0.5 px-1 py-1 mb-1">
            {['👍', '❤️', '😂', '🔥', '👀', '✨'].map(e => (
              <button key={e} onClick={() => onReact(message, e)} className="w-7 h-7 flex items-center justify-center rounded-md text-base hover:bg-[rgba(255,255,255,0.1)]">{e}</button>
            ))}
          </div>
          <ContextMenuSeparator style={{ background: P.border, margin: '4px 0' }} />
          <ContextMenuItem onClick={() => onReply(message)} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.textSecondary }}><Reply className="w-4 h-4 opacity-50" /> Reply</ContextMenuItem>
          <ContextMenuItem onClick={() => navigator.clipboard.writeText(message.content || '')} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.textSecondary }}><Copy className="w-4 h-4 opacity-50" /> Copy Text</ContextMenuItem>
        </>}
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(message.id)} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.textSecondary }}><Link className="w-4 h-4 opacity-50" /> Copy Message Link</ContextMenuItem>
        {!isDeleted && onPin && <ContextMenuItem onClick={() => onPin(message)} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.textSecondary }}><Pin className="w-4 h-4 opacity-50" /> {message.is_pinned ? 'Unpin' : 'Pin'}</ContextMenuItem>}
        {!isDeleted && onForward && <ContextMenuItem onClick={() => onForward(message)} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.textSecondary }}><Forward className="w-4 h-4 opacity-50" /> Forward</ContextMenuItem>}
        {isOwn && !isDeleted && <>
          <ContextMenuSeparator style={{ background: P.border, margin: '4px 0' }} />
          <ContextMenuItem onClick={() => onEdit(message)} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.textSecondary }}><Pencil className="w-4 h-4 opacity-50" /> Edit</ContextMenuItem>
          <ContextMenuItem onClick={() => onDelete(message)} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.danger }}><Trash2 className="w-4 h-4 opacity-50" /> Delete</ContextMenuItem>
        </>}
      </ContextMenuContent>
    </ContextMenu>
  );
});

export default MessageBubble;
