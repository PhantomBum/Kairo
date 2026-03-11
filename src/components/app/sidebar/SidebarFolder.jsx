import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { colors, shadows } from '@/components/app/design/tokens';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { Pencil, Trash2, CheckCheck } from 'lucide-react';
import SquircleIcon, { getInitials, letterGradient } from './SquircleIcon';
import SidebarTooltip from './SidebarTooltip';
import SidebarIndicator from './SidebarIndicator';

function MiniGrid({ servers }) {
  // Show up to 4 server icons in a 2x2 grid inside the folder squircle
  const items = servers.slice(0, 4);
  const gap = 2;
  const cellSize = 18;

  return (
    <div className="grid grid-cols-2 gap-[2px]" style={{ width: cellSize * 2 + gap, height: cellSize * 2 + gap }}>
      {items.map(s => (
        <div key={s.id} className="overflow-hidden" style={{ width: cellSize, height: cellSize, borderRadius: 4 }}>
          {s.icon_url ? (
            <img src={s.icon_url} className="w-full h-full object-cover" alt="" loading="eager" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[8px] font-bold" style={{ background: letterGradient(s.name), color: '#fff' }}>
              {getInitials(s.name).charAt(0)}
            </div>
          )}
        </div>
      ))}
      {/* Fill empty slots */}
      {Array.from({ length: Math.max(0, 4 - items.length) }).map((_, i) => (
        <div key={`empty-${i}`} className="rounded" style={{ width: cellSize, height: cellSize, background: 'rgba(255,255,255,0.05)' }} />
      ))}
    </div>
  );
}

export default function SidebarFolder({ folder, servers, activeServerId, onServerSelect, onRename, onDelete, onMarkRead, currentUserServers }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const panelRef = useRef(null);

  // Filter to only accessible servers
  const accessibleIds = new Set((currentUserServers || servers).map(s => s.id));
  const folderServers = servers.filter(s => folder.server_ids?.includes(s.id) && accessibleIds.has(s.id));
  const isActive = folderServers.some(s => s.id === activeServerId);
  const totalBadge = 0; // Could aggregate unread pings here

  // Close folder when clicking outside
  useEffect(() => {
    if (!expanded) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [expanded]);

  return (
    <div className="relative flex items-center justify-center" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <SidebarIndicator active={isActive && !expanded} hovered={hovered} unread={false} />

      <ContextMenu>
        <ContextMenuTrigger>
          <button
            onClick={() => setExpanded(!expanded)}
            className="relative flex items-center justify-center overflow-hidden flex-shrink-0"
            style={{
              width: 48,
              height: 48,
              borderRadius: expanded || hovered ? '24%' : '28%',
              background: `linear-gradient(135deg, ${folder.color || colors.accent.primary}20, ${folder.color || colors.accent.primary}08)`,
              border: `2px solid ${isActive ? (folder.color || colors.accent.primary) + '60' : 'rgba(255,255,255,0.06)'}`,
              transition: 'border-radius 200ms cubic-bezier(0.4,0,0.2,1), border-color 200ms cubic-bezier(0.4,0,0.2,1), background 200ms',
            }}
          >
            <MiniGrid servers={folderServers} />
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52 p-1.5 rounded-lg" style={{ background: colors.bg.modal, border: `1px solid ${colors.border.light}`, boxShadow: shadows.strong }}>
          <ContextMenuItem onClick={onRename} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}>
            <Pencil className="w-4 h-4 opacity-60" /> Rename Folder
          </ContextMenuItem>
          <ContextMenuItem onClick={onMarkRead} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}>
            <CheckCheck className="w-4 h-4 opacity-60" /> Mark All as Read
          </ContextMenuItem>
          <ContextMenuSeparator style={{ background: colors.border.light, margin: '4px 0' }} />
          <ContextMenuItem onClick={onDelete} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.danger }}>
            <Trash2 className="w-4 h-4 opacity-60" /> Remove Folder
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {totalBadge > 0 && (
        <div className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold flex items-center justify-center z-10"
          style={{ background: colors.danger, color: '#fff', border: `3px solid ${colors.bg.base}` }}>
          {totalBadge > 99 ? '99+' : totalBadge}
        </div>
      )}

      <SidebarTooltip text={`${folder.name} (${folderServers.length})`} visible={hovered && !expanded} />

      {/* Expanded folder panel */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.9, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -8 }}
            transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
            className="absolute left-[64px] z-[60] p-2.5 rounded-xl"
            style={{
              background: colors.bg.modal,
              border: `1px solid ${colors.border.light}`,
              boxShadow: shadows.strong,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider px-1 mb-2" style={{ color: folder.color || colors.text.muted }}>
              {folder.name}
            </div>
            <div className="flex flex-wrap gap-2" style={{ maxWidth: 168 }}>
              {folderServers.map(s => (
                <SquircleIcon
                  key={s.id}
                  active={activeServerId === s.id}
                  hovered={false}
                  imageUrl={s.icon_url}
                  name={s.name}
                  size={44}
                  onClick={() => { onServerSelect(s); /* Keep folder open so user sees selection */ }}
                />
              ))}
            </div>
            {folderServers.length === 0 && (
              <div className="text-[12px] px-1 py-2" style={{ color: colors.text.muted }}>No servers</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}