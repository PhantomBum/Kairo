import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function TypingIndicator({ typingUsers = [], className }) {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].user_name} is typing`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].user_name} and ${typingUsers[1].user_name} are typing`;
    } else if (typingUsers.length === 3) {
      return `${typingUsers[0].user_name}, ${typingUsers[1].user_name}, and ${typingUsers[2].user_name} are typing`;
    } else {
      return `${typingUsers.length} people are typing`;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={cn(
          "flex items-center gap-2 px-4 py-1 text-sm text-zinc-400",
          className
        )}
      >
        {/* Animated dots */}
        <div className="flex items-center gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-zinc-500"
              animate={{
                y: [0, -4, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>

        <span>{getTypingText()}</span>
      </motion.div>
    </AnimatePresence>
  );
}