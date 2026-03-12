import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { colors } from '@/components/app/design/tokens';
import ServerHoverCard from './ServerHoverCard';

export default function ServerRailIcon({ server, active, unread, onClick, children }) {
  const [hovered, setHovered] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const timerRef = useRef(null);
  const iconRef = useRef(null);

  const handleEnter = useCallback(() => {
    setHovered(true);
    if (server) {
      timerRef.current = setTimeout(() => {
        if (iconRef.current) setAnchorRect(iconRef.current.getBoundingClientRect());
        setShowCard(true);
      }, 600);
    }
  }, [server]);

  const handleLeave = useCallback(() => {
    setHovered(false);
    clearTimeout(timerRef.current);
    setShowCard(false);
  }, []);

  return (
    <div className="relative flex items-center justify-center"
      onMouseEnter={handleEnter} onMouseLeave={handleLeave} ref={iconRef}>
      {/* Pill indicator */}
      <motion.div
        className="absolute rounded-r-full"
        initial={false}
        animate={{
          width: 4,
          height: active ? 40 : hovered ? 20 : unread ? 8 : 0,
          opacity: active || hovered || unread ? 1 : 0,
        }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        style={{ background: '#fff', left: -12, top: '50%', transform: 'translateY(-50%)' }}
      />

      <motion.button
        onClick={onClick}
        className="relative overflow-hidden flex items-center justify-center"
        whileTap={{ scale: 0.92 }}
        style={{
          width: 48, height: 48,
          borderRadius: active || hovered ? 16 : 24,
          background: active ? (server?.banner_color || colors.accent.primary) : hovered ? (server?.banner_color || colors.accent.primary) : colors.bg.elevated,
          transition: 'border-radius 150ms ease, background 150ms ease',
        }}
      >
        {children}
      </motion.button>

      {server && <ServerHoverCard server={server} visible={showCard} anchorRect={anchorRect} />}
    </div>
  );
}