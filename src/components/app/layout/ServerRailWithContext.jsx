import React, { useState, useEffect } from 'react';
import { Home, Plus, Compass, Crown, LogOut, Copy, Settings, FolderPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { base44 } from '@/api/base44Client';
import { colors, radius, shadows, glass } from '@/components/app/design/tokens';
import ServerFoldersRail, { FolderCreateModal } from '@/components/app/features/ServerFolders';
import ServerRailIcon from './ServerRailIcon';

function RailTooltip({ text, visible }) {
  return (
    <AnimatePresence>
      {visible && text && (
        <motion.div initial={{ opacity: 0, x: -6, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -6, scale: 0.95 }}
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
      {/* Kloak: clean solid pill indicator — no glow, no shadow */}
      <motion.div className="absolute -left-0.5 top-1/2 rounded-full" initial={false}
        animate={{
          width: active ? 4 : 3,
          height: active ? 28 : hovered ? 16 : unread ? 7 : 0,
          y: '-50%',
          opacity: active || hovered || unread ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
        style={{ background: active ? colors.accent.primary : colors.text.primary }} />
      <motion.button onClick={onClick}
        className="relative overflow-hidden flex items-center justify-center"
        animate={{ scale: hovered && !active ? 1.06 : 1 }}
        transition={{ duration: 0.15 }}
        style={{
          width: 48, height: 48,
          borderRadius: active ? 14 : hovered ? 16 : 22,
          background: active
            ? colors.accent.primary
            : hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${active ? colors.accent.primary : colors.border.default}`,
          transition: 'border-radius 0.25s cubic-bezier(0,0,0.2,1), background 0.2s, box-shadow 0.2s',
        }}>
        {children}
        {badge > 0 && (
          <div className="absolute -bottom-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{ background: colors.danger, color: '#fff' }}>{badge > 99 ? '99+' : badge}</div>
        )}
      </motion.button>
      <RailTooltip text={tooltip} visible={hovered} />
    </div>
  );
}

function ServerDivider() {
  return <div className="w-6 h-[1px] rounded-full my-2" style={{ background: colors.border.default }} />;
}

export default function ServerRailWithContext({ servers, activeServerId, onServerSelect, onHomeClick, onCreateServer, onDiscover, onElite, onLeaveServer, isHome, badge, currentUserId }) {
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
      style={{ background: colors.bg.base, borderRight: `1px solid ${colors.border.default}` }} role="navigation" aria-label="Server list">
      <ContextMenu>
        <ContextMenuTrigger>
          <div><RailIcon active={isHome} onClick={onHomeClick} tooltip="Direct Messages" badge={badge}>
            <Home className="w-6 h-6" style={{ color: isHome ? '#fff' : colors.text.muted }} />
          </RailIcon></div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52 p-1.5 rounded-xl" style={{ background: colors.bg.modal, border: `1px solid ${colors.border.light}`, boxShadow: shadows.strong }}>
          <ContextMenuItem onClick={onCreateServer} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: colors.text.secondary }}><Plus className="w-4 h-4 opacity-60" /> Create Server</ContextMenuItem>
          <ContextMenuItem onClick={onDiscover} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: colors.text.secondary }}><Compass className="w-4 h-4 opacity-60" /> Join Server</ContextMenuItem>
          <ContextMenuItem onClick={() => setShowCreateFolder(true)} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: colors.text.secondary }}><FolderPlus className="w-4 h-4 opacity-60" /> Create Folder</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <ServerDivider />

      {/* Folders */}
      {folders.length > 0 && (
        <>
          <ServerFoldersRail folders={folders} servers={servers} activeServerId={activeServerId}
            onServerSelect={onServerSelect} onToggleFolder={toggleFolder} />
          {unfolderedServers.length > 0 && <ServerDivider />}
        </>
      )}

      {/* Unfoldered servers */}
      {unfolderedServers.map(s => (
        <ContextMenu key={s.id}>
          <ContextMenuTrigger>
            <div><ServerRailIcon server={s} active={activeServerId === s.id} onClick={() => onServerSelect(s)}>
              {s.icon_url ? <img src={s.icon_url} className="w-full h-full object-cover absolute inset-0" alt={s.name} />
                : <span className="text-[15px] font-semibold select-none" style={{ color: activeServerId === s.id ? '#fff' : colors.text.secondary }}>{s.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>}
            </ServerRailIcon></div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-52 p-1.5 rounded-xl" style={{ background: colors.bg.modal, border: `1px solid ${colors.border.light}`, boxShadow: shadows.strong }}>
            <ContextMenuItem onClick={() => onServerSelect(s)} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: colors.text.secondary }}><Settings className="w-4 h-4 opacity-60" /> Server Settings</ContextMenuItem>
            <ContextMenuItem onClick={() => navigator.clipboard.writeText(s.invite_code || '')} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: colors.text.secondary }}><Copy className="w-4 h-4 opacity-60" /> Copy Invite Code</ContextMenuItem>
            <ContextMenuSeparator style={{ background: colors.border.default, margin: '4px 0' }} />
            <ContextMenuItem onClick={() => onLeaveServer?.(s)} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: colors.danger }}><LogOut className="w-4 h-4 opacity-60" /> Leave Server</ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}

      <ServerDivider />

      <RailIcon onClick={onCreateServer} tooltip="Add a Server"><Plus className="w-5 h-5" style={{ color: colors.text.muted }} /></RailIcon>
      <RailIcon onClick={onDiscover} tooltip="Explore Servers"><Compass className="w-5 h-5" style={{ color: colors.text.muted }} /></RailIcon>

      <div className="flex-1" />
      <RailIcon onClick={onElite} tooltip="Kairo Elite"><Crown className="w-5 h-5" style={{ color: colors.text.muted }} /></RailIcon>

      <AnimatePresence>{showCreateFolder && <FolderCreateModal onClose={() => setShowCreateFolder(false)} onCreate={createFolder} />}</AnimatePresence>
    </div>
  );
}