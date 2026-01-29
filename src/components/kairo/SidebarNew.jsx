import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, Users, Settings, 
  ChevronDown, Plus, Search,
  Compass, User, Calendar, Bookmark, Layers
} from 'lucide-react';
import { cn } from '@/lib/utils';

function ServerIcon({ server, isActive, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative group"
    >
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200",
        isActive 
          ? "bg-indigo-500 rounded-xl" 
          : "bg-zinc-800 group-hover:bg-indigo-500 group-hover:rounded-xl"
      )}>
        {server.icon_url ? (
          <img src={server.icon_url} alt="" className="w-full h-full object-cover rounded-2xl group-hover:rounded-xl transition-all" />
        ) : (
          <span className={cn(
            "text-lg font-bold transition-colors",
            isActive ? "text-white" : "text-zinc-400 group-hover:text-white"
          )}>
            {server.name?.charAt(0)}
          </span>
        )}
      </div>
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-1 h-8 bg-white rounded-r-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </motion.button>
  );
}

function NavItem({ icon: Icon, label, onClick, isActive, badge }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative group w-12 h-12 flex items-center justify-center"
    >
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200",
        isActive 
          ? "bg-indigo-500 rounded-xl" 
          : "bg-zinc-800 group-hover:bg-indigo-500 group-hover:rounded-xl"
      )}>
        <Icon className={cn(
          "w-6 h-6 transition-colors",
          isActive ? "text-white" : "text-zinc-400 group-hover:text-white"
        )} />
      </div>
      {badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-1 h-8 bg-white rounded-r-full"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </motion.button>
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
  onEventsClick,
  onSavedClick,
  onSpacesClick,
  isDMsActive,
  userProfile,
  unreadDMs = 0
}) {
  return (
    <div className="w-[72px] h-full bg-[#0a0a0b] flex flex-col items-center py-3 gap-2">
      {/* User Avatar */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onProfileClick}
        className="relative mb-2"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
          {userProfile?.avatar_url ? (
            <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-white" />
          )}
        </div>
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-[#0a0a0b]",
          userProfile?.status === 'online' && "bg-emerald-500",
          userProfile?.status === 'idle' && "bg-amber-500",
          userProfile?.status === 'dnd' && "bg-red-500",
          (!userProfile?.status || userProfile?.status === 'offline') && "bg-zinc-500"
        )} />
      </motion.button>

      <div className="w-8 h-px bg-zinc-800 mb-1" />

      {/* Navigation */}
      <NavItem icon={MessageCircle} label="DMs" onClick={onDMsClick} isActive={isDMsActive} badge={unreadDMs} />
      <NavItem icon={Users} label="Friends" onClick={onFriendsClick} />
      <NavItem icon={Compass} label="Discover" onClick={onDiscoverClick} />
      <NavItem icon={Calendar} label="Events" onClick={onEventsClick} />
      <NavItem icon={Bookmark} label="Saved" onClick={onSavedClick} />
      <NavItem icon={Layers} label="Spaces" onClick={onSpacesClick} />

      <div className="w-8 h-px bg-zinc-800 my-1" />

      {/* Servers */}
      <div className="flex-1 overflow-y-auto scrollbar-none flex flex-col gap-2">
        {servers.map((server) => (
          <ServerIcon
            key={server.id}
            server={server}
            isActive={activeServerId === server.id}
            onClick={() => onServerSelect(server)}
          />
        ))}
      </div>

      {/* Create Server */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCreateServer}
        className="w-12 h-12 rounded-2xl bg-zinc-800 hover:bg-emerald-500 hover:rounded-xl flex items-center justify-center text-emerald-500 hover:text-white transition-all duration-200 group mt-auto"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Settings */}
      <NavItem icon={Settings} label="Settings" onClick={onSettingsClick} />
    </div>
  );
}