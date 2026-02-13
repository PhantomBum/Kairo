import React from 'react';
import { X, MessageSquare, UserPlus } from 'lucide-react';

const statusColors = { online: '#22c55e', idle: '#eab308', dnd: '#ef4444', invisible: '#555', offline: '#555' };

export default function UserProfilePopup({ userId, profilesMap, onClose, onMessage }) {
  const profile = profilesMap.get(userId);
  if (!profile) return null;

  const name = profile.display_name || 'User';
  const status = profile.status || 'offline';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-80 rounded-xl overflow-hidden" style={{ background: '#1a1a1a' }}>
        {/* Banner */}
        <div className="h-20" style={{ background: profile.accent_color || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }} />
        
        {/* Avatar */}
        <div className="px-4 -mt-10 relative z-10">
          <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center" style={{ background: '#1a1a1a', border: '4px solid #1a1a1a' }}>
            {profile.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover" /> : <span className="text-xl text-zinc-500">{name.charAt(0)}</span>}
          </div>
        </div>

        <div className="p-4 pt-2">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            <div className="w-3 h-3 rounded-full" style={{ background: statusColors[status] }} />
          </div>
          {profile.username && <p className="text-sm text-zinc-500 mb-1">@{profile.username}</p>}
          {profile.pronouns && <p className="text-xs text-zinc-500 mb-2">{profile.pronouns}</p>}
          
          {/* Badges */}
          {profile.badges?.length > 0 && (
            <div className="flex gap-1 mb-3">
              {profile.badges.map((b, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded" style={{
                  background: b === 'owner' ? 'rgba(245,158,11,0.2)' : b === 'premium' ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.06)',
                  color: b === 'owner' ? '#f59e0b' : b === 'premium' ? '#a855f7' : '#888',
                }}>{b}</span>
              ))}
            </div>
          )}

          {profile.bio && (
            <div className="p-3 rounded-lg mb-3 text-sm text-zinc-300" style={{ background: '#111' }}>
              {profile.bio}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => onMessage(userId)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <MessageSquare className="w-4 h-4" /> Message
            </button>
          </div>
        </div>

        <button onClick={onClose} className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center bg-black/30 text-white/60 hover:text-white">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}