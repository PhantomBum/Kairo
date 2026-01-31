import React, { useState } from 'react';
import { UserPlus, Search, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import Modal from '../primitives/Modal';
import Button from '../primitives/Button';
import Input from '../primitives/Input';
import Avatar from '../primitives/Avatar';

export default function AddFriendModal({ isOpen, onClose, onSendRequest, currentUserId }) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(null); // null | 'sending' | 'success' | 'error'
  const [error, setError] = useState('');

  // Search for users
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Friend"
      description="Search by username or display name"
      icon={<UserPlus className="w-5 h-5" />}
      size="sm"
    >
      <div className="space-y-4">
        {/* Search input */}
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setStatus(null);
            setError('');
          }}
          placeholder="Enter a username..."
          leftIcon={<Search className="w-4 h-4" />}
          rightIcon={isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          autoFocus
        />

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
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
                  'bg-white/[0.02] hover:bg-white/[0.06]',
                  'disabled:opacity-50 disabled:pointer-events-none'
                )}
              >
                <Avatar
                  src={user.avatar_url}
                  name={user.display_name}
                  size="md"
                />
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-white truncate">
                    {user.display_name}
                  </p>
                  {user.username && (
                    <p className="text-xs text-zinc-500">@{user.username}</p>
                  )}
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
          <p className="text-xs text-zinc-600 text-center">
            Type at least 2 characters to search
          </p>
        )}
      </div>
    </Modal>
  );
}