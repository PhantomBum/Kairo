import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Link2, Trash2, Power, PowerOff, MessageSquare, ExternalLink, Copy, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

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
  ),
  whatsapp: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
};

const platformColors = {
  discord: 'text-[#5865F2]',
  slack: 'text-[#4A154B]',
  telegram: 'text-[#0088cc]',
  whatsapp: 'text-[#25D366]'
};

export default function DMBridgeManager({ currentUser, conversations, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    platform: 'discord',
    conversation_id: '',
    external_chat_id: '',
    webhook_url: '',
    sync_attachments: true,
    sync_reactions: true
  });

  const { data: dmBridges = [] } = useQuery({
    queryKey: ['dmBridges', currentUser?.id],
    queryFn: () => base44.entities.CrossAppBridge.filter({ 
      created_by: currentUser?.email,
      bridge_type: 'dm'
    }),
    enabled: !!currentUser?.id && isOpen
  });

  const createBridgeMutation = useMutation({
    mutationFn: (data) => base44.entities.CrossAppBridge.create({
      ...data,
      bridge_type: 'dm',
      user_id: currentUser.id,
      is_bidirectional: true,
      is_active: true
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dmBridges'] });
      setShowCreateForm(false);
      setFormData({ platform: 'discord', conversation_id: '', external_chat_id: '', webhook_url: '', sync_attachments: true, sync_reactions: true });
    }
  });

  const toggleBridgeMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.CrossAppBridge.update(id, { is_active: !is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dmBridges'] })
  });

  const deleteBridgeMutation = useMutation({
    mutationFn: (id) => base44.entities.CrossAppBridge.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dmBridges'] })
  });

  const copyWebhook = () => {
    navigator.clipboard.writeText(`${window.location.origin}/api/dm-bridge`);
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
          className="bg-[#0f0f11] rounded-2xl border border-white/10 max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-500" />
                DM Bridges
              </h2>
              <p className="text-sm text-zinc-500 mt-1">Connect your DMs with Discord, Slack, Telegram & more</p>
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
                  {window.location.origin}/api/dm-bridge
                </code>
                <Button size="sm" variant="ghost" onClick={copyWebhook}>
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-zinc-600 mt-2">Use this URL to receive messages from external platforms</p>
            </div>

            {!showCreateForm && (
              <Button onClick={() => setShowCreateForm(true)} className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Create DM Bridge
              </Button>
            )}

            {showCreateForm && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 border border-white/5 p-5 rounded-xl space-y-4"
              >
                <h3 className="font-semibold text-white">New DM Bridge</h3>
                
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
                      <SelectItem value="whatsapp">
                        <div className="flex items-center gap-2">
                          <span className="text-[#25D366]">{platformIcons.whatsapp}</span>
                          WhatsApp
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">Kairo Conversation</Label>
                  <Select value={formData.conversation_id} onValueChange={(v) => setFormData({ ...formData, conversation_id: v })}>
                    <SelectTrigger className="bg-black/50 border-white/10">
                      <SelectValue placeholder="Select conversation..." />
                    </SelectTrigger>
                    <SelectContent>
                      {conversations.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name || c.participants?.[0]?.user_name || 'Unknown'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400">External Chat ID</Label>
                  <Input 
                    value={formData.external_chat_id} 
                    onChange={(e) => setFormData({ ...formData, external_chat_id: e.target.value })}
                    placeholder="e.g., Discord channel ID or Telegram chat ID"
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

                <div className="flex items-center justify-between py-2">
                  <Label className="text-zinc-400">Sync Attachments</Label>
                  <Switch 
                    checked={formData.sync_attachments} 
                    onCheckedChange={(v) => setFormData({ ...formData, sync_attachments: v })} 
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <Label className="text-zinc-400">Sync Reactions</Label>
                  <Switch 
                    checked={formData.sync_reactions} 
                    onCheckedChange={(v) => setFormData({ ...formData, sync_reactions: v })} 
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={() => createBridgeMutation.mutate(formData)} 
                    disabled={createBridgeMutation.isPending || !formData.conversation_id}
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
              {dmBridges.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <Link2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>No DM bridges configured yet</p>
                </div>
              ) : (
                dmBridges.map((bridge) => {
                  const conversation = conversations.find(c => c.id === bridge.conversation_id);
                  return (
                    <div key={bridge.id} className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg bg-white/5", platformColors[bridge.platform])}>
                          {platformIcons[bridge.platform]}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {conversation?.name || conversation?.participants?.[0]?.user_name || 'Unknown'} 
                            <span className="text-zinc-500 mx-2">↔</span>
                            {bridge.platform}
                          </p>
                          <p className="text-xs text-zinc-500">ID: {bridge.external_chat_id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
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