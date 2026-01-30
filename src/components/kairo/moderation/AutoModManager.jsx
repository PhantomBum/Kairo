import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Shield, Plus, Trash2, Settings, AlertTriangle, Link, AtSign,
  MessageSquare, Zap, Clock, Ban, UserX, Volume2, Edit, Power
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ruleTypes = [
  { 
    id: 'banned_words', 
    name: 'Banned Words', 
    icon: MessageSquare, 
    color: 'red',
    description: 'Block messages containing specific words or phrases'
  },
  { 
    id: 'spam_detection', 
    name: 'Spam Detection', 
    icon: Zap, 
    color: 'amber',
    description: 'Detect and block repetitive or spam messages'
  },
  { 
    id: 'link_filter', 
    name: 'Link Filter', 
    icon: Link, 
    color: 'blue',
    description: 'Control which links can be posted'
  },
  { 
    id: 'caps_filter', 
    name: 'Caps Filter', 
    icon: Volume2, 
    color: 'purple',
    description: 'Limit excessive caps in messages'
  },
  { 
    id: 'mention_spam', 
    name: 'Mention Spam', 
    icon: AtSign, 
    color: 'emerald',
    description: 'Limit mass mentions in messages'
  },
  { 
    id: 'invite_filter', 
    name: 'Invite Filter', 
    icon: UserX, 
    color: 'pink',
    description: 'Block server invite links'
  },
  { 
    id: 'raid_protection', 
    name: 'Raid Protection', 
    icon: Shield, 
    color: 'indigo',
    description: 'Protect against coordinated attacks'
  }
];

const actionTypes = [
  { id: 'delete', name: 'Delete Message', icon: Trash2 },
  { id: 'warn', name: 'Warn User', icon: AlertTriangle },
  { id: 'timeout', name: 'Timeout User', icon: Clock },
  { id: 'kick', name: 'Kick User', icon: UserX },
  { id: 'ban', name: 'Ban User', icon: Ban }
];

function RuleCard({ rule, onEdit, onToggle, onDelete }) {
  const ruleType = ruleTypes.find(t => t.id === rule.type);
  const Icon = ruleType?.icon || Shield;
  const action = actionTypes.find(a => a.id === rule.action);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-zinc-800/50 rounded-xl p-4 border transition-all",
        rule.is_enabled ? "border-zinc-700" : "border-zinc-800 opacity-60"
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            `bg-${ruleType?.color || 'zinc'}-500/20 text-${ruleType?.color || 'zinc'}-400`
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white">{rule.name}</h3>
            <p className="text-sm text-zinc-500">{ruleType?.description}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-zinc-400 flex items-center gap-1">
                {action && <action.icon className="w-3 h-3" />}
                {action?.name}
              </span>
              {rule.exempt_roles?.length > 0 && (
                <span className="text-xs text-zinc-400">
                  {rule.exempt_roles.length} exempt roles
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={rule.is_enabled}
            onCheckedChange={() => onToggle(rule)}
          />
          <Button variant="ghost" size="icon" onClick={() => onEdit(rule)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-red-400" onClick={() => onDelete(rule)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function CreateRuleModal({ isOpen, onClose, serverId, editRule, roles, channels }) {
  const [name, setName] = useState(editRule?.name || '');
  const [type, setType] = useState(editRule?.type || 'banned_words');
  const [action, setAction] = useState(editRule?.action || 'delete');
  const [actionDuration, setActionDuration] = useState(editRule?.action_duration || 5);
  const [bannedWords, setBannedWords] = useState(editRule?.trigger_config?.banned_words?.join('\n') || '');
  const [maxMentions, setMaxMentions] = useState(editRule?.trigger_config?.max_mentions || 5);
  const [maxCaps, setMaxCaps] = useState(editRule?.trigger_config?.max_caps_percent || 70);
  const [exemptRoles, setExemptRoles] = useState(editRule?.exempt_roles || []);
  const [exemptChannels, setExemptChannels] = useState(editRule?.exempt_channels || []);

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      if (editRule) {
        return base44.entities.AutoModRule.update(editRule.id, data);
      }
      return base44.entities.AutoModRule.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autoModRules', serverId] });
      onClose();
    }
  });

  const handleSave = () => {
    const triggerConfig = {};
    
    if (type === 'banned_words') {
      triggerConfig.banned_words = bannedWords.split('\n').filter(w => w.trim());
    } else if (type === 'mention_spam') {
      triggerConfig.max_mentions = maxMentions;
    } else if (type === 'caps_filter') {
      triggerConfig.max_caps_percent = maxCaps;
    }

    createMutation.mutate({
      server_id: serverId,
      name,
      type,
      action,
      action_duration: action === 'timeout' ? actionDuration : undefined,
      trigger_config: triggerConfig,
      exempt_roles: exemptRoles,
      exempt_channels: exemptChannels,
      is_enabled: true
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {editRule ? 'Edit Rule' : 'Create Auto-Mod Rule'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Rule Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., No Profanity"
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Rule Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {ruleTypes.map(t => (
                  <SelectItem key={t.id} value={t.id}>
                    <div className="flex items-center gap-2">
                      <t.icon className="w-4 h-4" />
                      {t.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type-specific config */}
          {type === 'banned_words' && (
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Banned Words (one per line)</label>
              <Textarea
                value={bannedWords}
                onChange={(e) => setBannedWords(e.target.value)}
                placeholder="badword1&#10;badword2&#10;phrase to block"
                className="bg-zinc-800 border-zinc-700 min-h-[120px]"
              />
            </div>
          )}

          {type === 'mention_spam' && (
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Max Mentions Per Message</label>
              <Input
                type="number"
                value={maxMentions}
                onChange={(e) => setMaxMentions(parseInt(e.target.value))}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
          )}

          {type === 'caps_filter' && (
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Max Caps Percentage</label>
              <Input
                type="number"
                value={maxCaps}
                onChange={(e) => setMaxCaps(parseInt(e.target.value))}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
          )}

          {/* Action */}
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Action</label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="bg-zinc-800 border-zinc-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {actionTypes.map(a => (
                  <SelectItem key={a.id} value={a.id}>
                    <div className="flex items-center gap-2">
                      <a.icon className="w-4 h-4" />
                      {a.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {action === 'timeout' && (
            <div>
              <label className="text-sm text-zinc-400 mb-1 block">Timeout Duration (minutes)</label>
              <Input
                type="number"
                value={actionDuration}
                onChange={(e) => setActionDuration(parseInt(e.target.value))}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
          )}

          <Button 
            onClick={handleSave} 
            disabled={!name || createMutation.isPending}
            className="w-full bg-indigo-500 hover:bg-indigo-600"
          >
            {editRule ? 'Save Changes' : 'Create Rule'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AutoModManager({ server, roles = [], channels = [] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editRule, setEditRule] = useState(null);

  const queryClient = useQueryClient();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['autoModRules', server?.id],
    queryFn: () => base44.entities.AutoModRule.filter({ server_id: server.id }),
    enabled: !!server?.id
  });

  const toggleMutation = useMutation({
    mutationFn: (rule) => base44.entities.AutoModRule.update(rule.id, { is_enabled: !rule.is_enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['autoModRules', server?.id] })
  });

  const deleteMutation = useMutation({
    mutationFn: (rule) => base44.entities.AutoModRule.delete(rule.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['autoModRules', server?.id] })
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-400" />
            Auto-Moderation
          </h2>
          <p className="text-sm text-zinc-500">Automatically moderate your server</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-indigo-500 hover:bg-indigo-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Rules List */}
      {rules.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {rules.map(rule => (
              <RuleCard
                key={rule.id}
                rule={rule}
                onEdit={(r) => { setEditRule(r); setShowCreate(true); }}
                onToggle={(r) => toggleMutation.mutate(r)}
                onDelete={(r) => {
                  if (confirm('Delete this rule?')) deleteMutation.mutate(r);
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16">
          <Shield className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Auto-Mod Rules</h3>
          <p className="text-zinc-500 mb-4">Create rules to automatically moderate your server</p>
          <Button onClick={() => setShowCreate(true)} className="bg-indigo-500 hover:bg-indigo-600">
            <Plus className="w-4 h-4 mr-2" />
            Create First Rule
          </Button>
        </div>
      )}

      {/* Quick Setup */}
      {rules.length === 0 && (
        <div className="bg-zinc-800/50 rounded-xl p-6 border border-zinc-700">
          <h3 className="font-semibold text-white mb-4">Quick Setup</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ruleTypes.slice(0, 6).map(type => (
              <button
                key={type.id}
                onClick={() => {
                  setEditRule({ type: type.id, name: type.name });
                  setShowCreate(true);
                }}
                className="flex items-center gap-3 p-3 bg-zinc-900 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors text-left"
              >
                <type.icon className="w-5 h-5 text-zinc-400" />
                <span className="text-sm text-zinc-300">{type.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <CreateRuleModal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); setEditRule(null); }}
        serverId={server?.id}
        editRule={editRule}
        roles={roles}
        channels={channels}
      />
    </div>
  );
}