import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Smile, Send, X, Image as ImageIcon, 
  Paperclip, Gift, Sticker, Loader2, AtSign, Hash, Mic
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import Tooltip from '../ui/Tooltip';

const EMOJI_CATEGORIES = [
  { name: 'Smileys', emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌'] },
  { name: 'Gestures', emojis: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '👏', '🙌', '👐', '🤲', '🙏'] },
  { name: 'Hearts', emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❣️', '💕', '💖'] },
  { name: 'Objects', emojis: ['🔥', '⭐', '✨', '💫', '🎉', '🎊', '🎁', '🏆', '💎', '💡', '🔔', '🎵'] },
];

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🔥', '👀', '💯', '🎉', '😮'];

function EmojiPicker({ onSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
      className="absolute bottom-full right-0 mb-2 w-80 bg-[#18181b] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden"
    >
      {/* Quick select */}
      <div className="flex items-center gap-1 p-2 border-b border-white/[0.06]">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSelect(emoji)}
            className="w-8 h-8 rounded-lg hover:bg-white/[0.1] flex items-center justify-center text-lg transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Categories */}
      <div className="flex items-center gap-1 p-2 border-b border-white/[0.06]">
        {EMOJI_CATEGORIES.map((cat, i) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(i)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              activeCategory === i 
                ? 'bg-indigo-500/20 text-indigo-400' 
                : 'text-zinc-500 hover:text-white hover:bg-white/[0.06]'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="p-2 max-h-48 overflow-y-auto">
        <div className="grid grid-cols-8 gap-1">
          {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onSelect(emoji)}
              className="w-8 h-8 rounded-lg hover:bg-white/[0.1] flex items-center justify-center text-xl transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function MessageInput({
  channelName,
  replyTo,
  onCancelReply,
  onSendMessage,
  onTyping,
  disabled,
  placeholder,
}) {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [sending, setSending] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const lastTypingRef = useRef(0);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [content]);

  const handleTyping = () => {
    const now = Date.now();
    if (now - lastTypingRef.current > 3000) {
      lastTypingRef.current = now;
      onTyping?.();
    }
  };

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
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
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

  const handleChange = (e) => {
    setContent(e.target.value);
    handleTyping();
  };

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).slice(0, 10).map(async (file) => {
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

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.substring(0, start) + emoji + content.substring(end);
      setContent(newContent);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      setContent(content + emoji);
    }
    setShowEmoji(false);
  };

  return (
    <div 
      className="px-4 pb-6 pt-2"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      {/* Drop overlay */}
      <AnimatePresence>
        {dragActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-indigo-500/10 backdrop-blur-sm flex items-center justify-center"
          >
            <div className="p-8 bg-[#18181b] border-2 border-dashed border-indigo-500 rounded-2xl text-center">
              <ImageIcon className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
              <p className="text-lg font-semibold text-white">Drop files to upload</p>
              <p className="text-sm text-zinc-500">Max 10 files at once</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-2.5 mb-2 bg-[#18181b] rounded-t-xl border-l-2 border-indigo-500">
              <span className="text-xs text-zinc-500">Replying to</span>
              <span className="text-xs font-semibold text-indigo-400">{replyTo.author_name}</span>
              <span className="flex-1 text-xs text-zinc-500 truncate">{replyTo.content}</span>
              <button onClick={onCancelReply} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachments preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 p-3 mb-2 bg-[#18181b] rounded-xl">
              {attachments.map((att, i) => (
                <motion.div 
                  key={i} 
                  layout
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative group"
                >
                  {att.content_type?.startsWith('image/') ? (
                    <img src={att.url} alt="" className="h-24 rounded-lg object-cover" />
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.06] rounded-lg">
                      <Paperclip className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm text-zinc-300 truncate max-w-[120px]">{att.filename}</span>
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeAttachment(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input container */}
      <div className={cn(
        'flex items-end gap-2 p-2 bg-[#18181b] border border-white/[0.06] rounded-2xl transition-all',
        replyTo && 'rounded-t-none border-t-0',
        'focus-within:border-indigo-500/50 focus-within:shadow-lg focus-within:shadow-indigo-500/5'
      )}>
        {/* Upload button */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip"
        />
        <Tooltip content="Upload File">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-all"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
          </motion.button>
        </Tooltip>

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || `Message #${channelName}`}
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-white placeholder:text-zinc-600 resize-none outline-none text-[15px] py-2.5 px-1 max-h-[200px] leading-relaxed"
        />

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Gift */}
          <Tooltip content="Send Gift">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:bg-white/[0.06] hover:text-pink-400 transition-all"
            >
              <Gift className="w-5 h-5" />
            </motion.button>
          </Tooltip>

          {/* Sticker */}
          <Tooltip content="Stickers">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-500 hover:bg-white/[0.06] hover:text-amber-400 transition-all"
            >
              <Sticker className="w-5 h-5" />
            </motion.button>
          </Tooltip>

          {/* Emoji picker */}
          <div className="relative">
            <Tooltip content="Emoji">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowEmoji(!showEmoji)}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                  showEmoji 
                    ? 'bg-indigo-500/20 text-indigo-400' 
                    : 'text-zinc-500 hover:bg-white/[0.06] hover:text-amber-400'
                )}
              >
                <Smile className="w-5 h-5" />
              </motion.button>
            </Tooltip>
            
            <AnimatePresence>
              {showEmoji && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowEmoji(false)} />
                  <EmojiPicker onSelect={insertEmoji} onClose={() => setShowEmoji(false)} />
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Send button */}
          <Tooltip content={content.trim() || attachments.length > 0 ? 'Send Message' : 'Type a message'}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={(!content.trim() && attachments.length === 0) || disabled || sending}
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
                content.trim() || attachments.length > 0
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/25'
                  : 'text-zinc-600 cursor-not-allowed'
              )}
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </motion.button>
          </Tooltip>
        </div>
      </div>

      {/* Character count for long messages */}
      {content.length > 1500 && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            'text-xs mt-1 text-right',
            content.length > 2000 ? 'text-red-400' : 'text-zinc-500'
          )}
        >
          {content.length}/2000
        </motion.p>
      )}
    </div>
  );
}