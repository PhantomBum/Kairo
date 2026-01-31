import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Ban, UserMinus, Clock, AlertTriangle, Shield, X } from 'lucide-react';
import Modal from '@/components/kairo/v4/primitives/Modal';
import Button from '@/components/kairo/v4/primitives/Button';
import Input from '@/components/kairo/v4/primitives/Input';
import { usePermissions, Permissions } from '../permissions/PermissionSystem';

// Kick member modal
export function KickMemberModal({ isOpen, onClose, member, server }) {
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  const kickMutation = useMutation({
    mutationFn: async () => {
      // Delete membership
      const memberships = await base44.entities.ServerMember.filter({
        server_id: server.id,
        user_id: member.user_id,
      });
      
      if (memberships.length > 0) {
        await base44.entities.ServerMember.delete(memberships[0].id);
      }
      
      // Log to audit log
      await base44.entities.AuditLog.create({
        server_id: server.id,
        action_type: 'member_kick',
        target_id: member.user_id,
        target_type: 'member',
        changes: { reason },
        reason,
      });
      
      // Update member count
      await base44.entities.Server.update(server.id, {
        member_count: Math.max((server.member_count || 1) - 1, 0),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', server.id] });
      onClose();
    },
  });

  if (!hasPermission(Permissions.KICK_MEMBERS)) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Kick ${member.display_name || member.user_name}?`}
      icon={<UserMinus className="w-5 h-5 text-amber-400" />}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            variant="danger" 
            onClick={() => kickMutation.mutate()}
            loading={kickMutation.isPending}
          >
            Kick
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          This will remove them from the server. They can rejoin if they have an invite.
        </p>
        <div>
          <label className="text-xs font-medium text-zinc-500 uppercase mb-2 block">
            Reason (optional)
          </label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter a reason..."
          />
        </div>
      </div>
    </Modal>
  );
}

// Ban member modal
export function BanMemberModal({ isOpen, onClose, member, server }) {
  const [reason, setReason] = useState('');
  const [deleteMessages, setDeleteMessages] = useState(0); // days
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  const banMutation = useMutation({
    mutationFn: async () => {
      // Update member to banned
      const memberships = await base44.entities.ServerMember.filter({
        server_id: server.id,
        user_id: member.user_id,
      });
      
      if (memberships.length > 0) {
        await base44.entities.ServerMember.update(memberships[0].id, {
          is_banned: true,
          ban_reason: reason,
        });
      }
      
      // Delete messages if requested
      if (deleteMessages > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - deleteMessages);
        
        const messages = await base44.entities.Message.filter({
          server_id: server.id,
          author_id: member.user_id,
        });
        
        for (const msg of messages) {
          if (new Date(msg.created_date) > cutoffDate) {
            await base44.entities.Message.update(msg.id, { is_deleted: true });
          }
        }
      }
      
      // Log to audit log
      await base44.entities.AuditLog.create({
        server_id: server.id,
        action_type: 'member_ban',
        target_id: member.user_id,
        target_type: 'member',
        changes: { reason, delete_message_days: deleteMessages },
        reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', server.id] });
      onClose();
    },
  });

  if (!hasPermission(Permissions.BAN_MEMBERS)) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ban ${member.display_name || member.user_name}?`}
      icon={<Ban className="w-5 h-5 text-red-400" />}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            variant="danger" 
            onClick={() => banMutation.mutate()}
            loading={banMutation.isPending}
          >
            Ban
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          This will permanently ban them from the server. They cannot rejoin unless unbanned.
        </p>
        
        <div>
          <label className="text-xs font-medium text-zinc-500 uppercase mb-2 block">
            Reason (optional)
          </label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter a reason..."
          />
        </div>
        
        <div>
          <label className="text-xs font-medium text-zinc-500 uppercase mb-2 block">
            Delete Message History
          </label>
          <select
            value={deleteMessages}
            onChange={(e) => setDeleteMessages(Number(e.target.value))}
            className="w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm"
          >
            <option value={0}>Don't delete any</option>
            <option value={1}>Last 24 hours</option>
            <option value={7}>Last 7 days</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

// Timeout member modal
export function TimeoutMemberModal({ isOpen, onClose, member, server }) {
  const [duration, setDuration] = useState(60); // minutes
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();
  const { hasPermission } = usePermissions();

  const timeoutMutation = useMutation({
    mutationFn: async () => {
      const timeoutUntil = new Date();
      timeoutUntil.setMinutes(timeoutUntil.getMinutes() + duration);
      
      const memberships = await base44.entities.ServerMember.filter({
        server_id: server.id,
        user_id: member.user_id,
      });
      
      if (memberships.length > 0) {
        await base44.entities.ServerMember.update(memberships[0].id, {
          timeout_until: timeoutUntil.toISOString(),
        });
      }
      
      // Log to audit log
      await base44.entities.AuditLog.create({
        server_id: server.id,
        action_type: 'member_timeout',
        target_id: member.user_id,
        target_type: 'member',
        changes: { duration_minutes: duration, reason },
        reason,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members', server.id] });
      onClose();
    },
  });

  if (!hasPermission(Permissions.MUTE_MEMBERS)) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Timeout ${member.display_name || member.user_name}`}
      icon={<Clock className="w-5 h-5 text-amber-400" />}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            variant="primary" 
            onClick={() => timeoutMutation.mutate()}
            loading={timeoutMutation.isPending}
          >
            Timeout
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-zinc-400">
          They won't be able to send messages or join voice until the timeout expires.
        </p>
        
        <div>
          <label className="text-xs font-medium text-zinc-500 uppercase mb-2 block">
            Duration
          </label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full h-10 px-3 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm"
          >
            <option value={1}>1 minute</option>
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={60}>1 hour</option>
            <option value={1440}>1 day</option>
            <option value={10080}>1 week</option>
          </select>
        </div>
        
        <div>
          <label className="text-xs font-medium text-zinc-500 uppercase mb-2 block">
            Reason (optional)
          </label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter a reason..."
          />
        </div>
      </div>
    </Modal>
  );
}

// Unban modal for banned members list
export function UnbanMemberModal({ isOpen, onClose, member, server }) {
  const queryClient = useQueryClient();

  const unbanMutation = useMutation({
    mutationFn: async () => {
      const memberships = await base44.entities.ServerMember.filter({
        server_id: server.id,
        user_id: member.user_id,
        is_banned: true,
      });
      
      if (memberships.length > 0) {
        await base44.entities.ServerMember.update(memberships[0].id, {
          is_banned: false,
          ban_reason: null,
        });
      }
      
      await base44.entities.AuditLog.create({
        server_id: server.id,
        action_type: 'member_unban',
        target_id: member.user_id,
        target_type: 'member',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bannedMembers', server.id] });
      onClose();
    },
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Unban ${member.display_name || member.user_name}?`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            variant="success" 
            onClick={() => unbanMutation.mutate()}
            loading={unbanMutation.isPending}
          >
            Unban
          </Button>
        </>
      }
    >
      <p className="text-sm text-zinc-400">
        This will allow them to rejoin the server if they have an invite.
      </p>
    </Modal>
  );
}

// Check if member is timed out
export function isTimedOut(member) {
  if (!member?.timeout_until) return false;
  return new Date(member.timeout_until) > new Date();
}

// Check if member is banned
export function isBanned(member) {
  return member?.is_banned === true;
}