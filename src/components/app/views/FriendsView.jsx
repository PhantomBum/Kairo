import React, { useState } from 'react';
import { UserPlus, MessageSquare, X, Check, Search } from 'lucide-react';

function FriendRow({ friend, onMessage, onRemove }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg group hover:bg-[var(--bg-hover)] transition-colors">
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium overflow-hidden"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
        {friend.friend_avatar ? <img src={friend.friend_avatar} className="w-full h-full object-cover" /> : (friend.friend_name || 'U').charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{friend.friend_name || 'User'}</div>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onMessage(friend)} className="p-1.5 rounded-md hover:bg-[var(--bg-active)]">
          <MessageSquare className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        </button>
        <button onClick={() => onRemove(friend)} className="p-1.5 rounded-md hover:bg-[var(--bg-active)]">
          <X className="w-4 h-4 text-red-400" />
        </button>
      </div>
    </div>
  );
}

function RequestRow({ request, isIncoming, onAccept, onDecline }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
        style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
        {(request.friend_name || request.initiated_by || 'U').charAt(0).toUpperCase()}
      </div>
      <div className="flex-1">
        <div className="text-sm" style={{ color: 'var(--text-primary)' }}>{request.friend_name || request.friend_email || 'User'}</div>
        <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{isIncoming ? 'Incoming request' : 'Outgoing request'}</div>
      </div>
      {isIncoming && (
        <div className="flex gap-1">
          <button onClick={() => onAccept(request)} className="p-1.5 rounded-md hover:bg-[var(--bg-hover)]">
            <Check className="w-4 h-4 text-green-400" />
          </button>
          <button onClick={() => onDecline(request)} className="p-1.5 rounded-md hover:bg-[var(--bg-hover)]">
            <X className="w-4 h-4 text-red-400" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function FriendsView({ friends, incomingRequests, outgoingRequests, onAddFriend, onMessage, onAccept, onDecline, onRemove }) {
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: `Pending${(incomingRequests.length + outgoingRequests.length) > 0 ? ` (${incomingRequests.length + outgoingRequests.length})` : ''}` },
  ];

  const filtered = friends.filter(f => (f.friend_name || '').toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <div className="h-12 px-4 flex items-center gap-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Friends</span>
        <div className="flex gap-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
              style={{ background: tab === t.id ? 'var(--accent-dim)' : 'transparent', color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={onAddFriend} className="ml-auto px-3 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: 'var(--text-primary)', color: 'var(--bg)' }}>
          <UserPlus className="w-3.5 h-3.5 inline mr-1.5" />Add Friend
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 max-w-2xl">
        {tab === 'all' && (
          <>
            <div className="mb-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border)' }}>
                <Search className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search friends..."
                  className="flex-1 bg-transparent text-sm outline-none" style={{ color: 'var(--text-primary)' }} />
              </div>
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: 'var(--text-muted)' }}>
              Friends — {filtered.length}
            </div>
            <div className="space-y-0.5">
              {filtered.map(f => <FriendRow key={f.id} friend={f} onMessage={onMessage} onRemove={onRemove} />)}
            </div>
          </>
        )}
        {tab === 'pending' && (
          <div className="space-y-1">
            {incomingRequests.map(r => <RequestRow key={r.id} request={r} isIncoming onAccept={onAccept} onDecline={onDecline} />)}
            {outgoingRequests.map(r => <RequestRow key={r.id} request={r} />)}
            {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
              <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No pending requests</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}