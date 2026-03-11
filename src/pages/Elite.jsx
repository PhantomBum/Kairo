import React, { useState, useEffect } from 'react';
import { Crown, Check, Sparkles, Palette, Upload, Shield, Zap, Star, Volume2, Gift, Users, MessageSquare, Image, Globe, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import PageShell from '@/components/app/shared/PageShell';

const PERKS = [
  { icon: Sparkles, label: 'Animated Avatar & Banner', desc: 'Upload GIFs for your profile', free: false },
  { icon: Palette, label: '6 Profile Themes', desc: 'Dark, Midnight, Warm, Ocean, Forest, Sunset', free: false },
  { icon: Upload, label: '100MB File Uploads', desc: 'Upload larger files in chat', free: '8MB' },
  { icon: Shield, label: 'Elite Badge + All Badges', desc: 'Exclusive badge collection on your profile', free: false },
  { icon: Zap, label: 'Profile Visitor Count', desc: 'See who viewed your profile', free: false },
  { icon: Star, label: 'Animated Gradient Themes', desc: 'Premium animated profile gradients', free: false },
  { icon: Volume2, label: 'HD Voice & Video', desc: 'Higher quality voice and video calls', free: 'Standard' },
  { icon: Gift, label: '500 Monthly Credits', desc: '500 credits every month', free: '0' },
  { icon: Users, label: 'Group DMs up to 25', desc: 'Larger groups with custom icons', free: '10' },
  { icon: MessageSquare, label: '4000 Char Messages', desc: 'Extended message character limit', free: '2000' },
  { icon: Image, label: 'Custom Backgrounds', desc: 'Personalize your chat background', free: false },
  { icon: Globe, label: 'Custom Profile URL', desc: 'Get a unique vanity URL', free: false },
];

const TESTIMONIALS = [
  { name: 'Alex M.', text: 'Elite is worth every penny. The animated avatar alone makes my profile stand out!', avatar: '🎮' },
  { name: 'Sarah K.', text: 'HD voice quality is incredible for our gaming sessions. Can\'t go back to standard.', avatar: '🎧' },
  { name: 'Jordan P.', text: 'The monthly credits let me collect all the best profile decorations. Love it.', avatar: '✨' },
];

export default function Elite() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [hasElite, setHasElite] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const init = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (!isAuth) return;
      const me = await base44.auth.me();
      setUser(me);
      const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
      if (profiles[0]) { setProfile(profiles[0]); setHasElite(profiles[0].badges?.includes('premium') || false); }
    };
    init();
  }, []);

  const handleSubscribe = async () => {
    if (window.self !== window.top) { alert('Checkout works only from a published app. Please open the app directly.'); return; }
    setSubscribing(true);
    const res = await base44.functions.invoke('stripeCheckout', { type: 'elite_subscription' });
    if (res.data?.url) window.location.href = res.data.url;
    setSubscribing(false);
  };

  return (
    <PageShell title="Elite">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(201,180,123,0.15), rgba(164,123,201,0.1))', border: '1px solid rgba(201,180,123,0.2)', boxShadow: '0 0 60px rgba(201,180,123,0.08)' }}>
            <Crown className="w-10 h-10" style={{ color: 'var(--accent-amber)' }} />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-3" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Kairo Elite</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Unlock the full Kairo experience</p>
          <div className="flex items-baseline justify-center gap-1 mb-6">
            <span className="text-5xl font-bold" style={{ color: 'var(--text-cream)' }}>$9.99</span>
            <span className="text-lg" style={{ color: 'var(--text-muted)' }}>/month</span>
          </div>
          {hasElite ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl" style={{ background: 'rgba(123,201,164,0.08)', border: '1px solid rgba(123,201,164,0.15)' }}>
              <Check className="w-5 h-5" style={{ color: 'var(--accent-green)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--accent-green)' }}>You're an Elite member!</span>
            </div>
          ) : (
            <button onClick={handleSubscribe} disabled={subscribing}
              className="px-8 py-3.5 rounded-xl text-base font-semibold inline-flex items-center gap-2 transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #c9b47b, #c4a882)', color: '#000' }}>
              <Crown className="w-5 h-5" />
              {subscribing ? 'Redirecting...' : 'Subscribe to Elite'}
            </button>
          )}
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <h2 className="text-lg font-bold text-center mb-6" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Free vs Elite</h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="grid grid-cols-3 p-4" style={{ background: 'var(--bg-glass-strong)', borderBottom: '1px solid var(--border)' }}>
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Feature</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-center" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Free</span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-center" style={{ color: 'var(--accent-amber)', fontFamily: 'monospace' }}>Elite</span>
            </div>
            {PERKS.map((p, i) => (
              <div key={i} className="grid grid-cols-3 p-3 items-center" style={{ background: i % 2 === 0 ? 'transparent' : 'var(--bg-glass)', borderBottom: i < PERKS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="flex items-center gap-2">
                  <p.icon className="w-3.5 h-3.5" style={{ color: 'var(--accent-amber)' }} />
                  <span className="text-[12px]" style={{ color: 'var(--text-primary)' }}>{p.label}</span>
                </div>
                <div className="text-center">
                  {p.free === false ? <X className="w-3.5 h-3.5 mx-auto" style={{ color: 'var(--accent-red)' }} /> : <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{p.free}</span>}
                </div>
                <div className="text-center">
                  <Check className="w-3.5 h-3.5 mx-auto" style={{ color: 'var(--accent-green)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-12">
          <h2 className="text-lg font-bold text-center mb-6" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>What Elite Members Say</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="p-5 rounded-2xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
                <div className="text-2xl mb-3">{t.avatar}</div>
                <p className="text-[12px] mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>"{t.text}"</p>
                <p className="text-[11px] font-medium" style={{ color: 'var(--text-cream)' }}>{t.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription management for Elite users */}
        {hasElite && profile && (
          <div className="rounded-2xl p-6" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Your Subscription</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-xl" style={{ background: 'var(--bg-glass-strong)' }}>
                <p className="text-[10px] uppercase tracking-[0.08em] mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Plan</p>
                <p className="text-sm font-medium" style={{ color: 'var(--accent-amber)' }}>Kairo Elite — $9.99/mo</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'var(--bg-glass-strong)' }}>
                <p className="text-[10px] uppercase tracking-[0.08em] mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Status</p>
                <p className="text-sm font-medium" style={{ color: 'var(--accent-green)' }}>Active</p>
              </div>
            </div>
            <button className="mt-4 px-4 py-2 rounded-xl text-[12px] font-medium transition-colors hover:bg-[rgba(201,123,123,0.1)]" style={{ color: 'var(--accent-red)', border: '1px solid rgba(201,123,123,0.2)' }}>
              Cancel Subscription
            </button>
          </div>
        )}
      </div>
    </PageShell>
  );
}