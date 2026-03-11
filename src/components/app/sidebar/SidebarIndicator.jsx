import React from 'react';
import { motion } from 'framer-motion';
import { colors } from '@/components/app/design/tokens';

// Left pill indicator: full height glow for active, short pill for hovered, tiny dot for unread
export default function SidebarIndicator({ active, hovered, unread }) {
  const height = active ? 36 : hovered ? 18 : unread ? 8 : 0;
  const opacity = active || hovered || unread ? 1 : 0;

  return (
    <motion.div
      className="absolute left-0 top-1/2 w-[4px] rounded-r-full"
      initial={false}
      animate={{
        height,
        y: '-50%',
        opacity,
        boxShadow: active ? `0 0 8px ${colors.accent.primary}60` : 'none',
      }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      style={{ background: active ? colors.accent.primary : colors.text.primary }}
    />
  );
}