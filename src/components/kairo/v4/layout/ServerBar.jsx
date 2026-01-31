import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Compass, MessageCircle, Sparkles, Download, FolderOpen, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

function ServerIcon({ server, isActive, onClick, hasNotification, unreadCount, onMarkRead, onLeave, onCopyInvite }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div 
                className="relative group"
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
              >
                {/* Glowing indicator pill */}
                <motion.div
                  className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 rounded-r-full"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ 
                    height: isActive ? 40 : isHovered ? 20 : hasNotification ? 8 : 0,
                    opacity: isActive || isHovered || hasNotification ? 1 : 0,
                    backgroundColor: isActive ? '#10b981' : '#fff'
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
                
                <motion.button
                  onClick={onClick}
                  className={cn(
                    'relative w-12 h-12 overflow-hidden transition-colors',
                    'flex items-center justify-center',
                    !server.icon_url && 'bg-gradient-to-br from-zinc-800 to-zinc-900'
                  )}
                  animate={{ 
                    borderRadius: isActive || isHovered ? 16 : 24,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Hover glow effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered && !isActive ? 1 : 0 }}
                  />
                  
                  {/* Active glow ring */}
                  {isActive && (
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      initial={{ boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)' }}
                      animate={{ boxShadow: '0 0 20px 2px rgba(16, 185, 129, 0.3)' }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  {server.icon_url ? (
                    <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-semibold text-lg relative z-10">
                      {server.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  )}
                </motion.button>
                
                {/* Unread badge with animation */}
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="absolute -bottom-1 -right-1 min-w-[20px] h-[20px] px-1.5 bg-red-500 rounded-full text-[11px] font-bold text-white flex items-center justify-center border-2 border-[#09090b] shadow-lg shadow-red-500/30"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={12} className="bg-[#18181b]/95 backdrop-blur-xl border-white/[0.1] shadow-xl">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{server.name}</span>
                {server.features?.includes('boosted') && (
                  <Zap className="w-3.5 h-3.5 text-pink-400" />
                )}
              </div>
              {server.member_count && (
                <p className="text-xs text-zinc-500">{server.member_count} members</p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48 bg-[#18181b]/95 backdrop-blur-xl border-white/[0.1]">
        <ContextMenuItem onClick={onMarkRead} className="text-zinc-300 focus:text-white focus:bg-white/[0.08]">
          Mark as Read
        </ContextMenuItem>
        <ContextMenuItem onClick={onCopyInvite} className="text-zinc-300 focus:text-white focus:bg-white/[0.08]">
          Copy Invite Link
        </ContextMenuItem>
        <ContextMenuSeparator className="bg-white/[0.08]" />
        <ContextMenuItem onClick={onLeave} className="text-red-400 focus:text-red-300 focus:bg-red-500/10">
          Leave Server
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

function ActionButton({ icon: Icon, label, onClick, isActive, badge, gradient, glowColor }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={onClick}
            className={cn(
              'relative w-12 h-12 flex items-center justify-center overflow-hidden',
              gradient || 'bg-gradient-to-br from-zinc-800 to-zinc-900'
            )}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            animate={{ 
              borderRadius: isActive || isHovered ? 16 : 24,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Active/hover glow */}
            <motion.div
              className="absolute inset-0"
              style={{ background: glowColor || 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3))' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: isActive || isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            />
            
            {isActive && (
              <motion.div
                className="absolute inset-0"
                animate={{ 
                  boxShadow: `0 0 24px 4px ${glowColor?.includes('emerald') ? 'rgba(16, 185, 129, 0.4)' : 'rgba(99, 102, 241, 0.4)'}` 
                }}
              />
            )}
            
            <Icon className={cn(
              'w-5 h-5 relative z-10 transition-colors',
              isActive ? 'text-white' : 'text-zinc-400'
            )} />
            
            <AnimatePresence>
              {badge > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -bottom-1 -right-1 min-w-[20px] h-[20px] px-1.5 bg-red-500 rounded-full text-[11px] font-bold text-white flex items-center justify-center border-2 border-[#09090b] shadow-lg shadow-red-500/30"
                >
                  {badge > 99 ? '99+' : badge}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={12} className="bg-[#18181b]/95 backdrop-blur-xl border-white/[0.1] shadow-xl">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function Divider() {
  return (
    <div className="w-8 h-[2px] rounded-full bg-gradient-to-r from-transparent via-white/[0.15] to-transparent my-2" />
  );
}

export default function ServerBar({
  servers = [],
  activeServerId,
  onServerSelect,
  onDMsClick,
  onDiscoverClick,
  onCreateServer,
  onJoinServer,
  isDMsActive,
  unreadDMs = 0,
  onNitro,
}) {
  return (
    <div className="w-[72px] h-full bg-gradient-to-b from-[#0a0a0b] to-[#09090b] flex flex-col items-center py-3 gap-2 relative">
      {/* Subtle side glow */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/[0.06] to-transparent" />
      
      {/* Home / DMs button */}
      <ActionButton
        icon={MessageCircle}
        label="Direct Messages"
        onClick={onDMsClick}
        isActive={isDMsActive}
        badge={unreadDMs}
        glowColor="linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(6, 182, 212, 0.4))"
      />
      
      <Divider />
      
      {/* Server list with scroll fade */}
      <div className="flex-1 w-full overflow-y-auto scrollbar-none flex flex-col items-center gap-2 px-3 relative mask-fade-y">
        <AnimatePresence mode="popLayout">
          {servers.map((server, index) => (
            <motion.div
              key={server.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.03 }}
            >
              <ServerIcon
                server={server}
                isActive={activeServerId === server.id}
                onClick={() => onServerSelect(server)}
                hasNotification={server.has_activity}
                unreadCount={server.unread || 0}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <Divider />
      
      {/* Add server */}
      <ActionButton
        icon={Plus}
        label="Add a Server"
        onClick={onCreateServer}
        gradient="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20"
        glowColor="linear-gradient(135deg, rgba(16, 185, 129, 0.4), rgba(16, 185, 129, 0.2))"
      />
      
      {/* Discover */}
      <ActionButton
        icon={Compass}
        label="Explore Public Servers"
        onClick={onDiscoverClick}
        gradient="bg-gradient-to-br from-indigo-600/20 to-purple-800/20"
        glowColor="linear-gradient(135deg, rgba(99, 102, 241, 0.4), rgba(139, 92, 246, 0.4))"
      />
      
      {/* Nitro */}
      <ActionButton
        icon={Sparkles}
        label="Kairo Premium"
        onClick={onNitro}
        gradient="bg-gradient-to-br from-purple-600/30 to-pink-600/30"
        glowColor="linear-gradient(135deg, rgba(168, 85, 247, 0.5), rgba(236, 72, 153, 0.5))"
      />
      
      <style>{`
        .mask-fade-y {
          mask-image: linear-gradient(to bottom, transparent, black 8px, black calc(100% - 8px), transparent);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 8px, black calc(100% - 8px), transparent);
        }
      `}</style>
    </div>
  );
}