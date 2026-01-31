import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Smile, Gift, Image, Send, X, File, 
  Sticker, AtSign, Mic, BarChart3, Calendar, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';
import IconButton from '../primitives/IconButton';
import Avatar from '../primitives/Avatar';

// File preview with glass morphism
const FilePreview = ({ file, onRemove, progress }) => (
  <motion.div 
    className="relative group"
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    exit={{ scale: 0.8, opacity: 0 }}
  >
    {file.type.startsWith('image/') ? (
      <div className="w-24 h-24 rounded-xl overflow-hidden bg-zinc-800/50 ring-1 ring-white/[0.1]">
        <img 
          src={URL.createObjectURL(file)} 
          alt="" 
          className="w-full h-full object-cover"
        />
        {progress !== undefined && progress < 100 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-indigo-500 animate-spin" />
          </div>
        )}
      </div>
    ) : (
      <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 flex flex-col items-center justify-center ring-1 ring-white/[0.1]">
        <File className="w-6 h-6 text-indigo-400 mb-1" />
        <span className="text-[9px] text-zinc-500 uppercase font-medium">
          {file.name.split('.').pop()}
        </span>
      </div>
    )}
    <motion.button
      onClick={onRemove}
      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-lg shadow-red-500/30"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <X className="w-3 h-3 text-white" />
    </motion.button>
    <p className="text-[10px] text-zinc-500 mt-1.5 truncate w-24 text-center">{file.name}</p>
  </motion.div>
);

// Reply preview with animation
const ReplyPreview = ({ replyTo, onCancel }) => (
  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: 'auto', opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    className="px-4 pt-3 overflow-hidden"
  >
    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-500/10 to-purple-500/5 rounded-xl border-l-2 border-indigo-500">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-indigo-400 font-semibold flex items-center gap-1.5">
          <span>Replying to</span>
          <span className="text-white">{replyTo.author_name}</span>
        </p>
        <p className="text-xs text-zinc-500 truncate mt-0.5">{replyTo.content}</p>
      </div>
      <motion.button 
        onClick={onCancel} 
        className="text-zinc-500 hover:text-white p-1.5 hover:bg-white/[0.1] rounded-lg transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <X className="w-4 h-4" />
      </motion.button>
    </div>
  </motion.div>
);

// Mention suggestions with glass morphism
const MentionSuggestions = ({ query, members, onSelect }) => {
  const filtered = members.filter(m => 
    m.user_name?.toLowerCase().includes(query.toLowerCase()) ||
    m.display_name?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);
  
  if (filtered.length === 0) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute bottom-full left-0 right-0 mb-2 mx-4 bg-[#18181b]/95 backdrop-blur-xl border border-white/[0.1] rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
    >
      <div className="p-2">
        <p className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider px-3 py-2">Members matching "{query}"</p>
        {filtered.map((member, i) => (
          <motion.button
            key={member.user_id || member.id}
            onClick={() => onSelect(member)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ x: 2 }}
          >
            <Avatar src={member.avatar_url} name={member.display_name || member.user_name} size="sm" />
            <div className="flex-1 text-left">
              <span className="text-sm text-white font-medium">{member.display_name || member.user_name}</span>
              {member.username && (
                <span className="text-xs text-zinc-500 ml-2">@{member.username}</span>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

// Action button with tooltip
const ActionBtn = ({ icon: Icon, tooltip, onClick, active, className }) => (
  <motion.button
    onClick={onClick}
    className={cn(
      'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
      active 
        ? 'bg-indigo-500/20 text-indigo-400' 
        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]',
      className
    )}
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    title={tooltip}
  >
    <Icon className="w-[18px] h-[18px]" />
  </motion.button>
);

export default function MessageComposer({
  channelName,
  replyTo,
  onCancelReply,
  onSendMessage,
  onTyping,
  members = [],
  disabled,
  onCreatePoll,
  onScheduleMessage,
}) {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [mentionQuery, setMentionQuery] = useState(null);
  const [showMentions, setShowMentions] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (replyTo) inputRef.current?.focus();
  }, [replyTo]);

  const handleTyping = useCallback(() => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    onTyping?.();
    typingTimeoutRef.current = setTimeout(() => {}, 3000);
  }, [onTyping]);

  const handleChange = (e) => {
    const value = e.target.value;
    setContent(value);
    handleTyping();
    
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

  const handleMentionSelect = (member) => {
    const lastAtIndex = content.lastIndexOf('@');
    const newContent = content.slice(0, lastAtIndex) + `@${member.username || member.display_name || member.user_name} `;
    setContent(newContent);
    setShowMentions(false);
    inputRef.current?.focus();
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles].slice(0, 10));
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if ((!content.trim() && files.length === 0) || uploading) return;
    
    let attachments = [];
    
    if (files.length > 0) {
      setUploading(true);
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        attachments.push({
          url: file_url,
          filename: file.name,
          content_type: file.type,
          size: file.size,
        });
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSend = content.trim() || files.length > 0;

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
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div 
              className="flex flex-wrap gap-3 mb-4 p-4 bg-gradient-to-r from-white/[0.03] to-transparent rounded-2xl border border-white/[0.06]"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {files.map((file, i) => (
                <FilePreview key={i} file={file} onRemove={() => removeFile(i)} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Input area with glass morphism */}
        <motion.div 
          className={cn(
            'relative flex items-end gap-2 p-2 rounded-2xl border transition-all duration-200',
            'bg-gradient-to-r from-white/[0.04] to-white/[0.02]',
            isFocused 
              ? 'border-indigo-500/30 shadow-lg shadow-indigo-500/10' 
              : 'border-white/[0.08]',
            disabled && 'opacity-50 pointer-events-none'
          )}
          animate={{ 
            boxShadow: isFocused ? '0 0 30px rgba(99, 102, 241, 0.1)' : '0 0 0 rgba(99, 102, 241, 0)'
          }}
        >
          {/* Glow effect on focus */}
          {isFocused && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-indigo-500/5 pointer-events-none" />
          )}
          
          {/* Left actions */}
          <div className="relative flex items-center gap-0.5 pb-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <ActionBtn
              icon={Plus}
              tooltip="Attach files"
              onClick={() => fileInputRef.current?.click()}
            />
          </div>
          
          {/* Text input */}
          <div className="relative flex-1 min-w-0">
            <textarea
              ref={inputRef}
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={`Message ${channelName ? `#${channelName}` : ''}`}
              className={cn(
                'w-full max-h-40 bg-transparent text-white text-[15px] resize-none',
                'placeholder:text-zinc-600 focus:outline-none',
                'scrollbar-thin scrollbar-thumb-white/10'
              )}
              rows={1}
              disabled={disabled}
              style={{ height: 'auto', minHeight: '28px' }}
              onInput={(e) => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
              }}
            />
          </div>
          
          {/* Right actions */}
          <div className="relative flex items-center gap-0.5 pb-1">
            <ActionBtn icon={BarChart3} tooltip="Create Poll" onClick={onCreatePoll} />
            <ActionBtn icon={Calendar} tooltip="Schedule Message" onClick={onScheduleMessage} />
            <ActionBtn icon={Sticker} tooltip="Stickers" />
            <ActionBtn icon={Gift} tooltip="Send GIF" />
            <ActionBtn icon={Smile} tooltip="Emoji" />
            
            {/* Send button with animation */}
            <AnimatePresence>
              {canSend && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={handleSend}
                  disabled={uploading || disabled}
                  className={cn(
                    'w-8 h-8 rounded-xl flex items-center justify-center ml-1',
                    'bg-gradient-to-r from-indigo-500 to-purple-500',
                    'hover:from-indigo-400 hover:to-purple-400',
                    'shadow-lg shadow-indigo-500/30',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-white" />
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}