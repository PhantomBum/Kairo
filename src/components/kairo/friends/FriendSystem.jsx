import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Users, UserPlus, UserCheck, UserX, MessageCircle, 
  MoreHorizontal, Search, Check, X, Clock, Ban
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusColors = {
  online: 'bg-emerald-500',
  idle: 'bg-amber-500',
  dnd: 'bg-red-500',
  offline: 'bg-zinc-600'
};

// Friend request card
function FriendRequestCard({ request, type, onAccept, onDecline }) {
  const isIncoming = type === 'incoming';
  const friend = isIncoming ? request : request;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-xl hover:bg-zinc-800/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-700">
          {friend.friend_avatar ? (
            <img src={friend.friend_avatar} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-medium">
              {friend.friend_name?.charAt(0) || '?'}
            </div>
          )}
        </div>
        </div>
        <div>
          <p className="font-medium text-white">{friend.friend_name}</p>
          <p className="text-xs text-zinc-500">
            {isIncoming ? 'Incoming Friend Request' : 'Outgoing Friend Request'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isIncoming ? (
          <>
            <Button
              size="icon"
              onClick={() => onAccept?.(request)}
              className="w-9 h-9 bg-violet-500 hover:bg-violet-600 rounded-xl"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDecline?.(request)}
              className="w-9 h-9 text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDecline?.(request)}
            className="text-zinc-400 hover:text-red-400"
          >
            Cancel
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// Friend card
function FriendCard({ friend, onMessage, onRemove, onBlock }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-xl hover:bg-zinc-800/50 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-700">
            {friend.friend_avatar ? (
              <img src={friend.friend_avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-medium">
                {friend.friend_name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-zinc-900",
            statusColors[friend.status] || statusColors.offline
          )} />
        </div>
        <div>
          <p className="font-medium text-white">{friend.friend_name}</p>
          <p className="text-xs text-zinc-500 capitalize">{friend.status || 'Offline'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onMessage?.(friend)}
          className="w-9 h-9 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-xl"
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="w-9 h-9 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-xl"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 bg-zinc-900/95 backdrop-blur-xl border-zinc-800/50 rounded-xl">
            <DropdownMenuItem 
              onClick={() => onMessage?.(friend)}
              className="text-zinc-300 focus:bg-zinc-800"
            >
              Message
            </DropdownMenuItem>
            <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800">
              View Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem 
              onClick={() => onRemove?.(friend)}
              className="text-red-400 focus:bg-red-500/20"
            >
              Remove Friend
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onBlock?.(friend)}
              className="text-red-400 focus:bg-red-500/20"
            >
              Block
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

// Main Friend System Component
export default function FriendSystem({ currentUser, onStartDM, onAddFriend }) {
  const queryClient = useQueryClient();
  const [view, setView] = useState('all'); // all, pending, blocked
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch friends
  const { data: friendships = [] } = useQuery({
    queryKey: ['friendships', currentUser?.id],
    queryFn: () => base44.entities.Friendship.filter({ user_id: currentUser?.id }),
    enabled: !!currentUser?.id
  });

  // Fetch incoming requests (where friend_id is current user)
  const { data: incomingRequests = [] } = useQuery({
    queryKey: ['incomingRequests', currentUser?.id],
    queryFn: () => base44.entities.Friendship.filter({ friend_id: currentUser?.id, status: 'pending' }),
    enabled: !!currentUser?.id
  });

  // Accept friend request
  const acceptMutation = useMutation({
    mutationFn: async (request) => {
      // Update the request
      await base44.entities.Friendship.update(request.id, { status: 'accepted' });
      
      // Create reverse friendship
      await base44.entities.Friendship.create({
        user_id: currentUser.id,
        friend_id: request.user_id,
        friend_email: request.created_by,
        friend_name: request.user_name || 'User',
        status: 'accepted',
        initiated_by: request.user_id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      queryClient.invalidateQueries({ queryKey: ['incomingRequests'] });
    }
  });

  // Decline/remove friend request or friendship
  const removeMutation = useMutation({
    mutationFn: async (friendship) => {
      await base44.entities.Friendship.delete(friendship.id);
      
      // Also remove reverse if accepted
      if (friendship.status === 'accepted') {
        const reverse = await base44.entities.Friendship.filter({
          user_id: friendship.friend_id,
          friend_id: friendship.user_id
        });
        if (reverse.length > 0) {
          await base44.entities.Friendship.delete(reverse[0].id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      queryClient.invalidateQueries({ queryKey: ['incomingRequests'] });
    }
  });

  // Block user
  const blockMutation = useMutation({
    mutationFn: async (friend) => {
      // Remove friendship
      await removeMutation.mutateAsync(friend);
      
      // Create blocked entry
      await base44.entities.BlockedUser.create({
        user_id: currentUser.id,
        blocked_user_id: friend.friend_id,
        blocked_user_email: friend.friend_email,
        blocked_user_name: friend.friend_name
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      queryClient.invalidateQueries({ queryKey: ['blockedUsers'] });
    }
  });

  // Filter friends
  const friends = friendships.filter(f => f.status === 'accepted');
  const pendingOutgoing = friendships.filter(f => f.status === 'pending' && f.initiated_by === currentUser.id);
  const pendingIncoming = incomingRequests;

  const filteredFriends = friends.filter(f => 
    f.friend_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineFriends = filteredFriends.filter(f => f.status === 'online');
  const offlineFriends = filteredFriends.filter(f => f.status !== 'online');

  return (
    <div className="flex-1 flex flex-col bg-zinc-900/30">
      {/* Header */}
      <div className="h-14 px-6 flex items-center justify-between border-b border-zinc-800/30">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-zinc-400" />
            <span className="font-semibold text-white">Friends</span>
          </div>

          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All', count: friends.length },
              { id: 'pending', label: 'Pending', count: pendingIncoming.length + pendingOutgoing.length },
              { id: 'blocked', label: 'Blocked' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={cn(
                  "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                  view === tab.id
                    ? "bg-zinc-700 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                )}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-zinc-600 rounded text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={onAddFriend}
          className="bg-violet-500 hover:bg-violet-600 rounded-xl"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Friend
        </Button>
      </div>

      {/* Search */}
      <div className="px-6 py-4 border-b border-zinc-800/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search friends..."
            className="pl-9 bg-zinc-800/70 border-zinc-700/50 text-white rounded-xl"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {view === 'pending' ? (
            <motion.div
              key="pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {pendingIncoming.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-3">
                    Incoming Requests — {pendingIncoming.length}
                  </h3>
                  <div className="space-y-2">
                    {pendingIncoming.map((request) => (
                      <FriendRequestCard
                        key={request.id}
                        request={request}
                        type="incoming"
                        onAccept={(r) => acceptMutation.mutate(r)}
                        onDecline={(r) => removeMutation.mutate(r)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {pendingOutgoing.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-3">
                    Outgoing Requests — {pendingOutgoing.length}
                  </h3>
                  <div className="space-y-2">
                    {pendingOutgoing.map((request) => (
                      <FriendRequestCard
                        key={request.id}
                        request={request}
                        type="outgoing"
                        onDecline={(r) => removeMutation.mutate(r)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {pendingIncoming.length === 0 && pendingOutgoing.length === 0 && (
                <div className="text-center py-20 text-zinc-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No pending friend requests</p>
                </div>
              )}
            </motion.div>
          ) : view === 'blocked' ? (
            <motion.div
              key="blocked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 text-zinc-500"
            >
              <Ban className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>You haven't blocked anyone</p>
            </motion.div>
          ) : (
            <motion.div
              key="all"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {onlineFriends.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-3">
                    Online — {onlineFriends.length}
                  </h3>
                  <div className="space-y-2">
                    {onlineFriends.map((friend) => (
                      <FriendCard
                        key={friend.id}
                        friend={friend}
                        onMessage={onStartDM}
                        onRemove={(f) => removeMutation.mutate(f)}
                        onBlock={(f) => blockMutation.mutate(f)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {offlineFriends.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase mb-3">
                    Offline — {offlineFriends.length}
                  </h3>
                  <div className="space-y-2">
                    {offlineFriends.map((friend) => (
                      <FriendCard
                        key={friend.id}
                        friend={friend}
                        onMessage={onStartDM}
                        onRemove={(f) => removeMutation.mutate(f)}
                        onBlock={(f) => blockMutation.mutate(f)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {friends.length === 0 && (
                <div className="text-center py-20 text-zinc-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">You don't have any friends yet</p>
                  <Button onClick={onAddFriend} className="bg-violet-500 hover:bg-violet-600 rounded-xl">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Friend
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}