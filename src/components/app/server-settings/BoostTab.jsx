import React, { useState, useEffect, useMemo } from 'react';
import { Zap, Crown, Check, X, Clock, Mic, Image, Smile, Stamp, Volume2, Link2, Music, Trophy } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const P = {
  base: '#111820', surface: '#161f2c', elevated: '#1b2535',
  floating: '#263446', border: '#ffffff18',
  textPrimary: '#e8edf5', textSecondary: '#9aaabb', muted: '#5d7a8a',
  accent: '#2dd4bf', success: '#34d399', danger: '#f87171', warning: '#fbbf24',
  boost: '#ff73fa',
};

const ADMIN_EMAILS = ['ilikebagels1612@gmail.com', 'rdw1612@gmail.com'];

const BOOST_TIERS = [
  { level: 0, boosts: 0, label: 'Default', color: '#68677a', perks: [
    { icon: Mic, text: '160kbps voice quality' },
  ]},
  { level: 1, boosts: 2, label: 'Level 1', color: '#ff73fa', perks: [
    { icon: Image, text: 'Animated server icon' },
    { icon: Smile, text: '15 custom emoji slots' },
    { icon: Image, text: 'Server banner unlocked' },
    { icon: Mic, text: '192kbps voice quality' },
  ]},
  { level: 2, boosts: 7, label: 'Level 2', color: '#f47fff', perks: [
    { icon: Smile, text: '30 custom emoji slots' },
    { icon: Mic, text: '256kbps voice quality' },
    { icon: Image, text: 'Animated server banner' },
    { icon: Link2, text: 'Custom invite background' },
    { icon: Stamp, text: '15 sticker slots' },
  ]},
  { level: 3, boosts: 14, label: 'Level 3', color: '#e066ff', perks: [
    { icon: Smile, text: '50 custom emoji slots' },
    { icon: Mic, text: '320kbps voice quality' },
    { icon: Link2, text: 'Vanity server URL' },
    { icon: Stamp, text: '30 sticker slots' },
    { icon: Music, text: '48 soundboard slots' },
  ]},
];

export function getBoostLevel(boostCount) {
  if (boostCount >= 14) return 3;
  if (boostCount >= 7) return 2;
  if (boostCount >= 2) return 1;
  return 0;
}

export default function BoostTab({ serverId, server }) {
  const [boosts, setBoosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serverId) return;
    base44.entities.ServerBoost.filter({ server_id: serverId }).then(b => { setBoosts(b); setLoading(false); }).catch(() => setLoading(false));
  }, [serverId]);

  const boostCount = boosts.length;
  const level = getBoostLevel(boostCount);
  const currentTier = BOOST_TIERS.find(t => t.level === level);
  const nextTier = BOOST_TIERS.find(t => t.level === level + 1);
  const nextBoosts = nextTier ? nextTier.boosts - boostCount : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-[16px] font-bold mb-1" style={{ color: P.textPrimary }}>Server Boosts</h3>
        <p className="text-[13px]" style={{ color: P.muted }}>Boosted servers unlock perks for everyone.</p>
      </div>

      {/* Current level */}
      <div className="p-5 rounded-xl text-center" style={{ background: `${P.boost}08`, border: `1px solid ${P.boost}20` }}>
        <Zap className="w-10 h-10 mx-auto mb-2" style={{ color: P.boost }} />
        <p className="text-[24px] font-bold" style={{ color: P.boost }}>{boostCount}</p>
        <p className="text-[13px]" style={{ color: P.textSecondary }}>Server Boost{boostCount !== 1 ? 's' : ''}</p>
        {level > 0 && (
          <div className="flex items-center gap-2 justify-center mt-2">
            <Trophy className="w-4 h-4" style={{ color: currentTier?.color || P.boost }} />
            <span className="text-[14px] font-bold" style={{ color: currentTier?.color || P.boost }}>Level {level}</span>
          </div>
        )}
        {nextTier && (
          <p className="text-[12px] mt-2" style={{ color: P.muted }}>
            {nextBoosts} more boost{nextBoosts !== 1 ? 's' : ''} to reach Level {nextTier.level}
          </p>
        )}

        {/* Progress bar */}
        {nextTier && (
          <div className="w-full h-2 rounded-full mt-3" style={{ background: P.elevated }}>
            <div className="h-full rounded-full transition-all" style={{
              width: `${Math.min(100, (boostCount / nextTier.boosts) * 100)}%`,
              background: `linear-gradient(90deg, ${P.boost}, ${P.accent})`,
            }} />
          </div>
        )}
      </div>

      {/* Boost tiers */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: P.muted }}>Boost Tiers</p>
        <div className="space-y-3">
          {BOOST_TIERS.map(tier => {
            const unlocked = level >= tier.level;
            return (
              <div key={tier.level} className="p-4 rounded-xl" style={{
                background: unlocked ? `${tier.color}08` : P.elevated,
                border: `1px solid ${unlocked ? `${tier.color}30` : P.border}`,
              }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: unlocked ? `${tier.color}20` : P.base }}>
                    <Zap className="w-5 h-5" style={{ color: unlocked ? tier.color : P.muted }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold" style={{ color: unlocked ? tier.color : P.textPrimary }}>{tier.label}</span>
                      {unlocked && <Check className="w-4 h-4" style={{ color: P.success }} />}
                    </div>
                    <p className="text-[12px]" style={{ color: P.muted }}>{tier.level === 0 ? 'No boosts' : `${tier.boosts} boosts required`}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {tier.perks.map((perk, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
                      style={{ background: unlocked ? `${tier.color}08` : P.base }}>
                      <perk.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: unlocked ? tier.color : P.muted }} />
                      <span className="text-[11px]" style={{ color: unlocked ? P.textSecondary : P.muted }}>{perk.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Boost history */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: P.muted }}>Boost History</p>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: P.border, borderTopColor: P.boost }} />
          </div>
        ) : boosts.length === 0 ? (
          <div className="text-center py-8 rounded-xl" style={{ background: P.elevated }}>
            <Zap className="w-8 h-8 mx-auto mb-2" style={{ color: P.muted, opacity: 0.2 }} />
            <p className="text-[13px]" style={{ color: P.muted }}>No boosts yet</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {boosts.sort((a, b) => new Date(b.boosted_at) - new Date(a.boosted_at)).map(b => (
              <div key={b.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${P.boost}15` }}>
                  <Zap className="w-4 h-4" style={{ color: P.boost }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate" style={{ color: P.textPrimary }}>{b.user_name || 'User'}</p>
                  <p className="text-[11px]" style={{ color: P.muted }}>
                    Boosted {b.boosted_at ? new Date(b.boosted_at).toLocaleDateString() : 'recently'}
                  </p>
                </div>
                {b.ended_at && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: `${P.muted}15`, color: P.muted }}>Ended</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
