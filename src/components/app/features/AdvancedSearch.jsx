import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, X, Image, FileText, Link2, Pin, Clock, Star, StarOff, Hash, User, MessageSquare, Server, AtSign, ArrowLeft, Download, Calendar, Filter, ChevronDown, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', success: '#34d399', danger: '#f87171', warning: '#fbbf24',
};

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

function ResultMessage({ msg, onJump }) {
  return (
    <button onClick={() => onJump?.(msg)} className="w-full text-left p-3 rounded-xl transition-colors hover:bg-[rgba(255,255,255,0.04)] k-fade-in group"
      style={{ background: P.elevated }}>
      <div className="flex items-start gap-2.5">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold overflow-hidden flex-shrink-0 mt-0.5"
          style={{ background: P.base, color: P.muted }}>
          {msg.author_avatar ? <img src={msg.author_avatar} className="w-full h-full object-cover" alt="" /> : (msg.author_name || '?')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[13px] font-semibold" style={{ color: P.textPrimary }}>{msg.author_name}</span>
            <span className="text-[11px]" style={{ color: P.muted }}>
              {new Date(msg.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
            </span>
            {msg.is_pinned && <Pin className="w-3 h-3" style={{ color: P.warning }} />}
          </div>
          <p className="text-[13px] leading-relaxed line-clamp-3 break-words" style={{ color: P.textSecondary }}>{msg.content}</p>
          {msg.attachments?.length > 0 && (
            <div className="flex gap-1.5 mt-1.5">
              {msg.attachments.slice(0, 3).map((a, i) => {
                if (a.content_type?.startsWith('image/')) return <img key={i} src={a.url} className="w-12 h-12 rounded-lg object-cover" alt="" loading="lazy" />;
                return <div key={i} className="px-2 py-1 rounded-lg text-[11px]" style={{ background: P.base, color: P.muted }}><FileText className="w-3 h-3 inline mr-1" />{a.filename}</div>;
              })}
            </div>
          )}
          {msg._channel_name && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <Hash className="w-3 h-3" style={{ color: P.muted }} />
              <span className="text-[11px]" style={{ color: P.muted }}>{msg._channel_name}</span>
              {msg._server_name && <><span className="text-[11px]" style={{ color: P.muted }}>·</span><span className="text-[11px]" style={{ color: P.muted }}>{msg._server_name}</span></>}
            </div>
          )}
        </div>
        <span className="text-[11px] opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-md flex-shrink-0"
          style={{ color: P.accent }}>Jump</span>
      </div>
    </button>
  );
}

function ResultPerson({ person, onMessage, onProfile }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-[rgba(255,255,255,0.04)] k-fade-in"
      style={{ background: P.elevated }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden"
        style={{ background: P.base, color: P.muted }}>
        {person.avatar_url ? <img src={person.avatar_url} className="w-full h-full object-cover" alt="" /> : (person.display_name || 'U').charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold truncate" style={{ color: P.textPrimary }}>{person.display_name || person.username}</p>
        {person.username && <p className="text-[12px] truncate" style={{ color: P.muted }}>@{person.username}</p>}
        {person._mutual_servers > 0 && <p className="text-[11px]" style={{ color: P.muted }}>{person._mutual_servers} mutual server{person._mutual_servers > 1 ? 's' : ''}</p>}
      </div>
      <button onClick={() => onMessage?.(person)}
        className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors hover:brightness-110"
        style={{ background: P.accent, color: '#fff' }}>Message</button>
    </div>
  );
}

function ResultServer({ server, onOpen, isMember }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-[rgba(255,255,255,0.04)] k-fade-in"
      style={{ background: P.elevated }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold overflow-hidden"
        style={{ background: P.base, color: P.muted, borderRadius: 12 }}>
        {server.icon_url ? <img src={server.icon_url} className="w-full h-full object-cover" alt="" /> : (server.name || 'S').charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold truncate" style={{ color: P.textPrimary }}>{server.name}</p>
        <p className="text-[11px]" style={{ color: P.muted }}>{server.member_count || 0} members</p>
      </div>
      <button onClick={() => onOpen?.(server)}
        className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors"
        style={{ background: isMember ? P.elevated : P.success, color: isMember ? P.textSecondary : '#fff', border: isMember ? `1px solid ${P.border}` : 'none' }}>
        {isMember ? 'Open' : 'Join'}
      </button>
    </div>
  );
}

function ResultFile({ attachment, msg, onJump }) {
  const isImage = attachment.content_type?.startsWith('image/');
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl k-fade-in" style={{ background: P.elevated }}>
      {isImage ? (
        <img src={attachment.url} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" alt="" />
      ) : (
        <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: P.base }}>
          <FileText className="w-5 h-5" style={{ color: P.muted }} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium truncate" style={{ color: P.textPrimary }}>{attachment.filename || 'File'}</p>
        <p className="text-[11px]" style={{ color: P.muted }}>
          Shared by {msg.author_name} · {new Date(msg.created_date).toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-1.5">
        <button onClick={() => onJump?.(msg)} className="px-2 py-1 rounded-md text-[11px]" style={{ color: P.accent }}>Jump</button>
        {attachment.url && (
          <a href={attachment.url} download target="_blank" rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)]">
            <Download className="w-4 h-4" style={{ color: P.muted }} />
          </a>
        )}
      </div>
    </div>
  );
}

export default function AdvancedSearch({ onClose, servers, currentUserId, onJumpToMessage }) {
  const [query, setQuery] = useState('');
  const [allMessages, setAllMessages] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [allServers, setAllServers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filters, setFilters] = useState({});
  const [serverFilter, setServerFilter] = useState('all');
  const [tab, setTab] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [savedSearches, setSavedSearches] = useState(() => { try { return JSON.parse(localStorage.getItem('kairo-saved-searches') || '[]'); } catch { return []; } });
  const [recentSearches, setRecentSearches] = useState(() => { try { return JSON.parse(localStorage.getItem('kairo-recent-searches') || '[]'); } catch { return []; } });
  const inputRef = useRef(null);

  const doSearch = useCallback(async () => {
    if (!query.trim() || query.length < 2) return;
    setSearching(true); setSearched(true);
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(updated);
    try { localStorage.setItem('kairo-recent-searches', JSON.stringify(updated)); } catch {}

    try {
      const [msgs, profiles, srvrs] = await Promise.all([
        serverFilter === 'all'
          ? base44.entities.Message.list('-created_date', 500)
          : base44.entities.Message.filter({ server_id: serverFilter }, '-created_date', 500),
        base44.entities.UserProfile.list(),
        base44.entities.Server.list(),
      ]);

      const channelMap = {};
      const serverMap = {};
      (servers || []).forEach(s => { serverMap[s.id] = s.name; });

      const msgList = Array.isArray(msgs) ? msgs : [];
      setAllMessages(msgList.filter(m => !m.is_deleted).map(m => ({
        ...m,
        _server_name: serverMap[m.server_id],
        _channel_name: m.channel_name || channelMap[m.channel_id],
      })));
      setAllProfiles(Array.isArray(profiles) ? profiles : []);
      setAllServers(Array.isArray(srvrs) ? srvrs : []);
    } catch {}
    setSearching(false);
  }, [query, serverFilter, servers]);

  useEffect(() => {
    const t = setTimeout(() => { if (query.length >= 2) doSearch(); else { setSearched(false); } }, 300);
    return () => clearTimeout(t);
  }, [query, doSearch]);

  const q = query.toLowerCase();

  const messageResults = useMemo(() => {
    if (!q) return [];
    let list = allMessages.filter(m => m.content?.toLowerCase().includes(q) || m.author_name?.toLowerCase().includes(q));
    if (filters.has_image) list = list.filter(m => m.attachments?.some(a => a.content_type?.startsWith('image/')));
    if (filters.has_file) list = list.filter(m => m.attachments?.length > 0);
    if (filters.has_link) list = list.filter(m => m.content?.match(/https?:\/\//));
    if (filters.is_pinned) list = list.filter(m => m.is_pinned);
    if (filters.from_me) list = list.filter(m => m.author_id === currentUserId);
    if (filters.mentions_me) list = list.filter(m => m.mentions?.includes(currentUserId) || m.content?.includes(`<@${currentUserId}>`));
    if (dateFrom) list = list.filter(m => new Date(m.created_date) >= new Date(dateFrom));
    if (dateTo) list = list.filter(m => new Date(m.created_date) <= new Date(dateTo + 'T23:59:59'));
    return list.slice(0, 50);
  }, [allMessages, q, filters, currentUserId, dateFrom, dateTo]);

  const peopleResults = useMemo(() => {
    if (!q) return [];
    return allProfiles.filter(p => p.user_id !== currentUserId && (
      p.display_name?.toLowerCase().includes(q) || p.username?.toLowerCase().includes(q)
    )).slice(0, 20);
  }, [allProfiles, q, currentUserId]);

  const serverResults = useMemo(() => {
    if (!q) return [];
    return allServers.filter(s => s.name?.toLowerCase().includes(q)).slice(0, 20);
  }, [allServers, q]);

  const fileResults = useMemo(() => {
    if (!q) return [];
    const files = [];
    (Array.isArray(allMessages) ? allMessages : []).forEach(m => {
      (m.attachments || []).forEach(a => {
        if (a.filename?.toLowerCase().includes(q) || m.content?.toLowerCase().includes(q)) {
          files.push({ attachment: a, msg: m });
        }
      });
    });
    return files.slice(0, 30);
  }, [allMessages, q]);

  const linkResults = useMemo(() => {
    if (!q) return [];
    return messageResults.filter(m => m.content?.match(/https?:\/\//));
  }, [messageResults, q]);

  const memberServerIds = useMemo(() => new Set((servers || []).map(s => s.id)), [servers]);

  const toggleFilter = (id) => setFilters(p => ({ ...p, [id]: !p[id] }));
  const toggleSaved = (sq) => {
    const has = savedSearches.includes(sq);
    const next = has ? savedSearches.filter(s => s !== sq) : [...savedSearches, sq];
    setSavedSearches(next);
    try { localStorage.setItem('kairo-saved-searches', JSON.stringify(next)); } catch {}
  };

  const tabCount = (id) => {
    if (id === 'all') return messageResults.length + peopleResults.length + serverResults.length;
    if (id === 'messages') return messageResults.length;
    if (id === 'people') return peopleResults.length;
    if (id === 'servers') return serverResults.length;
    if (id === 'files') return fileResults.length;
    if (id === 'links') return linkResults.length;
    return 0;
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}>
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-[720px] mx-auto mt-12 flex flex-col max-h-[85vh] rounded-2xl overflow-hidden"
          style={{ background: P.surface, border: `1px solid ${P.border}`, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
          onClick={e => e.stopPropagation()}>

          {/* Search bar */}
          <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: `1px solid ${P.border}` }}>
            <Search className="w-5 h-5 flex-shrink-0" style={{ color: P.muted }} />
            <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search everything..."
              autoFocus className="flex-1 bg-transparent text-[16px] outline-none placeholder:text-[#68677a]"
              style={{ color: P.textPrimary }} />
            {query && (
              <button onClick={() => toggleSaved(query)} title={savedSearches.includes(query) ? 'Unsave search' : 'Save search'}>
                {savedSearches.includes(query) ? <Star className="w-4 h-4" style={{ color: P.warning }} /> : <StarOff className="w-4 h-4" style={{ color: P.muted }} />}
              </button>
            )}
            <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ background: P.elevated, color: P.muted }}>ESC</span>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)]">
              <X className="w-5 h-5" style={{ color: P.muted }} />
            </button>
          </div>

          {/* Filters */}
          <div className="px-5 py-2 flex items-center gap-2 flex-wrap" style={{ borderBottom: `1px solid ${P.border}` }}>
            <select value={serverFilter} onChange={e => setServerFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg text-[12px] outline-none cursor-pointer"
              style={{ background: P.elevated, color: P.textSecondary, border: `1px solid ${P.border}` }}>
              <option value="all">All Servers</option>
              {(servers || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {FILTER_PILLS.map(f => (
              <button key={f.id} onClick={() => toggleFilter(f.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all"
                style={{
                  background: filters[f.id] ? `${P.accent}18` : 'transparent',
                  color: filters[f.id] ? P.accent : P.muted,
                  border: `1px solid ${filters[f.id] ? `${P.accent}40` : P.border}`,
                }}>
                <f.icon className="w-3 h-3" /> {f.label}
              </button>
            ))}
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] transition-colors hover:bg-[rgba(255,255,255,0.04)]"
              style={{ color: P.muted }}>
              <Filter className="w-3 h-3" /> More
            </button>
          </div>

          {/* Date range filters */}
          {showFilters && (
            <div className="px-5 py-2 flex items-center gap-3" style={{ borderBottom: `1px solid ${P.border}` }}>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" style={{ color: P.muted }} />
                <span className="text-[11px]" style={{ color: P.muted }}>From:</span>
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                  className="px-2 py-1 rounded text-[11px] outline-none"
                  style={{ background: P.elevated, color: P.textSecondary, border: `1px solid ${P.border}` }} />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px]" style={{ color: P.muted }}>To:</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                  className="px-2 py-1 rounded text-[11px] outline-none"
                  style={{ background: P.elevated, color: P.textSecondary, border: `1px solid ${P.border}` }} />
              </div>
              {(dateFrom || dateTo) && (
                <button onClick={() => { setDateFrom(''); setDateTo(''); }} className="text-[11px]" style={{ color: P.danger }}>Clear dates</button>
              )}
            </div>
          )}

          {/* Tabs (only when searching) */}
          {searched && (
            <div className="flex gap-1 px-5 py-2" style={{ borderBottom: `1px solid ${P.border}` }}>
              {TABS.map(t => {
                const count = tabCount(t.id);
                return (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
                    style={{ background: tab === t.id ? `${P.accent}14` : 'transparent', color: tab === t.id ? P.textPrimary : P.muted }}>
                    {t.label}{count > 0 && <span className="ml-1 text-[11px] opacity-60">{count}</span>}
                  </button>
                );
              })}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1.5">
            {searching && (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: P.border, borderTopColor: P.accent }} />
              </div>
            )}

            {/* No query: recent + saved */}
            {!query && !searching && (
              <div className="space-y-6 py-4">
                {savedSearches.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-2 px-1 flex items-center gap-1" style={{ color: P.muted }}>
                      <Star className="w-3 h-3" style={{ color: P.warning }} /> Saved Searches
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {savedSearches.map((s, i) => (
                        <button key={i} onClick={() => setQuery(s)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium hover:bg-[rgba(255,255,255,0.06)]"
                          style={{ background: P.elevated, color: P.textSecondary, border: `1px solid ${P.border}` }}>
                          <Star className="w-3 h-3" style={{ color: P.warning }} /> {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {recentSearches.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-2 px-1" style={{ color: P.muted }}>Recent</p>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((s, i) => (
                        <button key={i} onClick={() => setQuery(s)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] hover:bg-[rgba(255,255,255,0.06)]"
                          style={{ background: P.elevated, color: P.muted }}>
                          <Clock className="w-3 h-3 opacity-40" /> {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {savedSearches.length === 0 && recentSearches.length === 0 && (
                  <div className="text-center py-16">
                    <Search className="w-12 h-12 mx-auto mb-3" style={{ color: P.muted, opacity: 0.15 }} />
                    <p className="text-[15px] font-medium mb-1" style={{ color: P.textSecondary }}>Search everything</p>
                    <p className="text-[13px]" style={{ color: P.muted }}>Messages, people, servers, files, and links</p>
                    <p className="text-[11px] mt-2" style={{ color: P.muted }}>Ctrl+K to open anytime</p>
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            {!searching && searched && (tab === 'all' || tab === 'messages') && messageResults.length > 0 && (
              <div>
                {tab === 'all' && <p className="text-[11px] font-bold uppercase tracking-wider px-1 mb-2" style={{ color: P.muted }}>Messages — {messageResults.length}</p>}
                <div className="space-y-1.5">
                  {(tab === 'all' ? messageResults.slice(0, 5) : messageResults).map(msg => (
                    <ResultMessage key={msg.id} msg={msg} onJump={onJumpToMessage} />
                  ))}
                  {tab === 'all' && messageResults.length > 5 && (
                    <button onClick={() => setTab('messages')} className="text-[12px] px-3 py-1.5 rounded-lg" style={{ color: P.accent }}>
                      See all {messageResults.length} messages →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* People */}
            {!searching && searched && (tab === 'all' || tab === 'people') && peopleResults.length > 0 && (
              <div>
                {tab === 'all' && <p className="text-[11px] font-bold uppercase tracking-wider px-1 mb-2 mt-3" style={{ color: P.muted }}>People — {peopleResults.length}</p>}
                <div className="space-y-1.5">
                  {(tab === 'all' ? peopleResults.slice(0, 3) : peopleResults).map(p => (
                    <ResultPerson key={p.id} person={p} />
                  ))}
                  {tab === 'all' && peopleResults.length > 3 && (
                    <button onClick={() => setTab('people')} className="text-[12px] px-3 py-1.5 rounded-lg" style={{ color: P.accent }}>
                      See all {peopleResults.length} people →
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Servers */}
            {!searching && searched && (tab === 'all' || tab === 'servers') && serverResults.length > 0 && (
              <div>
                {tab === 'all' && <p className="text-[11px] font-bold uppercase tracking-wider px-1 mb-2 mt-3" style={{ color: P.muted }}>Servers — {serverResults.length}</p>}
                <div className="space-y-1.5">
                  {(tab === 'all' ? serverResults.slice(0, 3) : serverResults).map(s => (
                    <ResultServer key={s.id} server={s} isMember={memberServerIds.has(s.id)} />
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            {!searching && searched && (tab === 'files') && fileResults.length > 0 && (
              <div className="space-y-1.5">
                {fileResults.map(({ attachment, msg }, i) => (
                  <ResultFile key={`${msg.id}-${i}`} attachment={attachment} msg={msg} onJump={onJumpToMessage} />
                ))}
              </div>
            )}

            {/* Links */}
            {!searching && searched && (tab === 'links') && linkResults.length > 0 && (
              <div className="space-y-1.5">
                {linkResults.map(msg => <ResultMessage key={msg.id} msg={msg} onJump={onJumpToMessage} />)}
              </div>
            )}

            {/* No results */}
            {!searching && searched && query && tabCount(tab) === 0 && (
              <div className="text-center py-16">
                <Search className="w-10 h-10 mx-auto mb-3" style={{ color: P.muted, opacity: 0.15 }} />
                <p className="text-[14px] font-medium mb-1" style={{ color: P.textSecondary }}>No results for "{query}"</p>
                <p className="text-[12px]" style={{ color: P.muted }}>Try a different search or remove some filters</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
