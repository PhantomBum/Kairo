import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, MessageSquare, Globe, Github, Crown, Shield, Star, Zap, Heart, Calendar, Clock, Twitter, Instagram, Music, Gamepad2 } from 'lucide-react';

const statusColors = { online: '#7bc9a4', idle: '#c9b47b', dnd: '#c97b7b', invisible: '#555248', offline: '#555248' };
const statusLabels = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', invisible: 'Invisible', offline: 'Offline' };

const badgeConfig = {
  owner: { icon: Crown, color: '#c9b47b', label: 'Server Owner' },
  admin: { icon: Shield, color: '#7ba4c9', label: 'Admin' },
  premium: { icon: Crown, color: '#c9b47b', label: 'Kairo Elite' },
  verified: { icon: Star, color: '#7bc9a4', label: 'Verified' },
  early_supporter: { icon: Heart, color: '#c97b7b', label: 'Early Supporter' },
  bug_hunter: { icon: Zap, color: '#c9b47b', label: 'Bug Hunter' },
  developer: { icon: Gamepad2, color: '#a47bc9', label: 'Developer' },
  moderator: { icon: Shield, color: '#7bc9a4', label: 'Moderator' },
  partner: { icon: Star, color: '#7ba4c9', label: 'Partner' },
  youtube: { icon: Globe, color: '#c97b7b', label: 'YouTuber' },
};

const socialIcons = {
  github: Github, twitter: Twitter, website: Globe, instagram: Instagram,
  spotify: Music, tiktok: Globe, twitch: Globe, linkedin: Globe,
};

export default function UserProfileModal({ onClose, profile, memberData, roles, isCurrentUser, onMessage }) {
  const [activeTab, setActiveTab] = useState('about');
  if (!profile) return null;
  const memberRoles = (roles || []).filter(r => memberData?.role_ids?.includes(r.id) && !r.is_default);
  const hasBadges = profile.badges?.length > 0;
  const hasSocial = profile.social_links && Object.values(profile.social_links).some(Boolean);
  const hasPresence = profile.rich_presence?.name;
  const joinDate = profile.created_date ? new Date(profile.created_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-[380px] rounded-2xl overflow-hidden" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-lg)' }}
        onClick={e => e.stopPropagation()}>
        {/* Banner */}
        <div className="h-28 relative" style={{ background: profile.banner_url ? `url(${profile.banner_url}) center/cover` : `linear-gradient(135deg, ${profile.accent_color || '#1a1a1a'}, var(--bg-surface))` }}>
          <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-lg" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {/* Avatar + Badges */}
        <div className="px-4 -mt-12 relative z-10 flex items-end justify-between">
          <div className="relative">
            <div className="w-[88px] h-[88px] rounded-full flex items-center justify-center text-3xl font-medium overflow-hidden"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '5px solid var(--bg-elevated)' }}>
              {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : (profile.display_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full" style={{ background: statusColors[profile.status || 'offline'], border: '3px solid var(--bg-elevated)' }} />
          </div>
          {hasBadges && (
            <div className="flex gap-1 mb-2">
              {profile.badges.map(b => {
                const cfg = badgeConfig[b];
                if (!cfg) return null;
                return (
                  <div key={b} className="w-7 h-7 rounded-lg flex items-center justify-center" title={cfg.label}
                    style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                    <cfg.icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-4 pt-2 pb-1">
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-cream)' }}>{profile.display_name || profile.username}</h3>
          {profile.username && <p className="text-[12px] font-mono" style={{ color: 'var(--text-secondary)' }}>@{profile.username}</p>}
          {profile.pronouns && <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{profile.pronouns}</p>}
          <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: statusColors[profile.status || 'offline'] }}>
            {profile.custom_status?.emoji ? profile.custom_status.emoji + ' ' : ''}{profile.custom_status?.text || statusLabels[profile.status || 'offline']}
          </p>
        </div>

        {/* Tabs */}
        <div className="px-4 mt-2 flex gap-1" style={{ borderBottom: '1px solid var(--border)' }}>
          {['about', 'activity', 'mutual'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className="px-3 py-2 text-[11px] capitalize transition-colors"
              style={{ color: activeTab === t ? 'var(--text-cream)' : 'var(--text-muted)', borderBottom: activeTab === t ? '2px solid var(--text-cream)' : '2px solid transparent' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-4 py-3 space-y-3 max-h-[300px] overflow-y-auto scrollbar-none">
          {activeTab === 'about' && <>
            {memberRoles.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Roles</p>
                <div className="flex flex-wrap gap-1">
                  {memberRoles.map(r => (
                    <span key={r.id} className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ border: `1px solid ${r.color}30`, color: r.color, background: `${r.color}10` }}>{r.name}</span>
                  ))}
                </div>
              </div>
            )}
            {profile.bio && (
              <div className="p-3 rounded-xl" style={{ background: 'var(--bg-glass)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>About Me</p>
                <p className="text-[12px] leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{profile.bio}</p>
              </div>
            )}
            {joinDate && (
              <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                <Calendar className="w-3 h-3" /> Member since {joinDate}
              </div>
            )}
            {profile.last_seen && !profile.is_online && (
              <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-faint)' }}>
                <Clock className="w-3 h-3" /> Last seen {new Date(profile.last_seen).toLocaleDateString()}
              </div>
            )}
            {hasSocial && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Connections</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(profile.social_links).filter(([_, v]) => v).map(([key, url]) => {
                    const Icon = socialIcons[key] || Globe;
                    return (
                      <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] transition-colors hover:bg-[var(--bg-glass-hover)]"
                        style={{ background: 'var(--bg-glass)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        <Icon className="w-3 h-3" /> {key}
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </>}
          {activeTab === 'activity' && (
            <div>
              {hasPresence ? (
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-glass)' }}>
                  <p className="text-[10px] uppercase mb-1.5" style={{ color: 'var(--text-muted)' }}>{profile.rich_presence.type || 'Playing'}</p>
                  <p className="text-[13px] font-medium" style={{ color: 'var(--text-cream)' }}>{profile.rich_presence.name}</p>
                  {profile.rich_presence.details && <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{profile.rich_presence.details}</p>}
                  {profile.rich_presence.state && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{profile.rich_presence.state}</p>}
                </div>
              ) : (
                <p className="text-center py-6 text-[11px]" style={{ color: 'var(--text-muted)' }}>No current activity</p>
              )}
            </div>
          )}
          {activeTab === 'mutual' && (
            <p className="text-center py-6 text-[11px]" style={{ color: 'var(--text-muted)' }}>Mutual servers and friends will appear here</p>
          )}
        </div>

        {/* Actions */}
        {!isCurrentUser && onMessage && (
          <div className="px-4 pb-4">
            <button onClick={onMessage} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>
              <MessageSquare className="w-4 h-4" /> Message
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}