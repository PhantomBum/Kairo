import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Zap, Crown, DollarSign, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function ServerBoostCheckout({ server, currentUser, onClose }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const boostOptions = [
    { months: 1, price: 4.99, label: '1 Month', popular: false },
    { months: 3, price: 12.99, label: '3 Months', popular: true, savings: '13%' },
    { months: 12, price: 49.99, label: '12 Months', popular: false, savings: '17%' }
  ];

  const handlePurchase = async (option) => {
    if (window.self !== window.top) {
      alert('Checkout only works from a published app. Please open this app in a new tab.');
      return;
    }

    try {
      setIsProcessing(true);
      const { data } = await base44.functions.invoke('stripeCheckout', {
        type: 'server_boost',
        serverId: server.id,
        serverName: server.name,
        duration: option.months,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl max-w-md w-full p-6 border border-white/5"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-white">Boost {server.name}</h2>
              <p className="text-xs text-zinc-500">Support and unlock perks</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 mb-6">
          {boostOptions.map((option) => (
            <motion.button
              key={option.months}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handlePurchase(option)}
              disabled={isProcessing}
              className={cn(
                "w-full p-4 rounded-xl border transition-all text-left",
                option.popular
                  ? "bg-white/5 border-white/20"
                  : "bg-white/[0.02] border-white/5 hover:border-white/10"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{option.label}</span>
                    {option.popular && (
                      <span className="px-1.5 py-0.5 bg-white text-black text-[10px] font-medium rounded">BEST</span>
                    )}
                    {option.savings && (
                      <span className="text-[10px] text-emerald-400">-{option.savings}</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-600 mt-0.5">{option.months} month{option.months > 1 ? 's' : ''} of boost</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-white">${option.price}</p>
                  <p className="text-[10px] text-zinc-600">${(option.price / option.months).toFixed(2)}/mo</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
          <h3 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3">Benefits</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-zinc-500">
            <p>• Exclusive badge</p>
            <p>• Boost perks</p>
            <p>• Support server</p>
            <p>• Server improvements</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ServerSubscriptions({ server, currentUser }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['serverSubscriptions', server?.id],
    queryFn: () => base44.entities.ServerSubscription.filter({ 
      server_id: server.id,
      is_active: true 
    }),
    enabled: !!server?.id
  });

  const handleSubscribe = async (subscription) => {
    if (window.self !== window.top) {
      alert('Checkout only works from a published app. Please open this app in a new tab.');
      return;
    }

    try {
      setIsProcessing(true);
      const { data } = await base44.functions.invoke('stripeCheckout', {
        type: 'server_subscription',
        subscriptionId: subscription.id,
        serverId: server.id,
        serverName: server.name,
        subscriptionName: subscription.name,
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

  if (subscriptions.length === 0) {
    return (
      <div className="p-12 text-center">
        <Crown className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No Subscriptions</h3>
        <p className="text-sm text-zinc-600">No subscription tiers available yet</p>
      </div>
    );
  }

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {subscriptions.map((sub) => (
        <motion.div
          key={sub.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden hover:border-white/10 transition-all"
        >
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-medium text-white">{sub.name}</h3>
                <p className="text-[10px] text-zinc-600 uppercase tracking-wider">Tier {sub.tier}</p>
              </div>
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: sub.color || '#fff' }}
              />
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-semibold text-white">${sub.price}</span>
                <span className="text-zinc-600 text-xs">/mo</span>
              </div>
              {sub.description && (
                <p className="text-xs text-zinc-500 mt-1">{sub.description}</p>
              )}
            </div>

            {sub.benefits?.length > 0 && (
              <div className="mb-4 space-y-1.5">
                {sub.benefits.slice(0, 3).map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{benefit}</span>
                  </div>
                ))}
                {sub.benefits.length > 3 && (
                  <p className="text-[10px] text-zinc-600 ml-4">+{sub.benefits.length - 3} more</p>
                )}
              </div>
            )}

            <button
              onClick={() => handleSubscribe(sub)}
              disabled={isProcessing}
              className="w-full px-4 py-2.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-zinc-200 transition-all disabled:opacity-50"
            >
              Subscribe
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default function ShopIntegrated({ currentUser, activeServer }) {
  const [activeTab, setActiveTab] = useState('boost');
  const [showBoostCheckout, setShowBoostCheckout] = useState(false);

  if (!activeServer) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#050506]">
        <div className="text-center">
          <Zap className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-white mb-1">No Server Selected</h2>
          <p className="text-sm text-zinc-600">Select a server to view shop</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#050506] overflow-y-auto">
      {/* Subtle grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]" style={{
        backgroundImage: `linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      {/* Header */}
      <div className="sticky top-0 bg-[#050506]/90 backdrop-blur-xl border-b border-white/5 z-10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {activeServer.icon_url ? (
              <img src={activeServer.icon_url} alt="" className="w-10 h-10 rounded-xl" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-medium">
                {activeServer.name?.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-base font-medium text-white">{activeServer.name}</h1>
              <p className="text-xs text-zinc-600">Support & Subscribe</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('boost')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm transition-all",
              activeTab === 'boost'
                ? "bg-white text-black font-medium"
                : "bg-white/5 text-zinc-500 hover:text-white border border-white/5"
            )}
          >
            <Zap className="w-3.5 h-3.5 inline mr-1.5" />
            Boosts
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm transition-all",
              activeTab === 'subscriptions'
                ? "bg-white text-black font-medium"
                : "bg-white/5 text-zinc-500 hover:text-white border border-white/5"
            )}
          >
            <Crown className="w-3.5 h-3.5 inline mr-1.5" />
            Subscriptions
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'boost' ? (
        <div className="p-6 max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-xl font-medium text-white mb-2">Boost Server</h2>
            <p className="text-sm text-zinc-500 max-w-md mx-auto">
              Support the server and unlock exclusive perks
            </p>
          </div>

          <button
            onClick={() => setShowBoostCheckout(true)}
            className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-200 transition-all"
          >
            <Zap className="w-4 h-4" />
            Choose Duration
          </button>

          <div className="mt-16 grid grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
            <div className="bg-[#050506] p-5 text-center">
              <Zap className="w-5 h-5 text-zinc-600 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-white mb-0.5">Badge</h3>
              <p className="text-[11px] text-zinc-600">Exclusive boost badge</p>
            </div>
            <div className="bg-[#050506] p-5 text-center">
              <Users className="w-5 h-5 text-zinc-600 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-white mb-0.5">Support</h3>
              <p className="text-[11px] text-zinc-600">Help the community</p>
            </div>
            <div className="bg-[#050506] p-5 text-center">
              <Crown className="w-5 h-5 text-zinc-600 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-white mb-0.5">Perks</h3>
              <p className="text-[11px] text-zinc-600">Exclusive features</p>
            </div>
          </div>
        </div>
      ) : (
        <ServerSubscriptions server={activeServer} currentUser={currentUser} />
      )}

      <AnimatePresence>
        {showBoostCheckout && (
          <ServerBoostCheckout
            server={activeServer}
            currentUser={currentUser}
            onClose={() => setShowBoostCheckout(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}