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

  return (
    <div className="relative flex items-center justify-center"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      ref={iconRef}
    >
      {/* Kloak: clean solid pill — no glow */}
      <motion.div
        className="absolute -left-0.5 top-1/2 rounded-full"
        initial={false}
        animate={{
          width: active ? 4 : 3,
          height: active ? 28 : hovered ? 16 : unread ? 7 : 0,
          y: '-50%',
          opacity: active || hovered || unread ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
        style={{ background: active ? accentColor : colors.text.primary }}
      />

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
          background: active
            ? accentColor
            : hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${active ? accentColor : colors.border.default}`,
          transition: 'background 0.2s',
        }}
      >
        {children}
      </motion.button>

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