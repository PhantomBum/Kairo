import React, { useState, useRef, useCallback } from 'react';
import { Plus, Send, X, Smile, Image } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ChatInput({ channelName, replyTo, onCancelReply, onSend, onTyping }) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const fileRef = useRef(null);
  const typingRef = useRef(0);

  const handleTyping = useCallback(() => {
    if (Date.now() - typingRef.current > 3000) {
      typingRef.current = Date.now();
      onTyping?.();
    }
  }, [onTyping]);

  const handleFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
    setFiles(prev => [...prev, { url: file_url, filename: f.name, content_type: f.type, size: f.size }]);
    if (fileRef.current) fileRef.current.value = '';
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
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="px-4 pb-4">
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
        <div className="flex gap-2 px-3 py-2 rounded-t-lg" style={{ background: 'var(--bg-tertiary)' }}>
          {files.map((f, i) => (
            <div key={i} className="relative">
              {f.content_type?.startsWith('image/') ? (
                <img src={f.url} className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="px-3 py-2 rounded-lg text-[11px]" style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}>
                  📎 {f.filename}
                </div>
              )}
              <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: '#ef4444', color: '#fff' }}>
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-end gap-2 px-3 py-2 rounded-lg"
        style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
        <button onClick={() => fileRef.current?.click()} className="p-1 rounded hover:bg-[var(--bg-hover)] flex-shrink-0 mb-0.5">
          <Plus className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        </button>
        <input ref={fileRef} type="file" onChange={handleFile} className="hidden" />
        <textarea
          value={content}
          onChange={e => { setContent(e.target.value); handleTyping(); }}
          onKeyDown={handleKey}
          placeholder={`Message ${channelName ? (channelName.startsWith('#') ? channelName : '#' + channelName) : ''}`}
          className="flex-1 bg-transparent text-[13px] outline-none resize-none max-h-32 placeholder:text-[var(--text-muted)]"
          style={{ color: 'var(--text-primary)' }}
          rows={1} />
        <button onClick={handleSend} disabled={!content.trim() && files.length === 0}
          className="p-1 rounded hover:bg-[var(--bg-hover)] flex-shrink-0 mb-0.5 disabled:opacity-30"
          style={{ color: 'var(--text-muted)' }}>
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}