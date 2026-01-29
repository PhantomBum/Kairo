import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, Search, Trash2, ExternalLink, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SavedMessages({ currentUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: savedMessages = [] } = useQuery({
    queryKey: ['savedMessages', currentUser?.id],
    queryFn: async () => {
      // Fetch messages where user has bookmarked
      const allMessages = await base44.entities.Message.list('-created_date', 500);
      return allMessages.filter(m => m.bookmarked_by?.includes(currentUser?.id));
    },
    enabled: !!currentUser?.id
  });

  const unsaveMutation = useMutation({
    mutationFn: async (messageId) => {
      const message = savedMessages.find(m => m.id === messageId);
      const newBookmarks = (message.bookmarked_by || []).filter(id => id !== currentUser.id);
      await base44.entities.Message.update(messageId, { bookmarked_by: newBookmarks });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedMessages'] });
    }
  });

  const filteredMessages = savedMessages.filter(m =>
    m.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0b]">
      {/* Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-zinc-800/50 bg-[#0f0f11]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Saved Messages</h1>
            <p className="text-sm text-zinc-500">{savedMessages.length} saved items</p>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved messages..."
            className="w-80 pl-10 bg-zinc-900 border-zinc-800"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-20">
              <Bookmark className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-zinc-400 mb-2">
                {searchQuery ? 'No messages found' : 'No saved messages yet'}
              </h3>
              <p className="text-sm text-zinc-600">
                {searchQuery ? 'Try a different search term' : 'Save important messages to find them here later'}
              </p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium flex-shrink-0">
                    {message.author_name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-medium text-white">{message.author_name}</span>
                      <span className="text-xs text-zinc-500">
                        {new Date(message.created_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 break-words">{message.content}</p>
                    {message.attachments?.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {message.attachments.map((att, idx) => (
                          <div key={idx} className="text-xs text-zinc-500 flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            {att.filename}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => unsaveMutation.mutate(message.id)}
                    className="text-zinc-500 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}