import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, Bell, Check, Hash, User, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function NotificationItem({ notification, onDismiss, onClick }) {
  const icons = {
    message: MessageCircle,
    mention: Hash,
    friend_request: User,
    server_invite: Bell
  };

  const Icon = icons[notification.type] || Bell;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={onClick}
      className={cn(
        "p-4 rounded-lg border cursor-pointer transition-all group",
        notification.is_read 
          ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800" 
          : "bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20"
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
          notification.is_read ? "bg-zinc-800" : "bg-indigo-500"
        )}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white mb-1">{notification.title}</p>
          <p className="text-sm text-zinc-400 line-clamp-2">{notification.content}</p>
          <p className="text-xs text-zinc-600 mt-2">
            {new Date(notification.created_date).toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(notification.id);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-white p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default function NotificationsPanel({ isOpen, onClose, currentUser }) {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', currentUser?.id],
    queryFn: () => base44.entities.Notification.filter({ user_id: currentUser?.id }, '-created_date', 50),
    enabled: !!currentUser?.id && isOpen
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const dismissMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter(n => !n.is_read);
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] })
  });

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-zinc-900 rounded-2xl border border-zinc-800 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-indigo-400" />
              <div>
                <h2 className="text-xl font-bold text-white">Notifications</h2>
                <p className="text-sm text-zinc-500">{unreadCount} unread</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {unreadCount > 0 && (
            <Button
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              <Check className="w-4 h-4 mr-2" />
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onDismiss={(id) => dismissMutation.mutate(id)}
              onClick={() => {
                if (!notification.is_read) {
                  markAsReadMutation.mutate(notification.id);
                }
                // Navigate to notification target
              }}
            />
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-16">
              <Bell className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500">No notifications</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}