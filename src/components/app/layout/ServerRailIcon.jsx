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
          width: 3,
          height: active ? 32 : hovered ? 16 : unread ? 6 : 0,
          opacity: active || hovered || unread ? 1 : 0,
        }}
        transition={{ duration: 0.12, ease: 'easeOut' }}
        style={{ background: colors.text.primary, left: -8, top: '50%', transform: 'translateY(-50%)' }}
      />

      <motion.button
        onClick={onClick}
        className="relative overflow-hidden flex items-center justify-center"
        whileTap={{ scale: 0.94 }}
        style={{
          width: 40, height: 40,
          borderRadius: active || hovered ? 12 : 20,
          background: active ? (server?.banner_color || colors.accent.primary) : hovered ? 'rgba(88,101,242,0.15)' : colors.bg.surface,
          transition: 'border-radius 120ms ease, background 120ms ease',
        }}
      >
        {children}
      </motion.button>

      {server && <ServerHoverCard server={server} visible={showCard} anchorRect={anchorRect} />}
    </div>
  );
}