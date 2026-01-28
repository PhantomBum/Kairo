import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageCircle, Users, Plus, Compass, UserPlus, Hash,
  Server, Inbox, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const illustrations = {
  noServers: Server,
  noChannels: Hash,
  noDMs: MessageCircle,
  noFriends: Users,
  noMessages: Inbox,
  noResults: Search
};

export default function EmptyState({
  type = 'noMessages',
  title,
  description,
  action,
  actionLabel,
  secondaryAction,
  secondaryActionLabel,
  className
}) {
  const Icon = illustrations[type] || Inbox;

  const defaultContent = {
    noServers: {
      title: 'No servers yet',
      description: 'Create a server to start chatting with your community'
    },
    noChannels: {
      title: 'No channels',
      description: 'Create a channel to start conversations'
    },
    noDMs: {
      title: 'No conversations',
      description: 'Start a conversation with friends'
    },
    noFriends: {
      title: 'No friends yet',
      description: 'Add friends to start chatting'
    },
    noMessages: {
      title: 'No messages yet',
      description: 'Start the conversation!'
    },
    noResults: {
      title: 'No results found',
      description: 'Try a different search term'
    }
  };

  const content = defaultContent[type] || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      <div className="w-20 h-20 mb-6 rounded-2xl bg-zinc-800/50 flex items-center justify-center">
        <Icon className="w-10 h-10 text-zinc-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-zinc-300 mb-2">
        {title || content.title}
      </h3>
      
      <p className="text-sm text-zinc-500 max-w-xs mb-6">
        {description || content.description}
      </p>

      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <Button
              onClick={action}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              {actionLabel || 'Get Started'}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction}
              variant="secondary"
              className="bg-zinc-800 hover:bg-zinc-700"
            >
              {secondaryActionLabel || 'Learn More'}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}