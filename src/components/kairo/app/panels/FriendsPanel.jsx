import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Check, X, MessageCircle, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';

const tabs = [
  { id: 'online', label: 'Online' },
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
];

function FriendItem({ friend, onMessage, onRemove }) {
  const status = friend.friend_status || 'offline';

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition-colors group">
      <Avatar
        src={friend.friend_avatar}
        name={friend.friend_name}
        status={status}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{friend.friend_name}</p>
        <p className="text-xs text-zinc-500 capitalize">{status}</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onMessage(friend)}
          className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
        <button
          onClick={() => onRemove(friend)}
          className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function RequestItem({ request, type, onAccept, onDecline }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
      <Avatar
        src={type === 'incoming' ? request.friend_avatar : request.friend_avatar}
        name={type === 'incoming' ? request.friend_name : request.friend_name}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">
          {type === 'incoming' ? (request.initiated_by_name || 'Someone') : request.friend_name}
        </p>
        <p className="text-xs text-zinc-500">
          {type === 'incoming' ? 'Incoming Friend Request' : 'Outgoing Friend Request'}
        </p>
      </div>
      {type === 'incoming' && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAccept(request)}
            className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDecline(request)}
            className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {type === 'outgoing' && (
        <button
          onClick={() => onDecline(request)}
          className="px-3 h-7 text-xs text-zinc-400 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] rounded-md transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

export default function FriendsPanel({
  friends = [],
  incomingRequests = [],
  outgoingRequests = [],
  onAddFriend,
  onMessage,
  onAcceptRequest,
  onDeclineRequest,
  onRemoveFriend,
}) {
  const [activeTab, setActiveTab] = useState('online');

  const onlineFriends = friends.filter(f => f.friend_status === 'online');
  const pendingCount = incomingRequests.length + outgoingRequests.length;

  const displayedFriends = activeTab === 'online' ? onlineFriends : friends;

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f10]">
      {/* Header */}
      <div className="h-12 px-4 flex items-center gap-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 text-white">
          <Users className="w-5 h-5" />
          <span className="font-semibold">Friends</span>
        </div>
        
        <div className="w-px h-4 bg-white/[0.1]" />
        
        {/* Tabs */}
        <div className="flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm transition-colors',
                activeTab === tab.id 
                  ? 'bg-white/[0.08] text-white' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              )}
            >
              {tab.label}
              {tab.id === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
        
        <div className="flex-1" />
        
        <Button
          size="sm"
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={onAddFriend}
        >
          Add Friend
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'pending' ? (
          <div className="space-y-4">
            {incomingRequests.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Incoming — {incomingRequests.length}
                </h3>
                <div className="space-y-2">
                  {incomingRequests.map((request) => (
                    <RequestItem
                      key={request.id}
                      request={request}
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
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                  Outgoing — {outgoingRequests.length}
                </h3>
                <div className="space-y-2">
                  {outgoingRequests.map((request) => (
                    <RequestItem
                      key={request.id}
                      request={request}
                      type="outgoing"
                      onDecline={onDeclineRequest}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {pendingCount === 0 && (
              <div className="text-center py-12">
                <p className="text-zinc-500">No pending friend requests</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              {activeTab === 'online' ? 'Online' : 'All Friends'} — {displayedFriends.length}
            </h3>
            
            {displayedFriends.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500">
                  {activeTab === 'online' ? 'No friends online' : 'No friends yet'}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={onAddFriend}
                >
                  Add Friend
                </Button>
              </div>
            ) : (
              <div className="space-y-1">
                {displayedFriends.map((friend) => (
                  <FriendItem
                    key={friend.id}
                    friend={friend}
                    onMessage={onMessage}
                    onRemove={onRemoveFriend}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}