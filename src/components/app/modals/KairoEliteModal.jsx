import React, { useState, useEffect } from 'react';
import { Crown, Check, Sparkles, Palette, Upload, Shield, Zap, Star, Volume2, Gift, Users, MessageSquare, Image, Globe } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModalWrapper from './ModalWrapper';

const PERKS = [
  { icon: Sparkles, label: 'Animated Avatar & Banner', desc: 'Upload GIFs for your profile' },
  { icon: Palette, label: '6 Profile Themes', desc: 'Dark, Midnight, Warm, Ocean, Forest, Sunset' },
  { icon: Upload, label: '100MB File Uploads', desc: 'Upload larger files in chat' },
  { icon: Shield, label: 'Elite Badge + All Badges', desc: 'Exclusive badge collection on your profile' },
  { icon: Zap, label: 'Profile Visitor Count', desc: 'See how many people viewed your profile' },
  { icon: Star, label: 'Animated Gradient Themes', desc: 'Premium animated profile gradients' },
  { icon: Volume2, label: 'HD Voice & Video', desc: 'Higher quality voice and video calls' },
  { icon: Gift, label: 'Monthly Credits', desc: '500 credits every month' },
  { icon: Users, label: 'Group DMs up to 25', desc: 'Larger groups with custom icons' },
  { icon: MessageSquare, label: '4000 Char Messages', desc: 'Extended message character limit' },
  { icon: Image, label: 'Custom Backgrounds', desc: 'Personalize your chat background' },
  { icon: Globe, label: 'Custom Profile URL', desc: 'Get a unique vanity URL' },
];

export default function KairoEliteModal({ onClose, profile, hasElite }) {
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async () => {
    if (window.self !== window.top) {
      alert('Checkout works only from a published app. Please open the app directly.');
      return;
    }
    setSubscribing(true);
    const res = await base44.functions.invoke('stripeCheckout', { type: 'elite_subscription' });
    if (res.data?.url) window.location.href = res.data.url;
    setSubscribing(false);
  };

  return (
    <ModalWrapper title="Kairo Elite" onClose={onClose} width={520}>
      <div className="space-y-5">
        {/* Hero */}
        <div className="relative p-5 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(201,180,123,0.08), rgba(164,123,201,0.06))', border: '1px solid rgba(201,180,123,0.15)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 opacity-10" style={{ background: 'radial-gradient(circle, var(--accent-amber), transparent)' }} />
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(201,180,123,0.15)', border: '1px solid rgba(201,180,123,0.2)' }}>
              <Crown className="w-6 h-6" style={{ color: 'var(--accent-amber)' }} />
            </div>
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--text-cream)' }}>Kairo Elite</h3>
              <p className="text-[11px]" style={{ color: 'var(--accent-amber)' }}>Premium membership</p>
            </div>
          </div>
          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-3xl font-bold" style={{ color: 'var(--text-cream)' }}>$9.99</span>
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/month</span>
          </div>
          <p className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Unlock the full Kairo experience</p>
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-2 gap-2">
          {PERKS.map((p, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
              <p.icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'var(--accent-amber)' }} />
              <div>
                <p className="text-[11px] font-semibold" style={{ color: 'var(--text-cream)' }}>{p.label}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        {hasElite ? (
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl" style={{ background: 'rgba(123,201,164,0.08)', border: '1px solid rgba(123,201,164,0.15)' }}>
            <Check className="w-4 h-4" style={{ color: 'var(--accent-green)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--accent-green)' }}>You're an Elite member!</span>
          </div>
        ) : (
          <button onClick={handleSubscribe} disabled={subscribing}
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #c9b47b, #c4a882)', color: '#000' }}>
            <Crown className="w-4 h-4" />
            {subscribing ? 'Redirecting...' : 'Subscribe to Elite'}
          </button>
        )}
      </div>
    </ModalWrapper>
  );
}