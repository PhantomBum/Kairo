import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Smile, Gift, Sticker, ImageIcon, File, AtSign,
  X, Send, Mic, PauseCircle, Paperclip
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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

const commonEmojis = ['😀', '😂', '❤️', '🔥', '👍', '👎', '🎉', '😢', '😮', '🤔', '👀', '💯'];

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
  const [isRecording, setIsRecording] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
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

    // Upload files first if any
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

  return (
    <div className="px-4 pb-6 pt-2">
      {/* Reply preview */}
      <AnimatePresence>
        {replyTo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2 px-4 py-2 mb-2 bg-zinc-800/50 rounded-t-lg border-l-2 border-indigo-500"
          >
            <span className="text-xs text-zinc-500">Replying to</span>
            <span className="text-xs text-white font-medium">{replyTo.author_name}</span>
            <span className="text-xs text-zinc-400 truncate flex-1">{replyTo.content?.slice(0, 50)}</span>
            <button
              onClick={onCancelReply}
              className="p-1 hover:bg-zinc-700 rounded transition-colors"
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
            className="flex flex-wrap gap-2 px-4 py-3 mb-2 bg-zinc-800/30 rounded-t-lg"
          >
            {files.map((file, index) => (
              <div 
                key={index}
                className="relative group"
              >
                {file.type.startsWith('image/') ? (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-700">
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-zinc-700 rounded-lg">
                    <File className="w-5 h-5 text-zinc-400" />
                    <span className="text-sm text-zinc-300 max-w-[100px] truncate">
                      {file.name}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
            {uploadProgress !== null && (
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                Uploading... {Math.round(uploadProgress)}%
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input container */}
      <div className={cn(
        "flex items-end gap-2 bg-zinc-800/50 rounded-lg transition-colors",
        replyTo && "rounded-t-none",
        files.length > 0 && !replyTo && "rounded-t-none"
      )}>
        {/* Attachment button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-3 hover:bg-zinc-700/50 rounded-l-lg transition-colors text-zinc-400 hover:text-zinc-200">
              <Plus className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 bg-zinc-900 border-zinc-800" align="start">
            <DropdownMenuItem 
              onClick={() => fileInputRef.current?.click()}
              className="text-zinc-300 focus:bg-zinc-800 focus:text-white"
            >
              <File className="w-4 h-4 mr-2" />
              Upload File
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                fileInputRef.current.accept = 'image/*';
                fileInputRef.current?.click();
              }}
              className="text-zinc-300 focus:bg-zinc-800 focus:text-white"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
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
          placeholder={`Message #${channelName || 'channel'}`}
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 bg-transparent text-white placeholder-zinc-500 resize-none py-3 outline-none",
            "max-h-[200px] scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
          )}
          style={{ 
            height: 'auto',
            minHeight: '24px'
          }}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
          }}
        />

        {/* Actions */}
        <div className="flex items-center gap-1 p-2">
          {/* Emoji picker */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-1.5 hover:bg-zinc-700/50 rounded transition-colors text-zinc-400 hover:text-zinc-200">
                <Smile className="w-5 h-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3 bg-zinc-900 border-zinc-800" align="end">
              <div className="grid grid-cols-6 gap-1">
                {commonEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-zinc-800 rounded text-lg transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Voice message */}
          <button 
            onClick={() => setIsRecording(!isRecording)}
            className={cn(
              "p-1.5 rounded transition-colors",
              isRecording 
                ? "bg-red-500 text-white" 
                : "hover:bg-zinc-700/50 text-zinc-400 hover:text-zinc-200"
            )}
          >
            {isRecording ? <PauseCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Send button */}
          {(content.trim() || files.length > 0) && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={handleSend}
              disabled={disabled || uploadProgress !== null}
              className="p-1.5 bg-indigo-500 hover:bg-indigo-600 rounded transition-colors text-white"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}