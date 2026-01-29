import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ShoppingBag, Zap, Crown, Sparkles, Check, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ServerBoostCheckout from '../monetization/ServerBoostCheckout';

export default function ShopIntegrated({ currentUser, activeServer }) {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = useState(null);
  const [showBoostCheckout, setShowBoostCheckout] = useState(false);

  const { data: shopItems = [] } = useQuery({
    queryKey: ['shopItems'],
    queryFn: () => base44.entities.Shop.list()
  });

  const { data: userCredits } = useQuery({
    queryKey: ['userCredits', currentUser?.email],
    queryFn: () => base44.entities.UserCredits.filter({ user_email: currentUser?.email }).then(r => r[0])
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['userInventory', currentUser?.id],
    queryFn: () => base44.entities.UserInventory.filter({ user_id: currentUser?.id })
  });

  const purchaseMutation = useMutation({
    mutationFn: async (item) => {
      if (userCredits.balance < item.price) {
        throw new Error('Insufficient credits');
      }

      await base44.entities.UserCredits.update(userCredits.id, {
        balance: userCredits.balance - item.price,
        lifetime_spent: (userCredits.lifetime_spent || 0) + item.price
      });

      return base44.entities.UserInventory.create({
        user_id: currentUser.id,
        user_email: currentUser.email,
        item_id: item.id,
        item_type: item.type,
        item_name: item.name
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCredits'] });
      queryClient.invalidateQueries({ queryKey: ['userInventory'] });
      setSelectedItem(null);
    }
  });

  const categories = ['all', 'profile_decoration', 'badge', 'banner', 'nameplate'];
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredItems = activeCategory === 'all' 
    ? shopItems 
    : shopItems.filter(item => item.type === activeCategory);

  return (
    <div className="flex-1 bg-[#0a0a0b] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-[#0a0a0b]/95 backdrop-blur-xl border-b border-zinc-800 z-10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-indigo-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">Kairo Shop</h1>
              <p className="text-sm text-zinc-500">Customize your profile and support servers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-zinc-900 rounded-lg border border-zinc-800">
              <span className="text-sm text-zinc-400">Balance:</span>
              <span className="ml-2 font-bold text-yellow-500">{userCredits?.balance || 0} credits</span>
            </div>
            {activeServer && (
              <Button 
                onClick={() => setShowBoostCheckout(true)}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
              >
                <Zap className="w-4 h-4 mr-2" />
                Boost Server
              </Button>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium text-sm transition-all",
                activeCategory === cat
                  ? "bg-indigo-500 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white"
              )}
            >
              {cat.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item) => {
          const owned = inventory.some(i => i.item_id === item.id);
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-indigo-500 transition-all group"
            >
              <div className="h-40 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 relative overflow-hidden">
                {item.preview_url && (
                  <img src={item.preview_url} alt={item.name} className="w-full h-full object-cover" />
                )}
                {owned && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Owned
                  </div>
                )}
                {item.is_limited && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    Limited
                  </div>
                )}
              </div>

              <div className="p-4">
                <h3 className="font-bold text-white mb-1">{item.name}</h3>
                <p className="text-xs text-zinc-500 mb-3 line-clamp-2">{item.description}</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-yellow-500">{item.price}</span>
                    <span className="text-xs text-zinc-500">credits</span>
                  </div>

                  {owned ? (
                    <Button size="sm" variant="outline" className="bg-zinc-800 border-zinc-700" disabled>
                      Owned
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => purchaseMutation.mutate(item)}
                      disabled={purchaseMutation.isPending || userCredits?.balance < item.price}
                      className="bg-indigo-500 hover:bg-indigo-600"
                    >
                      <ShoppingBag className="w-4 h-4 mr-1" />
                      Buy
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {showBoostCheckout && activeServer && (
        <ServerBoostCheckout
          server={activeServer}
          currentUser={currentUser}
          onClose={() => setShowBoostCheckout(false)}
        />
      )}
    </div>
  );
}