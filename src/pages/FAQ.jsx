import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ChevronDown, MessageCircle, Crown, Shield, Users, Cpu, CreditCard, HelpCircle } from 'lucide-react';
import PageShell from '@/components/app/shared/PageShell';

const C = {
  bg: '#18181c', surface: '#1e1e23', elevated: '#26262d', overlay: '#2e2e37',
  accent: '#2dd4bf', text: '#e8edf5', textSec: '#9aaabb', muted: '#5d7a8a',
  border: '#33333d', success: '#3ba55d',
};

const FAQ_DATA = [
  { cat: 'General', icon: HelpCircle, items: [
    { q: 'What is Kairo?', a: 'Kairo is a free, private communication platform. Think of it like Discord, but built from the ground up with your privacy as the foundation. No ads, no tracking, no data selling.' },
    { q: 'Is Kairo really free?', a: 'Yes, completely. Kairo is free forever. Paid options are Lite at $0.99/month and Elite at $2.99/month — both entirely optional and exist to support the project, not as a paywall.' },
    { q: 'How is Kairo different from Discord?', a: 'Kairo is private by default. You can sign up without an email using a Secret Key. We have Ghost Mode, encrypted secret chats, and we never collect, sell, or monetize your data.' },
    { q: 'Who made Kairo?', a: 'Kairo is built by a single developer. It\'s an independent project, not a corporation. That\'s why it stays true to its values.' },
  ]},
  { cat: 'Account', icon: Shield, items: [
    { q: 'How do I create an account?', a: 'Visit kairo.app and click Sign Up. You can register with email, Google, or a Secret Key (no personal info needed).' },
    { q: 'What is a Secret Key account?', a: 'A Secret Key account requires zero personal information — no email, no phone number. A cryptographic key is generated for you. It\'s the most private way to use Kairo.' },
    { q: 'What if I lose my Secret Key?', a: 'If you lose your Secret Key, your account is gone forever. There is no recovery, no password reset, nothing. That\'s the tradeoff for maximum privacy.' },
    { q: 'How do I change my username or avatar?', a: 'Go to Settings > Profile. You can update your display name, username, avatar, banner, bio, and pronouns anytime.' },
    { q: 'How do I delete my account?', a: 'Go to Settings > Account and scroll to the bottom. Click "Delete Account" and confirm. This is permanent and cannot be undone.' },
  ]},
  { cat: 'Elite', icon: Crown, items: [
    { q: 'What does Kairo Elite include?', a: 'Animated avatars & banners, 500MB file uploads, 4000-character messages, HD 1080p video, 25-person group calls, custom chat backgrounds, read receipts, message scheduling, vanity profile URLs, and more.' },
    { q: 'How much does Elite cost?', a: 'Kairo Elite is $2.99/month. Lite is $0.99/month. We also give out Elite for free regularly — the goal was never to make money.' },
    { q: 'How do I cancel Elite?', a: 'Visit the Elite page or Settings > Subscription. Click "Cancel Subscription." Your benefits remain until the end of the billing period.' },
    { q: 'Do I need Elite to use Kairo?', a: 'Absolutely not. Free Kairo is genuinely great and always will be. Elite is for people who want extra perks or want to support the project.' },
  ]},
  { cat: 'Servers', icon: Users, items: [
    { q: 'How do I create a server?', a: 'Click the "+" button in the server rail on the left side. Choose a template or start from scratch, name your server, and invite friends.' },
    { q: 'How many servers can I join?', a: 'You can join up to 100 servers on the free plan, or 200 with Elite.' },
    { q: 'How do roles and permissions work?', a: 'Go to Server Settings > Roles. Create roles with custom colors and permissions. Drag to reorder the hierarchy. Higher roles override lower ones.' },
    { q: 'How do I invite people to my server?', a: 'Click the invite button in your server. You\'ll get a unique link you can share. You can set it to expire or limit uses.' },
  ]},
  { cat: 'Privacy', icon: Shield, items: [
    { q: 'Does Kairo sell my data?', a: 'No. Never. We don\'t sell, share, or monetize your data in any way. That\'s a core promise.' },
    { q: 'What is Ghost Mode?', a: 'Ghost Mode makes you completely invisible. No one can see you\'re online. You can browse, read messages, and listen to voice channels without anyone knowing.' },
    { q: 'What are Secret Chats?', a: 'Secret Chats use end-to-end encryption. Messages are never stored on our servers and disappear when the session ends.' },
    { q: 'How do I block someone?', a: 'Right-click their name and select Block User. They won\'t be able to DM you, see your status, or interact with you.' },
  ]},
  { cat: 'Technical', icon: Cpu, items: [
    { q: 'What browsers does Kairo support?', a: 'Kairo works in all modern browsers: Chrome, Firefox, Safari, Edge. For the best experience, use the latest version of Chrome or Edge.' },
    { q: 'Can I install Kairo as an app?', a: 'Yes! Kairo is a PWA (Progressive Web App). In Chrome, click the install icon in the address bar to add it to your device.' },
    { q: 'Why can\'t others hear me in voice?', a: 'Check your browser microphone permissions, make sure you\'re not muted (Ctrl+Shift+M), and verify the correct input device in Settings > Voice & Video.' },
    { q: 'How do I report a bug?', a: 'Visit the Support page and use the Bug Report tab. Include steps to reproduce the issue and we\'ll look into it.' },
  ]},
];

function Accordion({ item, isOpen, onToggle }) {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen]);

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: isOpen ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isOpen ? C.accent + '30' : C.border}` }}>
      <button onClick={onToggle} className="w-full flex items-center justify-between p-4 text-left group">
        <span className="text-[14px] font-medium pr-4" style={{ color: C.text }}>{item.q}</span>
        <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform" style={{ color: C.muted, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      <div style={{ height, overflow: 'hidden', transition: 'height 200ms ease' }}>
        <div ref={contentRef} className="px-4 pb-4">
          <p className="text-[13px] leading-relaxed" style={{ color: C.textSec }}>{item.a}</p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState(null);
  const [openId, setOpenId] = useState(null);

  const filtered = useMemo(() => {
    const s = search.toLowerCase().trim();
    return FAQ_DATA.map(cat => ({
      ...cat,
      items: cat.items.filter(i => {
        const matchSearch = !s || i.q.toLowerCase().includes(s) || i.a.toLowerCase().includes(s);
        const matchCat = !activeCat || cat.cat === activeCat;
        return matchSearch && matchCat;
      })
    })).filter(cat => cat.items.length > 0);
  }, [search, activeCat]);

  return (
    <PageShell title="FAQ">
      <div className="max-w-[720px] mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-[36px] md:text-[44px] font-extrabold tracking-tight mb-3" style={{ color: C.text }}>
            Frequently Asked Questions
          </h1>
          <p className="text-[16px]" style={{ color: C.muted }}>Find answers to common questions about Kairo</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: C.muted }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions..."
            className="w-full pl-11 pr-4 py-3.5 rounded-xl text-[14px] outline-none transition-colors focus:ring-2" autoFocus
            style={{ background: C.elevated, color: C.text, border: `1px solid ${C.border}`, '--tw-ring-color': C.accent }} />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setActiveCat(null)} className="px-3.5 py-2 rounded-lg text-[12px] font-semibold transition-colors"
            style={{ background: !activeCat ? C.accent : C.elevated, color: !activeCat ? '#fff' : C.muted }}>All</button>
          {FAQ_DATA.map(c => (
            <button key={c.cat} onClick={() => setActiveCat(activeCat === c.cat ? null : c.cat)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-semibold transition-colors"
              style={{ background: activeCat === c.cat ? C.accent : C.elevated, color: activeCat === c.cat ? '#fff' : C.muted }}>
              <c.icon className="w-3.5 h-3.5" /> {c.cat}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {filtered.map(cat => (
            <div key={cat.cat}>
              <div className="flex items-center gap-2 mb-3">
                <cat.icon className="w-4 h-4" style={{ color: C.accent }} />
                <h3 className="text-[12px] font-bold uppercase tracking-wider" style={{ color: C.muted }}>{cat.cat}</h3>
              </div>
              <div className="space-y-2">
                {cat.items.map((item, i) => {
                  const id = `${cat.cat}-${i}`;
                  return <Accordion key={id} item={item} isOpen={openId === id} onToggle={() => setOpenId(openId === id ? null : id)} />;
                })}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[15px] mb-2" style={{ color: C.muted }}>No results found</p>
              <p className="text-[13px]" style={{ color: C.muted }}>Try a different search term</p>
            </div>
          )}
        </div>

        <div className="text-center mt-12 py-8 rounded-2xl" style={{ background: C.elevated, border: `1px solid ${C.border}` }}>
          <MessageCircle className="w-6 h-6 mx-auto mb-3" style={{ color: C.accent }} />
          <p className="text-[15px] font-bold mb-1" style={{ color: C.text }}>Can't find your answer?</p>
          <a href="/Support" className="text-[14px] font-semibold hover:underline" style={{ color: C.accent }}>Contact Support</a>
        </div>
      </div>
    </PageShell>
  );
}
