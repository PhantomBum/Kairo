import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, X, Sticker, Star, Clock, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Default sticker packs
const DEFAULT_STICKERS = {
  kairo: {
    name: 'Kairo Essentials',
    stickers: [
      { id: 'k1', url: 'https://em-content.zobj.net/source/microsoft-teams/363/waving-hand_1f44b.png', name: 'Wave' },
      { id: 'k2', url: 'https://em-content.zobj.net/source/microsoft-teams/363/thumbs-up_1f44d.png', name: 'Thumbs Up' },
      { id: 'k3', url: 'https://em-content.zobj.net/source/microsoft-teams/363/red-heart_2764-fe0f.png', name: 'Heart' },
      { id: 'k4', url: 'https://em-content.zobj.net/source/microsoft-teams/363/fire_1f525.png', name: 'Fire' },
      { id: 'k5', url: 'https://em-content.zobj.net/source/microsoft-teams/363/party-popper_1f389.png', name: 'Party' },
      { id: 'k6', url: 'https://em-content.zobj.net/source/microsoft-teams/363/sparkles_2728.png', name: 'Sparkles' },
      { id: 'k7', url: 'https://em-content.zobj.net/source/microsoft-teams/363/face-with-tears-of-joy_1f602.png', name: 'LOL' },
      { id: 'k8', url: 'https://em-content.zobj.net/source/microsoft-teams/363/thinking-face_1f914.png', name: 'Think' },
    ]
  },
  animals: {
    name: 'Cute Animals',
    stickers: [
      { id: 'a1', url: 'https://em-content.zobj.net/source/microsoft-teams/363/cat-face_1f431.png', name: 'Cat' },
      { id: 'a2', url: 'https://em-content.zobj.net/source/microsoft-teams/363/dog-face_1f436.png', name: 'Dog' },
      { id: 'a3', url: 'https://em-content.zobj.net/source/microsoft-teams/363/fox_1f98a.png', name: 'Fox' },
      { id: 'a4', url: 'https://em-content.zobj.net/source/microsoft-teams/363/panda_1f43c.png', name: 'Panda' },
      { id: 'a5', url: 'https://em-content.zobj.net/source/microsoft-teams/363/unicorn_1f984.png', name: 'Unicorn' },
      { id: 'a6', url: 'https://em-content.zobj.net/source/microsoft-teams/363/butterfly_1f98b.png', name: 'Butterfly' },
    ]
  },
  food: {
    name: 'Yummy Food',
    stickers: [
      { id: 'f1', url: 'https://em-content.zobj.net/source/microsoft-teams/363/pizza_1f355.png', name: 'Pizza' },
      { id: 'f2', url: 'https://em-content.zobj.net/source/microsoft-teams/363/hamburger_1f354.png', name: 'Burger' },
      { id: 'f3', url: 'https://em-content.zobj.net/source/microsoft-teams/363/hot-beverage_2615.png', name: 'Coffee' },
      { id: 'f4', url: 'https://em-content.zobj.net/source/microsoft-teams/363/ice-cream_1f368.png', name: 'Ice Cream' },
      { id: 'f5', url: 'https://em-content.zobj.net/source/microsoft-teams/363/birthday-cake_1f382.png', name: 'Cake' },
      { id: 'f6', url: 'https://em-content.zobj.net/source/microsoft-teams/363/tropical-drink_1f379.png', name: 'Drink' },
    ]
  }
};

export default function StickerPicker({ serverId, onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const [activePack, setActivePack] = useState('kairo');

  // Fetch server stickers
  const { data: serverStickers = [] } = useQuery({
    queryKey: ['serverStickers', serverId],
    queryFn: () => serverId ? base44.entities.ServerSticker.filter({ server_id: serverId }) : [],
    enabled: !!serverId
  });

  // All sticker packs
  const stickerPacks = {
    ...DEFAULT_STICKERS,
    ...(serverStickers.length > 0 && {
      server: {
        name: 'Server Stickers',
        stickers: serverStickers.map(s => ({ id: s.id, url: s.image_url, name: s.name }))
      }
    })
  };

  // Filter stickers by search
  const filteredStickers = search
    ? Object.values(stickerPacks).flatMap(pack => 
        pack.stickers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
      )
    : stickerPacks[activePack]?.stickers || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="w-[380px] bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="p-3 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sticker className="w-5 h-5 text-pink-400" />
            <span className="font-semibold text-white">Stickers</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded-lg">
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stickers..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-pink-500"
          />
        </div>
      </div>

      {/* Pack tabs */}
      {!search && (
        <div className="flex gap-1 p-2 border-b border-zinc-800 overflow-x-auto scrollbar-none">
          {Object.entries(stickerPacks).map(([id, pack]) => (
            <button
              key={id}
              onClick={() => setActivePack(id)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                activePack === id
                  ? "bg-pink-500 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              )}
            >
              {pack.name}
            </button>
          ))}
        </div>
      )}

      {/* Sticker Grid */}
      <div className="h-[280px] overflow-y-auto p-3">
        <div className="grid grid-cols-4 gap-2">
          {filteredStickers.map((sticker, i) => (
            <motion.button
              key={sticker.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => onSelect(sticker)}
              className="relative aspect-square bg-zinc-800/50 rounded-xl p-2 hover:bg-zinc-700 transition-colors group"
              title={sticker.name}
            >
              <img
                src={sticker.url}
                alt={sticker.name}
                className="w-full h-full object-contain group-hover:scale-110 transition-transform"
              />
            </motion.button>
          ))}
        </div>

        {filteredStickers.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500">
            <Sticker className="w-10 h-10 mb-2 opacity-50" />
            <p className="text-sm">No stickers found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}