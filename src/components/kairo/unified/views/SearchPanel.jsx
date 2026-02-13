import React, { useState, useCallback } from 'react';
import { Search, X, Hash, MessageSquare } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import lodash from 'lodash';

export default function SearchPanel({ serverId, channelId, onClose, onJumpToMessage }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const doSearch = useCallback(
    lodash.debounce(async (q) => {
      if (!q.trim() || q.length < 2) { setResults([]); return; }
      setSearching(true);
      const filter = {};
      if (channelId) filter.channel_id = channelId;
      else if (serverId) filter.server_id = serverId;
      const msgs = await base44.entities.Message.filter(filter, '-created_date', 200);
      const matched = msgs.filter(m =>
        !m.is_deleted && m.content?.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 25);
      setResults(matched);
      setSearching(false);
    }, 300),
    [serverId, channelId]
  );

  const handleChange = (e) => {
    setQuery(e.target.value);
    doSearch(e.target.value);
  };

  return (
    <div className="w-80 flex-shrink-0 flex flex-col" style={{ background: '#131313', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="h-12 px-4 flex items-center gap-2 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Search className="w-4 h-4 text-zinc-500" />
        <span className="text-sm font-medium text-white">Search</span>
        <button onClick={onClose} className="ml-auto p-1 text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600" />
          <input value={query} onChange={handleChange} autoFocus
            placeholder="Search messages..."
            className="w-full h-9 pl-9 pr-3 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none" style={{ background: '#0e0e0e' }} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-thin">
        {searching && <div className="text-center py-8"><div className="w-4 h-4 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin mx-auto" /></div>}
        {!searching && results.length === 0 && query.length >= 2 && (
          <div className="text-center py-8 text-zinc-600 text-sm">No results found</div>
        )}
        {results.map(msg => (
          <button key={msg.id} onClick={() => onJumpToMessage?.(msg)}
            className="w-full text-left p-3 rounded-lg mb-1 transition-colors hover:bg-white/[0.04]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-white">{msg.author_name}</span>
              <span className="text-[10px] text-zinc-600">{new Date(msg.created_date).toLocaleDateString()}</span>
            </div>
            <p className="text-xs text-zinc-400 line-clamp-2">{msg.content}</p>
          </button>
        ))}
      </div>
    </div>
  );
}