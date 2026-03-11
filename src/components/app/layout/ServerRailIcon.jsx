import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { colors, radius } from '@/components/app/design/tokens';
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
        if (iconRef.current) {
          setAnchorRect(iconRef.current.getBoundingClientRect());
        }
        setShowCard(true);
      }, 600);
    }
  }, [server]);

  const handleLeave = useCallback(() => {
    setHovered(false);
    clearTimeout(timerRef.current);
    setShowCard(false);
  }, []);

  const accentColor = server?.banner_color || colors.accent.primary;
  const hasGlow = active || hovered;

  return (
    <div className="relative flex items-center justify-center"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      ref={iconRef}
    >
      {/* Left indicator pill */}
      <motion.div
        className="absolute left-0 top-1/2 w-[3px] rounded-r-full"
        initial={false}
        animate={{
          height: active ? 32 : hovered ? 20 : unread ? 8 : 0,
          y: '-50%',
          opacity: active || hovered || unread ? 1 : 0,
        }}
        transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        style={{ background: colors.text.primary }}
      />

      {/* Icon button */}
      <motion.button
        onClick={onClick}
        className="relative overflow-hidden flex items-center justify-center"
        animate={{
          scale: hovered ? 1.08 : 1,
          borderRadius: active || hovered ? 16 : 24,
        }}
        transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
        style={{
          width: 48,
          height: 48,
          background: active ? colors.accent.primary : colors.bg.elevated,
          boxShadow: hasGlow
            ? `0 0 ${active ? 16 : 12}px ${accentColor}${active ? '40' : '25'}`
            : 'none',
        }}
      >
        {children}
      </motion.button>

      {/* Hover card */}
      {server && (
        <ServerHoverCard
          server={server}
          visible={showCard}
          anchorRect={anchorRect}
        />
      )}
    </div>
  );
}