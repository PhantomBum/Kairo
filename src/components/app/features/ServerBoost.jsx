import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Check, X, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { getBoostLevel } from '@/components/app/server-settings/BoostTab';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', success: '#34d399', danger: '#f87171',
  boost: '#ff73fa',
};

const ADMIN_EMAILS = ['ilikebagels1612@gmail.com', 'rdw1612@gmail.com'];

export function useServerBoosts(serverId) {
  const [boosts, setBoosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!serverId) return;
    base44.entities.ServerBoost.filter({ server_id: serverId })
      .then(b => { setBoosts(b.filter(x => !x.ended_at)); setLoading(false); })
      .catch(() => setLoading(false));
  }, [serverId]);

  const refresh = useCallback(async () => {
    if (!serverId) return;
    const b = await base44.entities.ServerBoost.filter({ server_id: serverId });
    setBoosts(b.filter(x => !x.ended_at));
  }, [serverId]);

  return { boosts, boostCount: boosts.length, level: getBoostLevel(boosts.length), loading, refresh };
}

export function getAvailableBoosts(profile, currentUserEmail) {
  const isAdmin = ADMIN_EMAILS.includes(currentUserEmail);
  if (isAdmin) return 999;
  const hasElite = profile?.badges?.includes('premium') || profile?.badges?.includes('kairo_elite');
  const total = hasElite ? 3 : 1;
  const used = profile?.boosts_used || 0;
  return Math.max(0, total - used);
}

export function BoostBadge({ count, level }) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: `${P.boost}15`, color: P.boost }}>
      <Zap className="w-3 h-3" /> {count}
      {level > 0 && <span className="ml-0.5">· Lvl {level}</span>}
    </div>
  );
}

export function BoostConfirmModal({ serverName, available, onConfirm, onCancel, isBoosted, onRemove }) {
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)' }} onClick={onCancel}>
        <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 28, stiffness: 400 }}
          className="w-full max-w-sm rounded-2xl overflow-hidden"
          style={{ background: P.floating, border: `1px solid ${P.border}` }}
          onClick={e => e.stopPropagation()}>

          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: `${P.boost}12` }}>
              <Zap className="w-8 h-8" style={{ color: P.boost }} />
            </div>

            {isBoosted ? (
              <>
                <h3 className="text-[18px] font-bold mb-2" style={{ color: P.textPrimary }}>Remove Boost?</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: P.muted }}>
                  You are currently boosting <strong style={{ color: P.textSecondary }}>{serverName}</strong>.
                  Removing your boost will reduce the server's boost count immediately.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-[18px] font-bold mb-2" style={{ color: P.textPrimary }}>Boost {serverName}?</h3>
                <p className="text-[13px] leading-relaxed mb-2" style={{ color: P.muted }}>
                  Uses 1 of your <strong style={{ color: P.textSecondary }}>{available}</strong> available boost{available !== 1 ? 's' : ''}.
                  Boosts renew monthly.
                </p>
                {available === 0 && (
                  <p className="text-[12px] px-3 py-2 rounded-lg mt-2" style={{ background: `${P.danger}10`, color: P.danger }}>
                    You don't have any boosts available. Elite users get 3 boosts.
                  </p>
                )}
              </>
            )}
          </div>

          <div className="px-6 pb-5 flex gap-3">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-medium"
              style={{ background: P.elevated, color: P.textSecondary }}>
              Cancel
            </button>
            {isBoosted ? (
              <button onClick={onRemove}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:brightness-110"
                style={{ background: P.danger, color: '#fff' }}>
                Remove Boost
              </button>
            ) : (
              <button onClick={onConfirm} disabled={available === 0}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all hover:brightness-110 disabled:opacity-30"
                style={{ background: P.boost, color: '#fff' }}>
                <Zap className="w-4 h-4 inline mr-1" /> Boost
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function BoostHeaderButton({ boostCount, level, isBoosted, onClick }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all hover:brightness-110"
      style={{
        background: isBoosted ? `${P.boost}20` : 'rgba(255,255,255,0.06)',
        color: isBoosted ? P.boost : P.muted,
        border: `1px solid ${isBoosted ? `${P.boost}40` : 'transparent'}`,
      }}>
      <Zap className="w-3.5 h-3.5" style={{ color: isBoosted ? P.boost : P.muted }} />
      {boostCount > 0 && <span>{boostCount}</span>}
      {level > 0 && (
        <span className="flex items-center gap-0.5">
          <Trophy className="w-3 h-3" /> {level}
        </span>
      )}
    </button>
  );
}
