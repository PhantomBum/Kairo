import React from 'react';
import { Plus, Compass, Crown, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { colors } from '@/components/app/design/tokens';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return { text: 'Late night?', sub: 'The quiet hours hit different.' };
  if (h < 12) return { text: 'Good morning', sub: 'Start the day right.' };
  if (h < 17) return { text: 'Good afternoon', sub: 'Hope it\'s going well.' };
  if (h < 21) return { text: 'Good evening', sub: 'Time to catch up.' };
  return { text: 'Night owl', sub: 'One more scroll won\'t hurt.' };
}

export default function EmptyView({ onCreateServer, onJoinServer, emptyServer, serverName, onCreateChannel }) {
  const greeting = getGreeting();

  if (emptyServer) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-xs">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: colors.bg.overlay }}>
            <Hash className="w-7 h-7" style={{ color: colors.text.disabled }} />
          </div>
          <h2 className="text-[20px] font-bold mb-1.5" style={{ color: colors.text.primary }}>No channels yet</h2>
          <p className="text-[14px] mb-6" style={{ color: colors.text.muted }}>
            {serverName ? `${serverName} needs` : 'This server needs'} a channel to get started.
          </p>
          {onCreateChannel && (
            <button onClick={onCreateChannel} className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-[14px] font-medium"
              style={{ background: colors.accent.primary, color: '#fff' }}>
              <Plus className="w-4 h-4" /> New Channel
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 select-none">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="w-full max-w-md">
        <div className="mb-12">
          <p className="text-[13px] font-medium mb-2" style={{ color: colors.text.disabled }}>{greeting.text} — {greeting.sub}</p>
          <h1 className="text-[32px] font-bold tracking-tight" style={{ color: colors.text.primary }}>Kairo</h1>
          <div className="w-8 h-[3px] rounded-full mt-3" style={{ background: colors.accent.primary }} />
        </div>

        <div className="space-y-2 mb-10">
          <button onClick={onCreateServer}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-lg text-left transition-colors hover:bg-[rgba(255,255,255,0.03)]"
            style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.border.default}` }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: colors.accent.primary }}>
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[14px] font-semibold" style={{ color: colors.text.primary }}>Create a server</p>
              <p className="text-[12px] mt-0.5" style={{ color: colors.text.disabled }}>Start something new</p>
            </div>
          </button>

          <button onClick={onJoinServer}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-lg text-left transition-colors hover:bg-[rgba(255,255,255,0.03)]"
            style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.border.default}` }}>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: colors.bg.overlay }}>
              <Compass className="w-5 h-5" style={{ color: colors.text.muted }} />
            </div>
            <div>
              <p className="text-[14px] font-semibold" style={{ color: colors.text.primary }}>Join a server</p>
              <p className="text-[12px] mt-0.5" style={{ color: colors.text.disabled }}>Got a code? Use it here</p>
            </div>
          </button>
        </div>

        <div className="flex gap-5 flex-wrap">
          {[
            { href: createPageUrl('BotMarketplace'), label: 'Bots' },
            { href: createPageUrl('Elite'), label: 'Elite', accent: true },
            { href: createPageUrl('FAQ'), label: 'Help' },
            { href: createPageUrl('Support'), label: 'Support' },
          ].map(link => (
            <a key={link.label} href={link.href} className="text-[12px] font-medium hover:underline"
              style={{ color: link.accent ? colors.accent.primary : colors.text.disabled }}>{link.label}</a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}