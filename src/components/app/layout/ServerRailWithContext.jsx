import React, { useState, useEffect } from 'react';
import { Plus, Compass, Crown, LogOut, Copy, Settings, FolderPlus, ShieldCheck, StickyNote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';
import ServerFoldersRail, { FolderCreateModal } from '@/components/app/features/ServerFolders';
import ServerRailIcon from './ServerRailIcon';

function RailTooltip({ text, visible }) {
  return (
    <AnimatePresence>
      {visible && text && (
        <motion.div initial={{ opacity: 0, x: -6, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -6, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          className="absolute left-[68px] z-50 px-3 py-1.5 rounded text-sm font-semibold whitespace-nowrap pointer-events-none"
          style={{ background: colors.bg.float, color: colors.text.primary, border: `1px solid ${colors.border.strong}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
          {text}
          <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rotate-45" style={{ background: colors.bg.float, borderLeft: `1px solid ${colors.border.strong}`, borderBottom: `1px solid ${colors.border.strong}` }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RailIcon({ active, unread, onClick, tooltip, badge, size = 48, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="relative flex items-center justify-center" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <motion.div className="absolute left-0 rounded-r-full" initial={false}
        animate={{
          width: 4,
          height: active ? 40 : hovered ? 20 : unread ? 8 : 0,
          opacity: active || hovered || unread ? 1 : 0,
        }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        style={{ background: colors.text.primary, position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', borderRadius: '0 4px 4px 0' }} />
      <motion.button onClick={onClick}
        className="relative overflow-hidden flex items-center justify-center"
        whileTap={{ scale: 0.92 }}
        style={{
          width: size, height: size,
          borderRadius: active || hovered ? Math.round(size * 0.33) : Math.round(size * 0.5),
          background: active ? colors.accent.primary : hovered ? colors.accent.primary : colors.bg.overlay,
          transition: 'border-radius 150ms ease, background 150ms ease',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.03)',
        }}>
        {children}
        {badge > 0 && (
          <div className="absolute -bottom-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{ background: colors.danger, color: '#fff', border: `2px solid ${colors.bg.base}` }}>{badge > 99 ? '99+' : badge}</div>
        )}
      </motion.button>
      <RailTooltip text={tooltip} visible={hovered && !active} />
    </div>
  );
}

function RailDivider() {
  return <div className="w-8 h-[2px] rounded-full mx-auto my-0.5" style={{ background: 'rgba(255,255,255,0.06)' }} />;
}

export default function ServerRailWithContext({ servers, activeServerId, onServerSelect, onHomeClick, onCreateServer, onDiscover, onElite, onLeaveServer, isHome, badge, currentUserId, isAppOwner, onAdminPanel, onServerNotes, compact }) {
  const [folders, setFolders] = useState([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);

  useEffect(() => {
    if (currentUserId) base44.entities.ServerFolder.filter({ user_id: currentUserId }).then(setFolders);
  }, [currentUserId]);

  const folderedServerIds = new Set(folders.flatMap(f => f.server_ids || []));
  const unfolderedServers = servers.filter(s => !folderedServerIds.has(s.id));

  const toggleFolder = async (folder) => {
    await base44.entities.ServerFolder.update(folder.id, { is_collapsed: !folder.is_collapsed });
    setFolders(p => p.map(f => f.id === folder.id ? { ...f, is_collapsed: !f.is_collapsed } : f));
  };

  const createFolder = async ({ name, color }) => {
    await base44.entities.ServerFolder.create({ user_id: currentUserId, name, color, server_ids: [] });
    const f = await base44.entities.ServerFolder.filter({ user_id: currentUserId });
    setFolders(f); setShowCreateFolder(false);
  };

  return (
    <div className={`${compact ? 'w-[52px] gap-1' : 'w-[68px] gap-1.5'} flex-shrink-0 flex flex-col items-center py-3 overflow-y-auto scrollbar-none`}
      style={{ background: colors.bg.base }} role="navigation" aria-label="Server list">
      {/* Home / DMs button */}
      <ContextMenu>
        <ContextMenuTrigger>
          <div><RailIcon active={isHome} onClick={onHomeClick} tooltip="Direct Messages" badge={badge} size={44}>
            <span className="text-base font-bold" style={{ color: isHome ? '#fff' : colors.text.muted }}>K</span>
          </RailIcon></div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52 p-1.5 rounded-lg" style={{ background: colors.bg.float, border: `1px solid ${colors.border.strong}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
          <ContextMenuItem onClick={onCreateServer} className="text-sm gap-2.5 rounded-md px-2 py-1.5" style={{ color: colors.text.secondary }}><Plus className="w-4 h-4 opacity-60" /> Create Server</ContextMenuItem>
          <ContextMenuItem onClick={onDiscover} className="text-sm gap-2.5 rounded-md px-2 py-1.5" style={{ color: colors.text.secondary }}><Compass className="w-4 h-4 opacity-60" /> Discover Servers</ContextMenuItem>
          <ContextMenuItem onClick={() => setShowCreateFolder(true)} className="text-sm gap-2.5 rounded-md px-2 py-1.5" style={{ color: colors.text.secondary }}><FolderPlus className="w-4 h-4 opacity-60" /> Create Folder</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <RailDivider />

      {/* Folders */}
      {folders.length > 0 && (
        <>
          <ServerFoldersRail folders={folders} servers={servers} activeServerId={activeServerId}
            onServerSelect={onServerSelect} onToggleFolder={toggleFolder} />
          {unfolderedServers.length > 0 && <RailDivider />}
        </>
      )}

      {/* Server icons */}
      {unfolderedServers.map(s => (
        <ContextMenu key={s.id}>
          <ContextMenuTrigger>
            <div><ServerRailIcon server={s} active={activeServerId === s.id} onClick={() => onServerSelect(s)}>
              {s.icon_url ? <>
                <img src={s.icon_url} className="w-full h-full object-cover absolute inset-0" alt={s.name} />
                <div className="absolute inset-0 rounded-[inherit]" style={{ boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)' }} />
              </>
                : <span className="text-[15px] font-semibold select-none" style={{ color: activeServerId === s.id ? colors.bg.base : colors.text.secondary }}>{s.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>}
            </ServerRailIcon></div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-52 p-1.5 rounded-lg" style={{ background: colors.bg.float, border: `1px solid ${colors.border.strong}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
            <ContextMenuItem onClick={() => onServerSelect(s)} className="text-sm gap-2.5 rounded-md px-2 py-1.5" style={{ color: colors.text.secondary }}><Settings className="w-4 h-4 opacity-60" /> Server Settings</ContextMenuItem>
            <ContextMenuItem onClick={() => navigator.clipboard.writeText(s.invite_code || '')} className="text-sm gap-2.5 rounded-md px-2 py-1.5" style={{ color: colors.text.secondary }}><Copy className="w-4 h-4 opacity-60" /> Copy Invite Code</ContextMenuItem>
            <ContextMenuItem onClick={() => onServerNotes?.(s.id)} className="text-sm gap-2.5 rounded-md px-2 py-1.5" style={{ color: colors.text.secondary }}><StickyNote className="w-4 h-4 opacity-60" /> Server Notes</ContextMenuItem>
            <ContextMenuSeparator style={{ background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
            <ContextMenuItem onClick={() => onLeaveServer?.(s)} className="text-sm gap-2.5 rounded-md px-2 py-1.5" style={{ color: colors.danger }}><LogOut className="w-4 h-4 opacity-60" /> Leave Server</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}

      <RailDivider />

      {/* Add / Discover */}
      <RailIcon onClick={onCreateServer} tooltip="Add a Server" size={44}>
        <Plus className="w-[18px] h-[18px]" style={{ color: colors.success }} />
      </RailIcon>
      <RailIcon onClick={onDiscover} tooltip="Explore Servers" size={44}>
        <Compass className="w-[18px] h-[18px]" style={{ color: colors.success }} />
      </RailIcon>

      <div className="flex-1" />

      {/* Admin + Elite */}
      {isAppOwner && (
        <RailIcon onClick={onAdminPanel} tooltip="Admin Panel" size={44}>
          <ShieldCheck className="w-[18px] h-[18px]" style={{ color: '#f0b232' }} />
        </RailIcon>
      )}
      <RailIcon onClick={onElite} tooltip="Kairo Elite" size={44}>
        <Crown className="w-[18px] h-[18px] k-crown-shimmer" style={{ color: '#f0b232' }} />
      </RailIcon>

      <AnimatePresence>{showCreateFolder && <FolderCreateModal onClose={() => setShowCreateFolder(false)} onCreate={createFolder} />}</AnimatePresence>
    </div>
  );
}