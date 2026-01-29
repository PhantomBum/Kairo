import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Users, Settings, ChevronDown, Plus, 
  Compass, User, Bell, ChevronLeft, ChevronRight,
  Hash, Volume2, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger 
} from '@/components/ui/context-menu';

function ServerItem({ server, isActive, onClick, isCollapsed }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={onClick}
          className={cn(
            "w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all group",
            isActive ? "bg-indigo-500/20 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
          )}
        >
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
            isActive ? "bg-indigo-500" : "bg-zinc-800 group-hover:bg-indigo-500"
          )}>
            {server.icon_url ? (
              <img src={server.icon_url} alt="" className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span className="text-sm font-bold text-white">{server.name?.charAt(0)}</span>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 text-left truncate">
              <p className="font-semibold truncate">{server.name}</p>
              <p className="text-xs text-zinc-500 truncate">{server.member_count || 0} members</p>
            </div>
          )}
          {!isCollapsed && server.unread > 0 && (
            <div className="w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center">
              {server.unread}
            </div>
          )}
        </motion.button>
      </ContextMenuTrigger>
      <ContextMenuContent className="bg-zinc-900 border-zinc-800">
        <ContextMenuItem className="text-white hover:bg-zinc-800">
          <Hash className="w-4 h-4 mr-2" />
          View Channels
        </ContextMenuItem>
        <ContextMenuItem className="text-white hover:bg-zinc-800">
          <Bell className="w-4 h-4 mr-2" />
          Notification Settings
        </ContextMenuItem>
        <ContextMenuItem className="text-white hover:bg-zinc-800">
          <Settings className="w-4 h-4 mr-2" />
          Server Settings
        </ContextMenuItem>
        <ContextMenuItem className="text-red-500 hover:bg-zinc-800">
          Leave Server
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function NavButton({ icon: Icon, label, onClick, isActive, badge, isCollapsed }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-2 py-2 rounded-lg transition-all relative",
        isActive ? "bg-indigo-500/20 text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
      )}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {!isCollapsed && <span className="font-medium">{label}</span>}
      {badge > 0 && (
        <div className={cn(
          "bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center",
          isCollapsed ? "absolute -top-1 -right-1 w-5 h-5" : "ml-auto w-5 h-5"
        )}>
          {badge > 9 ? '9+' : badge}
        </div>
      )}
    </motion.button>
  );
}

function StatusPicker({ currentStatus, onStatusChange, isCollapsed }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const statuses = [
    { value: 'online', label: 'Online', color: 'bg-emerald-500' },
    { value: 'idle', label: 'Idle', color: 'bg-amber-500' },
    { value: 'dnd', label: 'Do Not Disturb', color: 'bg-red-500' },
    { value: 'invisible', label: 'Invisible', color: 'bg-zinc-500' }
  ];

  const current = statuses.find(s => s.value === currentStatus) || statuses[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-zinc-800 transition-all",
          isCollapsed && "justify-center"
        )}
      >
        <div className={cn("w-3 h-3 rounded-full", current.color)} />
        {!isCollapsed && (
          <>
            <span className="text-sm text-zinc-400 flex-1 text-left">{current.label}</span>
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          </>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "absolute bottom-full mb-2 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50",
                isCollapsed ? "left-full ml-2" : "left-0 right-0"
              )}
            >
              {statuses.map((status) => (
                <button
                  key={status.value}
                  onClick={() => {
                    onStatusChange(status.value);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-800 first:rounded-t-lg last:rounded-b-lg"
                >
                  <div className={cn("w-3 h-3 rounded-full", status.color)} />
                  <span className="text-sm text-white">{status.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ImprovedSidebar({ 
  servers = [], 
  activeServerId, 
  onServerSelect, 
  onDMsClick,
  onDiscoverClick,
  onCreateServer,
  onSettingsClick,
  onFriendsClick,
  onProfileClick,
  onUpdateLogsClick,
  onNotificationsClick,
  isDMsActive,
  userProfile,
  unreadDMs = 0,
  notifications = [],
  hasNewUpdates = false
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "h-full bg-zinc-900 border-r border-zinc-800 flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-60"
    )}>
      {/* Header */}
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-bold text-white">Kairo</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* User Profile */}
      <ContextMenu>
        <ContextMenuTrigger>
          <button
            onClick={onProfileClick}
            className="p-3 flex items-center gap-3 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800"
          >
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-zinc-900",
                userProfile?.status === 'online' && "bg-emerald-500",
                userProfile?.status === 'idle' && "bg-amber-500",
                userProfile?.status === 'dnd' && "bg-red-500",
                (!userProfile?.status || userProfile?.status === 'offline') && "bg-zinc-500"
              )} />
            </div>
            {!isCollapsed && (
              <div className="flex-1 text-left min-w-0">
                <p className="font-semibold text-white truncate">{userProfile?.display_name || 'User'}</p>
                <p className="text-xs text-zinc-500 truncate">@{userProfile?.username || 'username'}</p>
              </div>
            )}
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-zinc-900 border-zinc-800">
          <ContextMenuItem className="text-white hover:bg-zinc-800" onClick={onProfileClick}>
            <User className="w-4 h-4 mr-2" />
            View Profile
          </ContextMenuItem>
          <ContextMenuItem className="text-white hover:bg-zinc-800" onClick={onSettingsClick}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Status Picker */}
      <div className="px-3 py-2 border-b border-zinc-800">
        <StatusPicker 
          currentStatus={userProfile?.status} 
          onStatusChange={(status) => {
            // Update status via mutation
          }}
          isCollapsed={isCollapsed}
        />
      </div>

      {/* Navigation */}
      <div className="p-2 space-y-1 border-b border-zinc-800">
        <NavButton icon={MessageCircle} label="Direct Messages" onClick={onDMsClick} isActive={isDMsActive} badge={unreadDMs} isCollapsed={isCollapsed} />
        <NavButton icon={Users} label="Friends" onClick={onFriendsClick} isCollapsed={isCollapsed} />
        <NavButton icon={Compass} label="Discover" onClick={onDiscoverClick} isCollapsed={isCollapsed} />
        <NavButton icon={Bell} label="Notifications" onClick={onNotificationsClick} badge={notifications.length} isCollapsed={isCollapsed} />
        <NavButton 
          icon={Sparkles} 
          label="Update Logs" 
          onClick={onUpdateLogsClick} 
          badge={hasNewUpdates ? 1 : 0}
          isCollapsed={isCollapsed} 
        />
      </div>

      {/* Servers */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2">
        {!isCollapsed && <p className="text-xs font-semibold text-zinc-500 uppercase px-2 mb-2">Servers</p>}
        <div className="space-y-1">
          {servers.map((server) => (
            <ServerItem
              key={server.id}
              server={server}
              isActive={activeServerId === server.id}
              onClick={() => onServerSelect(server)}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </div>

      {/* Create Server */}
      <div className="p-2 border-t border-zinc-800">
        <button
          onClick={onCreateServer}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          {!isCollapsed && <span>Create Server</span>}
        </button>
      </div>

      {/* Settings */}
      <div className="p-2 border-t border-zinc-800">
        <NavButton icon={Settings} label="Settings" onClick={onSettingsClick} isCollapsed={isCollapsed} />
      </div>
    </div>
  );
}