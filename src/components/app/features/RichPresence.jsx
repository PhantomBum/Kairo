import React, { useState, useEffect, useCallback } from 'react';
import { Gamepad2, Headphones, Eye, Trophy, Radio, Music, Image, X, Check, Edit3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { colors } from '@/components/app/design/tokens';

const ACTIVITY_TYPES = [
  { id: 'playing', label: 'Playing', icon: Gamepad2, color: '#3ba55c' },
  { id: 'listening', label: 'Listening to', icon: Headphones, color: '#1DB954' },
  { id: 'watching', label: 'Watching', icon: Eye, color: '#9146FF' },
  { id: 'competing', label: 'Competing in', icon: Trophy, color: '#f0b232' },
  { id: 'streaming', label: 'Streaming', icon: Radio, color: '#ed4245' },
];

export function ActivityIcon({ type, size = 14 }) {
  const cfg = ACTIVITY_TYPES.find(a => a.id === type) || ACTIVITY_TYPES[0];
  const Icon = cfg.icon;
  return <Icon className={`w-[${size}px] h-[${size}px]`} style={{ color: cfg.color, width: size, height: size }} />;
}

export function ActivityDisplay({ activity, compact = false }) {
  if (!activity || !activity.name) return null;
  const cfg = ACTIVITY_TYPES.find(a => a.id === activity.type) || ACTIVITY_TYPES[0];
  const Icon = cfg.icon;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 min-w-0">
        <Icon className="w-3 h-3 flex-shrink-0" style={{ color: cfg.color }} />
        <span className="text-[11px] truncate" style={{ color: colors.text.muted }}>
          {cfg.label} <span style={{ color: colors.text.secondary }}>{activity.name}</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
      {activity.image ? (
        <img src={activity.image} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}20` }}>
          <Icon className="w-6 h-6" style={{ color: cfg.color }} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>{cfg.label}</p>
        <p className="text-[14px] font-semibold truncate" style={{ color: colors.text.primary }}>{activity.name}</p>
        {activity.details && <p className="text-[12px] truncate" style={{ color: colors.text.muted }}>{activity.details}</p>}
        {activity.state && <p className="text-[11px] truncate" style={{ color: colors.text.disabled }}>{activity.state}</p>}
      </div>
    </div>
  );
}

export function SpotifyPresence({ data }) {
  if (!data?.song) return null;

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(29,185,84,0.06)', border: '1px solid rgba(29,185,84,0.15)' }}>
      {data.album_art ? (
        <img src={data.album_art} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(29,185,84,0.15)' }}>
          <Music className="w-6 h-6" style={{ color: '#1DB954' }} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#1DB954' }}>Listening to Spotify</p>
        <p className="text-[14px] font-semibold truncate" style={{ color: colors.text.primary }}>{data.song}</p>
        <p className="text-[12px] truncate" style={{ color: colors.text.muted }}>by {data.artist}</p>
        {data.album && <p className="text-[11px] truncate" style={{ color: colors.text.disabled }}>on {data.album}</p>}
      </div>
    </div>
  );
}

export function SteamPresence({ data }) {
  if (!data?.game) return null;

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(59,165,93,0.06)', border: '1px solid rgba(59,165,93,0.15)' }}>
      {data.game_icon ? (
        <img src={data.game_icon} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(59,165,93,0.15)' }}>
          <Gamepad2 className="w-6 h-6" style={{ color: '#3ba55c' }} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#3ba55c' }}>Playing on Steam</p>
        <p className="text-[14px] font-semibold truncate" style={{ color: colors.text.primary }}>{data.game}</p>
        {data.details && <p className="text-[12px] truncate" style={{ color: colors.text.muted }}>{data.details}</p>}
      </div>
    </div>
  );
}

export function ActivityEditor({ currentActivity, onSave, onClose }) {
  const [type, setType] = useState(currentActivity?.type || 'playing');
  const [name, setName] = useState(currentActivity?.name || '');
  const [details, setDetails] = useState(currentActivity?.details || '');
  const [emoji, setEmoji] = useState(currentActivity?.emoji || '');

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5 flex-wrap">
        {ACTIVITY_TYPES.map(a => (
          <button key={a.id} onClick={() => setType(a.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors"
            style={{
              background: type === a.id ? `${a.color}20` : 'transparent',
              color: type === a.id ? a.color : colors.text.muted,
              border: `1px solid ${type === a.id ? `${a.color}40` : colors.border.default}`,
            }}>
            <a.icon className="w-3 h-3" /> {a.label}
          </button>
        ))}
      </div>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="What are you up to?"
        className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
        style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
      <input value={details} onChange={e => setDetails(e.target.value)} placeholder="Details (optional)"
        className="w-full px-3 py-2 rounded-lg text-[13px] outline-none"
        style={{ background: colors.bg.elevated, color: colors.text.primary, border: `1px solid ${colors.border.default}` }} />
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-3 py-1.5 rounded-lg text-[12px]" style={{ color: colors.text.muted }}>Cancel</button>
        <button onClick={() => { onSave({ type, name: name.trim(), details: details.trim(), emoji }); onClose(); }}
          disabled={!name.trim()}
          className="px-4 py-1.5 rounded-lg text-[12px] font-semibold text-white disabled:opacity-40"
          style={{ background: colors.accent.primary }}>
          Set Activity
        </button>
      </div>
    </div>
  );
}

export function useRichPresence(profileId) {
  const [activity, setActivity] = useState(null);

  const updateActivity = useCallback(async (data) => {
    if (!profileId) return;
    try {
      await base44.entities.UserProfile.update(profileId, {
        rich_presence: data ? { ...data, updated_at: new Date().toISOString() } : null,
      });
      setActivity(data);
    } catch {}
  }, [profileId]);

  const clearActivity = useCallback(() => updateActivity(null), [updateActivity]);

  return { activity, updateActivity, clearActivity };
}
