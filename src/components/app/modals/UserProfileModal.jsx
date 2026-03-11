import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, MessageSquare, Globe, Github, Crown, Shield, Star, Zap, Heart, Calendar, Clock, Twitter, Instagram, Music, Gamepad2, UserPlus, Ban, Eye, Sparkles, Award, Moon, Bug, Volume2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import ReactMarkdown from 'react-markdown';

const statusColors = { online: '#7bc9a4', idle: '#c9b47b', dnd: '#c97b7b', invisible: '#555248', offline: '#555248' };
const statusLabels = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', invisible: 'Invisible', offline: 'Offline' };

const badgeConfig = {
  owner: { icon: Crown, color: '#c9b47b', label: 'Server Owner', desc: 'Owns a Kairo server' },
  admin: { icon: Shield, color: '#7ba4c9', label: 'Admin', desc: 'Server administrator' },
  premium: { icon: Crown, color: '#c9b47b', label: 'Kairo Elite', desc: 'Premium subscriber' },
  verified: { icon: Star, color: '#7bc9a4', label: 'Verified', desc: 'Verified account' },
  early_supporter: { icon: Heart, color: '#c97b7b', label: 'Early Adopter', desc: 'Joined Kairo early' },
  bug_hunter: { icon: Bug, color: '#c9b47b', label: 'Bug Hunter', desc: 'Found and reported bugs' },
  developer: { icon: Gamepad2, color: '#a47bc9', label: 'Developer', desc: 'Kairo app developer' },
  moderator: { icon: Shield, color: '#7bc9a4', label: 'Moderator', desc: 'Community moderator' },
  partner: { icon: Star, color: '#7ba4c9', label: 'Partner', desc: 'Official Kairo partner' },
  youtube: { icon: Globe, color: '#c97b7b', label: 'Content Creator', desc: 'YouTube creator' },
  conversation_starter: { icon: MessageSquare, color: '#7bc9a4', label: 'Conversation Starter', desc: 'Started 100+ conversations' },
  voice_veteran: { icon: Volume2, color: '#a47bc9', label: 'Voice Veteran', desc: '100+ hours in voice' },
  night_owl: { icon: Moon, color: '#7ba4c9', label: 'Night Owl', desc: 'Active between 12am-5am' },
  anniversary: { icon: Award, color: '#c9b47b', label: '1 Year Anniversary', desc: '1 year on Kairo' },
};

const PROFILE_THEMES = {
  dark: { bg: 'var(--bg-elevated)', border: 'var(--border-light)' },
  midnight: { bg: '#0a0a1a', border: 'rgba(100,100,200,0.15)' },
  warm: { bg: '#1a1510', border: 'rgba(200,150,100,0.15)' },
  ocean: { bg: '#0a1520', border: 'rgba(100,150,200,0.15)' },
  forest: { bg: '#0a1a10', border: 'rgba(100,200,120,0.15)' },
  sunset: { bg: '#1a100a', border: 'rgba(200,120,80,0.15)' },
};

const socialIcons = { github: Github, twitter: Twitter, website: Globe, instagram: Instagram, spotify: Music, tiktok: Globe, twitch: Globe, linkedin: Globe };

export default function UserProfileModal({ onClose, profile, memberData, roles, isCurrentUser, onMessage, onAddFriend, onBlock, friends = [], mutualServers = [] }) {
  const [activeTab, setActiveTab] = useState('about');
  const [badgeHover, setBadgeHover] = useState(null);
  const { profiles } = useProfiles();

  if (!profile) return null;

  const memberRoles = (roles || []).filter(r => memberData?.role_ids?.includes(r.id) && !r.is_default);
  const hasBadges = profile.badges?.length > 0;
  const hasSocial = profile.social_links && Object.values(profile.social_links).some(Boolean);
  const hasPresence = profile.rich_presence?.name;
  const joinDate = profile.created_date ? new Date(profile.created_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null;
  const hasElite = profile.badges?.includes('premium');
  const theme = PROFILE_THEMES[profile.settings?.theme] || PROFILE_THEMES.dark;

  // Mutual friends
  const mutualFriends = useMemo(() => {
    if (isCurrentUser || !friends?.length) return [];
    return friends.filter(f => f.friend_id !== profile.user_id).slice(0, 6);
  }, [friends, profile.user_id, isCurrentUser]);

  const isFriend = friends?.some(f => f.friend_id === profile.user_id);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="w-[400px] rounded-2xl overflow-hidden" style={{ background: theme.bg, border: `1px solid ${theme.border}`, boxShadow: 'var(--shadow-lg)' }}
        onClick={e => e.stopPropagation()}>
        {/* Banner */}
        <div className="h-28 relative" style={{ background: profile.banner_url ? `url(${profile.banner_url}) center/cover` : `linear-gradient(135deg, ${profile.accent_color || '#1a1a1a'}80, var(--bg-surface))` }}>
          <button onClick={onClose} className="absolute top-2 right-2 p-1 rounded-lg" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <X className="w-3.5 h-3.5 text-white" />
          </button>
          {hasElite && (
            <div className="absolute bottom-2 left-3 px-2 py-0.5 rounded-full text-[8px] font-bold flex items-center gap-1" style={{ background: 'rgba(201,180,123,0.25)', color: '#c9b47b', backdropFilter: 'blur(8px)' }}>
              <Crown className="w-2.5 h-2.5" /> ELITE
            </div>
          )}
        </div>

        {/* Avatar + Badges */}
        <div className="px-4 -mt-12 relative z-10 flex items-end justify-between">
          <div className="relative">
            <div className={`w-[88px] h-[88px] rounded-full flex items-center justify-center text-3xl font-medium overflow-hidden ${hasElite ? 'ring-2 ring-offset-2' : ''}`}
              style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)', border: `5px solid ${theme.bg}`, ringColor: '#c9b47b', ringOffsetColor: theme.bg }}>
              {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : (profile.display_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full" style={{ background: statusColors[profile.status || 'offline'], border: `3px solid ${theme.bg}` }} />
          </div>
          {hasBadges && (
            <div className="flex gap-1 mb-2 flex-wrap justify-end relative">
              {profile.badges.map(b => {
                const cfg = badgeConfig[b];
                if (!cfg) return null;
                return (
                  <div key={b} className="relative" onMouseEnter={() => setBadgeHover(b)} onMouseLeave={() => setBadgeHover(null)}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-transform hover:scale-110"
                      style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                      <cfg.icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                    </div>
                    {badgeHover === b && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded-lg whitespace-nowrap z-50"
                        style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-md)' }}>
                        <p className="text-[10px] font-medium" style={{ color: cfg.color }}>{cfg.label}</p>
                        <p className="text-[8px]" style={{ color: 'var(--text-muted)' }}>{cfg.desc}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-4 pt-2 pb-1">
          <h3 className="text-xl font-bold" style={{ color: 'var(--text-cream)' }}>{profile.display_name || profile.username}</h3>
          <div className="flex items-center gap-2">
            {profile.username && <p className="text-[12px] font-mono" style={{ color: 'var(--text-secondary)' }}>@{profile.username}</p>}
            {profile.pronouns && <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--bg-glass)', color: 'var(--text-muted)' }}>{profile.pronouns}</span>}
          </div>
          <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: statusColors[profile.status || 'offline'] }}>
            {profile.custom_status?.emoji ? profile.custom_status.emoji + ' ' : ''}{profile.custom_status?.text || statusLabels[profile.status || 'offline']}
          </p>
        </div>

        {/* Tabs */}
        <div className="px-4 mt-2 flex gap-1" style={{ borderBottom: '1px solid var(--border)' }}>
          {['about', 'activity', 'mutual'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)} className="px-3 py-2 text-[11px] capitalize transition-colors"
              style={{ color: activeTab === t ? 'var(--text-cream)' : 'var(--text-muted)', borderBottom: activeTab === t ? '2px solid var(--text-cream)' : '2px solid transparent' }}>
              {t === 'mutual' ? `Mutual${mutualFriends.length > 0 ? ` (${mutualFriends.length})` : ''}` : t}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-4 py-3 space-y-3 max-h-[280px] overflow-y-auto scrollbar-none">
          {activeTab === 'about' && <>
            {profile.bio && (
              <div className="p-3 rounded-xl" style={{ background: 'var(--bg-glass)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>About Me</p>
                <div className="text-[12px] leading-relaxed prose prose-sm prose-invert max-w-none" style={{ color: 'var(--text-primary)' }}>
                  <ReactMarkdown>{profile.bio}</ReactMarkdown>
                </div>
              </div>
            )}
            {memberRoles.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Roles</p>
                <div className="flex flex-wrap gap-1">
                  {memberRoles.map(r => <span key={r.id} className="text-[10px] px-2 py-0.5 rounded-full font-mono" style={{ border: `1px solid ${r.color}30`, color: r.color, background: `${r.color}10` }}>{r.name}</span>)}
                </div>
              </div>
            )}
            {joinDate && <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}><Calendar className="w-3 h-3" /> Member since {joinDate}</div>}
            {profile.last_seen && !profile.is_online && <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-faint)' }}><Clock className="w-3 h-3" /> Last seen {new Date(profile.last_seen).toLocaleDateString()}</div>}
            {profile.social_links?.website && (
              <div className="flex items-center gap-2 text-[11px]">
                <Globe className="w-3 h-3" style={{ color: 'var(--accent-blue)' }} />
                <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--accent-blue)' }}>{profile.social_links.website.replace(/^https?:\/\//, '')}</a>
              </div>
            )}
            {hasSocial && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Connections</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {Object.entries(profile.social_links).filter(([k, v]) => v && k !== 'website').map(([key, url]) => {
                    const Icon = socialIcons[key] || Globe;
                    return (
                      <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] transition-colors hover:bg-[var(--bg-glass-hover)]"
                        style={{ background: 'var(--bg-glass)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        <Icon className="w-3 h-3" /> <span className="capitalize truncate">{key}</span>
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
                  <div className="flex items-center gap-3">
                    {profile.rich_presence.large_image && <img src={profile.rich_presence.large_image} className="w-14 h-14 rounded-xl" />}
                    <div>
                      <p className="text-[13px] font-medium" style={{ color: 'var(--text-cream)' }}>{profile.rich_presence.name}</p>
                      {profile.rich_presence.details && <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{profile.rich_presence.details}</p>}
                      {profile.rich_presence.state && <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{profile.rich_presence.state}</p>}
                      {profile.rich_presence.start_timestamp && (
                        <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-faint)' }}>
                          {Math.floor((Date.now() - profile.rich_presence.start_timestamp) / 60000)} min elapsed
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center py-6 text-[11px]" style={{ color: 'var(--text-muted)' }}>No current activity</p>
              )}
            </div>
          )}
          {activeTab === 'mutual' && (
            <div className="space-y-3">
              {mutualServers.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Mutual Servers — {mutualServers.length}</p>
                  <div className="flex flex-wrap gap-2">
                    {mutualServers.map(s => (
                      <div key={s.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                        {s.icon_url ? <img src={s.icon_url} className="w-5 h-5 rounded-md" /> : <div className="w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-mono" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>{s.name?.slice(0,2)}</div>}
                        <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{s.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {mutualFriends.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-1.5" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Mutual Friends — {mutualFriends.length}</p>
                  <div className="space-y-1">
                    {mutualFriends.map(f => (
                      <div key={f.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg" style={{ background: 'var(--bg-glass)' }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] overflow-hidden" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>
                          {f.friend_avatar ? <img src={f.friend_avatar} className="w-full h-full object-cover" /> : (f.friend_name||'?').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[11px]" style={{ color: 'var(--text-primary)' }}>{f.friend_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {mutualServers.length === 0 && mutualFriends.length === 0 && (
                <p className="text-center py-6 text-[11px]" style={{ color: 'var(--text-muted)' }}>No mutual servers or friends</p>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {!isCurrentUser && (
          <div className="px-4 pb-4 flex gap-2">
            {onMessage && isFriend && (
              <button onClick={onMessage} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'var(--text-cream)', color: 'var(--bg-deep)' }}>
                <MessageSquare className="w-4 h-4" /> Message
              </button>
            )}
            {!isFriend && onAddFriend && (
              <button onClick={() => onAddFriend(profile)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: 'var(--accent-green)', color: '#000' }}>
                <UserPlus className="w-4 h-4" /> Add Friend
              </button>
            )}
            {isFriend && onMessage && (
              <button onClick={() => onBlock?.(profile)} className="p-2.5 rounded-xl transition-colors hover:bg-[rgba(201,123,123,0.1)]"
                style={{ border: '1px solid var(--border)' }}>
                <Ban className="w-4 h-4" style={{ color: 'var(--accent-red)' }} />
              </button>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}