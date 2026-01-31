import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, Check, AlertCircle, Loader2, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';

export default function AddFriendModal({ isOpen, onClose, onSendRequest, currentUserId }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(null);
  const [error, setError] = useState('');

  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['userSearch', search],
    queryFn: async () => {
      if (search.length < 2) return [];
      const profiles = await base44.entities.UserProfile.list();
      return profiles.filter(p => {
        if (p.user_id === currentUserId) return false;
        const displayName = (p.display_name || '').toLowerCase();
        const username = (p.username || '').toLowerCase();
        const query = search.toLowerCase();
        return displayName.includes(query) || username.includes(query);
      }).slice(0, 6);
    },
    enabled: search.length >= 2,
  });

  const handleSendRequest = async (user) => {
    setStatus('sending');
    setError('');
    
    try {
      await onSendRequest(user.username || user.display_name, user);
      setStatus('success');
      setTimeout(() => {
        setStatus(null);
        setSearch('');
      }, 2000);
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Failed to send friend request');
    }
  };

  const handleClose = () => {
    setSearch('');
    setStatus(null);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-md mx-4 bg-[#0c0c0e] border border-white/[0.08] rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 pb-4 text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Add Friend</h2>
          <p className="text-sm text-zinc-500 mt-1">Search by username or display name</p>
        </div>
        
        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setStatus(null);
                setError('');
              }}
              placeholder="Enter a username..."
              autoFocus
              className="w-full h-11 pl-10 pr-10 text-sm bg-[#0a0a0c] border border-white/[0.08] rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 animate-spin" />
            )}
          </div>

          {/* Status messages */}
          {status === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">Friend request sent!</span>
            </div>
          )}

          {status === 'error' && error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{error}</span>
            </div>
          )}

          {/* Search results */}
          {searchResults.length > 0 && status !== 'success' && (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSendRequest(user)}
                  disabled={status === 'sending'}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] disabled:opacity-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center overflow-hidden">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-medium">{user.display_name?.charAt(0)}</span>
                    )}
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

          {/* Empty state */}
          {search.length >= 2 && searchResults.length === 0 && !isSearching && (
            <div className="text-center py-8">
              <p className="text-sm text-zinc-500">No users found matching "{search}"</p>
            </div>
          )}

          {/* Hint */}
          {search.length < 2 && (
            <p className="text-xs text-zinc-600 text-center">Type at least 2 characters to search</p>
          )}
        </div>
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </motion.div>
  );
}