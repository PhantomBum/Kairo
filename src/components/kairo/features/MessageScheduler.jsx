import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Send, Trash2, Edit2, X } from 'lucide-react';
import { format } from 'date-fns';
import Modal from '@/components/kairo/v4/primitives/Modal';
import Button from '@/components/kairo/v4/primitives/Button';
import Input from '@/components/kairo/v4/primitives/Input';
import { cn } from '@/lib/utils';

export function ScheduleMessageModal({ 
  isOpen, 
  onClose, 
  channelId, 
  serverId, 
  currentUser,
  initialContent = '' 
}) {
  const [content, setContent] = useState(initialContent);
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const queryClient = useQueryClient();

  const scheduleMutation = useMutation({
    mutationFn: async () => {
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);
      
      if (scheduledAt <= new Date()) {
        throw new Error('Scheduled time must be in the future');
      }
      
      return base44.entities.ScheduledMessage.create({
        channel_id: channelId,
        server_id: serverId,
        author_id: currentUser.id,
        author_name: currentUser.display_name || currentUser.full_name,
        author_avatar: currentUser.avatar_url,
        content,
        scheduled_at: scheduledAt.toISOString(),
        status: 'pending',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduledMessages'] });
      onClose();
      setContent('');
      setScheduledDate('');
      setScheduledTime('');
    },
  });

  // Set default date/time to 1 hour from now
  React.useEffect(() => {
    if (isOpen && !scheduledDate) {
      const future = new Date();
      future.setHours(future.getHours() + 1);
      setScheduledDate(format(future, 'yyyy-MM-dd'));
      setScheduledTime(format(future, 'HH:mm'));
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Schedule Message"
      icon={<Calendar className="w-5 h-5" />}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => scheduleMutation.mutate()}
            loading={scheduleMutation.isPending}
            disabled={!content.trim() || !scheduledDate || !scheduledTime}
          >
            Schedule
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-zinc-500 uppercase mb-2 block">
            Message
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message..."
            className="w-full h-24 px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-white text-sm resize-none"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-500 uppercase mb-2 block">
              Date
            </label>
            <Input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 uppercase mb-2 block">
              Time
            </label>
            <Input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>
        </div>
        
        {scheduleMutation.isError && (
          <p className="text-sm text-red-400">{scheduleMutation.error?.message}</p>
        )}
      </div>
    </Modal>
  );
}

export function ScheduledMessagesList({ channelId, serverId, currentUserId }) {
  const queryClient = useQueryClient();
  
  const { data: scheduled = [] } = useQuery({
    queryKey: ['scheduledMessages', channelId || serverId],
    queryFn: async () => {
      const filter = channelId 
        ? { channel_id: channelId, status: 'pending' }
        : { server_id: serverId, status: 'pending' };
      return base44.entities.ScheduledMessage.filter(filter);
    },
    enabled: !!(channelId || serverId),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ScheduledMessage.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['scheduledMessages'] }),
  });

  const myScheduled = scheduled.filter(s => s.author_id === currentUserId);

  if (myScheduled.length === 0) return null;

  return (
    <div className="p-4 border-t border-white/[0.06]">
      <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-3">
        Scheduled Messages ({myScheduled.length})
      </h4>
      <div className="space-y-2">
        {myScheduled.map((msg) => (
          <div 
            key={msg.id}
            className="flex items-start gap-3 p-3 bg-white/[0.02] rounded-lg group"
          >
            <Calendar className="w-4 h-4 text-indigo-400 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{msg.content}</p>
              <p className="text-xs text-zinc-500">
                {format(new Date(msg.scheduled_at), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
            <button
              onClick={() => deleteMutation.mutate(msg.id)}
              className="p-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}