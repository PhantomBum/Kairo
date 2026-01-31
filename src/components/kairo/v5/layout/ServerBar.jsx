import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Compass, MessageCircle, Sparkles, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Server icon with fluid animations
function ServerIcon({ server, isActive, onClick, hasActivity, unreadCount }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div 
            className="relative group cursor-pointer"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={onClick}
          >
            {/* Activity indicator pill */}
            <motion.div
              className="absolute -left-[6px] top-1/2 -translate-y-1/2 w-[4px] rounded-r-full bg-white"
              initial={false}
              animate={{ 
                height: isActive ? 36 : isHovered ? 20 : hasActivity ? 8 : 0,
                opacity: isActive || isHovered || hasActivity ? 1 : 0,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
            
            <motion.div
              className={cn(
                'relative w-[48px] h-[48px] flex items-center justify-center overflow-hidden',
                'transition-shadow duration-300',
                !server.icon_url && 'bg-[#18181b]'
              )}
              animate={{ 
                borderRadius: isActive ? 16 : isHovered ? 18 : 24,
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              style={{
                boxShadow: isActive 
                  ? '0 0 0 2px rgba(99, 102, 241, 0.5), 0 8px 24px -8px rgba(99, 102, 241, 0.4)'
                  : isHovered 
                    ? '0 8px 24px -8px rgba(0, 0, 0, 0.6)'
                    : 'none'
              }}
            >
              {server.icon_url ? (
                <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[18px] font-semibold text-white/90 select-none">
                  {server.name?.charAt(0)?.toUpperCase() || 'S'}
                </span>
              )}
            </motion.div>
            
            {/* Unread badge */}
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-[#050506]"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={14} className="bg-[#1a1a1d] border-white/10 px-3 py-2 shadow-xl">
          <p className="font-semibold text-white text-sm">{server.name}</p>
          {server.member_count > 0 && (
            <p className="text-[11px] text-zinc-400 mt-0.5">{server.member_count.toLocaleString()} members</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Action button (Home, Add, Discover)
function ActionButton({ icon: Icon, label, onClick, isActive, badge, variant = 'default' }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const variants = {
    default: 'bg-[#18181b]',
    primary: 'bg-gradient-to-br from-indigo-600 to-violet-600',
    success: 'bg-gradient-to-br from-emerald-600 to-teal-600',
    premium: 'bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500',
  };
  
  return (
    <TooltipProvider delayDuration={50}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            onClick={onClick}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className={cn(
              'relative w-[48px] h-[48px] flex items-center justify-center overflow-hidden',
              variants[variant]
            )}
            animate={{ 
              borderRadius: isActive ? 16 : isHovered ? 18 : 24,
            }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            style={{
              boxShadow: isActive 
                ? '0 0 0 2px rgba(16, 185, 129, 0.5), 0 8px 24px -8px rgba(16, 185, 129, 0.4)'
                : isHovered 
                  ? variant === 'premium' 
                    ? '0 8px 32px -8px rgba(245, 158, 11, 0.5)'
                    : '0 8px 24px -8px rgba(0, 0, 0, 0.6)'
                  : 'none'
            }}
          >
            <Icon className={cn(
              'w-5 h-5 transition-colors',
              isActive || variant !== 'default' ? 'text-white' : 'text-zinc-400'
            )} />
            
            <AnimatePresence>
              {badge > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -bottom-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-[#050506]"
                >
                  {badge > 99 ? '99+' : badge}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={14} className="bg-[#1a1a1d] border-white/10 px-3 py-1.5 shadow-xl">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Separator
function Separator() {
  return (
    <div className="w-8 h-[2px] rounded-full bg-white/[0.08] mx-auto my-1.5" />
  );
}

export default function ServerBar({
  servers = [],
  activeServerId,
  onServerSelect,
  onDMsClick,
  onDiscoverClick,
  onCreateServer,
  isDMsActive,
  unreadDMs = 0,
  onNitro,
}) {
  return (
    <nav className="w-[72px] h-full bg-[#050506] flex flex-col items-center py-3 relative">
      {/* Right edge line */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-white/[0.04]" />
      
      {/* Home button */}
      <div className="relative mb-1">
        {isDMsActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute -left-[6px] top-1/2 -translate-y-1/2 w-[4px] h-9 rounded-r-full bg-white"
          />
        )}
        <ActionButton
          icon={Home}
          label="Home"
          onClick={onDMsClick}
          isActive={isDMsActive}
          badge={unreadDMs}
        />
      </div>
      
      <Separator />
      
      {/* Server list */}
      <div className="flex-1 w-full overflow-y-auto overflow-x-hidden scrollbar-none py-1 space-y-2 px-3">
        <AnimatePresence mode="popLayout">
          {servers.map((server, i) => (
            <motion.div
              key={server.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: i * 0.02, type: 'spring', stiffness: 400, damping: 25 }}
            >
              <ServerIcon
                server={server}
                isActive={activeServerId === server.id}
                onClick={() => onServerSelect(server)}
                hasActivity={server.has_activity}
                unreadCount={server.unread || 0}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <Separator />
      
      {/* Action buttons */}
      <div className="space-y-2 px-3">
        <ActionButton
          icon={Plus}
          label="Add a Server"
          onClick={onCreateServer}
          variant="success"
        />
        
        <ActionButton
          icon={Compass}
          label="Explore Servers"
          onClick={onDiscoverClick}
          variant="primary"
        />
        
        <ActionButton
          icon={Sparkles}
          label="Kairo Premium"
          onClick={onNitro}
          variant="premium"
        />
      </div>
    </nav>
  );
}