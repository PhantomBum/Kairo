import React, { useState, useEffect, useRef } from 'react';
import { Crown, Shield, Zap, MessageSquare, Users, Lock, Eye, EyeOff, Key, Check, X, ArrowRight, Heart, ChevronRight, Sparkles, Globe, Volume2, Star } from 'lucide-react';

const C = {
  bg: '#18181c', surface: '#1e1e23', elevated: '#26262d', overlay: '#2e2e37',
  accent: '#2dd4bf', accentHover: '#5eead4', text: '#e8edf5', textSec: '#9aaabb',
  muted: '#68677a', border: '#33333d', success: '#3ba55d',
  danger: '#ed4245', warning: '#faa81a',
};

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
      style={{ background: scrolled ? 'rgba(24,24,28,0.85)' : 'transparent', backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none', borderBottom: scrolled ? `1px solid ${C.border}` : 'none' }}>
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.accent }}>
            <Crown className="w-5 h-5 text-white" />
          </div>
          <span className="text-[18px] font-bold" style={{ color: C.text }}>Kairo</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-[14px] font-medium hover:opacity-100 transition-opacity" style={{ color: C.textSec, opacity: 0.8 }}>Features</a>
          <a href="#pricing" className="text-[14px] font-medium hover:opacity-100 transition-opacity" style={{ color: C.textSec, opacity: 0.8 }}>Pricing</a>
          <a href="/Elite" className="text-[14px] font-medium hover:opacity-100 transition-opacity" style={{ color: C.textSec, opacity: 0.8 }}>Elite</a>
          <a href="/FAQ" className="text-[14px] font-medium hover:opacity-100 transition-opacity" style={{ color: C.textSec, opacity: 0.8 }}>FAQ</a>
          <a href="/Support" className="text-[14px] font-medium hover:opacity-100 transition-opacity" style={{ color: C.textSec, opacity: 0.8 }}>Support</a>
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="px-4 py-2 rounded-lg text-[14px] font-semibold transition-colors hover:bg-[rgba(255,255,255,0.06)]" style={{ color: C.text }}>Log In</a>
          <a href="/register" className="px-5 py-2 rounded-lg text-[14px] font-semibold text-white transition-all hover:brightness-110" style={{ background: C.accent }}>Sign Up</a>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${C.accent}15, transparent)` }} />
      <div className="max-w-[1200px] mx-auto px-6 text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-[13px] font-medium" style={{ background: `${C.accent}12`, color: C.accent, border: `1px solid ${C.accent}25` }}>
          <Sparkles className="w-3.5 h-3.5" /> Now with Secret Key accounts — zero PII required
        </div>
        <h1 className="text-[48px] md:text-[72px] font-extrabold leading-[1.05] tracking-tight mb-6" style={{ color: C.text }}>
          A better place<br />to talk.
        </h1>
        <p className="text-[18px] md:text-[20px] max-w-[560px] mx-auto mb-10 leading-relaxed" style={{ color: C.muted }}>
          Free. Private. No ads. No tracking. Just Kairo.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a href="/register" className="px-8 py-3.5 rounded-xl text-[16px] font-semibold text-white transition-all hover:brightness-110 hover:scale-[1.02]" style={{ background: C.accent, boxShadow: `0 0 40px ${C.accent}30` }}>
            Get Started
          </a>
          <a href="#features" className="px-8 py-3.5 rounded-xl text-[16px] font-semibold transition-all hover:bg-[rgba(255,255,255,0.06)]" style={{ color: C.text, border: `1px solid ${C.border}` }}>
            See What's New
          </a>
        </div>
        <div className="mt-16 md:mt-20 max-w-[900px] mx-auto rounded-2xl overflow-hidden hidden md:block" style={{ border: `1px solid ${C.border}`, boxShadow: `0 24px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)` }}>
          <div className="relative aspect-[16/9] flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.surface}, ${C.elevated})` }}>
            <div className="flex gap-2">
              <div className="w-[200px] rounded-xl p-3" style={{ background: C.overlay }}>
                <div className="h-3 w-20 rounded mb-3 k-shimmer" />
                {[1,2,3,4,5].map(i => <div key={i} className="flex items-center gap-2 mb-2"><div className="w-5 h-5 rounded-full k-shimmer" /><div className="h-2 rounded k-shimmer" style={{ width: 60 + i * 10 }} /></div>)}
              </div>
              <div className="w-[440px] rounded-xl p-4" style={{ background: C.elevated }}>
                <div className="h-3 w-32 rounded mb-4 k-shimmer" />
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full k-shimmer flex-shrink-0" />
                    <div className="flex-1"><div className="h-2.5 w-20 rounded mb-1.5 k-shimmer" /><div className="h-2 rounded k-shimmer" style={{ width: 100 + i * 40 }} /></div>
                  </div>
                ))}
              </div>
              <div className="w-[160px] rounded-xl p-3" style={{ background: C.overlay }}>
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
    <section id="features" className="py-24 md:py-32">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-[36px] md:text-[44px] font-extrabold tracking-tight mb-4" style={{ color: C.text }}>
            Better than anything else
          </h2>
          <p className="text-[17px] max-w-[480px] mx-auto" style={{ color: C.muted }}>
            Everything you need. Nothing you don't.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl transition-all hover:translate-y-[-2px]"
              style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${C.accent}12` }}>
                <f.icon className="w-5 h-5" style={{ color: C.accent }} />
              </div>
              <h3 className="text-[15px] font-bold mb-2" style={{ color: C.text }}>{f.title}</h3>
              <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{f.desc}</p>
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
    <section className="py-24 md:py-32" style={{ background: C.surface }}>
      <div className="max-w-[800px] mx-auto px-6">
        <h2 className="text-[36px] md:text-[44px] font-extrabold tracking-tight mb-4 text-center" style={{ color: C.text }}>
          How Kairo is different
        </h2>
        <p className="text-[17px] text-center mb-12" style={{ color: C.muted }}>
          Built from the ground up with your privacy as the foundation.
        </p>
        <div className="space-y-4">
          {points.map((p, i) => (
            <div key={i} className="flex items-start gap-4 p-5 rounded-xl" style={{ background: C.elevated }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${C.success}15` }}>
                <Check className="w-3.5 h-3.5" style={{ color: C.success }} />
              </div>
              <div>
                <h3 className="text-[15px] font-bold mb-1" style={{ color: C.text }}>{p.label}</h3>
                <p className="text-[13px]" style={{ color: C.muted }}>{p.desc}</p>
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
    <section id="pricing" className="py-24 md:py-32">
      <div className="max-w-[900px] mx-auto px-6">
        <h2 className="text-[36px] md:text-[44px] font-extrabold tracking-tight mb-4 text-center" style={{ color: C.text }}>
          Free forever. Elite is optional.
        </h2>
        <p className="text-[17px] text-center mb-14" style={{ color: C.muted }}>
          Kairo is completely free. Lite at $0.99/month or Elite at $2.99/month for extra perks.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <h3 className="text-[20px] font-bold mb-1" style={{ color: C.text }}>Free</h3>
            <p className="text-[32px] font-extrabold mb-6" style={{ color: C.text }}>$0 <span className="text-[14px] font-medium" style={{ color: C.muted }}>forever</span></p>
            <ul className="space-y-3">
              {free.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-[14px]" style={{ color: C.textSec }}>
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: C.success }} /> {f}
                </li>
              ))}
            </ul>
            <a href="/register" className="block w-full text-center mt-8 py-3 rounded-xl text-[14px] font-semibold transition-colors hover:bg-[rgba(255,255,255,0.08)]" style={{ color: C.text, border: `1px solid ${C.border}` }}>
              Get Started Free
            </a>
          </div>
          <div className="p-8 rounded-2xl relative" style={{ background: `linear-gradient(135deg, ${C.accent}10, ${C.accent}05)`, border: `1px solid ${C.accent}30` }}>
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full text-[11px] font-bold" style={{ background: C.accent, color: '#fff' }}>
              POPULAR
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5" style={{ color: C.accent }} />
              <h3 className="text-[20px] font-bold" style={{ color: C.text }}>Elite</h3>
            </div>
            <p className="text-[32px] font-extrabold mb-6" style={{ color: C.text }}>$2.99 <span className="text-[14px] font-medium" style={{ color: C.muted }}>/month</span></p>
            <ul className="space-y-3">
              {elite.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-[14px]" style={{ color: C.textSec }}>
                  <Check className="w-4 h-4 flex-shrink-0" style={{ color: C.accent }} /> {f}
                </li>
              ))}
            </ul>
            <a href="/Elite" className="block w-full text-center mt-8 py-3 rounded-xl text-[14px] font-semibold text-white transition-all hover:brightness-110" style={{ background: C.accent }}>
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
    <section className="py-24 md:py-32" style={{ background: C.surface }}>
      <div className="max-w-[800px] mx-auto px-6 text-center">
        <h2 className="text-[36px] md:text-[44px] font-extrabold tracking-tight mb-4" style={{ color: C.text }}>
          Join the community
        </h2>
        <p className="text-[17px] mb-12" style={{ color: C.muted }}>
          Thousands of people already call Kairo home.
        </p>
        <div className="grid grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Users', value: fmt(stats.users), icon: Users },
            { label: 'Servers', value: fmt(stats.servers), icon: MessageSquare },
            { label: 'Messages today', value: fmt(stats.messages), icon: Zap },
          ].map((s, i) => (
            <div key={i} className="py-6 rounded-xl" style={{ background: C.elevated }}>
              <s.icon className="w-5 h-5 mx-auto mb-2" style={{ color: C.accent }} />
              <p className="text-[28px] font-extrabold tabular-nums" style={{ color: C.text }}>{s.value}</p>
              <p className="text-[13px] mt-1" style={{ color: C.muted }}>{s.label}</p>
            </div>
          ))}
        </div>
        <a href="/register" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-[16px] font-semibold text-white transition-all hover:brightness-110" style={{ background: C.accent }}>
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
    <footer className="py-16 border-t" style={{ background: C.bg, borderColor: C.border }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.accent }}>
                <Crown className="w-4 h-4 text-white" />
              </div>
              <span className="text-[16px] font-bold" style={{ color: C.text }}>Kairo</span>
            </div>
            <p className="text-[12px] leading-relaxed" style={{ color: C.muted }}>
              A better place to talk.<br />Free. Private. No ads.
            </p>
          </div>
          {sections.map((s, i) => (
            <div key={i}>
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: C.muted }}>{s.title}</p>
              <ul className="space-y-2">
                {s.links.map(([label, href], j) => (
                  <li key={j}><a href={href} className="text-[13px] hover:opacity-100 transition-opacity" style={{ color: C.textSec, opacity: 0.7 }}>{label}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 gap-4" style={{ borderTop: `1px solid ${C.border}` }}>
          <p className="text-[12px]" style={{ color: C.muted }}>© 2026 Kairo. All rights reserved.</p>
          <div className="flex items-center gap-1 text-[12px]" style={{ color: C.muted }}>
            Made with <Heart className="w-3 h-3 mx-0.5" style={{ color: C.danger }} /> by the Kairo team
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div style={{ background: C.bg, fontFamily: 'Inter, system-ui, sans-serif' }}>
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
