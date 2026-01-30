import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, Hash, Volume2, Video, Megaphone, MessagesSquare, 
  ImageIcon, Lock, Users, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const channelTypes = [
  { id: 'text', name: 'Text', description: 'Send messages, images, GIFs, and more', icon: Hash },
  { id: 'voice', name: 'Voice', description: 'Hang out together with voice and video', icon: Volume2 },
  { id: 'forum', name: 'Forum', description: 'Create organized discussions', icon: MessagesSquare },
  { id: 'announcement', name: 'Announcement', description: 'Important updates and news', icon: Megaphone },
  { id: 'media', name: 'Media', description: 'Share photos and videos', icon: ImageIcon },
  { id: 'stage', name: 'Stage', description: 'Host events and broadcasts', icon: Users },
];

export default function CreateChannelModal({ 
  isOpen, 
  onClose, 
  onCreate, 
  categories = [],
  defaultCategoryId 
}) {
  const [channelName, setChannelName] = useState('');
  const [channelType, setChannelType] = useState('text');
  const [categoryId, setCategoryId] = useState(defaultCategoryId || '');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!channelName.trim()) return;

    setIsCreating(true);
    try {
      await onCreate({
        name: channelName.trim().toLowerCase().replace(/\s+/g, '-'),
        type: channelType,
        category_id: categoryId || null,
        is_private: isPrivate
      });

      setChannelName('');
      setChannelType('text');
      setCategoryId(defaultCategoryId || '');
      setIsPrivate(false);
      onClose();
    } catch (error) {
      console.error('Failed to create channel:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  const selectedType = channelTypes.find(t => t.id === channelType);
  const Icon = selectedType?.icon || Hash;

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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative w-full max-w-md mx-4 bg-[#121214] rounded-xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-white">Create Channel</h2>
            <button
              onClick={onClose}
              className="p-1 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-zinc-500">
            in {categories.find(c => c.id === categoryId)?.name || 'Server'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Channel Type */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase text-zinc-400">
              Channel Type
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {channelTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setChannelType(type.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                    channelType === type.id
                      ? "border-indigo-500 bg-indigo-500/10"
                      : "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50"
                  )}
                >
                  <type.icon className={cn(
                    "w-5 h-5",
                    channelType === type.id ? "text-indigo-400" : "text-zinc-400"
                  )} />
                  <div>
                    <span className="text-sm font-medium text-white block">{type.name}</span>
                    <span className="text-xs text-zinc-500 line-clamp-1">{type.description}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Channel Name */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase text-zinc-400">
              Channel Name
            </Label>
            <div className="relative">
              <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              <Input
                value={channelName}
                onChange={(e) => setChannelName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="new-channel"
                className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder-zinc-600"
              />
            </div>
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-zinc-400">
                Category
              </Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectValue placeholder="No Category" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value={null}>No Category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Private Channel Toggle */}
          <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-zinc-400" />
              <div>
                <h4 className="font-medium text-white text-sm">Private Channel</h4>
                <p className="text-xs text-zinc-500">Only selected members can view</p>
              </div>
            </div>
            <Switch
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} className="text-zinc-400 hover:text-white">
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!channelName.trim() || isCreating}
            className="bg-indigo-500 hover:bg-indigo-600"
          >
            {isCreating ? 'Creating...' : 'Create Channel'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}