import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { colors, radius, shadows, glass } from '@/components/app/design/tokens';
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
      {/* Kairo: floating glow indicator */}
      <motion.div
        className="absolute -left-0.5 top-1/2 rounded-full"
        initial={false}
        animate={{
          width: active ? 4 : 3,
          height: active ? 28 : hovered ? 14 : unread ? 6 : 0,
          y: '-50%',
          opacity: active || hovered || unread ? 1 : 0,
          boxShadow: active ? `0 0 8px ${accentColor}` : 'none',
        }}
        transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
        style={{ background: active ? accentColor : colors.text.primary }}
      />

      {/* Glass icon button */}
      <motion.button
        onClick={onClick}
        className="relative overflow-hidden flex items-center justify-center"
        animate={{
          scale: hovered && !active ? 1.06 : 1,
          borderRadius: active ? 14 : hovered ? 16 : 22,
        }}
        transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
        style={{
          width: 48,
          height: 48,
          ...glass.rail,
          background: active
            ? `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`
            : hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
          boxShadow: active
            ? `0 0 16px ${accentColor}40, ${shadows.subtle}`
            : hasGlow ? shadows.glow : 'none',
          transition: 'background 0.2s, box-shadow 0.25s',
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