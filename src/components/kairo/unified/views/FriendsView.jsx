import React, { useState } from 'react';
import { MessageSquare, UserPlus, Check, X, UserMinus, Search, MoreHorizontal } from 'lucide-react';

const tabs = ['Online', 'All', 'Pending', 'Blocked'];

function FriendRow({ friend, onMessage, onRemove }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/[0.03] group">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)' }}>
        {friend.friend_avatar ? <img src={friend.friend_avatar} className="w-full h-full object-cover" /> : <span className="text-zinc-500">{(friend.friend_name || 'U').charAt(0).toUpperCase()}</span>}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-white truncate">{friend.friend_name || 'User'}</div>
        <div className="text-[11px] text-zinc-600">Click to view profile</div>
      </div>
      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onMessage(friend)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-white/[0.06]"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          <MessageSquare className="w-4 h-4 text-zinc-400" />
        </button>
        <button onClick={() => onRemove(friend)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-red-500/10"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          <UserMinus className="w-4 h-4 text-zinc-400" />
        </button>
      </div>
    </div>
  );
}

function RequestRow({ request, type, onAccept, onDecline }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-white/[0.03]">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <span className="text-zinc-500">{(request.friend_name || request.initiated_by || 'U').charAt(0).toUpperCase()}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-white">{request.friend_name || request.initiated_by || 'User'}</div>
        <div className="text-[11px] text-zinc-600">{type === 'incoming' ? 'Incoming friend request' : 'Outgoing friend request'}</div>
      </div>
      {type === 'incoming' && (
        <div className="flex gap-1.5">
          <button onClick={() => onAccept(request)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-green-500/10" style={{ background: 'rgba(34,197,94,0.06)' }}>
            <Check className="w-4 h-4 text-green-400" />
          </button>
          <button onClick={() => onDecline(request)} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:bg-red-500/10" style={{ background: 'rgba(239,68,68,0.06)' }}>
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function FriendsView({ friends, incomingRequests, outgoingRequests, onAddFriend, onMessage, onAccept, onDecline, onRemove }) {
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = friends.filter(f => !search || f.friend_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ background: '#0e0e0e' }}>
      {/* Header */}
      <div className="h-12 px-5 flex items-center flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span className="text-[15px] font-semibold text-white">Friends</span>
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className="px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all"
            style={{ background: tab === t ? 'rgba(255,255,255,0.08)' : 'transparent', color: tab === t ? '#fff' : '#666' }}>
            {t}
            {t === 'Pending' && (incomingRequests.length + outgoingRequests.length) > 0 && (
              <span className="ml-1.5 text-[9px] bg-red-500 text-white rounded-full px-1.5 py-0.5 font-bold">{incomingRequests.length + outgoingRequests.length}</span>
            )}
          </button>
        ))}
        <button onClick={onAddFriend}
          className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-semibold transition-all hover:shadow-lg"
          style={{ background: '#fff', color: '#000' }}>
          <UserPlus className="w-3.5 h-3.5" /> Add Friend
        </button>
      </div>

      {/* Search */}
      {(tab === 'All' || tab === 'Online') && (
        <div className="px-4 pt-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search friends..."
              className="w-full h-10 pl-10 pr-3 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }} />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        {(tab === 'Online' || tab === 'All') && (
          <>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 px-3 py-2">
              {tab === 'Online' ? 'Online' : 'All Friends'} — {filtered.length}
            </div>
            {filtered.map(f => <FriendRow key={f.id} friend={f} onMessage={onMessage} onRemove={onRemove} />)}
            {filtered.length === 0 && (
              <div className="text-center py-16 text-zinc-600 text-sm">
                {search ? 'No friends match your search' : 'No friends yet. Add some!'}
              </div>
            )}
          </>
        )}
        {tab === 'Pending' && (
          <>
            {incomingRequests.length > 0 && <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 px-3 py-2">Incoming — {incomingRequests.length}</div>}
            {incomingRequests.map(r => <RequestRow key={r.id} request={r} type="incoming" onAccept={onAccept} onDecline={onDecline} />)}
            {outgoingRequests.length > 0 && <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 px-3 py-2 mt-3">Outgoing — {outgoingRequests.length}</div>}
            {outgoingRequests.map(r => <RequestRow key={r.id} request={r} type="outgoing" onAccept={onAccept} onDecline={onDecline} />)}
            {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
              <div className="text-center py-16 text-zinc-600 text-sm">No pending requests</div>
            )}
          </>
        )}
        {tab === 'Blocked' && <div className="text-center py-16 text-zinc-600 text-sm">No blocked users</div>}
      </div>
    </div>
  );
}