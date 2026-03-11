import React, { useState, useEffect } from 'react';
import { Search, X, Filter, Calendar, User, Hash, Image, FileText, Link2, Pin, Clock, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors, shadows } from '@/components/app/design/tokens';
import ModalWrapper from '@/components/app/modals/ModalWrapper';

const FILTERS = [
  { id: 'has_image', icon: Image, label: 'Has Image' },
  { id: 'has_file', icon: FileText, label: 'Has File' },
  { id: 'has_link', icon: Link2, label: 'Has Link' },
  { id: 'is_pinned', icon: Pin, label: 'Is Pinned' },
];

export default function AdvancedSearch({ onClose, servers, currentUserId, onJumpToMessage }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] = useState({ has_image: false, has_file: false, has_link: false, is_pinned: false });
  const [serverFilter, setServerFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kairo-recent-searches') || '[]'); } catch { return []; }
  });

  const search = async () => {
    if (!query.trim()) return;
    setSearching(true);
    // Save to recent
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 8);
    setRecentSearches(updated);
    try { localStorage.setItem('kairo-recent-searches', JSON.stringify(updated)); } catch {}

    let allMessages = [];
    if (serverFilter === 'all') {
      allMessages = await base44.entities.Message.list('-created_date', 200);
    } else {
      allMessages = await base44.entities.Message.filter({ server_id: serverFilter }, '-created_date', 200);
    }

    let filtered = allMessages.filter(m => !m.is_deleted && m.content?.toLowerCase().includes(query.toLowerCase()));
    if (filters.has_image) filtered = filtered.filter(m => m.attachments?.some(a => a.content_type?.startsWith('image/')));
    if (filters.has_file) filtered = filtered.filter(m => m.attachments?.length > 0);
    if (filters.has_link) filtered = filtered.filter(m => m.content?.match(/https?:\/\//));
    if (filters.is_pinned) filtered = filtered.filter(m => m.is_pinned);

    if (sortBy === 'oldest') filtered.reverse();
    setResults(filtered.slice(0, 50));
    setSearching(false);
  };

  useEffect(() => { const t = setTimeout(() => { if (query.length >= 2) search(); }, 400); return () => clearTimeout(t); }, [query, filters, serverFilter, sortBy]);

  return (
    <ModalWrapper title="Search" onClose={onClose} width={640}>
      <div className="space-y-3">
        {/* Search bar */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: colors.bg.base, border: `1px solid ${colors.border.default}` }}>
          <Search className="w-5 h-5 flex-shrink-0" style={{ color: colors.text.disabled }} />
          <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Search messages across all servers..." autoFocus
            className="flex-1 bg-transparent text-[14px] outline-none" style={{ color: colors.text.primary }} />
          {query && <button onClick={() => { setQuery(''); setResults([]); }}><X className="w-4 h-4" style={{ color: colors.text.muted }} /></button>}
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-2 flex-wrap">
          <select value={serverFilter} onChange={e => setServerFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-md text-[12px] outline-none" style={{ background: colors.bg.elevated, color: colors.text.secondary, border: `1px solid ${colors.border.default}` }}>
            <option value="all">All Servers</option>
            {(servers || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-2.5 py-1.5 rounded-md text-[12px] outline-none" style={{ background: colors.bg.elevated, color: colors.text.secondary, border: `1px solid ${colors.border.default}` }}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => setFilters(p => ({ ...p, [f.id]: !p[f.id] }))}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] transition-colors"
              style={{ background: filters[f.id] ? colors.accent.subtle : colors.bg.elevated, color: filters[f.id] ? colors.accent.primary : colors.text.muted, border: `1px solid ${filters[f.id] ? colors.accent.muted : colors.border.default}` }}>
              <f.icon className="w-3.5 h-3.5" /> {f.label}
            </button>
          ))}
        </div>

        {/* Recent searches */}
        {!query && recentSearches.length > 0 && (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: colors.text.muted }}>Recent Searches</p>
            <div className="flex flex-wrap gap-1.5">
              {recentSearches.map((s, i) => (
                <button key={i} onClick={() => setQuery(s)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] hover:bg-[rgba(255,255,255,0.06)]"
                  style={{ background: colors.bg.elevated, color: colors.text.secondary }}>
                  <Clock className="w-3 h-3 opacity-40" /> {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto space-y-1 scrollbar-none">
          {searching && <div className="flex items-center justify-center py-8"><div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: colors.border.light, borderTopColor: colors.accent.primary }} /></div>}
          {!searching && results.length > 0 && (
            <p className="text-[11px] font-semibold mb-1" style={{ color: colors.text.muted }}>{results.length} result{results.length !== 1 ? 's' : ''}</p>
          )}
          {!searching && results.map(msg => (
            <button key={msg.id} onClick={() => onJumpToMessage?.(msg)}
              className="w-full text-left p-3 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.04)]" style={{ background: colors.bg.elevated }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold overflow-hidden"
                  style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                  {msg.author_avatar ? <img src={msg.author_avatar} className="w-full h-full object-cover" alt="" /> : (msg.author_name || '?').charAt(0).toUpperCase()}
                </div>
                <span className="text-[13px] font-semibold" style={{ color: colors.text.primary }}>{msg.author_name}</span>
                <span className="text-[11px]" style={{ color: colors.text.disabled }}>{new Date(msg.created_date).toLocaleDateString()}</span>
              </div>
              <p className="text-[13px] line-clamp-2" style={{ color: colors.text.secondary }}>{msg.content}</p>
            </button>
          ))}
          {!searching && query && results.length === 0 && (
            <p className="text-center py-8 text-[14px]" style={{ color: colors.text.muted }}>No results found</p>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}