import React from 'react';
import { motion } from 'framer-motion';
import {
  X, MessageSquare, Globe, Github, Calendar, Twitter, Instagram, Music,
  UserPlus, Ban, Mic
} from 'lucide-react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import ReactMarkdown from 'react-markdown';
import { colors } from '@/components/app/design/tokens';
import ProfileBadge from '@/components/app/badges/ProfileBadge';
import { getOrderedBadges } from '@/components/app/badges/badgeConfig';
import ProfileEffectCanvas from '@/components/app/effects/ProfileEffectCanvas';

const statusColors = { online: '#3ba55c', idle: '#faa61a', dnd: '#ed4245', invisible: '#4f4f4f', offline: '#4f4f4f' };
const statusLabels = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', invisible: 'Invisible', offline: 'Offline' };
const socialIcons = { github: Github, twitter: Twitter, website: Globe, instagram: Instagram, spotify: Music, tiktok: Mic, twitch: Globe, linkedin: Globe };

export default function UserProfileModal({ onClose, profile, memberData, roles, isCurrentUser, onMessage, onAddFriend, onBlock, friends = [], mutualServers = [] }) {
  const { profiles } = useProfiles();
  if (!profile) return null;

  const memberRoles = (roles || []).filter(r => memberData?.role_ids?.includes(r.id) && !r.is_default);
  const defaultRole = (roles || []).find(r => r.is_default);
  const allDisplayRoles = [...memberRoles, ...(defaultRole ? [defaultRole] : [])];
  const orderedBadges = getOrderedBadges(profile.badges || [], profile.badge_order || []);
  const hasBadges = orderedBadges.length > 0;
  const hasSocial = profile.social_links && Object.values(profile.social_links).some(Boolean);
  const joinDate = memberData?.joined_at || profile.created_date;
  const formattedJoin = joinDate ? new Date(joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
  const isFriend = friends?.some(f => f.friend_id === profile.user_id);
  const statusText = profile.custom_status?.text || '';
  const accentColor = profile.accent_color || '#5865F2';
  const activeEffect = profile.profile_effect || 'none';

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

        {/* Banner with effect overlay */}
        <div className="h-20 relative overflow-hidden">
          {profile.banner_url ? (
            <img src={profile.banner_url} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}60 60%, ${colors.bg.modal})` }} />
          )}
          {/* Profile effect canvas — background only, never covers UI */}
          {activeEffect !== 'none' && (
            <ProfileEffectCanvas effect={activeEffect} width={360} height={80} />
          )}
          <button onClick={onClose}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[rgba(255,255,255,0.15)] z-10"
            style={{ background: 'rgba(0,0,0,0.4)' }}>
            <X className="w-3.5 h-3.5 text-white/80" />
          </button>
        </div>

        {/* Avatar row */}
        <div className="px-4 -mt-10 flex items-end justify-between relative z-10">
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
              {orderedBadges.map(b => <ProfileBadge key={b} badge={b} />)}
            </div>
          </div>
        )}

        <div className="mx-4 h-px" style={{ background: colors.border.default }} />

        {/* Content sections */}
        <div className="px-4 py-3 space-y-3 max-h-[280px] overflow-y-auto scrollbar-thin">
          {profile.bio && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: colors.text.muted }}>About</p>
              <div className="text-[13px] leading-relaxed prose prose-sm prose-invert max-w-none" style={{ color: colors.text.secondary }}>
                <ReactMarkdown>{profile.bio}</ReactMarkdown>
              </div>
            </div>
          )}

          {formattedJoin && (
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: colors.text.muted }} />
              <span className="text-[12px]" style={{ color: colors.text.muted }}>Joined <span style={{ color: colors.text.secondary }}>{formattedJoin}</span></span>
            </div>
          )}

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

          {mutualServers.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: colors.text.muted }}>
                {mutualServers.length} Mutual Server{mutualServers.length !== 1 ? 's' : ''}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {mutualServers.map(s => (
                  <div key={s.id} className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                    style={{ background: s.banner_color || colors.bg.overlay }} title={s.name}>
                    {s.icon_url
                      ? <img src={s.icon_url} className="w-full h-full object-cover" alt={s.name} />
                      : <span className="text-[10px] font-bold" style={{ color: colors.text.muted }}>{(s.name || '').slice(0, 2).toUpperCase()}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

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