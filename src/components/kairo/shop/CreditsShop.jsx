import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Zap, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const creditPackages = [
  { 
    id: 'credits_1000', 
    amount: 1000, 
    price: 9.99, 
    bonus: 0,
    popular: false 
  },
  { 
    id: 'credits_5000', 
    amount: 5000, 
    price: 39.99, 
    bonus: 500,
    popular: true 
  }
];

export default function CreditsShop({ currentUser, onClose }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async (pkg) => {
    if (window.self !== window.top) {
      alert('Checkout only works from a published app. Please open this app in a new tab.');
      return;
    }

    try {
      setIsProcessing(true);
      const { data } = await base44.functions.invoke('stripeCheckout', {
        type: pkg.id,
        userId: currentUser?.id,
        userEmail: currentUser?.email
      });
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to start checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-bold text-white mb-4">Buy Credits</h3>
      {creditPackages.map((pkg) => (
        <motion.div
          key={pkg.id}
          whileHover={{ scale: 1.02 }}
          className={`relative p-6 rounded-xl border-2 transition-all ${
            pkg.popular 
              ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500' 
              : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
          }`}
        >
          {pkg.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full">
              POPULAR
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-2xl font-bold text-white">{pkg.amount.toLocaleString()}</span>
                <span className="text-sm text-zinc-500">credits</span>
              </div>
              {pkg.bonus > 0 && (
                <p className="text-sm text-green-400">+{pkg.bonus} bonus credits!</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">${pkg.price}</p>
            </div>
          </div>

          <Button
            onClick={() => handlePurchase(pkg)}
            disabled={isProcessing}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {isProcessing ? 'Processing...' : 'Purchase'}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}