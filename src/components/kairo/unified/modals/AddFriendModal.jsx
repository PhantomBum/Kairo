import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Search, UserPlus, Check, Loader2, AtSign } from 'lucide-react';
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md mx-4 rounded-2xl overflow-hidden" style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl font-bold text-white">Add Friend</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all"><X className="w-4 h-4" /></button>
          </div>
          <p className="text-sm text-zinc-500 mb-4">You can add friends by their username or display name.</p>
          <div className="relative">
            <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input value={search} onChange={e => { setSearch(e.target.value); setStatus(null); setError(''); }}
              placeholder="Enter a username..." autoFocus
              className="w-full h-11 pl-10 pr-3 rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all"
              style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.06)' }} />
            {isLoading && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 animate-spin" />}
          </div>

          {status === 'success' && (
            <div className="mt-4 flex items-center gap-2.5 p-3.5 rounded-xl" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <Check className="w-4 h-4 text-emerald-400" /><span className="text-sm text-emerald-400">Friend request sent successfully!</span>
            </div>
          )}
          {error && <div className="mt-3 text-sm text-red-400 px-1 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />{error}</div>}

          {results.length > 0 && status !== 'success' && (
            <div className="mt-4 space-y-1 max-h-[280px] overflow-y-auto scrollbar-thin">
              {results.map(user => (
                <button key={user.id} onClick={() => handleSend(user)} disabled={status === 'sending'}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] disabled:opacity-50 transition-all">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" /> : <span className="text-zinc-500">{(user.display_name || 'U').charAt(0)}</span>}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-white truncate">{user.display_name}</p>
                    {user.username && <p className="text-[11px] text-zinc-500">@{user.username}</p>}
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <UserPlus className="w-4 h-4 text-zinc-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
          {search.length >= 2 && results.length === 0 && !isLoading && (
            <div className="text-center py-8 text-sm text-zinc-600">No users found matching "{search}"</div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}