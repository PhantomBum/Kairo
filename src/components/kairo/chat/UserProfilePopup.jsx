import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, UserPlus, Ban, Calendar, Users, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import UserBadges from '../UserBadges';

export default function UserProfilePopup({ 
  user, 
  isOpen, 
  onClose, 
  onMessage, 
  onAddFriend,
  onBlock,
  sharedServers = [],
  roles = [],
  currentUserId
}) {
  if (!isOpen || !user) return null;

  const isOwnProfile = user.user_id === currentUserId || user.id === currentUserId;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[380px] max-w-[90vw]"
          >
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-[#1a1a1d] to-[#0d0d0f] border border-white/10 shadow-2xl">
              {/* Banner */}
              <div className="relative h-28">
                {user.banner_url ? (
                  <img 
                    src={user.banner_url} 
                    alt="" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full"
                    style={{
                      background: user.accent_color 
                        ? `linear-gradient(135deg, ${user.accent_color}80, ${user.accent_color}40)`
                        : 'linear-gradient(135deg, #8b5cf680, #6366f140)'
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1d] via-transparent to-transparent" />
                
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Avatar */}
              <div className="relative px-5 -mt-12">
                <div className="relative inline-block">
                  <div className="w-20 h-20 rounded-2xl bg-[#1a1a1d] p-1 shadow-xl">
                    <div className="w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-violet-500 to-indigo-600">
                      {user.avatar_url || user.avatar ? (
                        <img 
                          src={user.avatar_url || user.avatar} 
                          alt="" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                          {(user.display_name || user.user_name || user.name)?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Status indicator */}
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[#1a1a1d]",
                    user.status === 'online' ? 'bg-emerald-400' :
                    user.status === 'idle' ? 'bg-amber-400' :
                    user.status === 'dnd' ? 'bg-rose-400' : 'bg-zinc-500'
                  )} />
                </div>
              </div>

              {/* User Info */}
              <div className="px-5 pt-3 pb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">
                    {user.display_name || user.user_name || user.name || 'Unknown'}
                  </h2>
                  <UserBadges badges={user.badges} size="sm" />
                </div>
                <p className="text-sm text-zinc-500">@{user.username || user.user_email?.split('@')[0] || 'user'}</p>
                
                {/* Custom status */}
                {user.custom_status?.text && (
                  <p className="mt-2 text-sm text-zinc-400 italic">"{user.custom_status.text}"</p>
                )}

                {/* Bio */}
                {user.bio && (
                  <p className="mt-3 text-sm text-zinc-300">{user.bio}</p>
                )}
              </div>

              {/* Info Cards */}
              <div className="px-5 pb-4 space-y-3">
                {/* Member Since */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Member Since</p>
                    <p className="text-sm text-white font-medium">
                      {user.created_date ? format(new Date(user.created_date), 'MMMM d, yyyy') : 'Unknown'}
                    </p>
                  </div>
                </div>

                {/* Roles */}
                {roles.length > 0 && (
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-2">Roles</p>
                    <div className="flex flex-wrap gap-1.5">
                      {roles.map((role, i) => (
                        <span 
                          key={i}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium"
                          style={{ 
                            backgroundColor: `${role.color || '#8b5cf6'}20`,
                            color: role.color || '#8b5cf6'
                          }}
                        >
                          {role.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shared Servers */}
                {sharedServers.length > 0 && (
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold mb-2">Shared Servers</p>
                    <div className="flex gap-2">
                      {sharedServers.slice(0, 5).map((server, i) => (
                        <div 
                          key={i}
                          className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden"
                          title={server.name}
                        >
                          {server.icon_url ? (
                            <img src={server.icon_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-white">{server.name?.charAt(0)}</span>
                          )}
                        </div>
                      ))}
                      {sharedServers.length > 5 && (
                        <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                          <span className="text-xs font-bold text-zinc-400">+{sharedServers.length - 5}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {!isOwnProfile && (
                <div className="px-5 pb-5 space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onMessage?.(user); onClose(); }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-medium text-sm transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </button>
                    <button
                      onClick={() => { onAddFriend?.(user); onClose(); }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium text-sm transition-all"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Friend
                    </button>
                  </div>
                  <button
                    onClick={() => { onBlock?.(user); onClose(); }}
                    className="w-full flex items-center justify-center gap-2 py-2 text-red-400 hover:text-red-300 text-sm transition-all"
                  >
                    <Ban className="w-4 h-4" />
                    Block User
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}