import React from 'react';
import { MessageSquare, UserPlus, X, Globe, Github } from 'lucide-react';
import ModalWrapper from './ModalWrapper';

const statusColors = { online: '#22c55e', idle: '#eab308', dnd: '#ef4444', invisible: '#555', offline: '#555' };
const badgeLabels = { owner: '👑 Owner', admin: '🛡️ Admin', youtube: '▶️ YouTube', premium: '⭐ Premium', verified: '✓ Verified', partner: '🤝 Partner', early_supporter: '💜 Early', bug_hunter: '🐛 Bug Hunter', developer: '🔧 Developer', moderator: '🔨 Moderator' };

export default function UserProfileModal({ onClose, profile, memberData, roles, onMessage, isCurrentUser }) {
  if (!profile) return null;

  const status = profile.is_online ? (profile.status || 'online') : 'offline';
  const memberRoles = (memberData?.role_ids || []).map(rid => roles?.find(r => r.id === rid)).filter(Boolean);

  return (
    <ModalWrapper title="" onClose={onClose} width={380}>
      <div className="-m-5 -mt-[60px]">
        {/* Banner */}
        <div className="h-24 rounded-t-xl" style={{ background: profile.banner_url ? `url(${profile.banner_url}) center/cover` : (profile.accent_color || '#1e1e2e') }} />
        
        {/* Avatar */}
        <div className="px-4 -mt-10">
          <div className="relative w-20 h-20 rounded-full border-4 overflow-hidden flex items-center justify-center text-2xl font-bold"
            style={{ borderColor: 'var(--bg-secondary)', background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
            {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : (profile.display_name || 'U').charAt(0)}
            <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2"
              style={{ background: statusColors[status], borderColor: 'var(--bg-secondary)' }} />
          </div>
        </div>

        {/* Info */}
        <div className="px-4 pt-3 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{profile.display_name || 'User'}</h3>
              {profile.username && <div className="text-xs" style={{ color: 'var(--text-muted)' }}>@{profile.username}</div>}
              {profile.pronouns && <div className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{profile.pronouns}</div>}
            </div>
            {!isCurrentUser && onMessage && (
              <button onClick={onMessage} className="px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5"
                style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>
                <MessageSquare className="w-3 h-3" /> Message
              </button>
            )}
          </div>

          {/* Custom status */}
          {profile.custom_status?.text && (
            <div className="mt-2 px-2.5 py-1.5 rounded-lg text-xs" style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}>
              {profile.custom_status.emoji && <span className="mr-1">{profile.custom_status.emoji}</span>}
              {profile.custom_status.text}
            </div>
          )}

          {/* Badges */}
          {profile.badges?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {profile.badges.map(b => (
                <span key={b} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}>
                  {badgeLabels[b] || b}
                </span>
              ))}
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>About Me</div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{profile.bio}</p>
            </div>
          )}

          {/* Roles */}
          {memberRoles.length > 0 && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Roles</div>
              <div className="flex flex-wrap gap-1">
                {memberRoles.map(r => (
                  <span key={r.id} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: r.color + '20', color: r.color }}>
                    <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />{r.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rich presence */}
          {profile.rich_presence?.name && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                {profile.rich_presence.type === 'playing' ? '🎮 Playing' : profile.rich_presence.type === 'listening' ? '🎵 Listening' : '📺 Activity'}
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--bg)' }}>
                {profile.rich_presence.large_image && <img src={profile.rich_presence.large_image} className="w-12 h-12 rounded-lg" />}
                <div>
                  <div className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{profile.rich_presence.name}</div>
                  {profile.rich_presence.details && <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{profile.rich_presence.details}</div>}
                  {profile.rich_presence.state && <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{profile.rich_presence.state}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Social links */}
          {profile.social_links && Object.values(profile.social_links).some(Boolean) && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
              <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Connections</div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(profile.social_links).filter(([_, v]) => v).map(([k, v]) => (
                  <a key={k} href={v} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 hover:brightness-110"
                    style={{ background: 'var(--bg)', color: 'var(--text-secondary)' }}>
                    <Globe className="w-2.5 h-2.5" /> {k}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Member since */}
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Member Since</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              {new Date(profile.created_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}