import React from 'react';
import { motion } from 'framer-motion';
import { X, MessageSquare, Globe, Github } from 'lucide-react';

const statusColors = { online: '#7bc9a4', idle: '#c9b47b', dnd: '#c97b7b', invisible: '#555248', offline: '#555248' };
const statusLabels = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', invisible: 'Invisible', offline: 'Offline' };

export default function UserProfileModal({ onClose, profile, memberData, roles, isCurrentUser, onMessage }) {
  if (!profile) return null;
  const memberRoles = (roles || []).filter(r => memberData?.role_ids?.includes(r.id) && !r.is_default);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-[340px] rounded-2xl overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }}
        onClick={e => e.stopPropagation()}>
        {/* Banner */}
        <div className="h-24 relative" style={{ background: profile.banner_url ? `url(${profile.banner_url}) center/cover` : `linear-gradient(135deg, var(--bg-overlay), var(--bg-surface))` }}>
          <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-lg" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
        {/* Avatar */}
        <div className="px-4 -mt-10 relative z-10">
          <div className="relative inline-block">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-medium overflow-hidden"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '4px solid var(--bg-elevated)' }}>
              {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : (profile.display_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full border-3"
              style={{ background: statusColors[profile.status || 'offline'], borderColor: 'var(--bg-elevated)', borderWidth: 3 }} />
          </div>
        </div>
        {/* Info */}
        <div className="px-4 pt-2 pb-4">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-lg font-bold" style={{ color: 'var(--text-cream)' }}>{profile.display_name || profile.username}</h3>
            {profile.badges?.includes('owner') && <span className="text-[8px] px-1.5 rounded font-mono" style={{ background: 'rgba(201,180,123,0.15)', color: 'var(--accent-amber)' }}>OWNER</span>}
          </div>
          {profile.username && <p className="text-[12px] font-mono" style={{ color: 'var(--text-secondary)' }}>@{profile.username}</p>}
          {profile.pronouns && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{profile.pronouns}</p>}
          <p className="text-[11px] mt-1" style={{ color: statusColors[profile.status || 'offline'] }}>
            {profile.custom_status?.emoji ? profile.custom_status.emoji + ' ' : ''}{profile.custom_status?.text || statusLabels[profile.status || 'offline']}
          </p>

          {/* Roles */}
          {memberRoles.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {memberRoles.map(r => (
                <span key={r.id} className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ border: `1px solid ${r.color}30`, color: r.color, background: `${r.color}10` }}>{r.name}</span>
              ))}
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <div className="mt-3 p-3 rounded-xl" style={{ background: 'var(--bg-glass)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>About</p>
              <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>{profile.bio}</p>
            </div>
          )}

          {/* Social */}
          {profile.social_links && Object.values(profile.social_links).some(Boolean) && (
            <div className="flex gap-2 mt-3">
              {profile.social_links.github && <a href={profile.social_links.github} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg glass hover:bg-[var(--bg-glass-hover)]"><Github className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /></a>}
              {profile.social_links.website && <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg glass hover:bg-[var(--bg-glass-hover)]"><Globe className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /></a>}
            </div>
          )}

          {/* Actions */}
          {!isCurrentUser && onMessage && (
            <button onClick={onMessage} className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>
              <MessageSquare className="w-4 h-4" /> Message
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}