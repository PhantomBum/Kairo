import React from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle, Users, Hash, Inbox, Search, Mic,
  Bot, Calendar, Bookmark, Pin, Bell, AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { colors, typography } from '@/components/app/design/tokens';
import { Button } from '@/components/ui/button';

const configs = {
  noMessages: {
    icon: Hash,
    title: (ctx) => `This is the very beginning of #${ctx || 'channel'}.`,
    description: 'Say something — break the ice!',
  },
  noDMs: {
    icon: MessageCircle,
    title: 'No messages yet.',
    description: "Send someone a message and say hey.",
  },
  noFriends: {
    icon: Users,
    title: 'No friends added yet.',
    description: "They're out there somewhere.",
  },
  noNotifications: {
    icon: Bell,
    title: "You're all caught up.",
    description: 'Enjoy the quiet.',
  },
  noPins: {
    icon: Pin,
    title: 'Nothing pinned here yet.',
    description: 'Pin important messages so they stay easy to find.',
  },
  noResults: {
    icon: Search,
    title: "Nothing came up.",
    description: 'Try different words or check your spelling.',
  },
  noVoice: {
    icon: Mic,
    title: "Nobody's here yet.",
    description: "Jump in and someone will follow.",
  },
  noBots: {
    icon: Bot,
    title: 'No bots here yet.',
    description: 'Add one from the marketplace.',
  },
  noEvents: {
    icon: Calendar,
    title: 'Nothing planned yet.',
    description: 'Create an event to get things started.',
  },
  noBookmarks: {
    icon: Bookmark,
    title: 'Nothing saved yet.',
    description: 'Bookmark messages to find them later.',
  },
  noServers: {
    icon: Inbox,
    title: 'No servers yet.',
    description: 'Create or join a server to start chatting.',
  },
  noChannels: {
    icon: Hash,
    title: 'No channels.',
    description: 'Create a channel to start conversations.',
  },
  inviteError: {
    icon: AlertTriangle,
    title: "This Invite Isn't Valid",
    description: 'This invite may be invalid, expired, or you may not have permission to join.',
  },
};

export default function EmptyState({
  type = 'noMessages',
  title,
  description,
  action,
  actionLabel,
  secondaryAction,
  secondaryActionLabel,
  context,
  className,
}) {
  const cfg = configs[type] || configs.noMessages;
  const Icon = cfg.icon;
  const displayTitle = title || (typeof cfg.title === 'function' ? cfg.title(context) : cfg.title);
  const displayDesc = description || cfg.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}
      style={{ gap: 24 }}>

      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ color: colors.text.muted }}>
        <Icon className="w-12 h-12" />
      </div>

      <h3 style={{ fontSize: typography.lg.size, fontWeight: typography.weight.semibold, color: colors.text.primary }}>
        {displayTitle}
      </h3>

      <p className="max-w-[280px] leading-relaxed" style={{ fontSize: typography.base.size, color: colors.text.muted }}>
        {displayDesc}
      </p>

      {(action || secondaryAction) && (
        <div className="flex gap-3">
          {action && (
            <Button onClick={action} variant="default">
              {actionLabel || 'Get Started'}
            </Button>
          )}
          {secondaryAction && (
            <Button onClick={secondaryAction} variant="outline">
              {secondaryActionLabel || 'Learn More'}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
