import React, { useState } from 'react';
import { Home, Plus, Compass, Crown, LogOut, Copy, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { colors, radius, shadows, animation } from '@/components/app/design/tokens';

function RailTooltip({ text, visible }) {
  return (
    <AnimatePresence>
      {visible && text && (
        <motion.div
          initial={{ opacity: 0, x: -6, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -6, scale: 0.95 }}
          transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
          className="absolute left-[64px] z-50 px-3 py-1.5 rounded-lg text-[13px] font-semibold whitespace-nowrap pointer-events-none"
          style={{ background: colors.bg.modal, color: colors.text.primary, boxShadow: shadows.medium }}>
          {text}
          <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rotate-45" style={{ background: colors.bg.modal }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RailIcon({ active, unread, onClick, tooltip, badge, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="relative flex items-center justify-center" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {/* Active/hover pill indicator */}
      <motion.div
        className="absolute left-0 w-[4px] rounded-r-full"
        initial={false}
        animate={{
          height: active ? 36 : hovered ? 20 : unread ? 8 : 0,
          opacity: active || hovered || unread ? 1 : 0,
        }}
        transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        style={{ background: colors.text.primary }} />

      <button onClick={onClick}
        className="relative overflow-hidden flex items-center justify-center"
        style={{
          width: 48, height: 48,
          borderRadius: active || hovered ? radius.lg : radius.pill,
          background: active ? colors.accent.primary : colors.bg.elevated,
          transition: 'border-radius 0.25s cubic-bezier(0.4,0,0.2,1), background 0.25s',
        }}>
        {children}
        {badge > 0 && (
          <div className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold flex items-center justify-center"
            style={{ background: colors.danger, color: '#fff', border: `3px solid ${colors.bg.base}` }}>
            {badge > 99 ? '99+' : badge}
          </div>
        )}
      </button>

      <RailTooltip text={tooltip} visible={hovered} />
    </div>
  );
}

function ServerDivider() {
  return <div className="w-8 h-[2px] rounded-full my-1" style={{ background: colors.border.light }} />;
}

export default function ServerRailWithContext({ servers, activeServerId, onServerSelect, onHomeClick, onCreateServer, onDiscover, onElite, onLeaveServer, isHome, badge }) {
  return (
    <div className="w-[72px] flex-shrink-0 flex flex-col items-center py-3 gap-2 overflow-y-auto scrollbar-none"
      style={{ background: colors.bg.base }}
      role="navigation" aria-label="Server list">

      {/* Home */}
      <ContextMenu>
        <ContextMenuTrigger>
          <div><RailIcon active={isHome} onClick={onHomeClick} tooltip="Direct Messages" badge={badge}>
            <Home className="w-6 h-6" style={{ color: isHome ? colors.text.primary : colors.text.muted }} />
          </RailIcon></div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52 p-1.5 rounded-lg" style={{ background: colors.bg.modal, border: `1px solid ${colors.border.light}`, boxShadow: shadows.strong }}>
          <ContextMenuItem onClick={onCreateServer} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}>
            <Plus className="w-4 h-4 opacity-60" /> Create Server
          </ContextMenuItem>
          <ContextMenuItem onClick={onDiscover} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}>
            <Compass className="w-4 h-4 opacity-60" /> Join Server
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <ServerDivider />

      {/* Servers */}
      {servers.map(s => (
        <ContextMenu key={s.id}>
          <ContextMenuTrigger>
            <div><RailIcon active={activeServerId === s.id} onClick={() => onServerSelect(s)} tooltip={s.name}>
              {s.icon_url ? (
                <img src={s.icon_url} className="w-full h-full object-cover" style={{ borderRadius: 'inherit' }} alt={s.name} />
              ) : (
                <span className="text-[15px] font-semibold select-none" style={{ color: activeServerId === s.id ? '#fff' : colors.text.secondary }}>
                  {s.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              )}
            </RailIcon></div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-52 p-1.5 rounded-lg" style={{ background: colors.bg.modal, border: `1px solid ${colors.border.light}`, boxShadow: shadows.strong }}>
            <ContextMenuItem onClick={() => onServerSelect(s)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}>
              <Settings className="w-4 h-4 opacity-60" /> Server Settings
            </ContextMenuItem>
            <ContextMenuItem onClick={() => navigator.clipboard.writeText(s.invite_code || '')} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}>
              <Copy className="w-4 h-4 opacity-60" /> Copy Invite Code
            </ContextMenuItem>
            <ContextMenuSeparator style={{ background: colors.border.light, margin: '4px 0' }} />
            <ContextMenuItem onClick={() => onLeaveServer?.(s)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.danger }}>
              <LogOut className="w-4 h-4 opacity-60" /> Leave Server
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}

      <ServerDivider />

      <RailIcon onClick={onCreateServer} tooltip="Add a Server">
        <Plus className="w-5 h-5" style={{ color: colors.success }} />
      </RailIcon>
      <RailIcon onClick={onDiscover} tooltip="Explore Servers">
        <Compass className="w-5 h-5" style={{ color: colors.success }} />
      </RailIcon>

      <div className="flex-1" />

      <RailIcon onClick={onElite} tooltip="Kairo Elite">
        <Crown className="w-5 h-5" style={{ color: colors.warning }} />
      </RailIcon>
    </div>
  );
}