import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Crown, Plus, Compass, FolderPlus, Copy, Settings, LogOut } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import { base44 } from '@/api/base44Client';
import { colors, shadows } from '@/components/app/design/tokens';

import SidebarItem from './SidebarItem';
import SidebarFolder from './SidebarFolder';
import { FolderCreateModal } from '@/components/app/features/ServerFolders';

function SidebarDivider() {
  return <div className="w-8 h-[2px] rounded-full my-0.5" style={{ background: colors.border.light }} />;
}

export default function ServerSidebar({
  servers, activeServerId, onServerSelect, onHomeClick, onCreateServer, onDiscover,
  onElite, onLeaveServer, isHome, badge, currentUserId,
}) {
  const [folders, setFolders] = useState([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [userOrder, setUserOrder] = useState([]); // ordered list of ids: 'server:xxx' or 'folder:xxx'
  const saveTimer = useRef(null);
  const hasElite = false; // Could check profile

  // Load folders
  useEffect(() => {
    if (!currentUserId) return;
    base44.entities.ServerFolder.filter({ user_id: currentUserId }).then(f => {
      setFolders(f.sort((a, b) => (a.position || 0) - (b.position || 0)));
    });
  }, [currentUserId]);

  const folderedServerIds = new Set(folders.flatMap(f => f.server_ids || []));

  // Build ordered items list
  // Merge folders and unfoldered servers by position
  const orderedItems = React.useMemo(() => {
    const items = [];
    const unfolderedServers = servers.filter(s => !folderedServerIds.has(s.id));

    // Add folders at their positions
    folders.forEach(f => items.push({ type: 'folder', id: f.id, data: f, position: f.position ?? 999 }));
    // Add unfoldered servers — we don't have a stored user order yet, so just use their array order
    unfolderedServers.forEach((s, i) => items.push({ type: 'server', id: s.id, data: s, position: (folders.length + i) }));

    return items.sort((a, b) => a.position - b.position);
  }, [servers, folders, folderedServerIds]);

  const createFolder = async ({ name, color }) => {
    await base44.entities.ServerFolder.create({ user_id: currentUserId, name, color, server_ids: [], position: folders.length });
    const f = await base44.entities.ServerFolder.filter({ user_id: currentUserId });
    setFolders(f.sort((a, b) => (a.position || 0) - (b.position || 0)));
    setShowCreateFolder(false);
  };

  const renameFolder = async (folder) => {
    const newName = prompt('Folder name:', folder.name);
    if (!newName || !newName.trim()) return;
    await base44.entities.ServerFolder.update(folder.id, { name: newName.trim() });
    setFolders(p => p.map(f => f.id === folder.id ? { ...f, name: newName.trim() } : f));
  };

  const deleteFolder = async (folder) => {
    if (!confirm(`Remove folder "${folder.name}"? Servers will be moved back to the sidebar.`)) return;
    await base44.entities.ServerFolder.delete(folder.id);
    setFolders(p => p.filter(f => f.id !== folder.id));
  };

  // Debounced save for drag reorder
  const saveFolderPositions = useCallback((newFolders) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      await Promise.all(newFolders.map((f, i) =>
        base44.entities.ServerFolder.update(f.id, { position: i })
      ));
    }, 500);
  }, []);

  const onDragEnd = useCallback((result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.index === destination.index) return;

    // We only support reordering within the main list for now
    // Full folder drag-drop would be more complex
  }, []);

  return (
    <div
      className="w-[72px] flex-shrink-0 flex flex-col items-center py-3 gap-[10px] overflow-y-auto scrollbar-none"
      style={{
        background: `linear-gradient(180deg, ${colors.bg.base} 0%, #0e0e14 100%)`,
      }}
      role="navigation"
      aria-label="Server list"
    >
      {/* Home button — Kairo crown */}
      <ContextMenu>
        <ContextMenuTrigger>
          <div>
            <SidebarItem
              active={isHome}
              badge={badge}
              tooltip="Direct Messages"
              onClick={onHomeClick}
              glow={isHome}
            >
              <Crown
                className="w-6 h-6"
                style={{
                  color: isHome ? '#fff' : colors.text.muted,
                  filter: badge > 0 ? `drop-shadow(0 0 4px ${colors.accent.primary}80)` : 'none',
                }}
              />
            </SidebarItem>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-52 p-1.5 rounded-lg" style={{ background: colors.bg.modal, border: `1px solid ${colors.border.light}`, boxShadow: shadows.strong }}>
          <ContextMenuItem onClick={onCreateServer} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}>
            <Plus className="w-4 h-4 opacity-60" /> Create Server
          </ContextMenuItem>
          <ContextMenuItem onClick={onDiscover} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}>
            <Compass className="w-4 h-4 opacity-60" /> Join Server
          </ContextMenuItem>
          <ContextMenuItem onClick={() => setShowCreateFolder(true)} className="text-[13px] gap-2.5 rounded-md px-2.5 py-2" style={{ color: colors.text.secondary }}>
            <FolderPlus className="w-4 h-4 opacity-60" /> Create Folder
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <SidebarDivider />

      {/* Server list + folders */}
      <div className="flex flex-col items-center gap-[10px] flex-1 min-h-0">
        {orderedItems.map(item => {
          if (item.type === 'folder') {
            return (
              <SidebarFolder
                key={`folder-${item.id}`}
                folder={item.data}
                servers={servers}
                activeServerId={activeServerId}
                onServerSelect={onServerSelect}
                onRename={() => renameFolder(item.data)}
                onDelete={() => deleteFolder(item.data)}
                onMarkRead={() => {}}
                currentUserServers={servers}
              />
            );
          }

          const s = item.data;
          return (
            <ContextMenu key={s.id}>
              <ContextMenuTrigger>
                <div>
                  <SidebarItem
                    active={activeServerId === s.id}
                    tooltip={s.name}
                    imageUrl={s.icon_url}
                    name={s.name}
                    accentColor={s.banner_color}
                    onClick={() => onServerSelect(s)}
                  />
                </div>
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
          );
        })}
      </div>

      <SidebarDivider />

      {/* Bottom action buttons */}
      <SidebarItem tooltip="Add a Server" onClick={onCreateServer}>
        <Plus className="w-5 h-5" style={{ color: colors.text.muted }} />
      </SidebarItem>
      <SidebarItem tooltip="Explore Servers" onClick={onDiscover}>
        <Compass className="w-5 h-5" style={{ color: colors.text.muted }} />
      </SidebarItem>

      <div className="flex-1" />

      {/* Elite button */}
      <SidebarItem tooltip="Kairo Elite" onClick={onElite}>
        <Crown
          className="w-5 h-5"
          style={{
            color: hasElite ? colors.warning : colors.text.muted,
            filter: hasElite ? `drop-shadow(0 0 6px ${colors.warning}80)` : 'none',
          }}
        />
      </SidebarItem>

      <AnimatePresence>
        {showCreateFolder && (
          <FolderCreateModal onClose={() => setShowCreateFolder(false)} onCreate={createFolder} />
        )}
      </AnimatePresence>
    </div>
  );
}