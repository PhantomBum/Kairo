import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Compass, Crown, LogOut, Copy, Settings, FolderPlus, ShieldCheck, StickyNote, Heart, Bell, Star, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { base44 } from '@/api/base44Client';
import ServerFoldersRail, { FolderCreateModal } from '@/components/app/features/ServerFolders';
import ServerRailIcon from './ServerRailIcon';
import SupportDropdown from '@/components/app/features/SupportDropdown';
import WhatsNewPanel from '@/components/app/features/WhatsNewPanel';
import { colors } from '@/components/app/design/tokens';

const P = {
  base: colors.bg.base,
  surface: colors.bg.surface,
  elevated: colors.bg.elevated,
  floating: colors.bg.float,
  border: colors.border.subtle,
  textPrimary: colors.text.primary,
  textSecondary: colors.text.secondary,
  muted: colors.text.muted,
  accent: colors.accent.primary,
  accentGlow: colors.accent.glow,
};

function RailDivider() {
  return <div className="w-8 h-[1px] rounded-full mx-auto" style={{ background: 'var(--border-faint)' }} />;
}

function ActionIcon({ onClick, tooltip, dashed, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="relative flex items-center justify-center"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <motion.button
        onClick={onClick}
        className="relative flex items-center justify-center"
        animate={{
          scale: hovered ? 1.05 : 1,
          borderRadius: '16px',
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ scale: { duration: 0.2, ease: [0, 0, 0.2, 1] }, borderRadius: { duration: 0.2 } }}
        style={{
          width: 40, height: 40,
          background: hovered ? 'var(--accent-primary)' : 'var(--surface-glass)',
          border: dashed ? `2px dashed ${hovered ? 'var(--accent-primary)' : 'var(--text-muted)'}` : 'none',
          boxShadow: hovered ? 'var(--shadow-glow-sm)' : 'none',
          transition: 'background 200ms ease, border-color 200ms ease, box-shadow 200ms ease',
        }}
      >
        {children}
      </motion.button>

      <AnimatePresence>
        {hovered && tooltip && (
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.12 }}
            className="absolute left-[62px] z-[100] px-3 py-1.5 rounded-[10px] text-[13px] font-semibold whitespace-nowrap pointer-events-none"
            style={{ background: 'var(--bg-float)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }}>
            {tooltip}
            <div className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45"
              style={{ background: 'var(--bg-float)', borderLeft: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ServerRailWithContext({
  servers, activeServerId, onServerSelect, onHomeClick, onCreateServer, onDiscover,
  onElite, onLeaveServer, isHome, badge, currentUserId, isAppOwner,
  onAdminPanel, onServerNotes, compact, onWrapped,
}) {
  const [folders, setFolders] = useState([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [serverOrder, setServerOrder] = useState([]);
  const supportRef = useRef(null);
  const whatsNewRef = useRef(null);

  useEffect(() => {
    if (currentUserId) base44.entities.ServerFolder.filter({ user_id: currentUserId }).then(setFolders);
  }, [currentUserId]);

  useEffect(() => {
    setServerOrder(servers.map(s => s.id));
  }, [servers]);

  const folderedServerIds = new Set(folders.flatMap(f => f.server_ids || []));
  const unfolderedServers = serverOrder
    .map(id => servers.find(s => s.id === id))
    .filter(s => s && !folderedServerIds.has(s.id));

  const toggleFolder = async (folder) => {
    await base44.entities.ServerFolder.update(folder.id, { is_collapsed: !folder.is_collapsed });
    setFolders(p => p.map(f => f.id === folder.id ? { ...f, is_collapsed: !f.is_collapsed } : f));
  };

  const createFolder = async ({ name, color }) => {
    await base44.entities.ServerFolder.create({ user_id: currentUserId, name, color, server_ids: [] });
    const f = await base44.entities.ServerFolder.filter({ user_id: currentUserId });
    setFolders(f);
    setShowCreateFolder(false);
  };

  const onDragEnd = useCallback(async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (source.droppableId === 'server-rail' && destination.droppableId === 'server-rail') {
      const newOrder = [...serverOrder];
      const srcIdx = newOrder.indexOf(draggableId);
      if (srcIdx === -1) return;
      newOrder.splice(srcIdx, 1);

      const destServerId = unfolderedServers[destination.index]?.id;
      const destIdx = destServerId ? newOrder.indexOf(destServerId) : newOrder.length;
      newOrder.splice(destIdx, 0, draggableId);
      setServerOrder(newOrder);

      try {
        await Promise.all(newOrder.map((id, i) => {
          const s = servers.find(sv => sv.id === id);
          if (s) return base44.entities.Server.update(id, { position: i });
          return Promise.resolve();
        }));
      } catch { /* position field may not exist, fail silently */ }
    }

    if (source.droppableId === 'server-rail' && destination.droppableId.startsWith('server-drop-')) {
      const targetId = destination.droppableId.replace('server-drop-', '');
      if (draggableId === targetId) return;

      const name = 'New Folder';
      const color = 'var(--accent-primary)';
      try {
        await base44.entities.ServerFolder.create({
          user_id: currentUserId, name, color,
          server_ids: [targetId, draggableId],
        });
        const f = await base44.entities.ServerFolder.filter({ user_id: currentUserId });
        setFolders(f);
      } catch { /* folder creation failed */ }
    }
  }, [serverOrder, unfolderedServers, servers, currentUserId]);

  return (
    <div
      className="app-server-rail w-[72px] flex-shrink-0 flex flex-col py-3"
      style={{
        background: 'linear-gradient(180deg, var(--bg-base) 0%, var(--bg-void) 100%)',
        borderRight: '1px solid var(--border-faint)',
      }}
      role="navigation"
      aria-label="Server list"
    >
      <div className="px-2 flex-shrink-0">
        <ContextMenu>
          <ContextMenuTrigger>
            <div className="flex justify-center">
              <ServerRailIcon active={isHome} onClick={onHomeClick} badge={badge} server={{ name: 'Direct Messages' }}>
                <Crown className="w-5 h-5" style={{ color: isHome ? '#fff' : 'var(--accent-primary)' }} />
              </ServerRailIcon>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="w-52 p-1.5 rounded-[14px]" style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}>
            <ContextMenuItem onClick={onCreateServer} className="text-sm gap-2.5 rounded-[10px] px-2.5 py-2" style={{ color: 'var(--text-secondary)' }}>
              <Plus className="w-4 h-4 opacity-60" /> Create Server
            </ContextMenuItem>
            <ContextMenuItem onClick={onDiscover} className="text-sm gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.textSecondary }}>
              <Compass className="w-4 h-4 opacity-60" /> Discover Servers
            </ContextMenuItem>
            <ContextMenuItem onClick={() => setShowCreateFolder(true)} className="text-sm gap-2.5 rounded-[10px] px-2.5 py-2" style={{ color: 'var(--text-secondary)' }}>
              <FolderPlus className="w-4 h-4 opacity-60" /> Create Folder
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>

      <div className="h-px mx-3 my-2 flex-shrink-0" style={{ background: 'var(--border-faint)' }} />

      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-none px-2">
        {folders.length > 0 && (
          <div className="mb-2">
            <ServerFoldersRail folders={folders} servers={servers} activeServerId={activeServerId}
              onServerSelect={onServerSelect} onToggleFolder={toggleFolder} />
            {unfolderedServers.length > 0 && <RailDivider />}
          </div>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="server-rail" direction="vertical">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col items-center" style={{ gap: 10 }}>
                {unfolderedServers.length === 0 && (
                    <p className="text-center text-[11px] leading-tight px-1 py-2" style={{ color: 'var(--text-muted)' }}>
                    No servers yet. Hit + to add one
                  </p>
                )}
                {unfolderedServers.map((s, i) => (
                  <Draggable key={s.id} draggableId={s.id} index={i}>
                    {(dragProvided, snapshot) => (
                      <div ref={dragProvided.innerRef} {...dragProvided.draggableProps} {...dragProvided.dragHandleProps}
                        style={{
                          ...dragProvided.draggableProps.style,
                          ...(snapshot.isDragging ? { zIndex: 50, filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.6))' } : {}),
                        }}>
                        <ContextMenu>
                          <ContextMenuTrigger>
                            <div>
                              <ServerRailIcon
                                server={s}
                                active={activeServerId === s.id}
                                unread={s.has_unread}
                                badge={s.ping_count || 0}
                                onClick={() => onServerSelect(s)}
                              >
                                {s.icon_url ? (
                                  <>
                                    <img src={s.icon_url} className="w-full h-full object-cover absolute inset-0" alt={s.name}
                                      style={{ borderRadius: 'inherit' }} onError={(e) => { e.target.style.display = 'none'; }} />
                                    <div className="absolute inset-0" style={{ borderRadius: 'inherit', boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.15)' }} />
                                  </>
                                ) : (
                                  <span className="text-[14px] font-semibold select-none"
                                    style={{ color: activeServerId === s.id ? '#fff' : 'var(--text-secondary)' }}>
                                    {s.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                  </span>
                                )}
                              </ServerRailIcon>
                            </div>
                          </ContextMenuTrigger>
                          <ContextMenuContent className="w-52 p-1.5 rounded-[14px]" style={{ background: 'var(--bg-float)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-lg)' }}>
                            <ContextMenuItem onClick={() => onServerSelect(s)} className="text-[13px] gap-2.5 rounded-[10px] px-2.5 py-2" style={{ color: 'var(--text-secondary)' }}>
                              <Settings className="w-4 h-4 opacity-60" /> Server Settings
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => navigator.clipboard.writeText(s.invite_code || '')} className="text-[13px] gap-2.5 rounded-[10px] px-2.5 py-2" style={{ color: 'var(--text-secondary)' }}>
                              <Copy className="w-4 h-4 opacity-60" /> Copy Invite Code
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => onServerNotes?.(s.id)} className="text-[13px] gap-2.5 rounded-lg px-2.5 py-2" style={{ color: P.textSecondary }}>
                              <StickyNote className="w-4 h-4 opacity-60" /> Server Notes
                            </ContextMenuItem>
                            <ContextMenuSeparator style={{ background: 'var(--border-faint)', margin: '4px 0' }} />
                            <ContextMenuItem onClick={() => onLeaveServer?.(s)} className="text-[13px] gap-2.5 rounded-[10px] px-2.5 py-2" style={{ color: 'var(--color-danger)' }}>
                              <LogOut className="w-4 h-4 opacity-60" /> Leave Server
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div className="h-px mx-3 my-2 flex-shrink-0" style={{ background: 'var(--border-faint)' }} />

      <div className="px-2 flex-shrink-0 flex flex-col items-center" style={{ gap: 10 }}>
          <ActionIcon onClick={onCreateServer} tooltip="Add a Server" dashed>
          <Plus className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
        </ActionIcon>
        <ActionIcon onClick={onDiscover} tooltip="Explore Servers">
          <Compass className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
        </ActionIcon>
        <div className="relative" ref={whatsNewRef}>
          <ActionIcon onClick={() => { setShowWhatsNew(!showWhatsNew); setShowSupport(false); }} tooltip={showWhatsNew ? undefined : "What's New"}>
            <div className="relative">
              <Bell className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
              <Star className="w-2 h-2 absolute -top-0.5 -right-0.5" style={{ color: 'var(--color-warning)', fill: 'var(--color-warning)' }} />
            </div>
          </ActionIcon>
          {showWhatsNew && <WhatsNewPanel placement="rail" onClose={() => setShowWhatsNew(false)} />}
        </div>
        <div className="relative" ref={supportRef}>
          <ActionIcon onClick={() => { setShowSupport(!showSupport); setShowWhatsNew(false); }} tooltip={showSupport ? undefined : 'Support Kairo'}>
            <Heart className="w-5 h-5" style={{ color: '#ed4245' }} />
          </ActionIcon>
          {showSupport && <SupportDropdown placement="rail" onClose={() => setShowSupport(false)} />}
        </div>
      </div>

      {(isAppOwner || new Date().getMonth() === 11 || onElite) && (
        <>
          <div className="h-px mx-3 my-2 flex-shrink-0" style={{ background: 'var(--border-faint)' }} />
          <div className="px-2 flex-shrink-0 flex flex-col items-center" style={{ gap: 6 }}>
            {isAppOwner && (
              <ActionIcon onClick={onAdminPanel} tooltip="Admin Panel">
                <ShieldCheck className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />
              </ActionIcon>
            )}
            {new Date().getMonth() === 11 && onWrapped && (
              <ActionIcon onClick={onWrapped} tooltip="Kairo Wrapped">
                <Gift className="w-5 h-5" style={{ color: '#eb459e' }} />
              </ActionIcon>
            )}
            <ActionIcon onClick={onElite} tooltip="Kairo Elite">
              <Crown className="w-5 h-5 k-crown-shimmer" style={{ color: 'var(--color-warning)' }} />
            </ActionIcon>
          </div>
        </>
      )}

      <AnimatePresence>
        {showCreateFolder && (
          <FolderCreateModal onClose={() => setShowCreateFolder(false)} onCreate={createFolder} />
        )}
      </AnimatePresence>
    </div>
  );
}
