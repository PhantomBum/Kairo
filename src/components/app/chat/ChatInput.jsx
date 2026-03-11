import React, { useState, useRef, useCallback } from 'react';
import { Plus, Send, X, Smile, Paperclip, Image, FileText, Film } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const EMOJI_LIST = ['😀','😂','😍','🤔','👍','👎','❤️','🔥','🎉','😎','😢','😡','🙏','💯','✨','🚀','👀','🤝','💀','🎮','🎵','☕','⭐','💜'];

export default function ChatInput({ channelName, replyTo, onCancelReply, onSend, onTyping }) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef(null);
  const typingRef = useRef(0);
  const inputRef = useRef(null);

  const handleTyping = useCallback(() => {
    if (Date.now() - typingRef.current > 3000) {
      typingRef.current = Date.now();
      onTyping?.();
    }
  }, [onTyping]);

  const uploadFiles = async (fileList) => {
    setUploading(true);
    const results = [];
    for (const f of Array.from(fileList)) {
      if (f.size > 25 * 1024 * 1024) continue; // 25MB limit
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      results.push({ url: file_url, filename: f.name, content_type: f.type, size: f.size });
    }
    setFiles(prev => [...prev, ...results]);
    setUploading(false);
  };

  const handleFile = async (e) => {
    if (e.target.files?.length) await uploadFiles(e.target.files);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) await uploadFiles(e.dataTransfer.files);
  };

  const handleSend = async () => {
    if ((!content.trim() && files.length === 0) || sending) return;
    setSending(true);
    await onSend({
      content: content.trim(),
      attachments: files.length > 0 ? files : undefined,
      replyToId: replyTo?.id,
      replyPreview: replyTo ? { author_name: replyTo.author_name, content: replyTo.content?.slice(0, 80) } : undefined,
    });
    setContent('');
    setFiles([]);
    setSending(false);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const insertEmoji = (emoji) => {
    setContent(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const getFileIcon = (type) => {
    if (type?.startsWith('image/')) return Image;
    if (type?.startsWith('video/')) return Film;
    return FileText;
  };

  return (
    <div className="px-4 pb-4"
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}>

      {/* Drag overlay */}
      {dragging && (
        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-lg pointer-events-none"
          style={{ background: 'rgba(99,102,241,0.08)', border: '2px dashed rgba(99,102,241,0.3)' }}>
          <div className="text-center">
            <Plus className="w-8 h-8 mx-auto mb-2" style={{ color: '#818cf8' }} />
            <span className="text-sm font-medium" style={{ color: '#818cf8' }}>Drop files to upload</span>
          </div>
        </div>
      )}

      {/* Reply bar */}
      {replyTo && (
        <div className="flex items-center gap-2 px-3 py-1.5 mb-1 rounded-t-lg"
          style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border)' }}>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            Replying to <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{replyTo.author_name}</span>
          </span>
          <button onClick={onCancelReply} className="ml-auto"><X className="w-3 h-3" style={{ color: 'var(--text-muted)' }} /></button>
        </div>
      )}

      {/* File previews */}
      {files.length > 0 && (
        <div className="flex gap-2 px-3 py-2 rounded-t-lg flex-wrap" style={{ background: 'var(--bg-tertiary)' }}>
          {files.map((f, i) => {
            const FileIcon = getFileIcon(f.content_type);
            return (
              <div key={i} className="relative group">
                {f.content_type?.startsWith('image/') ? (
                  <img src={f.url} className="w-20 h-20 rounded-lg object-cover" />
                ) : f.content_type?.startsWith('video/') ? (
                  <video src={f.url} className="w-20 h-20 rounded-lg object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-lg flex flex-col items-center justify-center gap-1"
                    style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                    <FileIcon className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    <span className="text-[8px] truncate max-w-[60px] px-1" style={{ color: 'var(--text-muted)' }}>{f.filename}</span>
                  </div>
                )}
                <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: '#ef4444', color: '#fff' }}>
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
          {uploading && (
            <div className="w-20 h-20 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text-muted)' }} />
            </div>
          )}
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <div className="mb-1 p-2 rounded-lg grid grid-cols-8 gap-0.5" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
          {EMOJI_LIST.map(e => (
            <button key={e} onClick={() => insertEmoji(e)} className="w-8 h-8 flex items-center justify-center rounded hover:bg-[var(--bg-hover)] text-lg">{e}</button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-end gap-2 px-3 py-2 rounded-lg"
        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
        <button onClick={() => fileRef.current?.click()} className="p-1 rounded hover:bg-[var(--bg-hover)] flex-shrink-0 mb-0.5">
          <Plus className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        </button>
        <input ref={fileRef} type="file" onChange={handleFile} className="hidden" multiple accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip" />
        <textarea ref={inputRef}
          value={content}
          onChange={e => { setContent(e.target.value); handleTyping(); }}
          onKeyDown={handleKey}
          placeholder={`Message ${channelName ? (channelName.startsWith('#') ? channelName : '#' + channelName) : ''}`}
          className="flex-1 bg-transparent text-[13px] outline-none resize-none max-h-32 placeholder:text-[var(--text-muted)]"
          style={{ color: 'var(--text-primary)' }}
          rows={1} />
        <button onClick={() => setShowEmoji(!showEmoji)} className="p-1 rounded hover:bg-[var(--bg-hover)] flex-shrink-0 mb-0.5">
          <Smile className="w-4 h-4" style={{ color: showEmoji ? 'var(--text-primary)' : 'var(--text-muted)' }} />
        </button>
        <button onClick={handleSend} disabled={(!content.trim() && files.length === 0) || sending}
          className="p-1 rounded hover:bg-[var(--bg-hover)] flex-shrink-0 mb-0.5 disabled:opacity-30"
          style={{ color: 'var(--text-muted)' }}>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}