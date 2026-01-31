import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Compass, MessageCircle, Sparkles, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import Tooltip from '../ui/Tooltip';

function ServerIcon({ server, isActive, onClick, hasNotification, mentionCount }) {
  return (
    <Tooltip content={server.name} side="right">
      <motion.div className="relative group">
        {/* Pill indicator */}
        <motion.div 
          className={cn(
            'absolute -left-3 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-white transition-all',
            isActive ? 'h-10' : hasNotification ? 'h-2' : 'h-0 group-hover:h-5'
          )}
          layout
        />
        
        <motion.button
          onClick={onClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'relative w-12 h-12 overflow-hidden transition-all duration-200',
            isActive ? 'rounded-2xl' : 'rounded-[24px] hover:rounded-2xl'
          )}
        >
          {server.icon_url ? (
            <img 
              src={server.icon_url} 
              alt={server.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className={cn(
              'w-full h-full flex items-center justify-center text-lg font-semibold transition-all',
              isActive 
                ? 'bg-indigo-600 text-white' 
                : 'bg-[#1e1e21] text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white'
            )}>
              {server.name?.charAt(0)?.toUpperCase()}
            </div>
          )}

          {/* Mention badge */}
          {mentionCount > 0 && (
            <div className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-[#0a0a0b]">
              {mentionCount > 99 ? '99+' : mentionCount}
            </div>
          )}
        </motion.button>
      </motion.div>
    </Tooltip>
  );
}

function ActionButton({ icon: Icon, label, onClick, accent, notification, ping }) {
  return (
    <Tooltip content={label} side="right">
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'relative w-12 h-12 rounded-[24px] flex items-center justify-center transition-all duration-200',
          'hover:rounded-2xl',
          accent 
            ? 'bg-emerald-600 text-white hover:bg-emerald-500' 
            : 'bg-[#1e1e21] text-zinc-400 hover:bg-indigo-600 hover:text-white'
        )}
      >
        <Icon className="w-5 h-5" />
        {notification > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-[#0a0a0b]">
            {notification > 9 ? '9+' : notification}
          </div>
        )}
        {ping && (
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0a0a0b]" />
        )}
      </motion.button>
    </Tooltip>
  );
}

function Separator() {
  return <div className="w-8 h-0.5 bg-white/[0.06] rounded-full mx-auto my-2" />;
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
  unreadDMs = 0,
}) {
  return (
    <div className="w-[72px] h-full bg-[#0c0c0d] flex flex-col items-center py-3 gap-2">
      {/* Home / DMs button */}
      <Tooltip content="Direct Messages" side="right">
        <motion.div className="relative group">
          {/* Pill indicator */}
          <motion.div 
            className={cn(
              'absolute -left-3 top-1/2 -translate-y-1/2 w-1 rounded-r-full bg-white transition-all',
              isDMsActive ? 'h-10' : unreadDMs > 0 ? 'h-2' : 'h-0 group-hover:h-5'
            )}
            layout
          />
          
          <motion.button
            onClick={onDMsClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'relative w-12 h-12 flex items-center justify-center transition-all duration-200',
              isDMsActive 
                ? 'rounded-2xl bg-indigo-600 text-white' 
                : 'rounded-[24px] bg-[#1e1e21] text-zinc-400 hover:rounded-2xl hover:bg-indigo-600 hover:text-white'
            )}
          >
            <MessageCircle className="w-5 h-5" />
            {(pendingRequests > 0 || unreadDMs > 0) && (
              <div className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-[#0c0c0d]">
                {pendingRequests + unreadDMs}
              </div>
            )}
          </motion.button>
        </motion.div>
      </Tooltip>
      
      <Separator />
      
      {/* Servers */}
      <div className="flex-1 overflow-y-auto scrollbar-none space-y-2 w-full px-3 py-1">
        <AnimatePresence>
          {servers.map((server, index) => (
            <motion.div
              key={server.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.02 }}
            >
              <ServerIcon
                server={server}
                isActive={activeServerId === server.id}
                onClick={() => onServerSelect(server)}
                hasNotification={server.has_notification}
                mentionCount={server.mention_count}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <Separator />
      
      {/* Add server */}
      <ActionButton 
        icon={Plus} 
        label="Add a Server" 
        onClick={onCreateServer} 
        accent 
      />
      
      {/* Discover */}
      <ActionButton 
        icon={Compass} 
        label="Explore Discoverable Servers" 
        onClick={onDiscoverClick} 
      />

      {/* Download app CTA */}
      <div className="mt-2">
        <Tooltip content="Download App" side="right">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-12 h-12 rounded-[24px] hover:rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center transition-all duration-200 shadow-lg shadow-indigo-500/20"
          >
            <Download className="w-5 h-5" />
          </motion.button>
        </Tooltip>
      </div>
    </div>
  );
}