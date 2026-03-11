import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Zap } from 'lucide-react';
import { colors, shadows, radius } from '@/components/app/design/tokens';
import { useProfiles } from '@/components/app/providers/ProfileProvider';

export default function ServerHoverCard({ server, visible, anchorRect }) {
  const { profiles } = useProfiles();

  const onlineCount = useMemo(() => {
    if (!server) return 0;
    return profiles.filter(p => p.is_online && p.status !== 'invisible').length;
  }, [profiles, server?.id]);

  if (!server || !anchorRect) return null;

  const top = Math.max(8, anchorRect.top + anchorRect.height / 2 - 120);
  const left = anchorRect.right + 12;
  const bannerBg = server.banner_url
    ? `url(${server.banner_url})`
    : `linear-gradient(135deg, ${server.banner_color || colors.accent.primary}88, ${server.banner_color || colors.accent.active}44)`;

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
          className="fixed z-[100] w-[280px] rounded-xl overflow-hidden pointer-events-auto"
          style={{
            top,
            left,
            background: colors.bg.elevated,
            border: `1px solid ${colors.border.light}`,
            boxShadow: shadows.strong,
          }}
        >
          {/* Banner */}
          <div className="h-[80px] relative" style={{
            background: bannerBg,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}>
            {boostLevel > 0 && (
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-semibold"
                style={{ background: 'rgba(0,0,0,0.5)', color: '#f472b6', backdropFilter: 'blur(8px)' }}>
                <Zap className="w-3 h-3" /> Boosted
              </div>
            )}
          </div>

          {/* Info */}
          <div className="px-3.5 pb-3.5 -mt-5">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center text-[14px] font-bold mb-2"
              style={{
                background: server.icon_url ? 'transparent' : colors.bg.overlay,
                color: colors.text.primary,
                border: `3px solid ${colors.bg.elevated}`,
              }}>
              {server.icon_url
                ? <img src={server.icon_url} className="w-full h-full object-cover" alt="" />
                : initials}
            </div>

            <h3 className="text-[14px] font-bold truncate" style={{ color: colors.text.primary }}>
              {server.name}
            </h3>
            {server.description && (
              <p className="text-[12px] mt-0.5 line-clamp-2 leading-relaxed" style={{ color: colors.text.muted }}>
                {server.description}
              </p>
            )}

            {/* Stats */}
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" style={{ color: colors.text.disabled }} />
                <span className="text-[12px] font-medium" style={{ color: colors.text.secondary }}>
                  {server.member_count || 1} Members
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: colors.status.online }} />
                <span className="text-[12px] font-medium" style={{ color: colors.text.secondary }}>
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