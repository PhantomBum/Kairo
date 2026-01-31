// Kairo Message Composer v3.0 - Clean, minimal input

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Smile, File, X, ArrowUp, ImageIcon, Gift, Sticker
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Text, Avatar, IconButton } from '../ui/DesignSystem';
import { base44 } from '@/api/base44Client';
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

const quickEmojis = ['😀', '😂', '❤️', '🔥', '👍', '🎉', '😢', '🤔', '👀', '💯', '✨', '😮'];

export default function MessageComposerV3({ 
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
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (replyTo) inputRef.current?.focus();
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
    setContent(`${beforeMention}@${name} ${afterMention}`);
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

    onSendMessage({ content: content.trim(), attachments, replyToId: replyTo?.id });
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
    setContent(content.slice(0, start) + emoji + content.slice(start));
    inputRef.current?.focus();
  };

  const hasContent = content.trim() || files.length > 0;

  return (
    <div className="px-4 pb-6 pt-2">
      {/* Reply preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mb-2"
          >
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#111114] border border-white/[0.04] rounded-xl">
              <div className="w-0.5 h-8 bg-emerald-500/60 rounded-full" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Text variant="tiny" color="tertiary">Replying to</Text>
                  <Text variant="tiny" color="primary" weight="medium">{replyTo.author_name}</Text>
                </div>
                <Text variant="small" color="secondary" className="truncate">{replyTo.content?.slice(0, 60)}</Text>
              </div>
              <IconButton size="sm" variant="ghost" onClick={onCancelReply}>
                <X className="w-4 h-4" />
              </IconButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File previews */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mb-2"
          >
            <div className="flex flex-wrap gap-2 px-3 py-2.5 bg-[#111114] border border-white/[0.04] rounded-xl">
              {files.map((file, index) => (
                <div key={index} className="relative group">
                  {file.type.startsWith('image/') ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5">
                      <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-2.5 py-2 bg-white/[0.03] rounded-lg">
                      <File className="w-4 h-4 text-zinc-500" />
                      <Text variant="tiny" color="secondary" className="max-w-[80px] truncate">{file.name}</Text>
                    </div>
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              {uploadProgress !== null && (
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <Text variant="small" color="tertiary">Uploading... {Math.round(uploadProgress)}%</Text>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input container */}
      <div className={cn(
        "relative flex items-end bg-[#111114] border rounded-xl transition-all",
        isFocused ? "border-white/[0.08]" : "border-white/[0.04]"
      )}>
        {/* Attachment button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-3 ml-1 hover:bg-white/[0.04] rounded-lg transition-colors text-zinc-500 hover:text-zinc-300">
              <Plus className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-[#111114] border-white/[0.06] rounded-xl p-1.5" align="start">
            <DropdownMenuItem 
              onClick={() => fileInputRef.current?.click()}
              className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2.5"
            >
              <File className="w-4 h-4 mr-2.5 text-zinc-500" />
              Upload File
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                fileInputRef.current.accept = 'image/*';
                fileInputRef.current?.click();
              }}
              className="text-zinc-300 focus:bg-white/[0.04] focus:text-white rounded-lg px-3 py-2.5"
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
              "w-full bg-transparent text-white placeholder-zinc-600 resize-none py-3.5 outline-none text-[14px] leading-relaxed",
              "max-h-[200px] scrollbar-thin"
            )}
            style={{ height: 'auto', minHeight: '24px' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
            }}
          />
          
          {/* Mention suggestions */}
          <AnimatePresence>
            {showMentions && mentionSuggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="absolute bottom-full left-0 mb-2 w-64 bg-[#111114] border border-white/[0.06] rounded-xl shadow-xl overflow-hidden z-50"
              >
                <div className="p-1.5">
                  <Text variant="tiny" color="muted" weight="semibold" className="px-2.5 py-1.5 uppercase tracking-wider">
                    Members
                  </Text>
                  {mentionSuggestions.map((member, index) => (
                    <button
                      key={member.user_id || member.id || `mention-${index}`}
                      onClick={() => selectMention(member)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors",
                        index === selectedMentionIndex 
                          ? "bg-white/[0.06] text-white" 
                          : "text-zinc-400 hover:bg-white/[0.03]"
                      )}
                    >
                      <Avatar 
                        src={member.avatar_url || member.avatar} 
                        name={member.display_name || member.user_name || member.nickname}
                        size="sm"
                      />
                      <div className="text-left min-w-0">
                        <Text variant="small" color={index === selectedMentionIndex ? 'primary' : 'secondary'} className="truncate block">
                          {member.display_name || member.user_name || member.nickname || 'Unknown'}
                        </Text>
                        {member.username && (
                          <Text variant="tiny" color="muted">@{member.username}</Text>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 p-2">
          {/* Emoji picker */}
          <Popover>
            <PopoverTrigger asChild>
              <IconButton size="sm" variant="ghost">
                <Smile className="w-5 h-5" />
              </IconButton>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2 bg-[#111114] border-white/[0.06] rounded-xl" align="end">
              <div className="grid grid-cols-6 gap-0.5">
                {quickEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="w-9 h-9 flex items-center justify-center hover:bg-white/[0.06] rounded-lg text-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={disabled || uploadProgress !== null || !hasContent}
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center transition-all ml-1",
              hasContent
                ? "bg-emerald-500 text-white hover:bg-emerald-400"
                : "bg-white/[0.06] text-zinc-600 cursor-not-allowed"
            )}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}