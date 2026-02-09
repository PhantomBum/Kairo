import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Paperclip, Smile, Send, X, Loader2, Type, Gift, Sticker, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';

const EMOJIS = ['👍', '❤️', '😂', '🔥', '👀', '💯', '🎉', '😮', '😢', '🙌'];

export default function MessageInput({ channelName, replyTo, onCancelReply, onSendMessage, disabled }) {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [sending, setSending] = useState(false);
  const fileRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.height = 'auto';
      textRef.current.style.height = Math.min(textRef.current.scrollHeight, 160) + 'px';
    }
  }, [content]);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if ((!content.trim() && !attachments.length) || disabled || sending) return;
    setSending(true);
    await onSendMessage({ content: content.trim(), attachments, replyToId: replyTo?.id });
    setContent(''); setAttachments([]); onCancelReply?.();
    if (textRef.current) textRef.current.style.height = 'auto';
    setSending(false);
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } };

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const uploaded = await Promise.all(files.slice(0, 10).map(async (f) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      return { url: file_url, filename: f.name, content_type: f.type, size: f.size };
    }));
    setAttachments([...attachments, ...uploaded]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="px-4 pb-6 pt-0">
      <AnimatePresence>
        {replyTo && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="flex items-center gap-2 px-3 py-2 mb-1 bg-[#1a1a1a] rounded-t-lg border-l-2 border-indigo-500">
              <span className="text-xs text-zinc-500">Replying to</span>
              <span className="text-xs font-medium text-indigo-400">{replyTo.author_name}</span>
              <span className="flex-1 text-xs text-zinc-600 truncate">{replyTo.content}</span>
              <button onClick={onCancelReply} className="text-zinc-600 hover:text-white"><X className="w-3.5 h-3.5" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {attachments.length > 0 && (
        <div className="flex gap-2 p-2 mb-1 bg-[#1a1a1a] rounded-lg">
          {attachments.map((a, i) => (
            <div key={i} className="relative group">
              {a.content_type?.startsWith('image/') ? (
                <img src={a.url} alt="" className="h-16 rounded object-cover" />
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] rounded text-xs text-zinc-300">{a.filename}</div>
              )}
              <button onClick={() => setAttachments(attachments.filter((_, j) => j !== i))}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={cn(
        'flex items-end gap-1 px-3 py-1.5 bg-[#1a1a1a] rounded-lg',
        replyTo && 'rounded-t-none border-t-0'
      )}>
        <input ref={fileRef} type="file" multiple onChange={handleFiles} className="hidden" />
        <button onClick={() => fileRef.current?.click()} disabled={uploading}
          className="w-9 h-9 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-200 transition-colors">
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
        </button>

        <textarea ref={textRef} value={content} onChange={(e) => setContent(e.target.value)} onKeyDown={handleKey}
          placeholder={`Message #${channelName}`} disabled={disabled} rows={1}
          className="flex-1 bg-transparent text-[14px] text-white placeholder:text-zinc-600 resize-none outline-none py-2 max-h-[160px] leading-relaxed" />

        <div className="flex items-center gap-0.5">
          <button className="w-9 h-9 rounded flex items-center justify-center text-zinc-600 hover:text-zinc-300 transition-colors">
            <Type className="w-5 h-5" />
          </button>
          <button className="w-9 h-9 rounded flex items-center justify-center text-zinc-600 hover:text-zinc-300 transition-colors">
            <ImageIcon className="w-5 h-5" />
          </button>
          <div className="relative">
            <button onClick={() => setShowEmoji(!showEmoji)}
              className={cn('w-9 h-9 rounded flex items-center justify-center transition-colors', showEmoji ? 'text-indigo-400' : 'text-zinc-600 hover:text-zinc-300')}>
              <Smile className="w-5 h-5" />
            </button>
            {showEmoji && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowEmoji(false)} />
                <div className="absolute bottom-full right-0 mb-2 p-2 bg-[#1a1a1a] border border-white/[0.08] rounded-lg shadow-xl z-50 flex gap-1">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => { setContent(content + e); setShowEmoji(false); textRef.current?.focus(); }}
                      className="w-8 h-8 rounded hover:bg-white/[0.08] flex items-center justify-center text-lg">{e}</button>
                  ))}
                </div>
              </>
            )}
          </div>
          <button className="w-9 h-9 rounded flex items-center justify-center text-zinc-600 hover:text-zinc-300 transition-colors">
            <Gift className="w-5 h-5" />
          </button>
          <button className="w-9 h-9 rounded flex items-center justify-center text-zinc-600 hover:text-zinc-300 transition-colors">
            <Sticker className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}