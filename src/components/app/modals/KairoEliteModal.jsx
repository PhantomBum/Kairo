import React, { useState, useEffect, useRef } from 'react';
import { Crown, Sparkles, Check, X, Star, Zap, Image, MessageSquare, Video, Upload, Palette, Music, Shield, Gift, Heart, ArrowRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ModalWrapper from './ModalWrapper';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', success: '#34d399', danger: '#f87171', warning: '#fbbf24',
  gold: '#f0b232',
};

const ADMIN_EMAILS = ['ilikebagels1612@gmail.com', 'rdw1612@gmail.com'];

const ELITE_FEATURES = [
  { icon: Image, label: 'Animated GIF Banner', desc: 'Upload animated banners to your profile' },
  { icon: Sparkles, label: '6 Elite Profile Effects', desc: 'Solar Flare, Deep Space, Sakura Storm, Void Rift, Crystalline, Dragon Scale' },
  { icon: Crown, label: 'Holographic Avatar Border', desc: 'Rainbow shifting border visible everywhere' },
  { icon: Palette, label: 'Custom Cursor Styles', desc: 'Star, Crown, Flame, Sparkle cursors' },
  { icon: MessageSquare, label: 'Message Send Animations', desc: 'Bubble Pop, Confetti Burst, Flame Trail, Sparkle Fade' },
  { icon: Zap, label: '4 Elite Bubble Styles', desc: 'Exclusive message bubble designs' },
  { icon: Image, label: 'Custom Chat Background', desc: 'Upload images or animated GIFs' },
  { icon: Crown, label: 'Animated Crown Badge', desc: 'Bronze → Silver → Gold → Diamond' },
  { icon: Star, label: 'Username Shimmer', desc: 'Animated shimmer on your display name' },
  { icon: Upload, label: '500MB File Uploads', desc: 'Up from 150MB for free users' },
  { icon: MessageSquare, label: '4000 Char Messages', desc: 'Longer messages for when you need them' },
  { icon: Video, label: '1080p Video Calls', desc: 'Crystal clear video quality' },
  { icon: Shield, label: '25 Person Group Calls', desc: 'Up from 15 for free users' },
  { icon: Music, label: 'Global Emoji & Stickers', desc: 'Use server emoji everywhere' },
  { icon: Gift, label: 'HD Voice 320kbps', desc: 'Studio quality voice chat' },
  { icon: Heart, label: 'DM Read Receipts', desc: 'See when your messages are read' },
];

const CROWN_TIERS = [
  { months: 1, label: 'Bronze', color: '#cd7f32', glow: '#cd7f3240' },
  { months: 3, label: 'Silver', color: '#c0c0c0', glow: '#c0c0c040' },
  { months: 6, label: 'Gold', color: '#f0b232', glow: '#f0b23240' },
  { months: 12, label: 'Diamond', color: '#b9f2ff', glow: '#b9f2ff40' },
];

function getCrownTier(monthsSubscribed) {
  if (monthsSubscribed >= 12) return CROWN_TIERS[3];
  if (monthsSubscribed >= 6) return CROWN_TIERS[2];
  if (monthsSubscribed >= 3) return CROWN_TIERS[1];
  return CROWN_TIERS[0];
}

function WelcomeAnimation({ onContinue }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + Math.random() * 200,
      vx: (Math.random() - 0.5) * 2,
      vy: -(2 + Math.random() * 4),
      size: 2 + Math.random() * 4,
      alpha: 0.5 + Math.random() * 0.5,
      color: Math.random() > 0.5 ? '#f0b232' : '#ffd700',
    }));

    let frame;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.003;
        if (p.alpha <= 0) { p.y = canvas.height + 20; p.alpha = 0.5 + Math.random() * 0.5; }
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.95)' }}>
      <canvas ref={canvasRef} className="absolute inset-0" />
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.3 }}
        className="relative z-10 text-center px-8">
        <motion.div initial={{ y: 30, rotate: -10 }} animate={{ y: 0, rotate: 0 }}
          transition={{ type: 'spring', damping: 10, stiffness: 120, delay: 0.5 }}
          className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <Crown className="w-20 h-20" style={{ color: P.gold, filter: `drop-shadow(0 0 20px ${P.gold}60)` }} />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }} className="text-[32px] font-bold mb-3" style={{ color: P.gold }}>
          Welcome to Kairo Elite
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }} className="text-[16px] mb-8 max-w-md mx-auto" style={{ color: P.textSecondary }}>
          Your profile just got a whole lot more powerful. Explore your new features.
        </motion.p>
        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }} onClick={onContinue}
          className="px-8 py-3 rounded-xl text-[16px] font-semibold transition-all hover:brightness-110"
          style={{ background: `linear-gradient(135deg, ${P.gold}, #ffd700)`, color: '#000' }}>
          Continue <ArrowRight className="w-5 h-5 inline ml-1" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default function KairoEliteModal({ onClose, profile, hasElite, currentUser }) {
  const [purchasing, setPurchasing] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [tab, setTab] = useState('features');

  const isAdmin = ADMIN_EMAILS.includes(currentUser?.email);
  const isElite = hasElite || isAdmin;
  const monthsSubscribed = profile?.elite_months || (isAdmin ? 99 : 0);
  const crownTier = getCrownTier(monthsSubscribed);

  const handleSubscribe = async () => {
    if (isAdmin) return;
    setPurchasing(true);
    try {
      const hasSeenWelcome = localStorage.getItem(`kairo-elite-welcome-${currentUser?.id}`);
      if (!hasSeenWelcome) {
        setShowWelcome(true);
        localStorage.setItem(`kairo-elite-welcome-${currentUser?.id}`, 'true');
      }
    } catch {}
    setPurchasing(false);
  };

  if (showWelcome) {
    return <WelcomeAnimation onContinue={() => { setShowWelcome(false); }} />;
  }

  return (
    <ModalWrapper title="" onClose={onClose} width={560} hideTitle>
      <div className="-mx-6 -my-6">
        {/* Hero header */}
        <div className="relative overflow-hidden px-6 pt-8 pb-6"
          style={{ background: `linear-gradient(135deg, ${P.gold}20, ${P.accent}10, ${P.base})` }}>
          <div className="absolute inset-0 opacity-10" style={{
            background: `radial-gradient(circle at 30% 40%, ${P.gold}40, transparent 60%), radial-gradient(circle at 70% 60%, ${P.accent}30, transparent 50%)`,
          }} />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: `${P.gold}20`, boxShadow: `0 0 20px ${P.gold}20` }}>
                <Crown className="w-7 h-7" style={{ color: P.gold }} />
              </div>
              <div>
                <h2 className="text-[22px] font-bold" style={{ color: P.textPrimary }}>Kairo Elite</h2>
                <p className="text-[13px]" style={{ color: P.muted }}>$2.99/month</p>
              </div>
            </div>

            {isElite ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: `${P.success}15`, border: `1px solid ${P.success}30` }}>
                  <Check className="w-4 h-4" style={{ color: P.success }} />
                  <span className="text-[13px] font-semibold" style={{ color: P.success }}>
                    {isAdmin ? 'Permanent Elite (Admin)' : 'Active Subscriber'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{ background: `${crownTier.color}15`, border: `1px solid ${crownTier.color}30` }}>
                  <Crown className="w-3.5 h-3.5" style={{ color: crownTier.color }} />
                  <span className="text-[11px] font-bold" style={{ color: crownTier.color }}>{crownTier.label} Tier</span>
                </div>
              </div>
            ) : (
              <button onClick={handleSubscribe} disabled={purchasing}
                className="px-6 py-2.5 rounded-xl text-[14px] font-semibold transition-all hover:brightness-110 disabled:opacity-50"
                style={{ background: `linear-gradient(135deg, ${P.gold}, #ffd700)`, color: '#000' }}>
                {purchasing ? 'Processing...' : 'Subscribe — $2.99/mo'}
              </button>
            )}
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.1)]">
            <X className="w-5 h-5" style={{ color: P.muted }} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 px-6 py-2" style={{ borderBottom: `1px solid ${P.border}` }}>
          {['features', 'billing'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-[13px] font-medium transition-all capitalize"
              style={{ background: tab === t ? `${P.accent}14` : 'transparent', color: tab === t ? P.textPrimary : P.muted }}>
              {t === 'billing' ? 'Billing' : 'Features'}
            </button>
          ))}
        </div>

        <div className="px-6 py-4 max-h-[50vh] overflow-y-auto scrollbar-none">
          {tab === 'features' && (
            <div className="space-y-6">
              {/* Crown tier progression */}
              {isElite && (
                <div className="p-4 rounded-xl" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: P.muted }}>Crown Tier Progression</p>
                  <div className="flex items-center gap-2">
                    {CROWN_TIERS.map((tier, i) => {
                      const active = monthsSubscribed >= tier.months;
                      return (
                        <div key={tier.label} className="flex-1 text-center">
                          <div className="w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-1 transition-all"
                            style={{ background: active ? `${tier.color}20` : P.base, border: `2px solid ${active ? tier.color : P.border}`, boxShadow: active ? `0 0 12px ${tier.glow}` : 'none' }}>
                            <Crown className="w-5 h-5" style={{ color: active ? tier.color : P.muted }} />
                          </div>
                          <p className="text-[11px] font-bold" style={{ color: active ? tier.color : P.muted }}>{tier.label}</p>
                          <p className="text-[11px]" style={{ color: P.muted }}>{tier.months}mo</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Feature grid */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: P.muted }}>Elite Exclusive Features</p>
                <div className="grid grid-cols-2 gap-2">
                  {ELITE_FEATURES.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl"
                      style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `${P.gold}10` }}>
                        <f.icon className="w-4 h-4" style={{ color: P.gold }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold leading-tight" style={{ color: P.textPrimary }}>{f.label}</p>
                        <p className="text-[11px] leading-snug mt-0.5" style={{ color: P.muted }}>{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Free features */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: P.muted }}>Free For Everyone</p>
                <div className="space-y-1">
                  {['Animated GIF avatar', 'All 10 base profile effects', '2 message bubble styles', '150MB file uploads',
                    'Unlimited message history', 'Custom status with expiry', '5 community themes', '300 character bio'].map(f => (
                    <div key={f} className="flex items-center gap-2 px-2 py-1">
                      <Check className="w-3 h-3" style={{ color: P.success }} />
                      <span className="text-[12px]" style={{ color: P.textSecondary }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'billing' && (
            <div className="space-y-4">
              {isAdmin ? (
                <div className="p-4 rounded-xl text-center" style={{ background: `${P.success}08`, border: `1px solid ${P.success}20` }}>
                  <Shield className="w-8 h-8 mx-auto mb-2" style={{ color: P.success }} />
                  <p className="text-[14px] font-semibold mb-1" style={{ color: P.success }}>Permanent Elite</p>
                  <p className="text-[12px]" style={{ color: P.muted }}>Your admin account has permanent Elite access. No billing required.</p>
                </div>
              ) : isElite ? (
                <>
                  <div className="p-4 rounded-xl" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: P.muted }}>Current Plan</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[16px] font-bold" style={{ color: P.gold }}>Kairo Elite</p>
                        <p className="text-[13px]" style={{ color: P.textSecondary }}>$2.99/month</p>
                      </div>
                      <Crown className="w-8 h-8" style={{ color: crownTier.color }} />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[12px]" style={{ color: P.muted }}>Next billing date</span>
                      <span className="text-[12px] font-medium" style={{ color: P.textSecondary }}>
                        {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[12px]" style={{ color: P.muted }}>Subscribed since</span>
                      <span className="text-[12px] font-medium" style={{ color: P.textSecondary }}>
                        {profile?.elite_since ? new Date(profile.elite_since).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                  </div>
                  <button className="w-full py-2.5 rounded-xl text-[13px] font-medium"
                    style={{ background: `${P.danger}10`, color: P.danger, border: `1px solid ${P.danger}20` }}>
                    Cancel Subscription
                  </button>
                  <p className="text-[11px] text-center" style={{ color: P.muted }}>
                    If you cancel, Elite continues until the end of your billing period.
                  </p>
                </>
              ) : (
                <div className="text-center py-8">
                  <Crown className="w-12 h-12 mx-auto mb-3" style={{ color: P.gold, opacity: 0.3 }} />
                  <p className="text-[14px] font-medium mb-1" style={{ color: P.textSecondary }}>Not subscribed yet</p>
                  <p className="text-[12px] mb-4" style={{ color: P.muted }}>Subscribe to unlock all Elite features</p>
                  <button onClick={handleSubscribe}
                    className="px-6 py-2.5 rounded-xl text-[14px] font-semibold transition-all hover:brightness-110"
                    style={{ background: `linear-gradient(135deg, ${P.gold}, #ffd700)`, color: '#000' }}>
                    Subscribe — $2.99/mo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </ModalWrapper>
  );
}

export function EliteGate({ children, hasElite, feature }) {
  if (hasElite) return children;
  return (
    <div className="relative">
      <div className="opacity-40 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold"
          style={{ background: `${P.gold}15`, color: P.gold, border: `1px solid ${P.gold}30` }}>
          <Crown className="w-3 h-3" /> Elite only
        </div>
      </div>
    </div>
  );
}
