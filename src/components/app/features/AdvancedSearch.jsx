import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, X, Image, FileText, Link2, Pin, Clock, Star, StarOff, Hash, User, MessageSquare, Server, AtSign } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';
import { motion, AnimatePresence } from 'framer-motion';

const FILTER_PILLS = [
  { id: 'has_image', icon: Image, label: 'Has Image' },
  { id: 'has_file', icon: FileText, label: 'Has File' },
  { id: 'has_link', icon: Link2, label: 'Has Link' },
  { id: 'is_pinned', icon: Pin, label: 'Pinned' },
  { id: 'from_me', icon: User, label: 'From Me' },
  { id: 'mentions_me', icon: AtSign, label: 'Mentions Me' },
];

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'people', label: 'People', icon: User },
  { id: 'servers', label: 'Servers', icon: Server },
  { id: 'files', label: 'Files', icon: FileText },
  { id: 'links', label: 'Links', icon: Link2 },
];

function ResultMessage({ msg, onJump, context }) {
  return (
    <button onClick={() => onJump?.(msg)} className="w-full text-left p-3 rounded-xl transition-colors hover:bg-[rgba(255,255,255,0.04)] k-fade-in group"
      style={{ background: colors.bg.elevated }}>
      {/* Context message above */}
      {context?.before && (
        <div className="flex items-center gap-2 mb-1 pb-1 opacity-50" style={{ borderBottom: `1px solid ${colors.border.light}` }}>
          <span className="text-[11px] font-medium" style={{ color: colors.text.disabled }}>{context.before.author_name}:</span>
          <span className="text-[11px] truncate" style={{ color: colors.text.disabled }}>{context.before.content?.slice(0, 60)}</span>
        </div>
      )}
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold overflow-hidden flex-shrink-0 mt-0.5"
          style={{ background: colors.bg.overlay, color: colors.text.muted }}>
          {msg.author_avatar ? <img src={msg.author_avatar} className="w-full h-full object-cover" alt="" /> : (msg.author_name || '?')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[13px] font-semibold" style={{ color: colors.text.primary }}>{msg.author_name}</span>
            <span className="text-[11px]" style={{ color: colors.text.disabled }}>{new Date(msg.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            {msg.is_pinned && <Pin className="w-3 h-3" style={{ color: colors.warning }} />}
          </div>
          <p className="text-[13px] leading-relaxed line-clamp-3 break-words" style={{ color: colors.text.secondary }}>{msg.content}</p>
          {msg.attachments?.length > 0 && (
            <div className="flex gap-1 mt-1.5">
              {msg.attachments.slice(0, 3).map((a, i) => {
                if (a.content_type?.startsWith('image/')) return <img key={i} src={a.url} className="w-12 h-12 rounded object-cover" alt="" loading="lazy" />;
                return <div key={i} className="px-2 py-1 rounded text-[10px]" style={{ background: colors.bg.overlay, color: colors.text.muted }}>{a.filename}</div>;
              })}
            </div>
          )}
        </div>
      </div>
      {/* Context message below */}
      {context?.after && (
        <div className="flex items-center gap-2 mt-1 pt-1 opacity-50" style={{ borderTop: `1px solid ${colors.border.light}` }}>
          <span className="text-[11px] font-medium" style={{ color: colors.text.disabled }}>{context.after.author_name}:</span>
          <span className="text-[11px] truncate" style={{ color: colors.text.disabled }}>{context.after.content?.slice(0, 60)}</span>
        </div>
      )}
    </button>
  );
}

export default function AdvancedSearch({ onClose, servers, currentUserId, onJumpToMessage }) {
  const [query, setQuery] = useState('');
  const [allMessages, setAllMessages] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filters, setFilters] = useState({});
  const [serverFilter, setServerFilter] = useState('all');
  const [tab, setTab] = useState('all');
  const [savedSearches, setSavedSearches] = useState(() => { try { return JSON.parse(localStorage.getItem('kairo-saved-searches') || '[]'); } catch { return []; } });
  const [recentSearches, setRecentSearches] = useState(() => { try { return JSON.parse(localStorage.getItem('kairo-recent-searches') || '[]'); } catch { return []; } });

  const doSearch = useCallback(async () => {
    if (!query.trim() || query.length < 2) return;
    setSearching(true); setSearched(true);
    // Save recent
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(updated);
    try { localStorage.setItem('kairo-recent-searches', JSON.stringify(updated)); } catch {}

    let msgs = serverFilter === 'all'
      ? await base44.entities.Message.list('-created_date', 300)
      : await base44.entities.Message.filter({ server_id: serverFilter }, '-created_date', 300);
    setAllMessages(msgs.filter(m => !m.is_deleted));
    setSearching(false);
  }, [query, serverFilter]);

  useEffect(() => {
    const t = setTimeout(() => { if (query.length >= 2) doSearch(); else { setSearched(false); setAllMessages([]); } }, 350);
    return () => clearTimeout(t);
  }, [query, doSearch]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    let list = allMessages.filter(m => m.content?.toLowerCase().includes(q) || m.author_name?.toLowerCase().includes(q));
    if (filters.has_image) list = list.filter(m => m.attachments?.some(a => a.content_type?.startsWith('image/')));
    if (filters.has_file) list = list.filter(m => m.attachments?.length > 0);
    if (filters.has_link) list = list.filter(m => m.content?.match(/https?:\/\//));
    if (filters.is_pinned) list = list.filter(m => m.is_pinned);
    if (filters.from_me) list = list.filter(m => m.author_id === currentUserId);
    if (filters.mentions_me) list = list.filter(m => m.mentions?.includes(currentUserId));
    return list.slice(0, 50);
  }, [allMessages, query, filters, currentUserId]);

  // Context: find message before and after each result
  const getContext = (msg) => {
    const idx = allMessages.findIndex(m => m.id === msg.id);
    return { before: idx > 0 ? allMessages[idx - 1] : null, after: idx < allMessages.length - 1 ? allMessages[idx + 1] : null };
  };

  // Tab filtering
  const tabResults = useMemo(() => {
    if (tab === 'all') return results;
    if (tab === 'messages') return results;
    if (tab === 'files') return results.filter(m => m.attachments?.length > 0);
    if (tab === 'links') return results.filter(m => m.content?.match(/https?:\/\//));
    return results;
  }, [results, tab]);

  const toggleSaved = (q) => {
    const has = savedSearches.includes(q);
    const next = has ? savedSearches.filter(s => s !== q) : [...savedSearches, q];
    setSavedSearches(next);
    try { localStorage.setItem('kairo-saved-searches', JSON.stringify(next)); } catch {}
  };

  const toggleFilter = (id) => setFilters(p => ({ ...p, [id]: !p[id] }));

  // Full-screen overlay
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}>
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
          className="w-full max-w-[700px] mx-auto mt-12 flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>

          {/* Search bar */}
          <div className="flex items-center gap-3 px-5 py-4 rounded-t-2xl" style={{ background: colors.bg.surface, borderBottom: `1px solid ${colors.border.default}` }}>
            <Search className="w-5 h-5 flex-shrink-0" style={{ color: colors.text.disabled }} />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search everything..." autoFocus
              className="flex-1 bg-transparent text-[16px] outline-none" style={{ color: colors.text.primary }} />
            {query && (
              <button onClick={() => toggleSaved(query)} title={savedSearches.includes(query) ? 'Remove saved search' : 'Save search'}>
                {savedSearches.includes(query) ? <Star className="w-4 h-4" style={{ color: colors.warning }} /> : <StarOff className="w-4 h-4" style={{ color: colors.text.disabled }} />}
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)]">
              <X className="w-5 h-5" style={{ color: colors.text.muted }} />
            </button>
          </div>

          {/* Filter row */}
          <div className="flex items-center gap-2 px-5 py-2.5 flex-wrap" style={{ background: colors.bg.surface, borderBottom: `1px solid ${colors.border.default}` }}>
            <select value={serverFilter} onChange={e => setServerFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg text-[12px] outline-none" style={{ background: colors.bg.overlay, color: colors.text.secondary, border: `1px solid ${colors.border.default}` }}>
              <option value="all">All Servers</option>
              {(servers || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {FILTER_PILLS.map(f => (
              <button key={f.id} onClick={() => toggleFilter(f.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                style={{ background: filters[f.id] ? colors.accent.subtle : 'transparent', color: filters[f.id] ? colors.accent.primary : colors.text.muted, border: `1px solid ${filters[f.id] ? colors.accent.muted : colors.border.default}` }}>
                <f.icon className="w-3 h-3" /> {f.label}
              </button>
            ))}
          </div>

          {/* Tabs */}
          {searched && (
            <div className="flex gap-1 px-5 py-2" style={{ background: colors.bg.surface, borderBottom: `1px solid ${colors.border.default}` }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
                  style={{ background: tab === t.id ? colors.accent.subtle : 'transparent', color: tab === t.id ? colors.accent.primary : colors.text.muted }}>
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto rounded-b-2xl px-4 py-3 space-y-1.5" style={{ background: colors.bg.elevated }}>
            {searching && (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: colors.border.light, borderTopColor: colors.accent.primary }} />
              </div>
            )}

            {/* No query: show recents and saved */}
            {!query && !searching && (
              <div className="space-y-6 py-4">
                {savedSearches.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: colors.text.disabled }}>
                      <Star className="w-3 h-3 inline mr-1" style={{ color: colors.warning }} />Saved Searches
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {savedSearches.map((s, i) => (
                        <button key={i} onClick={() => setQuery(s)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-[rgba(255,255,255,0.06)]"
                          style={{ background: colors.bg.overlay, color: colors.text.secondary, border: `1px solid ${colors.border.default}` }}>
                          <Star className="w-3 h-3" style={{ color: colors.warning }} /> {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {recentSearches.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: colors.text.disabled }}>Recent</p>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((s, i) => (
                        <button key={i} onClick={() => setQuery(s)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] hover:bg-[rgba(255,255,255,0.06)]"
                          style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                          <Clock className="w-3 h-3 opacity-40" /> {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {savedSearches.length === 0 && recentSearches.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-10 h-10 mx-auto mb-3" style={{ color: colors.text.disabled, opacity: 0.3 }} />
                    <p className="text-[14px]" style={{ color: colors.text.muted }}>Search across all messages, files, and links</p>
                    <p className="text-[12px] mt-1" style={{ color: colors.text.disabled }}>Ctrl+K to open anytime</p>
                  </div>
                )}
              </div>
            )}

            {/* Results */}
            {!searching && searched && tabResults.length > 0 && (
              <>
                <p className="text-[11px] font-semibold px-1 mb-1" style={{ color: colors.text.disabled }}>{tabResults.length} result{tabResults.length !== 1 ? 's' : ''}</p>
                {tabResults.map(msg => (
                  <ResultMessage key={msg.id} msg={msg} onJump={onJumpToMessage} context={getContext(msg)} />
                ))}
              </>
            )}

            {!searching && searched && query && tabResults.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[14px]" style={{ color: colors.text.muted }}>No results for "{query}"</p>
                <p className="text-[12px] mt-1" style={{ color: colors.text.disabled }}>Try a different search or remove some filters</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}