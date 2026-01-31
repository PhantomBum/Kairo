import React from 'react';
import { motion } from 'framer-motion';
import { X, MessageCircle, UserPlus, MoreHorizontal, Check, Shield, Crown, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../ui/Avatar';

const BADGE_CONFIG = {
  owner: { label: 'Server Owner', icon: Crown, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  admin: { label: 'Admin', icon: Shield, color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  moderator: { label: 'Moderator', icon: Shield, color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
  verified: { label: 'Verified', icon: Check, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  premium: { label: 'Premium', icon: Star, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  early_supporter: { label: 'Early Supporter', icon: Star, color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
};

export default function UserProfilePopup({ user, onClose, onMessage }) {
  const badges = user?.badges || [];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Popup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ type: 'spring', duration: 0.3 }}
        className="absolute left-14 top-0 z-50 w-72 bg-[#111113] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Banner */}
        <div 
          className="h-16 relative"
          style={{ 
            background: user?.banner_color || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%)' 
          }}
        />

        {/* Content */}
        <div className="px-4 pb-4 -mt-8">
          {/* Avatar */}
          <div className="relative inline-block mb-3">
            <div className="w-20 h-20 rounded-full bg-[#111113] p-1.5">
              <Avatar src={user?.avatar} name={user?.name} size="xl" status={user?.status} />
            </div>
          </div>

          {/* Name and badges */}
          <div className="mb-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{user?.name}</h3>
              {badges.includes('verified') && (
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            {user?.username && (
              <p className="text-sm text-zinc-500">@{user.username}</p>
            )}
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {badges.map((badge) => {
                const config = BADGE_CONFIG[badge];
                if (!config) return null;
                const Icon = config.icon;
                return (
                  <div
                    key={badge}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border',
                      config.color
                    )}
                  >
                    <Icon className="w-3 h-3" />
                    {config.label}
                  </div>
                );
              })}
            </div>
          )}

          {/* Bio */}
          {user?.bio && (
            <div className="mb-4 p-3 bg-white/[0.03] rounded-lg">
              <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1">About Me</p>
              <p className="text-sm text-zinc-300">{user.bio}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => { onMessage?.(user); onClose(); }}
              className="flex-1 flex items-center justify-center gap-2 h-9 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Message
            </button>
            <button className="w-9 h-9 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}