import React, { useState, useEffect, useRef } from 'react';
import { Search, Star, X, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors, shadows } from '@/components/app/design/tokens';

const CATEGORIES = ['Trending', 'Reactions', 'Love', 'Funny', 'Sad', 'Hype', 'Agree', 'Disagree', 'Celebrate', 'Awkward'];

export default function GifPicker({ onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kairo-gif-favs') || '[]'); } catch { return []; }
  });
  const [recent, setRecent] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kairo-gif-recent') || '[]'); } catch { return []; }
  });
  const [tab, setTab] = useState('trending');
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const searchTerm = tab === 'favorites' || tab === 'recent' ? null : query || (tab === 'trending' ? 'trending' : tab);
    if (!searchTerm) return;
    setLoading(true);
    base44.integrations.Core.InvokeLLM({
      prompt: `Generate a JSON array of 12 GIF objects for the search term "${searchTerm}". Each object should have: "url" (a realistic-looking GIF URL using https://media.tenor.com/random-id/gif), "title" (short description), "preview" (same as url). Make the URLs look realistic with different random IDs.`,
      response_json_schema: { type: 'object', properties: { gifs: { type: 'array', items: { type: 'object', properties: { url: { type: 'string' }, title: { type: 'string' }, preview: { type: 'string' } } } } } }
    }).then(res => {
      // Since we can't actually call Tenor, we'll use placeholder GIFs
      const placeholders = Array.from({ length: 12 }, (_, i) => ({
        url: `https://media.giphy.com/media/placeholder${i}/giphy.gif`,
        title: `${searchTerm} GIF ${i + 1}`,
        preview: `https://via.placeholder.com/${200 + (i % 3) * 40}x${150 + (i % 4) * 30}/1a1a24/8b5cf6?text=${encodeURIComponent(searchTerm)}`,
      }));
      setGifs(placeholders);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [query, tab]);

  const handleSelect = (gif) => {
    const newRecent = [gif, ...recent.filter(g => g.url !== gif.url)].slice(0, 20);
    setRecent(newRecent);
    try { localStorage.setItem('kairo-gif-recent', JSON.stringify(newRecent)); } catch {}
    onSelect(gif.url);
  };

  const toggleFav = (gif, e) => {
    e.stopPropagation();
    const isFav = favorites.some(f => f.url === gif.url);
    const newFavs = isFav ? favorites.filter(f => f.url !== gif.url) : [gif, ...favorites];
    setFavorites(newFavs);
    try { localStorage.setItem('kairo-gif-favs', JSON.stringify(newFavs)); } catch {}
  };

  const displayGifs = tab === 'favorites' ? favorites : tab === 'recent' ? recent : gifs;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 mx-4 rounded-2xl overflow-hidden k-scale-in z-30"
      style={{ background: colors.bg.modal, border: `1px solid ${colors.border.light}`, boxShadow: shadows.strong, maxHeight: 420 }}>
      <div className="flex items-center justify-between px-3 pt-3 pb-2">
        <span className="text-[13px] font-bold" style={{ color: colors.text.primary }}>GIFs</span>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-[rgba(255,255,255,0.06)]">
          <X className="w-4 h-4" style={{ color: colors.text.muted }} />
        </button>
      </div>
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
          <Search className="w-4 h-4" style={{ color: colors.text.disabled }} />
          <input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setTab('search'); }}
            placeholder="Search GIFs..." className="flex-1 bg-transparent text-[13px] outline-none" style={{ color: colors.text.primary }} />
        </div>
      </div>
      <div className="px-3 pb-2 flex gap-1 overflow-x-auto scrollbar-none">
        {[{ id: 'trending', label: 'Trending', icon: TrendingUp }, { id: 'favorites', label: 'Favorites', icon: Star }, { id: 'recent', label: 'Recent' }].map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setQuery(''); }}
            className="text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 transition-colors"
            style={{ background: tab === t.id ? colors.accent.muted : colors.bg.elevated, color: tab === t.id ? colors.accent.primary : colors.text.muted }}>
            {t.label}
          </button>
        ))}
        {CATEGORIES.filter(c => c !== 'Trending').map(c => (
          <button key={c} onClick={() => { setTab(c.toLowerCase()); setQuery(c); }}
            className="text-[11px] px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 transition-colors"
            style={{ background: tab === c.toLowerCase() ? colors.accent.muted : colors.bg.elevated, color: tab === c.toLowerCase() ? colors.accent.primary : colors.text.muted }}>
            {c}
          </button>
        ))}
      </div>
      <div className="overflow-y-auto scrollbar-none px-3 pb-3" style={{ maxHeight: 260 }}>
        {loading ? (
          <div className="text-center py-8"><div className="w-6 h-6 border-2 rounded-full animate-spin mx-auto" style={{ borderColor: colors.border.light, borderTopColor: colors.accent.primary }} /></div>
        ) : displayGifs.length === 0 ? (
          <div className="text-center py-8"><p className="text-[13px]" style={{ color: colors.text.muted }}>{tab === 'favorites' ? 'No favorites yet' : tab === 'recent' ? 'No recent GIFs' : 'No results'}</p></div>
        ) : (
          <div className="columns-2 gap-2">
            {displayGifs.map((gif, i) => (
              <div key={i} onClick={() => handleSelect(gif)}
                className="relative group mb-2 rounded-lg overflow-hidden cursor-pointer break-inside-avoid hover:ring-2"
                style={{ background: colors.bg.elevated, ringColor: colors.accent.primary }}>
                <img src={gif.preview || gif.url} alt={gif.title} className="w-full object-cover" style={{ minHeight: 80 }} loading="lazy" />
                <button onClick={(e) => toggleFav(gif, e)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.6)' }}>
                  <Star className="w-3 h-3" style={{ color: favorites.some(f => f.url === gif.url) ? colors.warning : '#fff', fill: favorites.some(f => f.url === gif.url) ? colors.warning : 'none' }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}