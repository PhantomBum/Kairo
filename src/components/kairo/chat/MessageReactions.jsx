import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Smile } from 'lucide-react';

// Extended emoji picker with categories
const EMOJI_CATEGORIES = {
  recent: ['👍', '❤️', '😂', '🔥', '✨', '🎉', '👀', '💯'],
  smileys: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗'],
  gestures: ['👋', '🤚', '✋', '🖐️', '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👍', '👎', '👊'],
  hearts: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗'],
  symbols: ['⭐', '🌟', '✨', '💫', '🔥', '💥', '💢', '💦', '💨', '🕳️', '💣', '💬', '🗯️', '💭', '💤', '🎵'],
  objects: ['🎉', '🎊', '🎁', '🏆', '🥇', '🎯', '🎮', '🎲', '🎸', '🎹', '🎤', '🎧', '📱', '💻', '⌨️', '🖥️'],
};

const SUPER_REACTIONS = [
  { emoji: '🔥', effect: 'fire', name: 'Fire' },
  { emoji: '💜', effect: 'hearts', name: 'Love' },
  { emoji: '🎉', effect: 'confetti', name: 'Celebrate' },
  { emoji: '⭐', effect: 'stars', name: 'Star' },
  { emoji: '🚀', effect: 'rocket', name: 'Rocket' },
];

export function ReactionBar({ reactions = [], currentUserId, onReact, onSuperReact, className }) {
  const [showPicker, setShowPicker] = useState(false);

  if (reactions.length === 0 && !showPicker) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1 mt-1", className)}>
      {reactions.map((reaction, i) => {
        const hasReacted = reaction.users?.includes(currentUserId);
        const isSuperReaction = SUPER_REACTIONS.some(sr => sr.emoji === reaction.emoji);
        
        return (
          <motion.button
            key={`${reaction.emoji}-${i}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onReact?.(reaction.emoji)}
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all",
              hasReacted
                ? "bg-violet-500/30 border border-violet-500/50 text-violet-300"
                : "bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 hover:bg-zinc-700/50",
              isSuperReaction && hasReacted && "ring-2 ring-violet-500/50 ring-offset-1 ring-offset-zinc-900"
            )}
          >
            <span className={cn(isSuperReaction && "animate-pulse")}>{reaction.emoji}</span>
            <span className="font-medium">{reaction.count}</span>
          </motion.button>
        );
      })}
      
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <button className="p-1 rounded-full bg-zinc-800/30 hover:bg-zinc-700/50 text-zinc-500 hover:text-zinc-300 transition-colors">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 bg-zinc-900 border-zinc-800 rounded-xl" align="start">
          <EmojiPicker 
            onSelect={(emoji) => {
              onReact?.(emoji);
              setShowPicker(false);
            }}
            onSuperReact={(reaction) => {
              onSuperReact?.(reaction);
              setShowPicker(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function EmojiPicker({ onSelect, onSuperReact }) {
  const [activeCategory, setActiveCategory] = useState('recent');

  return (
    <div className="w-full">
      {/* Super Reactions */}
      {onSuperReact && (
        <div className="p-3 border-b border-zinc-800">
          <p className="text-xs text-zinc-500 mb-2 font-medium">✨ Super Reactions</p>
          <div className="flex gap-1">
            {SUPER_REACTIONS.map((sr) => (
              <motion.button
                key={sr.emoji}
                whileHover={{ scale: 1.2, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onSuperReact(sr)}
                className="w-10 h-10 flex items-center justify-center text-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 rounded-xl hover:from-violet-500/30 hover:to-pink-500/30 transition-colors"
                title={sr.name}
              >
                {sr.emoji}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex gap-1 p-2 border-b border-zinc-800 overflow-x-auto scrollbar-none">
        {Object.keys(EMOJI_CATEGORIES).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-2.5 py-1 rounded-lg text-xs capitalize whitespace-nowrap transition-colors",
              activeCategory === cat
                ? "bg-violet-500 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Emoji grid */}
      <div className="p-2 h-48 overflow-y-auto">
        <div className="grid grid-cols-8 gap-1">
          {EMOJI_CATEGORIES[activeCategory].map((emoji) => (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onSelect(emoji)}
              className="w-8 h-8 flex items-center justify-center text-xl hover:bg-zinc-800 rounded-lg transition-colors"
            >
              {emoji}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReactionBar;