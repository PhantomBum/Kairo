import React, { useState, useEffect } from 'react';
import { Home, Plus, Compass, Crown, LogOut, Copy, Settings, FolderPlus, ShieldCheck } from 'lucide-react';
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
        <motion.div initial={{ opacity: 0, x: -8, scale: 0.96 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -8, scale: 0.96 }}
          transition={{ duration: 0.12 }}
          className="absolute left-[68px] z-50 px-3 py-1.5 rounded-md text-sm font-semibold whitespace-nowrap pointer-events-none"
          style={{ background: '#111214', color: '#fff', boxShadow: '0 8px 16px rgba(0,0,0,0.24)' }}>
          {text}
          <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rotate-45" style={{ background: '#111214' }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function RailIcon({ active, unread, onClick, tooltip, badge, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="relative flex items-center justify-center" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {/* Pill indicator */}
      <motion.div className="absolute left-0 rounded-r-full" initial={false}
        animate={{
          width: active ? 4 : hovered ? 4 : 4,
          height: active ? 40 : hovered ? 20 : unread ? 8 : 0,
          y: 0,
          opacity: active || hovered || unread ? 1 : 0,
        }}
        style={{ top: '50%', transform: 'translateY(-50%)' }}
        transition={{ duration: 0.15 }}
        {...{ style: { background: '#fff', position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', borderRadius: '0 4px 4px 0' } }} />
      <motion.button onClick={onClick}
        className="relative overflow-hidden flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: 48, height: 48,
          borderRadius: active ? 16 : hovered ? 16 : 24,
          background: active ? colors.accent.primary : hovered ? colors.accent.primary : '#313338',
          transition: 'border-radius 0.2s ease, background 0.15s ease',
        }}>
        {children}
        {badge > 0 && (
          <div className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold flex items-center justify-center"
            style={{ background: colors.danger, color: '#fff', border: `3px solid ${colors.bg.base}` }}>{badge > 99 ? '99+' : badge}</div>
        )}
      </motion.button>
      <RailTooltip text={tooltip} visible={hovered && !active} />
    </div>
  );
}

function RailDivider() {
  return <div className="w-8 h-[2px] rounded-full mx-auto my-1" style={{ background: 'rgba(255,255,255,0.06)' }} />;
}

export default function ServerRailWithContext({ servers, activeServerId, onServerSelect, onHomeClick, onCreateServer, onDiscover, onElite, onLeaveServer, isHome, badge, currentUserId, isAppOwner, onAdminPanel }) {
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
    <div className="w-[72px] flex-shrink-0 flex flex-col items-center py-3 gap-2 overflow-y-auto scrollbar-none"
      style={{ background: colors.bg.base }} role="navigation" aria-label="Server list">
      <ContextMenu>
        <ContextMenuTrigger>
          <div><RailIcon active={isHome} onClick={onHomeClick} tooltip="Direct Messages" badge={badge}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19.73 4.87l-15.46 6.73c-.47.2-.47.87.01 1.06l3.56 1.42 1.45 4.83c.18.6.98.74 1.34.23l2.09-2.97 4.11 3.04c.36.27.86.13 1.04-.29l3.49-13.17c.21-.82-.55-1.54-1.37-1.19l.26.31z" fill={isHome ? '#fff' : colors.text.muted}/>
            </svg>
          </RailIcon></div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52 p-1.5 rounded-md" style={{ background: '#111214', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.24)' }}>
          <ContextMenuItem onClick={onCreateServer} className="text-sm gap-2.5 rounded px-2.5 py-2" style={{ color: colors.text.secondary }}><Plus className="w-4 h-4 opacity-60" /> Create Server</ContextMenuItem>
          <ContextMenuItem onClick={onDiscover} className="text-sm gap-2.5 rounded px-2.5 py-2" style={{ color: colors.text.secondary }}><Compass className="w-4 h-4 opacity-60" /> Discover Servers</ContextMenuItem>
          <ContextMenuItem onClick={() => setShowCreateFolder(true)} className="text-sm gap-2.5 rounded px-2.5 py-2" style={{ color: colors.text.secondary }}><FolderPlus className="w-4 h-4 opacity-60" /> Create Folder</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <RailDivider />

      {folders.length > 0 && (
        <>
          <ServerFoldersRail folders={folders} servers={servers} activeServerId={activeServerId}
            onServerSelect={onServerSelect} onToggleFolder={toggleFolder} />
          {unfolderedServers.length > 0 && <RailDivider />}
        </>
      )}

      {unfolderedServers.map(s => (
        <ContextMenu key={s.id}>
          <ContextMenuTrigger>
            <div><ServerRailIcon server={s} active={activeServerId === s.id} onClick={() => onServerSelect(s)}>
              {s.icon_url ? <img src={s.icon_url} className="w-full h-full object-cover absolute inset-0" alt={s.name} />
                : <span className="text-[15px] font-semibold select-none" style={{ color: activeServerId === s.id ? '#fff' : colors.text.secondary }}>{s.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>}
            </ServerRailIcon></div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-52 p-1.5 rounded-md" style={{ background: '#111214', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.24)' }}>
            <ContextMenuItem onClick={() => onServerSelect(s)} className="text-sm gap-2.5 rounded px-2.5 py-2" style={{ color: colors.text.secondary }}><Settings className="w-4 h-4 opacity-60" /> Server Settings</ContextMenuItem>
            <ContextMenuItem onClick={() => navigator.clipboard.writeText(s.invite_code || '')} className="text-sm gap-2.5 rounded px-2.5 py-2" style={{ color: colors.text.secondary }}><Copy className="w-4 h-4 opacity-60" /> Copy Invite Code</ContextMenuItem>
            <ContextMenuSeparator style={{ background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
            <ContextMenuItem onClick={() => onLeaveServer?.(s)} className="text-sm gap-2.5 rounded px-2.5 py-2" style={{ color: colors.danger }}><LogOut className="w-4 h-4 opacity-60" /> Leave Server</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}

      <RailDivider />

      <RailIcon onClick={onCreateServer} tooltip="Add a Server">
        <Plus className="w-5 h-5" style={{ color: colors.success }} />
      </RailIcon>
      <RailIcon onClick={onDiscover} tooltip="Explore Servers">
        <Compass className="w-5 h-5" style={{ color: colors.success }} />
      </RailIcon>

      <div className="flex-1" />
      {isAppOwner && (
        <RailIcon onClick={onAdminPanel} tooltip="Admin Panel">
          <ShieldCheck className="w-5 h-5" style={{ color: '#f0b232' }} />
        </RailIcon>
      )}
      <RailIcon onClick={onElite} tooltip="Kairo Elite">
        <Crown className="w-5 h-5" style={{ color: '#f0b232' }} />
      </RailIcon>

      <AnimatePresence>{showCreateFolder && <FolderCreateModal onClose={() => setShowCreateFolder(false)} onCreate={createFolder} />}</AnimatePresence>
    </div>
  );
}