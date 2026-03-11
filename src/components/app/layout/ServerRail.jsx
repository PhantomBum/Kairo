import React, { useState } from 'react';
import { Home, Plus, Compass, Crown, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function RailIcon({ active, onClick, tooltip, badge, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="relative flex items-center justify-center group" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <AnimatePresence>
        {(active || hovered) && (
          <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} exit={{ scaleY: 0 }}
            className="absolute left-0 w-[3px] rounded-r-full"
            style={{ height: active ? 28 : 16, background: 'var(--text-cream)', transformOrigin: 'center' }} />
        )}
      </AnimatePresence>
      <button onClick={onClick}
        className="relative transition-all duration-200"
        style={{
          width: 44, height: 44,
          borderRadius: active || hovered ? 14 : 22,
          background: active ? 'var(--bg-glass-strong)' : 'var(--bg-glass)',
          border: `1px solid ${active ? 'var(--border-light)' : 'var(--border)'}`,
          backdropFilter: 'blur(12px)',
          boxShadow: active ? '0 0 20px rgba(232,228,217,0.04)' : 'none',
        }}>
        {children}
        {badge > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center"
            style={{ background: 'var(--accent-red)', color: '#fff' }}>{badge > 9 ? '9+' : badge}</div>
        )}
      </button>
      <AnimatePresence>
        {hovered && tooltip && (
          <motion.div initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -4 }}
            className="absolute left-[62px] z-50 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-cream)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
            {tooltip}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ServerDivider() {
  return <div className="w-8 h-px my-0.5" style={{ background: 'var(--border)' }} />;
}

export default function ServerRail({ servers, activeServerId, onServerSelect, onHomeClick, onCreateServer, onDiscover, onElite, isHome, badge }) {
  return (
    <div className="w-[68px] flex-shrink-0 flex flex-col items-center py-3 gap-2 overflow-y-auto scrollbar-none"
      style={{ background: 'var(--bg-deep)' }}>
      {/* Home */}
      <RailIcon active={isHome} onClick={onHomeClick} tooltip="Home" badge={badge}>
        <Home className="w-[18px] h-[18px]" style={{ color: isHome ? 'var(--text-cream)' : 'var(--text-muted)' }} />
      </RailIcon>

      <ServerDivider />

      {/* Servers */}
      {servers.map(s => (
        <RailIcon key={s.id} active={activeServerId === s.id} onClick={() => onServerSelect(s)} tooltip={s.name}>
          {s.icon_url ? (
            <img src={s.icon_url} className="w-full h-full rounded-[inherit] object-cover" />
          ) : (
            <span className="text-[13px] font-semibold" style={{ color: activeServerId === s.id ? 'var(--text-cream)' : 'var(--text-secondary)', fontFamily: 'monospace' }}>
              {s.name?.slice(0, 2).toUpperCase()}
            </span>
          )}
        </RailIcon>
      ))}

      <ServerDivider />

      <RailIcon onClick={onCreateServer} tooltip="Create Server">
        <Plus className="w-[18px] h-[18px]" style={{ color: 'var(--accent-green)' }} />
      </RailIcon>
      <RailIcon onClick={onDiscover} tooltip="Join Server">
        <Compass className="w-[18px] h-[18px]" style={{ color: 'var(--accent-blue)' }} />
      </RailIcon>

      <ServerDivider />

      <RailIcon onClick={onElite} tooltip="Kairo Elite">
        <Crown className="w-[18px] h-[18px]" style={{ color: 'var(--accent-amber)' }} />
      </RailIcon>
    </div>
  );
}