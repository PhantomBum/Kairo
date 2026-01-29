import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, Zap, Star, Crown, Check, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const boostTiers = [
  {
    level: 1,
    name: 'Single Boost',
    price: 4.99,
    benefits: ['Support the server', 'Booster badge', '10% off shop items'],
    icon: Star
  },
  {
    level: 2,
    name: 'Double Boost',
    price: 9.99,
    benefits: ['All Level 1 benefits', 'Custom emoji slot', '25% off shop items', 'Priority support'],
    icon: Zap,
    popular: true
  },
  {
    level: 3,
    name: 'Triple Boost',
    price: 14.99,
    benefits: ['All Level 2 benefits', 'Exclusive role', 'Server avatar decoration', '50% off shop items', 'Early access to features'],
    icon: Crown
  }
];

export default function ServerBoostCheckout({ server, currentUser, onClose }) {
  const queryClient = useQueryClient();
  const [selectedTier, setSelectedTier] = useState(boostTiers[1]);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const boostMutation = useMutation({
    mutationFn: async () => {
      if (window.self !== window.top) {
        throw new Error('Checkout only works from a published app');
      }

      setIsProcessing(true);
      const { data } = await base44.functions.invoke('stripeCheckout', {
        type: 'server_boost',
        serverId: server.id,
        serverName: server.name,
        userId: currentUser?.id,
        userEmail: currentUser?.email
      });
      
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      console.error('Boost error:', error);
      alert(error.message || 'Failed to start checkout. Please try again.');
      setIsProcessing(false);
    }
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 rounded-2xl border border-zinc-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">Boost {server.name}</h2>
              <p className="text-sm text-zinc-500">Support the server and unlock exclusive perks</p>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tiers */}
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-8">
            {boostTiers.map((tier) => {
              const Icon = tier.icon;
              return (
                <button
                  key={tier.level}
                  onClick={() => setSelectedTier(tier)}
                  className={cn(
                    "relative p-6 rounded-xl border-2 transition-all text-left",
                    selectedTier.level === tier.level
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-zinc-800 hover:border-zinc-700 bg-zinc-800/50"
                  )}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full">
                      POPULAR
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-3">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-white mb-1">{tier.name}</h3>
                    <p className="text-2xl font-bold text-white">
                      ${tier.price}
                      <span className="text-sm text-zinc-500 font-normal">/month</span>
                    </p>
                  </div>

                  <ul className="space-y-2">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>

          {/* Payment Method */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-white">Payment Method</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPaymentMethod('card')}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all flex items-center gap-3",
                  paymentMethod === 'card'
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-zinc-800 hover:border-zinc-700"
                )}
              >
                <CreditCard className="w-5 h-5 text-zinc-400" />
                <span className="font-medium text-white">Credit Card</span>
              </button>
              <button
                onClick={() => setPaymentMethod('credits')}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all flex items-center gap-3",
                  paymentMethod === 'credits'
                    ? "border-indigo-500 bg-indigo-500/10"
                    : "border-zinc-800 hover:border-zinc-700"
                )}
              >
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="font-medium text-white">Kairo Credits</span>
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-zinc-800/50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-white mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">{selectedTier.name}</span>
                <span className="text-white">${selectedTier.price}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Duration</span>
                <span className="text-white">1 month</span>
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-700 flex justify-between">
              <span className="font-semibold text-white">Total</span>
              <span className="text-2xl font-bold text-white">${selectedTier.price}</span>
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={() => boostMutation.mutate()}
            disabled={boostMutation.isPending || isProcessing}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 h-12 text-lg font-semibold disabled:opacity-50"
          >
            <Zap className="w-5 h-5 mr-2" />
            {isProcessing || boostMutation.isPending ? 'Processing...' : `Boost for $${selectedTier.price}`}
          </Button>

          <p className="text-xs text-zinc-500 text-center mt-4">
            By purchasing, you agree to our Terms of Service. Recurring billing. Cancel anytime.
          </p>
        </div>
      </motion.div>
    </div>
  );
}