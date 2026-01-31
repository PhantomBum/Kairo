import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Clock, Ban, Search, 
  MessageCircle, MoreHorizontal, Check, X, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../primitives/Avatar';
import Button from '../primitives/Button';
import Input from '../primitives/Input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const tabs = [
  { id: 'online', label: 'Online', icon: Users },
  { id: 'all', label: 'All', icon: Users },
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'blocked', label: 'Blocked', icon: Ban },
];

function FriendCard({ friend, onMessage, onRemove, onBlock }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-lg transition-colors group"
    >
      <div className="flex items-center gap-3">
        <Avatar
          src={friend.friend_avatar}
          name={friend.friend_name}
          status={friend.status || 'offline'}
          size="md"
        />
        <div>
          <p className="text-sm font-medium text-white">{friend.friend_name}</p>
          <p className="text-xs text-zinc-500 capitalize">{friend.status || 'Offline'}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => onMessage?.(friend)}
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-sm" variant="ghost">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40 bg-[#111113] border-white/[0.08]">
            <DropdownMenuItem onClick={() => onMessage?.(friend)} className="text-zinc-300 focus:text-white focus:bg-white/[0.06]">
              Message
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/[0.06]" />
            <DropdownMenuItem onClick={() => onRemove?.(friend)} className="text-red-400 focus:text-red-300 focus:bg-red-500/10">
              Remove Friend
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBlock?.(friend)} className="text-red-400 focus:text-red-300 focus:bg-red-500/10">
              Block
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

function RequestCard({ request, type, onAccept, onDecline }) {
  const isIncoming = type === 'incoming';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] rounded-lg transition-colors"
    >
      <div className="flex items-center gap-3">
        <Avatar
          src={request.friend_avatar}
          name={request.friend_name}
          size="md"
        />
        <div>
          <p className="text-sm font-medium text-white">{request.friend_name}</p>
          <p className="text-xs text-zinc-500">
            {isIncoming ? 'Incoming Friend Request' : 'Outgoing Friend Request'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isIncoming ? (
          <>
            <Button
              size="icon-sm"
              variant="success"
              onClick={() => onAccept?.(request)}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => onDecline?.(request)}
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDecline?.(request)}
          >
            Cancel
          </Button>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-zinc-600" />
      </div>
      <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
      <p className="text-sm text-zinc-500 mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

export default function FriendsPanel({
  friends = [],
  incomingRequests = [],
  outgoingRequests = [],
  blockedUsers = [],
  onAddFriend,
  onMessage,
  onAcceptRequest,
  onDeclineRequest,
  onRemoveFriend,
  onBlockUser,
  onUnblockUser,
}) {
  const [activeTab, setActiveTab] = useState('online');
  const [search, setSearch] = useState('');

  const acceptedFriends = friends.filter(f => f.status === 'accepted');
  const onlineFriends = acceptedFriends.filter(f => f.status === 'online');

  const filteredFriends = (activeTab === 'online' ? onlineFriends : acceptedFriends).filter(f =>
    f.friend_name?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = incomingRequests.length + outgoingRequests.length;

  return (
    <div className="flex-1 flex flex-col bg-[#09090b]">
      {/* Header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-zinc-400" />
            <span className="font-semibold text-white">Friends</span>
          </div>

          <div className="h-6 w-px bg-white/[0.08]" />

          <div className="flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-3 py-1 text-sm font-medium rounded transition-colors',
                  activeTab === tab.id
                    ? 'bg-white/[0.08] text-white'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                )}
              >
                {tab.label}
                {tab.id === 'pending' && pendingCount > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 rounded-full text-[10px] text-white">
                    {pendingCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={onAddFriend} variant="success" size="sm">
          <UserPlus className="w-4 h-4 mr-1.5" />
          Add Friend
        </Button>
      </div>

      {/* Search */}
      {(activeTab === 'online' || activeTab === 'all') && (
        <div className="px-4 py-3 border-b border-white/[0.04]">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search friends..."
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'pending' ? (
            <motion.div key="pending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              {incomingRequests.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2">
                    Incoming — {incomingRequests.length}
                  </p>
                  <div className="space-y-2">
                    {incomingRequests.map((req) => (
                      <RequestCard
                        key={req.id}
                        request={req}
                        type="incoming"
                        onAccept={onAcceptRequest}
                        onDecline={onDeclineRequest}
                      />
                    ))}
                  </div>
                </div>
              )}

              {outgoingRequests.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2">
                    Outgoing — {outgoingRequests.length}
                  </p>
                  <div className="space-y-2">
                    {outgoingRequests.map((req) => (
                      <RequestCard
                        key={req.id}
                        request={req}
                        type="outgoing"
                        onDecline={onDeclineRequest}
                      />
                    ))}
                  </div>
                </div>
              )}

              {pendingCount === 0 && (
                <EmptyState
                  icon={Clock}
                  title="No pending requests"
                  description="Friend requests you send or receive will appear here."
                />
              )}
            </motion.div>
          ) : activeTab === 'blocked' ? (
            <motion.div key="blocked" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {blockedUsers.length === 0 ? (
                <EmptyState
                  icon={Ban}
                  title="No blocked users"
                  description="Users you block will appear here."
                />
              ) : (
                <div className="space-y-2">
                  {blockedUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.blocked_user_name} size="md" />
                        <span className="text-sm text-white">{user.blocked_user_name}</span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => onUnblockUser?.(user)}>
                        Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="friends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {filteredFriends.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title={activeTab === 'online' ? 'No friends online' : 'No friends yet'}
                  description={activeTab === 'online' 
                    ? 'Your online friends will appear here.' 
                    : 'Add some friends to start chatting!'}
                  action={
                    <Button onClick={onAddFriend} variant="primary" size="sm">
                      <UserPlus className="w-4 h-4 mr-1.5" />
                      Add Friend
                    </Button>
                  }
                />
              ) : (
                <>
                  <p className="text-xs font-semibold text-zinc-600 uppercase tracking-wider mb-2">
                    {activeTab === 'online' ? 'Online' : 'All Friends'} — {filteredFriends.length}
                  </p>
                  <div className="space-y-2">
                    {filteredFriends.map((friend) => (
                      <FriendCard
                        key={friend.id}
                        friend={friend}
                        onMessage={onMessage}
                        onRemove={onRemoveFriend}
                        onBlock={onBlockUser}
                      />
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}