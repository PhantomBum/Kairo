import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  X, MessageSquare, Globe, Github, Crown, ShieldCheck, Sparkles, Award, Heart,
  Calendar, Twitter, Instagram, Music, Code2, UserPlus, Ban, Eye, Gem,
  FlaskConical, Mic, Handshake, Youtube
} from 'lucide-react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import ReactMarkdown from 'react-markdown';
import { colors } from '@/components/app/design/tokens';

const statusColors = { online: '#3ba55c', idle: '#faa61a', dnd: '#ed4245', invisible: '#4f4f4f', offline: '#4f4f4f' };
const statusLabels = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', invisible: 'Invisible', offline: 'Offline' };

const badgeConfig = {
  owner:          { icon: Crown,       color: '#f0b232', bg: '#f0b23220', label: 'Server Owner' },
  admin:          { icon: ShieldCheck, color: '#5865F2', bg: '#5865F220', label: 'Admin' },
  premium:        { icon: Gem,         color: '#f0b232', bg: '#f0b23220', label: 'Kairo Elite' },
  verified:       { icon: Award,       color: '#3ba55c', bg: '#3ba55c20', label: 'Verified' },
  early_supporter:{ icon: Heart,       color: '#ed4245', bg: '#ed424520', label: 'Early Supporter' },
  bug_hunter:     { icon: FlaskConical,color: '#faa61a', bg: '#faa61a20', label: 'Bug Hunter' },
  developer:      { icon: Code2,       color: '#a78bfa', bg: '#a78bfa20', label: 'Developer' },
  moderator:      { icon: Eye,         color: '#2ecc71', bg: '#2ecc7120', label: 'Moderator' },
  partner:        { icon: Handshake,   color: '#5865F2', bg: '#5865F220', label: 'Partner' },
  youtube:        { icon: Youtube,     color: '#ff0000', bg: '#ff000020', label: 'Creator' },
  tester:         { icon: Sparkles,    color: '#00d4aa', bg: '#00d4aa20', label: 'Tester' },
};

const socialIcons = { github: Github, twitter: Twitter, website: Globe, instagram: Instagram, spotify: Music, tiktok: Mic, twitch: Globe, linkedin: Globe };

function ProfileBadge({ badge }) {
  const [hovered, setHovered] = useState(false);
  const cfg = badgeConfig[badge];
  if (!cfg) return null;
  const Icon = cfg.icon;

  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center cursor-default transition-transform hover:scale-110"
        style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
        <Icon className="w-4 h-4" style={{ color: cfg.color }} />
      </div>
      {hovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg whitespace-nowrap z-50 k-fade-in pointer-events-none"
          style={{ background: '#111', border: `1px solid ${colors.border.strong}`, boxShadow: '0 4px 16px rgba(0,0,0,0.6)' }}>
          <p className="text-[11px] font-semibold text-center" style={{ color: cfg.color }}>{cfg.label}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] w-0 h-0"
            style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #111' }} />
        </div>
      )}
    </div>
  );
}

export default function UserProfileModal({ onClose, profile, memberData, roles, isCurrentUser, onMessage, onAddFriend, onBlock, friends = [], mutualServers = [] }) {
  const { profiles } = useProfiles();

  if (!profile) return null;

  const memberRoles = (roles || []).filter(r => memberData?.role_ids?.includes(r.id) && !r.is_default);
  const defaultRole = (roles || []).find(r => r.is_default);
  const allDisplayRoles = [...memberRoles, ...(defaultRole ? [defaultRole] : [])];
  const hasBadges = profile.badges?.length > 0;
  const hasSocial = profile.social_links && Object.values(profile.social_links).some(Boolean);
  const joinDate = memberData?.joined_at || profile.created_date;
  const formattedJoin = joinDate ? new Date(joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
  const isFriend = friends?.some(f => f.friend_id === profile.user_id);
  const statusText = profile.custom_status?.text || '';
  const accentColor = profile.accent_color || '#5865F2';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 30, stiffness: 400 }}
        className="w-full max-w-[360px] rounded-2xl overflow-hidden"
        style={{ background: colors.bg.modal, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        onClick={e => e.stopPropagation()}>

        {/* Accent strip + close */}
        <div className="h-20 relative overflow-hidden">
          {profile.banner_url ? (
            <img src={profile.banner_url} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}60 60%, ${colors.bg.modal})` }} />
          )}
          <button onClick={onClose}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[rgba(255,255,255,0.15)]"
            style={{ background: 'rgba(0,0,0,0.4)' }}>
            <X className="w-3.5 h-3.5 text-white/80" />
          </button>
        </div>

        {/* Avatar row */}
        <div className="px-4 -mt-10 flex items-end justify-between">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-bold"
              style={{ background: colors.bg.elevated, color: colors.text.muted, border: `3px solid ${colors.bg.modal}`, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                : (profile.display_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full"
              style={{ background: statusColors[profile.status || 'offline'], border: `3px solid ${colors.bg.modal}` }} />
          </div>

          {/* Status pill */}
          <div className="mb-1 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: colors.bg.overlay }}>
            <div className="w-2 h-2 rounded-full" style={{ background: statusColors[profile.status || 'offline'] }} />
            <span className="text-[11px] font-medium" style={{ color: colors.text.secondary }}>
              {statusLabels[profile.status || 'offline']}
            </span>
          </div>
        </div>

        {/* Identity */}
        <div className="px-4 pt-3 pb-1">
          <h3 className="text-lg font-bold leading-snug" style={{ color: colors.text.primary }}>
            {profile.display_name || profile.username}
          </h3>
          {profile.username && (
            <p className="text-[12px] -mt-0.5" style={{ color: colors.text.muted }}>@{profile.username}</p>
          )}

          {/* Custom status */}
          {statusText && (
            <p className="text-[12px] mt-1.5 flex items-center gap-1" style={{ color: colors.text.secondary }}>
              {profile.custom_status?.emoji && <span>{profile.custom_status.emoji}</span>}
              {statusText}
            </p>
          )}
        </div>

        {/* Badges row */}
        {hasBadges && (
          <div className="px-4 pt-1 pb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {profile.badges.map(b => <ProfileBadge key={b} badge={b} />)}
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="mx-4 h-px" style={{ background: colors.border.default }} />

        {/* Content sections */}
        <div className="px-4 py-3 space-y-3 max-h-[280px] overflow-y-auto scrollbar-thin">

          {/* Bio */}
          {profile.bio && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: colors.text.muted }}>About</p>
              <div className="text-[13px] leading-relaxed prose prose-sm prose-invert max-w-none" style={{ color: colors.text.secondary }}>
                <ReactMarkdown>{profile.bio}</ReactMarkdown>
              </div>
            </div>
          )}

          {/* Member since */}
          {formattedJoin && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.text.muted }} />
              <span className="text-[12px]" style={{ color: colors.text.muted }}>Joined <span style={{ color: colors.text.secondary }}>{formattedJoin}</span></span>
            </div>
          )}

          {/* Roles */}
          {allDisplayRoles.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.text.muted }}>Roles</p>
              <div className="flex flex-wrap gap-1">
                {allDisplayRoles.map(r => (
                  <span key={r.id} className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: `${r.color || colors.text.muted}15`, color: r.color || colors.text.muted }}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color || colors.text.muted }} />
                    {r.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mutual servers */}
          {mutualServers.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.text.muted }}>
                {mutualServers.length} Mutual Server{mutualServers.length !== 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {mutualServers.map(s => (
                  <div key={s.id} className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                    style={{ background: s.banner_color || colors.bg.overlay }}
                    title={s.name}>
                    {s.icon_url
                      ? <img src={s.icon_url} className="w-full h-full object-cover" alt={s.name} />
                      : <span className="text-[10px] font-bold" style={{ color: colors.text.muted }}>{(s.name || '').slice(0, 2).toUpperCase()}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social */}
          {hasSocial && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.text.muted }}>Connections</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(profile.social_links).filter(([, v]) => v).map(([key, url]) => {
                  const Icon = socialIcons[key] || Globe;
                  return (
                    <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] transition-colors hover:bg-[rgba(255,255,255,0.06)]"
                      style={{ background: colors.bg.overlay, color: colors.text.secondary }}>
                      <Icon className="w-3 h-3" /> <span className="capitalize">{key}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isCurrentUser && (
          <div className="px-4 pb-4 pt-1 flex gap-2">
            {onMessage && isFriend && (
              <button onClick={onMessage}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold transition-all hover:brightness-125"
                style={{ background: colors.accent.primary, color: '#fff' }}>
                <MessageSquare className="w-3.5 h-3.5" /> Message
              </button>
            )}
            {!isFriend && onAddFriend && (
              <button onClick={() => onAddFriend(profile)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold transition-all hover:brightness-125"
                style={{ background: colors.accent.primary, color: '#fff' }}>
                <UserPlus className="w-3.5 h-3.5" /> Add Friend
              </button>
            )}
            {onBlock && (
              <button onClick={() => onBlock(profile)}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all hover:bg-[rgba(255,255,255,0.06)]"
                style={{ background: colors.bg.overlay, color: colors.text.muted }}>
                <Ban className="w-3.5 h-3.5" /> Block
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}