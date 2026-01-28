import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Sparkles, Gift, Crown, Palette, Image, Star, Zap, ShoppingBag,
  ChevronRight, Check, X, Search, Filter, Clock, Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const categories = [
  { id: 'all', name: 'All Items', icon: ShoppingBag },
  { id: 'profile_decoration', name: 'Avatar Decorations', icon: Sparkles },
  { id: 'profile_effect', name: 'Profile Effects', icon: Zap },
  { id: 'nameplate', name: 'Nameplates', icon: Crown },
  { id: 'profile_theme', name: 'Profile Themes', icon: Palette },
  { id: 'banner', name: 'Banners', icon: Image },
  { id: 'badge', name: 'Badges', icon: Star },
];

const rarityColors = {
  common: 'from-zinc-400 to-zinc-500',
  uncommon: 'from-emerald-400 to-emerald-500',
  rare: 'from-blue-400 to-blue-500',
  epic: 'from-purple-400 to-purple-500',
  legendary: 'from-amber-400 to-orange-500'
};

const rarityBorders = {
  common: 'border-zinc-600',
  uncommon: 'border-emerald-500/50',
  rare: 'border-blue-500/50',
  epic: 'border-purple-500/50',
  legendary: 'border-amber-500/50'
};

function ShopItem({ item, onPurchase, onGift, owned }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className={cn(
        "relative bg-zinc-900/50 rounded-xl overflow-hidden border-2 transition-all",
        rarityBorders[item.rarity] || 'border-zinc-800',
        owned && "opacity-60"
      )}
    >
      {/* Preview */}
      <div className="aspect-square relative bg-zinc-800/50 p-4 flex items-center justify-center">
        {item.preview_url ? (
          <img 
            src={item.preview_url} 
            alt={item.name}
            className={cn("max-w-full max-h-full object-contain", item.is_animated && "animate-pulse")}
          />
        ) : (
          <div className={cn(
            "w-24 h-24 rounded-full bg-gradient-to-br",
            rarityColors[item.rarity]
          )} />
        )}

        {/* Rarity badge */}
        <div className={cn(
          "absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r",
          rarityColors[item.rarity]
        )}>
          {item.rarity}
        </div>

        {/* Animated badge */}
        {item.is_animated && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/80 text-white">
            Animated
          </div>
        )}

        {/* Limited badge */}
        {item.is_limited && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/80 text-white flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Limited
          </div>
        )}

        {/* Owned checkmark */}
        {owned && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
              <Check className="w-6 h-6 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white mb-1 truncate">{item.name}</h3>
        <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{item.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {item.price === 0 || item.currency === 'free' ? (
              <span className="text-emerald-400 font-semibold">Free</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-semibold text-white">{item.price}</span>
              </>
            )}
          </div>

          {!owned && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onGift?.(item)}
                className="h-8 w-8 p-0 text-zinc-400 hover:text-pink-400"
              >
                <Gift className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => onPurchase?.(item)}
                className="h-8 bg-indigo-500 hover:bg-indigo-600"
              >
                Get
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function GiftModal({ item, isOpen, onClose, onSend, friends = [] }) {
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [message, setMessage] = useState('');

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md mx-4 bg-[#121214] rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="p-6">
          <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6">
            <Gift className="w-12 h-12 text-pink-400 mx-auto mb-3" />
            <h2 className="text-xl font-semibold text-white">Gift {item.name}</h2>
            <p className="text-sm text-zinc-500">Send this item to a friend</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase text-zinc-400 mb-2 block">
                Select Friend
              </label>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {friends.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => setSelectedFriend(friend)}
                    className={cn(
                      "w-full flex items-center gap-3 p-2 rounded-lg transition-colors",
                      selectedFriend?.id === friend.id
                        ? "bg-indigo-500/20 border border-indigo-500/50"
                        : "hover:bg-zinc-800"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-zinc-700 overflow-hidden">
                      {friend.friend_avatar ? (
                        <img src={friend.friend_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm">
                          {friend.friend_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-white">{friend.friend_name}</span>
                    {selectedFriend?.id === friend.id && (
                      <Check className="w-4 h-4 text-indigo-400 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase text-zinc-400 mb-2 block">
                Gift Message (Optional)
              </label>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message..."
                className="bg-zinc-900 border-zinc-800 text-white"
              />
            </div>

            <Button
              onClick={() => onSend?.(selectedFriend, message)}
              disabled={!selectedFriend}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
              <Gift className="w-4 h-4 mr-2" />
              Send Gift
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ShopPage({ currentUser, userCredits, friends = [] }) {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [giftItem, setGiftItem] = useState(null);

  const { data: shopItems = [] } = useQuery({
    queryKey: ['shopItems'],
    queryFn: () => base44.entities.Shop.list()
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['userInventory', currentUser?.id],
    queryFn: () => base44.entities.UserInventory.filter({ user_id: currentUser?.id }),
    enabled: !!currentUser?.id
  });

  const purchaseMutation = useMutation({
    mutationFn: async (item) => {
      // Add to inventory
      await base44.entities.UserInventory.create({
        user_id: currentUser.id,
        user_email: currentUser.email,
        item_id: item.id,
        item_type: item.type,
        item_name: item.name,
        acquired_at: new Date().toISOString()
      });

      // Deduct credits if needed
      if (item.price > 0 && userCredits) {
        await base44.entities.UserCredits.update(userCredits.id, {
          balance: userCredits.balance - item.price,
          lifetime_spent: (userCredits.lifetime_spent || 0) + item.price
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userInventory'] });
      queryClient.invalidateQueries({ queryKey: ['userCredits'] });
    }
  });

  const giftMutation = useMutation({
    mutationFn: async ({ item, friend, message }) => {
      await base44.entities.UserInventory.create({
        user_id: friend.friend_id,
        user_email: friend.friend_email,
        item_id: item.id,
        item_type: item.type,
        item_name: item.name,
        acquired_at: new Date().toISOString(),
        gifted_by: currentUser.id,
        gift_message: message
      });

      if (item.price > 0 && userCredits) {
        await base44.entities.UserCredits.update(userCredits.id, {
          balance: userCredits.balance - item.price,
          lifetime_spent: (userCredits.lifetime_spent || 0) + item.price
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userCredits'] });
      setGiftItem(null);
    }
  });

  const ownedItemIds = inventory.map(i => i.item_id);

  const filteredItems = shopItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory;
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f11] overflow-hidden">
      {/* Header */}
      <div className="relative">
        <div 
          className="h-40 relative"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f59e0b 100%)'
          }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0f0f11] via-[#0f0f11]/80 to-transparent">
          <div className="max-w-6xl mx-auto flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <ShoppingBag className="w-8 h-8" />
                Kairo Shop
              </h1>
              <p className="text-zinc-400">Customize your profile with unique items</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/80 rounded-lg border border-zinc-800">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="font-semibold text-white">{userCredits?.balance || 0}</span>
                <span className="text-zinc-500">credits</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 flex-shrink-0 border-r border-zinc-800/50 p-4 overflow-y-auto">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="pl-9 bg-zinc-900 border-zinc-800 text-white"
            />
          </div>

          <nav className="space-y-1">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  selectedCategory === cat.id
                    ? "bg-indigo-500/20 text-white border border-indigo-500/50"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                )}
              >
                <cat.icon className="w-5 h-5" />
                <span className="text-sm">{cat.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Items grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <ShopItem
                  key={item.id}
                  item={item}
                  owned={ownedItemIds.includes(item.id)}
                  onPurchase={() => purchaseMutation.mutate(item)}
                  onGift={() => setGiftItem(item)}
                />
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-zinc-400">No items found</h3>
                <p className="text-sm">Check back later for new items!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {giftItem && (
          <GiftModal
            item={giftItem}
            isOpen={!!giftItem}
            onClose={() => setGiftItem(null)}
            onSend={(friend, message) => giftMutation.mutate({ item: giftItem, friend, message })}
            friends={friends}
          />
        )}
      </AnimatePresence>
    </div>
  );
}