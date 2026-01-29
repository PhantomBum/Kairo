import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Shield, Ban, Clock, Trash2, Eye, EyeOff, AlertTriangle,
  Search, Filter, ChevronDown, X, MessageSquare, Volume2,
  Users, Settings, FileText, Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';

// Quick moderation action buttons for inline use
export function QuickModActions({ member, serverId, onAction }) {
  const queryClient = useQueryClient();

  const timeoutMutation = useMutation({
    mutationFn: async (duration) => {
      const until = new Date(Date.now() + duration * 60 * 1000);
      await base44.entities.ServerMember.update(member.id, {
        timeout_until: until.toISOString()
      });
      await base44.entities.AuditLog.create({
        server_id: serverId,
        action_type: 'member_timeout',
        actor_id: 'current', // Would be actual user
        target_id: member.user_id,
        target_type: 'user',
        target_name: member.nickname || member.user_email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', serverId] });
      onAction?.('timeout');
    }
  });

  const kickMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.ServerMember.delete(member.id);
      await base44.entities.AuditLog.create({
        server_id: serverId,
        action_type: 'member_kick',
        actor_id: 'current',
        target_id: member.user_id,
        target_type: 'user',
        target_name: member.nickname || member.user_email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', serverId] });
      onAction?.('kick');
    }
  });

  const banMutation = useMutation({
    mutationFn: async (reason) => {
      await base44.entities.ServerMember.update(member.id, {
        is_banned: true,
        ban_reason: reason
      });
      await base44.entities.AuditLog.create({
        server_id: serverId,
        action_type: 'member_ban',
        actor_id: 'current',
        target_id: member.user_id,
        target_type: 'user',
        target_name: member.nickname || member.user_email,
        reason
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', serverId] });
      onAction?.('ban');
    }
  });

  return (
    <div className="flex items-center gap-1">
      <Select onValueChange={(v) => timeoutMutation.mutate(parseInt(v))}>
        <SelectTrigger className="w-auto h-7 px-2 bg-zinc-800 border-zinc-700 text-xs">
          <Clock className="w-3 h-3 mr-1" />
          Timeout
        </SelectTrigger>
        <SelectContent className="bg-zinc-900 border-zinc-800">
          <SelectItem value="1">1 minute</SelectItem>
          <SelectItem value="5">5 minutes</SelectItem>
          <SelectItem value="10">10 minutes</SelectItem>
          <SelectItem value="60">1 hour</SelectItem>
          <SelectItem value="1440">1 day</SelectItem>
          <SelectItem value="10080">1 week</SelectItem>
        </SelectContent>
      </Select>

      <Button 
        size="sm" 
        variant="ghost" 
        onClick={() => kickMutation.mutate()}
        className="h-7 px-2 text-amber-400 hover:bg-amber-500/20"
      >
        Kick
      </Button>

      <Button 
        size="sm" 
        variant="ghost" 
        onClick={() => banMutation.mutate('No reason provided')}
        className="h-7 px-2 text-red-400 hover:bg-red-500/20"
      >
        <Ban className="w-3 h-3" />
      </Button>
    </div>
  );
}

// Bulk message deletion
export function BulkDeleteMessages({ channelId, onComplete }) {
  const [count, setCount] = useState(10);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    setIsDeleting(true);
    const messages = await base44.entities.Message.filter(
      { channel_id: channelId },
      '-created_date',
      count
    );

    for (const msg of messages) {
      await base44.entities.Message.update(msg.id, { is_deleted: true });
    }

    queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
    setIsDeleting(false);
    onComplete?.();
  };

  return (
    <div className="p-4 bg-zinc-800/30 rounded-lg">
      <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
        <Trash2 className="w-4 h-4 text-red-400" />
        Bulk Delete Messages
      </h4>
      <div className="flex items-center gap-3">
        <Select value={count.toString()} onValueChange={(v) => setCount(parseInt(v))}>
          <SelectTrigger className="w-32 bg-zinc-900 border-zinc-800">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-800">
            <SelectItem value="10">Last 10</SelectItem>
            <SelectItem value="25">Last 25</SelectItem>
            <SelectItem value="50">Last 50</SelectItem>
            <SelectItem value="100">Last 100</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          onClick={handleDelete}
          disabled={isDeleting}
          className="bg-red-500 hover:bg-red-600"
        >
          {isDeleting ? 'Deleting...' : 'Delete Messages'}
        </Button>
      </div>
    </div>
  );
}

// Audit Log Viewer
export function AuditLogViewer({ serverId }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['auditLogs', serverId, filter],
    queryFn: () => {
      const query = { server_id: serverId };
      if (filter !== 'all') {
        query.action_type = filter;
      }
      return base44.entities.AuditLog.filter(query, '-created_date', 100);
    },
    enabled: !!serverId
  });

  const actionIcons = {
    member_join: Users,
    member_leave: Users,
    member_kick: Users,
    member_ban: Ban,
    member_timeout: Clock,
    channel_create: MessageSquare,
    channel_update: MessageSquare,
    channel_delete: MessageSquare,
    message_delete: Trash2,
    role_create: Shield,
    role_update: Shield,
    server_update: Settings
  };

  const actionColors = {
    member_join: 'text-emerald-400',
    member_leave: 'text-zinc-400',
    member_kick: 'text-amber-400',
    member_ban: 'text-red-400',
    member_timeout: 'text-amber-400',
    channel_create: 'text-indigo-400',
    channel_delete: 'text-red-400',
    message_delete: 'text-red-400',
    role_create: 'text-indigo-400'
  };

  const filteredLogs = logs.filter(log => 
    log.actor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.target_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-[#121214]">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Audit Log
          </h3>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search logs..."
              className="pl-9 bg-zinc-900 border-zinc-800 text-white"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40 bg-zinc-900 border-zinc-800">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="member_ban">Bans</SelectItem>
              <SelectItem value="member_kick">Kicks</SelectItem>
              <SelectItem value="member_timeout">Timeouts</SelectItem>
              <SelectItem value="message_delete">Deleted Messages</SelectItem>
              <SelectItem value="channel_create">Channel Changes</SelectItem>
              <SelectItem value="role_create">Role Changes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No audit logs found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => {
              const Icon = actionIcons[log.action_type] || Activity;
              const color = actionColors[log.action_type] || 'text-zinc-400';
              
              return (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 transition-colors"
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-800", color)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-medium">{log.actor_name || 'Unknown'}</span>
                      <span className="text-zinc-400"> {log.action_type.replace(/_/g, ' ')} </span>
                      {log.target_name && (
                        <span className="font-medium">{log.target_name}</span>
                      )}
                    </p>
                    {log.reason && (
                      <p className="text-xs text-zinc-500 mt-1">Reason: {log.reason}</p>
                    )}
                    <p className="text-xs text-zinc-600 mt-1">
                      {format(new Date(log.created_date), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Auto-moderation settings
export function AutoModerationSettings({ serverId, settings, onUpdate }) {
  const [autoModSettings, setAutoModSettings] = useState({
    spam_filter: settings?.spam_filter ?? true,
    link_filter: settings?.link_filter ?? false,
    caps_filter: settings?.caps_filter ?? false,
    mention_spam_limit: settings?.mention_spam_limit ?? 5,
    duplicate_message_threshold: settings?.duplicate_message_threshold ?? 3,
    auto_mute_on_join: settings?.auto_mute_on_join ?? false,
    ...settings
  });

  const handleToggle = (key) => {
    const updated = { ...autoModSettings, [key]: !autoModSettings[key] };
    setAutoModSettings(updated);
    onUpdate?.(updated);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-white flex items-center gap-2">
        <Shield className="w-5 h-5 text-indigo-400" />
        Auto-Moderation
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
          <div>
            <p className="text-white">Spam Filter</p>
            <p className="text-xs text-zinc-500">Automatically detect and remove spam</p>
          </div>
          <button
            onClick={() => handleToggle('spam_filter')}
            className={cn(
              "w-12 h-6 rounded-full transition-colors",
              autoModSettings.spam_filter ? "bg-indigo-500" : "bg-zinc-700"
            )}
          >
            <div className={cn(
              "w-5 h-5 bg-white rounded-full transition-transform",
              autoModSettings.spam_filter ? "translate-x-6" : "translate-x-0.5"
            )} />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
          <div>
            <p className="text-white">Link Filter</p>
            <p className="text-xs text-zinc-500">Block messages containing links</p>
          </div>
          <button
            onClick={() => handleToggle('link_filter')}
            className={cn(
              "w-12 h-6 rounded-full transition-colors",
              autoModSettings.link_filter ? "bg-indigo-500" : "bg-zinc-700"
            )}
          >
            <div className={cn(
              "w-5 h-5 bg-white rounded-full transition-transform",
              autoModSettings.link_filter ? "translate-x-6" : "translate-x-0.5"
            )} />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
          <div>
            <p className="text-white">Caps Filter</p>
            <p className="text-xs text-zinc-500">Warn users for excessive caps</p>
          </div>
          <button
            onClick={() => handleToggle('caps_filter')}
            className={cn(
              "w-12 h-6 rounded-full transition-colors",
              autoModSettings.caps_filter ? "bg-indigo-500" : "bg-zinc-700"
            )}
          >
            <div className={cn(
              "w-5 h-5 bg-white rounded-full transition-transform",
              autoModSettings.caps_filter ? "translate-x-6" : "translate-x-0.5"
            )} />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
          <div>
            <p className="text-white">Auto-mute on Join (Voice)</p>
            <p className="text-xs text-zinc-500">Mute new users joining voice</p>
          </div>
          <button
            onClick={() => handleToggle('auto_mute_on_join')}
            className={cn(
              "w-12 h-6 rounded-full transition-colors",
              autoModSettings.auto_mute_on_join ? "bg-indigo-500" : "bg-zinc-700"
            )}
          >
            <div className={cn(
              "w-5 h-5 bg-white rounded-full transition-transform",
              autoModSettings.auto_mute_on_join ? "translate-x-6" : "translate-x-0.5"
            )} />
          </button>
        </div>

        <div className="p-3 bg-zinc-800/30 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white">Mention Spam Limit</p>
            <span className="text-indigo-400 font-medium">{autoModSettings.mention_spam_limit}</span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            value={autoModSettings.mention_spam_limit}
            onChange={(e) => {
              const updated = { ...autoModSettings, mention_spam_limit: parseInt(e.target.value) };
              setAutoModSettings(updated);
              onUpdate?.(updated);
            }}
            className="w-full"
          />
          <p className="text-xs text-zinc-500 mt-1">
            Timeout users who mention more than {autoModSettings.mention_spam_limit} people
          </p>
        </div>
      </div>
    </div>
  );
}