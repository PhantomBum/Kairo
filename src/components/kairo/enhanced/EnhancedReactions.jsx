import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const commonEmojis = [
  '👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '👀', '💯',
  '✨', '⭐', '💪', '🙏', '👏', '🤔', '😍', '🥳', '😎', '🚀',
  '💀', '🤡', '👻', '💩', '🤝', '💙', '💚', '💜', '🧡', '🤍'
];

export default function EnhancedReactions({ reactions = [], currentUserId, onReact, onRemoveReact }) {
  const [showPicker, setShowPicker] = useState(false);

  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = { emoji: reaction.emoji, users: [], count: 0 };
    }
    acc[reaction.emoji].users.push(...(reaction.users || []));
    acc[reaction.emoji].count += reaction.count || 0;
    return acc;
  }, {});

  const handleReactionClick = (emoji) => {
    const reaction = groupedReactions[emoji];
    const hasReacted = reaction?.users?.includes(currentUserId);
    
    if (hasReacted) {
      onRemoveReact?.(emoji);
    } else {
      onReact?.(emoji);
    }
  };

  return (
    <div className="flex items-center gap-1 flex-wrap mt-1">
      <AnimatePresence>
        {Object.values(groupedReactions).map((reaction) => {
          const hasReacted = reaction.users?.includes(currentUserId);
          
          return (
            <motion.button
              key={reaction.emoji}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleReactionClick(reaction.emoji)}
              className={cn(
                "px-2 py-1 rounded-full border transition-all text-sm flex items-center gap-1",
                hasReacted 
                  ? "bg-indigo-500/20 border-indigo-500/50 text-white" 
                  : "bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600"
              )}
            >
              <span>{reaction.emoji}</span>
              <span className="text-xs font-medium">{reaction.count}</span>
            </motion.button>
          );
        })}
      </AnimatePresence>

      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-1.5 rounded-full bg-zinc-800/50 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 transition-all text-zinc-400 hover:text-white"
          >
            <Smile className="w-3.5 h-3.5" />
          </motion.button>
        </PopoverTrigger>
        <PopoverContent className="w-64 bg-zinc-900 border-zinc-800 p-3">
          <div className="grid grid-cols-5 gap-2">
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact?.(emoji);
                  setShowPicker(false);
                }}
                className="text-2xl hover:bg-zinc-800 rounded p-2 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}