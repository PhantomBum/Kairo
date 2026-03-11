import React, { useState, useRef, useCallback } from 'react';
import { Plus, Send, X, Smile, Image, FileText, Film, Type } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';
import FormattingToolbar from '@/components/app/features/FormattingToolbar';

const EMOJIS = ['😀','😂','😍','🤔','👍','👎','❤️','🔥','🎉','😎','😢','😡','🙏','💯','✨','🚀','👀','🤝','💀','🎮','🎵','☕','⭐','💜'];

export default function ChatInput({ channelName, channelId, replyTo, onCancelReply, onSend, onTyping, onEditLast }) {
  // Use channelId for draft key to prevent race conditions between channels with same name
  const storageKey = `kairo-draft-${channelId || channelName || 'default'}`;
  const [content, setContent] = useState(() => {
    try { return localStorage.getItem(storageKey) || ''; } catch { return ''; }
  });
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showFormatting, setShowFormatting] = useState(false);
  const fileRef = useRef(null);
  const inputRef = useRef(null);
  const typingRef = useRef(0);

  // Persist draft to localStorage
  React.useEffect(() => {
    try { if (content) localStorage.setItem(storageKey, content); else localStorage.removeItem(storageKey); } catch {}
  }, [content, storageKey]);

  // Load draft when channel changes, reset UI state
  React.useEffect(() => {
    try { setContent(localStorage.getItem(storageKey) || ''); } catch { setContent(''); }
    setShowEmoji(false);
    setShowFormatting(false);
    setFiles([]);
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

  const handleSend = async () => {
    const trimmed = content.trim();
    if ((!trimmed && files.length === 0) || sending) return;
    setSending(true);
    await onSend({ content: trimmed, attachments: files.length > 0 ? files : undefined, replyToId: replyTo?.id, replyPreview: replyTo ? { author_name: replyTo.author_name, content: replyTo.content?.slice(0, 80) } : undefined });
    setContent(''); setFiles([]); setSending(false); setShowEmoji(false); setShowFormatting(false);
    try { localStorage.removeItem(storageKey); } catch {}
    inputRef.current?.focus();
  };

  const getIcon = (type) => { if (type?.startsWith('image/')) return Image; if (type?.startsWith('video/')) return Film; return FileText; };
  const charCount = content.length;
  const nearLimit = charCount > 1800;

  return (
    <div className="px-4 pb-5 pt-1"
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files); }}>

      {/* Drop overlay */}
      {dragging && (
        <div className="absolute inset-4 z-50 flex items-center justify-center rounded-xl pointer-events-none"
          style={{ background: `${colors.accent.primary}12`, border: `2px dashed ${colors.accent.primary}60` }}>
          <div className="text-center">
            <Plus className="w-10 h-10 mx-auto mb-2" style={{ color: colors.accent.primary }} />
            <span className="text-[15px] font-semibold" style={{ color: colors.accent.primary }}>Drop files to upload</span>
          </div>
        </div>
      )}

      {/* Reply bar */}
      {replyTo && (
        <div className="flex items-center gap-2 px-4 py-2 mb-1 rounded-t-lg" style={{ background: colors.bg.elevated }}>
          <div className="w-1 h-5 rounded-full flex-shrink-0" style={{ background: colors.accent.primary }} />
          <span className="text-[13px] flex-1 truncate" style={{ color: colors.text.muted }}>
            Replying to <span className="font-semibold" style={{ color: colors.text.secondary }}>{replyTo.author_name}</span>
          </span>
          <button onClick={onCancelReply} className="w-6 h-6 flex items-center justify-center rounded hover:bg-[rgba(255,255,255,0.06)]">
            <X className="w-4 h-4" style={{ color: colors.text.muted }} />
          </button>
        </div>
      )}

      {/* File previews */}
      {files.length > 0 && (
        <div className="flex gap-2 px-4 py-3 rounded-t-lg flex-wrap" style={{ background: colors.bg.elevated, borderBottom: `1px solid ${colors.border.default}` }}>
          {files.map((f, i) => {
            const FI = getIcon(f.content_type);
            const isVideo = f.content_type?.startsWith('video/');
            const isImage = f.content_type?.startsWith('image/');
            return (
              <div key={i} className="relative group">
                {isImage ? <img src={f.url} className="w-20 h-20 rounded-lg object-cover" alt={f.filename} />
                : isVideo ? (
                  <div className="w-20 h-20 rounded-lg overflow-hidden relative" style={{ background: colors.bg.overlay }}>
                    <video src={f.url} className="w-full h-full object-cover" muted preload="metadata" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Film className="w-5 h-5 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg flex flex-col items-center justify-center gap-1" style={{ background: colors.bg.overlay }}>
                    <FI className="w-5 h-5" style={{ color: colors.text.muted }} />
                    <span className="text-[9px] truncate max-w-[60px] px-1" style={{ color: colors.text.muted }}>{f.filename}</span>
                  </div>
                )}
                <button onClick={() => setFiles(p => p.filter((_,j) => j !== i))}
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
        <div className="mb-1 p-2 rounded-xl grid grid-cols-8 gap-0.5" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
          {EMOJIS.map(e => <button key={e} onClick={() => { setContent(p => p + e); inputRef.current?.focus(); }} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-lg transition-colors">{e}</button>)}
        </div>
      )}

      {/* Formatting toolbar */}
      {showFormatting && <FormattingToolbar inputRef={inputRef} content={content} setContent={setContent} />}

      {/* Main input */}
      <div className="flex items-end gap-2 px-4 py-3 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
        <button onClick={() => fileRef.current?.click()}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)] flex-shrink-0 mb-0.5"
          aria-label="Upload file" title="Upload file">
          <Plus className="w-5 h-5" style={{ color: colors.text.muted }} />
        </button>
        <input ref={fileRef} type="file" accept="image/*,video/*,audio/*,.gif,.mp4,.webm,.mov,.mp3,.wav,.ogg,.pdf,.txt,.zip,.rar,.doc,.docx,.xls,.xlsx" onChange={e => { if (e.target.files?.length) uploadFiles(e.target.files); if (fileRef.current) fileRef.current.value = ''; }} className="hidden" multiple aria-hidden="true" />
        <textarea ref={inputRef} value={content}
          onChange={e => { setContent(e.target.value); handleTyping(); }}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            if (e.key === 'ArrowUp' && !content.trim() && onEditLast) { e.preventDefault(); onEditLast(); }
          }}
          placeholder={`Message ${channelName ? '#' + channelName : ''}`}
          aria-label={`Message ${channelName || 'channel'}`}
          className="flex-1 bg-transparent text-[15px] outline-none resize-none max-h-[160px] placeholder:text-[14px]"
          style={{ color: colors.text.primary, lineHeight: '22px', caretColor: colors.accent.primary }} rows={1} />
        {nearLimit && <span className="text-[11px] mb-1 flex-shrink-0 tabular-nums" style={{ color: charCount > 2000 ? colors.danger : colors.warning }} aria-live="polite">{2000 - charCount}</span>}
        <button onClick={() => setShowFormatting(!showFormatting)}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)] flex-shrink-0 mb-0.5"
          title="Formatting" aria-label="Toggle formatting" aria-pressed={showFormatting}>
          <Type className="w-5 h-5" style={{ color: showFormatting ? colors.text.primary : colors.text.muted }} />
        </button>
        <button onClick={() => setShowEmoji(!showEmoji)}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)] flex-shrink-0 mb-0.5"
          title="Emoji" aria-label="Toggle emoji picker" aria-pressed={showEmoji}>
          <Smile className="w-5 h-5" style={{ color: showEmoji ? colors.text.primary : colors.text.muted }} />
        </button>
        <button onClick={handleSend} disabled={(!content.trim() && files.length === 0) || sending}
          className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 mb-0.5 disabled:opacity-20"
          style={{ background: content.trim() || files.length > 0 ? colors.accent.primary : 'transparent', color: content.trim() || files.length > 0 ? '#fff' : colors.text.muted }}
          aria-label="Send message" title="Send">
          <Send className="w-[18px] h-[18px]" />
        </button>
      </div>
    </div>
  );
}