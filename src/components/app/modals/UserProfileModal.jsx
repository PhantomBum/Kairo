import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, MessageSquare, Globe, Github, Calendar, Twitter, Instagram, Music, UserPlus, Ban, Mic, Copy, Check, MoreHorizontal, Flag, Gamepad2, Twitch, Headphones, Eye, Trophy, Radio } from 'lucide-react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';
import ReactMarkdown from 'react-markdown';
import ProfileBadge from '@/components/app/badges/ProfileBadge';
import { getOrderedBadges } from '@/components/app/badges/badgeConfig';
import ProfileEffectCanvas from '@/components/app/effects/ProfileEffectCanvas';

const P = {
  base: '#111820', surface: '#161f2c', elevated: '#1b2535',
  floating: '#263446', modal: '#263446', border: '#ffffff18',
  textPrimary: '#e8edf5', textSecondary: '#9aaabb', muted: '#5d7a8a',
  accent: '#2dd4bf', danger: '#f87171', success: '#34d399', warning: '#fbbf24',
};

const ADMIN_EMAILS = ['ilikebagels1612@gmail.com', 'rdw1612@gmail.com'];
const statusColors = { online: '#3ba55c', idle: '#faa61a', dnd: '#ed4245', invisible: '#4f4f4f', offline: '#4f4f4f' };
const statusLabels = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', invisible: 'Invisible', offline: 'Offline' };
const socialIcons = { github: Github, twitter: Twitter, website: Globe, instagram: Instagram, spotify: Music, tiktok: Mic, twitch: Twitch, linkedin: Globe, steam: Gamepad2 };

export default function UserProfileModal({ onClose, profile, memberData, roles, isCurrentUser, onMessage, onAddFriend, onBlock, friends = [], mutualServers = [] }) {
  const [copied, setCopied] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [privateNote, setPrivateNote] = useState(() => {
    try { return localStorage.getItem(`kairo-note-${profile?.user_id}`) || ''; } catch { return ''; }
  });

  if (!profile) return null;

  const memberRoles = (roles || []).filter(r => memberData?.role_ids?.includes(r.id) && !r.is_default);
  const defaultRole = (roles || []).find(r => r.is_default);
  const allDisplayRoles = [...memberRoles, ...(defaultRole ? [defaultRole] : [])];
  const profileBadges = [...(profile.badges || [])];
  if (ADMIN_EMAILS.includes(profile.user_email?.toLowerCase()) && !profileBadges.includes('kairo_staff')) {
    profileBadges.unshift('kairo_staff');
  }
  const orderedBadges = getOrderedBadges(profileBadges, profile.badge_order || []);
  const hasBadges = orderedBadges.length > 0;
  const hasSocial = profile.social_links && Object.values(profile.social_links).some(Boolean);
  const joinDate = memberData?.joined_at || profile.created_date;
  const formattedJoin = joinDate ? new Date(joinDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
  const isFriend = friends?.some(f => f.friend_id === profile.user_id);
  const statusText = profile.custom_status?.text || '';
  const accentColor = profile.accent_color || '#2dd4bf';
  const activeEffect = profile.profile_effect || 'none';

  const handleCopyId = () => {
    navigator.clipboard.writeText(profile.user_id || profile.id || '');
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleNoteChange = (v) => {
    setPrivateNote(v);
    try { localStorage.setItem(`kairo-note-${profile.user_id}`, v); } catch {}
  };

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.1 }}
      className="fixed inset-0 flex items-center justify-center p-4 kairo-modal-backdrop"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', zIndex: 1000 }} onClick={onClose}>
      <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 28, stiffness: 400, duration: 0.2 }}
        className="w-full max-w-[360px] rounded-2xl overflow-hidden mobile-sheet"
        style={{ background: P.modal, boxShadow: '0 20px 60px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}>

        {/* Banner */}
        <div className="h-20 relative overflow-hidden">
          {profile.banner_url ? (
            <img src={profile.banner_url} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}60 60%, ${P.modal})` }} />
          )}
          {activeEffect !== 'none' && <ProfileEffectCanvas effect={activeEffect} width={360} height={80} />}
          <button onClick={onClose}
            className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-[rgba(255,255,255,0.15)] z-10"
            style={{ background: 'rgba(0,0,0,0.4)' }}>
            <X className="w-3.5 h-3.5 text-white/80" />
          </button>
        </div>

        {/* Avatar */}
        <div className="px-4 -mt-10 flex items-end justify-between relative z-10">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-2xl font-bold"
              style={{ background: P.elevated, color: P.muted, border: `3px solid ${P.modal}`, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
              {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" onError={(e) => { e.target.style.display = 'none'; }} /> : (profile.display_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full" style={{ background: statusColors[profile.status || 'offline'], border: `3px solid ${P.modal}` }} />
          </div>
          <div className="mb-1 flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: `${P.base}cc` }}>
            <div className="w-2 h-2 rounded-full" style={{ background: statusColors[profile.status || 'offline'] }} />
            <span className="text-[11px] font-medium" style={{ color: P.textSecondary }}>{statusLabels[profile.status || 'offline']}</span>
          </div>
        </div>

        {/* Identity */}
        <div className="px-4 pt-3 pb-1">
          <h3 className="text-lg font-bold leading-snug truncate" style={{ color: P.textPrimary }}>{profile.display_name || profile.username}</h3>
          {profile.username && <p className="text-[12px] -mt-0.5 truncate" style={{ color: P.muted }}>@{profile.username}</p>}
          {profile.pronouns && <p className="text-[11px] mt-0.5" style={{ color: P.textSecondary }}>{profile.pronouns}</p>}
          {statusText && (
            <p className="text-[12px] mt-1.5 flex items-center gap-1" style={{ color: P.textSecondary }}>
              {profile.custom_status?.emoji && <span>{profile.custom_status.emoji}</span>}{statusText}
            </p>
          )}
        </div>

        {/* Badges */}
        {hasBadges && (
          <div className="px-4 pt-1 pb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {orderedBadges.map(b => <ProfileBadge key={b} badge={b} />)}
            </div>
          </div>
        )}

        {/* Rich Presence / Activity */}
        {profile.rich_presence?.name && (
          <div className="mx-4 mb-1">
            {(() => {
              const actTypes = { playing: { icon: Gamepad2, color: '#3ba55c', label: 'Playing' }, listening: { icon: Headphones, color: '#1DB954', label: 'Listening to' }, watching: { icon: Eye, color: '#9146FF', label: 'Watching' }, competing: { icon: Trophy, color: '#f0b232', label: 'Competing in' }, streaming: { icon: Radio, color: '#ed4245', label: 'Streaming' } };
              const cfg = actTypes[profile.rich_presence.type] || actTypes.playing;
              const Icon = cfg.icon;
              return (
                <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}25` }}>
                  {profile.rich_presence.image ? (
                    <img src={profile.rich_presence.image} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}20` }}>
                      <Icon className="w-5 h-5" style={{ color: cfg.color }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>{cfg.label}</p>
                    <p className="text-[13px] font-semibold truncate" style={{ color: P.textPrimary }}>{profile.rich_presence.name}</p>
                    {profile.rich_presence.details && <p className="text-[11px] truncate" style={{ color: P.muted }}>{profile.rich_presence.details}</p>}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        <div className="mx-4 h-px" style={{ background: P.border }} />

        {/* Content */}
        <div className="px-4 py-3 space-y-3 max-h-[280px] overflow-y-auto scrollbar-thin">
          {profile.bio && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: P.muted }}>About</p>
              <div className="text-[13px] leading-relaxed prose prose-sm prose-invert max-w-none" style={{ color: P.textSecondary }}>
                <ReactMarkdown>{profile.bio}</ReactMarkdown>
              </div>
            </div>
          )}

          {formattedJoin && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" style={{ color: P.muted }} />
              <span className="text-[12px]" style={{ color: P.muted }}>Member since <span style={{ color: P.textSecondary }}>{formattedJoin}</span></span>
            </div>
          )}

          {allDisplayRoles.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: P.muted }}>Roles</p>
              <div className="flex flex-wrap gap-1">
                {allDisplayRoles.map(r => (
                  <span key={r.id} className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: `${r.color || P.muted}15`, color: r.color || P.muted }}>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.color || P.muted }} />{r.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {mutualServers.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: P.muted }}>{mutualServers.length} Mutual Server{mutualServers.length !== 1 ? 's' : ''}</p>
              <div className="flex flex-wrap gap-1.5">
                {mutualServers.slice(0, 3).map(s => (
                  <div key={s.id} className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center transition-transform hover:scale-110 cursor-pointer"
                    style={{ background: s.banner_color || P.elevated }} title={s.name}>
                    {s.icon_url ? <img src={s.icon_url} className="w-full h-full object-cover" alt={s.name} onError={(e) => { e.target.style.display = 'none'; }} /> :
                      <span className="text-[11px] font-bold" style={{ color: P.muted }}>{(s.name || '').slice(0, 2).toUpperCase()}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasSocial && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: P.muted }}>Connections</p>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(profile.social_links).filter(([, v]) => v).map(([key, url]) => {
                  const Icon = socialIcons[key] || Globe;
                  return (
                    <a key={key} href={url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] transition-colors hover:bg-[rgba(255,255,255,0.06)]"
                      style={{ background: `${P.base}cc`, color: P.textSecondary }}>
                      <Icon className="w-3 h-3" /> <span className="capitalize">{key}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Private Note — only visible to viewer */}
          {!isCurrentUser && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: P.muted }}>Note</p>
              <textarea value={privateNote} onChange={e => handleNoteChange(e.target.value)} rows={2}
                placeholder="Click to add a note — only visible to you"
                className="w-full px-2.5 py-2 rounded-lg text-[12px] outline-none resize-none"
                style={{ background: P.base, color: P.textSecondary, border: `1px solid ${P.border}` }} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 pt-1 flex gap-2">
          {!isCurrentUser && onMessage && (isFriend || true) && (
            <button onClick={onMessage}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold transition-all hover:brightness-125"
              style={{ background: P.accent, color: '#fff' }}>
              <MessageSquare className="w-3.5 h-3.5" /> Message
            </button>
          )}
          {!isCurrentUser && !isFriend && onAddFriend && (
            <button onClick={() => onAddFriend(profile)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold transition-all hover:brightness-125"
              style={{ background: P.success, color: '#fff' }}>
              <UserPlus className="w-3.5 h-3.5" /> Add Friend
            </button>
          )}
          {!isCurrentUser && isFriend && (
            <span className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium"
              style={{ background: `${P.success}15`, color: P.success }}>
              <Check className="w-3.5 h-3.5" /> Friends
            </span>
          )}
          {/* More dropdown */}
          <div className="relative">
            <button onClick={() => setShowMore(!showMore)}
              className="flex items-center justify-center px-3 py-2 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.06)]"
              style={{ background: `${P.base}cc`, color: P.muted }}>
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showMore && (
              <div className="absolute bottom-full right-0 mb-1 w-44 rounded-xl overflow-hidden z-20 k-fade-in"
                style={{ background: P.floating, border: `1px solid ${P.border}`, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
                <button onClick={handleCopyId} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left hover:bg-[rgba(255,255,255,0.04)]" style={{ color: P.textSecondary }}>
                  {copied ? <Check className="w-3.5 h-3.5" style={{ color: P.success }} /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Copied!' : 'Copy User ID'}
                </button>
                {!isCurrentUser && onBlock && (
                  <button onClick={() => { onBlock(profile); setShowMore(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left hover:bg-[rgba(255,255,255,0.04)]" style={{ color: P.danger }}>
                    <Ban className="w-3.5 h-3.5" /> Block
                  </button>
                )}
                {!isCurrentUser && (
                  <button onClick={() => setShowMore(false)} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-left hover:bg-[rgba(255,255,255,0.04)]" style={{ color: P.danger }}>
                    <Flag className="w-3.5 h-3.5" /> Report
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
