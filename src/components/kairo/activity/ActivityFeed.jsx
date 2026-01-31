import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, MessageSquare, UserPlus, Server, Award, 
  Heart, Reply, Pin, Settings, Bell, Users, Hash,
  Clock, ChevronRight, X, Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const activityIcons = {
  message: MessageSquare,
  mention: MessageSquare,
  friend_request: UserPlus,
  friend_accepted: UserPlus,
  server_join: Server,
  server_invite: Server,
  reaction: Heart,
  reply: Reply,
  pin: Pin,
  achievement: Award,
  role_update: Settings
};

const activityColors = {
  message: 'bg-blue-500/10 text-blue-400',
  mention: 'bg-amber-500/10 text-amber-400',
  friend_request: 'bg-emerald-500/10 text-emerald-400',
  friend_accepted: 'bg-emerald-500/10 text-emerald-400',
  server_join: 'bg-indigo-500/10 text-indigo-400',
  server_invite: 'bg-indigo-500/10 text-indigo-400',
  reaction: 'bg-pink-500/10 text-pink-400',
  reply: 'bg-violet-500/10 text-violet-400',
  pin: 'bg-amber-500/10 text-amber-400',
  achievement: 'bg-yellow-500/10 text-yellow-400',
  role_update: 'bg-zinc-500/10 text-zinc-400'
};

function ActivityItem({ activity, onNavigate, onDismiss }) {
  const Icon = activityIcons[activity.type] || Activity;
  const colorClass = activityColors[activity.type] || 'bg-zinc-500/10 text-zinc-400';

  const getActivityText = () => {
    switch (activity.type) {
      case 'mention':
        return <><strong>{activity.user_name}</strong> mentioned you in <strong>#{activity.channel_name}</strong></>;
      case 'message':
        return <><strong>{activity.user_name}</strong> sent a message in <strong>#{activity.channel_name}</strong></>;
      case 'friend_request':
        return <><strong>{activity.user_name}</strong> sent you a friend request</>;
      case 'friend_accepted':
        return <><strong>{activity.user_name}</strong> accepted your friend request</>;
      case 'server_join':
        return <>You joined <strong>{activity.server_name}</strong></>;
      case 'server_invite':
        return <><strong>{activity.user_name}</strong> invited you to <strong>{activity.server_name}</strong></>;
      case 'reaction':
        return <><strong>{activity.user_name}</strong> reacted {activity.emoji} to your message</>;
      case 'reply':
        return <><strong>{activity.user_name}</strong> replied to your message</>;
      case 'pin':
        return <>Your message was pinned in <strong>#{activity.channel_name}</strong></>;
      case 'achievement':
        return <>You earned the <strong>{activity.achievement_name}</strong> badge!</>;
      case 'role_update':
        return <>Your roles were updated in <strong>{activity.server_name}</strong></>;
      default:
        return activity.content;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="group relative"
    >
      <button
        onClick={() => onNavigate?.(activity)}
        className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors text-left"
      >
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
          colorClass
        )}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-zinc-300">
            {getActivityText()}
          </p>
          
          {activity.preview && (
            <p className="text-xs text-zinc-500 truncate mt-1">
              "{activity.preview}"
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-1.5">
            <Clock className="w-3 h-3 text-zinc-600" />
            <span className="text-xs text-zinc-600">
              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        {/* User avatar */}
        {activity.user_avatar && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
            <img src={activity.user_avatar} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Unread indicator */}
        {!activity.is_read && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-r-full" />
        )}
      </button>

      {/* Dismiss button */}
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss?.(activity.id); }}
        className="absolute top-2 right-2 w-6 h-6 rounded-md bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

export default function ActivityFeed({
  activities = [],
  onNavigate,
  onDismiss,
  onMarkAllRead,
  onClearAll
}) {
  const [filter, setFilter] = useState('all');
  
  const filters = [
    { id: 'all', label: 'All Activity' },
    { id: 'mentions', label: 'Mentions' },
    { id: 'messages', label: 'Messages' },
    { id: 'friends', label: 'Friends' },
    { id: 'servers', label: 'Servers' }
  ];

  const filteredActivities = activities.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'mentions') return a.type === 'mention';
    if (filter === 'messages') return ['message', 'reply'].includes(a.type);
    if (filter === 'friends') return ['friend_request', 'friend_accepted'].includes(a.type);
    if (filter === 'servers') return ['server_join', 'server_invite'].includes(a.type);
    return true;
  });

  const unreadCount = activities.filter(a => !a.is_read).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-semibold text-white">Activity</h2>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs font-medium rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-[#1a1a1c] border-white/[0.08]">
            <DropdownMenuItem onClick={onMarkAllRead} className="text-zinc-300 focus:text-white focus:bg-white/5">
              Mark all as read
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem onClick={onClearAll} className="text-red-400 focus:text-red-300 focus:bg-red-500/10">
              Clear all activity
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-none">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
              filter === f.id 
                ? "bg-white/10 text-white" 
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Activity List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {filteredActivities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Activity className="w-12 h-12 text-zinc-700 mb-3" />
            <p className="text-sm text-zinc-500">No activity yet</p>
            <p className="text-xs text-zinc-600 mt-1">
              {filter === 'all' 
                ? "When something happens, you'll see it here" 
                : "No activity in this category"}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredActivities.map(activity => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                onNavigate={onNavigate}
                onDismiss={onDismiss}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}