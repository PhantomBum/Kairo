import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Smile, Gift, Image, Send, X, File, 
  Sticker, AtSign, Mic, StopCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import IconButton from '../primitives/IconButton';
import Avatar from '../primitives/Avatar';

// File preview component
const FilePreview = ({ file, onRemove }) => (
  <div className="relative group">
    {file.type.startsWith('image/') ? (
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-800">
        <img 
          src={URL.createObjectURL(file)} 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
    ) : (
      <div className="w-20 h-20 rounded-lg bg-zinc-800 flex items-center justify-center">
        <File className="w-6 h-6 text-zinc-500" />
      </div>
    )}
    <button
      onClick={onRemove}
      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <X className="w-3 h-3 text-white" />
    </button>
    <p className="text-[10px] text-zinc-500 mt-1 truncate w-20">{file.name}</p>
  </div>
);

// Reply preview
const ReplyPreview = ({ replyTo, onCancel }) => (
  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: 'auto', opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    className="px-4 pt-3 overflow-hidden"
  >
    <div className="flex items-center gap-3 px-3 py-2 bg-white/[0.04] rounded-lg border-l-2 border-indigo-500">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-indigo-400 font-medium">
          Replying to {replyTo.author_name}
        </p>
        <p className="text-xs text-zinc-500 truncate">{replyTo.content}</p>
      </div>
      <button onClick={onCancel} className="text-zinc-500 hover:text-white">
        <X className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
);

// Mention suggestions
const MentionSuggestions = ({ query, members, onSelect }) => {
  const filtered = members.filter(m => 
    m.user_name?.toLowerCase().includes(query.toLowerCase()) ||
    m.display_name?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);
  
  if (filtered.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-[#111113] border border-white/[0.08] rounded-lg shadow-xl overflow-hidden"
    >
      <div className="p-2">
        <p className="text-xs text-zinc-500 uppercase px-2 py-1">Members</p>
        {filtered.map((member) => (
          <button
            key={member.user_id || member.id}
            onClick={() => onSelect(member)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.04] transition-colors"
          >
            <Avatar src={member.avatar_url} name={member.display_name || member.user_name} size="xs" />
            <span className="text-sm text-white">{member.display_name || member.user_name}</span>
            {member.username && (
              <span className="text-xs text-zinc-500">@{member.username}</span>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default function MessageComposer({
  channelName,
  replyTo,
  onCancelReply,
  onSendMessage,
  onTyping,
  members = [],
  disabled,
}) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [showMentions, setShowMentions] = useState(false);
  
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Focus input on mount and reply
  useEffect(() => {
    if (replyTo) inputRef.current?.focus();
  }, [replyTo]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    onTyping?.();
    typingTimeoutRef.current = setTimeout(() => {}, 3000);
  }, [onTyping]);

  // Handle content change
  const handleChange = (e) => {
    const value = e.target.value;
    setContent(value);
    handleTyping();
    
    // Check for @mention
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const textAfterAt = value.slice(lastAtIndex + 1);
      if (!textAfterAt.includes(' ')) {
        setMentionQuery(textAfterAt);
        setShowMentions(true);
        return;
      }
    }
    setShowMentions(false);
  };

  // Handle mention selection
  const handleMentionSelect = (member) => {
    const lastAtIndex = content.lastIndexOf('@');
    const newContent = content.slice(0, lastAtIndex) + `@${member.username || member.display_name || member.user_name} `;
    setContent(newContent);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles].slice(0, 10));
  };

  // Remove file
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle send
  const handleSend = async () => {
    if ((!content.trim() && files.length === 0) || uploading) return;
    
    let attachments = [];
    
    // Upload files
    if (files.length > 0) {
      setUploading(true);
      try {
        for (const file of files) {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          attachments.push({
            url: file_url,
            filename: file.name,
            content_type: file.type,
            size: file.size,
          });
        }
      } catch (err) {
        console.error('Upload failed:', err);
      }
      setUploading(false);
    }
    
    onSendMessage({
      content: content.trim(),
      attachments,
      replyToId: replyTo?.id,
    });
    
    setContent('');
    setFiles([]);
  };

  // Handle key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative">
      {/* Reply preview */}
      <AnimatePresence>
        {replyTo && <ReplyPreview replyTo={replyTo} onCancel={onCancelReply} />}
      </AnimatePresence>
      
      {/* Mention suggestions */}
      <AnimatePresence>
        {showMentions && mentionQuery !== null && (
          <MentionSuggestions
            query={mentionQuery}
            members={members}
            onSelect={handleMentionSelect}
          />
        )}
      </AnimatePresence>
      
      <div className="px-4 pb-4 pt-2">
        {/* File previews */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 p-3 bg-white/[0.02] rounded-lg">
            {files.map((file, i) => (
              <FilePreview key={i} file={file} onRemove={() => removeFile(i)} />
            ))}
          </div>
        )}
        
        {/* Input area */}
        <div className={cn(
          'flex items-end gap-2 p-2 bg-white/[0.04] rounded-xl border border-white/[0.08]',
          'focus-within:border-white/[0.12]',
          disabled && 'opacity-50 pointer-events-none'
        )}>
          {/* Left actions */}
          <div className="flex items-center gap-0.5 pb-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <IconButton
              icon={Plus}
              size="sm"
              variant="ghost"
              tooltip="Attach files"
              onClick={() => fileInputRef.current?.click()}
            />
          </div>
          
          {/* Text input */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={inputRef}
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${channelName ? `#${channelName}` : ''}`}
              className={cn(
                'w-full max-h-40 bg-transparent text-white text-sm resize-none',
                'placeholder:text-zinc-600 focus:outline-none',
                'scrollbar-thin'
              )}
              rows={1}
              disabled={disabled}
              style={{
                height: 'auto',
                minHeight: '24px',
              }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
              }}
            />
          </div>
          
          {/* Right actions */}
          <div className="flex items-center gap-0.5 pb-1">
            <IconButton icon={Sticker} size="sm" variant="ghost" tooltip="Stickers" />
            <IconButton icon={Smile} size="sm" variant="ghost" tooltip="Emoji" />
            <IconButton icon={Gift} size="sm" variant="ghost" tooltip="GIF" />
            
            {/* Send button */}
            {(content.trim() || files.length > 0) ? (
              <IconButton
                icon={Send}
                size="sm"
                variant="solid"
                tooltip="Send"
                onClick={handleSend}
                disabled={uploading || disabled}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}