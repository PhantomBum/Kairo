import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Plus, Trash2, Edit2, Archive } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function SpacesView({ currentUser }) {
  const [showCreate, setShowCreate] = useState(false);
  const [newSpace, setNewSpace] = useState({ name: '', description: '' });
  const queryClient = useQueryClient();

  const { data: spaces = [] } = useQuery({
    queryKey: ['spaces', currentUser?.id],
    queryFn: async () => {
      // Using Draft entity to store spaces temporarily
      const drafts = await base44.entities.Draft.filter({ user_id: currentUser?.id });
      return drafts.filter(d => d.content?.startsWith('SPACE:'));
    },
    enabled: !!currentUser?.id
  });

  const createSpaceMutation = useMutation({
    mutationFn: async (spaceData) => {
      await base44.entities.Draft.create({
        user_id: currentUser.id,
        content: `SPACE:${spaceData.name}`,
        attachments: [{ description: spaceData.description, items: [] }]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
      setShowCreate(false);
      setNewSpace({ name: '', description: '' });
    }
  });

  const deleteSpaceMutation = useMutation({
    mutationFn: async (spaceId) => {
      await base44.entities.Draft.delete(spaceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spaces'] });
    }
  });

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0b]">
      {/* Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-zinc-800/50 bg-[#0f0f11]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Spaces</h1>
            <p className="text-sm text-zinc-500">Organize your content</p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Space
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto">
          {spaces.length === 0 && !showCreate ? (
            <div className="text-center py-20">
              <Layers className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-zinc-400 mb-2">No spaces yet</h3>
              <p className="text-sm text-zinc-600 mb-6">Create spaces to organize servers, channels, and conversations</p>
              <Button
                onClick={() => setShowCreate(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Space
              </Button>
            </div>
          ) : (
            <>
              <AnimatePresence>
                {showCreate && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800 mb-6"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">Create New Space</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Name</label>
                        <Input
                          value={newSpace.name}
                          onChange={(e) => setNewSpace({ ...newSpace, name: e.target.value })}
                          placeholder="Work Projects"
                          className="bg-zinc-800 border-zinc-700"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
                        <Textarea
                          value={newSpace.description}
                          onChange={(e) => setNewSpace({ ...newSpace, description: e.target.value })}
                          placeholder="Organize all work-related servers and channels"
                          className="bg-zinc-800 border-zinc-700 h-20"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => createSpaceMutation.mutate(newSpace)}
                          disabled={!newSpace.name}
                          className="bg-purple-500 hover:bg-purple-600"
                        >
                          Create Space
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => setShowCreate(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {spaces.map((space) => (
                  <motion.div
                    key={space.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800 hover:border-zinc-700 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <Archive className="w-6 h-6 text-white" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteSpaceMutation.mutate(space.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {space.content?.replace('SPACE:', '')}
                    </h3>
                    <p className="text-sm text-zinc-500">
                      {space.attachments?.[0]?.description || 'No description'}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-xs text-zinc-600">
                      <Layers className="w-3 h-3" />
                      0 items
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}