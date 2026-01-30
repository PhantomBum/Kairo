import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Zap, Crown, DollarSign, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function ServerBoostCheckout({ server, currentUser, onClose }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(1);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-zinc-900 rounded-xl max-w-2xl w-full p-6 border border-zinc-800"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Boost {server.name}</h2>
              <p className="text-sm text-zinc-500">Support the server and unlock perks</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {boostOptions.map((option) => (
            <motion.button
              key={option.months}
              whileHover={{ scale: 1.02 }}
              onClick={() => handlePurchase(option)}
              disabled={isProcessing}
              className={cn(
                "w-full p-4 rounded-lg border-2 transition-all text-left",
                option.popular
                  ? "bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500"
                  : "bg-zinc-800/50 border-zinc-700 hover:border-zinc-600"
              )}
            >
              {option.popular && (
                <div className="inline-block px-2 py-0.5 bg-pink-500 text-white text-xs font-bold rounded-full mb-2">
                  BEST VALUE
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white">{option.label}</span>
                    {option.savings && (
                      <span className="text-xs text-green-400">Save {option.savings}</span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 mt-1">Boost for {option.months} month{option.months > 1 ? 's' : ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">${option.price}</p>
                  <p className="text-xs text-zinc-500">${(option.price / option.months).toFixed(2)}/mo</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-white mb-2">Boost Benefits:</h3>
          <div className="text-sm text-zinc-400 space-y-1">
            <p>✓ Support the server financially</p>
            <p>✓ Special badge next to your name</p>
            <p>✓ Access to exclusive boost perks</p>
            <p>✓ Help unlock server-wide improvements</p>
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
        <Crown className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Subscriptions Yet</h3>
        <p className="text-zinc-500">Server hasn't set up any subscription tiers yet</p>
      </div>
    );
  }

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {subscriptions.map((sub) => (
        <motion.div
          key={sub.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-indigo-500 transition-all"
        >
          <div 
            className="h-32 relative"
            style={{ backgroundColor: sub.color || '#6366f1' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30" />
            <div className="absolute bottom-4 left-4">
              <h3 className="text-2xl font-bold text-white">{sub.name}</h3>
              <p className="text-white/80 text-sm">Tier {sub.tier}</p>
            </div>
          </div>

          <div className="p-4">
            <div className="mb-4">
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-white">${sub.price}</span>
                <span className="text-zinc-500 text-sm">/month</span>
              </div>
              <p className="text-sm text-zinc-400">{sub.description}</p>
            </div>

            {sub.benefits?.length > 0 && (
              <div className="mb-4 space-y-1">
                {sub.benefits.slice(0, 4).map((benefit, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>{benefit}</span>
                  </div>
                ))}
                {sub.benefits.length > 4 && (
                  <p className="text-xs text-zinc-500 ml-5">+{sub.benefits.length - 4} more benefits</p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-zinc-500 mb-3">
              <span>{sub.subscriber_count || 0} subscribers</span>
            </div>

            <Button
              onClick={() => handleSubscribe(sub)}
              disabled={isProcessing}
              className="w-full bg-indigo-500 hover:bg-indigo-600"
            >
              <Crown className="w-4 h-4 mr-2" />
              Subscribe
            </Button>
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
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0b]">
        <div className="text-center">
          <Zap className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Server Selected</h2>
          <p className="text-zinc-500">Select a server to view shop options</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0a0a0b] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#0a0a0b]/95 backdrop-blur-xl border-b border-zinc-800 z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {activeServer.icon_url && (
              <img src={activeServer.icon_url} alt="" className="w-12 h-12 rounded-lg" />
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">{activeServer.name} Shop</h1>
              <p className="text-sm text-zinc-500">Support and subscribe to unlock perks</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('boost')}
            className={cn(
              "px-6 py-2 rounded-lg font-medium text-sm transition-all",
              activeTab === 'boost'
                ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <Zap className="w-4 h-4 inline mr-2" />
            Server Boosts
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={cn(
              "px-6 py-2 rounded-lg font-medium text-sm transition-all",
              activeTab === 'subscriptions'
                ? "bg-indigo-500 text-white"
                : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            )}
          >
            <Crown className="w-4 h-4 inline mr-2" />
            Subscriptions
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'boost' ? (
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Boost This Server</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Show your support and help unlock server-wide perks. Each boost helps improve the server for everyone!
            </p>
          </div>

          <Button
            onClick={() => setShowBoostCheckout(true)}
            size="lg"
            className="w-full max-w-md mx-auto block bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-lg py-6"
          >
            <Zap className="w-5 h-5 mr-2" />
            Choose Boost Duration
          </Button>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/50 rounded-lg p-4 text-center border border-zinc-800">
              <Zap className="w-8 h-8 text-pink-500 mx-auto mb-2" />
              <h3 className="font-semibold text-white mb-1">Exclusive Badge</h3>
              <p className="text-sm text-zinc-500">Stand out with a special boost badge</p>
            </div>
            <div className="bg-zinc-900/50 rounded-lg p-4 text-center border border-zinc-800">
              <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h3 className="font-semibold text-white mb-1">Support Community</h3>
              <p className="text-sm text-zinc-500">Help unlock server improvements</p>
            </div>
            <div className="bg-zinc-900/50 rounded-lg p-4 text-center border border-zinc-800">
              <Crown className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
              <h3 className="font-semibold text-white mb-1">Special Perks</h3>
              <p className="text-sm text-zinc-500">Access boost-only features</p>
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