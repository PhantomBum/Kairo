import React, { useState, useRef, useCallback } from 'react';
import { Plus, Send, X, Smile, Image, FileText, Film } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const EMOJIS = ['😀','😂','😍','🤔','👍','👎','❤️','🔥','🎉','😎','😢','😡','🙏','💯','✨','🚀','👀','🤝','💀','🎮','🎵','☕','⭐','💜'];

export default function ChatInput({ channelName, replyTo, onCancelReply, onSend, onTyping }) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);
  const inputRef = useRef(null);
  const typingRef = useRef(0);

  const handleTyping = useCallback(() => {
    if (Date.now() - typingRef.current > 3000) { typingRef.current = Date.now(); onTyping?.(); }
  }, [onTyping]);

  const uploadFiles = async (list) => {
    setUploading(true);
    const results = [];
    for (const f of Array.from(list)) {
      if (f.size > 25 * 1024 * 1024) continue;
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      results.push({ url: file_url, filename: f.name, content_type: f.type, size: f.size });
    }
    setFiles(prev => [...prev, ...results]);
    setUploading(false);
  };

  const handleSend = async () => {
    if ((!content.trim() && files.length === 0) || sending) return;
    setSending(true);
    await onSend({ content: content.trim(), attachments: files.length > 0 ? files : undefined, replyToId: replyTo?.id, replyPreview: replyTo ? { author_name: replyTo.author_name, content: replyTo.content?.slice(0, 80) } : undefined });
    setContent(''); setFiles([]); setSending(false); setShowEmoji(false);
    inputRef.current?.focus();
  };

  const getIcon = (type) => { if (type?.startsWith('image/')) return Image; if (type?.startsWith('video/')) return Film; return FileText; };

  return (
    <div className="px-4 pb-4"
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files?.length) uploadFiles(e.dataTransfer.files); }}>

      {dragging && (
        <div className="absolute inset-4 z-50 flex items-center justify-center rounded-2xl pointer-events-none" style={{ background: 'rgba(123,201,164,0.06)', border: '2px dashed rgba(123,201,164,0.3)' }}>
          <div className="text-center">
            <Plus className="w-8 h-8 mx-auto mb-2" style={{ color: 'var(--accent-green)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--accent-green)' }}>Drop to upload</span>
          </div>
        </div>
      )}

      {replyTo && (
        <div className="flex items-center gap-2 px-3 py-1.5 mb-1 rounded-t-xl glass">
          <div className="w-0.5 h-4 rounded-full" style={{ background: 'var(--accent-blue)' }} />
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Replying to <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{replyTo.author_name}</span>
          </span>
          <button onClick={onCancelReply} className="ml-auto p-0.5 rounded hover:bg-[var(--bg-glass-hover)]"><X className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /></button>
        </div>
      )}

      {files.length > 0 && (
        <div className="flex gap-2 px-3 py-2 rounded-t-xl glass flex-wrap mb-px">
          {files.map((f, i) => {
            const FI = getIcon(f.content_type);
            return (
              <div key={i} className="relative group">
                {f.content_type?.startsWith('image/') ? <img src={f.url} className="w-16 h-16 rounded-xl object-cover" />
                : <div className="w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
                    <FI className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-[7px] truncate max-w-[50px] px-1" style={{ color: 'var(--text-muted)' }}>{f.filename}</span>
                  </div>}
                <button onClick={() => setFiles(p => p.filter((_,j) => j !== i))}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'var(--accent-red)', color: '#fff' }}><X className="w-2.5 h-2.5" /></button>
              </div>
            );
          })}
          {uploading && <div className="w-16 h-16 rounded-xl flex items-center justify-center glass"><div className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text-muted)' }} /></div>}
        </div>
      )}

      {showEmoji && (
        <div className="mb-1 p-2 rounded-xl glass grid grid-cols-8 gap-0.5">
          {EMOJIS.map(e => <button key={e} onClick={() => { setContent(p => p + e); inputRef.current?.focus(); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-glass-hover)] text-base">{e}</button>)}
        </div>
      )}

      <div className="flex items-end gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)', backdropFilter: 'blur(16px)' }}>
        <button onClick={() => fileRef.current?.click()} className="p-1 rounded-lg hover:bg-[var(--bg-glass-hover)] flex-shrink-0 mb-0.5">
          <Plus className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        </button>
        <input ref={fileRef} type="file" onChange={e => { if (e.target.files?.length) uploadFiles(e.target.files); if (fileRef.current) fileRef.current.value = ''; }} className="hidden" multiple />
        <textarea ref={inputRef} value={content}
          onChange={e => { setContent(e.target.value); handleTyping(); }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={`Message ${channelName ? '#' + channelName : ''}`}
          aria-label={`Message ${channelName || 'channel'}`}
          className="flex-1 bg-transparent text-[13px] outline-none resize-none max-h-32 placeholder:text-[var(--text-faint)]"
          style={{ color: 'var(--text-primary)' }} rows={1} />
        <button onClick={() => setShowEmoji(!showEmoji)} className="p-1 rounded-lg hover:bg-[var(--bg-glass-hover)] flex-shrink-0 mb-0.5">
          <Smile className="w-4 h-4" style={{ color: showEmoji ? 'var(--text-cream)' : 'var(--text-muted)' }} />
        </button>
        <button onClick={handleSend} disabled={(!content.trim() && files.length === 0) || sending}
          className="p-1.5 rounded-lg flex-shrink-0 mb-0.5 disabled:opacity-20 transition-all"
          style={{ background: content.trim() || files.length > 0 ? 'var(--bg-glass-strong)' : 'transparent', color: 'var(--text-muted)' }}>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}