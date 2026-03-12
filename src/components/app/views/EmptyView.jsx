import React from 'react';
import { Plus, Compass, Bot, Crown, HelpCircle, Zap, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { colors } from '@/components/app/design/tokens';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return { text: 'Late night?', sub: 'The quiet hours hit different.' };
  if (h < 12) return { text: 'Morning', sub: 'Coffee first, then chaos.' };
  if (h < 17) return { text: 'Hey', sub: 'Back at it.' };
  if (h < 21) return { text: 'Evening', sub: 'Good time to catch up.' };
  return { text: 'Night owl', sub: 'One more scroll won\'t hurt.' };
}

export default function EmptyView({ onCreateServer, onJoinServer, emptyServer, serverName, onCreateChannel }) {
  const greeting = getGreeting();

  if (emptyServer) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-xs">
          <div className="text-[40px] mb-4">📭</div>
          <h2 className="text-[20px] font-bold mb-1.5" style={{ color: colors.text.primary }}>
            Empty in here
          </h2>
          <p className="text-[14px] mb-6" style={{ color: colors.text.muted }}>
            {serverName ? `${serverName} needs` : 'This server needs'} a channel to get started.
          </p>
          {onCreateChannel && (
            <button onClick={onCreateChannel} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-medium"
              style={{ background: colors.accent.primary, color: '#fff' }}>
              <Plus className="w-4 h-4" /> New channel
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden select-none">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Minimal header */}
        <div className="mb-12">
          <p className="text-[13px] font-medium mb-3" style={{ color: colors.text.disabled }}>
            {greeting.text} — {greeting.sub}
          </p>
          <h1 className="text-[28px] font-bold tracking-tight leading-[1.15]" style={{ color: colors.text.primary }}>
            Kairo
          </h1>
          <div className="w-8 h-[3px] rounded-full mt-3" style={{ background: colors.accent.primary }} />
        </div>

        {/* Actions — stacked, not side-by-side */}
        <div className="space-y-2 mb-10">
          <button onClick={onCreateServer}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-left group"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.border.default}` }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: colors.accent.primary }}>
              <Plus className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-medium" style={{ color: colors.text.primary }}>Create a server</p>
              <p className="text-[12px]" style={{ color: colors.text.disabled }}>Start something new</p>
            </div>
          </button>

          <button onClick={onJoinServer}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-lg text-left group"
            style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${colors.border.default}` }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.light}` }}>
              <Compass className="w-4 h-4" style={{ color: colors.text.muted }} />
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-medium" style={{ color: colors.text.primary }}>Join with an invite</p>
              <p className="text-[12px]" style={{ color: colors.text.disabled }}>Got a code? Paste it here</p>
            </div>
          </button>
        </div>

        {/* Links — just text, no icons, casual */}
        <div className="flex gap-4 flex-wrap">
          {[
            { href: createPageUrl('BotMarketplace'), label: 'Bots' },
            { href: createPageUrl('Elite'), label: 'Elite', accent: true },
            { href: createPageUrl('FAQ'), label: 'Help' },
            { href: createPageUrl('Support'), label: 'Support' },
          ].map(link => (
            <a key={link.label} href={link.href}
              className="text-[12px] font-medium hover:underline"
              style={{ color: link.accent ? colors.accent.hover : colors.text.disabled }}>
              {link.label}
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}