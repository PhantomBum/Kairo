import React, { useState, useEffect } from 'react';
import { Plus, Compass, Crown, LogOut, Copy, Settings, FolderPlus, ShieldCheck } from 'lucide-react';
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

function RailIcon({ active, unread, onClick, tooltip, badge, children }) {
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
          width: 48, height: 48,
          borderRadius: active || hovered ? 16 : 24,
          background: active ? colors.accent.primary : hovered ? colors.accent.primary : colors.bg.elevated,
          transition: 'border-radius 150ms ease, background 150ms ease',
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
  return <div className="w-8 h-[2px] rounded-full mx-auto my-0.5" style={{ background: colors.border.strong }} />;
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
      {/* Home / DMs button */}
      <ContextMenu>
        <ContextMenuTrigger>
          <div><RailIcon active={isHome} onClick={onHomeClick} tooltip="Direct Messages" badge={badge}>
            <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
              <path d="M23.0212 1.67671C21.3107 0.879656 19.5079 0.318797 17.6584 0C17.4062 0.461742 17.1749 0.934541 16.9708 1.4184C15.003 1.12145 12.9974 1.12145 11.0292 1.4184C10.8251 0.934541 10.5765 0.461742 10.3416 0C8.49019 0.321971 6.68536 0.884561 4.97292 1.68363C1.09514 7.30826 0.0965 12.7908 0.585974 18.1944C2.57539 19.6554 4.83016 20.6863 7.21875 21.2233C7.73762 20.5143 8.19605 19.7611 8.59561 18.9698C7.83699 18.6858 7.1094 18.3291 6.42102 17.9029C6.60487 17.7695 6.78458 17.6305 6.95814 17.4916C11.5536 19.604 16.5009 19.604 21.0419 17.4916C21.2178 17.6361 21.3975 17.775 21.579 17.9029C20.8887 18.3309 20.1589 18.6894 19.398 18.9754C19.7976 19.7667 20.2627 20.5199 20.7752 21.2289C23.1673 20.6932 25.4243 19.6611 27.414 18.1944C27.9905 11.9547 26.4431 6.52452 23.0212 1.67671Z" fill={isHome ? '#fff' : colors.text.muted}/>
            </svg>
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
              {s.icon_url ? <img src={s.icon_url} className="w-full h-full object-cover absolute inset-0" alt={s.name} />
                : <span className="text-[15px] font-semibold select-none" style={{ color: activeServerId === s.id ? colors.bg.base : colors.text.secondary }}>{s.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>}
            </ServerRailIcon></div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-52 p-1.5 rounded-lg" style={{ background: colors.bg.float, border: `1px solid ${colors.border.strong}`, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
            <ContextMenuItem onClick={() => onServerSelect(s)} className="text-sm gap-2.5 rounded-md px-2 py-1.5" style={{ color: colors.text.secondary }}><Settings className="w-4 h-4 opacity-60" /> Server Settings</ContextMenuItem>
            <ContextMenuItem onClick={() => navigator.clipboard.writeText(s.invite_code || '')} className="text-sm gap-2.5 rounded-md px-2 py-1.5" style={{ color: colors.text.secondary }}><Copy className="w-4 h-4 opacity-60" /> Copy Invite Code</ContextMenuItem>
            <ContextMenuSeparator style={{ background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
            <ContextMenuItem onClick={() => onLeaveServer?.(s)} className="text-sm gap-2.5 rounded-md px-2 py-1.5" style={{ color: colors.danger }}><LogOut className="w-4 h-4 opacity-60" /> Leave Server</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}

      <RailDivider />

      {/* Add / Discover */}
      <RailIcon onClick={onCreateServer} tooltip="Add a Server">
        <Plus className="w-5 h-5" style={{ color: colors.success }} />
      </RailIcon>
      <RailIcon onClick={onDiscover} tooltip="Explore Servers">
        <Compass className="w-5 h-5" style={{ color: colors.success }} />
      </RailIcon>

      <div className="flex-1" />

      {/* Admin + Elite */}
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