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
      className="flex items-center justify-between p-4 bg-[#111113] hover:bg-[#161618] transition-colors border-b border-white/5"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
        <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800">
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
              className="w-9 h-9 bg-emerald-600 hover:bg-emerald-700 rounded-lg"
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDecline?.(request)}
              className="w-9 h-9 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
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
      className="flex items-center justify-between p-4 bg-[#111113] hover:bg-[#161618] transition-colors border-b border-white/5 group"
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-800">
            {friend.friend_avatar ? (
              <img src={friend.friend_avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-medium">
                {friend.friend_name?.charAt(0) || '?'}
              </div>
            )}
          </div>
          <div className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#111113]",
            statusColors[friend.status] || statusColors.offline
          )} />
        </div>
        <div>
          <p className="font-medium text-white text-sm">{friend.friend_name}</p>
          <p className="text-xs text-zinc-500 capitalize">{friend.status || 'Offline'}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onMessage?.(friend)}
          className="w-8 h-8 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="w-8 h-8 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40 bg-[#0a0a0b] border-white/10 rounded-lg">
            <DropdownMenuItem 
              onClick={() => onMessage?.(friend)}
              className="text-zinc-300 focus:bg-white/5 focus:text-white"
            >
              Message
            </DropdownMenuItem>
            <DropdownMenuItem className="text-zinc-300 focus:bg-white/5 focus:text-white">
              View Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem 
              onClick={() => onRemove?.(friend)}
              className="text-red-400 focus:bg-red-500/10"
            >
              Remove Friend
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onBlock?.(friend)}
              className="text-red-400 focus:bg-red-500/10"
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
  const [view, setView] = useState('online'); // online, all, pending, blocked, info
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch friends - all friendships where user is involved
  const { data: friendships = [] } = useQuery({
    queryKey: ['friendships', currentUser?.id],
    queryFn: async () => {
      // Get friendships created by this user
      const myFriendships = await base44.entities.Friendship.filter({ user_id: currentUser?.id });
      return myFriendships;
    },
    enabled: !!currentUser?.id
  });

  // Fetch incoming requests - where this user is the target (friend_id) 
  const { data: incomingRequests = [] } = useQuery({
    queryKey: ['incomingRequests', currentUser?.id, currentUser?.user_email],
    queryFn: async () => {
      // Try both user_id and friend_email for incoming requests
      const allPending = await base44.entities.Friendship.filter({ status: 'pending' });
      const userEmail = (currentUser?.user_email || currentUser?.email || '').toLowerCase();
      const userId = currentUser?.user_id || currentUser?.id;
      
      // Filter for requests where current user is the target
      return allPending.filter(f => 
        f.friend_id === userId || 
        (f.friend_email && f.friend_email.toLowerCase() === userEmail)
      );
    },
    enabled: !!currentUser?.id
  });

  // Accept friend request
  const acceptMutation = useMutation({
    mutationFn: async (request) => {
      // Update the original request to accepted
      await base44.entities.Friendship.update(request.id, { status: 'accepted' });
      
      // Get sender's profile for reverse friendship
      const senderProfiles = await base44.entities.UserProfile.filter({ user_id: request.user_id });
      const senderProfile = senderProfiles[0];
      
      // Create reverse friendship so both users see each other
      await base44.entities.Friendship.create({
        user_id: currentUser.user_id || currentUser.id,
        friend_id: request.user_id,
        friend_email: request.created_by || senderProfile?.user_email,
        friend_name: senderProfile?.display_name || senderProfile?.username || 'User',
        friend_avatar: senderProfile?.avatar_url,
        status: 'accepted',
        initiated_by: request.user_id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendships'] });
      queryClient.invalidateQueries({ queryKey: ['incomingRequests'] });
      queryClient.invalidateQueries({ queryKey: ['friends'] });
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

  const tabs = [
    { id: 'online', label: 'Online', count: onlineFriends.length },
    { id: 'all', label: 'All', count: friends.length },
    { id: 'pending', label: 'Pending', count: pendingIncoming.length + pendingOutgoing.length },
    { id: 'blocked', label: 'Blocked' },
    { id: 'info', label: 'Info' }
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0b]">
      {/* Header - Dark themed like kloak */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-white/5 bg-[#0a0a0b]">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-white text-sm">Friends</span>

          {/* Tab navigation - styled like the image */}
          <div className="flex items-center gap-1 border-l border-white/10 pl-4 ml-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={cn(
                  "px-3 py-1 text-xs font-medium transition-colors rounded",
                  view === tab.id
                    ? "text-white bg-white/10"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                )}
              >
                {tab.label}
                {tab.count > 0 && view !== tab.id && (
                  <span className="ml-1 text-zinc-600">({tab.count})</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <Button
          size="sm"
          onClick={onAddFriend}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7 px-3 rounded"
        >
          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
          Add Friend
        </Button>
      </div>

      {/* Search bar - minimal dark style */}
      {(view === 'online' || view === 'all') && (
        <div className="px-4 py-3 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className="pl-9 h-8 bg-[#111113] border-white/5 text-white text-sm placeholder:text-zinc-600 rounded focus:border-white/10 focus:ring-0"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {view === 'pending' ? (
            <motion.div
              key="pending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {pendingIncoming.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
                    Incoming — {pendingIncoming.length}
                  </div>
                  {pendingIncoming.map((request, idx) => (
                    <FriendRequestCard
                      key={request.id || `incoming-${idx}`}
                      request={request}
                      type="incoming"
                      onAccept={(r) => acceptMutation.mutate(r)}
                      onDecline={(r) => removeMutation.mutate(r)}
                    />
                  ))}
                </div>
              )}

              {pendingOutgoing.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
                    Outgoing — {pendingOutgoing.length}
                  </div>
                  {pendingOutgoing.map((request, idx) => (
                    <FriendRequestCard
                      key={request.id || `outgoing-${idx}`}
                      request={request}
                      type="outgoing"
                      onDecline={(r) => removeMutation.mutate(r)}
                    />
                  ))}
                </div>
              )}

              {pendingIncoming.length === 0 && pendingOutgoing.length === 0 && (
                <div className="text-center py-20 text-zinc-600">
                  <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No pending requests</p>
                </div>
              )}
            </motion.div>
          ) : view === 'blocked' ? (
            <motion.div
              key="blocked"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20 text-zinc-600"
            >
              <Ban className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No blocked users</p>
            </motion.div>
          ) : view === 'info' ? (
            <motion.div
              key="info"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6"
            >
              <div className="max-w-md">
                <h3 className="text-white font-semibold mb-2">About Friends</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Add friends to message them directly and see when they're online. 
                  You can add friends by their username.
                </p>
              </div>
            </motion.div>
          ) : view === 'online' ? (
            <motion.div
              key="online"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {onlineFriends.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
                    Online — {onlineFriends.length}
                  </div>
                  {onlineFriends.map((friend, idx) => (
                    <FriendCard
                      key={friend.id || `online-${idx}`}
                      friend={friend}
                      onMessage={onStartDM}
                      onRemove={(f) => removeMutation.mutate(f)}
                      onBlock={(f) => blockMutation.mutate(f)}
                    />
                  ))}
                </div>
              )}

              {onlineFriends.length === 0 && (
                <div className="text-center py-20 text-zinc-600">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No friends online</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="all"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredFriends.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">
                    All Friends — {filteredFriends.length}
                  </div>
                  {filteredFriends.map((friend, idx) => (
                    <FriendCard
                      key={friend.id || `friend-${idx}`}
                      friend={friend}
                      onMessage={onStartDM}
                      onRemove={(f) => removeMutation.mutate(f)}
                      onBlock={(f) => blockMutation.mutate(f)}
                    />
                  ))}
                </div>
              )}

              {friends.length === 0 && (
                <div className="text-center py-20 text-zinc-600">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm mb-4">No friends yet</p>
                  <Button 
                    onClick={onAddFriend} 
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                  >
                    <UserPlus className="w-3.5 h-3.5 mr-1.5" />
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