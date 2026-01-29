import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Webhook, Plus, Trash2, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';

export default function WebhookManager({ server, channels, currentUser }) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState(null);

  const [newWebhook, setNewWebhook] = useState({
    name: '',
    channel_id: '',
    avatar_url: ''
  });

  const { data: webhooks = [] } = useQuery({
    queryKey: ['webhooks', server.id],
    queryFn: () => base44.entities.ServerWebhook.filter({ server_id: server.id })
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const webhook = await base44.entities.ServerWebhook.create({
        ...data,
        server_id: server.id,
        created_by: currentUser.id,
        webhook_url: `https://kairo-8406c21a.base44.app/api/webhooks/${crypto.randomUUID()}`
      });
      return webhook;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setShowCreate(false);
      setNewWebhook({ name: '', channel_id: '', avatar_url: '' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ServerWebhook.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['webhooks'] })
  });

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Webhooks</h2>
          <p className="text-sm text-zinc-500">Integrate external services with your server</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="bg-indigo-500 hover:bg-indigo-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Webhook
        </Button>
      </div>

      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-4"
        >
          <div>
            <Label className="text-white mb-2">Webhook Name</Label>
            <Input
              placeholder="My Bot"
              value={newWebhook.name}
              onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div>
            <Label className="text-white mb-2">Channel</Label>
            <Select value={newWebhook.channel_id} onValueChange={(v) => setNewWebhook({ ...newWebhook, channel_id: v })}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                <SelectValue placeholder="Select channel" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {channels.filter(c => c.type === 'text').map((ch) => (
                  <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white mb-2">Avatar URL (optional)</Label>
            <Input
              placeholder="https://..."
              value={newWebhook.avatar_url}
              onChange={(e) => setNewWebhook({ ...newWebhook, avatar_url: e.target.value })}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button 
              onClick={() => createMutation.mutate(newWebhook)}
              disabled={!newWebhook.name || !newWebhook.channel_id || createMutation.isPending}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              Create
            </Button>
          </div>
        </motion.div>
      )}

      <div className="space-y-3">
        {webhooks.map((webhook) => (
          <div
            key={webhook.id}
            className="bg-zinc-900 rounded-lg border border-zinc-800 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                  {webhook.avatar_url ? (
                    <img src={webhook.avatar_url} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <Webhook className="w-5 h-5 text-zinc-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{webhook.name}</h3>
                  <p className="text-xs text-zinc-500">
                    #{channels.find(c => c.id === webhook.channel_id)?.name || 'unknown'}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => deleteMutation.mutate(webhook.id)}
                className="text-red-500 border-red-500/50 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-zinc-950 rounded border border-zinc-800 p-3 flex items-center justify-between">
              <code className="text-xs text-zinc-400 truncate flex-1 mr-2">{webhook.webhook_url}</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy(webhook.webhook_url, webhook.id)}
                className="flex-shrink-0"
              >
                {copied === webhook.id ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        ))}

        {webhooks.length === 0 && !showCreate && (
          <div className="text-center py-12 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <Webhook className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500">No webhooks yet</p>
            <p className="text-sm text-zinc-600 mt-1">Create one to integrate external services</p>
          </div>
        )}
      </div>
    </div>
  );
}