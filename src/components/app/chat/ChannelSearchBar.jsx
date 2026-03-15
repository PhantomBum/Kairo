import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, ArrowUp, ArrowDown } from 'lucide-react';
import { colors } from '@/components/app/design/tokens';

const P = {
  base: colors.bg.base,
  surface: colors.bg.surface,
  elevated: colors.bg.elevated,
  textPrimary: colors.text.primary,
  textSecondary: colors.text.secondary,
  muted: colors.text.muted,
  accent: colors.accent.primary,
};

function highlightMatch(text, query) {
  if (!text || !query || query.length < 2) return text;
  const q = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${q})`, 'gi');
  const parts = text.split(re);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} style={{ background: `${P.accent}30`, color: P.accent, padding: '0 1px', borderRadius: 2 }}>{part}</mark>
    ) : part
  );
}

export default function ChannelSearchBar({ messages, channelName, onJumpToMessage, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return messages
      .filter(m => !m.is_deleted && (m.content?.toLowerCase().includes(q) || m.author_name?.toLowerCase().includes(q)))
      .slice(-100)
      .reverse();
  }, [messages, query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, results.length]);

  useEffect(() => {
    const el = resultsRef.current?.querySelector(`[data-result-index="${selectedIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && results[selectedIndex]) {
        e.preventDefault();
        onJumpToMessage(results[selectedIndex].id);
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [results, selectedIndex, onJumpToMessage, onClose]);

  return (
    <div className="flex-shrink-0 relative">
    <div className="px-4 py-2 flex items-center gap-3"
      style={{ background: P.elevated, borderBottom: `1px solid var(--border-faint)` }}>
      <Search className="w-4 h-4 flex-shrink-0" style={{ color: P.muted }} />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={`Search in ${channelName || 'channel'}...`}
        className="flex-1 bg-transparent text-[14px] outline-none min-w-0"
        style={{ color: P.textPrimary }}
      />
      {results.length > 0 && (
        <span className="text-[12px] flex-shrink-0" style={{ color: P.muted }}>
          {selectedIndex + 1} / {results.length}
        </span>
      )}
      <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)]"
        style={{ color: P.muted }} aria-label="Close search">
        <X className="w-4 h-4" />
      </button>

      {query.length >= 2 && (
        <div ref={resultsRef} className="absolute left-0 right-0 top-full max-h-[240px] overflow-y-auto z-50"
          style={{ background: P.elevated, borderBottom: `1px solid var(--border-faint)`, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-[13px]" style={{ color: P.muted }}>No messages match "{query}"</div>
          ) : (
            results.map((msg, i) => (
              <button
                key={msg.id}
                data-result-index={i}
                onClick={() => { onJumpToMessage(msg.id); onClose(); }}
                className="w-full text-left px-4 py-2.5 flex items-start gap-2.5 hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                style={{ background: i === selectedIndex ? 'rgba(123,108,246,0.12)' : 'transparent' }}>
                <span className="text-[11px] font-medium flex-shrink-0 w-20 truncate" style={{ color: P.muted }}>{msg.author_name}</span>
                <span className="text-[13px] flex-1 min-w-0 line-clamp-2 break-words" style={{ color: P.textSecondary }}>
                  {highlightMatch(msg.content || '', query)}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
    </div>
  );
}
