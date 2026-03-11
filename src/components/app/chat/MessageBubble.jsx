import React, { useState } from 'react';
import { Reply, Pencil, Trash2, Copy, Pin, PinOff } from 'lucide-react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';

function ts(d) { return new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }

function renderText(text) {
  if (!text) return null;
  return text.split(/(https?:\/\/[^\s]+|@everyone|@here|\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g).map((p, i) => {
    if (p.match(/^https?:\/\//)) return <a key={i} href={p} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 break-all" style={{ color: 'var(--accent-blue)' }}>{p}</a>;
    if (p === '@everyone' || p === '@here') return <span key={i} className="px-1 rounded" style={{ background: 'rgba(123,164,201,0.12)', color: 'var(--accent-blue)' }}>{p}</span>;
    if (p.match(/^\*\*.*\*\*$/)) return <strong key={i}>{p.slice(2, -2)}</strong>;
    if (p.match(/^\*.*\*$/)) return <em key={i}>{p.slice(1, -1)}</em>;
    if (p.match(/^`.*`$/)) return <code key={i} className="px-1 py-0.5 rounded text-[11px]" style={{ background: 'var(--bg-glass-strong)', color: 'var(--accent-purple)' }}>{p.slice(1, -1)}</code>;
    return p;
  });
}

export default function MessageBubble({ message, compact, isOwn, onReply, onEdit, onDelete, onReact, onPin, currentUserId, onProfileClick, isEditing, onEditSave, onEditCancel, onImageClick }) {
  const [hovered, setHovered] = useState(false);
  const [editText, setEditText] = useState(message.content || '');
  const quickEmojis = ['👍', '❤️', '😂', '🔥', '👀'];

  const saveFn = () => { if (editText.trim() && editText !== message.content) onEditSave(message.id, editText.trim()); else onEditCancel(); };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="relative group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          style={{ padding: compact ? '1px 16px' : '4px 16px', background: hovered ? 'var(--bg-glass)' : message.is_pinned ? 'rgba(201,180,123,0.02)' : 'transparent', transition: 'background 0.15s' }}>

          {message.is_pinned && !compact && (
            <div className="flex items-center gap-1 ml-[52px] mb-0.5">
              <Pin className="w-2.5 h-2.5" style={{ color: 'var(--accent-amber)' }} />
              <span className="text-[9px] font-medium" style={{ color: 'var(--accent-amber)', opacity: 0.6 }}>Pinned</span>
            </div>
          )}

          {message.reply_preview && (
            <div className="flex items-center gap-1.5 ml-[52px] mb-0.5">
              <div className="w-0.5 h-3 rounded-full" style={{ background: 'var(--border-light)' }} />
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{message.reply_preview.author_name}</span>
                {' '}{message.reply_preview.content?.slice(0, 60)}
              </span>
            </div>
          )}

          <div className="flex items-start gap-3">
            {compact ? (
              <div className="w-10 flex-shrink-0 flex items-center justify-center">
                <span className="text-[10px] opacity-0 group-hover:opacity-100 tabular-nums" style={{ color: 'var(--text-faint)', fontFamily: 'monospace' }}>{ts(message.created_date)}</span>
              </div>
            ) : (
              <button onClick={() => onProfileClick?.(message.author_id)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-medium flex-shrink-0 overflow-hidden transition-all hover:brightness-125"
                style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {message.author_avatar ? <img src={message.author_avatar} className="w-full h-full object-cover" /> : (message.author_name || 'U').charAt(0).toUpperCase()}
              </button>
            )}
            <div className="flex-1 min-w-0">
              {!compact && (
                <div className="flex items-baseline gap-2 mb-0.5">
                  <button onClick={() => onProfileClick?.(message.author_id)} className="text-[13px] font-semibold hover:underline" style={{ color: 'var(--text-cream)', textDecorationColor: 'var(--text-faint)' }}>
                    {message.author_name || 'User'}
                  </button>
                  {message.author_badges?.includes('owner') && <span className="text-[8px] px-1 rounded-sm font-mono" style={{ background: 'rgba(201,180,123,0.15)', color: 'var(--accent-amber)' }}>OWNER</span>}
                  {message.author_badges?.includes('admin') && <span className="text-[8px] px-1 rounded-sm font-mono" style={{ background: 'rgba(123,164,201,0.15)', color: 'var(--accent-blue)' }}>ADMIN</span>}
                  <span className="text-[10px] tabular-nums" style={{ color: 'var(--text-faint)', fontFamily: 'monospace' }}>{ts(message.created_date)}</span>
                  {message.is_edited && <span className="text-[9px] italic" style={{ color: 'var(--text-faint)' }}>(edited)</span>}
                </div>
              )}

              {isEditing ? (
                <div>
                  <textarea value={editText} onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveFn(); } if (e.key === 'Escape') onEditCancel(); }}
                    className="w-full text-[13px] rounded-xl px-3 py-2 focus:outline-none resize-none" style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-light)' }}
                    rows={2} autoFocus />
                  <div className="text-[10px] mt-1" style={{ color: 'var(--text-faint)' }}>
                    esc to <button onClick={onEditCancel} className="underline" style={{ color: 'var(--accent-blue)' }}>cancel</button> · enter to <button onClick={saveFn} className="underline" style={{ color: 'var(--accent-blue)' }}>save</button>
                  </div>
                </div>
              ) : (
                <div className="text-[13px] leading-[1.6] break-words whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{renderText(message.content)}</div>
              )}

              {message.attachments?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {message.attachments.map((a, i) => {
                    if (a.content_type?.startsWith('image/')) return <img key={i} src={a.url} className="max-w-[380px] max-h-[260px] rounded-xl object-cover cursor-pointer hover:brightness-110 transition-all" style={{ border: '1px solid var(--border)' }} onClick={() => onImageClick?.(a.url, a.filename)} />;
                    if (a.content_type?.startsWith('video/')) return <video key={i} src={a.url} controls className="max-w-[380px] max-h-[260px] rounded-xl" style={{ border: '1px solid var(--border)' }} />;
                    if (a.content_type?.startsWith('audio/')) return <audio key={i} src={a.url} controls className="max-w-[300px]" />;
                    return <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[11px] px-3 py-2 rounded-xl glass hover:bg-[var(--bg-glass-hover)]" style={{ color: 'var(--text-secondary)' }}>📎 {a.filename}</a>;
                  })}
                </div>
              )}

              {message.reactions?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {message.reactions.map((r, i) => {
                    const mine = r.users?.includes(currentUserId);
                    return (
                      <button key={i} onClick={() => onReact(message, r.emoji)}
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] transition-colors"
                        style={{ background: mine ? 'rgba(123,164,201,0.1)' : 'var(--bg-glass)', color: mine ? 'var(--accent-blue)' : 'var(--text-muted)', border: `1px solid ${mine ? 'rgba(123,164,201,0.2)' : 'var(--border)'}` }}>
                        {r.emoji} {r.count}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {hovered && !isEditing && (
            <div className="absolute -top-3 right-4 flex items-center p-[3px] rounded-xl gap-[2px] z-10 glass-strong" style={{ boxShadow: 'var(--shadow-md)' }}>
              {quickEmojis.map(e => <button key={e} onClick={() => onReact(message, e)} className="w-7 h-7 flex items-center justify-center rounded-lg text-sm hover:bg-[var(--bg-glass-hover)]">{e}</button>)}
              <div className="w-px h-5 mx-0.5" style={{ background: 'var(--border)' }} />
              <button onClick={() => onReply(message)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--bg-glass-hover)]" title="Reply"><Reply className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /></button>
              {onPin && <button onClick={() => onPin(message)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--bg-glass-hover)]">{message.is_pinned ? <PinOff className="w-3 h-3" style={{ color: 'var(--accent-amber)' }} /> : <Pin className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />}</button>}
              {isOwn && <>
                <button onClick={() => onEdit(message)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--bg-glass-hover)]"><Pencil className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /></button>
                <button onClick={() => onDelete(message)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--bg-glass-hover)]"><Trash2 className="w-3 h-3" style={{ color: 'var(--accent-red)' }} /></button>
              </>}
            </div>
          )}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-44 p-1 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)', backdropFilter: 'blur(20px)' }}>
        <ContextMenuItem onClick={() => onReply(message)} className="text-[12px] gap-2 rounded-lg px-2.5 py-1.5" style={{ color: 'var(--text-secondary)' }}><Reply className="w-3.5 h-3.5 opacity-50" /> Reply</ContextMenuItem>
        <ContextMenuItem onClick={() => navigator.clipboard.writeText(message.content)} className="text-[12px] gap-2 rounded-lg px-2.5 py-1.5" style={{ color: 'var(--text-secondary)' }}><Copy className="w-3.5 h-3.5 opacity-50" /> Copy</ContextMenuItem>
        {onPin && <ContextMenuItem onClick={() => onPin(message)} className="text-[12px] gap-2 rounded-lg px-2.5 py-1.5" style={{ color: 'var(--text-secondary)' }}><Pin className="w-3.5 h-3.5 opacity-50" /> {message.is_pinned ? 'Unpin' : 'Pin'}</ContextMenuItem>}
        {isOwn && <>
          <ContextMenuSeparator style={{ background: 'var(--border)' }} />
          <ContextMenuItem onClick={() => onEdit(message)} className="text-[12px] gap-2 rounded-lg px-2.5 py-1.5" style={{ color: 'var(--text-secondary)' }}><Pencil className="w-3.5 h-3.5 opacity-50" /> Edit</ContextMenuItem>
          <ContextMenuItem onClick={() => onDelete(message)} className="text-[12px] gap-2 rounded-lg px-2.5 py-1.5" style={{ color: 'var(--accent-red)' }}><Trash2 className="w-3.5 h-3.5 opacity-50" /> Delete</ContextMenuItem>
        </>}
      </ContextMenuContent>
    </ContextMenu>
  );
}