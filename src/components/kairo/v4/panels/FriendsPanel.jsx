import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Clock, Ban, Search, 
  MessageCircle, MoreHorizontal, Check, X, Sparkles, Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../primitives/Avatar';
import Button from '../primitives/Button';
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

function FriendCard({ friend, onMessage, onRemove, onBlock, index }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.03, type: 'spring', stiffness: 300, damping: 25 }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
      />
      
      <div className="relative flex items-center justify-between p-4 bg-gradient-to-r from-white/[0.03] to-transparent hover:from-white/[0.06] rounded-2xl border border-white/[0.06] hover:border-white/[0.1] transition-all">
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }}>
            <Avatar
              src={friend.friend_avatar}
              name={friend.friend_name}
              status={friend.friend_status || friend.status || 'offline'}
              size="lg"
            />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold text-white">{friend.friend_name}</p>
              {friend.is_premium && <Sparkles className="w-4 h-4 text-purple-400" />}
            </div>
            <p className="text-sm text-zinc-500 capitalize flex items-center gap-1.5">
              <span className={cn(
                'w-2 h-2 rounded-full',
                (friend.friend_status || friend.status) === 'online' ? 'bg-emerald-500' :
                (friend.friend_status || friend.status) === 'idle' ? 'bg-amber-500' :
                (friend.friend_status || friend.status) === 'dnd' ? 'bg-red-500' : 'bg-zinc-500'
              )} />
              {friend.friend_status || friend.status || 'Offline'}
            </p>
          </div>
        </div>

        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 10 }}
        >
          <motion.button
            onClick={() => onMessage?.(friend)}
            className="w-10 h-10 rounded-xl bg-indigo-500 hover:bg-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle className="w-5 h-5 text-white" />
          </motion.button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.button
                className="w-10 h-10 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MoreHorizontal className="w-5 h-5 text-zinc-400" />
              </motion.button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-[#18181b]/95 backdrop-blur-xl border-white/[0.1]">
              <DropdownMenuItem onClick={() => onMessage?.(friend)} className="text-zinc-300 focus:text-white focus:bg-white/[0.08]">
                <MessageCircle className="w-4 h-4 mr-2" /> Message
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/[0.08]" />
              <DropdownMenuItem onClick={() => onRemove?.(friend)} className="text-red-400 focus:text-red-300 focus:bg-red-500/10">
                Remove Friend
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBlock?.(friend)} className="text-red-400 focus:text-red-300 focus:bg-red-500/10">
                Block
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      </div>
    </motion.div>
  );
}

function RequestCard({ request, type, onAccept, onDecline, index }) {
  const isIncoming = type === 'incoming';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 300, damping: 25 }}
      className="flex items-center justify-between p-4 bg-gradient-to-r from-white/[0.03] to-transparent hover:from-white/[0.05] rounded-2xl border border-white/[0.06] transition-all group"
    >
      <div className="flex items-center gap-4">
        <Avatar
          src={request.friend_avatar}
          name={request.friend_name}
          size="lg"
        />
        <div>
          <p className="text-base font-semibold text-white">{request.friend_name}</p>
          <p className="text-sm text-zinc-500 flex items-center gap-1.5">
            {isIncoming ? (
              <>
                <Heart className="w-3.5 h-3.5 text-pink-400" />
                <span>Wants to be your friend</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Request pending</span>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isIncoming ? (
          <>
            <motion.button
              onClick={() => onAccept?.(request)}
              className="w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Check className="w-5 h-5 text-white" />
            </motion.button>
            <motion.button
              onClick={() => onDecline?.(request)}
              className="w-10 h-10 rounded-xl bg-white/[0.06] hover:bg-red-500/20 flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5 text-zinc-400 hover:text-red-400" />
            </motion.button>
          </>
        ) : (
          <motion.button
            onClick={() => onDecline?.(request)}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-sm text-zinc-400 hover:text-white transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState({ icon: Icon, title, description, action, gradient }) {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-20 text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.div 
        className={cn(
          "w-24 h-24 rounded-3xl flex items-center justify-center mb-6",
          "bg-gradient-to-br border border-white/[0.08]",
          gradient || "from-zinc-800/50 to-zinc-900/50"
        )}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Icon className="w-10 h-10 text-zinc-500" />
      </motion.div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 mb-6 max-w-sm">{description}</p>
      {action}
    </motion.div>
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

  const onlineFriends = friends.filter(f => 
    (f.friend_status === 'online' || f.status === 'online' || f.friend_status === 'idle' || f.friend_status === 'dnd')
  );
  
  const displayFriends = activeTab === 'online' ? onlineFriends : friends;
  const filteredFriends = displayFriends.filter(f =>
    f.friend_name?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = incomingRequests.length + outgoingRequests.length;

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-600/10 rounded-full blur-[100px]" />
      </div>
      
      {/* Header */}
      <motion.div 
        className="relative h-16 px-6 flex items-center justify-between border-b border-white/[0.06] bg-gradient-to-r from-[#0c0c0e]/80 to-transparent backdrop-blur-xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-lg font-bold text-white">Friends</span>
          </div>

          <div className="h-8 w-px bg-white/[0.08]" />

          <div className="flex items-center gap-1 p-1 bg-white/[0.03] rounded-xl">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  activeTab === tab.id
                    ? 'text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg"
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">{tab.label}</span>
                {tab.id === 'pending' && pendingCount > 0 && (
                  <motion.span 
                    className="relative ml-2 px-1.5 py-0.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full text-[10px] text-white font-bold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    {pendingCount}
                  </motion.span>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button
          onClick={onAddFriend}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 rounded-xl text-white font-medium shadow-lg shadow-emerald-500/30 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <UserPlus className="w-4 h-4" />
          Add Friend
        </motion.button>
      </motion.div>

      {/* Search */}
      {(activeTab === 'online' || activeTab === 'all') && (
        <motion.div 
          className="relative px-6 py-4 border-b border-white/[0.04]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search friends..."
              className="w-full h-12 pl-12 pr-4 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </motion.div>
      )}

      {/* Content */}
      <div className="relative flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'pending' ? (
            <motion.div 
              key="pending" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }} 
              className="space-y-6"
            >
              {incomingRequests.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    Incoming Requests — {incomingRequests.length}
                  </p>
                  <div className="space-y-3">
                    {incomingRequests.map((req, i) => (
                      <RequestCard
                        key={req.id}
                        request={req}
                        type="incoming"
                        onAccept={onAcceptRequest}
                        onDecline={onDeclineRequest}
                        index={i}
                      />
                    ))}
                  </div>
                </div>
              )}

              {outgoingRequests.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Outgoing Requests — {outgoingRequests.length}
                  </p>
                  <div className="space-y-3">
                    {outgoingRequests.map((req, i) => (
                      <RequestCard
                        key={req.id}
                        request={req}
                        type="outgoing"
                        onDecline={onDeclineRequest}
                        index={i}
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
                  gradient="from-amber-500/10 to-orange-500/10"
                />
              )}
            </motion.div>
          ) : activeTab === 'blocked' ? (
            <motion.div 
              key="blocked" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
            >
              {blockedUsers.length === 0 ? (
                <EmptyState
                  icon={Ban}
                  title="No blocked users"
                  description="Users you block will appear here. You won't receive messages from blocked users."
                  gradient="from-red-500/10 to-rose-500/10"
                />
              ) : (
                <div className="space-y-3">
                  {blockedUsers.map((user, i) => (
                    <motion.div 
                      key={user.id} 
                      className="flex items-center justify-between p-4 bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl border border-white/[0.06] transition-all"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar name={user.blocked_user_name} size="lg" />
                        <span className="text-base font-medium text-white">{user.blocked_user_name}</span>
                      </div>
                      <motion.button
                        onClick={() => onUnblockUser?.(user)}
                        className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-sm text-zinc-400 hover:text-white transition-all"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Unblock
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="friends" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
            >
              {filteredFriends.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title={activeTab === 'online' ? 'No friends online' : 'No friends yet'}
                  description={activeTab === 'online' 
                    ? 'When your friends come online, they\'ll appear here.' 
                    : 'Add some friends to start chatting and gaming together!'}
                  gradient="from-indigo-500/10 to-purple-500/10"
                  action={
                    <motion.button
                      onClick={onAddFriend}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 rounded-xl text-white font-medium shadow-lg shadow-indigo-500/30 transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <UserPlus className="w-5 h-5" />
                      Add Friend
                    </motion.button>
                  }
                />
              ) : (
                <>
                  <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                    {activeTab === 'online' ? 'Online' : 'All Friends'} — {filteredFriends.length}
                  </p>
                  <div className="space-y-3">
                    {filteredFriends.map((friend, i) => (
                      <FriendCard
                        key={friend.id}
                        friend={friend}
                        onMessage={onMessage}
                        onRemove={onRemoveFriend}
                        onBlock={onBlockUser}
                        index={i}
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