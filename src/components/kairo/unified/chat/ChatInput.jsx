import React, { useState, useRef, useCallback } from 'react';
import { Plus, Smile, Send, X, Gift, Image, AtSign } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import lodash from 'lodash';

export default function ChatInput({ channelName, replyTo, onCancelReply, onSend, onTyping }) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const fileRef = useRef(null);
  const inputRef = useRef(null);

  const emojis = ['😀','😂','❤️','🔥','👍','👎','😭','🎉','🤔','💀','👀','✨','💯','🙏','😎','🥺','🫡','💔','😤','🗿','😈','🤡','💅','🤝','😊','🥳','😴','🤯','💜','🖤','🤍','❄️','⚡','🌈','🎮','🎵','☕','🍕','🏆','💎'];

  // Debounced typing indicator
  const debouncedTyping = useCallback(
    lodash.debounce(() => { onTyping?.(); }, 2000, { leading: true, trailing: false }),
    [onTyping]
  );

  const handleFile = async (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setUploading(true);
    const uploaded = [];
    for (const f of selected) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      uploaded.push({ url: file_url, filename: f.name, content_type: f.type, size: f.size });
    }
    setFiles(prev => [...prev, ...uploaded]);
    setUploading(false);
  };

  const handleSubmit = async () => {
    if ((!content.trim() && files.length === 0) || sending) return;
    setSending(true);
    await onSend({
      content: content.trim(),
      attachments: files,
      replyToId: replyTo?.id,
      replyPreview: replyTo ? { author_name: replyTo.author_name, content: replyTo.content?.slice(0, 80) } : undefined,
    });
    setContent('');
    setFiles([]);
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const handleChange = (e) => {
    setContent(e.target.value);
    debouncedTyping();
  };

  return (
    <div className="px-4 pb-4 flex-shrink-0">
      {replyTo && (
        <div className="flex items-center gap-2 px-3 py-1.5 mb-1 rounded-t-lg text-xs" style={{ background: '#151515', borderLeft: '3px solid #6366f1' }}>
          <span className="text-indigo-400">↩</span>
          <span className="text-zinc-500">Replying to</span>
          <span className="text-white font-medium">{replyTo.author_name}</span>
          <span className="text-zinc-600 truncate flex-1">{replyTo.content?.slice(0, 50)}</span>
          <button onClick={onCancelReply}><X className="w-3.5 h-3.5 text-zinc-500 hover:text-white" /></button>
        </div>
      )}

      {files.length > 0 && (
        <div className="flex gap-2 px-3 py-2 mb-1 rounded-t" style={{ background: '#151515' }}>
          {files.map((f, i) => (
            <div key={i} className="relative group">
              {f.content_type?.startsWith('image/') ? (
                <img src={f.url} className="w-16 h-16 rounded-lg object-cover" />
              ) : (
                <div className="px-2 py-1 rounded text-xs text-zinc-400" style={{ background: '#1a1a1a' }}>📎 {f.filename}</div>
              )}
              <button onClick={() => setFiles(files.filter((_, j) => j !== i))}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center bg-red-500 text-white text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">×</button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 px-3 py-2 rounded-xl kairo-focus" style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.04)' }}>
        <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFile} />
        <button onClick={() => fileRef.current?.click()} className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-colors hover:bg-white/10">
          <Plus className="w-4 h-4 text-zinc-500" />
        </button>

        <div className="flex-1 min-w-0 relative">
          <textarea ref={inputRef} value={content} onChange={handleChange} onKeyDown={handleKey}
            placeholder={`Message ${channelName ? (channelName.startsWith('#') ? channelName : `#${channelName}`) : ''}`}
            rows={1}
            className="w-full bg-transparent text-sm text-white placeholder:text-zinc-600 resize-none focus:outline-none leading-6 max-h-32"
            style={{ minHeight: '32px' }} />
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          {/* Emoji picker */}
          <div className="relative">
            <button onClick={() => { setShowEmoji(!showEmoji); setShowGif(false); }}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10">
              <Smile className="w-4 h-4 text-zinc-500" />
            </button>
            {showEmoji && (
              <div className="absolute bottom-10 right-0 p-2 rounded-xl grid grid-cols-8 gap-1 z-50"
                style={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                <div className="col-span-8 text-[10px] text-zinc-500 font-semibold uppercase px-1 pb-1 mb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  Frequently Used
                </div>
                {emojis.map(e => (
                  <button key={e} onClick={() => { setContent(c => c + e); setShowEmoji(false); inputRef.current?.focus(); }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-lg transition-transform hover:scale-125">{e}</button>
                ))}
              </div>
            )}
          </div>

          {/* GIF */}
          <button onClick={() => { setShowGif(!showGif); setShowEmoji(false); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10">
            <span className="text-[10px] font-bold text-zinc-500">GIF</span>
          </button>

          {(content.trim() || files.length > 0) && (
            <button onClick={handleSubmit} disabled={sending}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
              style={{ background: '#fff', color: '#000' }}>
              <Send className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {uploading && <div className="text-[11px] text-zinc-500 mt-1 px-1">Uploading...</div>}
    </div>
  );
}