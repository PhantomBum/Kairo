import React from 'react';
import { motion } from 'framer-motion';

function TypingDot({ delay }) {
  return (
    <motion.span
      className="w-1.5 h-1.5 bg-zinc-400 rounded-full"
      animate={{
        y: [0, -4, 0],
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 0.8,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  );
}

export default function TypingIndicator({ users = [] }) {
  if (users.length === 0) return null;

  const names = users.slice(0, 3).map(u => u.name || 'Someone');
  let text = '';

  if (names.length === 1) {
    text = `${names[0]} is typing`;
  } else if (names.length === 2) {
    text = `${names[0]} and ${names[1]} are typing`;
  } else if (names.length === 3) {
    text = `${names[0]}, ${names[1]}, and ${names[2]} are typing`;
  } else {
    text = 'Several people are typing';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-2 px-4 py-1.5 text-sm text-zinc-500"
    >
      <div className="flex items-center gap-1">
        <TypingDot delay={0} />
        <TypingDot delay={0.2} />
        <TypingDot delay={0.4} />
      </div>
      <span>{text}</span>
    </motion.div>
  );
}