import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Loader2, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { base44 } from '@/api/base44Client';

// Featured GIF categories
const CATEGORIES = [
  { id: 'trending', name: 'Trending', emoji: '🔥' },
  { id: 'reactions', name: 'Reactions', emoji: '😂' },
  { id: 'emotions', name: 'Emotions', emoji: '❤️' },
  { id: 'actions', name: 'Actions', emoji: '👋' },
  { id: 'memes', name: 'Memes', emoji: '🐸' },
  { id: 'anime', name: 'Anime', emoji: '✨' },
];

// Sample GIF data (in production, this would come from Tenor/Giphy API)
const SAMPLE_GIFS = {
  trending: [
    'https://media.giphy.com/media/3o7TKsQ8MzVtMP3kxa/giphy.gif',
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    'https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif',
  ],
  reactions: [
    'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
    'https://media.giphy.com/media/l4FGGafcOHmrlQxG0/giphy.gif',
  ],
  emotions: [
    'https://media.giphy.com/media/3oEjHI8WJv4x6UPDB6/giphy.gif',
  ],
  actions: [
    'https://media.giphy.com/media/Q7ozWVYCR0nyW2rvPW/giphy.gif',
  ],
  memes: [
    'https://media.giphy.com/media/QMHoU66sBXqqLqYvGO/giphy.gif',
  ],
  anime: [
    'https://media.giphy.com/media/IwAZ6dvvvaTtdI8SD5/giphy.gif',
  ],
};

export default function GifPicker({ onSelect, onClose }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('trending');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search for GIFs using AI
  const searchGifs = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setGifs(SAMPLE_GIFS[category] || []);
      return;
    }

    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 6 Giphy GIF URLs related to: "${searchQuery}". Return only valid giphy.com/media URLs in a JSON array.`,
        response_json_schema: {
          type: 'object',
          properties: {
            gifs: { type: 'array', items: { type: 'string' } }
          }
        },
        add_context_from_internet: true
      });
      setGifs(response.gifs || SAMPLE_GIFS.trending);
    } catch (err) {
      setGifs(SAMPLE_GIFS.trending);
    }
    setLoading(false);
  }, [category]);

  useEffect(() => {
    if (!query) {
      setGifs(SAMPLE_GIFS[category] || []);
    }
  }, [category, query]);

  const handleSearch = (e) => {
    e.preventDefault();
    searchGifs(query);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="w-[420px] bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-3 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span className="font-semibold text-white">GIFs</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg">
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
        
        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search GIFs..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500"
          />
        </form>
      </div>

      {/* Categories */}
      <div className="flex gap-1 p-2 border-b border-zinc-800 overflow-x-auto scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
              category === cat.id
                ? "bg-violet-500 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* GIF Grid */}
      <div className="h-[300px] overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {gifs.map((gif, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelect(gif)}
                className="relative aspect-video bg-zinc-800 rounded-xl overflow-hidden group"
              >
                <img
                  src={gif}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-violet-500/0 group-hover:bg-violet-500/20 transition-colors" />
              </motion.button>
            ))}
          </div>
        )}
        
        {!loading && gifs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <Search className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">No GIFs found</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-zinc-800 text-center">
        <span className="text-xs text-zinc-600">Powered by Kairo</span>
      </div>
    </motion.div>
  );
}