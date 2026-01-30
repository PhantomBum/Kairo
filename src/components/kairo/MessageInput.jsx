import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Smile, ImageIcon, File, X, Send, Mic, ArrowUp, Sparkles, Sticker, Gift
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { base44 } from '@/api/base44Client';
import GifPicker from './chat/GifPicker';
import StickerPicker from './chat/StickerPicker';

const commonEmojis = ['😀', '😂', '❤️', '🔥', '👍', '🎉', '😢', '😮', '🤔', '👀', '💯', '✨'];

export default function MessageInput({ 
  channelName,
  replyTo,
  onCancelReply,
  onSendMessage,
  onTyping,
  disabled
}) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (replyTo) {
      inputRef.current?.focus();
    }
  }, [replyTo]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    onTyping?.();
  };

  const handleSend = async () => {
    if (!content.trim() && files.length === 0) return;

    let attachments = [];
    if (files.length > 0) {
      setUploadProgress(0);
      for (let i = 0; i < files.length; i++) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file: files[i] });
        attachments.push({
          url: file_url,
          filename: files[i].name,
          content_type: files[i].type,
          size: files[i].size
        });
        setUploadProgress(((i + 1) / files.length) * 100);
      }
      setUploadProgress(null);
    }

    onSendMessage({
      content: content.trim(),
      attachments,
      replyToId: replyTo?.id
    });

    setContent('');
    setFiles([]);
  };

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const insertEmoji = (emoji) => {
    const start = inputRef.current?.selectionStart || content.length;
    const newContent = content.slice(0, start) + emoji + content.slice(start);
    setContent(newContent);
    inputRef.current?.focus();
  };

  const handleGifSelect = (gifUrl) => {
    onSendMessage({ content: gifUrl, attachments: [], replyToId: replyTo?.id });
    setShowGifPicker(false);
  };

  const handleStickerSelect = (sticker) => {
    onSendMessage({ content: sticker.url, attachments: [], replyToId: replyTo?.id });
    setShowStickerPicker(false);
  };

  return (
    <div className="px-4 pb-6 pt-2">
      {/* Reply preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-3 px-4 py-3 mb-2 bg-zinc-800/50 backdrop-blur-sm rounded-2xl border border-zinc-700/50"
          >
            <div className="w-1 h-8 bg-violet-500 rounded-full" />
            <div className="flex-1 min-w-0">
              <span className="text-xs text-zinc-400">Replying to </span>
              <span className="text-xs text-violet-400 font-medium">{replyTo.author_name}</span>
              <p className="text-sm text-zinc-400 truncate">{replyTo.content?.slice(0, 60)}</p>
            </div>
            <button
              onClick={onCancelReply}
              className="p-1.5 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File previews */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="flex flex-wrap gap-2 px-4 py-3 mb-2 bg-zinc-800/30 backdrop-blur-sm rounded-2xl border border-zinc-800/50"
          >
            {files.map((file, index) => (
              <div key={index} className="relative group">
                {file.type.startsWith('image/') ? (
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-700">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-800 rounded-xl">
                    <File className="w-5 h-5 text-violet-400" />
                    <span className="text-sm text-zinc-300 max-w-[100px] truncate">
                      {file.name}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            {uploadProgress !== null && (
              <div className="flex items-center gap-2 text-sm text-zinc-400 px-3">
                <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                Uploading... {Math.round(uploadProgress)}%
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input container */}
      <motion.div 
        initial={false}
        animate={{ 
          borderColor: content.trim() ? 'rgba(139, 92, 246, 0.3)' : 'rgba(63, 63, 70, 0.3)',
          backgroundColor: content.trim() ? 'rgba(39, 39, 42, 0.7)' : 'rgba(39, 39, 42, 0.5)'
        }}
        className={cn(
          "flex items-end gap-2 bg-zinc-800/50 backdrop-blur-sm rounded-2xl border border-zinc-700/30 transition-all shadow-lg",
          (replyTo || files.length > 0) && "rounded-t-2xl"
        )}
      >
        {/* Attachment button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3.5 hover:bg-zinc-700/50 rounded-l-2xl transition-colors text-zinc-400 hover:text-zinc-200"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52 bg-zinc-900/95 backdrop-blur-xl border-zinc-800/80 rounded-2xl p-1.5" align="start">
            <DropdownMenuItem 
              onClick={() => fileInputRef.current?.click()}
              className="text-zinc-300 focus:bg-zinc-800 rounded-xl px-3 py-2.5"
            >
              <File className="w-4 h-4 mr-2.5 text-zinc-500" />
              Upload File
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                fileInputRef.current.accept = 'image/*';
                fileInputRef.current?.click();
              }}
              className="text-zinc-300 focus:bg-zinc-800 rounded-xl px-3 py-2.5"
            >
              <ImageIcon className="w-4 h-4 mr-2.5 text-zinc-500" />
              Upload Image
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Text input */}
        <textarea
          ref={inputRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Message ${channelName ? '#' + channelName : ''}`}
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 bg-transparent text-white placeholder-zinc-500 resize-none py-3.5 outline-none text-[15px]",
            "max-h-[200px] scrollbar-thin"
          )}
          style={{ height: 'auto', minHeight: '24px' }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
          }}
        />

        {/* Actions */}
        <div className="flex items-center gap-0.5 p-2">
          {/* GIF picker */}
          <Popover open={showGifPicker} onOpenChange={setShowGifPicker}>
            <PopoverTrigger asChild>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 hover:bg-zinc-700/50 rounded-xl transition-colors text-zinc-400 hover:text-zinc-200"
              >
                <Gift className="w-5 h-5" />
              </motion.button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-transparent border-none" align="end" sideOffset={8}>
              <GifPicker onSelect={handleGifSelect} onClose={() => setShowGifPicker(false)} />
            </PopoverContent>
          </Popover>

          {/* Sticker picker */}
          <Popover open={showStickerPicker} onOpenChange={setShowStickerPicker}>
            <PopoverTrigger asChild>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 hover:bg-zinc-700/50 rounded-xl transition-colors text-zinc-400 hover:text-zinc-200"
              >
                <Sticker className="w-5 h-5" />
              </motion.button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-transparent border-none" align="end" sideOffset={8}>
              <StickerPicker onSelect={handleStickerSelect} onClose={() => setShowStickerPicker(false)} />
            </PopoverContent>
          </Popover>

          {/* Emoji picker */}
          <Popover>
            <PopoverTrigger asChild>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 hover:bg-zinc-700/50 rounded-xl transition-colors text-zinc-400 hover:text-zinc-200"
              >
                <Smile className="w-5 h-5" />
              </motion.button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3 bg-zinc-900/95 backdrop-blur-xl border-zinc-800/80 rounded-2xl" align="end">
              <div className="grid grid-cols-6 gap-1.5">
                {commonEmojis.map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => insertEmoji(emoji)}
                    className="w-10 h-10 flex items-center justify-center hover:bg-zinc-800 rounded-xl text-xl transition-colors"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Send button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={disabled || uploadProgress !== null || (!content.trim() && files.length === 0)}
            className={cn(
              "p-2.5 rounded-xl transition-all ml-1",
              (content.trim() || files.length > 0)
                ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30"
                : "bg-zinc-700/50 text-zinc-500 cursor-not-allowed"
            )}
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}