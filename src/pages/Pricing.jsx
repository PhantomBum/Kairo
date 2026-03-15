import React, { useState } from 'react';
import { Crown, Check, Minus, ChevronDown, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageShell from '@/components/app/shared/PageShell';

const C = {
  bg: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  accent: '#2dd4bf', text: '#e8edf5', textSec: '#9aaabb', muted: '#5d7a8a',
  border: '#33333d', success: '#3ba55d',
};

const FEATURES = [
  { name: 'Unlimited messages', free: true, lite: true, elite: true },
  { name: 'Voice & video calls', free: true, lite: true, elite: true },
  { name: 'Screen sharing', free: true, lite: true, elite: true },
  { name: 'Custom server emoji', free: true, lite: true, elite: true },
  { name: 'Ghost Mode', free: true, lite: true, elite: true },
  { name: 'Secret Key accounts', free: true, lite: true, elite: true },
  { name: 'Secret Chats (E2E encrypted)', free: true, lite: true, elite: true },
  { name: 'File uploads', free: '150MB', lite: '200MB', elite: '500MB' },
  { name: 'Message length', free: '2,000 chars', lite: '2,500 chars', elite: '4,000 chars' },
  { name: 'Voice quality', free: '160kbps', lite: '192kbps', elite: '320kbps' },
  { name: 'Video quality', free: '720p', lite: '720p', elite: '1080p HD' },
  { name: 'Group call size', free: '15 people', lite: '20 people', elite: '25 people' },
  { name: 'Server limit', free: '100', lite: '100', elite: '200' },
  { name: 'Profile effects', free: '10 effects', lite: '11 effects', elite: '16 effects' },
  { name: 'Community themes', free: '5', lite: '5', elite: 'Unlimited' },
  { name: 'GIF avatar', free: true, lite: true, elite: true },
  { name: 'Animated GIF banner', free: false, lite: false, elite: true },
  { name: 'Custom chat backgrounds', free: false, lite: false, elite: true },
  { name: 'Read receipts', free: false, lite: false, elite: true },
  { name: 'Message scheduling', free: false, lite: false, elite: true },
  { name: 'Vanity profile URL', free: false, lite: false, elite: true },
  { name: 'Global emoji & stickers', free: false, lite: false, elite: true },
  { name: 'Elite badge', free: false, lite: false, elite: true },
  { name: '500 monthly credits', free: false, lite: false, elite: true },
  { name: 'Priority support', free: false, lite: false, elite: true },
];

const BILLING_FAQ = [
  { q: 'Can I cancel anytime?', a: 'Yes, cancel anytime. Your Elite benefits remain until the end of your billing period. No cancellation fees.' },
  { q: 'What payment methods do you accept?', a: 'All major credit and debit cards through Stripe.' },
  { q: 'Do I need Elite to use Kairo?', a: 'Absolutely not. Free Kairo is genuinely great. Elite is for people who want extra perks or want to support the project.' },
  { q: 'Can I get a refund?', a: 'Contact support with your billing details. We handle refunds on a case-by-case basis and try to be fair.' },
  { q: 'Do you offer yearly billing?', a: 'Yearly billing is on our roadmap and will come with a discount when it launches.' },
  { q: 'Is Elite a paywall?', a: 'No. Elite is optional and exists to support the project. We also give out Elite for free regularly.' },
];

function BillingFAQ() {
  const [open, setOpen] = useState(null);

  return (
    <div className="space-y-2">
      {BILLING_FAQ.map((item, i) => (
        <div key={i} className="rounded-xl overflow-hidden" style={{ background: C.elevated, border: `1px solid ${C.border}` }}>
          <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
            <span className="text-[14px] font-medium" style={{ color: C.text }}>{item.q}</span>
            <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform" style={{ color: C.muted, transform: open === i ? 'rotate(180deg)' : 'none' }} />
          </button>
          {open === i && (
            <div className="px-4 pb-4">
              <p className="text-[13px] leading-relaxed" style={{ color: C.textSec }}>{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Pricing() {
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (type = 'elite_subscription') => {
    setSubscribing(true);
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) { window.location.href = '/register'; return; }
      if (window.self !== window.top) { alert('Checkout works only from a published app.'); setSubscribing(false); return; }
      const res = await base44.functions?.invoke?.('stripeCheckout', { type });
      if (res?.data?.url) window.location.href = res.data.url;
    } catch (err) {
      console.error('Checkout error:', err);
    }
    setSubscribing(false);
  };

  return (
    <PageShell title="Pricing">
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-[40px] md:text-[52px] font-extrabold tracking-tight mb-4" style={{ color: C.text }}>
            Simple pricing
          </h1>
          <p className="text-[18px] max-w-[500px] mx-auto" style={{ color: C.muted }}>
            Kairo is free forever. Lite at $0.99/month or Elite at $2.99/month for extra perks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="p-8 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <h3 className="text-[22px] font-bold mb-1" style={{ color: C.text }}>Free</h3>
            <p className="text-[14px] mb-4" style={{ color: C.muted }}>Everything you need — genuinely great</p>
            <p className="text-[40px] font-extrabold mb-6" style={{ color: C.text }}>$0 <span className="text-[14px] font-medium" style={{ color: C.muted }}>forever</span></p>
            <a href="/register" className="block w-full text-center py-3.5 rounded-xl text-[14px] font-semibold transition-colors hover:bg-[rgba(255,255,255,0.08)]"
              style={{ color: C.text, border: `1px solid ${C.border}` }}>
              Get Started Free
            </a>
          </div>

          <div className="p-8 rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <h3 className="text-[22px] font-bold mb-1" style={{ color: C.text }}>Lite</h3>
            <p className="text-[14px] mb-4" style={{ color: C.muted }}>A bit more — 200MB uploads, 192kbps voice</p>
            <p className="text-[40px] font-extrabold mb-6" style={{ color: C.text }}>$0.99 <span className="text-[14px] font-medium" style={{ color: C.muted }}>/month</span></p>
            <button onClick={() => handleSubscribe('lite_subscription')} disabled={subscribing}
              className="w-full py-3.5 rounded-xl text-[14px] font-semibold transition-colors hover:bg-[rgba(255,255,255,0.08)] disabled:opacity-50"
              style={{ color: C.text, border: `1px solid ${C.accent}` }}>
              {subscribing ? 'Redirecting...' : 'Subscribe to Lite'}
            </button>
          </div>

          <div className="p-8 rounded-2xl relative" style={{ background: `linear-gradient(135deg, ${C.accent}08, ${C.accent}03)`, border: `1px solid ${C.accent}30` }}>
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full text-[11px] font-bold" style={{ background: C.accent, color: '#fff' }}>
              POPULAR
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5" style={{ color: C.accent }} />
              <h3 className="text-[22px] font-bold" style={{ color: C.text }}>Elite</h3>
            </div>
            <p className="text-[14px] mb-4" style={{ color: C.muted }}>Premium perks + support the project</p>
            <p className="text-[40px] font-extrabold mb-6" style={{ color: C.text }}>$2.99 <span className="text-[14px] font-medium" style={{ color: C.muted }}>/month</span></p>
            <button onClick={handleSubscribe} disabled={subscribing}
              className="w-full py-3.5 rounded-xl text-[14px] font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: C.accent }}>
              {subscribing ? 'Redirecting...' : 'Subscribe to Elite'}
            </button>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-[24px] font-extrabold text-center mb-8" style={{ color: C.text }}>Feature Comparison</h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
            <div className="grid grid-cols-[1fr_100px_100px_100px] p-4" style={{ background: C.elevated, borderBottom: `1px solid ${C.border}` }}>
              <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: C.muted }}>Feature</span>
              <span className="text-[12px] font-bold uppercase tracking-wider text-center" style={{ color: C.muted }}>Free</span>
              <span className="text-[12px] font-bold uppercase tracking-wider text-center" style={{ color: C.muted }}>Lite</span>
              <span className="text-[12px] font-bold uppercase tracking-wider text-center" style={{ color: C.accent }}>Elite</span>
            </div>
            {FEATURES.map((f, i) => (
              <div key={i} className="grid grid-cols-[1fr_100px_100px_100px] p-3.5 items-center"
                style={{ borderBottom: i < FEATURES.length - 1 ? `1px solid ${C.border}` : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                <span className="text-[13px]" style={{ color: C.text }}>{f.name}</span>
                <div className="text-center">
                  {f.free === true ? <Check className="w-4 h-4 mx-auto" style={{ color: C.success }} />
                    : f.free === false ? <Minus className="w-4 h-4 mx-auto" style={{ color: C.muted }} />
                    : <span className="text-[12px]" style={{ color: C.textSec }}>{f.free}</span>}
                </div>
                <div className="text-center">
                  {f.lite === true ? <Check className="w-4 h-4 mx-auto" style={{ color: C.success }} />
                    : f.lite === false ? <Minus className="w-4 h-4 mx-auto" style={{ color: C.muted }} />
                    : <span className="text-[12px]" style={{ color: C.textSec }}>{f.lite}</span>}
                </div>
                <div className="text-center">
                  {f.elite === true ? <Check className="w-4 h-4 mx-auto" style={{ color: C.accent }} />
                    : <span className="text-[12px] font-medium" style={{ color: C.accent }}>{f.elite}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-[680px] mx-auto">
          <h2 className="text-[24px] font-extrabold text-center mb-6" style={{ color: C.text }}>Billing FAQ</h2>
          <BillingFAQ />
        </div>
      </div>
    </PageShell>
  );
}
