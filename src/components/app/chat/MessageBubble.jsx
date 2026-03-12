import React, { useState, memo } from 'react';
import { Reply, Pencil, Trash2, Copy, Pin, PinOff, Link, ChevronDown, ChevronUp, Bookmark, ArrowRight, Zap, UserPlus, LogOut, Star } from 'lucide-react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import ImageWithFallback from '@/components/app/shared/ImageWithFallback';
import ReactionTooltip from '@/components/app/shared/ReactionTooltip';
import VideoPlayer from '@/components/app/chat/VideoPlayer';
import { colors } from '@/components/app/design/tokens';
import { BADGE_CONFIG } from '@/components/app/badges/badgeConfig';

function ts(d) { return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); }
function fullTs(d) { return new Date(d).toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' }); }
function dateStr(d) { return new Date(d).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }); }

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
      const lang = firstLine > -1 ? inner.slice(0, firstLine).trim() : '';
      const code = firstLine > -1 ? inner.slice(firstLine + 1) : inner;
      return (
        <pre key={si} className="px-3 py-2 rounded-lg text-[13px] my-1.5 overflow-x-auto" style={{ background: colors.bg.base, color: colors.text.secondary, border: `1px solid ${colors.border.default}`, maxWidth: '100%', whiteSpace: 'pre', overflowX: 'auto', wordBreak: 'normal', overflowWrap: 'normal' }}>
          {lang && <div className="text-[10px] font-semibold uppercase mb-1 opacity-40">{lang}</div>}
          <code style={{ whiteSpace: 'pre', wordBreak: 'normal', overflowWrap: 'normal' }}>{code}</code>
        </pre>
      );
    }
    if (segment.match(/^`[^`]+`$/)) return <code key={si} className="px-1.5 py-0.5 rounded text-[13px]" style={{ background: colors.bg.base, color: colors.text.secondary }}>{segment.slice(1, -1)}</code>;
    return segment.split(/(https?:\/\/[^\s]+|@everyone|@here|\*\*[^*]+\*\*|\*[^*]+\*)/g).map((p, i) => {
      const key = `${si}-${i}`;
      if (p.match(/^https?:\/\//)) {
        const mediaType = isMediaUrl(p);
        if (mediaType === 'gif' || mediaType === 'image') return <img key={key} src={p} alt="embedded" className="max-w-[400px] max-h-[280px] rounded-lg mt-1 block" style={{ border: `1px solid ${colors.border.default}` }} loading="lazy" decoding="async" />;
        return <a key={key} href={p} onClick={e => { if (onLinkClick) { e.preventDefault(); onLinkClick(p); } }} target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: colors.text.link, wordBreak: 'break-all' }}>{p}</a>;
      }
      if (p === '@everyone' || p === '@here') return <span key={key} className="px-0.5 rounded font-medium" style={{ background: `${colors.accent.primary}20`, color: colors.accent.primary }}>{p}</span>;
      if (p.match(/^@\w+/)) return <span key={key} className="px-0.5 rounded font-medium" style={{ background: `${colors.accent.primary}20`, color: colors.accent.primary }}>{p}</span>;
      if (p.match(/^\*\*.*\*\*$/)) return <strong key={key}>{p.slice(2, -2)}</strong>;
      if (p.match(/^\*.*\*$/)) return <em key={key}>{p.slice(1, -1)}</em>;
      if (p.match(/^\|\|.*\|\|$/)) {
        const SpoilerTag = () => {
          const [revealed, setRevealed] = React.useState(false);
          return <span onClick={() => setRevealed(true)} className="px-1 rounded cursor-pointer" style={{ background: revealed ? 'rgba(255,255,255,0.06)' : colors.bg.base, color: revealed ? colors.text.secondary : 'transparent' }}>{p.slice(2, -2)}</span>;
        };
        return <SpoilerTag key={key} />;
      }
      return p;
    });
  });
}

const MAX_LINES = 20;
const EMOJI_ONLY_REGEX = /^(\p{Emoji_Presentation}|\p{Extended_Pictographic}[\uFE0F\u200D]*){1,3}$/u;
function isEmojiOnly(text) {
  if (!text) return false;
  const stripped = text.trim();
  return stripped.length <= 12 && EMOJI_ONLY_REGEX.test(stripped);
}

/* Badge icons inline after username — small colored icons like Discord/inspo */
const BADGE_ICONS = {
  owner: { icon: Crown, color: '#faa61a' },
  admin: { icon: Shield, color: '#5865F2' },
  developer: { icon: Gamepad2, color: '#a78bfa' },
  bug_hunter: { icon: Bug, color: '#faa61a' },
  tester: { icon: Bug, color: '#3ba55c' },
  moderator: { icon: Shield, color: '#3ba55c' },
  premium: { icon: Crown, color: '#faa61a' },
  verified: { icon: Star, color: '#3ba55c' },
  partner: { icon: Star, color: '#5865F2' },
  early_supporter: { icon: Star, color: '#ed4245' },
};

function InlineBadges({ badges }) {
  if (!badges?.length) return null;
  return (
    <span className="inline-flex items-center gap-0.5 ml-1">
      {badges.map(b => {
        const cfg = BADGE_ICONS[b];
        if (!cfg) return null;
        const Icon = cfg.icon;
        return <Icon key={b} className="w-4 h-4 flex-shrink-0" style={{ color: cfg.color }} />;
      })}
    </span>
  );
}

/* YouTube icon inline */
function YouTubeIcon({ url, show }) {
  if (!url || show === false) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex ml-0.5 hover:opacity-80" title="YouTube Channel">
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.4 31.4 0 000 12a31.4 31.4 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31.4 31.4 0 0024 12a31.4 31.4 0 00-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>
    </a>
  );
}

const SystemMessage = memo(function SystemMessage({ message }) {
  const content = message.content || '';
  const isBoost = content.toLowerCase().includes('boost');
  const isJoin = content.toLowerCase().includes('joined') || content.toLowerCase().includes('welcome');
  const Icon = isBoost ? Zap : isJoin ? UserPlus : ArrowRight;
  const accent = isBoost ? '#a855f7' : isJoin ? colors.success : colors.text.disabled;
  return (
    <div className="flex items-center gap-3 py-1 px-5">
      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${accent}15` }}>
        <Icon className="w-3 h-3" style={{ color: accent }} />
      </div>
      <span className="text-[13px]" style={{ color: colors.text.muted }}>{content}</span>
      <span className="text-[10px] tabular-nums ml-auto" style={{ color: colors.text.disabled }}>{ts(message.created_date)}</span>
    </div>
  );
});

const MessageBubble = memo(function MessageBubble({ message, compact, isOwn, onReply, onEdit, onDelete, onReact, onPin, onStar, currentUserId, onProfileClick, isEditing, onEditSave, onEditCancel, onImageClick, onLinkClick, onHighlight }) {
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
  const roleColor = message.author_badges?.includes('owner') ? '#faa61a'
    : message.author_badges?.includes('admin') ? '#5865F2' : colors.text.primary;

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="relative group flex items-start gap-4 py-[3px] px-4 hover:bg-[rgba(255,255,255,0.02)]"
          data-msg-id={message.id}
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          style={{ marginTop: compact ? 0 : '1.125rem' }}>

          {/* Avatar or compact timestamp */}
          {compact ? (
            <div className="w-10 flex-shrink-0 flex items-center justify-end pt-0.5">
              <span className="text-[10px] opacity-0 group-hover:opacity-100 tabular-nums select-none" style={{ color: colors.text.disabled }}>{ts(message.created_date)}</span>
            </div>
          ) : (
            <button onClick={() => !isDeleted && onProfileClick?.(message.author_id)}
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 overflow-hidden hover:opacity-80 mt-0.5"
              style={{ background: colors.bg.overlay, color: colors.text.muted }}>
              {isDeleted ? '👻' : message.author_avatar
                ? <img src={message.author_avatar} className="w-full h-full object-cover" alt="" />
                : authorName.charAt(0).toUpperCase()}
            </button>
          )}

          <div className="flex-1 min-w-0 overflow-hidden">
            {/* Header: name + badges + timestamp */}
            {!compact && (
              <div className="flex items-center gap-1 mb-[2px] flex-wrap">
                <button onClick={() => !isDeleted && onProfileClick?.(message.author_id)}
                  className="text-[15px] font-semibold hover:underline truncate max-w-[200px] leading-tight"
                  style={{ color: roleColor }}>{authorName}</button>
                {!isDeleted && <InlineBadges badges={message.author_badges} />}
                {!isDeleted && <YouTubeIcon url={message.author_youtube_url} show={message.author_youtube_show_icon} />}
                <span className="text-[11px] tabular-nums select-none flex-shrink-0 ml-1"
                  style={{ color: colors.text.disabled }}
                  title={fullTs(message.created_date)}>
                  {dateStr(message.created_date)} {ts(message.created_date)}
                </span>
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

            {/* Reply preview */}
            {message.reply_preview && (
              <div className="flex items-center gap-2 mb-1 cursor-pointer hover:opacity-80">
                <div className="w-0.5 h-4 rounded-full flex-shrink-0" style={{ background: colors.accent.primary }} />
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
                  className="w-full text-[14px] rounded-lg px-3 py-2 outline-none resize-none"
                  style={{ background: colors.bg.overlay, color: colors.text.primary, border: `1px solid ${colors.accent.primary}` }}
                  rows={2} autoFocus />
                <div className="text-[11px] mt-1" style={{ color: colors.text.disabled }}>
                  Escape to <button onClick={onEditCancel} className="underline" style={{ color: colors.text.link }}>cancel</button> · Enter to <button onClick={saveFn} className="underline" style={{ color: colors.text.link }}>save</button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className={`whitespace-pre-wrap break-words ${isEmojiOnly(message.content) ? 'text-[42px] leading-[1.2]' : 'text-[15px] leading-[1.375]'}`}
                  style={{ color: colors.text.secondary, maxHeight: isLong && !expanded ? '300px' : 'none' }}>
                  {renderText(message.content, onLinkClick)}
                </div>
                {isLong && !expanded && (
                  <button onClick={() => setExpanded(true)} className="flex items-center gap-1 text-[13px] font-medium hover:underline mt-0.5" style={{ color: colors.text.link }}>
                    <ChevronDown className="w-3.5 h-3.5" /> Read more
                  </button>
                )}
                {isLong && expanded && (
                  <button onClick={() => setExpanded(false)} className="flex items-center gap-1 text-[13px] font-medium hover:underline mt-0.5" style={{ color: colors.text.link }}>
                    <ChevronUp className="w-3.5 h-3.5" /> Show less
                  </button>
                )}
              </div>
            )}

            {/* Attachments */}
            {!isDeleted && message.attachments?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1.5">
                {message.attachments.map((a, i) => {
                  const isGif = a.content_type === 'image/gif' || a.filename?.toLowerCase().endsWith('.gif') || a.url?.toLowerCase().includes('.gif');
                  if (a.content_type?.startsWith('image/') || isGif) return <ImageWithFallback key={i} src={a.url} alt={a.filename || 'image'} className="max-w-[400px] max-h-[300px] rounded-lg cursor-pointer hover:brightness-110" style={{ border: `1px solid ${colors.border.default}` }} onClick={() => onImageClick?.(a.url, a.filename)} loading="lazy" decoding="async" />;
                  if (a.content_type?.startsWith('video/') || a.url?.match(/\.(mp4|webm|mov|avi|mkv)(\?|$)/i)) return <VideoPlayer key={i} src={a.url} filename={a.filename} />;
                  if (a.content_type?.startsWith('audio/') || a.url?.match(/\.(mp3|wav|ogg|flac|aac)(\?|$)/i)) return <audio key={i} src={a.url} controls className="max-w-[300px]" />;
                  return <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[13px] px-3 py-2 rounded-lg" style={{ color: colors.text.secondary, background: colors.bg.overlay }}>📎 {a.filename || 'File'}</a>;
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
                          background: mine ? colors.accent.subtle : colors.bg.overlay,
                          color: mine ? colors.accent.primary : colors.text.secondary,
                          border: `1px solid ${mine ? colors.accent.muted : colors.border.default}`,
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

          {/* Hover action toolbar */}
          {hovered && !isEditing && !isDeleted && (
            <div className="absolute -top-3 right-4 flex items-center p-0.5 rounded-lg gap-0.5 z-10 k-fade-in"
              style={{ background: colors.bg.overlay, border: `1px solid ${colors.border.strong}`, boxShadow: '0 4px 16px rgba(0,0,0,0.5)' }}
              role="toolbar" aria-label="Message actions">
              {quickEmojis.map(e => <button key={e} onClick={() => onReact(message, e)} className="w-7 h-7 flex items-center justify-center rounded-md text-sm hover:bg-[rgba(255,255,255,0.06)]">{e}</button>)}
              <div className="w-px h-5 mx-0.5" style={{ background: colors.border.default }} />
              <button onClick={() => onReply(message)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)]" title="Reply"><Reply className="w-4 h-4" style={{ color: colors.text.muted }} /></button>
              {onStar && <button onClick={() => onStar(message)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)]" title="Star"><Star className="w-3.5 h-3.5" style={{ color: '#faa61a' }} /></button>}
              {onPin && <button onClick={() => onPin(message)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)]" title={message.is_pinned ? 'Unpin' : 'Pin'}>{message.is_pinned ? <PinOff className="w-3.5 h-3.5" style={{ color: colors.warning }} /> : <Pin className="w-3.5 h-3.5" style={{ color: colors.text.muted }} />}</button>}
              {isOwn && <>
                <button onClick={() => onEdit(message)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)]" title="Edit"><Pencil className="w-3.5 h-3.5" style={{ color: colors.text.muted }} /></button>
                <button onClick={() => onDelete(message)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)]" title="Delete"><Trash2 className="w-3.5 h-3.5" style={{ color: colors.danger }} /></button>
              </>}
            </div>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-52 p-1 rounded-lg" style={{ background: colors.bg.float, border: `1px solid ${colors.border.strong}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
        {!isDeleted && <>
          <div className="flex items-center gap-0.5 px-1 py-1 mb-1">
            {['👍', '❤️', '😂', '🔥', '👀', '✨'].map(e => (
              <button key={e} onClick={() => onReact(message, e)} className="w-7 h-7 flex items-center justify-center rounded-md text-base hover:bg-[rgba(255,255,255,0.1)]">{e}</button>
            ))}
          </div>
          <ContextMenuSeparator style={{ background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
          <ContextMenuItem onClick={() => onReply(message)} className="text-[13px] gap-2 rounded-md px-2 py-1.5" style={{ color: colors.text.secondary }}><Reply className="w-4 h-4 opacity-50" /> Reply</ContextMenuItem>
          <ContextMenuItem onClick={() => navigator.clipboard.writeText(message.content || '')} className="text-[13px] gap-2 rounded-md px-2 py-1.5" style={{ color: colors.text.secondary }}><Copy className="w-4 h-4 opacity-50" /> Copy Text</ContextMenuItem>
        </>}
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(message.id)} className="text-[13px] gap-2 rounded-md px-2 py-1.5" style={{ color: colors.text.secondary }}><Link className="w-4 h-4 opacity-50" /> Copy Message ID</ContextMenuItem>
        {!isDeleted && onPin && <ContextMenuItem onClick={() => onPin(message)} className="text-[13px] gap-2 rounded-md px-2 py-1.5" style={{ color: colors.text.secondary }}><Pin className="w-4 h-4 opacity-50" /> {message.is_pinned ? 'Unpin' : 'Pin'}</ContextMenuItem>}
        {!isDeleted && onStar && <ContextMenuItem onClick={() => onStar(message)} className="text-[13px] gap-2 rounded-md px-2 py-1.5" style={{ color: '#faa61a' }}><Star className="w-4 h-4 opacity-50" /> Star Message</ContextMenuItem>}
        {!isDeleted && <ContextMenuItem onClick={() => onHighlight?.(message)} className="text-[13px] gap-2 rounded-md px-2 py-1.5" style={{ color: colors.text.secondary }}><Bookmark className="w-4 h-4 opacity-50" /> Save as Highlight</ContextMenuItem>}
        {isOwn && !isDeleted && <>
          <ContextMenuSeparator style={{ background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
          <ContextMenuItem onClick={() => onEdit(message)} className="text-[13px] gap-2 rounded-md px-2 py-1.5" style={{ color: colors.text.secondary }}><Pencil className="w-4 h-4 opacity-50" /> Edit</ContextMenuItem>
          <ContextMenuItem onClick={() => onDelete(message)} className="text-[13px] gap-2 rounded-md px-2 py-1.5" style={{ color: colors.danger }}><Trash2 className="w-4 h-4 opacity-50" /> Delete</ContextMenuItem>
        </>}
      </ContextMenuContent>
    </ContextMenu>
  );
});

export default MessageBubble;