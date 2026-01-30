import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Plus, Search, Trash2, Upload, Smile, X, Image,
  Loader2, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function EmojiCard({ emoji, onDelete, canDelete }) {
  const [showDelete, setShowDelete] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="relative group"
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <div className="w-16 h-16 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700 hover:border-zinc-600 transition-colors">
        <img 
          src={emoji.image_url} 
          alt={emoji.name}
          className={cn(
            "w-10 h-10 object-contain",
            emoji.is_animated && "animate-pulse"
          )}
        />
      </div>
      <p className="text-xs text-zinc-500 text-center mt-1 truncate">
        :{emoji.name}:
      </p>
      
      <AnimatePresence>
        {showDelete && canDelete && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => onDelete(emoji)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function UploadEmojiModal({ isOpen, onClose, serverId, currentUser }) {
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  
  const queryClient = useQueryClient();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 256 * 1024) {
        setError('File must be under 256KB');
        return;
      }
      if (!selectedFile.type.startsWith('image/')) {
        setError('File must be an image');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError('');
      
      // Auto-generate name from filename
      if (!name) {
        const autoName = selectedFile.name.split('.')[0].replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
        setName(autoName);
      }
    }
  };

  const handleUpload = async () => {
    if (!file || !name) return;
    
    setUploading(true);
    setError('');
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      await base44.entities.ServerEmoji.create({
        server_id: serverId,
        name: name.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        image_url: file_url,
        is_animated: file.type === 'image/gif',
        uploaded_by: currentUser?.id,
        uploaded_by_name: currentUser?.display_name || currentUser?.full_name
      });
      
      queryClient.invalidateQueries({ queryKey: ['serverEmojis', serverId] });
      onClose();
      setName('');
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError('Failed to upload emoji');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Upload Emoji</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="flex items-center justify-center">
            <div className="w-24 h-24 bg-zinc-800 rounded-xl border-2 border-dashed border-zinc-700 flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="Preview" className="w-16 h-16 object-contain" />
              ) : (
                <Image className="w-8 h-8 text-zinc-600" />
              )}
            </div>
          </div>

          {/* Upload */}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="emoji-upload"
            />
            <label htmlFor="emoji-upload">
              <Button variant="outline" className="w-full cursor-pointer" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </span>
              </Button>
            </label>
            <p className="text-xs text-zinc-500 mt-2 text-center">
              Max 256KB • PNG, JPG, GIF supported
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="text-sm text-zinc-400 mb-1 block">Emoji Name</label>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">:</span>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'))}
                placeholder="emoji_name"
                className="bg-zinc-800 border-zinc-700"
              />
              <span className="text-zinc-500">:</span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <Button 
            onClick={handleUpload} 
            disabled={!file || !name || uploading}
            className="w-full bg-indigo-500 hover:bg-indigo-600"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Emoji'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function EmojiManager({ server, currentUser }) {
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: emojis = [], isLoading } = useQuery({
    queryKey: ['serverEmojis', server?.id],
    queryFn: () => base44.entities.ServerEmoji.filter({ server_id: server.id }),
    enabled: !!server?.id
  });

  const deleteMutation = useMutation({
    mutationFn: (emoji) => base44.entities.ServerEmoji.delete(emoji.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['serverEmojis', server?.id] })
  });

  const filteredEmojis = emojis.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const isOwner = server?.owner_id === currentUser?.id;
  const maxEmojis = 50; // Free tier limit

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Server Emojis</h2>
          <p className="text-sm text-zinc-500">{emojis.length} / {maxEmojis} slots used</p>
        </div>
        <Button 
          onClick={() => setShowUpload(true)}
          disabled={emojis.length >= maxEmojis}
          className="bg-indigo-500 hover:bg-indigo-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Emoji
        </Button>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-500 transition-all"
          style={{ width: `${(emojis.length / maxEmojis) * 100}%` }}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search emojis..."
          className="pl-10 bg-zinc-800 border-zinc-700"
        />
      </div>

      {/* Emoji Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : filteredEmojis.length > 0 ? (
        <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
          <AnimatePresence>
            {filteredEmojis.map(emoji => (
              <EmojiCard
                key={emoji.id}
                emoji={emoji}
                onDelete={() => deleteMutation.mutate(emoji)}
                canDelete={isOwner || emoji.uploaded_by === currentUser?.id}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-16">
          <Smile className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {search ? 'No emojis found' : 'No emojis yet'}
          </h3>
          <p className="text-zinc-500 mb-4">
            {search ? 'Try a different search' : 'Upload custom emojis for your server'}
          </p>
          {!search && (
            <Button onClick={() => setShowUpload(true)} className="bg-indigo-500 hover:bg-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              Upload First Emoji
            </Button>
          )}
        </div>
      )}

      <UploadEmojiModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        serverId={server?.id}
        currentUser={currentUser}
      />
    </div>
  );
}