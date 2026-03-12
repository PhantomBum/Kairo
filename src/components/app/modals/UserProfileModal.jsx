import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, MessageSquare, Globe, Github, Crown, Shield, Star, Zap, Heart, Calendar, Clock, Twitter, Instagram, Music, Gamepad2, UserPlus, Ban, Moon, Bug, Volume2, Users } from 'lucide-react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import ReactMarkdown from 'react-markdown';
import { colors } from '@/components/app/design/tokens';

const statusColors = { online: '#3ba55c', idle: '#faa61a', dnd: '#ed4245', invisible: '#4f4f4f', offline: '#4f4f4f' };
const statusLabels = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', invisible: 'Invisible', offline: 'Offline' };

const badgeConfig = {
  owner: { icon: Crown, color: '#faa61a', label: 'Server Owner', desc: 'Owns a Kairo server' },
  admin: { icon: Shield, color: '#5865F2', label: 'Admin', desc: 'Server administrator' },
  premium: { icon: Crown, color: '#faa61a', label: 'Kairo Elite', desc: 'Premium subscriber' },
  verified: { icon: Star, color: '#3ba55c', label: 'Verified', desc: 'Verified account' },
  early_supporter: { icon: Heart, color: '#ed4245', label: 'Early Adopter', desc: 'Joined Kairo early' },
  bug_hunter: { icon: Bug, color: '#faa61a', label: 'Bug Hunter', desc: 'Helps hunt platform bugs' },
  developer: { icon: Gamepad2, color: '#a78bfa', label: 'Developer', desc: 'Kairo app developer' },
  moderator: { icon: Shield, color: '#3ba55c', label: 'Moderator', desc: 'Community moderator' },
  partner: { icon: Star, color: '#5865F2', label: 'Partner', desc: 'Official Kairo partner' },
  youtube: { icon: Globe, color: '#ed4245', label: 'Content Creator', desc: 'YouTube creator' },
  tester: { icon: Bug, color: '#3ba55c', label: 'Tester', desc: 'Platform tester' },
};

const socialIcons = { github: Github, twitter: Twitter, website: Globe, instagram: Instagram, spotify: Music, tiktok: Globe, twitch: Globe, linkedin: Globe };

function BadgeIcon({ badge, onHover, isHovered }) {
  const cfg = badgeConfig[badge];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <div className="relative" onMouseEnter={() => onHover(badge)} onMouseLeave={() => onHover(null)}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all hover:scale-110"
        style={{ background: `${cfg.color}18`, border: `1px solid ${cfg.color}25` }}>
        <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
      </div>
      {isHovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-xl whitespace-nowrap z-50 k-fade-in"
          style={{ background: colors.bg.float, border: `1px solid ${colors.border.strong}`, boxShadow: '0 8px 32px rgba(0,0,0,0.7)' }}>
          <p className="text-[11px] font-bold" style={{ color: cfg.color }}>{cfg.label}</p>
          <p className="text-[10px]" style={{ color: colors.text.muted }}>{cfg.desc}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2 h-2 rotate-45"
            style={{ background: colors.bg.float, borderRight: `1px solid ${colors.border.strong}`, borderBottom: `1px solid ${colors.border.strong}` }} />
        </div>
      )}
    </div>
  );
}

export default function UserProfileModal({ onClose, profile, memberData, roles, isCurrentUser, onMessage, onAddFriend, onBlock, friends = [], mutualServers = [] }) {
  const [badgeHover, setBadgeHover] = useState(null);
  const { profiles } = useProfiles();

  if (!profile) return null;

  const memberRoles = (roles || []).filter(r => memberData?.role_ids?.includes(r.id) && !r.is_default);
  const defaultRole = (roles || []).find(r => r.is_default);
  const allDisplayRoles = [...memberRoles, ...(defaultRole ? [defaultRole] : [])];
  const hasBadges = profile.badges?.length > 0;
  const hasSocial = profile.social_links && Object.values(profile.social_links).some(Boolean);
  const joinDate = memberData?.joined_at || profile.created_date;
  const formattedJoin = joinDate ? new Date(joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null;
  const isFriend = friends?.some(f => f.friend_id === profile.user_id);
  const statusText = profile.custom_status?.text || '';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.12 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        className="w-full max-w-[380px] rounded-2xl overflow-hidden"
        style={{ background: colors.bg.surface, border: `1px solid ${colors.border.default}`, boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}>

        {/* Banner */}
        <div className="h-[100px] relative"
          style={{ background: profile.banner_url ? `url(${profile.banner_url}) center/cover` : `linear-gradient(135deg, ${profile.accent_color || '#0d2137'}, ${profile.accent_color ? profile.accent_color + '40' : '#0a1929'})` }}>

          {/* Badge tooltip floating on banner */}
          {hasBadges && (
            <div className="absolute top-3 left-3">
              {badgeHover && badgeConfig[badgeHover] && (
                <div className="px-3 py-2 rounded-xl k-fade-in"
                  style={{ background: colors.bg.float, border: `1px solid ${colors.border.strong}`, boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}>
                  <p className="text-[12px] font-bold" style={{ color: badgeConfig[badgeHover].color }}>{badgeConfig[badgeHover].label}</p>
                  <p className="text-[10px]" style={{ color: colors.text.muted }}>{badgeConfig[badgeHover].desc}</p>
                </div>
              )}
            </div>
          )}

          <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[rgba(0,0,0,0.5)]"
            style={{ background: 'rgba(0,0,0,0.35)' }}>
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {/* Avatar */}
        <div className="px-5 -mt-[52px] relative z-10">
          <div className="relative w-fit">
            <div className="w-[104px] h-[104px] rounded-full flex items-center justify-center text-3xl font-semibold overflow-hidden"
              style={{ background: colors.bg.elevated, color: colors.text.muted, border: `6px solid ${colors.bg.surface}` }}>
              {profile.avatar_url
                ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                : (profile.display_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full"
              style={{ background: statusColors[profile.status || 'offline'], border: `4px solid ${colors.bg.surface}` }} />
          </div>
        </div>

        {/* Name + Badges inline */}
        <div className="px-5 pt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[20px] font-bold leading-tight" style={{ color: colors.text.primary }}>
              {profile.display_name || profile.username}
            </h3>
            {hasBadges && (
              <div className="flex items-center gap-1">
                {profile.badges.map(b => {
                  const cfg = badgeConfig[b];
                  if (!cfg) return null;
                  const Icon = cfg.icon;
                  return (
                    <div key={b} className="cursor-pointer transition-transform hover:scale-125"
                      onMouseEnter={() => setBadgeHover(b)} onMouseLeave={() => setBadgeHover(null)}
                      title={cfg.label}>
                      <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {profile.username && (
            <p className="text-[13px] mt-0.5" style={{ color: colors.text.muted }}>@{profile.username}</p>
          )}
        </div>

        {/* Custom status / bio */}
        {(statusText || profile.bio) && (
          <div className="px-5 pt-2">
            <p className="text-[13px]" style={{ color: colors.text.secondary }}>
              {profile.custom_status?.emoji && <span className="mr-1">{profile.custom_status.emoji}</span>}
              {statusText || ''}
            </p>
            {profile.bio && !statusText && (
              <div className="text-[13px] leading-relaxed prose prose-sm prose-invert max-w-none" style={{ color: colors.text.secondary }}>
                <ReactMarkdown>{profile.bio}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* Info card */}
        <div className="mx-5 mt-3 p-4 rounded-xl space-y-4"
          style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>

          {/* Member since */}
          {formattedJoin && (
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Calendar className="w-3.5 h-3.5" style={{ color: colors.text.muted }} />
                <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: colors.text.muted }}>Member Since</p>
              </div>
              <p className="text-[13px] font-semibold ml-[22px]" style={{ color: colors.text.primary }}>{formattedJoin}</p>
            </div>
          )}

          {/* Roles */}
          {allDisplayRoles.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.text.muted }}>Roles</p>
              <div className="flex flex-wrap gap-1.5">
                {allDisplayRoles.map(r => (
                  <span key={r.id} className="text-[12px] font-semibold px-2.5 py-1 rounded-md"
                    style={{ background: `${r.color || colors.text.muted}20`, color: r.color || colors.text.muted, border: `1px solid ${r.color || colors.text.muted}30` }}>
                    {r.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mutual / Shared Servers */}
          {mutualServers.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.text.muted }}>Shared Servers</p>
              <div className="flex flex-wrap gap-2">
                {mutualServers.map(s => (
                  <div key={s.id} className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                    style={{ background: s.banner_color || colors.bg.overlay }}
                    title={s.name}>
                    {s.icon_url
                      ? <img src={s.icon_url} className="w-full h-full object-cover" alt={s.name} />
                      : <span className="text-[11px] font-bold" style={{ color: colors.text.muted }}>{(s.name || '').slice(0, 2).toUpperCase()}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Social links */}
          {hasSocial && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: colors.text.muted }}>Connections</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(profile.social_links).filter(([, v]) => v).map(([key, url]) => {
                  const Icon = socialIcons[key] || Globe;
                  return (
                    <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-colors hover:brightness-125"
                      style={{ background: colors.bg.overlay, color: colors.text.secondary, border: `1px solid ${colors.border.default}` }}>
                      <Icon className="w-3 h-3" /> <span className="capitalize">{key}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {!isCurrentUser && (
          <div className="px-5 py-4 flex gap-2">
            {onMessage && isFriend && (
              <button onClick={onMessage} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:brightness-110"
                style={{ background: colors.bg.overlay, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}>
                <MessageSquare className="w-4 h-4" /> Message
              </button>
            )}
            {!isFriend && onAddFriend && (
              <button onClick={() => onAddFriend(profile)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:brightness-110"
                style={{ background: colors.bg.overlay, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}>
                <UserPlus className="w-4 h-4" /> Add Friend
              </button>
            )}
            {onBlock && (
              <button onClick={() => onBlock(profile)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:brightness-110"
                style={{ background: colors.bg.overlay, color: colors.text.primary, border: `1px solid ${colors.border.default}` }}>
                <Ban className="w-4 h-4" /> Block
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}