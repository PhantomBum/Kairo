import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Smile, Gift, Mic, Image, FileUp, 
  Send, X, AtSign, Hash, Calendar, BarChart2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function AttachmentPreview({ file, onRemove }) {
  const isImage = file.type?.startsWith('image/');
  const preview = isImage ? URL.createObjectURL(file) : null;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative group"
    >
      {isImage ? (
        <img
          src={preview}
          alt={file.name}
          className="w-24 h-24 object-cover rounded-lg border border-white/[0.08]"
        />
      ) : (
        <div className="w-24 h-24 rounded-lg bg-white/[0.04] border border-white/[0.08] flex flex-col items-center justify-center p-2">
          <FileUp className="w-6 h-6 text-zinc-500 mb-1" />
          <p className="text-[10px] text-zinc-500 truncate w-full text-center">{file.name}</p>
        </div>
      )}
      
      <button
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3 text-white" />
      </button>
    </motion.div>
  );
}

function ReplyPreview({ replyTo, onCancel }) {
  if (!replyTo) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-2 px-4 py-2 bg-white/[0.02] border-l-2 border-indigo-500"
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-500">
          Replying to <span className="text-indigo-400 font-medium">{replyTo.author_name}</span>
        </p>
        <p className="text-sm text-zinc-400 truncate">{replyTo.content}</p>
      </div>
      <button onClick={onCancel} className="p-1 hover:bg-white/[0.06] rounded">
        <X className="w-4 h-4 text-zinc-500" />
      </button>
    </motion.div>
  );
}

export default function MessageComposer({
  channelName,
  replyTo,
  onCancelReply,
  onSendMessage,
  members = [],
  disabled,
  onCreatePoll,
  onScheduleMessage,
}) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  
  const handleSend = async () => {
    if ((!content.trim() && files.length === 0) || disabled) return;
    
    try {
      setIsUploading(true);
      
      // Upload files
      const attachments = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        attachments.push({
          url: file_url,
          filename: file.name,
          content_type: file.type,
          size: file.size,
        });
      }
      
      await onSendMessage({
        content: content.trim(),
        attachments,
        replyToId: replyTo?.id,
      });
      
      setContent('');
      setFiles([]);
    } catch (error) {
      console.error('Send error:', error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...newFiles].slice(0, 10)); // Max 10 files
    e.target.value = '';
  };
  
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  return (
    <div className="px-4 pb-6">
      <AnimatePresence>
        {replyTo && (
          <ReplyPreview replyTo={replyTo} onCancel={onCancelReply} />
        )}
      </AnimatePresence>
      
      {/* File previews */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 p-3 bg-[#0a0a0c] border border-white/[0.06] border-b-0 rounded-t-xl overflow-x-auto"
          >
            {files.map((file, i) => (
              <AttachmentPreview
                key={i}
                file={file}
                onRemove={() => removeFile(i)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Input area */}
      <div className={cn(
        'relative flex items-end gap-2 px-4 py-3 bg-[#0a0a0c] border border-white/[0.06] transition-colors',
        files.length > 0 ? 'rounded-b-xl' : 'rounded-xl',
        'focus-within:border-white/[0.12]'
      )}>
        {/* Add button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-zinc-400 hover:text-white transition-colors flex-shrink-0">
              <Plus className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" className="w-48 bg-[#111113] border-white/10">
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <FileUp className="w-4 h-4 mr-2" />
              Upload File
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onCreatePoll}>
              <BarChart2 className="w-4 h-4 mr-2" />
              Create Poll
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onScheduleMessage}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Message
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
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Slow mode active...' : `Message #${channelName}`}
          disabled={disabled}
          rows={1}
          className={cn(
            'flex-1 resize-none bg-transparent text-sm text-white placeholder:text-zinc-600',
            'focus:outline-none max-h-36 overflow-y-auto',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          style={{ minHeight: '24px' }}
        />
        
        {/* Right side actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-8 h-8 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Image className="w-5 h-5" />
          </button>
          
          <button className="w-8 h-8 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors">
            <Gift className="w-5 h-5" />
          </button>
          
          <button className="w-8 h-8 rounded flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors">
            <Smile className="w-5 h-5" />
          </button>
          
          {(content.trim() || files.length > 0) && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={handleSend}
              disabled={disabled || isUploading}
              className="w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white ml-1 transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}