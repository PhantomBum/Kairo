import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Clock, Calendar, Plus, Trash2, Edit, Send, X,
  MessageSquare, CheckCircle, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

const statusColors = {
  pending: 'amber',
  sent: 'emerald',
  failed: 'red',
  cancelled: 'zinc'
};

const statusIcons = {
  pending: Clock,
  sent: CheckCircle,
  failed: AlertCircle,
  cancelled: X
};

function ScheduledMessageCard({ message, onEdit, onCancel }) {
  const StatusIcon = statusIcons[message.status] || Clock;
  const color = statusColors[message.status] || 'zinc';
  const scheduledDate = new Date(message.scheduled_for);
  const isPast = scheduledDate < new Date();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "bg-zinc-800/50 rounded-xl p-4 border",
        message.status === 'pending' ? "border-zinc-700" : "border-zinc-800"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            `bg-${color}-500/20 text-${color}-400`
          )}>
            <StatusIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-white capitalize">{message.status}</p>
            <p className="text-xs text-zinc-500">
              {scheduledDate.toLocaleString()}
            </p>
          </div>
        </div>
        
        {message.status === 'pending' && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(message)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-red-400" 
              onClick={() => onCancel(message)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <p className="text-sm text-zinc-300 line-clamp-3">{message.content}</p>

      {message.attachments?.length > 0 && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs text-zinc-500">
            {message.attachments.length} attachment(s)
          </span>
        </div>
      )}
    </motion.div>
  );
}

function ScheduleMessageModal({ 
  isOpen, 
  onClose, 
  userId, 
  channelId, 
  channelName,
  conversationId,
  editMessage 
}) {
  const [content, setContent] = useState(editMessage?.content || '');
  const [date, setDate] = useState(
    editMessage?.scheduled_for 
      ? new Date(editMessage.scheduled_for).toISOString().slice(0, 16)
      : ''
  );

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: async (data) => {
      if (editMessage) {
        return base44.entities.ScheduledMessage.update(editMessage.id, data);
      }
      return base44.entities.ScheduledMessage.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledMessages', userId] });
      onClose();
      setContent('');
      setDate('');
    }
  });

  const handleSchedule = () => {
    if (!content || !date) return;

    createMutation.mutate({
      user_id: userId,
      channel_id: channelId || undefined,
      conversation_id: conversationId || undefined,
      content,
      scheduled_for: new Date(date).toISOString(),
      status: 'pending'
    });
  };

  // Get min datetime (now + 1 minute)
  const minDate = new Date(Date.now() + 60000).toISOString().slice(0, 16);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            {editMessage ? 'Edit Scheduled Message' : 'Schedule Message'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Destination */}
          <div className="p-3 bg-zinc-800 rounded-lg">
            <p className="text-xs text-zinc-500 mb-1">Sending to</p>
            <p className="text-sm text-white font-medium">
              #{channelName || 'Direct Message'}
            </p>
          </div>

          {/* Message Content */}
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Message</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message..."
              className="bg-zinc-800 border-zinc-700 min-h-[100px]"
            />
          </div>

          {/* Schedule Time */}
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Schedule For</label>
            <Input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={minDate}
              className="bg-zinc-800 border-zinc-700"
            />
          </div>

          <Button 
            onClick={handleSchedule} 
            disabled={!content || !date || createMutation.isPending}
            className="w-full bg-indigo-500 hover:bg-indigo-600"
          >
            <Clock className="w-4 h-4 mr-2" />
            {editMessage ? 'Update Schedule' : 'Schedule Message'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function MessageSchedulerPanel({ userId, channelId, channelName, conversationId }) {
  const [showSchedule, setShowSchedule] = useState(false);
  const [editMessage, setEditMessage] = useState(null);

  const queryClient = useQueryClient();

  const { data: scheduledMessages = [] } = useQuery({
    queryKey: ['scheduledMessages', userId],
    queryFn: () => base44.entities.ScheduledMessage.filter({ user_id: userId }, 'scheduled_for'),
    enabled: !!userId
  });

  const cancelMutation = useMutation({
    mutationFn: (message) => base44.entities.ScheduledMessage.update(message.id, { status: 'cancelled' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduledMessages', userId] })
  });

  const pendingMessages = scheduledMessages.filter(m => m.status === 'pending');
  const pastMessages = scheduledMessages.filter(m => m.status !== 'pending');

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          Scheduled Messages
        </h3>
        <Button 
          onClick={() => setShowSchedule(true)}
          size="sm"
          className="bg-indigo-500 hover:bg-indigo-600"
        >
          <Plus className="w-4 h-4 mr-1" />
          Schedule
        </Button>
      </div>

      {/* Pending Messages */}
      {pendingMessages.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 uppercase font-semibold mb-2">Pending</p>
          <div className="space-y-2">
            <AnimatePresence>
              {pendingMessages.map(message => (
                <ScheduledMessageCard
                  key={message.id}
                  message={message}
                  onEdit={(m) => { setEditMessage(m); setShowSchedule(true); }}
                  onCancel={(m) => {
                    if (confirm('Cancel this scheduled message?')) {
                      cancelMutation.mutate(m);
                    }
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Past Messages */}
      {pastMessages.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 uppercase font-semibold mb-2">History</p>
          <div className="space-y-2">
            {pastMessages.slice(0, 5).map(message => (
              <ScheduledMessageCard
                key={message.id}
                message={message}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {scheduledMessages.length === 0 && (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 mb-2">No scheduled messages</p>
          <p className="text-sm text-zinc-500 mb-4">
            Schedule messages to be sent later
          </p>
          <Button onClick={() => setShowSchedule(true)} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-1" />
            Schedule First Message
          </Button>
        </div>
      )}

      <ScheduleMessageModal
        isOpen={showSchedule}
        onClose={() => { setShowSchedule(false); setEditMessage(null); }}
        userId={userId}
        channelId={channelId}
        channelName={channelName}
        conversationId={conversationId}
        editMessage={editMessage}
      />
    </div>
  );
}