import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Smile, Send, X, Image as ImageIcon, 
  Paperclip, Gift, Sticker, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import Tooltip from '../ui/Tooltip';

const EMOJI_LIST = ['👍', '❤️', '😂', '😮', '😢', '😡', '🔥', '🎉', '👏', '🙌'];

export default function MessageInput({
  channelName,
  replyTo,
  onCancelReply,
  onSendMessage,
  disabled,
  placeholder,
}) {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if ((!content.trim() && attachments.length === 0) || disabled || sending) return;

    setSending(true);
    try {
      await onSendMessage({
        content: content.trim(),
        attachments,
        replyToId: replyTo?.id,
      });
      setContent('');
      setAttachments([]);
      onCancelReply?.();
    } catch (err) {
      console.error('Failed to send message:', err);
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          return {
            url: file_url,
            filename: file.name,
            content_type: file.type,
            size: file.size,
          };
        })
      );
      setAttachments([...attachments, ...uploaded]);
    } catch (err) {
      console.error('Upload failed:', err);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const insertEmoji = (emoji) => {
    setContent(content + emoji);
    setShowEmoji(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="px-4 pb-4">
      {/* Reply preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3 py-2 mb-2 bg-white/[0.04] rounded-t-lg border-l-2 border-indigo-500">
              <span className="text-xs text-zinc-400">Replying to</span>
              <span className="text-xs font-medium text-white">{replyTo.author_name}</span>
              <span className="flex-1 text-xs text-zinc-500 truncate">{replyTo.content}</span>
              <button onClick={onCancelReply} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-3 py-2 mb-2 bg-white/[0.04] rounded-lg">
          {attachments.map((att, i) => (
            <div key={i} className="relative group">
              {att.content_type?.startsWith('image/') ? (
                <img src={att.url} alt="" className="h-20 rounded-md" />
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.06] rounded-md">
                  <Paperclip className="w-4 h-4 text-zinc-400" />
                  <span className="text-sm text-zinc-300 truncate max-w-[120px]">{att.filename}</span>
                </div>
              )}
              <button
                onClick={() => removeAttachment(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <div className={cn(
        'flex items-end gap-2 p-2 bg-[#141415] border border-white/[0.06] rounded-xl',
        replyTo && 'rounded-t-none'
      )}>
        {/* Upload button */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />
        <Tooltip content="Upload File">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          </button>
        </Tooltip>

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || `Message #${channelName}`}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-white placeholder:text-zinc-600 resize-none outline-none text-sm py-2 max-h-32"
          style={{ minHeight: '36px' }}
        />

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Emoji picker */}
          <div className="relative">
            <Tooltip content="Emoji">
              <button
                onClick={() => setShowEmoji(!showEmoji)}
                className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors"
              >
                <Smile className="w-5 h-5" />
              </button>
            </Tooltip>
            
            <AnimatePresence>
              {showEmoji && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className="absolute bottom-full right-0 mb-2 p-2 bg-[#111113] border border-white/[0.08] rounded-lg shadow-xl"
                >
                  <div className="flex gap-1">
                    {EMOJI_LIST.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => insertEmoji(emoji)}
                        className="w-8 h-8 rounded hover:bg-white/[0.1] flex items-center justify-center text-lg"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Send button */}
          <Tooltip content="Send">
            <button
              onClick={handleSubmit}
              disabled={(!content.trim() && attachments.length === 0) || disabled || sending}
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                content.trim() || attachments.length > 0
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                  : 'text-zinc-600 cursor-not-allowed'
              )}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}