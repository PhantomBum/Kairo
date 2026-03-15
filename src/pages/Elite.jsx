import React, { useState, useEffect } from 'react';
import { Crown, Check, X, Sparkles, Palette, Upload, Shield, Zap, Star, Volume2, Gift, Users, MessageSquare, Image, Globe, Clock, Eye, Bookmark } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageShell from '@/components/app/shared/PageShell';

const C = {
  bg: '#18181c', surface: '#1e1e23', elevated: '#26262d', overlay: '#2e2e37',
  accent: '#2dd4bf', text: '#e8edf5', textSec: '#9aaabb', muted: '#5d7a8a',
  border: '#33333d', success: '#3ba55d', danger: '#ed4245',
};

const FEATURES = [
  { icon: Sparkles, title: 'Animated Avatar & Banner', desc: 'Upload GIFs that bring your profile to life. Stand out in every conversation.' },
  { icon: Palette, title: 'Custom Chat Backgrounds', desc: 'Personalize your chat with beautiful backgrounds. Choose from our gallery or upload your own.' },
  { icon: Upload, title: '500MB File Uploads', desc: 'Share large files, high-res images, and long videos without compression.' },
  { icon: MessageSquare, title: '4,000 Character Messages', desc: 'Write longer messages without hitting the limit. Perfect for discussions and documentation.' },
  { icon: Volume2, title: 'HD 1080p Video', desc: 'Crystal clear video calls at full HD resolution. See every detail.' },
  { icon: Users, title: '25-Person Group Calls', desc: 'Bigger group calls for larger friend groups and team meetings.' },
  { icon: Star, title: '16 Profile Effects', desc: 'Exclusive animated effects for your profile. Sparkles, fire, neon glow, and more.' },
  { icon: Eye, title: 'Read Receipts', desc: 'Know when your messages have been read. Blue checkmarks appear on seen messages.' },
  { icon: Clock, title: 'Message Scheduling', desc: 'Schedule messages to send later. Perfect for reminders and announcements.' },
  { icon: Globe, title: 'Vanity Profile URL', desc: 'Claim your unique kairo.app/username URL. Share your profile with style.' },
  { icon: Gift, title: '500 Monthly Credits', desc: 'Receive 500 credits every month to spend in the shop on decorations and collectibles.' },
  { icon: Shield, title: 'Elite Badge', desc: 'A distinguished badge on your profile showing your support for Kairo.' },
  { icon: Bookmark, title: 'Global Emoji & Stickers', desc: 'Use custom emoji and sticker packs from any server, anywhere on Kairo.' },
  { icon: Zap, title: 'Priority Support', desc: 'Get faster responses from the support team when you need help.' },
];

const COMPARISON = [
  { name: 'File uploads', free: '150MB', lite: '200MB', elite: '500MB' },
  { name: 'Message length', free: '2,000 chars', lite: '2,500 chars', elite: '4,000 chars' },
  { name: 'Voice quality', free: '160kbps', lite: '192kbps', elite: '320kbps' },
  { name: 'Video quality', free: '720p', lite: '720p', elite: '1080p HD' },
  { name: 'Group call size', free: '15', lite: '20', elite: '25' },
  { name: 'Server limit', free: '100', lite: '100', elite: '200' },
  { name: 'Profile effects', free: '10', lite: '11', elite: '16' },
  { name: 'Community themes', free: '5', lite: '5', elite: 'Unlimited' },
  { name: 'GIF avatar', free: true, lite: true, elite: true },
  { name: 'Animated GIF banner', free: false, lite: false, elite: true },
  { name: 'Chat backgrounds', free: false, lite: false, elite: true },
  { name: 'Read receipts', free: false, lite: false, elite: true },
  { name: 'Message scheduling', free: false, lite: false, elite: true },
  { name: 'Vanity URL', free: false, lite: false, elite: true },
  { name: 'Monthly credits', free: '0', lite: '0', elite: '500' },
  { name: 'Elite badge', free: false, lite: false, elite: true },
  { name: 'Priority support', free: false, lite: false, elite: true },
];

export default function Elite() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [hasElite, setHasElite] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    (async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) return;
      const me = await base44.auth.me();
      setUser(me);
      try {
        const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
        if (profiles[0]) { setProfile(profiles[0]); setHasElite(profiles[0].badges?.includes('premium') || false); }
      } catch {}
    })();
  }, []);

  const handleSubscribe = async () => {
    if (!user) { window.location.href = '/register'; return; }
    if (window.self !== window.top) { alert('Checkout works only from a published app.'); return; }
    setSubscribing(true);
    try {
      const res = await base44.functions?.invoke?.('stripeCheckout', { type: 'elite_subscription' });
      if (res?.data?.url) window.location.href = res.data.url;
    } catch {}
    setSubscribing(false);
  };

  return (
    <PageShell title="Elite">
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 50% at 50% 30%, ${C.accent}10, transparent)` }} />
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${C.accent}, ${C.accent}cc)`, boxShadow: `0 0 80px ${C.accent}30` }}>
              <Crown className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-[44px] md:text-[56px] font-extrabold tracking-tight mb-4" style={{ color: C.text }}>Kairo Elite</h1>
            <p className="text-[18px] mb-8 max-w-[440px] mx-auto" style={{ color: C.muted }}>
              Premium perks that make Kairo even better. Support the project while looking great doing it.
            </p>
            <div className="flex items-baseline justify-center gap-1 mb-8">
              <span className="text-[56px] font-extrabold" style={{ color: C.text }}>$2.99</span>
              <span className="text-[18px]" style={{ color: C.muted }}>/month</span>
            </div>
            {hasElite ? (
              <div className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl" style={{ background: `${C.success}10`, border: `1px solid ${C.success}25` }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: C.success }}>
                  <Check className="w-4 h-4 text-white" />
                </div>
                <span className="text-[15px] font-semibold" style={{ color: C.success }}>You're an Elite member!</span>
              </div>
            ) : (
              <button onClick={handleSubscribe} disabled={subscribing}
                className="px-10 py-4 rounded-xl text-[16px] font-semibold text-white transition-all hover:brightness-110 hover:scale-[1.02] disabled:opacity-50"
                style={{ background: C.accent, boxShadow: `0 0 40px ${C.accent}30` }}>
                <Crown className="w-5 h-5 inline mr-2" />
                {subscribing ? 'Redirecting to checkout...' : 'Subscribe to Elite'}
              </button>
            )}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-[28px] font-extrabold text-center mb-10" style={{ color: C.text }}>Everything you get</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="p-5 rounded-xl transition-all hover:translate-y-[-2px]" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${C.accent}12` }}>
                    <f.icon className="w-5 h-5" style={{ color: C.accent }} />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold mb-1" style={{ color: C.text }}>{f.title}</h3>
                    <p className="text-[13px] leading-relaxed" style={{ color: C.muted }}>{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-[28px] font-extrabold text-center mb-8" style={{ color: C.text }}>Free vs Lite vs Elite</h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
            <div className="grid grid-cols-[1fr_100px_100px_100px] p-4" style={{ background: C.elevated, borderBottom: `1px solid ${C.border}` }}>
              <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: C.muted }}>Feature</span>
              <span className="text-[12px] font-bold uppercase tracking-wider text-center" style={{ color: C.muted }}>Free</span>
              <span className="text-[12px] font-bold uppercase tracking-wider text-center" style={{ color: C.muted }}>Lite</span>
              <span className="text-[12px] font-bold uppercase tracking-wider text-center" style={{ color: C.accent }}>Elite</span>
            </div>
            {COMPARISON.map((f, i) => (
              <div key={i} className="grid grid-cols-[1fr_100px_100px_100px] p-3.5 items-center"
                style={{ borderBottom: i < COMPARISON.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <span className="text-[13px]" style={{ color: C.text }}>{f.name}</span>
                <div className="text-center">
                  {f.free === true ? <Check className="w-4 h-4 mx-auto" style={{ color: C.success }} />
                    : f.free === false ? <X className="w-4 h-4 mx-auto" style={{ color: C.muted }} />
                    : <span className="text-[12px]" style={{ color: C.textSec }}>{f.free}</span>}
                </div>
                <div className="text-center">
                  {f.lite === true ? <Check className="w-4 h-4 mx-auto" style={{ color: C.success }} />
                    : f.lite === false ? <X className="w-4 h-4 mx-auto" style={{ color: C.muted }} />
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

        {hasElite && profile && (
          <div className="rounded-2xl p-6 md:p-8" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <h3 className="text-[18px] font-bold mb-5" style={{ color: C.text }}>Your Subscription</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div className="p-4 rounded-xl" style={{ background: C.elevated }}>
                <p className="text-[11px] uppercase tracking-wider font-bold mb-1" style={{ color: C.muted }}>Plan</p>
                <p className="text-[14px] font-semibold" style={{ color: C.accent }}>Kairo Elite</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: C.elevated }}>
                <p className="text-[11px] uppercase tracking-wider font-bold mb-1" style={{ color: C.muted }}>Price</p>
                <p className="text-[14px] font-semibold" style={{ color: C.text }}>$2.99/month</p>
              </div>
              <div className="p-4 rounded-xl" style={{ background: C.elevated }}>
                <p className="text-[11px] uppercase tracking-wider font-bold mb-1" style={{ color: C.muted }}>Status</p>
                <p className="text-[14px] font-semibold" style={{ color: C.success }}>Active</p>
              </div>
            </div>
            <button className="px-5 py-2.5 rounded-xl text-[13px] font-medium transition-colors hover:bg-[rgba(237,66,69,0.08)]"
              style={{ color: C.danger, border: `1px solid ${C.danger}25` }}>
              Cancel Subscription
            </button>
          </div>
        )}

        {!hasElite && (
          <div className="text-center py-12">
            <button onClick={handleSubscribe} disabled={subscribing}
              className="px-10 py-4 rounded-xl text-[16px] font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: C.accent }}>
              {subscribing ? 'Redirecting...' : 'Subscribe to Elite — $2.99/month'}
            </button>
            <p className="text-[13px] mt-3" style={{ color: C.muted }}>Cancel anytime. No commitments.</p>
          </div>
        )}
      </div>
    </PageShell>
  );
}
