import React from 'react';
import { Plus, Compass, Bot, Crown, HelpCircle, MessageSquare, Zap, Hash, Globe, Search, Shield } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { colors, shadows, radius } from '@/components/app/design/tokens';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good morning', emoji: '☀️' };
  if (h < 18) return { text: 'Good afternoon', emoji: '🌤️' };
  return { text: 'Good evening', emoji: '🌙' };
}

export default function EmptyView({ onCreateServer, onJoinServer, emptyServer, serverName, onCreateChannel, onSpaces }) {
  const greeting = getGreeting();

  if (emptyServer) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm k-fade-in">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: colors.accent.subtle }}>
            <Hash className="w-8 h-8" style={{ color: colors.accent.primary }} />
          </div>
          <h2 className="text-[24px] font-bold mb-2 tracking-tight" style={{ color: colors.text.primary }}>No channels yet</h2>
          <p className="text-[14px] mb-6" style={{ color: colors.text.muted }}>
            {serverName || 'This server'} doesn't have any channels yet. Create one to start chatting.
          </p>
          {onCreateChannel && (
            <button onClick={onCreateChannel} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-all hover:brightness-110"
              style={{ background: colors.accent.primary, color: '#fff' }}>
              <Plus className="w-4 h-4" /> Create Channel
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-30" style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 120%, ${colors.accent.primary}15, transparent), radial-gradient(ellipse 60% 40% at 20% 50%, ${colors.info}08, transparent), radial-gradient(ellipse 60% 40% at 80% 50%, ${colors.accent.primary}06, transparent)`,
      }} />

      <div className="text-center max-w-md relative z-10 k-fade-in">
        {/* Logo */}
        <div className="w-20 h-20 rounded-3xl mx-auto mb-8 flex items-center justify-center"
          style={{ background: colors.accent.subtle, boxShadow: shadows.glow }}>
          <span className="text-4xl font-bold" style={{ color: colors.accent.primary }}>K</span>
        </div>

        {/* Greeting */}
        <p className="text-[16px] mb-1" style={{ color: colors.text.muted }}>{greeting.emoji} {greeting.text}</p>
        <h2 className="text-[32px] font-bold mb-3 tracking-tight" style={{ color: colors.text.primary }}>Welcome to Kairo</h2>
        <p className="text-[15px] mb-10" style={{ color: colors.text.muted }}>Your conversations, communities, and creativity — all in one place.</p>

        {/* Primary actions */}
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={onCreateServer} className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-[15px] font-semibold transition-all hover:brightness-110 hover:scale-[1.02]"
            style={{ background: colors.accent.primary, color: '#fff', boxShadow: shadows.glow }}>
            <Plus className="w-5 h-5" /> Create Server
          </button>
          <button onClick={onJoinServer} className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-[15px] font-semibold transition-all hover:bg-[rgba(255,255,255,0.06)]"
            style={{ background: colors.bg.elevated, color: colors.text.secondary, border: `1px solid ${colors.border.light}` }}>
            <Compass className="w-5 h-5" /> Join Server
          </button>
        </div>

        {/* Quick links */}
        <div className="flex gap-2 justify-center mt-8 flex-wrap">
          {[
            { href: createPageUrl('BotMarketplace'), icon: Bot, label: 'Bots', color: colors.text.muted },
            { href: createPageUrl('Elite'), icon: Crown, label: 'Elite', color: colors.warning },
            { href: createPageUrl('FAQ'), icon: HelpCircle, label: 'Help', color: colors.text.muted },
            { href: createPageUrl('Support'), icon: Zap, label: 'Support', color: colors.text.muted },
          ].map(link => (
            <a key={link.label} href={link.href} className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-2 rounded-lg transition-colors hover:bg-[rgba(255,255,255,0.04)]" style={{ color: link.color }}>
              <link.icon className="w-4 h-4" /> {link.label}
            </a>
          ))}
        </div>

        {/* Kairo exclusive features highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-8 max-w-lg mx-auto text-left">
          {[
            { icon: Globe, label: 'Spaces', desc: 'Public communities with posts', color: colors.info },
            { icon: Shield, label: 'Privacy First', desc: 'Ghost mode & encrypted chats', color: colors.success },
            { icon: Search, label: 'Global Search', desc: 'Search across all servers', color: colors.accent.primary },
          ].map(f => (
            <div key={f.label} className="p-3 rounded-xl" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
              <f.icon className="w-5 h-5 mb-2" style={{ color: f.color }} />
              <p className="text-[13px] font-semibold" style={{ color: colors.text.primary }}>{f.label}</p>
              <p className="text-[11px]" style={{ color: colors.text.muted }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}