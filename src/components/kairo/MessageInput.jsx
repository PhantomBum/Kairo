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
  disabled,
  members = []
}) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (replyTo) {
      inputRef.current?.focus();
    }
  }, [replyTo]);

  const handleKeyDown = (e) => {
    if (showMentions && mentionSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex(prev => Math.min(prev + 1, mentionSuggestions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex(prev => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && mentionSuggestions[selectedMentionIndex])) {
        e.preventDefault();
        selectMention(mentionSuggestions[selectedMentionIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowMentions(false);
        return;
      }
    }
    
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    onTyping?.();
  };

  const handleContentChange = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      if (!textAfterAt.includes(' ')) {
        setMentionQuery(textAfterAt.toLowerCase());
        setMentionStart(lastAtIndex);
        
        const filtered = members.filter(m => {
          const name = (m.display_name || m.user_name || m.nickname || '').toLowerCase();
          const username = (m.username || '').toLowerCase();
          return name.includes(textAfterAt.toLowerCase()) || username.includes(textAfterAt.toLowerCase());
        }).slice(0, 5);
        
        setMentionSuggestions(filtered);
        setShowMentions(filtered.length > 0);
        setSelectedMentionIndex(0);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
    
    setContent(newValue);
  };

  const selectMention = (member) => {
    const name = member.display_name || member.user_name || member.nickname || 'user';
    const beforeMention = content.slice(0, mentionStart);
    const afterMention = content.slice(mentionStart + mentionQuery.length + 1);
    const newValue = `${beforeMention}@${name} ${afterMention}`;
    
    setContent(newValue);
    setShowMentions(false);
    inputRef.current?.focus();
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

  const hasContent = content.trim() || files.length > 0;

  return (
    <div className="px-4 pb-5 pt-2">
      {/* Reply preview - Premium style */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-3"
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-500/10 to-transparent backdrop-blur-sm rounded-2xl border border-violet-500/20">
              <div className="w-1 h-10 bg-gradient-to-b from-violet-500 to-purple-600 rounded-full" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">Replying to</span>
                  <span className="text-xs text-violet-400 font-semibold">{replyTo.author_name}</span>
                </div>
                <p className="text-sm text-zinc-400 truncate mt-0.5">{replyTo.content?.slice(0, 60)}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onCancelReply}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File previews - Premium style */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-3"
          >
            <div className="flex flex-wrap gap-2 px-4 py-3 bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06]">
              {files.map((file, index) => (
                <motion.div 
                  key={index} 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="relative group"
                >
                  {file.type.startsWith('image/') ? (
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-800 ring-2 ring-white/10">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-white/[0.05] rounded-xl border border-white/[0.08]">
                      <File className="w-5 h-5 text-violet-400" />
                      <span className="text-sm text-zinc-300 max-w-[100px] truncate">
                        {file.name}
                      </span>
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    <X className="w-3.5 h-3.5 text-white" />
                  </motion.button>
                </motion.div>
              ))}
              {uploadProgress !== null && (
                <div className="flex items-center gap-3 text-sm text-zinc-400 px-4">
                  <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span>Uploading... {Math.round(uploadProgress)}%</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input container - Premium glassmorphism style */}
      <div 
        className={cn(
          "relative flex items-end gap-2 bg-[#18181b]/80 backdrop-blur-xl rounded-2xl border transition-all duration-300",
          isFocused 
            ? "border-emerald-500/40 shadow-lg shadow-emerald-500/10" 
            : hasContent 
              ? "border-white/[0.15]" 
              : "border-white/[0.08] hover:border-white/[0.12]"
        )}
      >
        {/* Glow effect when focused */}
        {isFocused && (
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500/5 via-transparent to-teal-500/5 pointer-events-none" />
        )}

        {/* Attachment button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 ml-1 hover:bg-white/[0.06] rounded-xl transition-all text-zinc-500 hover:text-zinc-300"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-[#18181b]/95 backdrop-blur-xl border-white/[0.08] rounded-xl p-2 shadow-2xl" align="start">
            <DropdownMenuItem 
              onClick={() => fileInputRef.current?.click()}
              className="text-zinc-300 focus:bg-white/[0.06] rounded-lg px-3 py-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center mr-3 group-hover:bg-violet-500/20 transition-colors">
                <File className="w-4 h-4 text-zinc-500 group-hover:text-violet-400 transition-colors" />
              </div>
              Upload File
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                fileInputRef.current.accept = 'image/*';
                fileInputRef.current?.click();
              }}
              className="text-zinc-300 focus:bg-white/[0.06] rounded-lg px-3 py-2.5 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center mr-3 group-hover:bg-blue-500/20 transition-colors">
                <ImageIcon className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
              </div>
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

        {/* Text input with mention support */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={`Message ${channelName ? '#' + channelName : ''}`}
            disabled={disabled}
            rows={1}
            className={cn(
              "w-full bg-transparent text-white placeholder-zinc-500 resize-none py-4 outline-none text-[15px] leading-relaxed",
              "max-h-[200px] scrollbar-thin"
            )}
            style={{ height: 'auto', minHeight: '24px' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
            }}
          />
          
          {/* Mention suggestions - Premium style */}
          <AnimatePresence>
            {showMentions && mentionSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-0 mb-3 w-72 bg-[#18181b]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50"
              >
                <div className="p-2">
                  <p className="px-3 py-2 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                    Members
                  </p>
                  {mentionSuggestions.map((member, index) => (
                    <motion.button
                      key={member.user_id || member.id || index}
                      whileHover={{ x: 4 }}
                      onClick={() => selectMention(member)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all",
                        index === selectedMentionIndex 
                          ? "bg-gradient-to-r from-violet-500/20 to-transparent text-white" 
                          : "text-zinc-300 hover:bg-white/[0.05]"
                      )}
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 overflow-hidden flex-shrink-0 ring-2 ring-white/10">
                        {member.avatar_url || member.avatar ? (
                          <img src={member.avatar_url || member.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                            {(member.display_name || member.user_name || member.nickname)?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {member.display_name || member.user_name || member.nickname || 'Unknown'}
                        </p>
                        {member.username && (
                          <p className="text-xs text-zinc-500">@{member.username}</p>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions - Premium style */}
        <div className="flex items-center gap-1 p-2">
          {/* GIF picker */}
          <Popover open={showGifPicker} onOpenChange={setShowGifPicker}>
            <PopoverTrigger asChild>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="hidden sm:flex p-2.5 hover:bg-white/[0.06] rounded-xl transition-all text-zinc-500 hover:text-zinc-300"
              >
                <Gift className="w-5 h-5" />
              </motion.button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-transparent border-none" align="end" sideOffset={12}>
              <GifPicker onSelect={handleGifSelect} onClose={() => setShowGifPicker(false)} />
            </PopoverContent>
          </Popover>

          {/* Sticker picker */}
          <Popover open={showStickerPicker} onOpenChange={setShowStickerPicker}>
            <PopoverTrigger asChild>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="hidden sm:flex p-2.5 hover:bg-white/[0.06] rounded-xl transition-all text-zinc-500 hover:text-zinc-300"
              >
                <Sticker className="w-5 h-5" />
              </motion.button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-transparent border-none" align="end" sideOffset={12}>
              <StickerPicker onSelect={handleStickerSelect} onClose={() => setShowStickerPicker(false)} />
            </PopoverContent>
          </Popover>

          {/* Emoji picker */}
          <Popover>
            <PopoverTrigger asChild>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 hover:bg-white/[0.06] rounded-xl transition-all text-zinc-500 hover:text-zinc-300"
              >
                <Smile className="w-5 h-5" />
              </motion.button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3 bg-[#18181b]/95 backdrop-blur-xl border-white/[0.08] rounded-xl shadow-2xl" align="end">
              <div className="grid grid-cols-6 gap-1">
                {commonEmojis.map((emoji) => (
                  <motion.button
                    key={emoji}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => insertEmoji(emoji)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-white/[0.1] rounded-lg text-xl transition-all"
                  >
                    {emoji}
                  </motion.button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Send button - Premium gradient */}
          <motion.button
            whileHover={{ scale: hasContent ? 1.05 : 1 }}
            whileTap={{ scale: hasContent ? 0.95 : 1 }}
            onClick={handleSend}
            disabled={disabled || uploadProgress !== null || !hasContent}
            className={cn(
              "p-2.5 rounded-xl transition-all duration-300 ml-1",
              hasContent
                ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
                : "bg-white/[0.05] text-zinc-600 cursor-not-allowed"
            )}
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}