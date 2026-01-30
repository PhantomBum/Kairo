import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function MentionInput({ 
  value, 
  onChange, 
  onKeyDown,
  members = [],
  placeholder,
  disabled,
  className
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(-1);
  const inputRef = useRef(null);

  // Detect @ mentions
  const handleChange = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    // Find if we're in a mention
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // Check if there's a space after @ (means mention is complete)
      if (!textAfterAt.includes(' ')) {
        setMentionQuery(textAfterAt.toLowerCase());
        setMentionStart(lastAtIndex);
        
        // Filter members
        const filtered = members.filter(m => {
          const name = (m.display_name || m.user_name || m.nickname || '').toLowerCase();
          const username = (m.username || '').toLowerCase();
          return name.includes(textAfterAt.toLowerCase()) || username.includes(textAfterAt.toLowerCase());
        }).slice(0, 5);
        
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setSelectedIndex(0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
    
    onChange(newValue);
  };

  // Handle keyboard navigation
  const handleKeyDownInternal = (e) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === 'Tab' || e.key === 'Enter') {
        if (suggestions[selectedIndex]) {
          e.preventDefault();
          selectMention(suggestions[selectedIndex]);
          return;
        }
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
        return;
      }
    }
    
    onKeyDown?.(e);
  };

  // Insert mention
  const selectMention = (member) => {
    const name = member.display_name || member.user_name || member.nickname || 'user';
    const beforeMention = value.slice(0, mentionStart);
    const afterMention = value.slice(mentionStart + mentionQuery.length + 1);
    const newValue = `${beforeMention}@${name} ${afterMention}`;
    
    onChange(newValue);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative flex-1">
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDownInternal}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className={cn(
          "w-full bg-transparent text-white placeholder-zinc-500 resize-none outline-none text-[15px]",
          "max-h-[200px] scrollbar-thin",
          className
        )}
        style={{ height: 'auto', minHeight: '24px' }}
        onInput={(e) => {
          e.target.style.height = 'auto';
          e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
        }}
      />
      
      {/* Mention suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 mb-2 w-64 bg-[#1a1a1d] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-1">
              <p className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
                Members matching @{mentionQuery}
              </p>
              {suggestions.map((member, index) => (
                <button
                  key={member.user_id || member.id || index}
                  onClick={() => selectMention(member)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors",
                    index === selectedIndex ? "bg-violet-500/20 text-white" : "text-zinc-300 hover:bg-white/5"
                  )}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 overflow-hidden flex-shrink-0">
                    {member.avatar_url || member.avatar ? (
                      <img src={member.avatar_url || member.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                        {(member.display_name || member.user_name || member.nickname)?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-sm font-medium truncate">
                      {member.display_name || member.user_name || member.nickname || 'Unknown'}
                    </p>
                    {member.username && (
                      <p className="text-xs text-zinc-500 truncate">@{member.username}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}