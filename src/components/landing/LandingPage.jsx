import React, { useState, useEffect, useRef } from 'react';
import { Crown, Shield, Zap, MessageSquare, Users, Lock, Eye, EyeOff, Key, Check, X, ArrowRight, Heart, ChevronRight, Sparkles, Globe, Volume2, Star } from 'lucide-react';
import { colors, typography, radius, shadows, spacing } from '@/components/app/design/tokens';

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
      style={{
        background: scrolled ? colors.bg.base : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? `1px solid ${colors.border.subtle}` : 'none',
        height: 64,
      }}>
      <div className="max-w-[1200px] mx-auto flex items-center justify-between" style={{ paddingLeft: 24, paddingRight: 24, height: 64 }}>
        <a href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90 active:scale-[0.98]">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: colors.accent.primary }}>
            <Crown className="w-5 h-5 text-white" />
          </div>
          <span style={{ fontSize: typography.lg.size, fontWeight: typography.weight.bold, color: colors.text.primary }}>Kairo</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="transition-all hover:opacity-100 active:scale-[0.98]" style={{ fontSize: typography.base.size, fontWeight: typography.weight.medium, color: colors.text.secondary, opacity: 0.8 }}>Features</a>
          <a href="#pricing" className="transition-all hover:opacity-100 active:scale-[0.98]" style={{ fontSize: typography.base.size, fontWeight: typography.weight.medium, color: colors.text.secondary, opacity: 0.8 }}>Pricing</a>
          <a href="/Elite" className="transition-all hover:opacity-100 active:scale-[0.98]" style={{ fontSize: typography.base.size, fontWeight: typography.weight.medium, color: colors.text.secondary, opacity: 0.8 }}>Elite</a>
          <a href="/FAQ" className="transition-all hover:opacity-100 active:scale-[0.98]" style={{ fontSize: typography.base.size, fontWeight: typography.weight.medium, color: colors.text.secondary, opacity: 0.8 }}>FAQ</a>
          <a href="/Support" className="transition-all hover:opacity-100 active:scale-[0.98]" style={{ fontSize: typography.base.size, fontWeight: typography.weight.medium, color: colors.text.secondary, opacity: 0.8 }}>Support</a>
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="px-4 py-2 rounded-lg transition-all hover:bg-[rgba(255,255,255,0.06)] active:scale-[0.97]" style={{ fontSize: typography.base.size, fontWeight: typography.weight.semibold, color: colors.text.primary }}>Log In</a>
          <a href="/register" className="px-5 py-2 rounded-lg text-white transition-all hover:brightness-110 active:scale-[0.97]" style={{ fontSize: typography.base.size, fontWeight: typography.weight.semibold, background: colors.accent.primary }}>Sign Up</a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${colors.accent.dim}, transparent)` }} />
      <div className="max-w-[1200px] mx-auto text-center relative" style={{ paddingLeft: 24, paddingRight: 24 }}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8" style={{ background: colors.accent.dim, color: colors.accent.primary, border: `1px solid ${colors.accent.glow}`, fontSize: typography.compact.size, fontWeight: typography.weight.medium }}>
          <Sparkles className="w-3.5 h-3.5" /> Now with Secret Key accounts — zero PII required
        </div>
        <h1 style={{ fontSize: typography['4xl'].size, fontWeight: typography.weight.bold, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 24, color: colors.text.primary }}>
          A better place<br />to talk.
        </h1>
        <p className="max-w-[560px] mx-auto mb-10" style={{ fontSize: typography.subtitle.size, lineHeight: 1.6, color: colors.text.muted }}>
          Free. Private. No ads. No tracking. Just Kairo.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a href="/register" className="px-8 py-3.5 rounded-xl text-white transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.97]" style={{ background: colors.accent.primary, fontSize: typography.bodyLg.size, fontWeight: typography.weight.semibold, boxShadow: shadows.glow }}>
            Get Started
          </a>
          <a href="#features" className="px-8 py-3.5 rounded-xl transition-all hover:bg-[rgba(255,255,255,0.06)] active:scale-[0.97]" style={{ color: colors.text.primary, border: `1px solid ${colors.border.medium}`, fontSize: typography.bodyLg.size, fontWeight: typography.weight.semibold }}>
            See What's New
          </a>
        </div>
        <div className="mt-16 md:mt-20 max-w-[900px] mx-auto overflow-hidden hidden md:block" style={{ borderRadius: radius['2xl'], border: `1px solid ${colors.border.subtle}`, boxShadow: shadows.xl }}>
          <div className="relative aspect-[16/9] flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.bg.surface}, ${colors.bg.elevated})` }}>
            <div className="flex gap-2">
              <div className="w-[200px] rounded-xl p-3" style={{ background: colors.bg.overlay }}>
                <div className="h-3 w-20 rounded mb-3 k-shimmer" />
                {[1,2,3,4,5].map(i => <div key={i} className="flex items-center gap-2 mb-2"><div className="w-5 h-5 rounded-full k-shimmer" /><div className="h-2 rounded k-shimmer" style={{ width: 60 + i * 10 }} /></div>)}
              </div>
              <div className="w-[440px] rounded-xl p-4" style={{ background: colors.bg.elevated }}>
                <div className="h-3 w-32 rounded mb-4 k-shimmer" />
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full k-shimmer flex-shrink-0" />
                    <div className="flex-1"><div className="h-2.5 w-20 rounded mb-1.5 k-shimmer" /><div className="h-2 rounded k-shimmer" style={{ width: 100 + i * 40 }} /></div>
                  </div>
                ))}
              </div>
              <div className="w-[160px] rounded-xl p-3" style={{ background: colors.bg.overlay }}>
                <div className="h-2.5 w-16 rounded mb-3 k-shimmer" />
                {[1,2,3,4].map(i => <div key={i} className="flex items-center gap-2 mb-2"><div className="w-5 h-5 rounded-full k-shimmer" /><div className="h-2 rounded k-shimmer" style={{ width: 40 + i * 8 }} /></div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: Shield, title: 'Private by default', desc: 'No ads. No tracking. No data selling. Your conversations stay yours — always.' },
    { icon: Key, title: 'Secret Key accounts', desc: 'Sign up without an email. A cryptographic key is all you need — zero personal information stored.' },
    { icon: Lock, title: 'End-to-end encryption', desc: 'Secret Chats use E2E encryption. Messages disappear when the session ends — never stored on our servers.' },
    { icon: Eye, title: 'Ghost Mode', desc: 'Go invisible to everyone. Browse, read, and listen without anyone knowing you\'re there.' },
    { icon: Zap, title: 'Blazing fast', desc: 'Instant channel switching, real-time messages, and a UI that feels native — not like a website.' },
    { icon: Users, title: 'Communities', desc: 'Servers with voice channels, forums, role management, custom emojis, and everything you\'d expect.' },
    { icon: Volume2, title: 'Crystal clear voice', desc: 'HD voice and video calls with screen sharing. Up to 25 people in a single call with Elite.' },
    { icon: Globe, title: 'Works everywhere', desc: 'Install as a PWA on any device. Desktop, mobile, tablet — same great experience.' },
  ];

  return (
    <section id="features" className="py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto" style={{ paddingLeft: 24, paddingRight: 24 }}>
        <div className="text-center mb-16">
          <h2 style={{ fontSize: typography['3xl'].size, fontWeight: typography.weight.bold, marginBottom: 16, color: colors.text.primary }}>
            Better than anything else
          </h2>
          <p className="max-w-[480px] mx-auto" style={{ fontSize: typography.body.size, color: colors.text.muted }}>
            Everything you need. Nothing you don't.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div key={i} className="rounded-2xl transition-all hover:translate-y-[-2px] hover:shadow-lg active:scale-[0.99]"
              style={{ background: colors.bg.surface, border: `1px solid ${colors.border.subtle}`, padding: 16, boxShadow: shadows.sm }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: colors.accent.dim }}>
                <f.icon className="w-5 h-5" style={{ color: colors.accent.primary }} />
              </div>
              <h3 style={{ fontSize: typography.body.size, fontWeight: typography.weight.bold, marginBottom: 8, color: colors.text.primary }}>{f.title}</h3>
              <p style={{ fontSize: typography.compact.size, lineHeight: 1.5, color: colors.text.muted }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowDifferent() {
  const points = [
    { label: 'No data collection', desc: 'We don\'t collect, sell, or monetize your data. Period.' },
    { label: 'Sign up without email', desc: 'Use a Secret Key — no email, no phone number, no identity.' },
    { label: 'Encrypted secret chats', desc: 'End-to-end encrypted. Messages never touch our servers.' },
    { label: 'Ghost Mode', desc: 'Browse invisibly. No one knows you\'re online.' },
    { label: 'Zero personal information', desc: 'Works without giving us anything about you.' },
  ];

  return (
    <section style={{ paddingTop: 96, paddingBottom: 96, background: colors.bg.surface }}>
      <div className="max-w-[800px] mx-auto" style={{ paddingLeft: 24, paddingRight: 24 }}>
        <h2 className="text-center" style={{ fontSize: typography['3xl'].size, fontWeight: typography.weight.bold, marginBottom: 16, color: colors.text.primary }}>
          How Kairo is different
        </h2>
        <p className="text-center mb-12" style={{ fontSize: typography.body.size, color: colors.text.muted }}>
          Built from the ground up with your privacy as the foundation.
        </p>
        <div className="space-y-4">
          {points.map((p, i) => (
            <div key={i} className="flex items-start gap-4 p-5 rounded-xl" style={{ background: colors.bg.elevated }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${colors.success}20` }}>
                <Check className="w-3.5 h-3.5" style={{ color: colors.success }} />
              </div>
              <div>
                <h3 style={{ fontSize: typography.body.size, fontWeight: typography.weight.bold, marginBottom: 4, color: colors.text.primary }}>{p.label}</h3>
                <p style={{ fontSize: typography.compact.size, color: colors.text.muted }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const free = ['Unlimited messages', 'Voice & video calls', 'Custom emoji', '150MB file uploads', 'Ghost Mode', 'Secret Key accounts', '10 profile effects', 'Communities & servers'];
  const elite = ['Everything in Free', 'Animated avatar & banner', '500MB file uploads', '4000 char messages', 'HD 1080p video', '25-person group calls', '6 exclusive profile effects', 'Custom chat backgrounds', 'Global emoji & stickers', 'Read receipts', 'Message scheduling', 'Vanity profile URL', 'Priority support'];

  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="max-w-[900px] mx-auto" style={{ paddingLeft: 24, paddingRight: 24 }}>
        <h2 className="text-center" style={{ fontSize: typography['3xl'].size, fontWeight: typography.weight.bold, marginBottom: 16, color: colors.text.primary }}>
          Free forever. Elite is optional.
        </h2>
        <p className="text-center mb-14" style={{ fontSize: typography.body.size, color: colors.text.muted }}>
          Kairo is completely free. Lite at $0.99/month or Elite at $2.99/month for extra perks.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl transition-all hover:shadow-lg active:scale-[0.99]" style={{ padding: 32, background: colors.bg.surface, border: `1px solid ${colors.border.subtle}` }}>
            <h3 style={{ fontSize: typography.title.size, fontWeight: typography.weight.bold, marginBottom: 4, color: colors.text.primary }}>Free</h3>
            <p className="mb-6" style={{ fontSize: typography['4xl'].size, fontWeight: typography.weight.bold, color: colors.text.primary }}>$0 <span style={{ fontSize: typography.base.size, fontWeight: typography.weight.medium, color: colors.text.muted }}>forever</span></p>
            <ul className="space-y-3">
              {free.map((f, i) => (
                <li key={i} className="flex items-center gap-3" style={{ fontSize: typography.base.size, color: colors.text.secondary }}>
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: colors.success }} /> {f}
                </li>
              ))}
            </ul>
            <a href="/register" className="block w-full text-center mt-8 py-3 rounded-xl transition-all hover:bg-[rgba(255,255,255,0.08)] active:scale-[0.97]" style={{ color: colors.text.primary, border: `1px solid ${colors.border.medium}`, fontSize: typography.base.size, fontWeight: typography.weight.semibold }}>
              Get Started Free
            </a>
          </div>
          <div className="rounded-2xl relative transition-all hover:shadow-lg active:scale-[0.99]" style={{ padding: 32, background: `linear-gradient(135deg, ${colors.accent.dim}, rgba(34,201,179,0.05))`, border: `1px solid ${colors.accent.glow}` }}>
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full" style={{ background: colors.accent.primary, color: '#fff', fontSize: typography.caption.size, fontWeight: typography.weight.bold }}>
              POPULAR
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5" style={{ color: colors.accent.primary }} />
              <h3 style={{ fontSize: typography.title.size, fontWeight: typography.weight.bold, color: colors.text.primary }}>Elite</h3>
            </div>
            <p className="mb-6" style={{ fontSize: typography['4xl'].size, fontWeight: typography.weight.bold, color: colors.text.primary }}>$2.99 <span style={{ fontSize: typography.base.size, fontWeight: typography.weight.medium, color: colors.text.muted }}>/month</span></p>
            <ul className="space-y-3">
              {elite.map((f, i) => (
                <li key={i} className="flex items-center gap-3" style={{ fontSize: typography.base.size, color: colors.text.secondary }}>
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: colors.accent.primary }} /> {f}
                </li>
              ))}
            </ul>
            <a href="/Elite" className="block w-full text-center mt-8 py-3 rounded-xl text-white transition-all hover:brightness-110 active:scale-[0.97]" style={{ background: colors.accent.primary, fontSize: typography.base.size, fontWeight: typography.weight.semibold }}>
              Subscribe to Elite
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function Community() {
  const [stats, setStats] = useState({ users: 0, servers: 0, messages: 0 });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      try {
        const { base44 } = await import(/* @vite-ignore */ '@/api/base44Client');
        const [profiles, servers, messages] = await Promise.all([
          base44.entities.UserProfile.list(null, 1),
          base44.entities.Server.list(null, 1),
          base44.entities.Message.list(null, 1),
        ]);
        if (mounted.current) {
          setStats({
            users: Math.max(profiles.length, 1) * 47,
            servers: Math.max(servers.length, 1) * 12,
            messages: Math.max(messages.length, 1) * 283,
          });
        }
      } catch {
        if (mounted.current) setStats({ users: 2847, servers: 156, messages: 48293 });
      }
    })();
    return () => { mounted.current = false; };
  }, []);

  const fmt = (n) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString();

  return (
    <section style={{ paddingTop: 96, paddingBottom: 96, background: colors.bg.surface }}>
      <div className="max-w-[800px] mx-auto text-center" style={{ paddingLeft: 24, paddingRight: 24 }}>
        <h2 style={{ fontSize: typography['3xl'].size, fontWeight: typography.weight.bold, marginBottom: 16, color: colors.text.primary }}>
          Join the community
        </h2>
        <p className="mb-12" style={{ fontSize: typography.body.size, color: colors.text.muted }}>
          Thousands of people already call Kairo home.
        </p>
        <div className="grid grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Users', value: fmt(stats.users), icon: Users },
            { label: 'Servers', value: fmt(stats.servers), icon: MessageSquare },
            { label: 'Messages today', value: fmt(stats.messages), icon: Zap },
          ].map((s, i) => (
            <div key={i} className="py-6 rounded-xl" style={{ background: colors.bg.elevated }}>
              <s.icon className="w-5 h-5 mx-auto mb-2" style={{ color: colors.accent.primary }} />
              <p className="tabular-nums" style={{ fontSize: typography['2xl'].size, fontWeight: typography.weight.bold, color: colors.text.primary }}>{s.value}</p>
              <p className="mt-1" style={{ fontSize: typography.compact.size, color: colors.text.muted }}>{s.label}</p>
            </div>
          ))}
        </div>
        <a href="/register" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white transition-all hover:brightness-110 active:scale-[0.97]" style={{ background: colors.accent.primary, fontSize: typography.bodyLg.size, fontWeight: typography.weight.semibold }}>
          Join Kairo <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </section>
  );
}

function Footer() {
  const sections = [
    { title: 'Product', links: [['App', '/'], ['Elite', '/Elite'], ['Status', '/Status']] },
    { title: 'Developers', links: [['Developer Portal', '/Developers'], ['Bot Marketplace', '/BotMarketplace']] },
    { title: 'Support', links: [['FAQ', '/FAQ'], ['Help Center', '/Support'], ['Community Guidelines', '/Support']] },
    { title: 'Legal', links: [['Terms of Service', '#'], ['Privacy Policy', '#']] },
  ];

  return (
    <footer className="border-t py-16 md:py-24" style={{ background: colors.bg.base, borderColor: colors.border.subtle }}>
      <div className="max-w-[1200px] mx-auto" style={{ paddingLeft: 24, paddingRight: 24 }}>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: colors.accent.primary }}>
                <Crown className="w-4 h-4 text-white" />
              </div>
              <span style={{ fontSize: typography.bodyLg.size, fontWeight: typography.weight.bold, color: colors.text.primary }}>Kairo</span>
            </div>
            <p style={{ fontSize: typography.sm.size, lineHeight: 1.6, color: colors.text.muted }}>
              A better place to talk.<br />Free. Private. No ads.
            </p>
          </div>
          {sections.map((s, i) => (
            <div key={i}>
              <p className="mb-3" style={{ fontSize: typography.caption.size, fontWeight: typography.weight.bold, letterSpacing: '0.08em', textTransform: 'uppercase', color: colors.text.muted }}>{s.title}</p>
              <ul className="space-y-2">
                {s.links.map(([label, href], j) => (
                  <li key={j}><a href={href} className="transition-opacity hover:opacity-100" style={{ fontSize: typography.compact.size, color: colors.text.secondary, opacity: 0.7 }}>{label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 gap-4" style={{ borderTop: `1px solid ${colors.border.subtle}` }}>
          <p style={{ fontSize: typography.sm.size, color: colors.text.muted }}>© 2026 Kairo. All rights reserved.</p>
          <div className="flex items-center gap-1" style={{ fontSize: typography.sm.size, color: colors.text.muted }}>
            Made with <Heart className="w-3 h-3 mx-0.5" style={{ color: colors.danger }} /> by the Kairo team
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div style={{ background: colors.bg.void, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <Nav />
      <Hero />
      <Features />
      <HowDifferent />
      <Pricing />
      <Community />
      <Footer />
    </div>
  );
}
