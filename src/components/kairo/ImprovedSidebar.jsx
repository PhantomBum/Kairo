import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Users, Settings, ChevronDown, Plus, 
  Compass, User, Bell, ChevronLeft, ChevronRight,
  Hash, Sparkles, ShoppingBag, Search, LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger 
} from '@/components/ui/context-menu';

function ServerItem({ server, isActive, onClick, isCollapsed, onLeave }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <button
          onClick={onClick}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
            isActive 
              ? "bg-gradient-to-r from-violet-500/15 to-indigo-500/15 text-white" 
              : "text-zinc-400 hover:bg-zinc-800/60 hover:text-white"
          )}
        >
          {isActive && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-violet-500 to-indigo-500 rounded-r-full" />
          )}
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all overflow-hidden",
            isActive 
              ? "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20" 
              : "bg-zinc-800/80 group-hover:bg-zinc-700"
          )}>
            {server.icon_url ? (
              <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-semibold text-white">{server.name?.charAt(0)}</span>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-[13px] truncate">{server.name}</p>
            </div>
          )}
          {!isCollapsed && server.unread > 0 && (
            <div className="w-5 h-5 bg-violet-500 rounded-full text-xs font-bold flex items-center justify-center text-white">
              {server.unread}
            </div>
          )}
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent className="bg-zinc-900/95 backdrop-blur-xl border-zinc-800/80 rounded-xl shadow-2xl">
        <ContextMenuItem className="text-zinc-300 hover:bg-zinc-800 rounded-lg mx-1">
          <Hash className="w-4 h-4 mr-2 text-zinc-500" />
          View Channels
        </ContextMenuItem>
        <ContextMenuItem className="text-zinc-300 hover:bg-zinc-800 rounded-lg mx-1">
          <Bell className="w-4 h-4 mr-2 text-zinc-500" />
          Notifications
        </ContextMenuItem>
        <ContextMenuItem className="text-zinc-300 hover:bg-zinc-800 rounded-lg mx-1">
          <Settings className="w-4 h-4 mr-2 text-zinc-500" />
          Settings
        </ContextMenuItem>
        <ContextMenuItem 
          className="text-rose-400 hover:bg-rose-500/10 rounded-lg mx-1"
          onClick={() => onLeave?.(server)}
        >
          Leave Server
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function NavButton({ icon: Icon, label, onClick, isActive, badge, isCollapsed }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative",
        isActive 
          ? "bg-zinc-800/80 text-white" 
          : "text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
      )}
    >
      <Icon className="w-[18px] h-[18px] flex-shrink-0" />
      {!isCollapsed && <span className="text-[13px] font-medium">{label}</span>}
      {badge > 0 && (
        <div className={cn(
          "bg-violet-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center",
          isCollapsed ? "absolute -top-1 -right-1 w-4 h-4" : "ml-auto w-5 h-5"
        )}>
          {badge > 9 ? '9+' : badge}
        </div>
      )}
    </button>
  );
}

function StatusDot({ status }) {
  const colors = {
    online: 'bg-emerald-400',
    idle: 'bg-amber-400',
    dnd: 'bg-rose-400',
    invisible: 'bg-zinc-500',
    offline: 'bg-zinc-500'
  };
  return <div className={cn("w-2.5 h-2.5 rounded-full", colors[status] || colors.offline)} />;
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
  onShopClick,
  onLeaveServer,
  isDMsActive,
  userProfile,
  unreadDMs = 0,
  notifications = [],
  hasNewUpdates = false
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "h-full bg-zinc-950 flex flex-col transition-all duration-300 border-r border-zinc-800/50",
      isCollapsed ? "w-[72px]" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            <span className="font-semibold text-white tracking-tight">Kairo</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800/50 transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="px-3 mb-3">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('kairo:open-search'))}
            className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-900/80 hover:bg-zinc-800/80 rounded-xl text-zinc-500 text-sm transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Search...</span>
            <span className="ml-auto text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">⌘K</span>
          </button>
        </div>
      )}

      {/* User Profile Card */}
      <div className="px-3 mb-2">
        <button
          onClick={onProfileClick}
          className="w-full p-3 flex items-center gap-3 bg-zinc-900/50 hover:bg-zinc-900/80 rounded-2xl transition-colors"
        >
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center overflow-hidden">
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-zinc-900 rounded-full">
              <StatusDot status={userProfile?.status} />
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex-1 text-left min-w-0">
              <p className="font-medium text-white text-sm truncate">{userProfile?.display_name || 'User'}</p>
              <p className="text-xs text-zinc-500 truncate">{userProfile?.custom_status?.text || 'Set a status'}</p>
            </div>
          )}
        </button>
      </div>

      {/* Navigation */}
      <div className="px-3 py-2 space-y-1">
        <NavButton icon={MessageCircle} label="Messages" onClick={onDMsClick} isActive={isDMsActive} badge={unreadDMs} isCollapsed={isCollapsed} />
        <NavButton icon={Users} label="Friends" onClick={onFriendsClick} isCollapsed={isCollapsed} />
        <NavButton icon={Compass} label="Discover" onClick={onDiscoverClick} isCollapsed={isCollapsed} />
      </div>

      {/* Servers */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-2">
        {!isCollapsed && (
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Spaces</p>
            <button 
              onClick={onCreateServer}
              className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <div className="space-y-1">
          {servers.map((server) => (
            <ServerItem
              key={server.id}
              server={server}
              isActive={activeServerId === server.id}
              onClick={() => onServerSelect(server)}
              isCollapsed={isCollapsed}
              onLeave={onLeaveServer}
            />
          ))}
        </div>
        {servers.length === 0 && !isCollapsed && (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-zinc-900 flex items-center justify-center">
              <LayoutGrid className="w-6 h-6 text-zinc-600" />
            </div>
            <p className="text-sm text-zinc-500 mb-3">No spaces yet</p>
            <button
              onClick={onCreateServer}
              className="text-sm text-violet-400 hover:text-violet-300 font-medium"
            >
              Create your first space
            </button>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-zinc-800/50 space-y-1">
        <NavButton icon={ShoppingBag} label="Shop" onClick={onShopClick} isCollapsed={isCollapsed} />
        <NavButton icon={Bell} label="Notifications" onClick={onNotificationsClick} badge={notifications.length} isCollapsed={isCollapsed} />
        <NavButton 
          icon={Sparkles} 
          label="What's New" 
          onClick={onUpdateLogsClick} 
          badge={hasNewUpdates ? 1 : 0}
          isCollapsed={isCollapsed} 
        />
        <NavButton icon={Settings} label="Settings" onClick={onSettingsClick} isCollapsed={isCollapsed} />
      </div>
    </div>
  );
}