import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BADGE_CONFIG, RARITY } from './badgeConfig';
import { colors } from '@/components/app/design/tokens';

export default function BadgeNotification({ badge, onDismiss }) {
  const [visible, setVisible] = useState(true);
  const cfg = BADGE_CONFIG[badge];

  useEffect(() => {
    const timer = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 300); }, 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!cfg) return null;
  const Icon = cfg.icon;
  const rarity = RARITY[cfg.rarity];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 left-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{
            background: colors.bg.float,
            border: `1px solid ${cfg.color}40`,
            boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${cfg.color}15`,
            maxWidth: 320,
          }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `${cfg.color}20`, border: `1px solid ${cfg.color}30` }}>
            <Icon className="w-5 h-5" style={{ color: cfg.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: rarity.color }}>
              Badge Earned — {rarity.label}
            </p>
            <p className="text-[13px] font-bold truncate" style={{ color: colors.text.primary }}>{cfg.label}</p>
            <p className="text-[11px] truncate" style={{ color: colors.text.muted }}>{cfg.desc}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}