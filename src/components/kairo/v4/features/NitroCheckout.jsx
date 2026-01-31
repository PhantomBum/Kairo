import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, Zap, Upload, Palette, Star, Crown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import Modal from '../primitives/Modal';
import Button from '../primitives/Button';

const NITRO_FEATURES = [
  { icon: Palette, text: 'Custom profile themes and effects' },
  { icon: Upload, text: 'Larger file uploads (100MB)' },
  { icon: Sparkles, text: 'Animated avatars and banners' },
  { icon: Star, text: 'Custom emojis everywhere' },
  { icon: Crown, text: 'Premium badge on profile' },
  { icon: Zap, text: '2 free Server Boosts' },
];

export function NitroCheckoutModal({ isOpen, onClose, currentUser }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckout = async () => {
    // Check if in iframe
    if (window !== window.top) {
      alert('Please open this app in a new window to complete checkout.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await base44.functions.invoke('stripeCheckout', {
        product_type: 'nitro',
        user_id: currentUser?.id,
        success_url: `${window.location.origin}?success=nitro`,
        cancel_url: `${window.location.origin}?cancelled=true`,
      });
      
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to start checkout');
    }
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kairo Premium"
      icon={<Sparkles className="w-5 h-5 text-purple-400" />}
      size="lg"
    >
      <div className="text-center">
        {/* Hero */}
        <div className="relative py-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20 blur-3xl" />
          <motion.div
            animate={{ 
              y: [0, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            className="relative"
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Crown className="w-10 h-10 text-white" />
            </div>
          </motion.div>
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-2">
          Unlock Premium Features
        </h3>
        <p className="text-zinc-400 mb-6">
          Get the best of Kairo with Premium
        </p>
        
        {/* Price */}
        <div className="mb-6">
          <div className="inline-flex items-baseline gap-1">
            <span className="text-4xl font-bold text-white">$9.99</span>
            <span className="text-zinc-500">/month</span>
          </div>
        </div>
        
        {/* Features */}
        <div className="grid grid-cols-2 gap-3 text-left mb-8">
          {NITRO_FEATURES.map((feature, i) => (
            <div 
              key={i}
              className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <feature.icon className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-sm text-zinc-300">{feature.text}</span>
            </div>
          ))}
        </div>
        
        {error && (
          <p className="text-red-400 text-sm mb-4">{error}</p>
        )}
        
        <Button
          variant="solid"
          size="lg"
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          onClick={handleCheckout}
          loading={loading}
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Subscribe Now
        </Button>
        
        <p className="text-xs text-zinc-600 mt-4">
          Cancel anytime. Payments are processed securely via Stripe.
        </p>
      </div>
    </Modal>
  );
}

// Server boost checkout
export function BoostCheckoutModal({ isOpen, onClose, server, currentUser }) {
  const [loading, setLoading] = useState(false);
  
  const handleCheckout = async () => {
    if (window !== window.top) {
      alert('Please open this app in a new window to complete checkout.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await base44.functions.invoke('stripeCheckout', {
        product_type: 'boost',
        user_id: currentUser?.id,
        server_id: server?.id,
        success_url: `${window.location.origin}?success=boost`,
        cancel_url: `${window.location.origin}?cancelled=true`,
      });
      
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error('Boost checkout error:', err);
    }
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Boost ${server?.name}`}
      icon={<Zap className="w-5 h-5 text-pink-400" />}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            className="bg-gradient-to-r from-pink-500 to-purple-500"
            onClick={handleCheckout}
            loading={loading}
          >
            <Zap className="w-4 h-4 mr-1" />
            Boost for $4.99/mo
          </Button>
        </>
      }
    >
      <div className="text-center py-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center mb-4">
          <Zap className="w-8 h-8 text-pink-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          Unlock Server Perks
        </h3>
        <ul className="text-sm text-zinc-400 space-y-2 text-left">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            Better audio quality
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            Custom server banner
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            More emoji slots
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            Booster badge
          </li>
        </ul>
      </div>
    </Modal>
  );
}

// Buy credits
export function BuyCreditsModal({ isOpen, onClose, currentUser }) {
  const [loading, setLoading] = useState(false);
  
  const handleCheckout = async () => {
    if (window !== window.top) {
      alert('Please open this app in a new window to complete checkout.');
      return;
    }
    
    setLoading(true);
    try {
      const response = await base44.functions.invoke('stripeCheckout', {
        product_type: 'credits',
        user_id: currentUser?.id,
        success_url: `${window.location.origin}?success=credits`,
        cancel_url: `${window.location.origin}?cancelled=true`,
      });
      
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error('Credits checkout error:', err);
    }
    setLoading(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buy Credits"
      icon={<Star className="w-5 h-5 text-amber-400" />}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            className="bg-gradient-to-r from-amber-500 to-orange-500"
            onClick={handleCheckout}
            loading={loading}
          >
            Buy 1000 Credits - $4.99
          </Button>
        </>
      }
    >
      <div className="text-center py-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-4">
          <Star className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          1000 Kairo Credits
        </h3>
        <p className="text-sm text-zinc-400">
          Use credits to purchase profile decorations, themes, and exclusive items from the shop.
        </p>
      </div>
    </Modal>
  );
}