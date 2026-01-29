import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Hash, Users, Settings, 
  ChevronDown, ChevronRight, Plus, Search,
  Compass, User, Sparkles, Calendar, Bookmark
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const spring = {
  type: "spring",
  stiffness: 300,
  damping: 30
};

const easeOut = {
  type: "tween",
  ease: [0.16, 1, 0.3, 1],
  duration: 0.4
};

function WorkspaceItem({ workspace, isActive, onClick, isExpanded, onToggleExpand }) {
  return (
    <div className="mb-2">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={spring}
        whileHover={{ x: 4, transition: { ...spring, stiffness: 400 } }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group relative overflow-hidden",
          isActive ? "bg-indigo-500/20 text-indigo-400" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
        )}
      >
        {isActive && (
          <motion.div
            layoutId="activeWorkspace"
            className="absolute inset-0 bg-indigo-500/20 rounded-xl"
            transition={easeOut}
          />
        )}
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 relative z-10",
          isActive ? "bg-indigo-500 shadow-lg shadow-indigo-500/50" : "bg-zinc-800 group-hover:bg-zinc-700"
        )}>
          {workspace.icon_url ? (
            <img src={workspace.icon_url} alt="" className="w-full h-full object-cover rounded-xl" />
          ) : (
            <motion.span 
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.3 }}
              className="text-white font-bold"
            >
              {workspace.name?.charAt(0)}
            </motion.span>
          )}
        </div>
        <div className="flex-1 text-left overflow-hidden relative z-10">
          <div className="text-sm font-medium truncate">{workspace.name}</div>
          <div className="text-xs text-zinc-500">{workspace.member_count || 0} members</div>
        </div>
        {workspace.channels?.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => { e.stopPropagation(); onToggleExpand?.(); }}
            className="p-1 hover:bg-zinc-700/50 rounded relative z-10"
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={spring}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </motion.button>
        )}
      </motion.button>

      <AnimatePresence>
        {isExpanded && workspace.channels?.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={easeOut}
            className="ml-6 overflow-hidden"
          >
            {workspace.channels.map((channel, idx) => (
              <motion.button
                key={channel.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...spring, delay: idx * 0.05 }}
                whileHover={{ x: 4, backgroundColor: 'rgba(39, 39, 42, 0.3)' }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-400 hover:text-white rounded-lg transition-colors"
              >
                <Hash className="w-4 h-4" />
                <span className="truncate">{channel.name}</span>
              </motion.button>
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
            whileHover={{ x: 4, transition: { ...spring, stiffness: 400 } }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors relative overflow-hidden",
              isActive ? "bg-indigo-500/20 text-indigo-400" : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeNav"
                className="absolute inset-0 bg-indigo-500/20 rounded-xl"
                transition={easeOut}
              />
            )}
            <Icon className="w-5 h-5 flex-shrink-0 relative z-10" />
            <span className="text-sm font-medium relative z-10">{label}</span>
            {badge > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={spring}
                className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center relative z-10"
              >
                {badge > 99 ? '99+' : badge}
              </motion.span>
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
      transition={easeOut}
      className="h-full bg-[#0f0f11] border-r border-zinc-800/50 flex flex-col"
    >
      {/* User profile header */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="p-4 border-b border-zinc-800/50"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onProfileClick}
            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/50 transition-all group relative overflow-hidden"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden shadow-lg">
                {userProfile?.avatar_url ? (
                  <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={cn(
                  "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f0f11]",
                  userProfile?.status === 'online' && "bg-emerald-500",
                  userProfile?.status === 'idle' && "bg-amber-500",
                  userProfile?.status === 'dnd' && "bg-red-500",
                  (!userProfile?.status || userProfile?.status === 'offline') && "bg-zinc-500"
                )}
              />
            </motion.div>
            <div className="flex-1 text-left overflow-hidden">
              <div className="text-sm font-medium text-white truncate">
                {userProfile?.display_name || 'User'}
              </div>
              <div className="text-xs text-zinc-500 truncate">
                @{userProfile?.username || 'username'}
              </div>
            </div>
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={spring}
            >
              <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400" />
            </motion.div>
          </motion.button>
        </motion.div>
      )}

      {/* Navigation */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="p-3 space-y-1"
        >
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
            icon={Calendar} 
            label="Events" 
            onClick={() => {}}
          />
          <NavButton 
            icon={Bookmark} 
            label="Saved" 
            onClick={() => {}}
          />
        </motion.div>
      )}

      {/* Divider */}
      {!isCollapsed && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={easeOut}
          className="mx-3 h-px bg-zinc-800/50"
        />
      )}

      {/* Workspaces section */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-3"
          >
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Workspaces</span>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onCreateServer}
              className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-800/50 rounded transition-colors"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </motion.div>

          {servers.length > 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="relative mb-3"
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search workspaces..."
                className="w-full pl-9 pr-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </motion.div>
          )}

          <div className="space-y-1">
            {filteredServers.map((server, idx) => (
              <motion.div
                key={server.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.05 }}
              >
                <WorkspaceItem
                  workspace={server}
                  isActive={activeServerId === server.id}
                  onClick={() => onServerSelect(server)}
                  isExpanded={expandedServers.has(server.id)}
                  onToggleExpand={() => toggleServerExpand(server.id)}
                />
              </motion.div>
            ))}
          </div>

          {filteredServers.length === 0 && searchQuery && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-zinc-500 text-sm"
            >
              No workspaces found
            </motion.div>
          )}
        </div>
      )}

      {/* Bottom actions */}
      {!isCollapsed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-3 border-t border-zinc-800/50 space-y-1"
        >
          <NavButton 
            icon={Settings} 
            label="Settings" 
            onClick={onSettingsClick}
          />
        </motion.div>
      )}
    </motion.div>
  );
}