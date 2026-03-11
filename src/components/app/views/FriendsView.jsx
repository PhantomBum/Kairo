import React, { useState } from 'react';
import { Users, UserPlus, Check, X, MessageSquare, Trash2, Clock, Search } from 'lucide-react';

const statusColors = { online: '#7bc9a4', idle: '#c9b47b', dnd: '#c97b7b', invisible: '#555248', offline: '#555248' };
const TABS = ['all', 'online', 'pending'];

export default function FriendsView({ friends, incomingRequests, outgoingRequests, onAddFriend, onMessage, onAccept, onDecline, onRemove }) {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = (friends || []).filter(f => {
    if (search && !f.friend_name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="h-12 px-4 flex items-center gap-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <Users className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
        <span className="text-[14px] font-semibold" style={{ color: 'var(--text-cream)', fontFamily: 'monospace' }}>Friends</span>
        <div className="flex gap-0.5 ml-4">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className="px-3 py-1 rounded-lg text-[12px] transition-colors capitalize"
              style={{ background: tab === t ? 'var(--bg-glass-active)' : 'transparent', color: tab === t ? 'var(--text-cream)' : 'var(--text-muted)' }}>
              {t} {t === 'pending' && (incomingRequests.length + outgoingRequests.length > 0) ? `(${incomingRequests.length + outgoingRequests.length})` : ''}
            </button>
          ))}
        </div>
        <button onClick={onAddFriend} className="ml-auto px-3 py-1.5 rounded-xl text-[12px] font-medium flex items-center gap-1.5"
          style={{ background: 'var(--accent-green)', color: '#000' }}>
          <UserPlus className="w-3 h-3" /> Add Friend
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border)' }}>
          <Search className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search friends..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--text-faint)]" style={{ color: 'var(--text-primary)' }} />
        </div>

        {tab === 'pending' ? (
          <div className="space-y-2">
            {incomingRequests.length > 0 && <p className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1 pb-1" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Incoming — {incomingRequests.length}</p>}
            {incomingRequests.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: 'var(--bg-glass)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>{(r.friend_name || r.created_by || '?').charAt(0).toUpperCase()}</div>
                <div className="flex-1"><p className="text-sm" style={{ color: 'var(--text-cream)' }}>{r.friend_name || r.created_by}</p><p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Wants to be friends</p></div>
                <button onClick={() => onAccept(r)} className="p-2 rounded-lg hover:bg-[var(--bg-glass-hover)]"><Check className="w-4 h-4" style={{ color: 'var(--accent-green)' }} /></button>
                <button onClick={() => onDecline(r)} className="p-2 rounded-lg hover:bg-[var(--bg-glass-hover)]"><X className="w-4 h-4" style={{ color: 'var(--accent-red)' }} /></button>
              </div>
            ))}
            {outgoingRequests.length > 0 && <p className="text-[10px] font-semibold uppercase tracking-[0.08em] px-1 py-1 mt-3" style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>Outgoing — {outgoingRequests.length}</p>}
            {outgoingRequests.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-3 rounded-xl" style={{ background: 'var(--bg-glass)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>{(r.friend_name || '?').charAt(0).toUpperCase()}</div>
                <div className="flex-1"><p className="text-sm" style={{ color: 'var(--text-primary)' }}>{r.friend_name}</p></div>
                <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
              </div>
            ))}
            {incomingRequests.length === 0 && outgoingRequests.length === 0 && <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No pending requests</p>}
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.length === 0 && <p className="text-center py-8 text-sm" style={{ color: 'var(--text-muted)' }}>No friends yet</p>}
            {filtered.map(f => (
              <div key={f.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl group transition-colors hover:bg-[var(--bg-glass)]">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium overflow-hidden" style={{ background: 'var(--bg-glass-strong)', color: 'var(--text-muted)' }}>
                    {f.friend_avatar ? <img src={f.friend_avatar} className="w-full h-full object-cover" /> : (f.friend_name || '?').charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: 'var(--text-cream)' }}>{f.friend_name}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => onMessage(f)} className="p-2 rounded-lg hover:bg-[var(--bg-glass-hover)]"><MessageSquare className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} /></button>
                  <button onClick={() => onRemove(f)} className="p-2 rounded-lg hover:bg-[var(--bg-glass-hover)]"><Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--accent-red)' }} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}