import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash2, Crown, DollarSign, Users, X, Zap, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

function CreateSubscriptionModal({ server, onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    benefits: [''],
    color: '#6366f1'
  });

  const handleAddBenefit = () => {
    setFormData({ ...formData, benefits: [...formData.benefits, ''] });
  };

  const handleBenefitChange = (index, value) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData({ ...formData, benefits: newBenefits });
  };

  const handleRemoveBenefit = (index) => {
    const newBenefits = formData.benefits.filter((_, i) => i !== index);
    setFormData({ ...formData, benefits: newBenefits });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validBenefits = formData.benefits.filter(b => b.trim());
    onCreate({
      ...formData,
      price: parseFloat(formData.price),
      benefits: validBenefits
    });
  };

  const presetColors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
    '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900 rounded-xl max-w-2xl w-full p-6 border border-zinc-800 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Create Subscription Tier</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-zinc-400">Tier Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Premium Member, VIP, Supporter"
              className="bg-zinc-800 border-zinc-700 text-white"
              required
            />
          </div>

          <div>
            <Label className="text-zinc-400">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this subscription includes..."
              className="bg-zinc-800 border-zinc-700 text-white resize-none"
              rows={3}
            />
          </div>

          <div>
            <Label className="text-zinc-400">Price (USD/month)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                type="number"
                step="0.01"
                min="0.50"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="9.99"
                className="bg-zinc-800 border-zinc-700 text-white pl-10"
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-zinc-400">Accent Color</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={cn(
                    "w-10 h-10 rounded-lg transition-all",
                    formData.color === color && "ring-2 ring-white ring-offset-2 ring-offset-zinc-900"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <Label className="text-zinc-400">Benefits</Label>
            <div className="space-y-2 mt-2">
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={benefit}
                    onChange={(e) => handleBenefitChange(index, e.target.value)}
                    placeholder="e.g., Access to exclusive channels"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveBenefit(index)}
                    className="border-zinc-700 text-zinc-400 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddBenefit}
                className="w-full border-zinc-700 text-zinc-400 hover:text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Benefit
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1 bg-indigo-500 hover:bg-indigo-600">
              Create Subscription
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="border-zinc-700">
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function BoostTierCard({ tier, boosts, onBoost }) {
  const currentBoosts = boosts.filter(b => b.is_active).length;
  const isUnlocked = currentBoosts >= tier.required;
  
  return (
    <div className={cn(
      "bg-zinc-800/30 rounded-xl border-2 p-6 transition-all",
      isUnlocked ? "border-indigo-500/50 bg-indigo-500/5" : "border-zinc-700"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-lg font-bold text-white">Level {tier.level}</h4>
            {isUnlocked && (
              <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs font-medium rounded-full">
                UNLOCKED
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500">{tier.required} boost{tier.required !== 1 ? 's' : ''} required</p>
        </div>
        <Zap className={cn("w-8 h-8", isUnlocked ? "text-indigo-400" : "text-zinc-600")} />
      </div>
      
      <div className="space-y-2 mb-4">
        {tier.perks.map((perk, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-zinc-400">
            <span className={isUnlocked ? "text-indigo-400" : "text-zinc-600"}>✓</span>
            <span>{perk}</span>
          </div>
        ))}
      </div>
      
      <div className="w-full bg-zinc-700 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-indigo-500 transition-all rounded-full"
          style={{ width: `${Math.min((currentBoosts / tier.required) * 100, 100)}%` }}
        />
      </div>
      <p className="text-xs text-zinc-500 mt-2 text-center">
        {currentBoosts} / {tier.required} boosts
      </p>
    </div>
  );
}

export default function ServerSubscriptionManager({ server, currentUser }) {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('subscriptions'); // 'subscriptions' | 'boosts'

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['serverSubscriptions', server?.id],
    queryFn: () => base44.entities.ServerSubscription.filter({ server_id: server.id }),
    enabled: !!server?.id
  });

  const { data: boosts = [] } = useQuery({
    queryKey: ['serverBoosts', server?.id],
    queryFn: () => base44.entities.ServerBoost.filter({ server_id: server.id }),
    enabled: !!server?.id
  });

  const boostTiers = [
    { level: 1, required: 2, perks: ['Better audio quality', 'Animated server icon', '50 emoji slots'] },
    { level: 2, required: 7, perks: ['HD video quality', 'Server banner', '100 emoji slots', '50MB upload limit'] },
    { level: 3, required: 14, perks: ['4K streaming', 'Custom URL', '250 emoji slots', '100MB upload limit'] }
  ];

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ServerSubscription.create({
      server_id: server.id,
      ...data,
      tier: subscriptions.length + 1,
      is_active: true,
      subscriber_count: 0
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serverSubscriptions'] });
      setShowCreateModal(false);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ServerSubscription.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['serverSubscriptions'] })
  });

  const activeBoosts = boosts.filter(b => b.is_active).length;
  const currentLevel = boostTiers.reduce((level, tier) => 
    activeBoosts >= tier.required ? tier.level : level, 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-zinc-800 pb-4">
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
            activeTab === 'subscriptions' 
              ? "bg-indigo-500 text-white" 
              : "text-zinc-400 hover:text-white hover:bg-zinc-800"
          )}
        >
          <Crown className="w-4 h-4 inline mr-2" />
          Subscriptions
        </button>
        <button
          onClick={() => setActiveTab('boosts')}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all",
            activeTab === 'boosts' 
              ? "bg-indigo-500 text-white" 
              : "text-zinc-400 hover:text-white hover:bg-zinc-800"
          )}
        >
          <Zap className="w-4 h-4 inline mr-2" />
          Server Boosts
        </button>
      </div>

      {activeTab === 'subscriptions' ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Server Subscriptions</h3>
              <p className="text-sm text-zinc-500">Create subscription tiers for your members</p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Tier
            </Button>
          </div>

          {subscriptions.length === 0 ? (
            <div className="text-center py-12 bg-zinc-800/30 rounded-xl">
              <Crown className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">No Subscriptions Yet</h4>
              <p className="text-zinc-500 mb-4">Create subscription tiers to monetize your server</p>
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-500 hover:bg-indigo-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Tier
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptions.map((sub) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="bg-zinc-800/50 rounded-lg border border-zinc-700 overflow-hidden"
                >
                  <div 
                    className="h-20 relative"
                    style={{ backgroundColor: sub.color || '#6366f1' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/30" />
                    <div className="absolute bottom-3 left-4">
                      <h4 className="text-lg font-bold text-white">{sub.name}</h4>
                      <p className="text-white/80 text-xs">Tier {sub.tier}</p>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-2xl font-bold text-white">${sub.price}</span>
                      <span className="text-zinc-500 text-sm">/month</span>
                    </div>

                    {sub.description && (
                      <p className="text-sm text-zinc-400 mb-3">{sub.description}</p>
                    )}

                    {sub.benefits?.length > 0 && (
                      <div className="space-y-1 mb-3">
                        {sub.benefits.slice(0, 3).map((benefit, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                            <span className="text-green-400">✓</span>
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-700">
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Users className="w-3 h-3" />
                        {sub.subscriber_count || 0} subscribers
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm('Delete this subscription tier?')) {
                            deleteMutation.mutate(sub.id);
                          }
                        }}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl p-6 border border-indigo-500/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Server Boost Status</h3>
                <p className="text-sm text-zinc-400">Unlock perks by boosting this server</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{activeBoosts}</div>
                <div className="text-xs text-zinc-500">Active Boosts</div>
              </div>
            </div>
            
            {currentLevel > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                <span className="text-white font-medium">Level {currentLevel} Unlocked!</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {boostTiers.map((tier) => (
              <BoostTierCard key={tier.level} tier={tier} boosts={boosts} />
            ))}
          </div>

          {boosts.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Active Boosters</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {boosts.filter(b => b.is_active).map((boost) => (
                  <div key={boost.id} className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{boost.user_name}</p>
                      <p className="text-xs text-zinc-500">
                        Since {new Date(boost.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {showCreateModal && (
        <CreateSubscriptionModal
          server={server}
          onClose={() => setShowCreateModal(false)}
          onCreate={(data) => createMutation.mutate(data)}
        />
      )}
    </div>
  );
}