import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Zap } from 'lucide-react';
import { useProfiles } from '@/components/app/providers/ProfileProvider';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf',
};

export default function ServerHoverCard({ server, visible, anchorRect }) {
  const { profiles } = useProfiles();

  const onlineCount = useMemo(() => {
    if (!server) return 0;
    return profiles.filter(p => p.is_online && p.status !== 'invisible').length;
  }, [profiles, server?.id]);

  if (!server || !anchorRect) return null;

  const top = Math.max(8, anchorRect.top + anchorRect.height / 2 - 120);
  const left = Math.min(anchorRect.right + 12, window.innerWidth - 320);
  const bannerBg = server.banner_url
    ? `url(${server.banner_url})`
    : `linear-gradient(135deg, ${server.banner_color || P.accent}88, ${server.banner_color || P.accent}33)`;

  const boostLevel = server.features?.includes('boost_progress') ? 1 : 0;
  const initials = server.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -8, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -8, scale: 0.96 }}
          transition={{ type: 'spring', damping: 28, stiffness: 400, mass: 0.8 }}
          className="fixed z-[100] w-[300px] rounded-xl overflow-hidden pointer-events-auto"
          style={{
            top, left,
            background: P.surface,
            border: `1px solid ${P.border}`,
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          }}
        >
          {/* Banner header */}
          <div className="h-[90px] relative" style={{
            background: bannerBg,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
            <div className="absolute inset-0" style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)',
            }} />
            {boostLevel > 0 && (
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full flex items-center gap-1 text-[11px] font-semibold"
                style={{ background: 'rgba(0,0,0,0.5)', color: '#f472b6', backdropFilter: 'blur(8px)' }}>
                <Zap className="w-3 h-3" /> Level {boostLevel}
              </div>
            )}
          </div>

          {/* Server info */}
          <div className="px-4 pb-4 -mt-5">
            <div className="w-11 h-11 rounded-[14px] overflow-hidden flex items-center justify-center text-[15px] font-bold mb-2"
              style={{
                background: server.icon_url ? 'transparent' : P.elevated,
                color: P.textPrimary,
                border: `3px solid ${P.surface}`,
              }}>
              {server.icon_url
                ? <img src={server.icon_url} className="w-full h-full object-cover" alt="" />
                : initials}
            </div>

            <h3 className="text-[15px] font-bold truncate" style={{ color: P.textPrimary }}>
              {server.name}
            </h3>
            {server.description && (
              <p className="text-[12px] mt-1 line-clamp-2 leading-relaxed" style={{ color: P.muted }}>
                {server.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex gap-5 mt-3">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" style={{ color: P.muted }} />
                <span className="text-[12px] font-medium" style={{ color: P.textSecondary }}>
                  {server.member_count || 1} Members
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#3ba55c' }} />
                <span className="text-[12px] font-medium" style={{ color: P.textSecondary }}>
                  {onlineCount} Online
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
