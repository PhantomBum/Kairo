import React from 'react';
import { motion } from 'framer-motion';
import { X, MessageCircle, UserPlus, MoreHorizontal, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const statusColors = {
  online: 'bg-emerald-500',
  idle: 'bg-amber-500',
  dnd: 'bg-red-500',
  invisible: 'bg-zinc-500',
  offline: 'bg-zinc-600'
};

export default function ProfileModal({ 
  isOpen, 
  onClose, 
  profile,
  serverMember,
  roles = [],
  onMessage,
  onAddFriend,
  isFriend = false
}) {
  if (!isOpen || !profile) return null;

  const memberRoles = serverMember?.role_ids?.map(id => roles.find(r => r.id === id)).filter(Boolean) || [];
  const accentColor = profile.accent_color || '#6366f1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md mx-4 bg-[#121214] rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Banner */}
        <div 
          className="h-32 relative"
          style={{ 
            background: profile.banner_url 
              ? `url(${profile.banner_url}) center/cover`
              : `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 bg-black/50 rounded-full text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 -mt-12">
          {/* Avatar and actions */}
          <div className="flex items-end justify-between mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-[6px] border-[#121214] overflow-hidden bg-zinc-800">
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl font-bold">
                    {profile.display_name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div className={cn(
                "absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-[#121214]",
                statusColors[profile.status] || statusColors.offline
              )} />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={onMessage}
                size="sm"
                className="bg-indigo-500 hover:bg-indigo-600"
              >
                <MessageCircle className="w-4 h-4 mr-1.5" />
                Message
              </Button>
              {!isFriend && (
                <Button
                  onClick={onAddFriend}
                  size="sm"
                  variant="secondary"
                  className="bg-zinc-800 hover:bg-zinc-700"
                >
                  <UserPlus className="w-4 h-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="secondary"
                className="bg-zinc-800 hover:bg-zinc-700"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Name and username */}
          <div className="bg-zinc-900/50 rounded-lg p-4 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-white">{profile.display_name}</h2>
              <p className="text-sm text-zinc-400">@{profile.username}</p>
              {profile.pronouns && (
                <p className="text-xs text-zinc-500 mt-1">{profile.pronouns}</p>
              )}
            </div>

            {/* Custom status */}
            {profile.custom_status?.text && (
              <p className="text-sm text-zinc-300 flex items-center gap-2">
                {profile.custom_status.emoji && <span>{profile.custom_status.emoji}</span>}
                {profile.custom_status.text}
              </p>
            )}

            {/* Divider */}
            <div className="h-px bg-zinc-800" />

            {/* About */}
            {profile.bio && (
              <div>
                <h3 className="text-xs font-semibold uppercase text-zinc-400 mb-2">About Me</h3>
                <p className="text-sm text-zinc-300 whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            {/* Member since */}
            {serverMember?.joined_at && (
              <div>
                <h3 className="text-xs font-semibold uppercase text-zinc-400 mb-2">Member Since</h3>
                <p className="text-sm text-zinc-300">
                  {format(new Date(serverMember.joined_at), 'MMM d, yyyy')}
                </p>
              </div>
            )}

            {/* Roles */}
            {memberRoles.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase text-zinc-400 mb-2">Roles</h3>
                <div className="flex flex-wrap gap-1.5">
                  {memberRoles.map((role) => (
                    <span
                      key={role.id}
                      className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1.5"
                      style={{ 
                        backgroundColor: `${role.color || '#6b7280'}20`,
                        color: role.color || '#9ca3af'
                      }}
                    >
                      <div 
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: role.color || '#6b7280' }}
                      />
                      {role.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Connections */}
            {profile.connections?.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase text-zinc-400 mb-2">Connections</h3>
                <div className="space-y-2">
                  {profile.connections.map((conn, i) => (
                    <a
                      key={i}
                      href={conn.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-zinc-300 hover:text-white transition-colors"
                    >
                      <Link2 className="w-4 h-4" />
                      {conn.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}