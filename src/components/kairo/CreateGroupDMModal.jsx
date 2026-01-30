import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, Users, Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CreateGroupDMModal({ isOpen, onClose, currentUser, friends = [], onCreate }) {
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const filteredFriends = friends.filter(f => 
    f.friend_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFriend = (friend) => {
    if (selectedFriends.find(f => f.friend_id === friend.friend_id)) {
      setSelectedFriends(prev => prev.filter(f => f.friend_id !== friend.friend_id));
    } else {
      setSelectedFriends(prev => [...prev, friend]);
    }
  };

  const handleCreate = async () => {
    if (selectedFriends.length === 0) return;
    
    setIsCreating(true);
    try {
      const participants = [
        { 
          user_id: currentUser.user_id || currentUser.id, 
          user_email: currentUser.user_email || currentUser.email, 
          user_name: currentUser.display_name || currentUser.full_name 
        },
        ...selectedFriends.map(f => ({
          user_id: f.friend_id,
          user_email: f.friend_email,
          user_name: f.friend_name,
          avatar: f.friend_avatar
        }))
      ];

      const conversation = await base44.entities.Conversation.create({
        type: selectedFriends.length === 1 ? 'dm' : 'group',
        name: groupName || participants.slice(1).map(p => p.user_name).join(', '),
        participants,
        last_message_at: new Date().toISOString()
      });

      onCreate?.(conversation);
      onClose();
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
    setIsCreating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md mx-4 bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-800/50"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">New Message</h2>
                <p className="text-sm text-zinc-500">Select friends to message</p>
              </div>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Selected friends */}
          {selectedFriends.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-zinc-800/50 rounded-xl">
              {selectedFriends.map(friend => (
                <div 
                  key={friend.friend_id}
                  className="flex items-center gap-2 px-2 py-1 bg-violet-500/20 rounded-lg"
                >
                  <span className="text-sm text-violet-300">{friend.friend_name}</span>
                  <button 
                    onClick={() => toggleFriend(friend)}
                    className="text-violet-400 hover:text-violet-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Group name (only for 2+ selected) */}
          {selectedFriends.length > 1 && (
            <div className="mb-4">
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name (optional)"
                className="bg-zinc-800/70 border-zinc-700/50 text-white rounded-xl"
              />
            </div>
          )}

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search friends..."
              className="pl-10 bg-zinc-800/70 border-zinc-700/50 text-white rounded-xl"
            />
          </div>

          {/* Friends list */}
          <div className="max-h-60 overflow-y-auto space-y-1">
            {filteredFriends.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No friends found</p>
              </div>
            ) : (
              filteredFriends.map(friend => {
                const isSelected = selectedFriends.find(f => f.friend_id === friend.friend_id);
                return (
                  <button
                    key={friend.friend_id || friend.id}
                    onClick={() => toggleFriend(friend)}
                    className={cn(
                      "w-full flex items-center gap-3 p-3 rounded-xl transition-colors",
                      isSelected ? "bg-violet-500/20" : "hover:bg-zinc-800/50"
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-700">
                      {friend.friend_avatar ? (
                        <img src={friend.friend_avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-violet-500 to-indigo-600 text-white font-medium">
                          {friend.friend_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="flex-1 text-left text-white font-medium">{friend.friend_name}</span>
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                      isSelected ? "bg-violet-500 border-violet-500" : "border-zinc-600"
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Create button */}
          <Button
            onClick={handleCreate}
            disabled={selectedFriends.length === 0 || isCreating}
            className="w-full mt-4 bg-violet-500 hover:bg-violet-600 rounded-xl"
          >
            {isCreating ? 'Creating...' : selectedFriends.length > 1 ? 'Create Group' : 'Start Chat'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}