import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Volume2, VolumeX, Play, Square, Upload, Trash2, Star, 
  Music, Zap, Laugh, AlertCircle, Heart, Sparkles, X 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Slider } from '@/components/ui/slider';

// Default sound effects
const DEFAULT_SOUNDS = [
  { id: 'airhorn', name: 'Air Horn', emoji: '📯', category: 'memes', url: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==' },
  { id: 'sad', name: 'Sad Trombone', emoji: '🎺', category: 'memes' },
  { id: 'applause', name: 'Applause', emoji: '👏', category: 'reactions' },
  { id: 'drumroll', name: 'Drum Roll', emoji: '🥁', category: 'effects' },
  { id: 'tada', name: 'Ta-da!', emoji: '🎉', category: 'reactions' },
  { id: 'crickets', name: 'Crickets', emoji: '🦗', category: 'memes' },
  { id: 'laugh', name: 'Laugh Track', emoji: '😂', category: 'reactions' },
  { id: 'suspense', name: 'Suspense', emoji: '😰', category: 'effects' },
  { id: 'victory', name: 'Victory', emoji: '🏆', category: 'effects' },
  { id: 'fail', name: 'Fail', emoji: '💀', category: 'memes' },
  { id: 'wow', name: 'Wow', emoji: '😮', category: 'reactions' },
  { id: 'bruh', name: 'Bruh', emoji: '😐', category: 'memes' },
];

const CATEGORIES = [
  { id: 'all', name: 'All', icon: Music },
  { id: 'favorites', name: 'Favorites', icon: Star },
  { id: 'memes', name: 'Memes', icon: Zap },
  { id: 'reactions', name: 'Reactions', icon: Laugh },
  { id: 'effects', name: 'Effects', icon: Sparkles },
];

export default function Soundboard({ isOpen, onClose, onPlaySound }) {
  const [sounds, setSounds] = useState(DEFAULT_SOUNDS);
  const [favorites, setFavorites] = useState([]);
  const [category, setCategory] = useState('all');
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(new Audio());

  const toggleFavorite = (soundId) => {
    setFavorites(prev => 
      prev.includes(soundId) 
        ? prev.filter(id => id !== soundId)
        : [...prev, soundId]
    );
  };

  const playSound = (sound) => {
    if (isMuted) return;
    
    // Stop any currently playing sound
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    
    setPlayingId(sound.id);
    
    // Simulate playing (in production, this would play actual audio)
    onPlaySound?.(sound);
    
    // Reset after "playing"
    setTimeout(() => setPlayingId(null), 1500);
  };

  const filteredSounds = sounds.filter(sound => {
    if (category === 'all') return true;
    if (category === 'favorites') return favorites.includes(sound.id);
    return sound.category === category;
  });

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl mx-4 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Soundboard</h2>
              <p className="text-xs text-zinc-500">Play sounds in voice chat</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Volume control */}
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              isMuted ? "bg-red-500/20 text-red-400" : "bg-zinc-800 text-zinc-400 hover:text-white"
            )}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <Slider
            value={[volume]}
            onValueChange={([val]) => setVolume(val)}
            max={100}
            step={1}
            className="flex-1"
            disabled={isMuted}
          />
          <span className="text-sm text-zinc-400 w-12 text-right">{volume}%</span>
        </div>

        {/* Categories */}
        <div className="flex gap-1 p-2 border-b border-zinc-800 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
                  category === cat.id
                    ? "bg-violet-500 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                )}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Sound grid */}
        <div className="p-4 h-[300px] overflow-y-auto">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {filteredSounds.map((sound) => {
              const isPlaying = playingId === sound.id;
              const isFavorite = favorites.includes(sound.id);
              
              return (
                <motion.button
                  key={sound.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => playSound(sound)}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                    isPlaying
                      ? "border-violet-500 bg-violet-500/20"
                      : "border-zinc-800 bg-zinc-800/50 hover:border-zinc-700"
                  )}
                >
                  <span className="text-2xl">{sound.emoji}</span>
                  <span className="text-xs text-zinc-300 truncate w-full text-center">
                    {sound.name}
                  </span>
                  
                  {isPlaying && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 flex items-center justify-center bg-violet-500/30 rounded-xl"
                    >
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [8, 16, 8] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                            className="w-1 bg-violet-400 rounded-full"
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(sound.id);
                    }}
                    className="absolute top-1 right-1 p-1 rounded-lg hover:bg-zinc-700/50 transition-colors"
                  >
                    <Star 
                      className={cn(
                        "w-3.5 h-3.5",
                        isFavorite ? "text-yellow-400 fill-yellow-400" : "text-zinc-600"
                      )} 
                    />
                  </button>
                </motion.button>
              );
            })}
          </div>

          {filteredSounds.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
              <Music className="w-12 h-12 mb-3 opacity-50" />
              <p>No sounds in this category</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            {filteredSounds.length} sounds • {favorites.length} favorites
          </span>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors">
            <Upload className="w-4 h-4" />
            Upload Sound
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}