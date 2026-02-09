import React, { useState } from 'react';
import { MessageSquare, UserPlus, Check, X, UserMinus } from 'lucide-react';

const tabs = ['Online', 'All', 'Pending', 'Blocked'];

function FriendRow({ friend, onMessage, onRemove }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded transition-colors hover:bg-white/[0.04] group">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 overflow-hidden"
        style={{ background: '#1a1a1a', color: '#888' }}>
        {friend.friend_avatar ? <img src={friend.friend_avatar} className="w-full h-full object-cover" /> : (friend.friend_name || 'U').charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white truncate">{friend.friend_name || 'User'}</div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onMessage(friend)}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: '#1a1a1a' }}>
          <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
        </button>
        <button onClick={() => onRemove(friend)}
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors" style={{ background: '#1a1a1a' }}>
          <UserMinus className="w-3.5 h-3.5 text-zinc-400" />
        </button>
      </div>
    </div>
  );
}

function RequestRow({ request, type, onAccept, onDecline }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded transition-colors hover:bg-white/[0.04]">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
        style={{ background: '#1a1a1a', color: '#888' }}>
        {(request.friend_name || 'U').charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white">{request.friend_name || 'User'}</div>
        <div className="text-[11px] text-zinc-500">{type === 'incoming' ? 'Incoming request' : 'Outgoing request'}</div>
      </div>
      {type === 'incoming' && (
        <div className="flex gap-1">
          <button onClick={() => onAccept(request)}
            className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#1a1a1a' }}>
            <Check className="w-3.5 h-3.5 text-green-400" />
          </button>
          <button onClick={() => onDecline(request)}
            className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#1a1a1a' }}>
            <X className="w-3.5 h-3.5 text-red-400" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function FriendsView({ friends, incomingRequests, outgoingRequests, onAddFriend, onMessage, onAccept, onDecline, onRemove }) {
  const [tab, setTab] = useState('Online');

  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ background: '#0e0e0e' }}>
      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 py-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-3 py-1 rounded text-sm font-medium transition-colors"
            style={{
              background: tab === t ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: tab === t ? '#fff' : '#666',
            }}>
            {t}
            {t === 'Pending' && (incomingRequests.length + outgoingRequests.length) > 0 && (
              <span className="ml-1.5 text-[10px] bg-red-500 text-white rounded-full px-1.5">
                {incomingRequests.length + outgoingRequests.length}
              </span>
            )}
          </button>
        ))}
        <button onClick={onAddFriend}
          className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded text-sm font-medium transition-colors"
          style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}>
          <UserPlus className="w-3.5 h-3.5" /> Add Friend
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {tab === 'Online' && friends.filter(() => true).map(f => (
          <FriendRow key={f.id} friend={f} onMessage={onMessage} onRemove={onRemove} />
        ))}
        {tab === 'All' && friends.map(f => (
          <FriendRow key={f.id} friend={f} onMessage={onMessage} onRemove={onRemove} />
        ))}
        {tab === 'Pending' && (
          <>
            {incomingRequests.map(r => <RequestRow key={r.id} request={r} type="incoming" onAccept={onAccept} onDecline={onDecline} />)}
            {outgoingRequests.map(r => <RequestRow key={r.id} request={r} type="outgoing" onAccept={onAccept} onDecline={onDecline} />)}
            {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
              <div className="text-center py-12 text-zinc-600 text-sm">No pending requests</div>
            )}
          </>
        )}
        {tab === 'Blocked' && (
          <div className="text-center py-12 text-zinc-600 text-sm">No blocked users</div>
        )}
      </div>
    </div>
  );
}