import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Users, Clock, Ban, Search, Check, X, MessageCircle, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../primitives/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const tabs = [
  { id: 'online', label: 'Online', icon: Users },
  { id: 'all', label: 'All', icon: Users },
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'blocked', label: 'Blocked', icon: Ban },
];

function FriendItem({ friend, onMessage, onRemove }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const displayName = friend.friend_name || 'Friend';
  const status = friend.friend_status || 'offline';
  const customStatus = friend.friend_custom_status;
  
  return (
    <motion.div
      className="group flex items-center gap-3 px-4 py-2 hover:bg-white/[0.04] rounded-lg cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileTap={{ scale: 0.99 }}
    >
      <Avatar
        src={friend.friend_avatar}
        name={displayName}
        status={status}
        size="md"
      />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{displayName}</p>
        <p className="text-xs text-zinc-500 truncate">
          {customStatus || (status === 'online' ? 'Online' : status === 'idle' ? 'Idle' : status === 'dnd' ? 'Do Not Disturb' : 'Offline')}
        </p>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-1">
        <button 
          onClick={() => onMessage?.(friend)}
          className="w-8 h-8 rounded-full bg-[#111113] hover:bg-[#1a1a1c] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
        </button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-8 h-8 rounded-full bg-[#111113] hover:bg-[#1a1a1c] flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 bg-[#111113] border-white/10">
            <DropdownMenuItem onClick={() => onRemove?.(friend)} className="text-red-400">
              Remove Friend
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}

function RequestItem({ request, type, onAccept, onDecline }) {
  const displayName = type === 'incoming' 
    ? (request.user_name || 'Someone')
    : (request.friend_name || 'Someone');
  const avatar = type === 'incoming' ? request.user_avatar : request.friend_avatar;
  
  return (
    <motion.div
      className="flex items-center gap-3 px-4 py-2 hover:bg-white/[0.04] rounded-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Avatar src={avatar} name={displayName} size="md" />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{displayName}</p>
        <p className="text-xs text-zinc-500">
          {type === 'incoming' ? 'Incoming Friend Request' : 'Outgoing Friend Request'}
        </p>
      </div>
      
      {type === 'incoming' ? (
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onAccept?.(request)}
            className="w-8 h-8 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 flex items-center justify-center text-emerald-400 transition-colors"
          >
            <Check className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDecline?.(request)}
            className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button 
          onClick={() => onDecline?.(request)}
          className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center text-zinc-400 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
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
  const [search, setSearch] = useState('');
  
  const onlineFriends = friends.filter(f => 
    f.friend_status === 'online' || f.friend_status === 'idle' || f.friend_status === 'dnd'
  );
  
  const filteredFriends = (activeTab === 'online' ? onlineFriends : friends).filter(f =>
    f.friend_name?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = incomingRequests.length + outgoingRequests.length;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent">
      {/* Header */}
      <div className="h-12 px-4 flex items-center gap-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-zinc-400" />
          <span className="font-semibold text-white">Friends</span>
        </div>
        
        <div className="w-px h-5 bg-white/[0.08]" />
        
        {/* Tabs */}
        <div className="flex items-center gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-3 py-1 rounded-md text-sm font-medium transition-colors',
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
        
        <button
          onClick={onAddFriend}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Friend
        </button>
      </div>
      
      {/* Search */}
      <div className="px-6 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search friends"
            className="w-full h-9 pl-9 pr-4 text-sm bg-[#0a0a0c] border border-white/[0.06] rounded-md text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {activeTab === 'pending' ? (
          <>
            {/* Incoming requests */}
            {incomingRequests.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider px-2 mb-2">
                  Incoming — {incomingRequests.length}
                </p>
                <div className="space-y-1">
                  {incomingRequests.map(request => (
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
            
            {/* Outgoing requests */}
            {outgoingRequests.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider px-2 mb-2">
                  Outgoing — {outgoingRequests.length}
                </p>
                <div className="space-y-1">
                  {outgoingRequests.map(request => (
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
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#111113] flex items-center justify-center mb-4">
                  <Clock className="w-7 h-7 text-zinc-600" />
                </div>
                <p className="text-sm font-medium text-zinc-400">No pending requests</p>
              </div>
            )}
          </>
        ) : activeTab === 'blocked' ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#111113] flex items-center justify-center mb-4">
              <Ban className="w-7 h-7 text-zinc-600" />
            </div>
            <p className="text-sm font-medium text-zinc-400">No blocked users</p>
          </div>
        ) : (
          <>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider px-2 mb-2">
              {activeTab === 'online' ? 'Online' : 'All Friends'} — {filteredFriends.length}
            </p>
            
            {filteredFriends.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#111113] flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-zinc-600" />
                </div>
                <p className="text-sm font-medium text-zinc-400">
                  {activeTab === 'online' ? 'No friends online' : 'No friends found'}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <AnimatePresence>
                  {filteredFriends.map(friend => (
                    <FriendItem
                      key={friend.id}
                      friend={friend}
                      onMessage={onMessage}
                      onRemove={onRemoveFriend}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}