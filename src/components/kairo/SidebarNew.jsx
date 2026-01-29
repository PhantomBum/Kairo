import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Hash, Users, Settings, 
  ChevronDown, ChevronRight, Plus, Search,
  Compass, ShoppingBag, User, Bell, LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function WorkspaceItem({ workspace, isActive, onClick, isExpanded, onToggleExpand }) {
  return (
    <div className="mb-2">
      <motion.button
        whileHover={{ x: 2 }}
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all group",
          isActive ? "bg-indigo-500/20 text-indigo-400" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
        )}
      >
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0",
          isActive ? "bg-indigo-500" : "bg-zinc-800 group-hover:bg-zinc-700"
        )}>
          {workspace.icon_url ? (
            <img src={workspace.icon_url} alt="" className="w-full h-full object-cover rounded-xl" />
          ) : (
            <span className="text-white font-bold">{workspace.name?.charAt(0)}</span>
          )}
        </div>
        <div className="flex-1 text-left overflow-hidden">
          <div className="text-sm font-medium truncate">{workspace.name}</div>
          <div className="text-xs text-zinc-500">{workspace.member_count || 0} members</div>
        </div>
        {workspace.channels?.length > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleExpand?.(); }}
            className="p-1 hover:bg-zinc-700/50 rounded"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </motion.button>

      <AnimatePresence>
        {isExpanded && workspace.channels?.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="ml-6 overflow-hidden"
          >
            {workspace.channels.map(channel => (
              <button
                key={channel.id}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800/30 rounded transition-colors"
              >
                <Hash className="w-4 h-4" />
                <span className="truncate">{channel.name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ icon: Icon, label, onClick, badge, isActive }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative",
              isActive ? "bg-indigo-500/20 text-indigo-400" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{label}</span>
            {badge > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-zinc-900 border-zinc-800 text-white">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export default function SidebarNew({ 
  servers = [], 
  activeServerId, 
  onServerSelect, 
  onDMsClick,
  onDiscoverClick,
  onShopClick,
  onCreateServer,
  onSettingsClick,
  onFriendsClick,
  onProfileClick,
  isDMsActive,
  userProfile,
  unreadDMs = 0
}) {
  const [expandedServers, setExpandedServers] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleServerExpand = (serverId) => {
    setExpandedServers(prev => {
      const next = new Set(prev);
      if (next.has(serverId)) {
        next.delete(serverId);
      } else {
        next.add(serverId);
      }
      return next;
    });
  };

  const filteredServers = servers.filter(s => 
    s.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      animate={{ width: isCollapsed ? 64 : 280 }}
      className="h-full bg-[#0f0f11] border-r border-zinc-800/50 flex flex-col"
    >
      {/* User profile header */}
      {!isCollapsed && (
        <div className="p-4 border-b border-zinc-800/50">
          <button
            onClick={onProfileClick}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-800/50 transition-colors group"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div className={cn(
                "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f0f11]",
                userProfile?.status === 'online' && "bg-emerald-500",
                userProfile?.status === 'idle' && "bg-amber-500",
                userProfile?.status === 'dnd' && "bg-red-500",
                (!userProfile?.status || userProfile?.status === 'offline') && "bg-zinc-500"
              )} />
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <div className="text-sm font-medium text-white truncate">
                {userProfile?.display_name || 'User'}
              </div>
              <div className="text-xs text-zinc-500 truncate">
                @{userProfile?.username || 'username'}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400" />
          </button>
        </div>
      )}

      {/* Navigation */}
      {!isCollapsed && (
        <div className="p-3 space-y-1">
          <NavButton 
            icon={MessageCircle} 
            label="Direct Messages" 
            onClick={onDMsClick}
            badge={unreadDMs}
            isActive={isDMsActive}
          />
          <NavButton 
            icon={Users} 
            label="Friends" 
            onClick={onFriendsClick}
          />
          <NavButton 
            icon={Compass} 
            label="Discover" 
            onClick={onDiscoverClick}
          />
          <NavButton 
            icon={ShoppingBag} 
            label="Shop" 
            onClick={onShopClick}
          />
        </div>
      )}

      {/* Divider */}
      {!isCollapsed && <div className="mx-3 h-px bg-zinc-800/50" />}

      {/* Workspaces section */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Workspaces</span>
            <button
              onClick={onCreateServer}
              className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-800/50 rounded transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {servers.length > 3 && (
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workspaces..."
                className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          <div className="space-y-1">
            {filteredServers.map((server) => (
              <WorkspaceItem
                key={server.id}
                workspace={server}
                isActive={activeServerId === server.id}
                onClick={() => onServerSelect(server)}
                isExpanded={expandedServers.has(server.id)}
                onToggleExpand={() => toggleServerExpand(server.id)}
              />
            ))}
          </div>

          {filteredServers.length === 0 && searchQuery && (
            <div className="text-center py-8 text-zinc-500 text-sm">
              No workspaces found
            </div>
          )}
        </div>
      )}

      {/* Bottom actions */}
      {!isCollapsed && (
        <div className="p-3 border-t border-zinc-800/50 space-y-1">
          <NavButton 
            icon={Settings} 
            label="Settings" 
            onClick={onSettingsClick}
          />
        </div>
      )}
    </motion.div>
  );
}