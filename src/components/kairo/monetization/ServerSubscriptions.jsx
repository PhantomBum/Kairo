import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Edit, Trash, Star, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

function SubscriptionCard({ subscription, onEdit, onDelete }) {
  return (
    <div className="bg-zinc-900 rounded-xl border-2 border-zinc-800 p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white mb-1">{subscription.name}</h3>
          <p className="text-2xl font-bold" style={{ color: subscription.color }}>
            ${subscription.price}
            <span className="text-sm text-zinc-500 font-normal">/month</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(subscription)} className="text-zinc-400 hover:text-white p-2">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(subscription.id)} className="text-zinc-400 hover:text-red-500 p-2">
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-sm text-zinc-400 mb-4">{subscription.description}</p>

      <ul className="space-y-2 mb-4">
        {subscription.benefits?.map((benefit, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-zinc-300">
            <Star className="w-4 h-4 text-yellow-500" />
            {benefit}
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-4 text-xs text-zinc-500 pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          {subscription.subscriber_count || 0} subscribers
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4" />
          ${((subscription.subscriber_count || 0) * subscription.price).toFixed(2)}/month
        </div>
      </div>
    </div>
  );
}

export default function ServerSubscriptions({ server }) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editingSub, setEditingSub] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 4.99,
    tier: 1,
    benefits: [],
    color: '#6366f1'
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['serverSubscriptions', server.id],
    queryFn: () => base44.entities.ServerSubscription.filter({ server_id: server.id })
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ServerSubscription.create({ ...data, server_id: server.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serverSubscriptions'] });
      setShowCreate(false);
      setFormData({ name: '', description: '', price: 4.99, tier: 1, benefits: [], color: '#6366f1' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ServerSubscription.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['serverSubscriptions'] })
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Server Subscriptions</h2>
          <p className="text-sm text-zinc-500">Create paid membership tiers for your server</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-indigo-500 hover:bg-indigo-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Tier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.map((sub) => (
          <SubscriptionCard
            key={sub.id}
            subscription={sub}
            onEdit={setEditingSub}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        ))}
      </div>

      {subscriptions.length === 0 && !showCreate && (
        <div className="text-center py-16 bg-zinc-900/50 rounded-xl border border-zinc-800">
          <DollarSign className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 mb-4">No subscription tiers yet</p>
          <Button onClick={() => setShowCreate(true)} className="bg-indigo-500 hover:bg-indigo-600">
            Create Your First Tier
          </Button>
        </div>
      )}

      {showCreate && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <h3 className="text-lg font-bold text-white mb-4">Create Subscription Tier</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tier Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Silver Member"
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>Price (USD)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What do subscribers get?"
                rows={3}
                className="bg-zinc-800 border-zinc-700 text-white resize-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button onClick={() => createMutation.mutate(formData)} className="bg-indigo-500 hover:bg-indigo-600">
                Create Tier
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}