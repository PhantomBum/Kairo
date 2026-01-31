import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, Folder, ChevronDown, Plus, Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

// Server folders state management (localStorage-based)
export function useServerFolders(userId) {
  const [folders, setFolders] = useState(() => {
    const stored = localStorage.getItem(`kairo_server_folders_${userId}`);
    return stored ? JSON.parse(stored) : [];
  });

  const saveFolders = (newFolders) => {
    localStorage.setItem(`kairo_server_folders_${userId}`, JSON.stringify(newFolders));
    setFolders(newFolders);
  };

  const createFolder = (name, color = '#5865F2') => {
    const newFolder = {
      id: Date.now().toString(),
      name,
      color,
      serverIds: [],
      isExpanded: true,
    };
    saveFolders([...folders, newFolder]);
    return newFolder;
  };

  const deleteFolder = (folderId) => {
    saveFolders(folders.filter(f => f.id !== folderId));
  };

  const renameFolder = (folderId, name) => {
    saveFolders(folders.map(f => f.id === folderId ? { ...f, name } : f));
  };

  const setFolderColor = (folderId, color) => {
    saveFolders(folders.map(f => f.id === folderId ? { ...f, color } : f));
  };

  const toggleFolderExpand = (folderId) => {
    saveFolders(folders.map(f => f.id === folderId ? { ...f, isExpanded: !f.isExpanded } : f));
  };

  const addServerToFolder = (folderId, serverId) => {
    // Remove from other folders first
    const updated = folders.map(f => ({
      ...f,
      serverIds: f.serverIds.filter(id => id !== serverId),
    }));
    // Add to target folder
    saveFolders(updated.map(f => 
      f.id === folderId 
        ? { ...f, serverIds: [...f.serverIds, serverId] }
        : f
    ));
  };

  const removeServerFromFolder = (serverId) => {
    saveFolders(folders.map(f => ({
      ...f,
      serverIds: f.serverIds.filter(id => id !== serverId),
    })));
  };

  const getServerFolder = (serverId) => {
    return folders.find(f => f.serverIds.includes(serverId));
  };

  const getUnfolderedServers = (servers) => {
    const folderedIds = new Set(folders.flatMap(f => f.serverIds));
    return servers.filter(s => !folderedIds.has(s.id));
  };

  return {
    folders,
    createFolder,
    deleteFolder,
    renameFolder,
    setFolderColor,
    toggleFolderExpand,
    addServerToFolder,
    removeServerFromFolder,
    getServerFolder,
    getUnfolderedServers,
  };
}

// Server folder component
export function ServerFolder({ 
  folder, 
  servers,
  activeServerId,
  onServerSelect,
  onToggleExpand,
  onRename,
  onDelete,
  onRemoveServer,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(folder.name);
  
  const folderServers = servers.filter(s => folder.serverIds.includes(s.id));
  const hasUnread = folderServers.some(s => s.unread > 0);
  const totalUnread = folderServers.reduce((sum, s) => sum + (s.unread || 0), 0);

  const handleSaveName = () => {
    if (editName.trim()) {
      onRename(folder.id, editName.trim());
    }
    setIsEditing(false);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div className="relative">
          {/* Folder header */}
          <button
            onClick={() => onToggleExpand(folder.id)}
            className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center transition-all',
              folder.isExpanded ? 'rounded-xl' : 'hover:rounded-xl',
              'bg-[#111113] hover:bg-[#1a1a1c]'
            )}
            style={{ borderColor: folder.color, borderWidth: hasUnread ? 2 : 0 }}
          >
            {folder.isExpanded ? (
              <FolderOpen className="w-5 h-5" style={{ color: folder.color }} />
            ) : (
              <Folder className="w-5 h-5" style={{ color: folder.color }} />
            )}
          </button>
          
          {/* Unread badge */}
          {!folder.isExpanded && totalUnread > 0 && (
            <div className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-[#09090b]">
              {totalUnread > 99 ? '99+' : totalUnread}
            </div>
          )}
          
          {/* Expanded servers */}
          <AnimatePresence>
            {folder.isExpanded && folderServers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-2 overflow-hidden"
              >
                {folderServers.map((server) => (
                  <ContextMenu key={server.id}>
                    <ContextMenuTrigger>
                      <button
                        onClick={() => onServerSelect(server)}
                        className={cn(
                          'relative w-12 h-12 rounded-2xl overflow-hidden transition-all',
                          activeServerId === server.id ? 'rounded-xl' : 'hover:rounded-xl',
                          !server.icon_url && 'bg-[#111113] hover:bg-indigo-600'
                        )}
                      >
                        {server.icon_url ? (
                          <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-white font-medium">
                            {server.name?.charAt(0) || '?'}
                          </span>
                        )}
                        
                        {server.unread > 0 && (
                          <div className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-[#09090b]">
                            {server.unread > 99 ? '99+' : server.unread}
                          </div>
                        )}
                      </button>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-48 bg-[#111113] border-white/[0.08]">
                      <ContextMenuItem 
                        onClick={() => onRemoveServer(server.id)}
                        className="text-zinc-300 focus:text-white focus:bg-white/[0.06]"
                      >
                        Remove from folder
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-[#111113] border-white/[0.08]">
        <ContextMenuItem 
          onClick={() => setIsEditing(true)}
          className="text-zinc-300 focus:text-white focus:bg-white/[0.06]"
        >
          Rename Folder
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/[0.06]" />
        <ContextMenuItem 
          onClick={() => onDelete(folder.id)}
          className="text-red-400 focus:text-red-300 focus:bg-red-500/10"
        >
          Delete Folder
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

// Create folder modal
export function CreateFolderButton({ onCreate }) {
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim());
      setName('');
      setShowInput(false);
    }
  };

  if (showInput) {
    return (
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          placeholder="Folder name"
          className="w-24 h-8 px-2 text-xs bg-[#111113] border border-white/[0.1] rounded text-white"
          autoFocus
        />
        <button onClick={handleCreate} className="p-1 text-emerald-400">
          <Plus className="w-4 h-4" />
        </button>
        <button onClick={() => setShowInput(false)} className="p-1 text-zinc-500">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowInput(true)}
      className="w-12 h-12 rounded-2xl bg-[#111113] hover:bg-[#1a1a1c] flex items-center justify-center text-zinc-500 hover:text-white transition-all hover:rounded-xl"
      title="Create Folder"
    >
      <FolderOpen className="w-5 h-5" />
    </button>
  );
}