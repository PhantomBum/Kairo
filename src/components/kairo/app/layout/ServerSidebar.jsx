import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Compass, MessageCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../ui/Avatar';
import Tooltip from '../ui/Tooltip';

function ServerIcon({ server, isActive, onClick }) {
  return (
    <Tooltip content={server.name} side="right">
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'relative w-12 h-12 rounded-2xl overflow-hidden transition-all duration-200',
          isActive 
            ? 'rounded-xl' 
            : 'hover:rounded-xl'
        )}
      >
        {/* Active indicator */}
        <div className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 rounded-full bg-white transition-all',
          isActive ? 'h-10' : 'h-0 group-hover:h-5'
        )} />
        
        {server.icon_url ? (
          <img 
            src={server.icon_url} 
            alt={server.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={cn(
            'w-full h-full flex items-center justify-center text-lg font-semibold',
            isActive 
              ? 'bg-indigo-600 text-white' 
              : 'bg-[#1a1a1c] text-zinc-400 hover:bg-indigo-600 hover:text-white'
          )}>
            {server.name?.charAt(0)}
          </div>
        )}
      </motion.button>
    </Tooltip>
  );
}

function ActionButton({ icon: Icon, label, onClick, accent, notification }) {
  return (
    <Tooltip content={label} side="right">
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200',
          'hover:rounded-xl',
          accent 
            ? 'bg-emerald-600 text-white hover:bg-emerald-500' 
            : 'bg-[#1a1a1c] text-zinc-400 hover:bg-indigo-600 hover:text-white'
        )}
      >
        <Icon className="w-5 h-5" />
        {notification && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
            {notification > 9 ? '9+' : notification}
          </div>
        )}
      </motion.button>
    </Tooltip>
  );
}

export default function ServerSidebar({
  servers = [],
  activeServerId,
  onServerSelect,
  onDMsClick,
  onCreateServer,
  onDiscoverClick,
  isDMsActive,
  pendingRequests = 0,
}) {
  return (
    <div className="w-[72px] h-full bg-[#0a0a0b] flex flex-col items-center py-3 gap-2">
      {/* DMs button */}
      <Tooltip content="Direct Messages" side="right">
        <motion.button
          onClick={onDMsClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200',
            isDMsActive 
              ? 'rounded-xl bg-indigo-600 text-white' 
              : 'bg-[#1a1a1c] text-zinc-400 hover:rounded-xl hover:bg-indigo-600 hover:text-white'
          )}
        >
          <MessageCircle className="w-5 h-5" />
          {pendingRequests > 0 && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {pendingRequests}
            </div>
          )}
        </motion.button>
      </Tooltip>
      
      {/* Divider */}
      <div className="w-8 h-0.5 bg-white/[0.06] rounded-full my-1" />
      
      {/* Servers */}
      <div className="flex-1 overflow-y-auto scrollbar-none space-y-2 w-full px-3">
        {servers.map((server) => (
          <ServerIcon
            key={server.id}
            server={server}
            isActive={activeServerId === server.id}
            onClick={() => onServerSelect(server)}
          />
        ))}
      </div>
      
      {/* Bottom actions */}
      <div className="w-8 h-0.5 bg-white/[0.06] rounded-full my-1" />
      
      <ActionButton icon={Plus} label="Create Server" onClick={onCreateServer} accent />
      <ActionButton icon={Compass} label="Discover Servers" onClick={onDiscoverClick} />
    </div>
  );
}