import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Plus, Send, X, Smile, Image, FileText, Film, Type, Stamp, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';
import FormattingToolbar from '@/components/app/features/FormattingToolbar';
import GifPicker from '@/components/app/chat/GifPicker';
import StickerPicker from '@/components/app/chat/StickerPicker';
import SlashCommandPicker from '@/components/app/chat/SlashCommandPicker';
import MentionPicker from '@/components/app/chat/MentionPicker';
import EmojiPicker from '@/components/app/chat/EmojiPicker';

export default function ChatInput({ channelName, channelId, replyTo, onCancelReply, onSend, onTyping, onEditLast, onSchedule, serverId, members, getProfile }) {
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
  const typingRef = useRef(0);

  useEffect(() => {
    try { if (content) localStorage.setItem(storageKey, content); else localStorage.removeItem(storageKey); } catch {}
  }, [content, storageKey]);

  useEffect(() => {
    try { setContent(localStorage.getItem(storageKey) || ''); } catch { setContent(''); }
    setShowEmoji(false); setShowFormatting(false); setShowGif(false); setShowSticker(false); setShowSlash(false); setFiles([]);
  }, [storageKey]);

  const handleTyping = useCallback(() => {
    if (Date.now() - typingRef.current > 3000) { typingRef.current = Date.now(); onTyping?.(); }
  }, [onTyping]);

  const uploadFiles = async (list) => {
    setUploading(true);
    const results = [];
    for (const f of Array.from(list)) {
      if (f.size > 50 * 1024 * 1024) continue;
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      results.push({ url: file_url, filename: f.name, content_type: f.type, size: f.size });
    }
    setFiles(prev => [...prev, ...results]);
    setUploading(false);
  };

  const closePickers = () => { setShowEmoji(false); setShowGif(false); setShowSticker(false); setShowSlash(false); setShowMention(false); };

  const handleSend = async () => {
    const trimmed = content.trim();
    if ((!trimmed && files.length === 0) || sending) return;
    // Duplicate send lock — prevent double sends on slow connections
    const lockId = `${trimmed}-${Date.now()}`;
    if (sendLockRef.current && Date.now() - sendLockRef.current.ts < 2000 && sendLockRef.current.content === trimmed) return;
    sendLockRef.current = { content: trimmed, ts: Date.now() };
    setSending(true);
    await onSend({ content: trimmed, attachments: files.length > 0 ? files : undefined, replyToId: replyTo?.id, replyPreview: replyTo ? { author_name: replyTo.author_name, content: replyTo.content?.slice(0, 80) } : undefined });
    setContent(''); setFiles([]); setSending(false); closePickers();
    try { localStorage.removeItem(storageKey); } catch {}
    inputRef.current?.focus();
  };

  const handleContentChange = (val) => {
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
    const newBefore = textBefore.replace(/@(\w*)$/, `@${member.displayName} `);
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
  const charCount = content.length;
  const nearLimit = charCount > 1500;

  const placeholders = [`What's on your mind?`, `Say something nice...`, `Share your thoughts...`, `Type a message...`];
  const placeholderIdx = Math.abs((channelName || '').length) % placeholders.length;
  const placeholder = replyTo ? `Reply to ${replyTo.author_name}...` : (channelName ? `Message #${channelName}` : placeholders[placeholderIdx]);

  return (
    <div className="px-4 pb-5 pt-1 relative"
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files); }}>

      {/* Drop overlay — full colored, clear instructions */}
      {dragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl pointer-events-none"
          style={{ background: 'rgba(88,101,242,0.15)', border: `2px dashed ${colors.accent.primary}`, backdropFilter: 'blur(4px)' }}>
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(88,101,242,0.2)' }}>
              <Plus className="w-8 h-8" style={{ color: colors.accent.primary }} />
            </div>
            <span className="text-[17px] font-bold block mb-1" style={{ color: '#fff' }}>Drop files to upload</span>
            <span className="text-[13px]" style={{ color: colors.text.secondary }}>Images, videos, documents — up to 50MB</span>
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

      {/* Reply bar — taller, easier to read, clear close button */}
      {replyTo && (
        <div className="flex items-center gap-3 px-4 py-3 mb-1 rounded-t-2xl" style={{ background: colors.bg.elevated, borderBottom: `1px solid ${colors.border.default}` }}>
          <div className="w-1 h-6 rounded-full flex-shrink-0" style={{ background: colors.accent.primary }} />
          <span className="text-[13px] flex-1 truncate" style={{ color: colors.text.muted }}>
            Replying to <span className="font-semibold" style={{ color: colors.text.secondary }}>{replyTo.author_name}</span>
            {replyTo.content && <span className="ml-1.5" style={{ color: colors.text.disabled }}>— {replyTo.content.slice(0, 80)}</span>}
          </span>
          <button onClick={onCancelReply} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-[rgba(237,66,69,0.12)] transition-colors" title="Cancel reply">
            <X className="w-4 h-4" style={{ color: colors.danger }} />
          </button>
        </div>
      )}

      {/* File previews */}
      {files.length > 0 && (
        <div className="flex gap-2 px-4 py-3 rounded-t-2xl flex-wrap" style={{ background: colors.bg.elevated, borderBottom: `1px solid ${colors.border.default}` }}>
          {files.map((f, i) => {
            const FI = getIcon(f.content_type);
            const isImage = f.content_type?.startsWith('image/');
            return (
              <div key={i} className="relative group">
                {isImage ? <img src={f.url} className="w-20 h-20 rounded-lg object-cover" alt={f.filename} />
                  : (
                    <div className="w-20 h-20 rounded-lg flex flex-col items-center justify-center gap-1" style={{ background: colors.bg.overlay }}>
                      <FI className="w-5 h-5" style={{ color: colors.text.muted }} />
                      <span className="text-[9px] truncate max-w-[60px] px-1" style={{ color: colors.text.muted }}>{f.filename}</span>
                    </div>
                  )}
                <button onClick={() => setFiles(p => p.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: colors.danger, color: '#fff' }}><X className="w-3 h-3" /></button>
              </div>
            );
          })}
          {uploading && <div className="w-20 h-20 rounded-lg flex items-center justify-center" style={{ background: colors.bg.overlay }}><div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: colors.border.light, borderTopColor: colors.text.muted }} /></div>}
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <EmojiPicker
          onSelect={(e) => { setContent(p => p + e); inputRef.current?.focus(); }}
          onClose={() => setShowEmoji(false)}
        />
      )}

      {/* Formatting toolbar */}
      {showFormatting && <FormattingToolbar inputRef={inputRef} content={content} setContent={setContent} />}

      {/* Main input */}
      <div className="flex items-end gap-2 px-4 py-3 rounded-2xl transition-all"
        style={{ background: 'rgba(255,255,255,0.035)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => fileRef.current?.click()}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)] flex-shrink-0 mb-0.5"
          title="Upload file"><Plus className="w-5 h-5" style={{ color: colors.text.muted }} /></button>
        <input ref={fileRef} type="file" accept="image/*,video/*,audio/*,.gif,.mp4,.webm,.mov,.mp3,.wav,.ogg,.pdf,.txt,.zip,.rar,.doc,.docx,.xls,.xlsx" onChange={e => { if (e.target.files?.length) uploadFiles(e.target.files); if (fileRef.current) fileRef.current.value = ''; }} className="hidden" multiple />
        <textarea ref={inputRef} value={content}
          onChange={e => handleContentChange(e.target.value)}
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
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey && !showSlash && !showMention) { e.preventDefault(); handleSend(); }
            if (e.key === 'ArrowUp' && !content.trim() && onEditLast) { e.preventDefault(); onEditLast(); }
            if (e.key === 'Escape') { closePickers(); if (replyTo) onCancelReply(); }
            // Formatting shortcuts
            const wrap = (prefix, suffix) => {
              e.preventDefault();
              const el = inputRef.current;
              const s = el.selectionStart, end = el.selectionEnd;
              const sel = content.substring(s, end) || 'text';
              setContent(content.substring(0, s) + prefix + sel + suffix + content.substring(end));
              setTimeout(() => { el.focus(); el.setSelectionRange(s + prefix.length, s + prefix.length + sel.length); }, 0);
            };
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') wrap('**', '**');
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') wrap('*', '*');
            if ((e.ctrlKey || e.metaKey) && e.key === 'u') wrap('__', '__');
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') wrap('`', '`');
          }}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-[14px] outline-none resize-none max-h-[160px] placeholder:text-[13px]"
          style={{ color: colors.text.primary, lineHeight: '22px', caretColor: colors.accent.primary }} rows={1} />
        {nearLimit && <span className="text-[11px] mb-1 flex-shrink-0 tabular-nums" style={{ color: charCount > 2000 ? colors.danger : colors.warning }}>{2000 - charCount}</span>}
        <button onClick={() => { closePickers(); setShowGif(!showGif); }}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)] flex-shrink-0 mb-0.5"
          title="GIF"><span className="text-[12px] font-bold" style={{ color: showGif ? colors.text.primary : colors.text.muted }}>GIF</span></button>
        <button onClick={() => { closePickers(); setShowSticker(!showSticker); }}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)] flex-shrink-0 mb-0.5"
          title="Sticker"><Stamp className="w-5 h-5" style={{ color: showSticker ? colors.text.primary : colors.text.muted }} /></button>
        <button onClick={() => { closePickers(); setShowFormatting(!showFormatting); }}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)] flex-shrink-0 mb-0.5"
          title="Formatting"><Type className="w-5 h-5" style={{ color: showFormatting ? colors.text.primary : colors.text.muted }} /></button>
        <button onClick={() => { closePickers(); setShowEmoji(!showEmoji); }}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)] flex-shrink-0 mb-0.5"
          title="Emoji"><Smile className="w-5 h-5" style={{ color: showEmoji ? colors.text.primary : colors.text.muted }} /></button>
        {onSchedule && <button onClick={onSchedule}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)] flex-shrink-0 mb-0.5"
          title="Schedule Message"><Clock className="w-5 h-5" style={{ color: colors.text.muted }} /></button>}
        <button onClick={handleSend} disabled={(!content.trim() && files.length === 0) || sending}
          className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 mb-0.5 disabled:opacity-20"
          style={{ background: content.trim() || files.length > 0 ? colors.accent.primary : 'transparent', color: content.trim() || files.length > 0 ? '#fff' : colors.text.muted }}
          title="Send">
          {sending ? (
            <div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }} />
          ) : (
            <Send className="w-[18px] h-[18px]" />
          )}
        </button>
      </div>
    </div>
  );
}