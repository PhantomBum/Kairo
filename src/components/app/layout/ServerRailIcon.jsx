import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ServerHoverCard from './ServerHoverCard';
import { colors, radius } from '@/components/app/design/tokens';

const P = {
  base: colors.bg.base,
  floating: colors.bg.float,
  border: colors.border.subtle,
  textPrimary: colors.text.primary,
  accent: colors.accent.primary,
  accentGlow: colors.accent.glow,
};

export default function ServerRailIcon({ server, active, unread, badge, onClick, children }) {
  const [hovered, setHovered] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const cardTimer = useRef(null);
  const tooltipTimer = useRef(null);
  const iconRef = useRef(null);

  const handleEnter = useCallback(() => {
    setHovered(true);
    tooltipTimer.current = setTimeout(() => setShowTooltip(true), 80);
    if (server) {
      cardTimer.current = setTimeout(() => {
        if (iconRef.current) setAnchorRect(iconRef.current.getBoundingClientRect());
        setShowCard(true);
        setShowTooltip(false);
      }, 600);
    }
  }, [server]);

  const handleLeave = useCallback(() => {
    setHovered(false);
    setShowTooltip(false);
    clearTimeout(cardTimer.current);
    clearTimeout(tooltipTimer.current);
    setShowCard(false);
  }, []);

  useEffect(() => {
    return () => { clearTimeout(cardTimer.current); clearTimeout(tooltipTimer.current); };
  }, []);

  const pillHeight = active ? 36 : hovered ? 20 : 0;
  const pillOpacity = active || hovered ? 1 : 0;

  return (
    <div className="relative flex items-center justify-center"
      onMouseEnter={handleEnter} onMouseLeave={handleLeave} ref={iconRef}>

      {/* Left pill indicator — 4px wide, 36px tall when active, flat left rounded right */}
      <motion.div
        className="absolute"
        initial={false}
        animate={{ width: 4, height: pillHeight, opacity: pillOpacity }}
        transition={{ type: 'spring', stiffness: 400, damping: 30, duration: 0.15 }}
        style={{
          background: active ? P.accent : '#fff',
          left: -4,
          top: '50%',
          transform: 'translateY(-50%)',
          borderRadius: '0 6px 6px 0',
        }}
      />

      {/* Squircle icon — 48px per spec, 16px radius, morphs to full round on hover */}
      <motion.button
        onClick={onClick}
        className="relative overflow-hidden flex items-center justify-center"
        animate={{
          scale: hovered && !active ? 1.06 : 1,
          borderRadius: hovered ? '9999px' : radius.server,
        }}
        whileTap={{ scale: 0.93 }}
        transition={{ scale: { duration: 0.12, ease: [0, 0, 0.2, 1] }, borderRadius: { duration: 0.12, ease: [0, 0, 0.2, 1] } }}
        style={{
          width: 48, height: 48,
          background: active ? P.accent : hovered ? 'var(--accent-dim)' : 'var(--bg-elevated)',
          boxShadow: active ? 'inset 0 0 0 1px rgba(0,0,0,0.1), 0 0 12px var(--accent-glow)' : hovered && !active ? 'var(--shadow-glow-sm)' : 'none',
          transition: 'background 200ms ease, box-shadow 200ms ease',
        }}
      >
        {children}

        {/* Unread indicator — 8px circle, bottom left, outside icon */}
        {unread && !active && (
          <div className="absolute -bottom-0.5 -left-0.5 w-2 h-2 rounded-full" style={{ background: '#fff', border: `2px solid var(--bg-base)` }} />
        )}

        {/* Ping badge — 16x16 min, 22x16 pill for 2+ digits, bottom right */}
        {badge > 0 && (
          <div
            className="absolute -bottom-0.5 -right-0.5 h-4 rounded-full text-[10px] font-bold flex items-center justify-center px-1"
            style={{
              background: '#f04747',
              color: '#fff',
              border: `2px solid var(--bg-base)`,
              minWidth: 16,
              width: badge > 9 ? 22 : 16,
            }}>
            {badge > 99 ? '99+' : badge}
          </div>
        )}
      </motion.button>

      {/* Tooltip (quick, before hover card shows) */}
      <AnimatePresence>
        {showTooltip && hovered && !active && !showCard && server && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            className="absolute left-[62px] z-[100] px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap pointer-events-none max-w-[200px] truncate"
            style={{
              background: P.floating, color: P.textPrimary,
              border: `1px solid ${P.border}`,
              borderRadius: radius.md,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
            {server.name}
            <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45"
              style={{ background: P.floating, borderLeft: `1px solid ${P.border}`, borderBottom: `1px solid ${P.border}` }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rich hover card (after 600ms) */}
      {server && <ServerHoverCard server={server} visible={showCard} anchorRect={anchorRect} />}
    </div>
  );
}
