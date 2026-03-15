import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, Send, X, Smile, Image, FileText, Film, Type, Stamp, Clock, Link, BarChart3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';
import FormattingToolbar from '@/components/app/features/FormattingToolbar';
import GifPicker from '@/components/app/chat/GifPicker';
import StickerPicker from '@/components/app/chat/StickerPicker';
import SlashCommandPicker from '@/components/app/chat/SlashCommandPicker';
import MentionPicker from '@/components/app/chat/MentionPicker';
import EmojiPicker from '@/components/app/chat/EmojiPicker';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { checkRateLimit } from '@/lib/security/rateLimiter';
import { sanitizeMessageContent } from '@/lib/security/sanitizer';
import { formatFileSize, getFileSizeLimit } from '@/lib/security/fileValidator';
import { uploadMessageAttachment } from '@/lib/uploadUtils';

const P = {
  base: colors.bg.base, surface: colors.bg.surface, elevated: colors.bg.elevated,
  floating: colors.bg.float, border: colors.border.subtle, inputBorder: colors.border.medium,
  textPrimary: colors.text.primary, textSecondary: colors.text.secondary, muted: colors.text.muted,
  accent: colors.accent.primary, danger: colors.danger, warning: colors.warning,
};

const LINE_HEIGHT = 22;
const MAX_INPUT_HEIGHT = 160;

export default function ChatInput({ channelName, channelId, replyTo, onCancelReply, onSend, onTyping, onEditLast, onSchedule, serverId, members, getProfile, maxChars = 2000, slowModeRemaining = 0, hasElite = false, hasLite = false, editingMessage, onEditSave, onEditCancel }) {
  const storageKey = `kairo-draft-${channelId || channelName || 'default'}`;
  const [content, setContent] = useState(() => {
    try { return localStorage.getItem(storageKey) || ''; } catch { return ''; }
  });
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const sendLockRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [showSticker, setShowSticker] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const [showSlash, setShowSlash] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [showMention, setShowMention] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const fileRef = useRef(null);
  const inputRef = useRef(null);
  const inputWrapperRef = useRef(null);
  const typingRef = useRef(0);
  const historyKey = `kairo-input-history-${channelId || channelName || 'default'}`;
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem(historyKey) || '[]'); } catch { return []; }
  });
  const historyIndexRef = useRef(-1);

  useEffect(() => {
    if (editingMessage) return;
    if (!content) { try { localStorage.removeItem(storageKey); } catch {} return; }
    const t = setTimeout(() => { try { localStorage.setItem(storageKey, content); } catch {} }, 500);
    return () => clearTimeout(t);
  }, [content, storageKey, editingMessage]);

  useEffect(() => {
    try { setContent(localStorage.getItem(storageKey) || ''); } catch { setContent(''); }
    setShowEmoji(false); setShowFormatting(false); setShowGif(false); setShowSticker(false); setShowSlash(false); setFiles([]);
    historyIndexRef.current = -1;
  }, [storageKey]);

  useEffect(() => {
    try { setHistory(JSON.parse(localStorage.getItem(historyKey) || '[]')); } catch { setHistory([]); }
  }, [historyKey]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [channelId]);

  useEffect(() => {
    if (editingMessage) setContent(editingMessage.content || '');
  }, [editingMessage?.id]);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = 'auto';
    const next = Math.min(MAX_INPUT_HEIGHT, Math.max(LINE_HEIGHT, inputRef.current.scrollHeight));
    inputRef.current.style.height = `${next}px`;
  }, [content]);

  const handleTyping = useCallback(() => {
    if (Date.now() - typingRef.current > 3000) { typingRef.current = Date.now(); onTyping?.(); }
  }, [onTyping]);

  const [uploadError, setUploadError] = useState('');

  const uploadFiles = async (list) => {
    setUploadError('');
    const rateCheck = checkRateLimit('file_upload', 'user');
    if (!rateCheck.allowed) {
      setUploadError(rateCheck.message);
      return;
    }

    setUploading(true);
    const results = [];
    for (const f of Array.from(list)) {
      try {
        const att = await uploadMessageAttachment(f, { isElite: hasElite, isLite: hasLite });
        results.push(att);
      } catch (err) {
        setUploadError(err?.message || `Couldn't upload ${f.name}. Try a smaller file or different format.`);
      }
    }
    setFiles(prev => [...prev, ...results]);
    setUploading(false);
  };

  const closePickers = () => { setShowEmoji(false); setShowGif(false); setShowSticker(false); setShowSlash(false); setShowMention(false); };

  const [sendError, setSendError] = useState('');
  const charCount = content.length;
  const remaining = maxChars - charCount;
  const nearLimit = remaining <= 200;

  const handleSend = async () => {
    const trimmed = content.trim();
    const isEditing = !!editingMessage;
    if ((!trimmed && files.length === 0 && !isEditing) || sending || remaining < 0 || slowModeRemaining > 0) return;
    if (isEditing && !trimmed) return;
    setSendError('');

    const rateCheck = checkRateLimit('message', 'user');
    if (!rateCheck.allowed) {
      setSendError(rateCheck.message);
      return;
    }

    if (sendLockRef.current && Date.now() - sendLockRef.current.ts < 2000 && sendLockRef.current.content === trimmed) return;
    sendLockRef.current = { content: trimmed, ts: Date.now() };

    const sanitized = sanitizeMessageContent(trimmed);
    const backupContent = trimmed;
    const backupFiles = [...files];
    setContent(''); setFiles([]); closePickers();
    if (!isEditing) try { localStorage.removeItem(storageKey); } catch {}
    inputRef.current?.focus();
    setSending(true);
    try {
      if (isEditing) {
        await onEditSave?.(editingMessage.id, sanitized);
        onEditCancel?.();
      } else {
        const payload = {
          content: sanitized,
          attachments: files.length > 0 ? files : undefined,
          replyToId: replyTo?.id,
          replyPreview: replyTo ? { author_name: replyTo.author_name, content: replyTo.content?.slice(0, 80) } : undefined,
        };
        await onSend?.(payload);
      }
    } catch (err) {
      setContent(backupContent);
      setFiles(backupFiles);
      setSendError('Couldn\'t send. Try again.');
    } finally {
      setSending(false);
      sendLockRef.current = null;
    }
    if (trimmed && !isEditing) {
      setHistory(prev => {
        const next = [trimmed, ...prev.filter(t => t !== trimmed)].slice(0, 10);
        try { localStorage.setItem(historyKey, JSON.stringify(next)); } catch {}
        return next;
      });
      historyIndexRef.current = -1;
    }
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') { closePickers(); if (editingMessage) onEditCancel?.(); else if (replyTo) onCancelReply(); return; }
    if (showEmoji || showGif || showSticker || showSlash || showMention) return;
    if (e.key === 'Enter' && !e.shiftKey && !showSlash && !showMention) { e.preventDefault(); handleSend(); return; }
    if (e.key === 'ArrowUp' && !e.shiftKey) {
      const canGoUp = (content === '' && history.length > 0) || (historyIndexRef.current >= 0 && historyIndexRef.current < history.length - 1);
      if (canGoUp) {
        e.preventDefault();
        historyIndexRef.current = Math.min(historyIndexRef.current + 1, history.length - 1);
        setContent(history[historyIndexRef.current]);
        return;
      }
      if (content === '' && onEditLast) { e.preventDefault(); onEditLast(); return; }
    }
    if (e.key === 'ArrowDown' && !e.shiftKey) {
      if (historyIndexRef.current >= 0) {
        e.preventDefault();
        historyIndexRef.current--;
        setContent(historyIndexRef.current >= 0 ? history[historyIndexRef.current] : '');
        return;
      }
    }
    const wrap = (prefix, suffix) => {
      e.preventDefault();
      const el = inputRef.current;
      if (!el) return;
      const s = el.selectionStart, end = el.selectionEnd;
      const sel = content.substring(s, end) || 'text';
      setContent(content.substring(0, s) + prefix + sel + suffix + content.substring(end));
      setTimeout(() => { el.focus(); el.setSelectionRange(s + prefix.length, s + prefix.length + sel.length); }, 0);
    };
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') wrap('**', '**');
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') wrap('*', '*');
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') wrap('__', '__');
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') wrap('`', '`');
  }, [content, history, showEmoji, showGif, showSticker, showSlash, showMention, replyTo, onCancelReply, onEditLast, editingMessage, onEditCancel]);

  const handleContentChange = (val) => {
    if (historyIndexRef.current >= 0) historyIndexRef.current = -1;
    setContent(val);
    handleTyping();
    // Slash command detection
    if (val.startsWith('/')) {
      setShowSlash(true);
      setSlashFilter(val.slice(1));
      setShowMention(false);
    } else if (showSlash) {
      setShowSlash(false);
    }
    // @mention detection — look for @ at word boundary
    const cursorPos = inputRef.current?.selectionStart || val.length;
    const textBefore = val.slice(0, cursorPos);
    const mentionMatch = textBefore.match(/@(\w*)$/);
    if (mentionMatch && members?.length > 0) {
      setShowMention(true);
      setMentionFilter(mentionMatch[1]);
      setShowSlash(false);
    } else if (showMention) {
      setShowMention(false);
    }
  };

  const handleMentionSelect = (member) => {
    if (!member) { setShowMention(false); return; }
    const cursorPos = inputRef.current?.selectionStart || content.length;
    const textBefore = content.slice(0, cursorPos);
    const textAfter = content.slice(cursorPos);
    // Special mentions: @everyone, @here
    const mentionText = member.special ? member.displayName : member.displayName;
    const newBefore = textBefore.replace(/@(\w*)$/, `@${mentionText} `);
    setContent(newBefore + textAfter);
    setShowMention(false);
    inputRef.current?.focus();
  };

  const handleSlashSelect = (cmd) => {
    if (!cmd) { setShowSlash(false); return; }
    const params = cmd.params?.filter(p => p.required).map(p => `[${p.name}]`).join(' ') || '';
    setContent(`/${cmd.name} ${params}`);
    setShowSlash(false);
    inputRef.current?.focus();
  };

  const handleGifSelect = (url) => {
    onSend({ content: url, attachments: undefined, replyToId: replyTo?.id, replyPreview: replyTo ? { author_name: replyTo.author_name, content: replyTo.content?.slice(0, 80) } : undefined });
    closePickers();
  };

  const handleStickerSelect = (urlOrEmoji) => {
    onSend({ content: urlOrEmoji, attachments: undefined, replyToId: replyTo?.id });
    closePickers();
  };

  const getIcon = (type) => { if (type?.startsWith('image/')) return Image; if (type?.startsWith('video/')) return Film; return FileText; };

  const placeholders = [`What's on your mind?`, `Say something nice...`, `Share your thoughts...`, `Type a message...`];
  const placeholderIdx = Math.abs((channelName || '').length) % placeholders.length;
  const placeholder = replyTo ? `Reply to ${replyTo.author_name}...` : (channelName ? `Message #${channelName}` : placeholders[placeholderIdx]);

  const hasContent = !!(content.trim() || files.length > 0 || editingMessage);
  return (
    <div className="px-5 pb-4 pt-0 mt-2 relative"
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files); }}>

      {/* Drop overlay */}
      {dragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl pointer-events-none"
          style={{ background: `${P.accent}15`, border: `2px dashed ${P.accent}`, backdropFilter: 'blur(4px)' }}>
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: `${P.accent}20` }}>
              <Plus className="w-8 h-8" style={{ color: P.accent }} />
            </div>
            <span className="text-[17px] font-bold block mb-1" style={{ color: '#fff' }}>Drop files to upload</span>
            <span className="text-[13px]" style={{ color: P.textSecondary }}>Images, videos, documents — up to 50MB</span>
          </div>
        </div>
      )}

      {/* Slash command picker */}
      {showSlash && <SlashCommandPicker filter={slashFilter} onSelect={handleSlashSelect} serverId={serverId} />}

      {/* Mention picker */}
      {showMention && <MentionPicker filter={mentionFilter} members={members} onSelect={handleMentionSelect} profiles={getProfile} />}

      {/* GIF picker */}
      {showGif && <GifPicker onSelect={handleGifSelect} onClose={() => setShowGif(false)} />}

      {/* Sticker picker */}
      {showSticker && <StickerPicker onSelect={handleStickerSelect} onClose={() => setShowSticker(false)} serverId={serverId} />}

      {/* Rate limit / validation errors */}
      {(sendError || uploadError) && (
        <div className="flex items-center gap-2 px-4 py-2 mx-4 mb-1 rounded-lg text-[12px] font-medium"
          style={{ background: `${P.danger}15`, color: P.danger }}>
          <span>{sendError || uploadError}</span>
          <button onClick={() => { setSendError(''); setUploadError(''); }}
            className="ml-auto p-0.5 rounded hover:bg-[rgba(237,66,69,0.15)]">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Reply bar — slides down 150ms */}
      {replyTo && (
        <div className="flex items-center gap-3 px-4 py-2.5 mb-1 animate-in slide-in-from-top-2 duration-150" style={{ background: P.floating, borderRadius: '12px 12px 0 0', borderLeft: `3px solid ${P.accent}` }}>
          <span className="text-[13px] flex-1 min-w-0 truncate" style={{ color: P.muted }}>
            Replying to <span className="font-semibold" style={{ color: P.textPrimary }}>{replyTo.author_name}</span>
            {replyTo.content && <span className="ml-1.5 truncate" style={{ color: P.muted }}>— {replyTo.content.slice(0, 80)}</span>}
          </span>
          <button onClick={onCancelReply} className="w-6 h-6 flex items-center justify-center rounded hover:bg-[rgba(237,66,69,0.12)] transition-colors" title="Cancel reply">
            <X className="w-3.5 h-3.5" style={{ color: P.danger }} />
          </button>
        </div>
      )}

      {/* Edit mode label */}
      {editingMessage && (
        <div className="flex items-center gap-2 px-4 py-1.5 mb-1 text-[12px] font-medium" style={{ color: P.warning }}>
          <span>Editing</span>
          {onEditCancel && (
            <button onClick={onEditCancel} className="text-[11px] underline hover:no-underline" style={{ color: P.muted }}>Cancel</button>
          )}
        </div>
      )}

      {/* File previews */}
      {files.length > 0 && (
        <div className="flex gap-2 px-4 py-3 flex-wrap" style={{ background: P.floating, borderRadius: '12px 12px 0 0', borderBottom: `1px solid ${P.border}` }}>
          {files.map((f, i) => {
            const FI = getIcon(f.content_type);
            const isImage = f.content_type?.startsWith('image/');
            return (
              <div key={i} className="relative group">
                {isImage ? <img src={f.url} className="w-20 h-20 rounded-lg object-cover" alt={f.filename} />
                  : (
                    <div className="w-20 h-20 rounded-lg flex flex-col items-center justify-center gap-1" style={{ background: P.elevated }}>
                      <FI className="w-5 h-5" style={{ color: P.muted }} />
                      <span className="text-[11px] truncate max-w-[60px] px-1" style={{ color: P.muted }}>{f.filename}</span>
                    </div>
                  )}
                <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: P.danger, color: '#fff' }}><X className="w-3 h-3" /></button>
              </div>
            );
          })}
          {uploading && <div className="w-20 h-20 rounded-lg flex items-center justify-center" style={{ background: P.elevated }}><div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: P.border, borderTopColor: P.muted }} /></div>}
        </div>
      )}

      {/* Emoji picker — anchored above input, never off screen */}
      {showEmoji && (
        <div className="absolute bottom-full left-5 right-5 mb-2 z-30 flex justify-center">
          <EmojiPicker
            onSelect={(e) => { setContent(p => p + e); inputRef.current?.focus(); }}
            onClose={() => setShowEmoji(false)}
          />
        </div>
      )}

      {/* Formatting toolbar */}
      {showFormatting && <FormattingToolbar inputRef={inputRef} content={content} setContent={setContent} />}

      {/* Main input — bg-raised, 12px radius, border-medium, focus glow */}
      <div ref={inputWrapperRef} className="k-input-wrapper relative flex items-end gap-2 px-[14px] py-3 transition-all min-h-[44px]"
        style={{
          background: 'var(--bg-raised)',
          border: '1px solid var(--border-medium)',
          borderRadius: 12,
          boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.05)',
          borderLeft: editingMessage ? `3px solid ${P.warning}` : undefined,
        }}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.08)] flex-shrink-0 mb-0.5"
              title="Attach">
              <Plus className="w-5 h-5" style={{ color: P.muted }} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" sideOffset={4}>
            <DropdownMenuItem onClick={() => fileRef.current?.click()}>
              <Image className="w-4 h-4" /> Upload File
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { /* TODO: open URL modal */ }}>
              <Link className="w-4 h-4" /> Upload from URL
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { /* TODO: open poll modal */ }}>
              <BarChart3 className="w-4 h-4" /> Create Poll
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <input ref={fileRef} type="file" accept="image/*,video/*,audio/*,.gif,.mp4,.webm,.mov,.mp3,.wav,.ogg,.pdf,.txt,.zip,.rar,.doc,.docx,.xls,.xlsx" onChange={e => { if (e.target.files?.length) uploadFiles(e.target.files); if (fileRef.current) fileRef.current.value = ''; }} className="hidden" multiple />
        <textarea ref={inputRef} value={content}
          onChange={e => handleContentChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={e => {
            // Preserve line breaks on paste
            const pasted = e.clipboardData.getData('text/plain');
            if (pasted && pasted.includes('\n')) {
              e.preventDefault();
              const start = e.target.selectionStart;
              const end = e.target.selectionEnd;
              const newVal = content.slice(0, start) + pasted + content.slice(end);
              setContent(newVal);
              requestAnimationFrame(() => { inputRef.current.selectionStart = inputRef.current.selectionEnd = start + pasted.length; });
            }
          }}
          placeholder={placeholder}
          className="k-input flex-1 bg-transparent text-[15px] outline-none resize-none placeholder:text-[13px]"
          style={{ color: P.textPrimary, lineHeight: `${LINE_HEIGHT}px`, minHeight: LINE_HEIGHT, maxHeight: MAX_INPUT_HEIGHT, caretColor: P.accent, overflowY: 'auto', transition: 'height 80ms ease-out' }} rows={1} />
        {nearLimit && (
          <span className="text-[11px] mb-1 flex-shrink-0 tabular-nums"
            style={{ color: remaining <= 0 ? P.danger : remaining <= 50 ? P.danger : remaining <= 100 ? P.warning : P.textPrimary }}>
            {charCount}/{maxChars}
          </span>
        )}
        <button onClick={() => { closePickers(); setShowGif(!showGif); }}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.08)] flex-shrink-0 mb-0.5"
          title="GIF"><span className="text-[12px] font-bold" style={{ color: showGif ? P.textPrimary : P.muted }}>GIF</span></button>
        <button onClick={() => { closePickers(); setShowSticker(!showSticker); }}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.08)] flex-shrink-0 mb-0.5"
          title="Sticker"><Stamp className="w-5 h-5" style={{ color: showSticker ? P.textPrimary : P.muted }} /></button>
        <button onClick={() => { closePickers(); setShowEmoji(!showEmoji); }}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.08)] flex-shrink-0 mb-0.5"
          title="Emoji"><Smile className="w-5 h-5" style={{ color: showEmoji ? P.textPrimary : P.muted }} /></button>
        <button onClick={handleSend} disabled={!hasContent || sending || remaining < 0 || slowModeRemaining > 0}
          className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 mb-0.5 disabled:opacity-20 transition-all duration-[120ms] ease-out"
          style={{
            background: hasContent ? P.accent : 'transparent',
            color: hasContent ? '#0d1117' : P.muted,
            opacity: hasContent ? 1 : 0,
            transform: hasContent ? 'translateX(0)' : 'translateX(8px)',
            pointerEvents: hasContent ? 'auto' : 'none',
          }}
          title="Send">
          {sending ? (
            <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
          ) : (
            <Send className="w-[18px] h-[18px]" />
          )}
        </button>
      </div>
      {slowModeRemaining > 0 && (
        <p className="text-[11px] mt-1.5 px-1" style={{ color: P.muted }}>Wait {slowModeRemaining}s before sending again</p>
      )}
    </div>
  );
}