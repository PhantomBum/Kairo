import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Crown, Sparkles, Zap, Check, X, Star, Gift, 
  Image, Palette, Upload, MessageSquare, Smile
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const nitroPlans = [
  {
    id: 'nitro_basic',
    name: 'Nitro Basic',
    price: 2.99,
    period: 'month',
    color: 'from-indigo-500 to-purple-500',
    features: [
      { icon: Smile, text: 'Custom emoji anywhere' },
      { icon: Upload, text: '50MB upload limit' },
      { icon: Sparkles, text: 'Special Nitro badge' },
      { icon: MessageSquare, text: 'Custom stickers' },
    ]
  },
  {
    id: 'nitro',
    name: 'Nitro',
    price: 9.99,
    period: 'month',
    popular: true,
    color: 'from-purple-500 to-pink-500',
    features: [
      { icon: Smile, text: 'Custom emoji anywhere' },
      { icon: Upload, text: '500MB upload limit' },
      { icon: Sparkles, text: 'Special Nitro badge' },
      { icon: MessageSquare, text: 'Custom stickers' },
      { icon: Palette, text: 'Custom profile themes' },
      { icon: Image, text: 'Animated avatar & banner' },
      { icon: Star, text: '2 Server Boosts included' },
      { icon: Gift, text: 'Shop discounts' },
    ]
  }
];

function PlanCard({ plan, onSubscribe, isLoading, currentPlan }) {
  const isCurrentPlan = currentPlan === plan.id;
  
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className={cn(
        "relative flex-1 rounded-2xl overflow-hidden border-2 transition-all",
        plan.popular ? "border-purple-500/50" : "border-white/10",
        isCurrentPlan && "ring-2 ring-emerald-500"
      )}
    >
      {plan.popular && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold text-center py-1">
          MOST POPULAR
        </div>
      )}
      
      <div className={cn("p-6", plan.popular && "pt-10")}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className={cn(
            "w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br flex items-center justify-center",
            plan.color
          )}>
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold text-white">${plan.price}</span>
            <span className="text-zinc-400">/{plan.period}</span>
          </div>
        </div>
        
        {/* Features */}
        <ul className="space-y-3 mb-6">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-center gap-3 text-zinc-300">
              <feature.icon className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <span className="text-sm">{feature.text}</span>
            </li>
          ))}
        </ul>
        
        {/* CTA */}
        <Button
          onClick={() => onSubscribe(plan)}
          disabled={isLoading || isCurrentPlan}
          className={cn(
            "w-full h-12 text-base font-semibold",
            isCurrentPlan 
              ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 cursor-default"
              : plan.popular 
                ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600" 
                : "bg-white/10 hover:bg-white/20 text-white"
          )}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : isCurrentPlan ? (
            <>
              <Check className="w-5 h-5 mr-2" />
              Current Plan
            </>
          ) : (
            'Subscribe'
          )}
        </Button>
      </div>
    </motion.div>
  );
}

export default function NitroPage({ currentUser, userCredits, onClose }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  const currentPlan = userCredits?.nitro_plan || null;

  const handleSubscribe = async (plan) => {
    // Check if running in iframe
    if (window.self !== window.top) {
      alert('Checkout is only available from the published app. Please open Kairo directly.');
      return;
    }
    
    setIsLoading(true);
    setSelectedPlan(plan.id);
    
    try {
      const response = await base44.functions.invoke('stripeCheckout', {
        priceId: plan.id === 'nitro' ? 'nitro_full' : 'nitro_basic',
        mode: 'subscription',
        successUrl: window.location.href,
        cancelUrl: window.location.href,
        metadata: {
          user_id: currentUser?.id,
          plan_id: plan.id
        }
      });
      
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0b] overflow-hidden">
      {/* Hero */}
      <div className="relative">
        <div 
          className="h-48 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 50%, #f59e0b 100%)'
          }}
        >
          <div className="absolute inset-0 bg-black/20" />
          {/* Animated particles */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/40 rounded-full"
                initial={{ 
                  x: Math.random() * 100 + '%', 
                  y: Math.random() * 100 + '%',
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{ 
                  y: [null, '-100%'],
                  opacity: [0.4, 0]
                }}
                transition={{ 
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#0a0a0b] via-[#0a0a0b]/90 to-transparent">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-4"
            >
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="text-white font-medium">Kairo Nitro</span>
            </motion.div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Unlock the full Kairo experience
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Get more out of Kairo with bigger uploads, custom profiles, server boosts, and exclusive perks
            </p>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-6 mb-12">
            {nitroPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSubscribe={handleSubscribe}
                isLoading={isLoading && selectedPlan === plan.id}
                currentPlan={currentPlan}
              />
            ))}
          </div>

          {/* Benefits Section */}
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-white mb-6 text-center">
              Why subscribe to Nitro?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: Upload, title: 'Bigger Uploads', desc: 'Share files up to 500MB' },
                { icon: Palette, title: 'Custom Profiles', desc: 'Stand out with unique themes' },
                { icon: Star, title: 'Server Boosts', desc: 'Support your favorite servers' },
              ].map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-6 bg-white/5 border border-white/10 rounded-xl text-center"
                >
                  <benefit.icon className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-1">{benefit.title}</h3>
                  <p className="text-sm text-zinc-400">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Gift Section */}
          <div className="p-6 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-2xl text-center">
            <Gift className="w-10 h-10 text-pink-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Gift Nitro to a friend</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Share the Nitro experience with someone special
            </p>
            <Button variant="outline" className="border-pink-500/50 text-pink-300 hover:bg-pink-500/20">
              <Gift className="w-4 h-4 mr-2" />
              Gift Nitro
            </Button>
          </div>
        </div>
      </div>

      {/* Close button */}
      {onClose && (
        <div className="p-4 border-t border-white/5">
          <Button onClick={onClose} variant="outline" className="w-full">
            Close
          </Button>
        </div>
      )}
    </div>
  );
}