import React, { useState, useEffect } from 'react';
import { ShoppingBag, Crown, Check, Star, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', success: '#34d399', danger: '#f87171',
};

function TierStorefrontCard({ tier, owned, onBuy, index }) {
  const color = tier.color || P.accent;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
      className="rounded-2xl overflow-hidden flex flex-col" style={{ background: P.elevated, border: `1px solid ${color}30` }}>
      <div className="h-2" style={{ background: color }} />
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: `${color}15` }}>
            <Crown className="w-6 h-6" style={{ color }} />
          </div>
          <div>
            <h3 className="text-[18px] font-bold" style={{ color: P.textPrimary }}>{tier.name}</h3>
            <p className="text-[15px] font-semibold" style={{ color }}>${tier.price}<span className="text-[11px] font-normal" style={{ color: P.muted }}>/month</span></p>
          </div>
        </div>
        {tier.description && <p className="text-[13px] mb-4 leading-relaxed" style={{ color: P.muted }}>{tier.description}</p>}
        <div className="space-y-2 flex-1">
          {(tier.items || []).map((perk, i) => (
            <div key={i} className="flex items-center gap-2">
              <Check className="w-4 h-4 flex-shrink-0" style={{ color: P.success }} />
              <span className="text-[13px]" style={{ color: P.textSecondary }}>{perk}</span>
            </div>
          ))}
        </div>
        <button onClick={() => onBuy(tier)} disabled={owned}
          className="w-full mt-4 py-2.5 rounded-xl text-[14px] font-semibold transition-all disabled:opacity-50"
          style={{ background: owned ? P.base : color, color: owned ? P.muted : '#fff' }}>
          {owned ? '✓ Subscribed' : 'Subscribe'}
        </button>
      </div>
    </motion.div>
  );
}

function ItemStorefrontCard({ item, owned, onBuy }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: P.base }}>
        <Star className="w-5 h-5" style={{ color: P.accent }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold" style={{ color: P.textPrimary }}>{item.name}</p>
        <p className="text-[12px]" style={{ color: P.muted }}>${item.price} · One-time</p>
      </div>
      <button onClick={() => onBuy(item)} disabled={owned}
        className="px-4 py-2 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-50"
        style={{ background: owned ? P.base : P.accent, color: owned ? P.muted : '#fff' }}>
        {owned ? 'Owned' : 'Buy'}
      </button>
    </div>
  );
}

export default function ServerShopView({ server, currentUserId, onClose }) {
  const [tiers, setTiers] = useState([]);
  const [items, setItems] = useState([]);
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    if (!server?.id) return;
    base44.entities.ShopTier.filter({ server_id: server.id }).then(setTiers).catch(() => {});
    base44.entities.ShopItem.filter({ server_id: server.id }).then(setItems).catch(() => {});
    base44.entities.ShopTransaction.filter({ server_id: server.id, user_id: currentUserId }).then(setPurchases).catch(() => {});
  }, [server?.id, currentUserId]);

  const purchasedTierIds = new Set(purchases.filter(p => p.tier_id).map(p => p.tier_id));
  const purchasedItemIds = new Set(purchases.filter(p => p.item_id).map(p => p.item_id));

  const handleBuyTier = async (tier) => {
    await base44.entities.ShopTransaction.create({
      server_id: server.id, user_id: currentUserId, tier_id: tier.id,
      tier_name: tier.name, amount: tier.price, type: 'subscription',
    });
    await base44.entities.ShopTier.update(tier.id, { subscriber_count: (tier.subscriber_count || 0) + 1 });
    setPurchases(prev => [...prev, { tier_id: tier.id }]);
  };

  const handleBuyItem = async (item) => {
    await base44.entities.ShopTransaction.create({
      server_id: server.id, user_id: currentUserId, item_id: item.id,
      item_name: item.name, amount: item.price, type: 'one_time',
    });
    setPurchases(prev => [...prev, { item_id: item.id }]);
  };

  const sortedTiers = [...tiers].sort((a, b) => (a.price || 0) - (b.price || 0));

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none">
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: `${P.accent}15` }}>
            <ShoppingBag className="w-8 h-8" style={{ color: P.accent }} />
          </div>
          <h2 className="text-[22px] font-bold mb-1" style={{ color: P.textPrimary }}>{server?.name} Shop</h2>
          <p className="text-[14px]" style={{ color: P.muted }}>Support the server and unlock exclusive perks</p>
        </div>

        {/* Tiers */}
        {sortedTiers.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-4 text-center" style={{ color: P.muted }}>Subscription Tiers</p>
            <div className={`grid gap-4 ${sortedTiers.length === 1 ? 'max-w-sm mx-auto' : sortedTiers.length === 2 ? 'grid-cols-2 max-w-xl mx-auto' : 'grid-cols-3'}`}>
              {sortedTiers.map((tier, i) => (
                <TierStorefrontCard key={tier.id} tier={tier} index={i}
                  owned={purchasedTierIds.has(tier.id)} onBuy={handleBuyTier} />
              ))}
            </div>
          </div>
        )}

        {/* One-time items */}
        {items.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-3 text-center" style={{ color: P.muted }}>One-Time Items</p>
            <div className="max-w-md mx-auto space-y-2">
              {items.map(item => (
                <ItemStorefrontCard key={item.id} item={item}
                  owned={purchasedItemIds.has(item.id)} onBuy={handleBuyItem} />
              ))}
            </div>
          </div>
        )}

        {sortedTiers.length === 0 && items.length === 0 && (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={{ color: P.muted, opacity: 0.15 }} />
            <p className="text-[14px] font-medium" style={{ color: P.textSecondary }}>Shop is empty</p>
            <p className="text-[12px]" style={{ color: P.muted }}>The server owner hasn't added any items yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
