import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, UserPlus, Search, Check, AlertCircle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function AddFriendModal({ isOpen, onClose, onSendRequest }) {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState(null); // null | 'sending' | 'success' | 'error'
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search for users as typing
  const handleSearch = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const allProfiles = await base44.entities.UserProfile.list();
      const matches = allProfiles.filter(p => {
        const displayName = (p.display_name || '').toLowerCase();
        const userName = (p.username || '').toLowerCase();
        const searchQuery = query.toLowerCase();
        return displayName.includes(searchQuery) || userName.includes(searchQuery);
      }).slice(0, 5);
      setSearchResults(matches);
    } catch (err) {
      console.error('Search error:', err);
    }
    setIsSearching(false);
  };

  const handleSend = async (targetUser) => {
    const target = targetUser || searchResults.find(u => 
      u.username?.toLowerCase() === username.toLowerCase() || 
      u.display_name?.toLowerCase() === username.toLowerCase()
    );
    
    if (!target && !username.trim()) return;

    setStatus('sending');
    setError('');

    try {
      if (target) {
        await onSendRequest?.(target.username || target.display_name);
      } else {
        await onSendRequest?.(username.trim());
      }
      setStatus('success');
      setSearchResults([]);
      setTimeout(() => {
        setUsername('');
        setStatus(null);
      }, 2000);
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Could not send friend request');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md mx-4 bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-800/50"
      >
        {/* Header */}
        <div className="p-6 pb-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-500/20 flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-violet-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Add Friend</h2>
          <p className="text-sm text-zinc-500">
            You can add friends with their Kairo username.
          </p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="space-y-4">
            <div className="relative">
              <Input
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setStatus(null);
                  setError('');
                  handleSearch(e.target.value);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Search by username or display name"
                className={cn(
                  "w-full h-12 bg-zinc-800/70 border-zinc-700/50 text-white placeholder-zinc-500 pr-24 rounded-xl",
                  status === 'success' && "border-emerald-500 focus:ring-emerald-500",
                  status === 'error' && "border-rose-500 focus:ring-rose-500"
                )}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!username.trim() || status === 'sending'}
                className={cn(
                  "absolute right-1.5 top-1.5 h-9 rounded-lg",
                  status === 'success' 
                    ? "bg-emerald-500 hover:bg-emerald-600" 
                    : "bg-violet-500 hover:bg-violet-600"
                )}
              >
                {status === 'sending' ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : status === 'success' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  'Send'
                )}
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && status !== 'success' && (
              <div className="bg-zinc-800/50 rounded-xl border border-zinc-700/50 overflow-hidden">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSend(user)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-medium">{user.display_name?.charAt(0) || '?'}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{user.display_name}</p>
                      <p className="text-xs text-zinc-500">@{user.username}</p>
                    </div>
                    <UserPlus className="w-4 h-4 text-zinc-500" />
                  </button>
                ))}
              </div>
            )}

            {status === 'success' && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-emerald-400 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Friend request sent!
              </motion.p>
            )}

            {status === 'error' && error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-400 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.p>
            )}
          </div>
        </div>

        {/* Tip */}
        <div className="px-6 py-4 bg-zinc-800/30 border-t border-zinc-800/50">
          <p className="text-xs text-zinc-500 text-center">
            💡 Tip: You can also right-click on a user to add them as a friend
          </p>
        </div>
      </motion.div>
    </div>
  );
}