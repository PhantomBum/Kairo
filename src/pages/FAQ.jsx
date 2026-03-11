import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageShell from '@/components/app/shared/PageShell';

const FAQ_DATA = [
  { cat: 'Getting Started', items: [
    { id: 'gs1', q: 'How do I create an account?', a: 'Click "Get Started" on the homepage or visit the app and you\'ll be prompted to sign up with your email. It only takes a few seconds.' },
    { id: 'gs2', q: 'How do I create a server?', a: 'Click the "+" button in the server rail on the left side, choose a template or start from scratch, name your server, and you\'re good to go.' },
    { id: 'gs3', q: 'How do I invite friends?', a: 'Open your server settings, click "Invite People", and share the unique invite code or link with your friends.' },
    { id: 'gs4', q: 'How do I change my display name and avatar?', a: 'Go to Settings > Profile. You can change your display name, upload an avatar, set a banner, write a bio, and add pronouns.' },
  ]},
  { cat: 'Servers', items: [
    { id: 'sv1', q: 'How many servers can I join?', a: 'You can join up to 100 servers. Elite members can join up to 200.' },
    { id: 'sv2', q: 'How do I set up roles?', a: 'Go to Server Settings > Roles. Create roles, assign colors, set permissions, and drag to reorder hierarchy.' },
    { id: 'sv3', q: 'Can I transfer server ownership?', a: 'Currently, server ownership cannot be transferred. The original creator remains the owner.' },
    { id: 'sv4', q: 'How do channel categories work?', a: 'Categories group channels together. Right-click a category to add channels, rename it, or collapse/expand it.' },
  ]},
  { cat: 'Voice & Video', items: [
    { id: 'vv1', q: 'Why can\'t others hear me?', a: 'Check your microphone permissions in browser settings, make sure you\'re not muted (Ctrl+Shift+M), and check input device in Voice settings.' },
    { id: 'vv2', q: 'How do I share my screen?', a: 'Join a voice channel, then click the screen share button. You can share your entire screen or a specific window.' },
    { id: 'vv3', q: 'What is Stage mode?', a: 'Stage channels are for presentations — speakers talk while the audience listens. Great for events, Q&As, and performances.' },
  ]},
  { cat: 'Elite', items: [
    { id: 'el1', q: 'What does Kairo Elite include?', a: 'Animated avatars, 100MB uploads, exclusive badges, HD voice/video, 500 monthly credits, extended message limits, custom backgrounds, and more.' },
    { id: 'el2', q: 'How much does Elite cost?', a: 'Kairo Elite is $9.99/month. You can manage your subscription from the Elite page.' },
    { id: 'el3', q: 'How do I cancel Elite?', a: 'Visit the Elite subscription page and click "Cancel Subscription". Your benefits remain active until the end of the billing period.' },
  ]},
  { cat: 'Bots', items: [
    { id: 'bt1', q: 'How do I create a bot?', a: 'Visit the Developer Portal at /developers. Create a new bot, configure its commands using the visual builder, and deploy it to your servers.' },
    { id: 'bt2', q: 'How do I add a bot to my server?', a: 'Browse the Bot Marketplace at /bots, find a bot you like, and click "Add to Server" to install it.' },
    { id: 'bt3', q: 'Can I publish my bot?', a: 'Yes! Once your bot is ready, submit it to the marketplace from the developer portal. Popular bots can earn a verified badge.' },
  ]},
  { cat: 'Privacy & Security', items: [
    { id: 'ps1', q: 'How do I block someone?', a: 'Right-click their name and select "Block User". They won\'t be able to DM you or see your online status.' },
    { id: 'ps2', q: 'Can I make my profile private?', a: 'Go to Settings > Privacy. You can control who can DM you, send friend requests, and see your activity.' },
    { id: 'ps3', q: 'Is my data encrypted?', a: 'All data is transmitted over encrypted connections (TLS). Your messages are stored securely on our servers.' },
  ]},
  { cat: 'Billing', items: [
    { id: 'bl1', q: 'What payment methods are accepted?', a: 'We accept all major credit/debit cards through Stripe. More payment methods coming soon.' },
    { id: 'bl2', q: 'How do I get a refund?', a: 'Contact support through the Support page with your billing details and reason for the refund request.' },
    { id: 'bl3', q: 'What are credits?', a: 'Credits are Kairo\'s virtual currency used in the shop to purchase profile decorations, nameplates, sticker packs, and more.' },
  ]},
];

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  const [rated, setRated] = useState(null);

  const handleRate = async (helpful) => {
    setRated(helpful);
    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) {
      const user = await base44.auth.me();
      base44.entities.FAQRating.create({ question_id: item.id, user_id: user.id, helpful });
    }
  };

  return (
    <div className="rounded-xl transition-all" style={{ background: open ? 'var(--bg-glass-active, rgba(255,255,255,0.07))' : 'var(--bg-glass, rgba(255,255,255,0.03))', border: '1px solid var(--border, rgba(255,255,255,0.04))' }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left">
        <span className="text-sm font-medium pr-4" style={{ color: 'var(--text-cream, #e8e4d9)' }}>{item.q}</span>
        {open ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} /> : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />}
      </button>
      {open && (
        <div className="px-4 pb-4">
          <p className="text-[13px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary, #8a8778)' }}>{item.a}</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Was this helpful?</span>
            <button onClick={() => handleRate(true)} className={`p-1 rounded-md transition-colors ${rated === true ? 'bg-[rgba(123,201,164,0.15)]' : 'hover:bg-[rgba(255,255,255,0.05)]'}`}>
              <ThumbsUp className="w-3 h-3" style={{ color: rated === true ? 'var(--accent-green)' : 'var(--text-muted)' }} />
            </button>
            <button onClick={() => handleRate(false)} className={`p-1 rounded-md transition-colors ${rated === false ? 'bg-[rgba(201,123,123,0.15)]' : 'hover:bg-[rgba(255,255,255,0.05)]'}`}>
              <ThumbsDown className="w-3 h-3" style={{ color: rated === false ? 'var(--accent-red)' : 'var(--text-muted)' }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState(null);

  const filtered = useMemo(() => {
    if (!search.trim() && !activeCat) return FAQ_DATA;
    return FAQ_DATA.map(cat => ({
      ...cat,
      items: cat.items.filter(i => {
        const matchSearch = !search.trim() || i.q.toLowerCase().includes(search.toLowerCase()) || i.a.toLowerCase().includes(search.toLowerCase());
        const matchCat = !activeCat || cat.cat === activeCat;
        return matchSearch && matchCat;
      })
    })).filter(cat => cat.items.length > 0);
  }, [search, activeCat]);

  return (
    <PageShell title="FAQ">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Frequently Asked Questions</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Find answers to common questions about Kairo</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none" style={{ background: 'var(--bg-glass)', color: 'var(--text-primary)', border: '1px solid var(--border)' }} />
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setActiveCat(null)} className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors"
            style={{ background: !activeCat ? 'var(--text-cream)' : 'var(--bg-glass)', color: !activeCat ? 'var(--bg-deep)' : 'var(--text-secondary)', border: '1px solid var(--border)' }}>All</button>
          {FAQ_DATA.map(c => (
            <button key={c.cat} onClick={() => setActiveCat(c.cat === activeCat ? null : c.cat)} className="px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors"
              style={{ background: activeCat === c.cat ? 'var(--text-cream)' : 'var(--bg-glass)', color: activeCat === c.cat ? 'var(--bg-deep)' : 'var(--text-secondary)', border: '1px solid var(--border)' }}>{c.cat}</button>
          ))}
        </div>

        <div className="space-y-8">
          {filtered.map(cat => (
            <div key={cat.cat}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{cat.cat}</h3>
              <div className="space-y-2">
                {cat.items.map(item => <FAQItem key={item.id} item={item} />)}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No results found. Try a different search term.</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}