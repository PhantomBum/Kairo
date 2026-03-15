import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, Plus, Trash2, Check, Edit, DollarSign, Tag, Crown, Shield, Palette, Hash, Smile, Stamp, GripVertical, ToggleLeft, ToggleRight, TrendingUp, Users, ArrowDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const P = {
  base: '#18181c', surface: '#1e1e23', elevated: '#26262d',
  floating: '#2e2e37', border: '#33333d',
  textPrimary: '#f0eff4', textSecondary: '#a09fad', muted: '#68677a',
  accent: '#2dd4bf', success: '#34d399', danger: '#f87171', warning: '#fbbf24',
};

const ITEM_TYPES = [
  { id: 'role', label: 'Role', icon: Shield, desc: 'Subscription role with permissions' },
  { id: 'color', label: 'Custom Color', icon: Palette, desc: 'Custom username color' },
  { id: 'badge', label: 'Custom Badge', icon: Crown, desc: 'Server-exclusive badge' },
  { id: 'channel', label: 'VIP Channel Access', icon: Hash, desc: 'Access to private channel' },
  { id: 'emoji_pack', label: 'Emoji Pack', icon: Smile, desc: 'Exclusive emoji only buyers can use' },
  { id: 'sticker_pack', label: 'Sticker Pack', icon: Stamp, desc: 'Exclusive stickers only buyers can use' },
];

const TIER_COLORS = ['#2dd4bf', '#34d399', '#fbbf24', '#ff73fa', '#f87171'];

function TierCard({ tier, onEdit, onDelete }) {
  const color = tier.color || TIER_COLORS[0];
  return (
    <div className="p-4 rounded-xl" style={{ background: P.elevated, border: `1px solid ${color}30`, borderLeft: `3px solid ${color}` }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Crown className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold" style={{ color: P.textPrimary }}>{tier.name}</p>
          <p className="text-[13px] font-semibold" style={{ color }}>${tier.price}/mo</p>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(tier)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)]">
            <Edit className="w-3.5 h-3.5" style={{ color: P.muted }} />
          </button>
          <button onClick={() => onDelete(tier)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)]">
            <Trash2 className="w-3.5 h-3.5" style={{ color: P.danger }} />
          </button>
        </div>
      </div>
      {tier.description && <p className="text-[12px] mb-2" style={{ color: P.muted }}>{tier.description}</p>}
      <div className="space-y-1">
        {(tier.items || []).map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[11px]" style={{ color: P.textSecondary }}>
            <Check className="w-3 h-3" style={{ color: P.success }} /> {item}
          </div>
        ))}
      </div>
      <p className="text-[11px] mt-2" style={{ color: P.muted }}>{tier.subscriber_count || 0} subscriber{(tier.subscriber_count || 0) !== 1 ? 's' : ''}</p>
    </div>
  );
}

function ItemCard({ item, onEdit, onDelete }) {
  const type = ITEM_TYPES.find(t => t.id === item.type) || ITEM_TYPES[0];
  const TypeIcon = type.icon;
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: P.base }}>
        <TypeIcon className="w-4 h-4" style={{ color: P.accent }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-medium truncate" style={{ color: P.textPrimary }}>{item.name}</p>
        <p className="text-[11px]" style={{ color: P.muted }}>{type.label} · ${item.price}</p>
      </div>
      <button onClick={() => onDelete(item)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[rgba(255,255,255,0.06)]">
        <Trash2 className="w-3.5 h-3.5" style={{ color: P.danger }} />
      </button>
    </div>
  );
}

function CreateTierForm({ onSave, onCancel, initial }) {
  const [name, setName] = useState(initial?.name || '');
  const [price, setPrice] = useState(initial?.price || '');
  const [color, setColor] = useState(initial?.color || TIER_COLORS[0]);
  const [desc, setDesc] = useState(initial?.description || '');
  const [items, setItems] = useState(initial?.items?.join('\n') || '');

  return (
    <div className="space-y-3 p-4 rounded-xl" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: P.muted }}>Tier Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="VIP"
            className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ background: P.base, color: P.textPrimary, border: `1px solid ${P.border}` }} />
        </div>
        <div className="w-28">
          <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: P.muted }}>Price/mo</label>
          <input value={price} onChange={e => setPrice(e.target.value)} placeholder="4.99" type="number" step="0.01"
            className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ background: P.base, color: P.textPrimary, border: `1px solid ${P.border}` }} />
        </div>
      </div>
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: P.muted }}>Color</label>
        <div className="flex gap-2">
          {TIER_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} className="w-7 h-7 rounded-full transition-all"
              style={{ background: c, border: color === c ? '2px solid white' : '2px solid transparent', transform: color === c ? 'scale(1.15)' : 'scale(1)' }} />
          ))}
        </div>
      </div>
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: P.muted }}>Description</label>
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="What subscribers get..."
          className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ background: P.base, color: P.textPrimary, border: `1px solid ${P.border}` }} />
      </div>
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: P.muted }}>Perks (one per line)</label>
        <textarea value={items} onChange={e => setItems(e.target.value)} placeholder="Custom role color\nVIP channel access\nExclusive emoji" rows={4}
          className="w-full px-3 py-2 rounded-lg text-[13px] outline-none resize-none" style={{ background: P.base, color: P.textPrimary, border: `1px solid ${P.border}` }} />
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-[13px]" style={{ color: P.muted }}>Cancel</button>
        <button onClick={() => { if (!name || !price) return; onSave({ name, price: parseFloat(price), color, description: desc, items: items.split('\n').filter(Boolean) }); }}
          disabled={!name || !price}
          className="px-4 py-2 rounded-lg text-[13px] font-semibold disabled:opacity-30 transition-all hover:brightness-110"
          style={{ background: P.accent, color: '#0d1117' }}>
          {initial ? 'Save Changes' : 'Create Tier'}
        </button>
      </div>
    </div>
  );
}

function CreateItemForm({ onSave, onCancel }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('role');
  const [price, setPrice] = useState('');

  return (
    <div className="space-y-3 p-4 rounded-xl" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: P.muted }}>Item Name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="VIP Badge"
            className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ background: P.base, color: P.textPrimary, border: `1px solid ${P.border}` }} />
        </div>
        <div className="w-28">
          <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: P.muted }}>Price</label>
          <input value={price} onChange={e => setPrice(e.target.value)} placeholder="2.99" type="number" step="0.01"
            className="w-full px-3 py-2 rounded-lg text-[13px] outline-none" style={{ background: P.base, color: P.textPrimary, border: `1px solid ${P.border}` }} />
        </div>
      </div>
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider block mb-1" style={{ color: P.muted }}>Type</label>
        <div className="grid grid-cols-3 gap-1.5">
          {ITEM_TYPES.map(t => (
            <button key={t.id} onClick={() => setType(t.id)} className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] transition-all"
              style={{ background: type === t.id ? `${P.accent}15` : P.base, color: type === t.id ? P.textPrimary : P.muted, border: `1px solid ${type === t.id ? `${P.accent}40` : P.border}` }}>
              <t.icon className="w-3 h-3" /> {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-[13px]" style={{ color: P.muted }}>Cancel</button>
        <button onClick={() => { if (!name || !price) return; onSave({ name, type, price: parseFloat(price) }); }}
          disabled={!name || !price}
          className="px-4 py-2 rounded-lg text-[13px] font-semibold disabled:opacity-30"
          style={{ background: P.accent, color: '#0d1117' }}>
          Add Item
        </button>
      </div>
    </div>
  );
}

export default function ShopTab({ serverId, server }) {
  const [shopEnabled, setShopEnabled] = useState(server?.shop_enabled || false);
  const [tiers, setTiers] = useState([]);
  const [items, setItems] = useState([]);
  const [showCreateTier, setShowCreateTier] = useState(false);
  const [showCreateItem, setShowCreateItem] = useState(false);
  const [editTier, setEditTier] = useState(null);
  const [view, setView] = useState('setup');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!serverId) return;
    base44.entities.ShopTier.filter({ server_id: serverId }).then(setTiers).catch(() => {});
    base44.entities.ShopItem.filter({ server_id: serverId }).then(setItems).catch(() => {});
    base44.entities.ShopTransaction.filter({ server_id: serverId }).then(setTransactions).catch(() => {});
  }, [serverId]);

  const toggleShop = async () => {
    const val = !shopEnabled;
    setShopEnabled(val);
    await base44.entities.Server.update(server.id, { shop_enabled: val });
  };

  const saveTier = async (data) => {
    if (editTier) {
      await base44.entities.ShopTier.update(editTier.id, data);
    } else {
      await base44.entities.ShopTier.create({ ...data, server_id: serverId, position: tiers.length });
    }
    const updated = await base44.entities.ShopTier.filter({ server_id: serverId });
    setTiers(updated);
    setShowCreateTier(false);
    setEditTier(null);
  };

  const deleteTier = async (tier) => {
    if (!confirm(`Delete the "${tier.name}" tier? This can't be undone.`)) return;
    await base44.entities.ShopTier.delete(tier.id);
    setTiers(p => p.filter(t => t.id !== tier.id));
  };

  const saveItem = async (data) => {
    await base44.entities.ShopItem.create({ ...data, server_id: serverId });
    const updated = await base44.entities.ShopItem.filter({ server_id: serverId });
    setItems(updated);
    setShowCreateItem(false);
  };

  const deleteItem = async (item) => {
    if (!confirm(`Delete "${item.name}" from the shop? This can't be undone.`)) return;
    await base44.entities.ShopItem.delete(item.id);
    setItems(p => p.filter(i => i.id !== item.id));
  };

  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const activeSubscribers = tiers.reduce((sum, t) => sum + (t.subscriber_count || 0), 0);
  const mrr = tiers.reduce((sum, t) => sum + ((t.subscriber_count || 0) * (t.price || 0)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-bold" style={{ color: P.textPrimary }}>Server Shop</h3>
          <p className="text-[13px]" style={{ color: P.muted }}>Sell roles, badges, and perks. Kairo takes 8% platform fee.</p>
        </div>
        <button onClick={toggleShop}>
          {shopEnabled ? <ToggleRight className="w-8 h-8" style={{ color: P.success }} /> : <ToggleLeft className="w-8 h-8" style={{ color: P.muted }} />}
        </button>
      </div>

      {!shopEnabled ? (
        <div className="text-center py-12 rounded-xl" style={{ background: P.elevated }}>
          <ShoppingBag className="w-12 h-12 mx-auto mb-3" style={{ color: P.muted, opacity: 0.2 }} />
          <p className="text-[14px] font-medium mb-1" style={{ color: P.textSecondary }}>Shop is disabled</p>
          <p className="text-[12px] mb-4" style={{ color: P.muted }}>Enable the shop to start selling items and subscriptions</p>
          <button onClick={toggleShop} className="px-5 py-2 rounded-xl text-[13px] font-semibold"
            style={{ background: P.accent, color: '#0d1117' }}>Enable Shop</button>
        </div>
      ) : (
        <>
          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: P.elevated }}>
            {[{ id: 'setup', label: 'Setup' }, { id: 'revenue', label: 'Revenue' }].map(t => (
              <button key={t.id} onClick={() => setView(t.id)}
                className="flex-1 py-2 rounded-lg text-[13px] font-medium transition-all"
                style={{ background: view === t.id ? `${P.accent}18` : 'transparent', color: view === t.id ? P.textPrimary : P.muted }}>
                {t.label}
              </button>
            ))}
          </div>

          {view === 'setup' && (
            <>
              {/* Subscription Tiers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: P.muted }}>Subscription Tiers (up to 5)</p>
                  {tiers.length < 5 && !showCreateTier && (
                    <button onClick={() => { setEditTier(null); setShowCreateTier(true); }}
                      className="flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-lg"
                      style={{ background: P.accent, color: '#0d1117' }}>
                      <Plus className="w-3 h-3" /> Add Tier
                    </button>
                  )}
                </div>
                {showCreateTier && <CreateTierForm onSave={saveTier} onCancel={() => { setShowCreateTier(false); setEditTier(null); }} initial={editTier} />}
                <div className="space-y-2">
                  {tiers.sort((a, b) => (a.price || 0) - (b.price || 0)).map(t => (
                    <TierCard key={t.id} tier={t} onEdit={(tier) => { setEditTier(tier); setShowCreateTier(true); }} onDelete={deleteTier} />
                  ))}
                </div>
                {tiers.length === 0 && !showCreateTier && (
                  <div className="text-center py-6 rounded-xl" style={{ background: P.elevated }}>
                    <p className="text-[13px]" style={{ color: P.muted }}>No tiers created yet</p>
                  </div>
                )}
              </div>

              {/* One-time items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: P.muted }}>One-Time Items</p>
                  {!showCreateItem && (
                    <button onClick={() => setShowCreateItem(true)}
                      className="flex items-center gap-1 text-[12px] px-3 py-1.5 rounded-lg"
                      style={{ background: P.elevated, color: P.textSecondary, border: `1px solid ${P.border}` }}>
                      <Plus className="w-3 h-3" /> Add Item
                    </button>
                  )}
                </div>
                {showCreateItem && <CreateItemForm onSave={saveItem} onCancel={() => setShowCreateItem(false)} />}
                <div className="space-y-1.5">
                  {items.map(item => <ItemCard key={item.id} item={item} onEdit={() => setEditingItem(item)} onDelete={deleteItem} />)}
                </div>
              </div>
            </>
          )}

          {view === 'revenue' && (
            <div className="space-y-4">
              {/* Revenue stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Total Revenue', value: `$${(totalRevenue * 0.92).toFixed(2)}`, icon: DollarSign, color: P.success },
                  { label: 'Active Subscribers', value: activeSubscribers, icon: Users, color: P.accent },
                  { label: 'Monthly MRR', value: `$${(mrr * 0.92).toFixed(2)}`, icon: TrendingUp, color: P.warning },
                ].map(stat => (
                  <div key={stat.label} className="p-4 rounded-xl text-center" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
                    <stat.icon className="w-5 h-5 mx-auto mb-1" style={{ color: stat.color }} />
                    <p className="text-[18px] font-bold" style={{ color: P.textPrimary }}>{stat.value}</p>
                    <p className="text-[11px]" style={{ color: P.muted }}>{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* Per-tier breakdown */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: P.muted }}>Per Tier</p>
                <div className="space-y-1.5">
                  {tiers.map(t => (
                    <div key={t.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: P.elevated, border: `1px solid ${P.border}` }}>
                      <div className="w-3 h-8 rounded-full" style={{ background: t.color || P.accent }} />
                      <div className="flex-1">
                        <p className="text-[13px] font-medium" style={{ color: P.textPrimary }}>{t.name}</p>
                        <p className="text-[11px]" style={{ color: P.muted }}>${t.price}/mo · {t.subscriber_count || 0} subscribers</p>
                      </div>
                      <p className="text-[13px] font-bold" style={{ color: P.success }}>${((t.subscriber_count || 0) * (t.price || 0) * 0.92).toFixed(2)}/mo</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent transactions */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: P.muted }}>Recent Transactions</p>
                {transactions.length === 0 ? (
                  <div className="text-center py-6 rounded-xl" style={{ background: P.elevated }}>
                    <p className="text-[13px]" style={{ color: P.muted }}>No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {transactions.slice(0, 20).map(tx => (
                      <div key={tx.id} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: P.elevated }}>
                        <span className="text-[12px] flex-1" style={{ color: P.textSecondary }}>{tx.user_name || 'User'}</span>
                        <span className="text-[12px]" style={{ color: P.muted }}>{tx.item_name || tx.tier_name}</span>
                        <span className="text-[12px] font-semibold" style={{ color: P.success }}>${tx.amount?.toFixed(2)}</span>
                        <span className="text-[11px]" style={{ color: P.muted }}>{tx.created_date ? new Date(tx.created_date).toLocaleDateString() : ''}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
