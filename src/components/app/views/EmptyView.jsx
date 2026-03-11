import React from 'react';
import { Plus, Compass, Bot, Crown, HelpCircle, Zap, Hash, Users, MessageCircle, Shield, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';
import { colors, shadows } from '@/components/app/design/tokens';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return { text: 'Still up?', sub: "The best ideas come at night.", emoji: '🌌' };
  if (h < 12) return { text: 'Good morning', sub: "What's on the agenda today?", emoji: '☀️' };
  if (h < 17) return { text: 'Good afternoon', sub: 'Hope your day is going well.', emoji: '🌤️' };
  if (h < 21) return { text: 'Good evening', sub: 'Time to wind down and connect.', emoji: '🌆' };
  return { text: 'Good night', sub: 'One more conversation before bed?', emoji: '🌙' };
}

function FeatureCard({ icon: Icon, label, desc, color }) {
  return (
    <div className="p-4 rounded-xl group" style={{ background: colors.bg.elevated, border: `1px solid ${colors.border.default}` }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ background: `${color}12` }}>
        <Icon className="w-[18px] h-[18px]" style={{ color }} />
      </div>
      <p className="text-[14px] font-semibold mb-1" style={{ color: colors.text.primary }}>{label}</p>
      <p className="text-[12px] leading-relaxed" style={{ color: colors.text.muted }}>{desc}</p>
    </div>
  );
}

export default function EmptyView({ onCreateServer, onJoinServer, emptyServer, serverName, onCreateChannel }) {
  const greeting = getGreeting();

  if (emptyServer) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0, 0, 0.2, 1] }}
          className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: colors.accent.subtle }}>
            <Hash className="w-8 h-8" style={{ color: colors.accent.primary }} />
          </div>
          <h2 className="text-[24px] font-bold mb-2 tracking-tight" style={{ color: colors.text.primary }}>No channels yet</h2>
          <p className="text-[14px] leading-relaxed mb-6" style={{ color: colors.text.muted }}>
            {serverName || 'This server'} is a blank canvas. Create your first channel to start the conversation.
          </p>
          {onCreateChannel && (
            <button onClick={onCreateChannel} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold hover:brightness-110"
              style={{ background: colors.accent.primary, color: '#fff', boxShadow: shadows.accentGlow }}>
              <Plus className="w-4 h-4" /> Create Channel
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
      {/* Ambient gradient */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `radial-gradient(ellipse 80% 50% at 50% 100%, ${colors.accent.primary}08, transparent), radial-gradient(ellipse 50% 40% at 20% 20%, ${colors.info}05, transparent)`,
      }} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
        className="text-center max-w-lg relative z-10">
        
        {/* Kairo logo mark */}
        <div className="w-20 h-20 rounded-[22px] mx-auto mb-8 flex items-center justify-center relative"
          style={{ background: `linear-gradient(135deg, ${colors.accent.primary}, ${colors.accent.active})`, boxShadow: shadows.accentGlow }}>
          <span className="text-4xl font-bold text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>K</span>
        </div>

        {/* Greeting */}
        <p className="text-[15px] mb-1.5 font-medium" style={{ color: colors.text.muted }}>{greeting.emoji} {greeting.text}</p>
        <h2 className="text-[36px] font-bold mb-2 tracking-tight leading-tight" style={{ color: colors.text.primary }}>Welcome to Kairo</h2>
        <p className="text-[15px] leading-relaxed mb-10" style={{ color: colors.text.muted }}>{greeting.sub}</p>

        {/* Primary actions */}
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={onCreateServer} className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-[15px] font-semibold hover:brightness-110"
            style={{ background: `linear-gradient(135deg, ${colors.accent.primary}, ${colors.accent.active})`, color: '#fff', boxShadow: shadows.accentGlow }}>
            <Plus className="w-5 h-5" /> Create Server
          </button>
          <button onClick={onJoinServer} className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-[15px] font-semibold hover:bg-[rgba(255,255,255,0.06)]"
            style={{ background: colors.bg.elevated, color: colors.text.secondary, border: `1px solid ${colors.border.light}` }}>
            <Compass className="w-5 h-5" /> Join Server
          </button>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-12 text-left">
          <FeatureCard icon={MessageCircle} label="Real-time Chat" desc="Instant messaging with reactions, threads, and rich media" color={colors.accent.primary} />
          <FeatureCard icon={Shield} label="Privacy First" desc="Ghost mode, encryption, and complete data control" color={colors.success} />
          <FeatureCard icon={Sparkles} label="Built Different" desc="Spaces, boards, bots, and features you won't find anywhere else" color={colors.warning} />
        </div>

        {/* Quick links */}
        <div className="flex gap-1 justify-center mt-8 flex-wrap">
          {[
            { href: createPageUrl('BotMarketplace'), icon: Bot, label: 'Bots' },
            { href: createPageUrl('Elite'), icon: Crown, label: 'Elite', color: colors.warning },
            { href: createPageUrl('FAQ'), icon: HelpCircle, label: 'Help' },
            { href: createPageUrl('Support'), icon: Zap, label: 'Support' },
          ].map(link => (
            <a key={link.label} href={link.href} className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-2 rounded-lg hover:bg-[rgba(255,255,255,0.04)]" style={{ color: link.color || colors.text.muted }}>
              <link.icon className="w-3.5 h-3.5" /> {link.label}
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}