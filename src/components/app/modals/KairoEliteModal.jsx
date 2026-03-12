import React, { useState } from 'react';
import { Crown, Check, Sparkles, Palette, Upload, Shield, Zap, Star, Volume2, Gift, Users, MessageSquare, Image, Globe, Infinity, Flame, Eye, Lock, Rocket, Cpu } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModalWrapper from './ModalWrapper';
import { colors } from '@/components/app/design/tokens';

const ELITE_PERKS = [
  { icon: Sparkles, label: 'Animated Avatar & Banner', desc: 'Upload GIFs for your profile' },
  { icon: Palette, label: '6 Profile Themes', desc: 'Dark, Midnight, Warm, Ocean, Forest, Sunset' },
  { icon: Upload, label: '100MB File Uploads', desc: 'Upload larger files in chat' },
  { icon: Shield, label: 'Elite Badge', desc: 'Exclusive badge on your profile' },
  { icon: Zap, label: 'Profile Visitor Count', desc: 'See who viewed your profile' },
  { icon: Star, label: 'Animated Gradient Themes', desc: 'Premium animated profile gradients' },
  { icon: Volume2, label: 'HD Voice & Video', desc: 'Higher quality voice and video calls' },
  { icon: Gift, label: 'Monthly Credits', desc: '500 credits every month' },
  { icon: Users, label: 'Group DMs up to 25', desc: 'Larger groups with custom icons' },
  { icon: MessageSquare, label: '4000 Char Messages', desc: 'Extended message character limit' },
  { icon: Image, label: 'Custom Backgrounds', desc: 'Personalize your chat background' },
  { icon: Globe, label: 'Custom Profile URL', desc: 'Get a unique vanity URL' },
];

const ADMIN_PERKS = [
  { icon: Infinity, label: 'Unlimited Everything', desc: 'No limits on file size, messages, or storage' },
  { icon: Flame, label: 'All Badges Unlocked', desc: 'Every badge in Kairo, permanently' },
  { icon: Crown, label: 'Kairo Admin Badge', desc: 'Exclusive admin-only badge' },
  { icon: Rocket, label: 'Infinite Server Boosts', desc: 'Boost any server without limits' },
  { icon: Eye, label: 'Admin Panel Access', desc: 'Full platform management tools' },
  { icon: Lock, label: 'Bypass All Restrictions', desc: 'No slowmode, no NSFW gates, no limits' },
  { icon: Gift, label: 'Unlimited Credits', desc: '999,999 credits, auto-refreshing' },
  { icon: Cpu, label: 'Priority Processing', desc: 'Fastest message delivery & uploads' },
  { icon: Star, label: 'Custom Role Colors', desc: 'Any hex color for your name' },
  { icon: Shield, label: 'Platform Moderation', desc: 'Ban/unban users, delete servers' },
  { icon: Users, label: 'Group DMs up to 100', desc: '10x the group size' },
  { icon: Globe, label: 'Server Discovery Priority', desc: 'Your servers appear first in Discover' },
];

export default function KairoEliteModal({ onClose, profile, hasElite }) {
  const [subscribing, setSubscribing] = useState(false);
  const [tier, setTier] = useState('elite');
  const isAdmin = profile?.badges?.includes('owner') || profile?.badges?.includes('admin');
  const hasAdmin = isAdmin; // Admins auto-have Kairo Admin tier

  const handleSubscribe = async () => {
    if (window.self !== window.top) {
      alert('Checkout works only from a published app. Please open the app directly.');
      return;
    }
    setSubscribing(true);
    const user = await base44.auth.me();
    const res = await base44.functions.invoke('stripeCheckout', { type: 'elite_subscription', user_id: user.id });
    if (res.data?.url) window.location.href = res.data.url;
    setSubscribing(false);
  };

  return (
    <ModalWrapper title={tier === 'admin' ? 'Kairo Admin' : 'Kairo Elite'} onClose={onClose} width={560}>
      <div className="space-y-5">
        {/* Tier switcher */}
        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: colors.bg.elevated }}>
          <button onClick={() => setTier('elite')}
            className="flex-1 py-2 rounded-md text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5"
            style={{ background: tier === 'elite' ? 'rgba(201,180,123,0.12)' : 'transparent', color: tier === 'elite' ? '#c9b47b' : colors.text.muted }}>
            <Crown className="w-3.5 h-3.5" /> Elite
          </button>
          <button onClick={() => setTier('admin')}
            className="flex-1 py-2 rounded-md text-[12px] font-semibold transition-colors flex items-center justify-center gap-1.5"
            style={{ background: tier === 'admin' ? 'rgba(88,101,242,0.12)' : 'transparent', color: tier === 'admin' ? colors.accent.primary : colors.text.muted }}>
            <Shield className="w-3.5 h-3.5" /> Admin
          </button>
        </div>

        {tier === 'elite' ? (
          <>
            {/* Elite Hero */}
            <div className="relative p-5 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(201,180,123,0.08), rgba(164,123,201,0.06))', border: '1px solid rgba(201,180,123,0.15)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{ background: 'radial-gradient(circle, var(--accent-amber), transparent)' }} />
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(201,180,123,0.15)', border: '1px solid rgba(201,180,123,0.2)' }}>
                  <Crown className="w-6 h-6" style={{ color: '#c9b47b' }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: colors.text.primary }}>Kairo Elite</h3>
                  <p className="text-[11px]" style={{ color: '#c9b47b' }}>Premium membership</p>
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold" style={{ color: colors.text.primary }}>$9.99</span>
                <span className="text-sm" style={{ color: colors.text.muted }}>/month</span>
              </div>
              <p className="text-[12px]" style={{ color: colors.text.secondary }}>Unlock the full Kairo experience</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {ELITE_PERKS.map((p, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.border.default}` }}>
                  <p.icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#c9b47b' }} />
                  <div>
                    <p className="text-[11px] font-semibold" style={{ color: colors.text.primary }}>{p.label}</p>
                    <p className="text-[10px]" style={{ color: colors.text.muted }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {hasElite ? (
              <div className="flex items-center justify-center gap-2 py-3 rounded-xl" style={{ background: 'rgba(59,165,93,0.08)', border: '1px solid rgba(59,165,93,0.15)' }}>
                <Check className="w-4 h-4" style={{ color: colors.success }} />
                <span className="text-sm font-medium" style={{ color: colors.success }}>You're an Elite member!</span>
              </div>
            ) : (
              <button onClick={handleSubscribe} disabled={subscribing}
                className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #c9b47b, #c4a882)', color: '#000' }}>
                <Crown className="w-4 h-4" />
                {subscribing ? 'Redirecting...' : 'Subscribe to Elite'}
              </button>
            )}
          </>
        ) : (
          <>
            {/* Admin Hero */}
            <div className="relative p-5 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(88,101,242,0.1), rgba(123,97,255,0.06))', border: '1px solid rgba(88,101,242,0.2)' }}>
              <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{ background: 'radial-gradient(circle, #5865F2, transparent)' }} />
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(88,101,242,0.15)', border: '1px solid rgba(88,101,242,0.25)' }}>
                  <Shield className="w-6 h-6" style={{ color: colors.accent.primary }} />
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: colors.text.primary }}>Kairo Admin</h3>
                  <p className="text-[11px]" style={{ color: colors.accent.primary }}>Platform administrator tier</p>
                </div>
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold" style={{ color: colors.text.primary }}>∞</span>
                <span className="text-sm" style={{ color: colors.text.muted }}>Everything. Forever.</span>
              </div>
              <p className="text-[12px]" style={{ color: colors.text.secondary }}>Elite × 10 — for Kairo administrators only</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {ADMIN_PERKS.map((p, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: 'rgba(88,101,242,0.04)', border: `1px solid rgba(88,101,242,0.1)` }}>
                  <p.icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: colors.accent.primary }} />
                  <div>
                    <p className="text-[11px] font-semibold" style={{ color: colors.text.primary }}>{p.label}</p>
                    <p className="text-[10px]" style={{ color: colors.text.muted }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {hasAdmin ? (
              <div className="flex items-center justify-center gap-2 py-3 rounded-xl" style={{ background: 'rgba(88,101,242,0.08)', border: '1px solid rgba(88,101,242,0.15)' }}>
                <Shield className="w-4 h-4" style={{ color: colors.accent.primary }} />
                <span className="text-sm font-medium" style={{ color: colors.accent.primary }}>Kairo Admin — Active</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${colors.border.default}` }}>
                <Lock className="w-4 h-4" style={{ color: colors.text.disabled }} />
                <span className="text-sm font-medium" style={{ color: colors.text.disabled }}>Admin-only tier</span>
              </div>
            )}
          </>
        )}
      </div>
    </ModalWrapper>
  );
}