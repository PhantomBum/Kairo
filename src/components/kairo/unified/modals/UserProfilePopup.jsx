import React from 'react';
import { X, MessageSquare, UserPlus, Globe, Link2 } from 'lucide-react';

const statusColors = { online: '#22c55e', idle: '#eab308', dnd: '#ef4444', invisible: '#555', offline: '#555' };
const statusLabels = { online: 'Online', idle: 'Idle', dnd: 'Do Not Disturb', invisible: 'Invisible', offline: 'Offline' };

export default function UserProfilePopup({ userId, profilesMap, onClose, onMessage }) {
  const profile = profilesMap.get(userId);
  if (!profile) return null;

  const name = profile.display_name || 'User';
  const status = profile.status || 'offline';
  const socialLinks = profile.social_links || {};
  const hasSocials = Object.values(socialLinks).some(v => v);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-[340px] rounded-2xl overflow-hidden" style={{ background: '#1a1a1a', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        {/* Banner */}
        <div className="h-24 relative" style={{ background: profile.banner_url ? undefined : (profile.accent_color || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)') }}>
          {profile.banner_url && <img src={profile.banner_url} className="w-full h-full object-cover" />}
        </div>
        
        {/* Avatar */}
        <div className="px-4 -mt-12 relative z-10">
          <div className="w-[88px] h-[88px] rounded-full overflow-hidden flex items-center justify-center relative"
            style={{ background: '#1a1a1a', border: '5px solid #1a1a1a' }}>
            {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <span className="text-2xl text-zinc-500">{name.charAt(0)}</span>}
            <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full" style={{ background: statusColors[status], border: '3px solid #1a1a1a' }} />
          </div>
        </div>

        <div className="p-4 pt-2">
          {/* Name */}
          <div className="mb-1">
            <h3 className="text-xl font-bold text-white">{name}</h3>
            {profile.username && <p className="text-sm text-zinc-500">@{profile.username}</p>}
          </div>

          {/* Pronouns & Status */}
          <div className="flex items-center gap-2 mb-3">
            {profile.pronouns && <span className="text-xs text-zinc-500 px-1.5 py-0.5 rounded" style={{ background: '#111' }}>{profile.pronouns}</span>}
            <span className="text-xs text-zinc-500">{statusLabels[status]}</span>
          </div>

          {/* Custom status */}
          {profile.custom_status?.text && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-sm" style={{ background: '#111' }}>
              <span>{profile.custom_status.emoji || '💬'}</span>
              <span className="text-zinc-300">{profile.custom_status.text}</span>
            </div>
          )}
          
          {/* Badges */}
          {profile.badges?.length > 0 && (
            <div className="flex gap-1.5 mb-3">
              {profile.badges.map((b, i) => (
                <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{
                  background: b === 'owner' ? 'rgba(245,158,11,0.15)' : b === 'premium' ? 'rgba(168,85,247,0.15)' : b === 'developer' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                  color: b === 'owner' ? '#f59e0b' : b === 'premium' ? '#a855f7' : b === 'developer' ? '#10b981' : '#888',
                }}>{b}</span>
              ))}
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <div className="mb-3">
              <div className="text-[11px] font-semibold uppercase text-zinc-500 mb-1">About Me</div>
              <p className="text-sm text-zinc-300 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Rich Presence */}
          {profile.rich_presence?.name && (
            <div className="p-3 rounded-lg mb-3" style={{ background: '#111' }}>
              <div className="text-[10px] text-zinc-500 uppercase mb-1">
                {profile.rich_presence.type === 'playing' ? '🎮 Playing' : profile.rich_presence.type === 'listening' ? '🎵 Listening to' : '📺 Watching'}
              </div>
              <div className="text-sm text-white font-medium">{profile.rich_presence.name}</div>
              {profile.rich_presence.details && <div className="text-xs text-zinc-400">{profile.rich_presence.details}</div>}
              {profile.rich_presence.state && <div className="text-xs text-zinc-500">{profile.rich_presence.state}</div>}
            </div>
          )}

          {/* Social Links */}
          {hasSocials && (
            <div className="flex flex-wrap gap-2 mb-3">
              {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" rel="noopener" className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded-lg transition-colors" style={{ background: '#111' }}>𝕏 Twitter</a>}
              {socialLinks.github && <a href={socialLinks.github} target="_blank" rel="noopener" className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded-lg transition-colors" style={{ background: '#111' }}>🐙 GitHub</a>}
              {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" rel="noopener" className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded-lg transition-colors" style={{ background: '#111' }}>📷 Instagram</a>}
              {socialLinks.website && <a href={socialLinks.website} target="_blank" rel="noopener" className="text-xs text-zinc-400 hover:text-white px-2 py-1 rounded-lg transition-colors" style={{ background: '#111' }}>🌐 Website</a>}
            </div>
          )}

          {/* Member Since */}
          <div className="text-[10px] text-zinc-600 mb-3">
            Member since {new Date(profile.created_date || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={() => onMessage(userId)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <MessageSquare className="w-4 h-4" /> Message
            </button>
          </div>
        </div>

        <button onClick={onClose} className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center bg-black/40 text-white/60 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}