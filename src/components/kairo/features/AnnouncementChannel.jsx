import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Megaphone, Bell, BellOff, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/kairo/v4/primitives/Button';
import { usePermissions, Permissions } from '../permissions/PermissionSystem';

// Announcement message styling
export function AnnouncementMessage({ message, children }) {
  const isAnnouncement = message.is_announcement || message.channel_type === 'announcement';
  
  if (!isAnnouncement) return children;
  
  return (
    <div className="relative">
      {/* Announcement indicator */}
      <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full" />
      
      {/* Announcement badge */}
      <div className="flex items-center gap-2 mb-2 ml-2">
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 rounded-full">
          <Megaphone className="w-3 h-3 text-indigo-400" />
          <span className="text-[10px] font-medium text-indigo-400 uppercase">Announcement</span>
        </div>
      </div>
      
      {children}
    </div>
  );
}

// Follow announcement channel button
export function FollowChannelButton({ channel, currentUserId }) {
  const queryClient = useQueryClient();
  
  // Check if following (stored in user settings or separate entity)
  const isFollowing = false; // Would need to implement following system
  
  const followMutation = useMutation({
    mutationFn: async () => {
      // Create follow subscription
      // This would create a cross-server notification subscription
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followedChannels'] });
    },
  });

  if (channel.type !== 'announcement') return null;

  return (
    <Button
      variant={isFollowing ? 'secondary' : 'primary'}
      size="sm"
      onClick={() => followMutation.mutate()}
      loading={followMutation.isPending}
    >
      {isFollowing ? (
        <>
          <BellOff className="w-4 h-4 mr-1" />
          Following
        </>
      ) : (
        <>
          <Bell className="w-4 h-4 mr-1" />
          Follow
        </>
      )}
    </Button>
  );
}

// Publish announcement button (for announcement channels)
export function PublishAnnouncementButton({ message, channelId }) {
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  
  const publishMutation = useMutation({
    mutationFn: async () => {
      // Mark message as published announcement
      await base44.entities.Message.update(message.id, {
        is_announcement: true,
        published_at: new Date().toISOString(),
      });
      
      // Would also notify all followers
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', channelId] });
    },
  });

  if (!hasPermission(Permissions.MANAGE_MESSAGES)) return null;
  if (message.is_announcement) return null;

  return (
    <button
      onClick={() => publishMutation.mutate()}
      disabled={publishMutation.isPending}
      className="flex items-center gap-1.5 px-2 py-1 text-xs text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
    >
      <Megaphone className="w-3.5 h-3.5" />
      Publish
    </button>
  );
}

// Announcement channel header
export function AnnouncementChannelHeader({ channel, memberCount }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
        <Megaphone className="w-4 h-4 text-indigo-400" />
      </div>
      <div>
        <h2 className="font-semibold text-white">{channel.name}</h2>
        <p className="text-xs text-zinc-500">
          Announcement channel • Messages can be followed by other servers
        </p>
      </div>
    </div>
  );
}

// Channel type indicator
export function ChannelTypeIndicator({ type, className }) {
  if (type !== 'announcement') return null;
  
  return (
    <span className={cn(
      'px-1.5 py-0.5 text-[10px] font-medium rounded',
      'bg-indigo-500/20 text-indigo-400',
      className
    )}>
      <Megaphone className="w-3 h-3 inline mr-0.5" />
      News
    </span>
  );
}