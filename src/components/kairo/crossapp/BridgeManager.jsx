import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Link2, Trash2, Power, PowerOff, Copy, Check, ExternalLink, Settings2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import CrossAppIndicator from './CrossAppIndicator';

const platformIcons = {
  discord: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  ),
  slack: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
    </svg>
  ),
  telegram: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  )
};

const platformColors = {
  discord: 'text-[#5865F2] bg-[#5865F2]/10',
  slack: 'text-[#4A154B] bg-[#4A154B]/10',
  telegram: 'text-[#0088cc] bg-[#0088cc]/10'
};

export default function BridgeManager({ server, channels, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'discord',
    kairo_channel_id: '',
    external_channel_id: '',
    external_channel_name: '',
    webhook_url: '',
    is_bidirectional: true,
    sync_attachments: true,
    sync_reactions: true
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

  const copyWebhook = () => {
    navigator.clipboard.writeText(`${window.location.origin}/api/discordBridge`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-[#0f0f11] rounded-2xl border border-white/10 max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Link2 className="w-5 h-5 text-emerald-500" />
                Cross-App Bridges
              </h2>
              <p className="text-sm text-zinc-500 mt-1">Connect channels with Discord, Slack, Telegram & more</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Webhook URL for receiving */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Incoming Webhook URL</Label>
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 bg-black/50 px-3 py-2 rounded-lg text-sm text-emerald-400 font-mono truncate">
                  {window.location.origin}/api/discordBridge
                </code>
                <Button size="sm" variant="ghost" onClick={copyWebhook}>
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-zinc-600 mt-2">Use this URL in Discord/Slack/Telegram bot settings</p>
            </div>

            {!showCreateForm && (
              <Button onClick={() => setShowCreateForm(true)} className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Create New Bridge
              </Button>
            )}

            {showCreateForm && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 border border-white/5 p-5 rounded-xl space-y-4"
              >
                <h3 className="font-semibold text-white">New Bridge</h3>
                
                <div className="space-y-2">
                  <Label className="text-zinc-400">Platform</Label>
                  <Select value={formData.platform} onValueChange={(v) => setFormData({ ...formData, platform: v })}>
                    <SelectTrigger className="bg-black/50 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discord">
                        <div className="flex items-center gap-2">
                          <span className="text-[#5865F2]">{platformIcons.discord}</span>
                          Discord
                        </div>
                      </SelectItem>
                      <SelectItem value="slack">
                        <div className="flex items-center gap-2">
                          <span className="text-[#4A154B]">{platformIcons.slack}</span>
                          Slack
                        </div>
                      </SelectItem>
                      <SelectItem value="telegram">
                        <div className="flex items-center gap-2">
                          <span className="text-[#0088cc]">{platformIcons.telegram}</span>
                          Telegram
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">Kairo Channel</Label>
                  <Select value={formData.kairo_channel_id} onValueChange={(v) => setFormData({ ...formData, kairo_channel_id: v })}>
                    <SelectTrigger className="bg-black/50 border-white/10">
                      <SelectValue placeholder="Select channel..." />
                    </SelectTrigger>
                    <SelectContent>
                      {channels.filter(c => c.type === 'text').map(ch => (
                        <SelectItem key={ch.id} value={ch.id}>#{ch.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">External Channel ID</Label>
                  <Input 
                    value={formData.external_channel_id} 
                    onChange={(e) => setFormData({ ...formData, external_channel_id: e.target.value })}
                    placeholder="e.g., 1234567890123456"
                    className="bg-black/50 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">External Channel Name</Label>
                  <Input 
                    value={formData.external_channel_name} 
                    onChange={(e) => setFormData({ ...formData, external_channel_name: e.target.value })}
                    placeholder="e.g., general"
                    className="bg-black/50 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">Outgoing Webhook URL</Label>
                  <Input 
                    value={formData.webhook_url} 
                    onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="bg-black/50 border-white/10"
                  />
                  <p className="text-xs text-zinc-600">Webhook for sending messages TO the external platform</p>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-zinc-400 text-sm">Bidirectional</Label>
                    <Switch 
                      checked={formData.is_bidirectional} 
                      onCheckedChange={(v) => setFormData({ ...formData, is_bidirectional: v })} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-zinc-400 text-sm">Attachments</Label>
                    <Switch 
                      checked={formData.sync_attachments} 
                      onCheckedChange={(v) => setFormData({ ...formData, sync_attachments: v })} 
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-zinc-400 text-sm">Reactions</Label>
                    <Switch 
                      checked={formData.sync_reactions} 
                      onCheckedChange={(v) => setFormData({ ...formData, sync_reactions: v })} 
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => createBridgeMutation.mutate(formData)} 
                    disabled={createBridgeMutation.isPending || !formData.kairo_channel_id}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Create Bridge
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Existing bridges */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Active Bridges</h3>
              {bridges.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <Link2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No bridges configured yet</p>
                  <p className="text-xs mt-1">Create a bridge to sync messages across platforms</p>
                </div>
              ) : (
                bridges.map((bridge) => {
                  const channel = channels.find(c => c.id === bridge.kairo_channel_id);
                  return (
                    <div key={bridge.id} className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", platformColors[bridge.platform])}>
                          {platformIcons[bridge.platform]}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            #{channel?.name || 'Unknown'} 
                            <span className="text-zinc-500 mx-2">↔</span>
                            {bridge.external_channel_name || bridge.platform}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            <span>ID: {bridge.external_channel_id}</span>
                            {bridge.is_bidirectional && <span className="px-1.5 py-0.5 bg-white/5 rounded">Bidirectional</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleBridgeMutation.mutate({ id: bridge.id, is_active: bridge.is_active })}
                          className="h-8 w-8 p-0"
                        >
                          {bridge.is_active ? 
                            <Power className="w-4 h-4 text-emerald-500" /> : 
                            <PowerOff className="w-4 h-4 text-zinc-500" />
                          }
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteBridgeMutation.mutate(bridge.id)}
                          className="h-8 w-8 p-0 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}