import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Hash, User, Check } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function ForwardMessageModal({ 
  message, 
  channels = [], 
  conversations = [], 
  currentUser,
  isOpen, 
  onClose 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const queryClient = useQueryClient();

  const filteredChannels = channels.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConversations = conversations.filter(c => 
    c.participants?.some(p => 
      p.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const forwardMutation = useMutation({
    mutationFn: async (destinations) => {
      for (const dest of destinations) {
        if (dest.type === 'channel') {
          await base44.entities.Message.create({
            channel_id: dest.id,
            server_id: dest.server_id,
            author_id: currentUser.id,
            author_name: currentUser.display_name || currentUser.full_name,
            author_avatar: currentUser.avatar_url,
            author_badges: currentUser.badges || [],
            content: `📩 Forwarded: ${message.content}`,
            type: 'default'
          });
        } else {
          await base44.entities.DirectMessage.create({
            conversation_id: dest.id,
            author_id: currentUser.id,
            author_name: currentUser.display_name || currentUser.full_name,
            author_avatar: currentUser.avatar_url,
            content: `📩 Forwarded: ${message.content}`,
            type: 'default'
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['dmMessages'] });
      onClose();
    }
  });

  const handleToggle = (item) => {
    setSelected(prev => {
      const exists = prev.find(s => s.id === item.id && s.type === item.type);
      if (exists) {
        return prev.filter(s => !(s.id === item.id && s.type === item.type));
      }
      return [...prev, item];
    });
  };

  const handleForward = () => {
    if (selected.length === 0) return;
    forwardMutation.mutate(selected);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80"
          onClick={onClose}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-md shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <h2 className="text-lg font-bold text-white">Forward Message</h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-zinc-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Search channels or DMs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-zinc-800 border-zinc-700"
              />
            </div>
            {selected.length > 0 && (
              <p className="text-xs text-zinc-500 mt-2">
                {selected.length} selected
              </p>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto p-2">
            {/* Channels */}
            {filteredChannels.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-semibold text-zinc-500 uppercase px-2 py-1">Channels</p>
                {filteredChannels.map((channel) => {
                  const isSelected = selected.some(s => s.id === channel.id && s.type === 'channel');
                  return (
                    <button
                      key={channel.id}
                      onClick={() => handleToggle({ ...channel, type: 'channel' })}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        isSelected ? "bg-indigo-500/20 text-white" : "hover:bg-zinc-800 text-zinc-300"
                      )}
                    >
                      <Hash className="w-4 h-4 text-zinc-500" />
                      <span className="flex-1 text-left text-sm">{channel.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* DMs */}
            {filteredConversations.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase px-2 py-1">Direct Messages</p>
                {filteredConversations.map((convo) => {
                  const isSelected = selected.some(s => s.id === convo.id && s.type === 'dm');
                  const otherUser = convo.participants?.find(p => p.user_email !== currentUser.email);
                  return (
                    <button
                      key={convo.id}
                      onClick={() => handleToggle({ ...convo, type: 'dm' })}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                        isSelected ? "bg-indigo-500/20 text-white" : "hover:bg-zinc-800 text-zinc-300"
                      )}
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <User className="w-3 h-3 text-white" />
                      </div>
                      <span className="flex-1 text-left text-sm">{otherUser?.user_name || 'Unknown'}</span>
                      {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                    </button>
                  );
                })}
              </div>
            )}

            {filteredChannels.length === 0 && filteredConversations.length === 0 && (
              <div className="text-center py-8 text-zinc-500">
                <p className="text-sm">No channels or DMs found</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-zinc-800 flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleForward} 
              disabled={selected.length === 0 || forwardMutation.isPending}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600"
            >
              {forwardMutation.isPending ? 'Forwarding...' : `Forward to ${selected.length || ''}`}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}