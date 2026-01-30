import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Link2, Trash2, Power, PowerOff } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CrossAppIndicator from './CrossAppIndicator';

export default function BridgeManager({ server, channels, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'discord',
    kairo_channel_id: '',
    external_channel_id: '',
    external_channel_name: '',
    webhook_url: ''
  });

  const { data: bridges = [] } = useQuery({
    queryKey: ['bridges', server?.id],
    queryFn: () => base44.entities.CrossAppBridge.filter({ kairo_server_id: server.id }),
    enabled: !!server?.id && isOpen
  });

  const createBridgeMutation = useMutation({
    mutationFn: (data) => base44.entities.CrossAppBridge.create({
      ...data,
      kairo_server_id: server.id,
      is_bidirectional: true,
      sync_attachments: true,
      sync_reactions: true,
      is_active: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bridges'] });
      setShowCreateForm(false);
      setFormData({ platform: 'discord', kairo_channel_id: '', external_channel_id: '', external_channel_name: '', webhook_url: '' });
    }
  });

  const toggleBridgeMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.CrossAppBridge.update(id, { is_active: !is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bridges'] })
  });

  const deleteBridgeMutation = useMutation({
    mutationFn: (id) => base44.entities.CrossAppBridge.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bridges'] })
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="bg-zinc-900 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Link2 className="w-5 h-5" />
                Cross-App Bridges
              </h2>
              <p className="text-sm text-zinc-400 mt-1">Connect with Discord, Slack, and more</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!showCreateForm && (
              <Button onClick={() => setShowCreateForm(true)} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create New Bridge
              </Button>
            )}

            {showCreateForm && (
              <div className="bg-zinc-800 p-4 rounded-lg space-y-4">
                <h3 className="font-semibold text-white">New Bridge</h3>
                
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={formData.platform} onValueChange={(v) => setFormData({ ...formData, platform: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discord">Discord</SelectItem>
                      <SelectItem value="slack">Slack</SelectItem>
                      <SelectItem value="telegram">Telegram</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Kairo Channel</Label>
                  <Select value={formData.kairo_channel_id} onValueChange={(v) => setFormData({ ...formData, kairo_channel_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel..." />
                    </SelectTrigger>
                    <SelectContent>
                      {channels.map(ch => (
                        <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>External Channel ID</Label>
                  <Input 
                    value={formData.external_channel_id} 
                    onChange={(e) => setFormData({ ...formData, external_channel_id: e.target.value })}
                    placeholder="e.g., 1234567890123456"
                  />
                </div>

                <div className="space-y-2">
                  <Label>External Channel Name</Label>
                  <Input 
                    value={formData.external_channel_name} 
                    onChange={(e) => setFormData({ ...formData, external_channel_name: e.target.value })}
                    placeholder="e.g., general"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Webhook URL (for sending to external platform)</Label>
                  <Input 
                    value={formData.webhook_url} 
                    onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                    placeholder="https://discord.com/api/webhooks/..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={() => createBridgeMutation.mutate(formData)} disabled={createBridgeMutation.isPending}>
                    Create Bridge
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {bridges.map((bridge) => {
                const channel = channels.find(c => c.id === bridge.kairo_channel_id);
                return (
                  <div key={bridge.id} className="bg-zinc-800 p-4 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CrossAppIndicator platform={bridge.platform} />
                      <div>
                        <p className="text-white font-medium">#{channel?.name || 'Unknown'} ↔ {bridge.external_channel_name}</p>
                        <p className="text-xs text-zinc-400">ID: {bridge.external_channel_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleBridgeMutation.mutate({ id: bridge.id, is_active: bridge.is_active })}
                      >
                        {bridge.is_active ? <Power className="w-4 h-4 text-green-500" /> : <PowerOff className="w-4 h-4 text-zinc-500" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteBridgeMutation.mutate(bridge.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}