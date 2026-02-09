import React, { useState } from 'react';
import { Users, UserPlus, Check, X, MessageCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import Avatar from '../ui/Avatar';

const tabs = [
  { id: 'online', label: 'Online' },
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'blocked', label: 'Blocked' },
  { id: 'info', label: 'Info' },
];

function FriendRow({ friend, onMessage, onRemove }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] transition-colors group border-t border-white/[0.03] first:border-0">
      <Avatar src={friend.friend_avatar} name={friend.friend_name} size="md" status={friend.friend_status || 'offline'} />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-white truncate">{friend.friend_name}</p>
        <p className="text-xs text-zinc-600 capitalize">{friend.friend_status || 'Offline'}</p>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onMessage(friend)}
          className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
          <MessageCircle className="w-4 h-4" />
        </button>
        <button onClick={() => onRemove(friend)}
          className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function RequestRow({ request, type, onAccept, onDecline }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] transition-colors border-t border-white/[0.03] first:border-0">
      <Avatar src={request.friend_avatar} name={request.friend_name || request.initiated_by_name} size="md" />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium text-white truncate">{request.friend_name || request.initiated_by_name || 'Someone'}</p>
        <p className="text-xs text-zinc-600">{type === 'incoming' ? 'Incoming Friend Request' : 'Outgoing Friend Request'}</p>
      </div>
      {type === 'incoming' && (
        <div className="flex items-center gap-2">
          <button onClick={() => onAccept(request)} className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-emerald-400 hover:bg-emerald-600 hover:text-white transition-colors">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={() => onDecline(request)} className="w-9 h-9 rounded-full bg-[#2a2a2a] flex items-center justify-center text-red-400 hover:bg-red-600 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {type === 'outgoing' && (
        <button onClick={() => onDecline(request)} className="px-3 h-7 text-xs text-zinc-400 bg-[#2a2a2a] hover:bg-white/[0.08] rounded transition-colors">
          Cancel
        </button>
      )}
    </div>
  );
}

export default function FriendsPanel({ friends = [], incomingRequests = [], outgoingRequests = [], onAddFriend, onMessage, onAcceptRequest, onDeclineRequest, onRemoveFriend }) {
  const [activeTab, setActiveTab] = useState('online');
  const pendingCount = incomingRequests.length + outgoingRequests.length;
  const onlineFriends = friends.filter(f => f.friend_status === 'online');
  const displayed = activeTab === 'online' ? onlineFriends : friends;

  return (
    <div className="flex-1 flex flex-col bg-[#0c0c0c]">
      {/* Tab bar */}
      <div className="px-4 py-2 flex items-center gap-2 border-b border-white/[0.06]">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-3 py-1 rounded text-sm transition-colors',
              activeTab === tab.id ? 'bg-white/[0.08] text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'
            )}
          >
            {tab.label}
            {tab.id === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full">{pendingCount}</span>
            )}
            {tab.id === 'all' && friends.length > 0 && (
              <span className="ml-1 text-zinc-600">→ {friends.length}</span>
            )}
          </button>
        ))}
        
        <div className="flex-1" />
        
        <button onClick={onAddFriend}
          className="flex items-center gap-1.5 px-3 h-8 text-sm font-medium bg-[#2a2a2a] hover:bg-[#333] text-white rounded transition-colors">
          <UserPlus className="w-4 h-4" />
          Add Friend
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'pending' ? (
          <>
            {incomingRequests.map(r => <RequestRow key={r.id} request={r} type="incoming" onAccept={onAcceptRequest} onDecline={onDeclineRequest} />)}
            {outgoingRequests.map(r => <RequestRow key={r.id} request={r} type="outgoing" onDecline={onDeclineRequest} />)}
            {pendingCount === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-zinc-700" />
                </div>
                <p className="text-zinc-400 font-medium mb-1">No pending requests</p>
                <p className="text-xs text-zinc-600">Friend requests will appear here.</p>
              </div>
            )}
          </>
        ) : activeTab === 'info' ? (
          <div className="flex flex-col items-center justify-center py-24 text-center px-8">
            <Info className="w-8 h-8 text-zinc-700 mb-4" />
            <p className="text-zinc-400 font-medium mb-1">About Friends</p>
            <p className="text-sm text-zinc-600 max-w-sm">Add friends by their username. You can message, voice chat, and play together.</p>
          </div>
        ) : (
          <>
            {displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-zinc-700" />
                </div>
                <p className="text-zinc-400 font-medium mb-1">No one's around...</p>
                <p className="text-xs text-zinc-600">Add some friends to see who's online.</p>
              </div>
            ) : (
              <div>
                <p className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-600">
                  {activeTab === 'online' ? 'Online' : 'All Friends'} — {displayed.length}
                </p>
                {displayed.map(f => <FriendRow key={f.id} friend={f} onMessage={onMessage} onRemove={onRemoveFriend} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}