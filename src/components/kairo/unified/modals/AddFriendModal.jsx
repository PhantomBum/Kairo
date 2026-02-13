import React, { useState } from 'react';
import { X, Search, UserPlus, Check, Loader2 } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function AddFriendModal({ onClose, currentUserId }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['friendSearch', search],
    queryFn: async () => {
      if (search.length < 2) return [];
      const profiles = await base44.entities.UserProfile.list();
      return profiles.filter(p => {
        if (p.user_id === currentUserId) return false;
        const dn = (p.display_name || '').toLowerCase();
        const un = (p.username || '').toLowerCase();
        const q = search.toLowerCase();
        return dn.includes(q) || un.includes(q);
      }).slice(0, 8);
    },
    enabled: search.length >= 2,
  });

  const handleSend = async (user) => {
    setStatus('sending');
    setError('');
    try {
      const existing = await base44.entities.Friendship.filter({ user_id: currentUserId });
      if (existing.some(f => f.friend_id === user.user_id)) {
        setError('Already friends or pending request');
        setStatus('error');
        return;
      }
      await base44.entities.Friendship.create({
        user_id: currentUserId, friend_id: user.user_id, friend_email: user.user_email,
        friend_name: user.display_name, friend_avatar: user.avatar_url,
        status: 'pending', initiated_by: currentUserId,
      });
      setStatus('success');
      qc.invalidateQueries({ queryKey: ['friends'] });
      qc.invalidateQueries({ queryKey: ['outgoingRequests'] });
      setTimeout(() => { setStatus(null); setSearch(''); }, 2000);
    } catch (e) {
      setError(e.message || 'Failed to send request');
      setStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 rounded-xl overflow-hidden" style={{ background: '#1a1a1a' }}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Add Friend</h2>
            <button onClick={onClose}><X className="w-5 h-5 text-zinc-500 hover:text-white" /></button>
          </div>
          <p className="text-sm text-zinc-500 mb-3">Search by username or display name</p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input value={search} onChange={e => { setSearch(e.target.value); setStatus(null); setError(''); }}
              placeholder="Enter a username..." autoFocus
              className="w-full h-10 pl-9 pr-3 rounded-lg text-sm text-white placeholder:text-zinc-600 focus:outline-none" style={{ background: '#111' }} />
            {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 animate-spin" />}
          </div>

          {status === 'success' && (
            <div className="mt-3 flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Check className="w-4 h-4 text-emerald-400" /><span className="text-sm text-emerald-400">Friend request sent!</span>
            </div>
          )}
          {error && (
            <div className="mt-3 text-sm text-red-400 px-1">{error}</div>
          )}

          {results.length > 0 && status !== 'success' && (
            <div className="mt-3 space-y-1 max-h-64 overflow-y-auto">
              {results.map(user => (
                <button key={user.id} onClick={() => handleSend(user)} disabled={status === 'sending'}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.04] disabled:opacity-50 transition-colors">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs overflow-hidden" style={{ background: '#222' }}>
                    {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : (user.display_name || 'U').charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-white truncate">{user.display_name}</p>
                    {user.username && <p className="text-xs text-zinc-500">@{user.username}</p>}
                  </div>
                  <UserPlus className="w-4 h-4 text-zinc-500" />
                </button>
              ))}
            </div>
          )}
          {search.length >= 2 && results.length === 0 && !isLoading && (
            <div className="text-center py-6 text-sm text-zinc-500">No users found matching "{search}"</div>
          )}
        </div>
      </div>
    </div>
  );
}